import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Items from './Items';
import ItemDetail from './ItemDetail';
import { DataProvider } from '../state/DataContext';
import { Package, BarChart3 } from 'lucide-react';
import './App.css';

function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <Package size={24} />
          <span>Item Catalog</span>
        </Link>
        
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            <Package size={20} />
            <span>Items</span>
          </Link>
          <Link 
            to="/stats" 
            className={`nav-link ${location.pathname === '/stats' ? 'active' : ''}`}
          >
            <BarChart3 size={20} />
            <span>Stats</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <DataProvider>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Items />} />
            <Route path="/items/:id" element={<ItemDetail />} />
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
        </main>
      </div>
    </DataProvider>
  );
}

// Stats page component
function StatsPage() {
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    fetch('http://localhost:4001/api/stats')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
      })
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="stats-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h2>Loading statistics...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-container">
        <div className="error-state">
          <h2>Error Loading Stats</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-container">
      <div className="stats-header">
        <h1>Catalog Statistics</h1>
        <p>Overview of our item collection</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Package size={32} />
          </div>
          <div className="stat-content">
            <h3>Total Items</h3>
            <p className="stat-value">{stats?.total || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <BarChart3 size={32} />
          </div>
          <div className="stat-content">
            <h3>Average Price</h3>
            <p className="stat-value">${stats?.averagePrice?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        {stats?.priceRange && (
          <div className="stat-card">
            <div className="stat-icon">
              <BarChart3 size={32} />
            </div>
            <div className="stat-content">
              <h3>Price Range</h3>
              <p className="stat-value">
                ${stats.priceRange.min} - ${stats.priceRange.max}
              </p>
            </div>
          </div>
        )}

        {stats?.categories && (
          <div className="stat-card wide">
            <div className="stat-icon">
              <Package size={32} />
            </div>
            <div className="stat-content">
              <h3>Categories</h3>
              <div className="categories-list">
                {Object.entries(stats.categories).map(([category, count]) => (
                  <div key={category} className="category-item">
                    <span className="category-name">{category}</span>
                    <span className="category-count">{count} items</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;