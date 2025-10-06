export interface LogEntry {
  timestamp: Date;
  level: 'info' | 'success' | 'warning' | 'error' | 'ai';
  category: string;
  message: string;
  details?: any;
}

export class LoggerService {
  private io: any;
  private jobId: string = '';

  setIO(io: any, jobId: string): void {
    this.io = io;
    this.jobId = jobId;
  }

  private log(level: LogEntry['level'], category: string, message: string, details?: any): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      category,
      message,
      details
    };

    // Console log with emoji
    const emoji = {
      info: '📝',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      ai: '🤖'
    }[level];

    console.log(`${emoji} [${category}] ${message}`, details || '');

    // Emit to frontend
    if (this.io && this.jobId) {
      this.io.emit('log', { jobId: this.jobId, ...entry });
    }
  }

  info(category: string, message: string, details?: any): void {
    this.log('info', category, message, details);
  }

  success(category: string, message: string, details?: any): void {
    this.log('success', category, message, details);
  }

  warning(category: string, message: string, details?: any): void {
    this.log('warning', category, message, details);
  }

  error(category: string, message: string, details?: any): void {
    this.log('error', category, message, details);
  }

  ai(category: string, message: string, details?: any): void {
    this.log('ai', category, message, details);
  }

  // Specific logging methods
  assetFound(type: string, url: string): void {
    this.info('Assets', `Found ${type}: ${url}`);
  }

  assetDownloaded(type: string, filename: string): void {
    this.success('Assets', `Downloaded ${type}: ${filename}`);
  }

  assetFailed(type: string, url: string, reason: string): void {
    this.warning('Assets', `Failed to download ${type}: ${url}`, { reason });
  }

  aiAnalysis(step: string, result: string): void {
    this.ai('AI Analysis', `${step}: ${result}`);
  }

  pageDiscovered(url: string): void {
    this.info('Page Discovery', `Found page: ${url}`);
  }

  conversionStep(step: string, status: string): void {
    this.info('Conversion', `${step}: ${status}`);
  }
}

export default new LoggerService();
