# 🚀 Quick Start Guide

Get SiteScape AI running in 5 minutes!

## Prerequisites Check

✅ Node.js 18+ installed  
✅ MongoDB installed or MongoDB Compass  
✅ OpenRouter API key (free at https://openrouter.ai/keys)

## Step 1: Setup (One-time)

### Option A: Automated Setup (Windows)
```powershell
.\setup.ps1
```

### Option B: Manual Setup
```bash
# Install dependencies
npm run install:all

# Copy environment file
cp .env.example .env

# Edit .env and add your OpenRouter API key
```

## Step 2: Configure API Key

Edit `.env` file:
```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
MONGODB_URI=mongodb://localhost:27017/sitescape-ai
PORT=5000
FRONTEND_PORT=3000
NODE_ENV=development
```

## Step 3: Start MongoDB

### Windows (Service)
```powershell
net start MongoDB
```

### MongoDB Compass
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Create database: `sitescape-ai`

## Step 4: Run Application

```bash
npm run dev
```

This starts:
- Backend server on http://localhost:5000
- Frontend dashboard on http://localhost:3000

## Step 5: Convert Your First Website

1. Open http://localhost:3000
2. Enter website URL (e.g., https://example.com)
3. Click "Start Conversion"
4. Wait for completion (progress shown in real-time)
5. Click "Download WordPress Theme"

## Step 6: Install in WordPress

1. **Upload Theme**
   - WordPress Admin → Appearance → Themes
   - Add New → Upload Theme
   - Choose `wp-theme` folder from ZIP
   - Activate

2. **Import Demo Content**
   - Tools → Import → WordPress Importer
   - Upload `demo-content.xml`
   - Import

3. **Install Elementor**
   - Plugins → Add New → Search "Elementor"
   - Install & Activate
   - Edit any page with Elementor

## 🎉 Done!

Your website is now a WordPress theme with Elementor support!

## Troubleshooting

### MongoDB won't start
```powershell
# Check if running
Get-Service MongoDB

# Start manually
mongod --dbpath C:\data\db
```

### Port already in use
Edit `.env`:
```env
PORT=5001
FRONTEND_PORT=3001
```

Update `frontend/vite.config.ts`:
```typescript
server: { port: 3001 }
```

### Puppeteer errors
```bash
# Reinstall Puppeteer
cd backend
npm uninstall puppeteer
npm install puppeteer
```

### API key errors
- Verify key at https://openrouter.ai/keys
- Check .env file has correct key
- Restart servers after updating .env

## Common Commands

```bash
# Start both servers
npm run dev

# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend

# Build for production
npm run build

# View logs
# Backend: Check terminal
# MongoDB: MongoDB Compass → Collections
```

## What Gets Scraped?

✅ All HTML, CSS, JavaScript  
✅ Images (including lazy-loaded)  
✅ Videos and fonts  
✅ Background images (CSS)  
✅ Embedded content  
✅ Animations and interactions  

## What Gets Generated?

📦 **WordPress Theme** with:
- Complete theme structure
- Elementor compatibility
- Optimized assets (WebP)
- Responsive design
- SEO-friendly code

📄 **Demo Content** (XML):
- Sample pages
- Importable with one click

📚 **Documentation**:
- Installation guide
- Theme features
- Customization tips

## Performance Tips

- **Faster scraping**: Use websites with fewer assets
- **Better conversion**: Simpler HTML structures work best
- **AI optimization**: Free tier has rate limits, be patient
- **Large sites**: May take 5-10 minutes for complex sites

## Next Steps

- Customize theme in WordPress Customizer
- Edit pages with Elementor
- Add your own content
- Install additional plugins

## Support

- 📖 Full docs: See README.md
- 🐛 Issues: Check troubleshooting section
- 💡 Tips: Review project structure

---

**Happy Converting! 🎨**
