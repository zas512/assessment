import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useData } from "../state/DataContext";
import { Link } from "react-router-dom";
import { FixedSizeList as List } from "react-window";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  DollarSign,
  Tag,
} from "lucide-react";
import "./Items.css";

// Item row component for virtualization
const ItemRow = React.memo(({ index, style, data }) => {
  const item = data[index];
  if (!item) return null;

  return (
    <div style={style} className="item-row">
      <div className="item-card">
        <div className="item-header">
          <Package className="item-icon" size={20} />
          <h3 className="item-name">{item.name}</h3>
        </div>
        <div className="item-details">
          <div className="item-category">
            <Tag size={16} />
            <span>{item.category}</span>
          </div>
          <div className="item-price">
            <DollarSign size={16} />
            <span>${item.price.toLocaleString()}</span>
          </div>
        </div>
        <Link to={`/items/${item.id}`} className="item-link">
          View Details →
        </Link>
      </div>
    </div>
  );
});

// Search component
const SearchBar = ({ onSearch, loading }) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  // Handle input change with better focus management
  const handleInputChange = useCallback((e) => {
    setQuery(e.target.value);
  }, []);

  // Handle keydown to prevent focus loss on backspace
  const handleKeyDown = useCallback((e) => {
    // Prevent default behavior for backspace to maintain focus
    if (e.key === "Backspace") {
      e.stopPropagation();
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
      </div>
    </div>
  );
};

// Pagination component
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

// Loading skeleton
const LoadingSkeleton = () => (
  <div className="loading-skeleton">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="skeleton-item">
        <div className="skeleton-header">
          <div className="skeleton-icon"></div>
          <div className="skeleton-title"></div>
        </div>
        <div className="skeleton-details">
          <div className="skeleton-text"></div>
          <div className="skeleton-text"></div>
        </div>
      </div>
    ))}
  </div>
);

function Items() {
  const { items, loading, error, pagination, fetchItems, cleanup } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch items on mount and when search/page changes
  useEffect(() => {
    fetchItems(currentPage, searchQuery);

    // Cleanup function to prevent memory leaks
    return () => {
      cleanup();
    };
  }, [currentPage, searchQuery, fetchItems, cleanup]);

  // Handle search with memoization to prevent unnecessary re-renders
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  // Handle page change with memoization
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Memoize SearchBar to prevent re-renders that cause focus loss
  const memoizedSearchBar = useMemo(
    () => <SearchBar onSearch={handleSearch} loading={loading} />,
    [handleSearch, loading]
  );

  // Memoize list data for virtualization
  const listData = useMemo(() => items, [items]);

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
              <List
                height={600}
                itemCount={items.length}
                itemSize={120}
                itemData={listData}
                width="100%"
              >
                {ItemRow}
              </List>
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
