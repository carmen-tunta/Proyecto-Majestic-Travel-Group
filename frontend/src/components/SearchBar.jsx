import React from 'react';
import { InputText } from 'primereact/inputtext';

const SearchBar = ({ value, onChange, placeholder, disabled = false }) => (
  <div className="p-input-icon-left">
    <i className="pi pi-search"/>
    <InputText
      disabled={disabled}
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || "Buscar"}
      style={{width: '100%'}}
    />
  </div>
);

export default SearchBar;
