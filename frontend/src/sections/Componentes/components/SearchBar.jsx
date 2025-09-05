import React from 'react';

const SearchBar = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder || "Buscar"}
    style={{ marginBottom: '1rem', width: '100%', padding: '0.5rem' }}
  />
);

export default SearchBar;
