# 📦 Installation Guide - SiteScape AI

Complete installation instructions for Windows, macOS, and Linux.

## 📋 System Requirements

### Minimum Requirements
- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **Node.js**: 18.0.0 or higher
- **MongoDB**: 6.0 or higher
- **RAM**: 4GB minimum (8GB recommended)
- **Disk Space**: 2GB free space
- **Internet**: Required for AI API and package downloads

### Recommended Requirements
- **Node.js**: 20.x LTS
- **MongoDB**: 8.0
- **RAM**: 8GB or more
- **SSD**: For better performance

## 🪟 Windows Installation

### Step 1: Install Node.js
1. Download from https://nodejs.org/
2. Choose LTS version (20.x)
3. Run installer
4. Verify installation:
```powershell
node --version
npm --version
```

### Step 2: Install MongoDB

#### Option A: MongoDB Community Server
1. Download from https://www.mongodb.com/try/download/community
2. Run installer
3. Choose "Complete" installation
4. Install as Windows Service
5. Verify installation:
```powershell
mongod --version
```

#### Option B: MongoDB Compass (GUI)
1. Download from https://www.mongodb.com/try/download/compass
2. Install and open
3. Connect to `mongodb://localhost:27017`
4. Create database: `sitescape-ai`

### Step 3: Install Git (Optional)
1. Download from https://git-scm.com/
2. Run installer with default settings

### Step 4: Clone/Download Project
```powershell
# Using Git
git clone <repository-url>
cd theme-extracter-tool-wordpress

# Or download ZIP and extract
```

### Step 5: Run Setup Script
```powershell
# Run automated setup
.\setup.ps1

# Or manual setup
npm run install:all
```

### Step 6: Configure Environment
1. Copy `.env.example` to `.env`
2. Get OpenRouter API key from https://openrouter.ai/keys
3. Edit `.env`:
```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
MONGODB_URI=mongodb://localhost:27017/sitescape-ai
PORT=5000
FRONTEND_PORT=3000
NODE_ENV=development
```

### Step 7: Start MongoDB
```powershell
# If installed as service
net start MongoDB

# Or use MongoDB Compass
```

### Step 8: Run Application
```powershell
npm run dev
```

### Step 9: Access Dashboard
Open browser: http://localhost:3000

## 🍎 macOS Installation

### Step 1: Install Homebrew (if not installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Step 2: Install Node.js
```bash
brew install node@20
node --version
npm --version
```

### Step 3: Install MongoDB
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community@8.0

# Start MongoDB service
brew services start mongodb-community@8.0

# Verify
mongosh --version
```

### Step 4: Clone Project
```bash
git clone <repository-url>
cd theme-extracter-tool-wordpress
```

### Step 5: Install Dependencies
```bash
npm run install:all
```

### Step 6: Configure Environment
```bash
cp .env.example .env
nano .env  # or use any text editor
```

Add your OpenRouter API key:
```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
MONGODB_URI=mongodb://localhost:27017/sitescape-ai
PORT=5000
FRONTEND_PORT=3000
NODE_ENV=development
```

### Step 7: Run Application
```bash
npm run dev
```

### Step 8: Access Dashboard
Open browser: http://localhost:3000

## 🐧 Linux Installation (Ubuntu/Debian)

### Step 1: Update System
```bash
sudo apt update
sudo apt upgrade -y
```

### Step 2: Install Node.js
```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

### Step 3: Install MongoDB
```bash
# Import MongoDB public key
curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg \
   --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/8.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
mongod --version
```

### Step 4: Install Git
```bash
sudo apt install -y git
```

### Step 5: Clone Project
```bash
git clone <repository-url>
cd theme-extracter-tool-wordpress
```

### Step 6: Install Dependencies
```bash
npm run install:all
```

### Step 7: Install Chromium (for Puppeteer)
```bash
sudo apt install -y chromium-browser
```

### Step 8: Configure Environment
```bash
cp .env.example .env
nano .env
```

Add your configuration:
```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
MONGODB_URI=mongodb://localhost:27017/sitescape-ai
PORT=5000
FRONTEND_PORT=3000
NODE_ENV=development
```

### Step 9: Run Application
```bash
npm run dev
```

### Step 10: Access Dashboard
Open browser: http://localhost:3000

## 🐳 Docker Installation (All Platforms)

### Prerequisites
- Docker Desktop installed
- Docker Compose installed

