import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useData } from "../state/DataContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  DollarSign,
  Tag,
} from "lucide-react";
import "./Items.css";

const ItemCard = React.memo(({ item }) => {
  return (
    <div className="item-card">
      <div className="item-header">
        <Package className="item-icon" size={20} />
        <div className="item-info">
          <h3 className="item-name">{item.name}</h3>
          <div className="item-category">
            <Tag size={14} />
            <span>{item.category}</span>
          </div>
          <div className="item-price">${item.price.toLocaleString()}</div>
        </div>
      </div>
      <div className="item-actions">
        <Link to={`/items/${item.id}`} className="item-link">
          View Details →
        </Link>
      </div>
    </div>
  );
});

const SearchBar = ({ onSearch, loading }) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleInputChange = useCallback((e) => {
    setQuery(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Backspace") {
      e.stopPropagation();
    }
  }, []);

  const handleClearSearch = useCallback(() => {
    setQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <Search className="search-icon" size={20} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search items by name or category..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="search-input"
          disabled={loading}
          autoComplete="off"
          spellCheck="false"
        />
        {query && (
          <button
            onClick={handleClearSearch}
            className="clear-search-btn"
            type="button"
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

const Pagination = ({ pagination, onPageChange, loading }) => {
  const { currentPage, totalPages, hasNextPage, hasPrevPage } = pagination;

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage || loading}
        className="pagination-btn"
      >
        <ChevronLeft size={16} />
        Previous
      </button>

      <div className="page-info">
        Page {currentPage} of {totalPages}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage || loading}
        className="pagination-btn"
      >
        Next
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="loading-skeleton">
    <div className="skeleton-grid">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="skeleton-item">
          <div className="skeleton-header">
            <div className="skeleton-icon"></div>
            <div>
              <div className="skeleton-title"></div>
              <div className="skeleton-category"></div>
              <div className="skeleton-price"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

function Items() {
  const { items, loading, error, pagination, fetchItems, cleanup } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchItems(currentPage, searchQuery);
    return () => {
      cleanup();
    };
  }, [currentPage, searchQuery, fetchItems, cleanup]);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const memoizedSearchBar = useMemo(
    () => <SearchBar onSearch={handleSearch} loading={loading} />,
    [handleSearch, loading]
  );

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Error Loading Items</h2>
          <p>{error}</p>
          <button
            onClick={() => fetchItems(currentPage, searchQuery)}
            className="retry-btn"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="items-container">
      <div className="items-header">
        <h1>Items Catalog</h1>
        <p>Browse and search through our collection of items</p>
      </div>
      {memoizedSearchBar}
      <div className="items-content">
        {loading && items.length === 0 ? (
          <LoadingSkeleton />
        ) : items.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <h3>No items found</h3>
            <p>Try adjusting your search criteria</p>
          </div>
        ) : (
          <>
            <div className="items-list">
              <div className="items-grid">
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>

            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
              loading={loading}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Items;
