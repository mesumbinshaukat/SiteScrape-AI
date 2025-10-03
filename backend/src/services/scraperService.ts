import puppeteer, { Browser, Page } from 'puppeteer';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs/promises';
import * as path from 'path';
import { URL } from 'url';
import robotsParser from 'robots-parser';
import aiService from './aiService';
import Scrape from '../models/Scrape';
import Conversion from '../models/Conversion';

export class ScraperService {
  private browser: Browser | null = null;
  private visitedUrls: Set<string> = new Set();
  private baseUrl: string = '';
  private projectPath: string = '';

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private async checkRobotsTxt(url: string): Promise<boolean> {
    try {
      const urlObj = new URL(url);
      const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;
      const response = await axios.get(robotsUrl, { timeout: 5000 });
      const robots = robotsParser(robotsUrl, response.data);
      return robots.isAllowed(url, 'SiteScapeBot') ?? true;
    } catch {
      return true; // If robots.txt doesn't exist, allow scraping
    }
  }

  private async downloadAsset(url: string, savePath: string): Promise<void> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      await fs.mkdir(path.dirname(savePath), { recursive: true });
      await fs.writeFile(savePath, response.data);
    } catch (error: any) {
      console.error(`Failed to download ${url}:`, error.message);
    }
  }

  private getAssetType(url: string): string {
    const ext = path.extname(url).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico'].includes(ext)) return 'images';
    if (['.mp4', '.webm', '.ogg', '.avi'].includes(ext)) return 'videos';
    if (['.woff', '.woff2', '.ttf', '.otf', '.eot'].includes(ext)) return 'fonts';
    if (['.css'].includes(ext)) return 'css';
    if (['.js', '.mjs'].includes(ext)) return 'js';
    return 'other';
  }

  private async extractAssets(page: Page, html: string): Promise<string[]> {
    const assets: string[] = [];
    const $ = cheerio.load(html);

    // Extract images
    $('img[src], img[data-src], source[srcset], [style*="background"]').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src) assets.push(src);
      
      const srcset = $(el).attr('srcset');
      if (srcset) {
        srcset.split(',').forEach(s => {
          const url = s.trim().split(' ')[0];
          if (url) assets.push(url);
        });
      }

      const style = $(el).attr('style');
      if (style) {
        const bgMatch = style.match(/url\(['"]?([^'")\s]+)['"]?\)/g);
        if (bgMatch) {
          bgMatch.forEach(match => {
            const url = match.match(/url\(['"]?([^'")\s]+)['"]?\)/)?.[1];
            if (url) assets.push(url);
          });
        }
      }
    });

    // Extract CSS
    $('link[rel="stylesheet"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) assets.push(href);
    });

    // Extract JS
    $('script[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src) assets.push(src);
    });

    // Extract videos
    $('video source[src], video[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src) assets.push(src);
    });

    // Get computed background images from page
    const bgImages = await page.evaluate(() => {
      const images: string[] = [];
      document.querySelectorAll('*').forEach(el => {
        const bg = window.getComputedStyle(el).backgroundImage;
        if (bg && bg !== 'none') {
          const matches = bg.match(/url\(['"]?([^'")\s]+)['"]?\)/g);
          if (matches) {
            matches.forEach(match => {
              const url = match.match(/url\(['"]?([^'")\s]+)['"]?\)/)?.[1];
              if (url) images.push(url);
            });
          }
        }
      });
      return images;
    });

    assets.push(...bgImages);

    return [...new Set(assets)]; // Remove duplicates
  }

  private resolveUrl(url: string, baseUrl: string): string {
    try {
      return new URL(url, baseUrl).href;
    } catch {
      return '';
    }
  }

  async scrapeWebsite(jobId: string, url: string, io: any): Promise<void> {
    try {
      this.baseUrl = url;
      this.projectPath = path.join(process.cwd(), 'projects', jobId);
      this.visitedUrls.clear();

      await fs.mkdir(this.projectPath, { recursive: true });

      // Check robots.txt
      const allowed = await this.checkRobotsTxt(url);
      if (!allowed) {
        throw new Error('Scraping not allowed by robots.txt');
      }

      // AI Analysis
      io.emit('progress', { jobId, status: 'analyzing', progress: 5 });
      const aiAnalysis = await aiService.analyzeWebsite(url);
      
      await Conversion.create({
        jobId,
        aiLogs: [{
          step: 'pre-scrape-analysis',
          prompt: `Analyze ${url}`,
          response: aiAnalysis.data || 'Analysis failed',
          timestamp: new Date()
        }],
        componentMappings: [],
        reactAppPath: ''
      });

      // Initialize browser
      await this.initialize();
      const page = await this.browser!.newPage();
      
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      
      io.emit('progress', { jobId, status: 'scraping', progress: 10 });

      // Navigate and wait for network idle
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      
      // Scroll to load lazy images
      await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
            window.scrollBy(0, distance);
            totalHeight += distance;
            if (totalHeight >= document.body.scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 100);
        });
      });

      // Get page content
      const html = await page.content();
      const title = await page.title();

      // Save main HTML
      const htmlPath = path.join(this.projectPath, 'scraped', 'html');
      await fs.mkdir(htmlPath, { recursive: true });
      await fs.writeFile(path.join(htmlPath, 'index.html'), html);

      io.emit('progress', { jobId, status: 'scraping', progress: 30 });

      // Extract and download assets
      const assets = await this.extractAssets(page, html);
      const scrapedFiles: any = {
        html: ['index.html'],
        css: [],
        js: [],
        images: [],
        videos: [],
        fonts: [],
        other: []
      };

      let downloaded = 0;
      for (const asset of assets) {
        const fullUrl = this.resolveUrl(asset, url);
        if (!fullUrl || fullUrl.startsWith('data:')) continue;

        const assetType = this.getAssetType(fullUrl);
        const urlObj = new URL(fullUrl);
        const filename = path.basename(urlObj.pathname) || `asset_${Date.now()}`;
        const savePath = path.join(this.projectPath, 'scraped', assetType, filename);

        await this.downloadAsset(fullUrl, savePath);
        scrapedFiles[assetType].push(filename);

        downloaded++;
        const progress = 30 + Math.floor((downloaded / assets.length) * 40);
        io.emit('progress', { jobId, status: 'scraping', progress });

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await this.close();

      // Update database
      await Scrape.findOneAndUpdate(
        { jobId },
        {
          status: 'converting',
          progress: 70,
          scrapedFiles,
          metadata: {
            title,
            totalAssets: assets.length,
            scrapedAt: new Date(),
            aiAnalysis: aiAnalysis.data
          }
        }
      );

      io.emit('progress', { jobId, status: 'converting', progress: 70 });

    } catch (error: any) {
      await this.close();
      await Scrape.findOneAndUpdate(
        { jobId },
        { status: 'failed', error: error.message }
      );
      io.emit('error', { jobId, error: error.message });
      throw error;
    }
  }
}

export default new ScraperService();
