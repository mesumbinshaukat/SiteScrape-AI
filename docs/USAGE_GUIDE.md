# 🚀 SiteScape AI - Usage Guide

## Quick Start

### 1. Start the Application
```powershell
# Make sure MongoDB is running
net start MongoDB

# Start both servers
npm run dev
```

### 2. Open Dashboard
Navigate to: **http://localhost:3000**

### 3. Convert a Website

#### Step 1: Enter URL
- Enter any website URL (e.g., `https://example.com`)
- Click "Start Conversion"

#### Step 2: Watch Real-time Progress
The dashboard will show:
- **Progress Bar**: Overall completion (0-100%)
- **Statistics Cards**:
  - Pages Found: Number of pages discovered
  - Assets Downloaded: Total assets extracted
  - Progress: Current percentage
- **Activity Logs**: Real-time operation logs

#### Step 3: Monitor Logs
The log viewer shows:
- 📝 **Info**: General information
- ✅ **Success**: Successful operations
- ⚠️ **Warning**: Non-critical issues
- ❌ **Error**: Critical errors
- 🤖 **AI**: AI analysis and decisions

**Log Categories**:
- Setup: Initialization
- Discovery: Page finding
- Scraping: Page scraping
- Assets: Asset downloads
- AI Analysis: AI operations
- Conversion: React conversion
- Elementor: Template generation

#### Step 4: Download Theme
When complete (100%), click **"Download WordPress Theme"**

## What Gets Scraped

### Pages (Multi-Page Support)
- ✅ Main page
- ✅ Sitemap.xml pages
- ✅ Internal links
- ✅ AI-discovered pages
- ✅ Up to 10 pages total

### Assets (Comprehensive)
- ✅ **Images**: JPG, PNG, GIF, SVG, WebP, ICO
- ✅ **Videos**: MP4, WebM, OGG, AVI, MOV
- ✅ **Fonts**: WOFF, WOFF2, TTF, OTF, EOT, Google Fonts
- ✅ **Audio**: MP3, WAV, M4A
- ✅ **Documents**: PDF, DOC, DOCX, ZIP
- ✅ **Code**: CSS, JavaScript files
- ✅ **Background Images**: From computed styles
- ✅ **Lazy-loaded**: AI-detected content

## AI Features

### 1. Pre-Scrape Analysis
AI analyzes the website to:
- Identify key sections
- Detect animations
- Find interactive elements
- Suggest React libraries
- Plan migration strategy

### 2. Page Discovery
AI helps find:
- Hidden pages
- Dynamic routes
- Multi-language versions
- Pagination patterns

### 3. Asset Discovery
AI detects:
- Lazy-loaded images
- Background videos
- Custom fonts
- Hidden media

### 4. Content Extraction
AI extracts:
- Page content
- Image captions
- Menu items
- Form labels
- CTAs

### 5. Template Generation
AI creates:
- Elementor JSON templates
- Widget mappings
- Responsive settings

## Log Viewer Features

### Filtering
- Click log level buttons to filter
- Toggle: Info, Success, Warning, Error, AI

### Search
- Type in search box to find specific logs
- Searches message and category

### Categories
- Click category to expand/collapse
- See all logs in that category
- View timestamps and details

### Auto-scroll
- Automatically scrolls to latest log
- Keeps you updated in real-time

## Download Package Contents

Your ZIP file contains:

```
your-theme.zip
├── wp-theme/                    ← WordPress theme folder
│   ├── style.css               ← Theme metadata
│   ├── functions.php           ← Theme functions + Elementor
│   ├── index.php               ← Main template
│   ├── header.php              ← Header template
│   ├── footer.php              ← Footer template
│   └── assets/
│       ├── css/                ← Stylesheets
│       ├── js/                 ← JavaScript
│       ├── images/             ← Optimized images (WebP)
│       ├── videos/             ← Video files
│       ├── fonts/              ← Font files
│       └── audio/              ← Audio files
├── elementor-templates/         ← Elementor JSON templates
│   ├── header-template.json
│   ├── footer-template.json
│   └── ...
├── demo-content.xml            ← WordPress import file
└── README.md                   ← Installation instructions
```

## WordPress Installation

### Step 1: Upload Theme
1. WordPress Admin → Appearance → Themes
2. Add New → Upload Theme
3. Choose `wp-theme` folder from ZIP
4. Click "Install Now"
5. Click "Activate"

### Step 2: Import Demo Content
1. Tools → Import
2. WordPress Importer → Install & Run
3. Upload `demo-content.xml`
4. Check "Download and import file attachments"
5. Click "Submit"

