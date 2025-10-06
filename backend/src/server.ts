import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import scrapeRoutes from './routes/scrapeRoutes';
import aiService from './services/aiService';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app: Application = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: `http://localhost:${process.env.FRONTEND_PORT || 3000}`,
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sitescape-ai';

// Middleware
app.use(cors({
  origin: `http://localhost:${process.env.FRONTEND_PORT || 3000}`
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api', scrapeRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Test AI connection
async function testAIConnection() {
  console.log('\n🤖 Testing AI Connection...');
  try {
    const testResponse = await aiService.testConnection();
    if (testResponse.success) {
      console.log('✅ AI Service Connected Successfully');
      console.log(`   Model: ${testResponse.data || 'openai/gpt-4o-mini'}`);
    } else {
      console.log('⚠️  AI Service Warning:', testResponse.error);
      console.log('   The app will work but AI features may be limited');
    }
  } catch (error: any) {
    console.log('❌ AI Service Error:', error.message);
    console.log('   Please check your OPENROUTER_API_KEY in .env file');
  }
  console.log('');
}

// MongoDB connection
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Test AI connection
    await testAIConnection();
    
    // Start server
    httpServer.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`✅ Socket.IO ready for real-time updates`);
      console.log(`\n📊 Dashboard: http://localhost:${process.env.FRONTEND_PORT || 3000}`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
      console.log(`💚 Health: http://localhost:${PORT}/health\n`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;
