import { useState, useEffect } from 'react';

const useDataSearch = (initialData = [], filterFunction) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    if (Array.isArray(initialData) && typeof filterFunction === 'function') {
      const results = initialData.filter((item) =>
        filterFunction(item, searchTerm)
      );
      setFilteredData(results);
    }
  }, [searchTerm, initialData, filterFunction]);

  return { searchTerm, setSearchTerm, filteredData };
};

export default useDataSearch;
