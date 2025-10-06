import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Scrape from '../models/Scrape';
import enhancedScraperService from '../services/enhancedScraperService';
import conversionService from '../services/conversionService';
import wpThemeBuilder from '../services/wpThemeBuilder';
import demoContentExtractor from '../services/demoContentExtractor';
import elementorTemplateGenerator from '../services/elementorTemplateGenerator';
import previewGenerator from '../services/previewGenerator';
import promptManager from '../config/aiPrompts';
import archiver from 'archiver';
import * as fs from 'fs';
import * as path from 'path';
import Build from '../models/Build';

const router = Router();

// Start scraping job
router.post('/scrape', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    const jobId = uuidv4();

    // Create scrape record
    await Scrape.create({
      jobId,
      url,
      status: 'queued',
      progress: 0,
      scrapedFiles: {
        html: [],
        css: [],
        js: [],
        images: [],
        videos: [],
        fonts: [],
        other: []
      },
      metadata: {
        totalAssets: 0,
        scrapedAt: new Date()
      }
    });

    // Start async processing
    const io = req.app.get('io');
    processJob(jobId, url, io);

    res.json({ jobId, status: 'queued' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get job status
router.get('/status/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const scrape = await Scrape.findOne({ jobId });

    if (!scrape) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      jobId: scrape.jobId,
      url: scrape.url,
      status: scrape.status,
      progress: scrape.progress,
      metadata: scrape.metadata,
      error: scrape.error
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Download theme zip
router.get('/download/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const scrape = await Scrape.findOne({ jobId });

    if (!scrape) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (scrape.status !== 'completed') {
      return res.status(400).json({ error: 'Job not completed yet' });
    }

    const projectPath = path.join(process.cwd(), 'projects', jobId);
    const zipPath = path.join(projectPath, `${jobId}.zip`);

    // Check if zip already exists
    if (!fs.existsSync(zipPath)) {
      // Create zip
      await createZip(projectPath, zipPath);
      
      // Update build record
      const stats = fs.statSync(zipPath);
      await Build.findOneAndUpdate(
        { jobId },
        { zipPath, 'metadata.zipSize': stats.size }
      );
    }

    res.download(zipPath, `${scrape.metadata?.title || 'theme'}.zip`);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all jobs
router.get('/jobs', async (req: Request, res: Response) => {
  try {
    const jobs = await Scrape.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select('jobId url status progress metadata createdAt');

    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Generate preview
router.get('/preview/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const scrape = await Scrape.findOne({ jobId });

    if (!scrape) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (scrape.status !== 'completed') {
      return res.status(400).json({ error: 'Job not completed yet' });
    }

    // Generate preview
    const previewPath = await previewGenerator.generatePreview(jobId);
    
    // Serve preview HTML
    res.sendFile(previewPath);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get AI prompts configuration
router.get('/prompts', async (req: Request, res: Response) => {
  try {
    const prompts = promptManager.getAllPrompts();
    res.json(prompts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update AI prompt
router.put('/prompts/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt text required' });
    }

    promptManager.updatePrompt(type as any, prompt);
    res.json({ success: true, message: `Prompt '${type}' updated successfully` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reset prompts to defaults
router.post('/prompts/reset', async (req: Request, res: Response) => {
  try {
    promptManager.resetToDefaults();
    res.json({ success: true, message: 'All prompts reset to defaults' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Process job pipeline
async function processJob(jobId: string, url: string, io: any) {
  try {
    // Step 1: Enhanced Scraping (multi-page, all assets)
    await enhancedScraperService.scrapeWebsite(jobId, url, io);

    // Step 2: Convert to React
    await conversionService.convertToReact(jobId, io);

    // Step 3: Extract demo content
    const projectPath = path.join(process.cwd(), 'projects', jobId);
    const htmlPath = path.join(projectPath, 'scraped', 'html', 'index.html');
    const html = await fs.promises.readFile(htmlPath, 'utf-8');
    const demoContent = await demoContentExtractor.extractContent(html, url);
    const demoXmlPath = path.join(projectPath, 'demo-content.xml');
    await demoContentExtractor.generateWordPressXML(demoContent, demoXmlPath);

    // Step 4: Generate Elementor templates
    const templatesDir = path.join(projectPath, 'elementor-templates');
    // This will be populated by conversion service with component data
    
    // Step 5: Build WordPress theme
    await wpThemeBuilder.buildWordPressTheme(jobId, io);

  } catch (error: any) {
    console.error('Job processing error:', error);
    io.emit('error', { jobId, error: error.message });
  }
}

// Create zip file
async function createZip(projectPath: string, zipPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`✅ ZIP created: ${archive.pointer()} total bytes`);
      resolve();
    });
    archive.on('error', (err) => reject(err));
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('ZIP warning:', err);
      } else {
        reject(err);
      }
    });

    archive.pipe(output);

    // Add theme folder (main theme files)
    const wpThemePath = path.join(projectPath, 'wp-theme');
    if (fs.existsSync(wpThemePath)) {
      console.log('📦 Adding wp-theme folder...');
      archive.directory(wpThemePath, 'wp-theme');
    }

    // Add Elementor templates
    const elementorTemplatesPath = path.join(projectPath, 'elementor-templates');
    if (fs.existsSync(elementorTemplatesPath)) {
      console.log('📦 Adding Elementor templates...');
      archive.directory(elementorTemplatesPath, 'elementor-templates');
    }

    // Add scraped HTML files (for reference)
    const scrapedHtmlPath = path.join(projectPath, 'scraped', 'html');
    if (fs.existsSync(scrapedHtmlPath)) {
      console.log('📦 Adding scraped HTML files...');
      archive.directory(scrapedHtmlPath, 'reference/html');
    }

    // Add demo content
    const demoContentPath = path.join(projectPath, 'demo-content.xml');
    if (fs.existsSync(demoContentPath)) {
      console.log('📦 Adding demo-content.xml...');
      archive.file(demoContentPath, { name: 'demo-content.xml' });
    }

    // Add README
    const readmePath = path.join(projectPath, 'README.md');
    if (fs.existsSync(readmePath)) {
      console.log('📦 Adding README.md...');
      archive.file(readmePath, { name: 'README.md' });
    }

    // Add asset manifest
    const manifestPath = path.join(projectPath, 'asset-manifest.json');
    if (fs.existsSync(manifestPath)) {
      console.log('📦 Adding asset manifest...');
      archive.file(manifestPath, { name: 'asset-manifest.json' });
    }

    archive.finalize();
  });
}

export default router;
