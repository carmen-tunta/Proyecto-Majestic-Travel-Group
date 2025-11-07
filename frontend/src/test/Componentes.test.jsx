import { render, screen, fireEvent } from '@testing-library/react';
import Componentes from '../sections/Componentes/components/Componentes';
import { ModalProvider } from '../contexts/ModalContext';

jest.mock('../services/apiService', () => ({
  apiService: {
    universalSearch: jest.fn(async () => [])
  }
}));

describe('Componentes', () => {
  it('renderiza el título de la sección', async () => {
    render(
      <ModalProvider>
        <Componentes />
      </ModalProvider>
    );
    expect(await screen.findByText(/Componentes/i)).toBeInTheDocument();
  });

  it('muestra mensaje si no hay resultados', async () => {
    render(
      <ModalProvider>
        <Componentes />
      </ModalProvider>
    );
    expect(await screen.findByText(/No se encontraron componentes/i)).toBeInTheDocument();
  });

  it('muestra el botón Nuevo y permite hacer click', async () => {
    render(
      <ModalProvider>
        <Componentes />
      </ModalProvider>
    );
    const btn = await screen.findByRole('button', { name: /Nuevo/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
  });
});
