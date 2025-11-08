import React, { useState, useMemo } from 'react';
import { FiFolder, FiFile, FiPackage, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import './ArchitectureView.css';

interface ArchitectureViewProps {
  data: {
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
  };
}

const ArchitectureView: React.FC<ArchitectureViewProps> = ({ data }) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [showDependencies, setShowDependencies] = useState(true);
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();

  const filteredModules = useMemo(() => {
    if (!normalizedQuery) return data.modules;
    return data.modules.filter(m => {
      const haystack = [
        m.name,
        m.path,
        ...m.exports,
        ...m.imports,
      ].join(' ').toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery, data.modules]);

  const highlight = (text: string) => {
    if (!normalizedQuery) return text;
    const idx = text.toLowerCase().indexOf(normalizedQuery);
    if (idx === -1) return text;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + normalizedQuery.length);
    const after = text.slice(idx + normalizedQuery.length);
    return <>{before}<mark className="hl">{match}</mark>{after}</>;
  }; 

  const toggleModule = (moduleName: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleName)) {
        next.delete(moduleName);
      } else {
        next.add(moduleName);
      }
      return next;
    });
  };

  return (
    <div className="architecture-view">
      <div className="summary-cards">
        <div className="summary-card">
          <FiFolder className="card-icon" />
          <div>
            <h3>{data.totalFiles}</h3>
            <p>Total Files</p>
          </div>
        </div>
        <div className="summary-card">
          <FiFile className="card-icon" />
          <div>
            <h3>{data.entryPoints.length}</h3>
            <p>Entry Points</p>
          </div>
        </div>
        <div className="summary-card">
          <FiPackage className="card-icon" />
          <div>
            <h3>{Object.keys(data.dependencies).length}</h3>
            <p>Dependencies</p>
          </div>
        </div>
      </div>

      <div className="section">
        <h2>Project Root</h2>
        <div className="code-block">{data.rootPath}</div>
      </div>

      {data.entryPoints.length > 0 && (
        <div className="section">
          <h2>Entry Points</h2>
          <ul className="file-list">
            {data.entryPoints.map((entry, idx) => (
              <li key={idx}>
                <FiFile />
                <span>{entry}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="section">
        <div className="section-header">
          <h2>Modules ({filteredModules.length}/{data.modules.length})</h2>
          <input
            type="text"
            className="search-input"
            placeholder="Search modules, exports, imports..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="modules-list">
          {filteredModules.map((module, idx) => (
            <div key={idx} className="module-item">
              <div
                className="module-header"
                onClick={() => toggleModule(module.name)}
              >
                {expandedModules.has(module.name) ? (
                  <FiChevronDown />
                ) : (
                  <FiChevronRight />
                )}
                <FiFile />
                <span className="module-name">{highlight(module.name)}</span>
                <span className="module-path">{highlight(module.path)}</span>
              </div>
              {expandedModules.has(module.name) && (
                <div className="module-details">
                  {module.exports.length > 0 && (
                    <div className="detail-section">
                      <h4>Exports ({module.exports.length})</h4>
                      <ul>
                        {module.exports.map((exp, i) => (
                          <li key={i}>{highlight(exp)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {module.imports.length > 0 && (
                    <div className="detail-section">
                      <h4>Imports ({module.imports.length})</h4>
                      <ul>
                        {module.imports.map((imp, i) => (
                          <li key={i}>{highlight(imp)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {Object.keys(data.dependencies).length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2>Dependencies</h2>
            <button
              className="toggle-btn"
              onClick={() => setShowDependencies(!showDependencies)}
            >
              {showDependencies ? 'Hide' : 'Show'}
            </button>
          </div>
          {showDependencies && (
            <div className="dependencies-grid">
              {Object.entries(data.dependencies).map(([name, version]) => (
                <div key={name} className="dependency-item">
                  <FiPackage />
                  <div>
                    <div className="dep-name">{name}</div>
                    <div className="dep-version">{version}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArchitectureView;