### Step 1: Create docker-compose.yml
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:8.0
    container_name: sitescape-mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=sitescape-ai

  backend:
    build: ./backend
    container_name: sitescape-backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/sitescape-ai
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - PORT=5000
    depends_on:
      - mongodb
    volumes:
      - ./projects:/app/projects

  frontend:
    build: ./frontend
    container_name: sitescape-frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

### Step 2: Create Dockerfiles

**backend/Dockerfile**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

**frontend/Dockerfile**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host"]
```

### Step 3: Run with Docker Compose
```bash
# Create .env file with your API key
echo "OPENROUTER_API_KEY=your-key-here" > .env

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔧 Troubleshooting

### Node.js Issues

**Error: Node version too old**
```bash
# Update Node.js
# Windows: Download new installer
# macOS: brew upgrade node
# Linux: Use nvm or update via package manager
```

**Error: npm command not found**
```bash
# Reinstall Node.js or add to PATH
# Windows: Add C:\Program Files\nodejs to PATH
# macOS/Linux: Add to ~/.bashrc or ~/.zshrc
```

### MongoDB Issues

**Error: MongoDB connection refused**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**Error: MongoDB not found**
```bash
# Verify installation
mongod --version

# Check if running
# Windows: services.msc
# macOS: brew services list
# Linux: sudo systemctl status mongod
```

### Puppeteer Issues

**Error: Chromium download failed**
```bash
# Windows: Usually works automatically
# macOS: Install Chromium via Homebrew
brew install chromium

# Linux: Install dependencies
sudo apt install -y chromium-browser \
  libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 \
  libxi6 libxtst6 libnss3 libcups2 libxss1 libxrandr2 \
  libasound2 libpangocairo-1.0-0 libatk1.0-0 libatk-bridge2.0-0 \
  libgtk-3-0
```

**Error: Failed to launch browser**
```bash
# Set executable path manually
# Edit backend/src/services/scraperService.ts
executablePath: '/usr/bin/chromium-browser'
```

### Port Conflicts

**Error: Port 5000 already in use**
```bash
# Find process using port
# Windows
netstat -ano | findstr :5000

# macOS/Linux
lsof -i :5000

# Kill process or change port in .env
PORT=5001
```

**Error: Port 3000 already in use**
```bash
# Change frontend port
# Edit .env
FRONTEND_PORT=3001

# Edit frontend/vite.config.ts
server: { port: 3001 }
```

### OpenRouter API Issues

**Error: Invalid API key**
- Verify key at https://openrouter.ai/keys
- Check .env file has correct key
- Restart servers after updating .env

**Error: Rate limit exceeded**
- Free tier has limits
- Wait and retry
- Consider upgrading plan

### Installation Issues

**Error: npm install fails**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: Permission denied**
```bash
# Windows: Run as Administrator
# macOS/Linux: Use sudo (not recommended for npm)
# Better: Fix npm permissions
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

## ✅ Verification

### Check Installation
```bash
# Check Node.js
node --version  # Should be 18.0.0+

# Check npm
npm --version   # Should be 9.0.0+

# Check MongoDB
mongod --version  # Should be 6.0+

# Check MongoDB connection
mongosh mongodb://localhost:27017
```

### Test Application
1. Start application: `npm run dev`
2. Check backend: http://localhost:5000/health
3. Check frontend: http://localhost:3000
4. Try scraping a simple website

### Expected Output
```
✅ Connected to MongoDB
✅ Server running on http://localhost:5000
✅ Socket.IO ready for real-time updates
```

## 🚀 Next Steps

After successful installation:

1. **Read Documentation**
   - README.md - Main documentation
   - QUICKSTART.md - Quick start guide
   - PROJECT_INFO.md - Technical details

2. **Try First Conversion**
   - Enter a simple website URL
   - Monitor progress
   - Download WordPress theme

3. **Install in WordPress**
   - Follow generated README.md
   - Import demo content
   - Customize with Elementor

## 📞 Support

If you encounter issues:

1. Check troubleshooting section above
2. Review error messages carefully
3. Check GitHub Issues
4. Create new issue with:
   - Error message
   - Steps to reproduce
   - System information
   - Screenshots if applicable

## 🔄 Updating

### Update Application
```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm run install:all

# Restart application
npm run dev
```

### Update Dependencies
```bash
# Check for updates
npm outdated

# Update all
npm update

# Update specific package
npm install package-name@latest
```

---

**Installation Complete!** 🎉

You're ready to convert websites to WordPress themes!
