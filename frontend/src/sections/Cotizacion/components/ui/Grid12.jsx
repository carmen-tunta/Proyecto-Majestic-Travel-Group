import React from 'react';
import '../../styles/Grid12.css';

export function Grid12({ className = '', style, children }) {
  return (
    <div className={`grid grid-12 ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}

export function Grid6({ className = '', style, children }) {
  return (
    <div className={`grid grid-6 ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}

export function Grid4({ className = '', style, children }) {
  return (
    <div className={`grid grid-4 ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}

export function Grid3({ className = '', style, children }) {
  return (
    <div className={`grid grid-3 ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}

export function Grid2({ className = '', style, children }) {
  return (
    <div className={`grid grid-2 ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}

export function GridResponsive({ className = '', style, children }) {
  return (
    <div className={`grid-responsive ${className}`.trim()} style={style}>
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