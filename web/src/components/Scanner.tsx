import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiSearch, FiCpu, FiAlertCircle } from 'react-icons/fi';
import './Scanner.css';
import ProgressBar from './ProgressBar';

interface ScannerProps {
  onScanComplete: (data: any) => void;
  onAIScanComplete: (data: any) => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScanComplete, onAIScanComplete }) => {
  const [rootPath, setRootPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState<'scan' | 'ai' | null>(null);
  const [error, setError] = useState('');
  const [aiModel, setAiModel] = useState('anthropic/claude-3-opus:latest');
  const [maxTokens, setMaxTokens] = useState(4096);

  // Simulated progress while backend works (indeterminate -> pseudo determinate)
  const intervalRef = useRef<number | null>(null);
  useEffect(() => {
    if (loading) {
      setProgress(0);
      intervalRef.current = window.setInterval(() => {
        setProgress((p) => {
          // slow down after 85% to wait for real completion
          const increment = p < 50 ? 10 : p < 75 ? 6 : p < 85 ? 3 : 0.5;
          const next = Math.min(95, p + increment);
          return next;
        });
      }, 250);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loading]);

  const handleScan = async () => {
    if (!rootPath.trim()) {
      setError('Please enter a valid path');
      return;
    }

  setMode('scan');
  setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/scan', { rootPath });
      // Finish progress
      setProgress(100);
      onScanComplete(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan workspace');
      console.error('Scan error:', err);
    } finally {
      setLoading(false);
      setTimeout(() => setMode(null), 400);
    }
  };

  const handleAIScan = async () => {
    if (!rootPath.trim()) {
      setError('Please enter a valid path');
      return;
    }

  setMode('ai');
  setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/ai-scan', {
        rootPath,
        model: aiModel,
        maxTokens,
      });
      setProgress(100);
      onAIScanComplete(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate AI summary');
      console.error('AI scan error:', err);
    } finally {
      setLoading(false);
      setTimeout(() => setMode(null), 400);
    }
  };

  return (
    <div className="scanner">
      <div className="scanner-card">
        <h2>Scan Your Codebase</h2>
        <p className="description">
          Enter the path to your project directory to analyze its architecture,
          dependencies, and structure.
        </p>

        <div className="form-group">
          <label htmlFor="rootPath">Project Root Path</label>
          <input
            id="rootPath"
            type="text"
            placeholder="e.g., /Users/username/projects/myapp or C:\Projects\myapp"
            value={rootPath}
            onChange={(e) => setRootPath(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="advanced-options">
          <h3>AI Analysis Options</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="aiModel">LLM Model</label>
              <input
                id="aiModel"
                type="text"
                placeholder="anthropic/claude-3-opus:latest"
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="maxTokens">Max Tokens</label>
              <input
                id="maxTokens"
                type="number"
                placeholder="4096"
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        )}

        <div className="button-group">
          <button
            className="btn btn-primary"
            onClick={handleScan}
            disabled={loading}
          >
            <FiSearch />
            <span>{loading ? 'Scanning...' : 'Scan Architecture'}</span>
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleAIScan}
            disabled={loading}
          >
            <FiCpu />
            <span>{loading ? 'Analyzing...' : 'AI Summary'}</span>
          </button>
        </div>

        {loading && (
          <div className="progress-container">
            <ProgressBar
              progress={progress}
              label={mode === 'scan' ? 'Analyzing architecture…' : 'Generating AI summary…'}
            />
          </div>
        )}

        <div className="info-box">
          <p>
            <strong>Note:</strong> For AI analysis, make sure your server has the
            necessary API keys configured in the <code>.env</code> file.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Scanner;
