# SiteScape AI - Project Information

## 📁 Complete File Structure

```
sitescape-ai/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── Scrape.ts              # MongoDB schema for scrape jobs
│   │   │   ├── Conversion.ts          # MongoDB schema for conversions
│   │   │   └── Build.ts               # MongoDB schema for builds
│   │   ├── services/
│   │   │   ├── aiService.ts           # OpenRouter AI integration
│   │   │   ├── scraperService.ts      # Puppeteer scraping engine
│   │   │   ├── conversionService.ts   # HTML to React converter
│   │   │   └── wpThemeBuilder.ts      # WordPress theme generator
│   │   ├── routes/
│   │   │   └── scrapeRoutes.ts        # API endpoints
│   │   ├── utils/
│   │   │   ├── errorHandler.ts        # Error handling utilities
│   │   │   ├── validators.ts          # Input validation
│   │   │   └── __tests__/
│   │   │       └── validators.test.ts # Unit tests
│   │   └── server.ts                  # Main Express server
│   ├── package.json
│   ├── tsconfig.json
│   └── jest.config.js
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                    # Main React component
│   │   └── main.tsx                   # React entry point
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
│
├── projects/                          # Generated output (gitignored)
│   └── [jobId]/
│       ├── scraped/                   # Raw scraped files
│       │   ├── html/
│       │   ├── css/
│       │   ├── js/
│       │   ├── images/
│       │   ├── videos/
│       │   └── fonts/
│       ├── react-app/                 # React conversion
│       │   ├── src/
│       │   │   ├── components/
│       │   │   ├── styles/
│       │   │   ├── App.tsx
│       │   │   └── main.tsx
│       │   ├── package.json
│       │   ├── vite.config.ts
│       │   └── index.html
│       ├── wp-theme/                  # WordPress theme
│       │   ├── assets/
│       │   │   ├── css/
│       │   │   ├── js/
│       │   │   ├── images/
│       │   │   └── fonts/
│       │   ├── style.css
│       │   ├── functions.php
│       │   ├── index.php
│       │   ├── header.php
│       │   └── footer.php
│       ├── demo-content.xml           # WordPress import file
│       ├── README.md                  # Installation guide
│       └── [jobId].zip                # Final package
│
├── .env                               # Environment variables
├── .env.example                       # Environment template
├── .gitignore
├── package.json                       # Root package.json
├── setup.ps1                          # Windows setup script
├── README.md                          # Main documentation
├── QUICKSTART.md                      # Quick start guide
└── PROJECT_INFO.md                    # This file
```

## 🔧 Technology Stack

### Backend Technologies
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18
- **Language**: TypeScript 5.3
- **Database**: MongoDB 8.0 with Mongoose
- **Web Scraping**: Puppeteer 21.6
- **HTML Parsing**: Cheerio 1.0
- **Real-time**: Socket.IO 4.6
- **Image Processing**: Sharp 0.33
- **AI Integration**: OpenRouter API
- **Archive**: Archiver 6.0

### Frontend Technologies
- **Framework**: React 18.2
- **Language**: TypeScript 5.3
- **Build Tool**: Vite 5.0
- **UI Library**: Material-UI 5.15
- **Icons**: Material Icons
- **HTTP Client**: Axios 1.6
- **Real-time**: Socket.IO Client 4.6

### Development Tools
- **TypeScript Compiler**: tsc
- **Dev Server**: tsx (backend), Vite (frontend)
- **Testing**: Jest 29.7 + ts-jest
- **Process Manager**: Concurrently

## 🔄 Data Flow

### 1. User Input → Job Creation
```
User enters URL → Frontend validates → POST /api/scrape
→ Backend creates job in MongoDB → Returns jobId
→ Frontend connects to Socket.IO for updates
```

### 2. Scraping Phase
```
Backend starts Puppeteer → Navigates to URL
→ AI analyzes structure (OpenRouter API)
→ Scrolls page to load lazy content
→ Extracts all assets (images, CSS, JS, fonts, videos)
→ Downloads assets with rate limiting
→ Saves to /projects/[jobId]/scraped/
→ Updates MongoDB with progress
→ Emits Socket.IO progress events
```

### 3. Conversion Phase
```
Reads scraped HTML → Parses with Cheerio
→ Extracts sections (header, nav, main, footer)
→ For each section:
  - Sends to AI for React conversion
  - Generates TypeScript component
  - Creates styled-components
→ Builds complete React app structure
→ Generates package.json, vite.config.ts, etc.
→ Saves to /projects/[jobId]/react-app/
→ Updates MongoDB with component mappings
```

### 4. WordPress Build Phase
```
Reads React components → Generates WP theme structure
→ Creates functions.php with Elementor support
→ Generates template files (index.php, header.php, footer.php)
→ Optimizes images to WebP
→ Combines CSS/JS assets
→ Creates demo-content.xml
→ Saves to /projects/[jobId]/wp-theme/
→ Updates MongoDB with build metadata
```

### 5. Packaging & Download
```
User clicks download → Backend creates ZIP
→ Includes: wp-theme/, demo-content.xml, README.md
→ Streams ZIP to user
→ Job marked as completed
```

## 🗄️ Database Schemas

### Scrapes Collection
```typescript
{
  jobId: string (UUID)
  url: string
  status: 'queued' | 'scraping' | 'converting' | 'building' | 'completed' | 'failed'
  progress: number (0-100)
  scrapedFiles: {
    html: string[]
    css: string[]
    js: string[]
    images: string[]
    videos: string[]
    fonts: string[]
    other: string[]
  }
  metadata: {
    title?: string
    description?: string
    totalAssets: number
    scrapedAt: Date
    aiAnalysis?: string
  }
  error?: string
  createdAt: Date
  updatedAt: Date
}
```

