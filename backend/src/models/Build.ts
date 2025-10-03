import mongoose, { Schema, Document } from 'mongoose';

export interface IBuild extends Document {
  jobId: string;
  wpThemePath: string;
  demoContentPath: string;
  zipPath: string;
  metadata: {
    themeName: string;
    themeVersion: string;
    elementorCompatible: boolean;
    totalFiles: number;
    zipSize: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BuildSchema: Schema = new Schema({
  jobId: { type: String, required: true, unique: true },
  wpThemePath: String,
  demoContentPath: String,
  zipPath: String,
  metadata: {
    themeName: String,
    themeVersion: { type: String, default: '1.0.0' },
    elementorCompatible: { type: Boolean, default: true },
    totalFiles: Number,
    zipSize: Number
  }
}, { timestamps: true });

export default mongoose.model<IBuild>('Build', BuildSchema);
