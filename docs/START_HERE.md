# 🎯 START HERE - SiteScape AI

## Welcome to SiteScape AI! 👋

This is your **complete guide** to get started in **5 minutes**.

---

## ⚡ Quick Setup (Choose Your Path)

### 🪟 Windows Users (Recommended)

#### Step 1: Run Automated Setup
```powershell
.\setup.ps1
```

This will:
- ✅ Check Node.js and MongoDB
- ✅ Install all dependencies
- ✅ Create .env file
- ✅ Guide you through configuration

#### Step 2: Add Your API Key
1. Get free API key from: https://openrouter.ai/keys
2. Open `.env` file
3. Replace `your_openrouter_api_key_here` with your actual key

#### Step 3: Start MongoDB
```powershell
net start MongoDB
```

Or open **MongoDB Compass** and connect to `mongodb://localhost:27017`

#### Step 4: Launch Application
```powershell
npm run dev
```

#### Step 5: Open Dashboard
Browser will open automatically, or go to: **http://localhost:3000**

---

### 🍎 macOS / 🐧 Linux Users

#### Step 1: Install Dependencies
```bash
npm run install:all
```

#### Step 2: Configure Environment
```bash
cp .env.example .env
nano .env  # or use your preferred editor
```

Add your OpenRouter API key from: https://openrouter.ai/keys

#### Step 3: Start MongoDB
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

#### Step 4: Launch Application
```bash
npm run dev
```

#### Step 5: Open Dashboard
Go to: **http://localhost:3000**

---

## 🚀 Your First Website Conversion

### Step-by-Step Tutorial

1. **Enter Website URL**
   - Type any website URL (e.g., `https://example.com`)
   - Click "Start Conversion"

2. **Watch Progress** (Real-time updates)
   - 🔍 Analyzing (5%) - AI analyzes structure
   - 📥 Scraping (10-70%) - Downloads all assets
   - ⚛️ Converting (70-90%) - Creates React components
   - 🎨 Building (90-100%) - Generates WordPress theme

3. **Download Theme**
   - Click "Download WordPress Theme" button
   - Save the ZIP file

4. **Install in WordPress**
   - Extract ZIP file
   - Upload `wp-theme` folder to WordPress
   - Import `demo-content.xml`
   - Activate theme
   - Edit with Elementor!

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js 18+** installed
  - Check: `node --version`
  - Download: https://nodejs.org/

- [ ] **MongoDB** installed and running
  - Check: `mongod --version`
  - Download: https://www.mongodb.com/try/download/community
  - Or use: MongoDB Compass (GUI)

- [ ] **OpenRouter API Key** (free)
  - Get from: https://openrouter.ai/keys
  - Free tier available

- [ ] **Internet Connection**
  - For AI API calls
  - For package downloads

---

## 🎓 What You'll Get

After conversion, your ZIP contains:

```
📦 your-theme.zip
├── 📁 wp-theme/              ← Upload this to WordPress
│   ├── style.css
│   ├── functions.php
│   ├── index.php
│   ├── header.php
│   ├── footer.php
│   └── assets/
│       ├── css/
│       ├── js/
│       ├── images/          ← Optimized WebP images
│       └── fonts/
├── 📄 demo-content.xml       ← Import in WordPress
└── 📖 README.md              ← Installation guide
```

---

## 🛠️ Troubleshooting