### Conversions Collection
```typescript
{
  jobId: string (UUID)
  aiLogs: [{
    step: string
    prompt: string
    response: string
    timestamp: Date
  }]
  componentMappings: [{
    originalHtml: string
    reactComponent: string
    componentName: string
  }]
  reactAppPath: string
  createdAt: Date
  updatedAt: Date
}
```

### Builds Collection
```typescript
{
  jobId: string (UUID)
  wpThemePath: string
  demoContentPath: string
  zipPath: string
  metadata: {
    themeName: string
    themeVersion: string
    elementorCompatible: boolean
    totalFiles: number
    zipSize: number
  }
  createdAt: Date
  updatedAt: Date
}
```

## 🌐 API Endpoints

### POST /api/scrape
**Start new scraping job**
- Body: `{ url: string }`
- Response: `{ jobId: string, status: string }`

### GET /api/status/:jobId
**Get job status**
- Response: Job object with progress

### GET /api/download/:jobId
**Download theme ZIP**
- Response: ZIP file stream

### GET /api/jobs
**List recent jobs**
- Response: Array of job objects (last 20)

### GET /health
**Health check**
- Response: `{ status: 'ok', timestamp: string }`

## 🔌 Socket.IO Events

### Client → Server
- `connect`: Client connected
- `disconnect`: Client disconnected

### Server → Client
- `progress`: `{ jobId, status, progress }`
- `error`: `{ jobId, error }`

## 🎨 WordPress Theme Structure

### Generated Files
```
wp-theme/
├── style.css              # Theme metadata
├── functions.php          # Theme setup, Elementor support
├── index.php              # Main template
├── header.php             # Header template
├── footer.php             # Footer template
├── assets/
│   ├── css/
│   │   └── main.css       # Combined styles
│   ├── js/
│   │   └── main.js        # Combined scripts
│   ├── images/            # Optimized images (WebP)
│   └── fonts/             # Web fonts
```

### Elementor Integration
- `add_theme_support('elementor')` in functions.php
- Theme locations registered
- Custom widget hooks prepared
- Compatible with Elementor Free & Pro

## 🔐 Security Features

1. **Input Validation**
   - URL format validation
   - File name sanitization
   - Job ID validation (UUID)

2. **CORS Protection**
   - Restricted to localhost only
   - Configurable origins

3. **Robots.txt Compliance**
   - Checks before scraping
   - Respects crawl rules

4. **Rate Limiting**
   - Delays between asset downloads
   - Prevents server overload

5. **Error Handling**
   - Try-catch blocks
   - Graceful fallbacks
   - User-friendly error messages

6. **Environment Variables**
   - API keys in .env
   - No hardcoded secrets
   - .env in .gitignore

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd backend
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Coverage
- Validators (URL, file names, job IDs)
- Error handlers
- Utility functions

## 🚀 Deployment Considerations

### Production Checklist
- [ ] Set NODE_ENV=production
- [ ] Use production MongoDB instance
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS
- [ ] Configure reverse proxy (nginx)
- [ ] Set up process manager (PM2)
- [ ] Configure logging
- [ ] Set up monitoring
- [ ] Implement rate limiting
- [ ] Add authentication (if needed)

### Environment Variables (Production)
```env
OPENROUTER_API_KEY=your_production_key
MONGODB_URI=mongodb://production-host:27017/sitescape-ai
PORT=5000
FRONTEND_PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com
```

## 📊 Performance Metrics

### Typical Processing Times
- **Simple site** (< 50 assets): 2-3 minutes
- **Medium site** (50-200 assets): 5-7 minutes
- **Complex site** (200+ assets): 10-15 minutes

### Optimization Tips
1. Use worker threads for parallel processing
2. Implement caching for AI responses
3. Optimize image compression settings
4. Use CDN for asset delivery
5. Implement queue system for multiple jobs

## 🔍 Debugging

### Enable Debug Logs
```typescript
// backend/src/server.ts
const DEBUG = true;

if (DEBUG) {
  console.log('Debug info:', data);
}
```

### MongoDB Queries
```bash
# Connect to MongoDB
mongosh

# Use database
use sitescape-ai

# View jobs
db.scrapes.find().pretty()

# View conversions
db.conversions.find().pretty()

# View builds
db.builds.find().pretty()
```

### Common Issues
1. **Puppeteer timeout**: Increase timeout in scraperService.ts
2. **AI API errors**: Check OpenRouter API key and rate limits
3. **MongoDB connection**: Verify MongoDB is running
4. **Port conflicts**: Change ports in .env and vite.config.ts

## 📚 Additional Resources

- [Puppeteer Docs](https://pptr.dev/)
- [OpenRouter API](https://openrouter.ai/docs)
- [WordPress Theme Development](https://developer.wordpress.org/themes/)
- [Elementor Developers](https://developers.elementor.com/)
- [React Documentation](https://react.dev/)
- [Material-UI](https://mui.com/)

## 🎯 Future Enhancements

### Planned Features
- [ ] Multi-page site support (sitemap crawling)
- [ ] Custom AI prompt templates
- [ ] Theme preview before download
- [ ] Advanced Elementor widget generation
- [ ] WooCommerce theme support
- [ ] Automated testing suite
- [ ] Docker containerization
- [ ] Cloud deployment guide
- [ ] User authentication
- [ ] Job queue management
- [ ] Webhook notifications
- [ ] API rate limiting
- [ ] Admin dashboard

### Contribution Ideas
- Add support for other CMS platforms
- Implement theme customization options
- Add more AI models support
- Create CLI version
- Build browser extension
- Add internationalization (i18n)

---

**Last Updated**: 2025-10-03  
**Version**: 1.0.0  
**Maintainer**: SiteScape AI Team
