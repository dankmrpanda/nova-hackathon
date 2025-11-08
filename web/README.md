# Codebase Onboarding Agent - Web Interface

React-based web interface for the Codebase Onboarding Agent.

## Features

- 🔍 **Interactive Scanner**: Visual workspace scanning with path input
- 📊 **Architecture Visualization**: Explore modules, dependencies, and entry points
- 🤖 **AI Summaries**: LLM-powered architecture explanations
- 🎨 **Modern UI**: Dark theme with responsive design
- ⚡ **Fast Development**: Vite + React + TypeScript

## Quick Start

```powershell
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

```
web/
├── src/
│   ├── components/       # React components
│   │   ├── Scanner.tsx        # Path input & scan controls
│   │   ├── ArchitectureView.tsx  # Module & dependency viewer
│   │   └── AISummary.tsx      # AI analysis display
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── index.html
├── vite.config.ts
└── package.json
```

## API Integration

The web client connects to the API server (default: `http://localhost:3001`) with these endpoints:

- `POST /api/scan` - Scan workspace architecture
- `POST /api/ai-scan` - Generate AI summary
- `GET /api/health` - Health check

## Environment

Configure the API server with `.env` in the root directory:

```
OPENROUTER_API_KEY=your-key-here
OPENROUTER_MODEL=anthropic/claude-3-opus:latest
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Axios** - HTTP client
- **React Icons** - Icon library
