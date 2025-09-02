import React from 'react';
import { Button } from 'primereact/button';

const Componentes = () => {
  return (
    <div className="p-4">
      {/* Header con título y botón Nuevo */}
      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800 m-0">
          Componentes
        </h1>
        <Button 
          label="+ Nuevo" 
          icon="pi pi-plus" 
          className="p-button-outlined"
          style={{ borderColor: '#3B82F6', color: '#3B82F6' }}
        />
      </div>

      {/* Contenido principal */}
      <div className="bg-white border-round shadow-1">
        <p className="text-center text-gray-500 p-4">
          Aquí irá la tabla de componentes
        </p>
      </div>
    </div>
  );
};

export default Componentes;
