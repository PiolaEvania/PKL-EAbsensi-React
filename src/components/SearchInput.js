import React from 'react';
import Icon from './Icon.js';

const SearchInput = ({ searchTerm, onSearchChange, placeholder }) => {
  return (
    <div className="input-group mb-4">
      <span className="input-group-text">
        <Icon name="search" />
      </span>
      <input
        type="text"
        className="form-control"
        placeholder={placeholder || 'Cari...'}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default SearchInput;
