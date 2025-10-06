# 🚀 SiteScape AI

**AI-Powered Website Scraper & WordPress Theme Converter**

Transform any website into a fully functional WordPress theme with Elementor support using advanced AI technology.

## 🌟 Features

- **🔍 Intelligent Multi-Page Scraping**: Uses Puppeteer to capture complete websites including:
  - Multi-page discovery (sitemap.xml + AI-powered)
  - HTML, CSS, JavaScript
  - Images, videos, fonts, audio, and documents
  - Background images and embedded content
  - Dynamic/lazy-loaded content
  - Up to 10 pages per website

- **🤖 AI-Powered Conversion**: Leverages OpenRouter API to:
  - Analyze website structure and animations
  - Discover hidden pages and assets
  - Convert HTML/CSS/JS to React components
  - Optimize for WordPress and Elementor
  - Generate pixel-perfect UI matching
  - Validate project completeness before packaging

- **⚡ React.js Pipeline**: 
  - Converts scraped content to modern React app
  - Uses TypeScript for type safety
  - Implements styled-components for styling
  - Preserves animations with Framer Motion

- **🎨 WordPress Theme Builder**:
  - Generates complete WP theme structure
  - Full Elementor compatibility (Free & Pro)
  - Optimized assets (WebP conversion)
  - Importable demo content (XML)
  - Elementor template JSON files
  - Clean, semantic code
  - ALL asset types included (videos, audio, documents)

- **📊 Real-time Progress**: 
  - Socket.IO for live updates
  - Comprehensive activity logs
  - Smart auto-scroll with manual control
  - Real-time counters (pages found, assets downloaded)
  - Category-based log filtering

- **🎨 Custom AI Prompts** (v2.1):
  - Configure 9 different AI prompts
  - Variable substitution system
  - Save/Reset functionality
  - Tailor AI behavior per project type

- **👁️ Theme Preview** (v2.1):
  - Preview theme before downloading
  - Self-contained HTML preview
  - Inline CSS and embedded images
  - Professional preview banner
  
- **💾 MongoDB Storage**: Tracks all jobs and conversions
- **📦 Complete Package**: Get everything as ZIP with asset manifest

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js + TypeScript
- Puppeteer (headless Chrome scraping)
- Cheerio (HTML parsing)
- MongoDB + Mongoose
- Socket.IO (real-time updates)
- Sharp (image optimization)
- OpenRouter API (AI conversions)

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Material-UI (components)
- Socket.IO Client
- Axios

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB (local installation or MongoDB Compass)
- OpenRouter API Key (free tier available)

## 🚀 Installation

