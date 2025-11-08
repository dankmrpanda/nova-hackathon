import React from 'react';
import { FiCpu, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import './AISummary.css';

interface AISummaryProps {
  data: {
    summary?: string;
    model?: string;
    provider?: string;
    timestamp?: string;
    error?: string;
  };
}

const AISummary: React.FC<AISummaryProps> = ({ data }) => {
  const hasError = !!data.error;

  return (
    <div className="ai-summary">
      <div className="ai-header">
        <div className="ai-icon-wrapper">
          <FiCpu className="ai-icon" />
        </div>
        <div>
          <h2>AI-Generated Architecture Summary</h2>
          {data.provider && data.model && (
            <p className="ai-meta">
              Generated using <strong>{data.provider}</strong> ({data.model})
            </p>
          )}
          {data.timestamp && (
            <p className="ai-meta">
              {new Date(data.timestamp).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {hasError ? (
        <div className="message-box error">
          <FiAlertCircle className="message-icon" />
          <div>
            <h3>Analysis Failed</h3>
            <p>{data.error}</p>
          </div>
        </div>
      ) : data.summary ? (
        <>
          <div className="message-box success">
            <FiCheckCircle className="message-icon" />
            <div>
              <h3>Analysis Complete</h3>
              <p>The AI has successfully analyzed your codebase architecture.</p>
            </div>
          </div>

          <div className="summary-content">
            <div className="summary-text">
              {data.summary.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="message-box">
          <FiAlertCircle className="message-icon" />
          <div>
            <h3>No Summary Available</h3>
            <p>The AI analysis did not return a summary.</p>
          </div>
        </div>
      )}

      <div className="ai-disclaimer">
        <p>
          <strong>Note:</strong> AI-generated summaries are based on code
          structure and metadata. They may not capture all nuances of your
          architecture. Always review critical insights manually.
        </p>
      </div>
    </div>
  );
};

export default AISummary;
