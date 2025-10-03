import mongoose, { Schema, Document } from 'mongoose';

export interface IConversion extends Document {
  jobId: string;
  aiLogs: Array<{
    step: string;
    prompt: string;
    response: string;
    timestamp: Date;
  }>;
  componentMappings: Array<{
    originalHtml: string;
    reactComponent: string;
    componentName: string;
  }>;
  reactAppPath: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversionSchema: Schema = new Schema({
  jobId: { type: String, required: true, unique: true },
  aiLogs: [{
    step: String,
    prompt: String,
    response: String,
    timestamp: { type: Date, default: Date.now }
  }],
  componentMappings: [{
    originalHtml: String,
    reactComponent: String,
    componentName: String
  }],
  reactAppPath: String
}, { timestamps: true });

export default mongoose.model<IConversion>('Conversion', ConversionSchema);
