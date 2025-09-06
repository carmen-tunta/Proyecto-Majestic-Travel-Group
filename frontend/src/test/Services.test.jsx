import { render, screen, fireEvent } from '@testing-library/react';
import Services from '../sections/Services/components/Services';
import { ModalProvider } from '../contexts/ModalContext';

jest.mock('../services/apiService', () => ({
  apiService: {
    universalSearch: jest.fn(async () => [])
  }
}));

describe('Services', () => {
  it('renderiza el título de la sección', async () => {
    render(
      <ModalProvider>
        <Services />
      </ModalProvider>
    );
    expect(await screen.findByText(/Servicios/i)).toBeInTheDocument();
  });

  it('muestra mensaje vacío si no hay resultados', async () => {
    render(
      <ModalProvider>
        <Services />
      </ModalProvider>
    );
    expect(await screen.findByText(/No se encontraron servicios/i)).toBeInTheDocument();
  });

});
