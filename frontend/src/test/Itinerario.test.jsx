import { render, screen, fireEvent } from '@testing-library/react';
import Itinerario from '../sections/Itinerario/components/Itinerario';
import { ModalProvider } from '../contexts/ModalContext';

jest.mock('../services/apiService', () => ({
  apiService: {
    universalSearch: jest.fn(async () => [])
  }
}));

describe('Itinerario', () => {
  it('renderiza el título de la sección', async () => {
    render(
      <ModalProvider>
        <Itinerario />
      </ModalProvider>
    );
    expect(await screen.findByText(/Plantilla Itineraria/i)).toBeInTheDocument();
  });

  it('muestra mensaje vacío si no hay resultados', async () => {
    render(
      <ModalProvider>
        <Itinerario />
      </ModalProvider>
    );
    expect(await screen.findByText(/No se encontraron plantillas/i)).toBeInTheDocument();
  });

});
