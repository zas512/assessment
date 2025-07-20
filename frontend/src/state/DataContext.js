import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useRef,
} from "react";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const abortControllerRef = useRef(null);

  const fetchItems = useCallback(
    async (page = 1, searchQuery = "", limit = 12) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (searchQuery.trim()) {
          params.append("q", searchQuery.trim());
        }

        const res = await fetch(`http://localhost:4001/api/items?${params}`, {
          signal: abortControllerRef.current.signal,
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setItems(data.items);
        setPagination(data.pagination);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refreshItems = useCallback(() => {
    fetchItems(pagination.currentPage, "", pagination.itemsPerPage);
  }, [fetchItems, pagination.currentPage, pagination.itemsPerPage]);

  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return (
    <DataContext.Provider
      value={{
        items,
        loading,
        error,
        pagination,
        fetchItems,
        refreshItems,
        cleanup,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
