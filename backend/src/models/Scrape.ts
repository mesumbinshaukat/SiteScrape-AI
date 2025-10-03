import mongoose, { Schema, Document } from 'mongoose';

export interface IScrape extends Document {
  jobId: string;
  url: string;
  status: 'queued' | 'scraping' | 'converting' | 'building' | 'completed' | 'failed';
  progress: number;
  scrapedFiles: {
    html: string[];
    css: string[];
    js: string[];
    images: string[];
    videos: string[];
    fonts: string[];
    other: string[];
  };
  metadata: {
    title?: string;
    description?: string;
    totalAssets: number;
    scrapedAt: Date;
    aiAnalysis?: string;
  };
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScrapeSchema: Schema = new Schema({
  jobId: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['queued', 'scraping', 'converting', 'building', 'completed', 'failed'],
    default: 'queued'
  },
  progress: { type: Number, default: 0 },
  scrapedFiles: {
    html: [String],
    css: [String],
    js: [String],
    images: [String],
    videos: [String],
    fonts: [String],
    other: [String]
  },
  metadata: {
    title: String,
    description: String,
    totalAssets: { type: Number, default: 0 },
    scrapedAt: Date,
    aiAnalysis: String
  },
  error: String
}, { timestamps: true });

export default mongoose.model<IScrape>('Scrape', ScrapeSchema);
