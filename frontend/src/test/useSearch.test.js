import { renderHook, act } from '@testing-library/react';
import useSearch from '../hooks/useSearch';

describe('useSearch', () => {
  it('realiza búsqueda correctamente', async () => {
    const searchApiFn = jest.fn(async (q) => [{ name: q }]);
    const { result } = renderHook(() => useSearch(searchApiFn));
    await act(async () => {
      await result.current.setSearch('ejemplo');
    });
    expect(result.current.results).toEqual([{ name: 'ejemplo' }]);
  });

  it('no busca si el input está vacío', async () => {
    const searchApiFn = jest.fn();
    const { result } = renderHook(() => useSearch(searchApiFn));
    await act(async () => {
      await result.current.setSearch('');
    });
    expect(searchApiFn).not.toHaveBeenCalled();
    expect(result.current.results).toEqual([]);
  });
});
