import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { scanWorkspace } from '../core/analysis/architectureScanner';
import { summarizeArchitectureWithAI } from '../core/analysis/llmSummarizer';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Scan workspace endpoint
app.post('/api/scan', async (req: Request, res: Response) => {
  try {
    const { rootPath } = req.body;
    
    console.log('Received scan request for:', rootPath);
    
    if (!rootPath) {
      return res.status(400).json({ error: 'rootPath is required' });
    }

    console.log('Starting workspace scan...');
    const summary = await scanWorkspace(rootPath);
    console.log('Scan complete, files found:', summary.files.length);
    
    // Transform to match frontend expectations
    const response = {
      rootPath: summary.root,
      totalFiles: summary.files.length,
      entryPoints: summary.entrypoints,
      modules: summary.files.map(f => ({
        name: f.path.split(/[/\\]/).pop() || f.path,
        path: f.path,
        exports: f.exports,
        imports: f.imports,
      })),
      dependencies: {
        ...summary.packages?.dependencies,
        ...summary.packages?.devDependencies,
      },
    };
    
    console.log('Sending response with', response.modules.length, 'modules');
    res.json(response);
  } catch (error) {
    console.error('Scan error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    res.status(500).json({ 
      error: 'Failed to scan workspace', 
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

// AI summary endpoint
app.post('/api/ai-scan', async (req: Request, res: Response) => {
  try {
    const { rootPath, model, maxTokens } = req.body;
    
    if (!rootPath) {
      return res.status(400).json({ error: 'rootPath is required' });
    }

    const summary = await scanWorkspace(rootPath);
    const aiSummary = await summarizeArchitectureWithAI(summary, {
      model,
      maxTokens
    });
    
    // Add timestamp if not present
    const response = {
      ...aiSummary,
      timestamp: new Date().toISOString(),
    };
    
    res.json(response);
  } catch (error) {
    console.error('AI scan error:', error);
    res.status(500).json({ 
      error: 'Failed to generate AI summary', 
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   POST http://localhost:${PORT}/api/scan`);
  console.log(`   POST http://localhost:${PORT}/api/ai-scan`);
});

export default app;
