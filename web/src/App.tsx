import { useState } from 'react';
import { FiCode, FiCpu, FiFileText, FiFolder } from 'react-icons/fi';
import Scanner from './components/Scanner';
import ArchitectureView from './components/ArchitectureView';
import AISummary from './components/AISummary';
import './App.css';

type Tab = 'scanner' | 'architecture' | 'ai-summary';

interface ArchitectureSummary {
  rootPath: string;
  totalFiles: number;
  entryPoints: string[];
  modules: Array<{
    name: string;
    path: string;
    exports: string[];
    imports: string[];
  }>;
  dependencies: Record<string, string>;
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('scanner');
  const [architectureData, setArchitectureData] = useState<ArchitectureSummary | null>(null);
  const [aiSummaryData, setAiSummaryData] = useState<any>(null);

  const handleScanComplete = (data: ArchitectureSummary) => {
    setArchitectureData(data);
    setActiveTab('architecture');
  };

  const handleAIScanComplete = (data: any) => {
    setAiSummaryData(data);
    setActiveTab('ai-summary');
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <FiCode size={32} />
            <h1>Codebase Onboarding Agent</h1>
          </div>
          <p className="tagline">
            Interactive architecture scanning and AI-powered explanations
          </p>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${activeTab === 'scanner' ? 'active' : ''}`}
          onClick={() => setActiveTab('scanner')}
        >
          <FiFolder />
          <span>Scanner</span>
        </button>
        <button
          className={`tab ${activeTab === 'architecture' ? 'active' : ''}`}
          onClick={() => setActiveTab('architecture')}
          disabled={!architectureData}
        >
          <FiFileText />
          <span>Architecture</span>
        </button>
        <button
          className={`tab ${activeTab === 'ai-summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-summary')}
          disabled={!aiSummaryData}
        >
          <FiCpu />
          <span>AI Summary</span>
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'scanner' && (
          <Scanner
            onScanComplete={handleScanComplete}
            onAIScanComplete={handleAIScanComplete}
          />
        )}
        {activeTab === 'architecture' && architectureData && (
          <ArchitectureView data={architectureData} />
        )}
        {activeTab === 'ai-summary' && aiSummaryData && (
          <AISummary data={aiSummaryData} />
        )}
      </main>

      <footer className="footer">
        <p>
          Built with React + TypeScript • Powered by ts-morph & LLM analysis
        </p>
      </footer>
    </div>
  );
}

export default App;