### 1. Clone Repository
\`\`\`bash
git clone <repository-url>
cd theme-extracter-tool-wordpress
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm run install:all
\`\`\`

This will install dependencies for root, backend, and frontend.

### 3. Configure Environment
Create a \`.env\` file in the root directory:

\`\`\`env
OPENROUTER_API_KEY=your_openrouter_api_key_here
MONGODB_URI=mongodb://localhost:27017/sitescape-ai
PORT=5000
FRONTEND_PORT=3000
NODE_ENV=development
\`\`\`

**Get your OpenRouter API key**: https://openrouter.ai/keys

### 4. Start MongoDB
Make sure MongoDB is running locally:

\`\`\`bash
# Windows (if installed as service)
net start MongoDB

# Or use MongoDB Compass to start local instance
\`\`\`

### 5. Run Application
\`\`\`bash
npm run dev
\`\`\`

This starts both backend (port 5000) and frontend (port 3000) concurrently.

## 📖 Usage

### 1. Access Dashboard
Open browser: http://localhost:3000

### 2. Enter Website URL
- Input any website URL (e.g., https://example.com)
- Click "Start Conversion"

### 3. Monitor Progress
Watch real-time progress through stages:
- **Analyzing** (5%): AI analyzes website structure
- **Scraping** (10-70%): Downloads all assets
- **Converting** (70-90%): Converts to React components
- **Building** (90-100%): Generates WordPress theme

### 4. Download Theme
- Click "Download WordPress Theme" when complete
- Extract ZIP file

### 5. Install in WordPress

#### Upload Theme:
1. Go to WordPress Admin → Appearance → Themes
2. Click "Add New" → "Upload Theme"
3. Choose the `wp-theme` folder from extracted ZIP
4. Click "Install Now" → "Activate"

#### Import Demo Content:
1. Go to Tools → Import
2. Install "WordPress Importer"
3. Upload `demo-content.xml` from ZIP
4. Check "Download and import file attachments"
5. Click "Submit"

#### Configure Elementor:
1. Install Elementor plugin (free or Pro)
2. Theme is pre-configured for Elementor
3. Edit any page with Elementor to customize

## 🏗️ Project Structure

\`\`\`
sitescape-ai/
├── backend/
│   ├── src/
│   │   ├── models/          # MongoDB schemas
│   │   │   ├── Scrape.ts
│   │   │   ├── Conversion.ts
│   │   │   └── Build.ts
│   │   ├── services/        # Core logic
│   │   │   ├── aiService.ts
│   │   │   ├── scraperService.ts
│   │   │   ├── conversionService.ts
│   │   │   └── wpThemeBuilder.ts
│   │   ├── routes/
│   │   │   └── scrapeRoutes.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── projects/                # Generated files (gitignored)
│   └── [jobId]/
│       ├── scraped/         # Raw scraped files
│       ├── react-app/       # React conversion
│       ├── wp-theme/        # WordPress theme
│       ├── demo-content.xml
│       └── README.md
├── .env
├── .gitignore
├── package.json
└── README.md
\`\`\`

## 🔌 API Endpoints

### POST /api/scrape
Start new scraping job
\`\`\`json
{
  "url": "https://example.com"
}
\`\`\`

### GET /api/status/:jobId
Get job status and progress

### GET /api/download/:jobId
Download completed theme ZIP

### GET /api/jobs
List recent jobs (last 20)

### GET /health
Health check endpoint

## 🧪 How It Works

### 1. Scraping Phase
- Validates URL and checks robots.txt
- AI analyzes website structure
- Puppeteer renders page (handles JS)
- Scrolls to load lazy images
- Extracts all assets (images, CSS, JS, fonts, videos)
- Downloads assets with rate limiting
- Stores metadata in MongoDB

### 2. Conversion Phase
- Parses HTML with Cheerio
- Extracts sections (header, nav, main, footer)
- AI converts each section to React components
- Generates TypeScript components with hooks
- Creates styled-components for CSS
- Builds complete React app with Vite config

### 3. Build Phase
- Generates WordPress theme structure
- Creates functions.php with Elementor support
- Generates template files (index.php, header.php, footer.php)
- Optimizes images to WebP
- Combines CSS/JS assets
- Creates demo content XML
- Generates installation README

### 4. Packaging
- Creates ZIP with:
  - wp-theme/ (complete theme folder)
  - demo-content.xml (importable content)
  - README.md (installation guide)

## 🎨 WordPress Theme Features

- **Elementor Ready**: Full compatibility with Elementor Free & Pro
- **Responsive Design**: Mobile-first approach
- **Optimized Assets**: WebP images, minified CSS/JS
- **SEO Friendly**: Semantic HTML, proper meta tags
- **Custom Widgets**: Extensible widget system
- **Theme Customizer**: WordPress Customizer support
- **Navigation Menus**: Primary and footer menus
- **Custom Logo**: Logo upload support

## 🔧 Configuration

### AI Model
Default: `openai/gpt-4o-mini-2024-07-18` (OpenRouter)

To change model, edit `backend/src/services/aiService.ts`:
\`\`\`typescript
const MODEL = 'your-preferred-model';
\`\`\`

### Scraping Options
Edit `backend/src/services/scraperService.ts`:
- User agent
- Timeout settings
- Rate limiting delays
- Asset types to download

### Theme Customization
Edit `backend/src/services/wpThemeBuilder.ts`:
- Theme metadata
- Template structure
- Elementor hooks

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `net start MongoDB`
- Check MONGODB_URI in .env
- Use MongoDB Compass to verify connection

### Puppeteer Issues
- Install Chromium dependencies (Linux):
  \`\`\`bash
  sudo apt-get install -y chromium-browser
  \`\`\`
- Windows: Should work out of the box

### OpenRouter API Errors
- Verify API key is correct
- Check rate limits (free tier)
- Review API logs in MongoDB

### Port Already in Use
- Change PORT in .env (backend)
- Change port in frontend/vite.config.ts

## 📊 Database Schema

### Scrapes Collection
- jobId, url, status, progress
- scrapedFiles (categorized assets)
- metadata (title, description, AI analysis)

### Conversions Collection
- jobId, aiLogs (all AI interactions)
- componentMappings (HTML → React)
- reactAppPath

### Builds Collection
- jobId, wpThemePath, zipPath
- metadata (theme info, file count, size)

## 🚦 Performance Tips

1. **Parallel Processing**: Uses worker threads for scraping
2. **Asset Optimization**: WebP conversion reduces size by ~30%
3. **Caching**: Reuses AI responses for similar patterns
4. **Rate Limiting**: Prevents server overload
5. **Compression**: Max-level ZIP compression

## 🔒 Security

- Input sanitization on all endpoints
- CORS restricted to localhost
- No eval() in conversions
- Robots.txt compliance
- Environment variables for secrets

## 🧪 Testing

Run tests (when implemented):
\`\`\`bash
npm test
\`\`\`

## 📝 License

MIT License - feel free to use for personal and commercial projects

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📞 Support

For issues and questions:
- Open GitHub issue
- Check troubleshooting section
- Review API documentation

## 🎯 Roadmap

- [x] Multi-page site support (sitemap crawling) ✅
- [x] Real-time activity logs ✅
- [x] AI validation before packaging ✅
- [x] Complete asset packaging (videos, audio, docs) ✅
- [x] Custom AI prompt configuration ✅ (v2.1)
- [x] Theme preview before download ✅ (v2.1)
- [x] Enhanced image scraping (CDN, lazy-loading) ✅ (v2.1)
- [ ] Advanced Elementor widget generation
- [ ] Support for WooCommerce themes
- [ ] Automated testing suite
- [ ] Docker deployment
- [ ] Cloud deployment guide

## ⚡ Quick Start Commands

\`\`\`bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev

# Build for production
npm run build

# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend
\`\`\`

---

**Built with ❤️ using AI-powered automation**

*Transform any website into a WordPress theme in minutes!*
