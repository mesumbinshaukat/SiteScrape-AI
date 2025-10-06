import puppeteer, { Browser, Page } from 'puppeteer';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs/promises';
import * as path from 'path';
import { URL } from 'url';
import robotsParser from 'robots-parser';
import aiService from './aiService';
import logger from './loggerService';
import Scrape from '../models/Scrape';
import Conversion from '../models/Conversion';

interface PageData {
  url: string;
  html: string;
  title: string;
  assets: string[];
}

interface AssetCollection {
  images: string[];
  videos: string[];
  fonts: string[];
  css: string[];
  js: string[];
  audio: string[];
  documents: string[];
  other: string[];
}

export class EnhancedScraperService {
  private browser: Browser | null = null;
  private visitedUrls: Set<string> = new Set();
  private discoveredPages: Set<string> = new Set();
  private baseUrl: string = '';
  private baseDomain: string = '';
  private projectPath: string = '';
  private io: any;
  private jobId: string = '';

  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async close(): Promise<void> {
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
      return true;
    }
  }

  private async parseSitemap(baseUrl: string): Promise<string[]> {
    const pages: string[] = [];
    try {
      const urlObj = new URL(baseUrl);
      const sitemapUrl = `${urlObj.protocol}//${urlObj.host}/sitemap.xml`;
      
      logger.info('Sitemap', `Checking for sitemap at ${sitemapUrl}`);
      const response = await axios.get(sitemapUrl, { timeout: 10000 });
      const $ = cheerio.load(response.data, { xmlMode: true });
      
      $('url > loc').each((_, el) => {
        const url = $(el).text().trim();
        if (url && url.startsWith(baseUrl)) {
          pages.push(url);
        }
      });

      logger.success('Sitemap', `Found ${pages.length} pages in sitemap`);
    } catch (error: any) {
      logger.warning('Sitemap', 'No sitemap found or failed to parse', { error: error.message });
    }
    return pages;
  }

  private async discoverPagesFromHTML(html: string, baseUrl: string): Promise<string[]> {
    const pages: string[] = [];
    const $ = cheerio.load(html);
    const urlObj = new URL(baseUrl);
    const baseDomain = `${urlObj.protocol}//${urlObj.host}`;

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;

      try {
        const fullUrl = new URL(href, baseUrl).href;
        const fullUrlObj = new URL(fullUrl);
        
        // Only internal links from same domain
        if (fullUrlObj.host === urlObj.host && !fullUrl.includes('#')) {
          pages.push(fullUrl);
        }
      } catch {}
    });

    return [...new Set(pages)];
  }

  private extractJSONFromAI(text: string): any {
    if (!text) return null;
    
    try {
      return JSON.parse(text);
    } catch {}
    
    // Extract from markdown
    const match = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (match) {
      try {
        return JSON.parse(match[1].trim());
      } catch {}
    }
    
    // Extract from { to }
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      try {
        return JSON.parse(text.substring(start, end + 1));
      } catch {}
    }
    
    return null;
  }

  private async aiDiscoverPages(url: string, html: string): Promise<string[]> {
    logger.ai('Page Discovery', 'Using AI to discover pages...');
    const aiResponse = await aiService.discoverPages(url, html);
    
    if (aiResponse.success && aiResponse.data) {
      const result = this.extractJSONFromAI(aiResponse.data);
      if (result && result.pages) {
        logger.ai('Page Discovery', `AI found ${result.pages.length} pages`, { count: result.pages.length });
        return result.pages;
      } else {
        logger.warning('AI', 'AI response did not contain pages array');
      }
    }
    return [];
  }

  private async extractAllAssets(page: Page, html: string): Promise<AssetCollection> {
    const assets: AssetCollection = {
      images: [],
      videos: [],
      fonts: [],
      css: [],
      js: [],
      audio: [],
      documents: [],
      other: []
    };

    const $ = cheerio.load(html);

    // Images - check multiple attributes for lazy loading
    $('img, source, picture source').each((_, el) => {
      const attributes = ['src', 'data-src', 'data-lazy-src', 'data-original', 
                         'data-srcset', 'data-lazy', 'data-image', 'data-bg'];
      
      attributes.forEach(attr => {
        const value = $(el).attr(attr);
        if (value && !value.startsWith('data:')) {
          assets.images.push(value);
        }
      });
      
      const srcset = $(el).attr('srcset') || $(el).attr('data-srcset');
      if (srcset) {
        srcset.split(',').forEach(s => {
          const url = s.trim().split(' ')[0];
          if (url && !url.startsWith('data:')) assets.images.push(url);
        });
      }
    });

    // Background images from inline styles
    $('[style*="background"]').each((_, el) => {
      const style = $(el).attr('style') || '';
      const matches = style.match(/url\(['"]?([^'")\s]+)['"]?\)/g);
      if (matches) {
        matches.forEach(match => {
          const url = match.match(/url\(['"]?([^'")\s]+)['"]?\)/)?.[1];
          if (url) assets.images.push(url);
        });
      }
    });

    // Videos
    $('video[src], video source[src], iframe[src*="youtube"], iframe[src*="vimeo"]').each((_, el) => {
      const src = $(el).attr('src');
      if (src) assets.videos.push(src);
    });

    // CSS
    $('link[rel="stylesheet"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) assets.css.push(href);
    });

    // JavaScript
    $('script[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src) assets.js.push(src);
    });

    // Audio
    $('audio[src], audio source[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src) assets.audio.push(src);
    });

    // Documents
    $('a[href$=".pdf"], a[href$=".doc"], a[href$=".docx"], a[href$=".zip"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) assets.documents.push(href);
    });

    // Extract fonts from CSS
    const cssLinks = assets.css;
    for (const cssUrl of cssLinks.slice(0, 10)) { // Limit to first 10 CSS files
      try {
        const fullUrl = new URL(cssUrl, this.baseUrl).href;
        const cssResponse = await axios.get(fullUrl, { timeout: 10000 });
        const fontMatches = cssResponse.data.match(/@font-face[^}]*}/g) || [];
        
        fontMatches.forEach((fontFace: string) => {
          const urlMatches = fontFace.match(/url\(['"]?([^'")\s]+)['"]?\)/g) || [];
          urlMatches.forEach((match: string) => {
            const url = match.match(/url\(['"]?([^'")\s]+)['"]?\)/)?.[1];
            if (url && (url.includes('.woff') || url.includes('.ttf') || url.includes('.eot'))) {
              assets.fonts.push(url);
            }
          });
        });
      } catch {}
    }

    // Google Fonts
    $('link[href*="fonts.googleapis.com"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) assets.fonts.push(href);
    });

    // Get computed styles for background images
    const bgImages = await page.evaluate(() => {
      const images: string[] = [];
      // @ts-ignore - document and window are available in browser context
      document.querySelectorAll('*').forEach((el: Element) => {
        // @ts-ignore
        const bg = window.getComputedStyle(el).backgroundImage;
        if (bg && bg !== 'none') {
          const matches = bg.match(/url\(['"]?([^'")\s]+)['"]?\)/g);
          if (matches) {
            matches.forEach((match: string) => {
              const url = match.match(/url\(['"]?([^'")\s]+)['"]?\)/)?.[1];
              if (url) images.push(url);
            });
          }
        }
      });
      return images;
    });

    assets.images.push(...bgImages);

    // Use AI to find hidden assets
    logger.ai('Asset Discovery', 'Using AI to find hidden assets...');
    const aiAssets = await aiService.analyzeAssets(html);
    if (aiAssets.success && aiAssets.data) {
      const aiResult = this.extractJSONFromAI(aiAssets.data);
      if (aiResult) {
        if (aiResult.videos) assets.videos.push(...aiResult.videos);
        if (aiResult.fonts) assets.fonts.push(...aiResult.fonts);
        if (aiResult.audio) assets.audio.push(...aiResult.audio);
        logger.ai('Asset Discovery', 'AI found additional assets', { count: (aiResult.videos?.length || 0) + (aiResult.fonts?.length || 0) + (aiResult.audio?.length || 0) });
      }
    }

    // Remove duplicates
    Object.keys(assets).forEach(key => {
      assets[key as keyof AssetCollection] = [...new Set(assets[key as keyof AssetCollection])];
    });

    return assets;
  }

  private getFileExtension(assetType: keyof AssetCollection): string {
    const extensions: Record<keyof AssetCollection, string> = {
      images: '.jpg',
      videos: '.mp4',
      fonts: '.woff2',
      css: '.css',
      js: '.js',
      audio: '.mp3',
      documents: '.pdf',
      other: '.bin'
    };
    return extensions[assetType] || '.bin';
  }

  private getAssetType(url: string): keyof AssetCollection {
    const ext = path.extname(url).toLowerCase();
    const urlLower = url.toLowerCase();
    
    // Check by extension first
    if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico', '.bmp'].includes(ext)) return 'images';
    if (['.mp4', '.webm', '.ogg', '.avi', '.mov'].includes(ext)) return 'videos';
    if (['.woff', '.woff2', '.ttf', '.otf', '.eot'].includes(ext)) return 'fonts';
    if (['.css'].includes(ext)) return 'css';
    if (['.js', '.mjs'].includes(ext)) return 'js';
    if (['.mp3', '.wav', '.ogg', '.m4a'].includes(ext)) return 'audio';
    if (['.pdf', '.doc', '.docx', '.zip'].includes(ext)) return 'documents';
    
    // Check by URL pattern (for CDN images without extensions)
    if (urlLower.includes('/image') || urlLower.includes('/img') || 
        urlLower.includes('/photo') || urlLower.includes('/picture') ||
        urlLower.includes('cdn') && (urlLower.includes('?') || urlLower.includes('='))) {
      return 'images';
    }
    
    // Check by common image CDN patterns
    if (urlLower.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|bmp)\?/)) return 'images';
    
    return 'other';
  }

  private resolveUrl(url: string, baseUrl: string): string {
    try {
      if (url.startsWith('#') || url.startsWith('javascript:') || 
          url.startsWith('mailto:') || url.startsWith('tel:') || 
          url.startsWith('data:')) {
        return '';
      }
      
      const resolved = new URL(url, baseUrl);
      resolved.hash = '';
      return resolved.href;
    } catch {
      return '';
    }
  }

  private isValidAssetUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.toLowerCase();
      const urlLower = url.toLowerCase();
      
      // Check if it has a valid extension
      const validExtensions = [
        '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico', '.bmp',
        '.mp4', '.webm', '.ogg', '.avi', '.mov',
        '.woff', '.woff2', '.ttf', '.otf', '.eot',
        '.css', '.js', '.mjs',
        '.mp3', '.wav', '.m4a',
        '.pdf', '.doc', '.docx', '.zip'
      ];
      
      // Check by extension
      if (validExtensions.some(ext => pathname.includes(ext))) {
        return true;
      }
      
      // Allow CDN images without extensions (same logic as getAssetType)
      if (urlLower.includes('/image') || urlLower.includes('/img') || 
          urlLower.includes('/photo') || urlLower.includes('/picture') ||
          (urlLower.includes('cdn') && (urlLower.includes('?') || urlLower.includes('=')))) {
        return true;
      }
      
      // Allow URLs with image extensions followed by query params
      if (urlLower.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|bmp)\?/)) {
        return true;
      }
      
      return false;
    } catch {
      return false;
    }
  }

  private async downloadImageWithPuppeteer(url: string, savePath: string): Promise<boolean> {
    try {
      const page = await this.browser!.newPage();
      
      // Navigate to image URL
      const response = await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      if (!response || !response.ok()) {
        await page.close();
        return false;
      }
      
      // Get image buffer
      const buffer = await response.buffer();
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(savePath), { recursive: true });
      
      // Write file
      await fs.writeFile(savePath, buffer);
      
      await page.close();
      
      // Verify file
      const stats = await fs.stat(savePath);
      return stats.size > 0;
    } catch (error: any) {
      logger.warning('Puppeteer Download', `Failed: ${error.message}`);
      return false;
    }
  }

  private async downloadAsset(url: string, savePath: string, retries = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          timeout: 30000,
          maxRedirects: 5,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': this.baseUrl
          }
        });
        
        // Ensure directory exists
        await fs.mkdir(path.dirname(savePath), { recursive: true });
        
        // Write file
        await fs.writeFile(savePath, response.data);
        
        // Verify file was written
        const stats = await fs.stat(savePath);
        if (stats.size > 0) {
          return true;
        } else {
          logger.warning('Download', `File ${path.basename(savePath)} is empty, retrying...`);
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
        }
      } catch (error: any) {
        const isLastAttempt = attempt === retries;
        
        if (error.response?.status === 404) {
          // Don't retry 404s
          return false;
        }
        
        if (isLastAttempt) {
          logger.assetFailed('asset', url, `${error.message} (after ${retries} attempts)`);
          return false;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    return false;
  }

  private async scrapePage(url: string, retries = 3): Promise<PageData | null> {
    // Resolve relative URLs to absolute
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = this.resolveUrl(url, this.baseDomain);
    }
    
    // Validate URL
    try {
      new URL(fullUrl);
    } catch {
      logger.warning('Scraping', `Invalid URL, skipping: ${url}`);
      return null;
    }
    
    if (this.visitedUrls.has(fullUrl)) return null;
    this.visitedUrls.add(fullUrl);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        logger.info('Scraping', `Scraping page: ${fullUrl}${attempt > 1 ? ` (attempt ${attempt})` : ''}`);
        
        const page = await this.browser!.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 60000 });

      // Scroll to load lazy content
      await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
            // @ts-ignore - window and document are available in browser context
            window.scrollBy(0, distance);
            totalHeight += distance;
            // @ts-ignore
            if (totalHeight >= document.body.scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 100);
        });
      });

      const html = await page.content();
      const title = await page.title();
      const assets = await this.extractAllAssets(page, html);

      await page.close();

      const allAssets = [
        ...assets.images,
        ...assets.videos,
        ...assets.fonts,
        ...assets.css,
        ...assets.js,
        ...assets.audio,
        ...assets.documents
      ];

        logger.success('Scraping', `Scraped ${fullUrl}`, {
          title,
          assetsFound: allAssets.length
        });

        return {
          url: fullUrl,
          html,
          title,
          assets: allAssets
        };
      } catch (error: any) {
        const isLastAttempt = attempt === retries;
        if (isLastAttempt) {
          logger.error('Scraping', `Failed to scrape ${fullUrl} after ${retries} attempts`, { error: error.message });
          return null;
        }
        logger.warning('Scraping', `Attempt ${attempt} failed for ${fullUrl}, retrying...`, { error: error.message });
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }
    return null;
  }

  async scrapeWebsite(jobId: string, url: string, io: any): Promise<void> {
    this.jobId = jobId;
    this.io = io;
    this.baseUrl = url;
    
    const urlObj = new URL(url);
    this.baseDomain = `${urlObj.protocol}//${urlObj.host}`;
    this.projectPath = path.join(process.cwd(), 'projects', jobId);

    logger.setIO(io, jobId);

    try {
      await fs.mkdir(this.projectPath, { recursive: true });

      // Check robots.txt
      logger.info('Setup', 'Checking robots.txt...');
      const allowed = await this.checkRobotsTxt(url);
      if (!allowed) {
        throw new Error('Scraping not allowed by robots.txt');
      }
      logger.success('Setup', 'Robots.txt check passed');

      // Initialize browser
      await this.initialize();
      logger.success('Setup', 'Browser initialized');

      // AI Pre-analysis
      io.emit('progress', { jobId, status: 'analyzing', progress: 5 });
      logger.ai('Analysis', 'Starting AI pre-scrape analysis...');
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

      // Discover pages
      io.emit('progress', { jobId, status: 'discovering', progress: 10 });
      logger.info('Discovery', 'Discovering pages...');

      // 1. Parse sitemap
      const sitemapPages = await this.parseSitemap(url);
      sitemapPages.forEach(p => this.discoveredPages.add(p));

      // 2. Scrape main page first
      const mainPageData = await this.scrapePage(url);
      if (!mainPageData) {
        throw new Error('Failed to scrape main page');
      }

      // 3. Discover from HTML
      const htmlPages = await this.discoverPagesFromHTML(mainPageData.html, url);
      htmlPages.forEach(p => this.discoveredPages.add(p));

      // 4. AI discovery
      const aiPages = await this.aiDiscoverPages(url, mainPageData.html);
      aiPages.forEach(p => this.discoveredPages.add(p));

      const allPages = Array.from(this.discoveredPages).slice(0, 10); // Limit to 10 pages
      logger.success('Discovery', `Found ${allPages.length} pages to scrape`);

      // Scrape all pages
      const scrapedPages: PageData[] = [mainPageData];
      let pageProgress = 20;

      for (let i = 1; i < allPages.length; i++) {
        const pageUrl = allPages[i];
        const pageData = await this.scrapePage(pageUrl);
        if (pageData) {
          scrapedPages.push(pageData);
        }
        
        pageProgress = 20 + Math.floor((i / allPages.length) * 40);
        io.emit('progress', { jobId, status: 'scraping', progress: pageProgress });
      }

      // Download all assets
      io.emit('progress', { jobId, status: 'downloading', progress: 60 });
      logger.info('Assets', 'Downloading assets...');

      const allAssets = new Set<string>();
      scrapedPages.forEach(page => {
        page.assets.forEach(asset => allAssets.add(asset));
      });

      const scrapedFiles: AssetCollection = {
        images: [],
        videos: [],
        fonts: [],
        css: [],
        js: [],
        audio: [],
        documents: [],
        other: []
      };

      let downloaded = 0;
      const assetsArray = Array.from(allAssets);
      const totalAssets = assetsArray.length;

      logger.info('Assets', `Starting download of ${totalAssets} assets`);

      for (const asset of assetsArray) {
        const fullUrl = this.resolveUrl(asset, this.baseUrl);
        if (!fullUrl || !this.isValidAssetUrl(fullUrl)) continue;

        const assetType = this.getAssetType(fullUrl);
        const urlObj = new URL(fullUrl);
        
        // Extract proper filename, especially for Next.js image URLs
        let filename = path.basename(urlObj.pathname);
        
        // Handle Next.js image URLs: /_next/image?url=%2Fimages%2Fmain.jpg
        if (fullUrl.includes('/_next/image') && urlObj.searchParams.has('url')) {
          const imageUrl = urlObj.searchParams.get('url');
          if (imageUrl) {
            filename = path.basename(decodeURIComponent(imageUrl));
          }
        }
        
        // Handle CDN URLs without proper filenames
        if (!filename || filename === 'image' || filename.length < 3) {
          const urlHash = Buffer.from(fullUrl).toString('base64').substring(0, 12).replace(/[^a-zA-Z0-9]/g, '');
          const ext = this.getFileExtension(assetType);
          filename = `${assetType}_${urlHash}${ext}`;
        }
        
        const savePath = path.join(this.projectPath, 'scraped', assetType, filename);

        logger.assetFound(assetType, fullUrl);
        const success = await this.downloadAsset(fullUrl, savePath);
        
        if (success) {
          scrapedFiles[assetType].push(filename);
          logger.assetDownloaded(assetType, filename);
          downloaded++;
        } else if (assetType === 'images') {
          // Fallback: Try downloading with Puppeteer for images
          logger.info('Download', `Retrying image with Puppeteer: ${filename}`);
          const puppeteerSuccess = await this.downloadImageWithPuppeteer(fullUrl, savePath);
          if (puppeteerSuccess) {
            scrapedFiles[assetType].push(filename);
            logger.assetDownloaded(assetType, filename);
            downloaded++;
          }
        }

        const progress = 60 + Math.floor((downloaded / assetsArray.length) * 30);
        io.emit('progress', { 
          jobId, 
          status: 'downloading', 
          progress,
          metadata: {
            totalPages: scrapedPages.length,
            totalAssets: downloaded,
            assetsTotal: totalAssets,
            pagesProcessed: scrapedPages.length
          }
        });

        await new Promise<void>(resolve => setTimeout(resolve, 100));
      }

      // Save all HTML files
      for (let i = 0; i < scrapedPages.length; i++) {
        const page = scrapedPages[i];
        const htmlPath = path.join(this.projectPath, 'scraped', 'html');
        await fs.mkdir(htmlPath, { recursive: true });
        const filename = i === 0 ? 'index.html' : `page-${i}.html`;
        await fs.writeFile(path.join(htmlPath, filename), page.html);
      }

      await this.close();

      logger.success('Complete', `Scraping complete: ${downloaded} assets downloaded from ${scrapedPages.length} pages`);

      // Update database
      await Scrape.findOneAndUpdate(
        { jobId },
        {
          status: 'converting',
          progress: 90,
          scrapedFiles,
          metadata: {
            title: mainPageData.title,
            totalAssets: downloaded,
            totalPages: scrapedPages.length,
            scrapedAt: new Date(),
            aiAnalysis: aiAnalysis.data
          }
        }
      );

      io.emit('progress', { 
        jobId, 
        status: 'converting', 
        progress: 90,
        metadata: {
          totalPages: scrapedPages.length,
          totalAssets: downloaded,
          title: mainPageData.title
        }
      });

    } catch (error: any) {
      await this.close();
      logger.error('Error', 'Scraping failed', { error: error.message });
      await Scrape.findOneAndUpdate(
        { jobId },
        { status: 'failed', error: error.message }
      );
      io.emit('error', { jobId, error: error.message });
      throw error;
    }
  }
}

export default new EnhancedScraperService();