### Step 3: Import Elementor Templates
1. Install Elementor (free or Pro)
2. Templates → Saved Templates
3. Import Templates
4. Upload JSON files from `elementor-templates/`
5. Use templates in pages

### Step 4: Customize
- Appearance → Customize (theme settings)
- Edit pages with Elementor
- Customize menus, widgets, etc.

## Understanding the Logs

### Setup Phase
```
📝 [Setup] Checking robots.txt...
✅ [Setup] Robots.txt check passed
✅ [Setup] Browser initialized
```

### Discovery Phase
```
📝 [Discovery] Discovering pages...
📝 [Sitemap] Checking for sitemap at https://example.com/sitemap.xml
✅ [Sitemap] Found 5 pages in sitemap
🤖 [AI Analysis] Using AI to discover pages...
✅ [Discovery] Found 8 pages to scrape
```

### Scraping Phase
```
📝 [Scraping] Scraping page: https://example.com
✅ [Scraping] Scraped https://example.com
📝 [Assets] Found images: https://example.com/image.jpg
✅ [Assets] Downloaded images: image.jpg
```

### AI Analysis
```
🤖 [AI Analysis] Using AI to find hidden assets...
🤖 [AI Analysis] AI found additional assets
🤖 [Content Extraction] Using AI to extract demo content...
🤖 [Elementor] Generating Elementor template for Header...
```

### Completion
```
✅ [Complete] Scraping complete: 45 assets downloaded from 8 pages
✅ [Demo Content] WordPress XML generated
✅ [Elementor] Generated 5 Elementor templates
```

## Tips & Best Practices

### 1. Start Small
- Test with simple websites first
- Example: `https://example.com`
- Then try more complex sites

### 2. Monitor Logs
- Watch for errors or warnings
- AI logs show intelligent decisions
- Asset logs show what's being downloaded

### 3. Check Statistics
- Pages Found: Should match expected
- Assets Downloaded: Verify completeness
- Progress: Should reach 100%

### 4. Use Filters
- Filter logs by category
- Focus on errors if issues occur
- Check AI logs for insights

### 5. WordPress Setup
- Install Elementor before importing
- Import demo content for sample data
- Use Elementor templates for quick setup

## Troubleshooting

### No Pages Found
- Check if sitemap.xml exists
- Verify internal links work
- Review AI discovery logs

### Missing Assets
- Check asset logs for failures
- Verify URLs are accessible
- Look for 404 errors in logs

### Slow Processing
- Normal for large sites
- 10-15 minutes for complex sites
- Check progress in logs

### AI Errors
- Verify API key in .env
- Check OpenRouter status
- Review AI logs for details

### Download Issues
- Wait for 100% completion
- Check for error logs
- Verify ZIP was created

## Advanced Features

### Custom AI Prompts
Edit `aiService.ts` to customize prompts for:
- Page discovery
- Asset detection
- Content extraction
- Template generation

### Page Limit
Currently limited to 10 pages. To increase:
```typescript
// In enhancedScraperService.ts
const allPages = Array.from(this.discoveredPages).slice(0, 20); // Change 10 to 20
```

### Asset Types
Add custom asset types in:
```typescript
// enhancedScraperService.ts
private getAssetType(url: string): keyof AssetCollection {
  // Add your custom types here
}
```

## Performance Expectations

### Processing Time
- **Simple site** (1 page, < 50 assets): 2-3 minutes
- **Medium site** (5 pages, 100-200 assets): 5-7 minutes
- **Complex site** (10 pages, 200+ assets): 10-15 minutes

### What Affects Speed
- Number of pages
- Number of assets
- Asset sizes
- AI processing time
- Network speed

## FAQ

### Q: How many pages can it scrape?
A: Currently limited to 10 pages. Can be increased in code.

### Q: What if AI fails?
A: Fallback methods are used. Check logs for details.

### Q: Are videos downloaded?
A: Yes! All video formats including embedded.

### Q: Does it work with single-page apps?
A: Yes! Puppeteer renders JavaScript.

### Q: Can I customize templates?
A: Yes! Edit in WordPress with Elementor.

### Q: What about fonts?
A: All fonts extracted including Google Fonts.

### Q: Is it pixel-perfect?
A: AI strives for exact replication. Minor adjustments may be needed.

### Q: Can I scrape password-protected sites?
A: Not currently. Only public pages.

---

## Summary

**SiteScape AI now provides:**
- ✅ Multi-page scraping
- ✅ Comprehensive asset extraction
- ✅ Real-time logging
- ✅ AI-powered optimization
- ✅ Elementor templates
- ✅ Demo content
- ✅ Complete WordPress theme

**Start converting websites to WordPress themes with AI!** 🚀
