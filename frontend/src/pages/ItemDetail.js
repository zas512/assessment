import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Tag, DollarSign, Loader, Edit } from 'lucide-react';
import './ItemDetail.css';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', category: '', price: '' });
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);

    fetch(`http://localhost:4001/api/items/${id}`, {
      signal: abortControllerRef.current.signal
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setItem(data);
        setEditForm({ name: data.name, category: data.category, price: data.price });
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({ name: item.name, category: item.category, price: item.price });
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`http://localhost:4001/api/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          category: editForm.category,
          price: parseFloat(editForm.price)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      const updatedItem = await response.json();
      setItem(updatedItem);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="detail-container">
        <div className="loading-state">
          <Loader className="loading-spinner" size={48} />
          <h2>Loading item details...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-container">
        <div className="error-state">
          <h2>Error Loading Item</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => navigate('/')} className="btn btn-secondary">
              <ArrowLeft size={16} />
              Back to Items
            </button>
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="detail-container">
        <div className="error-state">
          <h2>Item Not Found</h2>
          <p>The item you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            <ArrowLeft size={16} />
            Back to Items
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <div className="detail-header">
        <button onClick={() => navigate('/')} className="back-btn">
          <ArrowLeft size={20} />
          Back to Items
        </button>
      </div>

      <div className="detail-content">
        <div className="item-detail-card">
          <div className="item-detail-header">
            <div className="item-icon-large">
              <Package size={32} />
            </div>
            <div className="item-info">
              <h1 className="item-title">{item.name}</h1>
              <div className="item-meta">
                <span className="item-id">ID: {item.id}</span>
              </div>
            </div>
          </div>

          {isEditing ? (
            <div className="edit-form">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Category:</label>
                <input
                  type="text"
                  name="category"
                  value={editForm.category}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Price:</label>
                <input
                  type="number"
                  name="price"
                  value={editForm.price}
                  onChange={handleInputChange}
                  className="form-input"
                  step="0.01"
                />
              </div>
              <div className="edit-actions">
                <button onClick={handleSaveEdit} className="btn btn-primary">
                  Save Changes
                </button>
                <button onClick={handleCancelEdit} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="item-details-grid">
                <div className="detail-item">
                  <div className="detail-label">
                    <Tag size={20} />
                    <span>Category</span>
                  </div>
                  <div className="detail-value">{item.category}</div>
                </div>

                <div className="detail-item">
                  <div className="detail-label">
                    <DollarSign size={20} />
                    <span>Price</span>
                  </div>
                  <div className="detail-value price">${item.price.toLocaleString()}</div>
                </div>
              </div>

              <div className="item-actions">
                <button onClick={handleEdit} className="btn btn-primary">
                  <Edit size={16} />
                  Edit Item
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;