### ❌ "MongoDB connection refused"
```powershell
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### ❌ "Port already in use"
Edit `.env` file:
```env
PORT=5001
FRONTEND_PORT=3001
```

### ❌ "Invalid API key"
1. Verify key at https://openrouter.ai/keys
2. Check `.env` file has correct key
3. Restart servers: `npm run dev`

### ❌ "npm install fails"
```bash
npm cache clean --force
npm run install:all
```

---

## 📚 Documentation Guide

| Document | When to Read |
|----------|--------------|
| **START_HERE.md** | 👈 You are here! |
| **QUICKSTART.md** | Quick 5-minute setup |
| **README.md** | Full feature documentation |
| **INSTALLATION.md** | Detailed installation for all platforms |
| **PROJECT_INFO.md** | Technical architecture details |
| **CONTRIBUTING.md** | Want to contribute? |
| **CHANGELOG.md** | Version history |

---

## 🎯 Common Use Cases

### 1. **Theme Developer**
Convert competitor sites → Study structure → Build better themes

### 2. **Agency**
Client has old site → Convert to WordPress → Modernize with Elementor

### 3. **Freelancer**
Quick prototyping → Client approval → Customize further

### 4. **Business Owner**
Migrate from old platform → WordPress → Full control

---

## ⚙️ Configuration Options

### Change AI Model
Edit `backend/src/services/aiService.ts`:
```typescript
const MODEL = 'openai/gpt-4o-mini-2024-07-18'; // Change this
```

### Adjust Scraping Timeout
Edit `backend/src/services/scraperService.ts`:
```typescript
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }); // Increase timeout
```

### Customize Theme Name
The theme name is auto-generated from the website title. It will be sanitized and used in the WordPress theme.

---

## 🔥 Pro Tips

1. **Start Simple**
   - First try: https://example.com
   - Then try more complex sites

2. **Check Progress**
   - Watch real-time updates in dashboard
   - Check MongoDB Compass for data

3. **Optimize Images**
   - Images are auto-converted to WebP
   - 30-50% size reduction

4. **Elementor Ready**
   - Theme is pre-configured
   - Just install Elementor and start editing

5. **Demo Content**
   - Always import demo-content.xml
   - Gives you starting point

---

## 📊 Expected Results

### What Gets Scraped
✅ All HTML, CSS, JavaScript  
✅ All images (including lazy-loaded)  
✅ Background images from CSS  
✅ Videos and fonts  
✅ External assets  

### What Gets Generated
✅ Complete WordPress theme  
✅ Elementor-compatible structure  
✅ Optimized assets (WebP images)  
✅ Responsive design preserved  
✅ Demo content for import  

### Processing Time
- **Simple site**: 2-3 minutes
- **Medium site**: 5-7 minutes
- **Complex site**: 10-15 minutes

---

## 🎬 Video Tutorial (Conceptual)

**If this were a video, here's what you'd see:**

1. **00:00** - Open terminal, run `.\setup.ps1`
2. **00:30** - Add API key to `.env`
3. **01:00** - Run `npm run dev`
4. **01:30** - Open http://localhost:3000
5. **02:00** - Enter website URL, click convert
6. **02:30** - Watch real-time progress
7. **05:00** - Download completed theme
8. **06:00** - Upload to WordPress
9. **07:00** - Import demo content
10. **08:00** - Edit with Elementor - Done! 🎉

---

## 🆘 Need Help?

### Quick Checks
1. ✅ Node.js installed? `node --version`
2. ✅ MongoDB running? `mongosh`
3. ✅ API key added? Check `.env`
4. ✅ Dependencies installed? `npm run install:all`
5. ✅ Servers running? `npm run dev`

### Get Support
- 📖 Read: [INSTALLATION.md](./INSTALLATION.md)
- 🐛 Issues: Check troubleshooting section
- 💬 Questions: Review documentation
- 🔍 Errors: Check console logs

---

## ✅ Success Checklist

After setup, you should see:

```
✅ Connected to MongoDB
✅ Server running on http://localhost:5000
✅ Socket.IO ready for real-time updates
✅ Frontend running on http://localhost:3000
```

In your browser:
- ✅ Dashboard loads at http://localhost:3000
- ✅ Can enter URL
- ✅ Can start conversion
- ✅ See real-time progress
- ✅ Can download theme

---

## 🎉 You're Ready!

**Congratulations!** You now have a powerful AI-driven website conversion tool.

### What's Next?

1. **Convert Your First Site**
   - Start with something simple
   - Watch the magic happen

2. **Explore Features**
   - Try different websites
   - Check the generated code
   - Customize the theme

3. **Share & Contribute**
   - Found a bug? Report it
   - Have an idea? Suggest it
   - Want to help? Contribute!

---

## 🚀 Ready to Start?

### Run This Now:
```powershell
# Windows
.\setup.ps1

# macOS/Linux
npm run install:all
```

### Then:
1. Add API key to `.env`
2. Start MongoDB
3. Run `npm run dev`
4. Open http://localhost:3000
5. **Convert your first website!** 🎨

---

**Happy Converting!** 🚀

*Transform any website into a WordPress theme in minutes!*

---

**Quick Links:**
- 🏠 [Main README](./README.md)
- ⚡ [Quick Start](./QUICKSTART.md)
- 📦 [Installation Guide](./INSTALLATION.md)
- 🔧 [Technical Info](./PROJECT_INFO.md)
