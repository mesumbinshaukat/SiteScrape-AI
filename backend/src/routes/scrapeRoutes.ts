import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Scrape from '../models/Scrape';
import scraperService from '../services/scraperService';
import conversionService from '../services/conversionService';
import wpThemeBuilder from '../services/wpThemeBuilder';
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

// Process job pipeline
async function processJob(jobId: string, url: string, io: any) {
  try {
    // Step 1: Scrape
    await scraperService.scrapeWebsite(jobId, url, io);

    // Step 2: Convert to React
    await conversionService.convertToReact(jobId, io);

    // Step 3: Build WordPress theme
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

    output.on('close', () => resolve());
    archive.on('error', (err) => reject(err));

    archive.pipe(output);

    // Add theme folder
    const wpThemePath = path.join(projectPath, 'wp-theme');
    if (fs.existsSync(wpThemePath)) {
      archive.directory(wpThemePath, 'wp-theme');
    }

    // Add demo content
    const demoContentPath = path.join(projectPath, 'demo-content.xml');
    if (fs.existsSync(demoContentPath)) {
      archive.file(demoContentPath, { name: 'demo-content.xml' });
    }

    // Add README
    const readmePath = path.join(projectPath, 'README.md');
    if (fs.existsSync(readmePath)) {
      archive.file(readmePath, { name: 'README.md' });
    }

    archive.finalize();
  });
}

export default router;
