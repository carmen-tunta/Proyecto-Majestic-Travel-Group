import React from 'react';

export function Grid12({ className = '', style, children }) {
  return (
    <div className={`grid grid-12 ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}

export function Span({ n = 1, className = '', style, children }) {
  const cls = `span-${n}`;
  return (
    <div className={`${cls} ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}