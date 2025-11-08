import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  progress?: number; // 0-100, if undefined -> indeterminate
  label?: string;
  small?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label, small }) => {
  const isIndeterminate = progress === undefined;
  return (
    <div className={`progress-wrapper ${small ? 'small' : ''}`}>      
      {label && <div className="progress-label">{label}</div>}
      <div className={`progress-bar ${isIndeterminate ? 'indeterminate' : ''}`}>        
        {!isIndeterminate && (
          <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, progress!))}%` }} />
        )}
        {isIndeterminate && <div className="indeterminate-fill" />}
      </div>
    </div>
  );
};

export default ProgressBar;
