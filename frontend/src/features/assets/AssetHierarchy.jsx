import React, { useState, useEffect } from 'react';

// --- Recursive Tree Node Component ---
const TreeNode = ({ node, onSelect, selectedId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    onSelect(node);
  };

  return (
    <div className="tree-node-container">
      <div 
        className={`tree-node ${isSelected ? 'selected' : ''}`} 
        onClick={handleSelect}
      >
        <span 
          className="tree-toggle" 
          onClick={hasChildren ? handleToggle : undefined}
          style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
        >
          {isExpanded ? '▼' : '▶'}
        </span>
        <span className="tree-icon">{hasChildren ? '📁' : '⚙️'}</span>
        <span className="tree-label">{node.name}</span>
        {node.status && (
          <span className={`tree-status-dot ${node.status.toLowerCase()}`} title={node.status}></span>
        )}
      </div>
      
      {/* Recursive call for children */}
      {isExpanded && hasChildren && (
        <div className="tree-children">
          {node.children.map(child => (
            <TreeNode 
              key={child.id} 
              node={child} 
              onSelect={onSelect} 
              selectedId={selectedId} 
            />
          ))}
        </div>
      )}
    </div>
  );
};


// --- Main Asset Hierarchy Page ---
const AssetHierarchy = () => {
  const [assetTree, setAssetTree] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock Data: A highly nested chemical plant structure
  useEffect(() => {
    setTimeout(() => {
      setAssetTree([
        {
          id: 'PLANT-01', name: 'Main Polymerization Plant', type: 'Facility', status: 'Operational',
          children: [
            {
              id: 'UNIT-A', name: 'Reactor Train A', type: 'Unit', status: 'Operational',
              children: [
                {
                  id: 'RX-101', name: 'Primary Reactor', type: 'Equipment', status: 'Operational', manufacturer: 'ChemVessels Inc.', installDate: '2015-06-01',
                  children: [
                    { id: 'AG-101', name: 'Agitator Assembly', type: 'Sub-Assembly', status: 'Warning', lastMaintained: '2025-11-10' },
                    { id: 'V-101-A', name: 'Inlet Valve', type: 'Component', status: 'Operational', lastMaintained: '2026-01-15' }
                  ]
                },
                {
                  id: 'P-201', name: 'Feed Pump', type: 'Equipment', status: 'Offline', manufacturer: 'FlowMaster', installDate: '2018-03-12',
                  children: [
                    { id: 'M-201', name: 'Pump Motor (480V)', type: 'Component', status: 'Offline', lastMaintained: '2026-04-10' }
                  ]
                }
              ]
            },
            {
              id: 'UNIT-B', name: 'Recovery Train B', type: 'Unit', status: 'Operational',
              children: []
            }
          ]
        }
      ]);
      setIsLoading(false);
    }, 400);
  }, []);

  return (
    <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', paddingBottom: 0 }}>
      <header className="dashboard-header">
        <h1>Asset Hierarchy</h1>
        <p className="date-display">Navigate plant equipment, view Bills of Materials, and track asset health.</p>
      </header>

      <div className="asset-layout">
        {/* Left Pane: The Interactive Tree */}
        <div className="asset-tree-panel action-panel">
          <h3>Equipment Explorer</h3>
          <div className="tree-scroll-area">
            {isLoading ? <p>Loading asset structure...</p> : 
              assetTree.map(rootNode => (
                <TreeNode 
                  key={rootNode.id} 
                  node={rootNode} 
                  onSelect={setSelectedAsset} 
                  selectedId={selectedAsset?.id} 
                />
              ))
            }
          </div>
        </div>

        {/* Right Pane: Asset Details */}
        <div className="asset-details-panel action-panel">
          {selectedAsset ? (
            <div className="details-content">
              <div className="details-header">
                <h2>{selectedAsset.name}</h2>
                <span className={`badge ${selectedAsset.status === 'Operational' ? 'permit' : selectedAsset.status === 'Warning' ? 'medium' : 'urgent'}`}>
                  {selectedAsset.status}
                </span>
              </div>
              
              <div className="details-grid">
                <div className="detail-item">
                  <label>Asset ID</label>
                  <p>{selectedAsset.id}</p>
                </div>
                <div className="detail-item">
                  <label>Asset Type</label>
                  <p>{selectedAsset.type}</p>
                </div>
                {selectedAsset.manufacturer && (
                  <div className="detail-item">
                    <label>Manufacturer</label>
                    <p>{selectedAsset.manufacturer}</p>
                  </div>
                )}
                {selectedAsset.installDate && (
                  <div className="detail-item">
                    <label>Install Date</label>
                    <p>{selectedAsset.installDate}</p>
                  </div>
                )}
                {selectedAsset.lastMaintained && (
                  <div className="detail-item">
                    <label>Last Maintained</label>
                    <p>{selectedAsset.lastMaintained}</p>
                  </div>
                )}
              </div>

              <div className="details-actions">
                <button className="btn-primary">Create Work Order</button>
                <button className="btn-secondary">View History</button>
                <button className="btn-secondary">View BOM</button>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>Select an asset from the tree to view its details, hierarchy, and maintenance history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetHierarchy;