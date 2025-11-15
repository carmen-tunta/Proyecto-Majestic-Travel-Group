import React from 'react';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';

const ReportesHome = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 20 }}>
      <h2>Reportes</h2>
      <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
        <Button
          label="Bandeja de solicitud"
          icon="pi pi-inbox"
          outlined
          onClick={() => navigate('/reportes/bandeja-solicitud')}
        />
        <Button
          label="Cotización"
          icon="pi pi-money-bill"
          outlined
          onClick={() => navigate('/reportes/cotizacion')}
        />
      </div>
    </div>
  );
};

export default ReportesHome;
