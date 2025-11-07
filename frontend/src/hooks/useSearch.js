import { useState } from 'react';

/**
 * Hook para buscar en el backend usando un callback asíncrono.
 * @param {Function} searchApiFn - Función asíncrona que recibe el texto y retorna los resultados.
 */

/**
 * Hook para buscar en el backend usando un callback asíncrono.
 * Si el input es vacío o solo espacios, vuelve a mostrar todos los datos originales (fetchAll opcional).
 * @param {Function} searchApiFn - Función asíncrona que recibe el texto y retorna los resultados.
 * @param {Function} [fetchAll] - Función opcional para traer todos los datos si el input está vacío.
 */
const useSearch = (searchApiFn, fetchAll) => {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (value) => {
        setSearch(value);
        const cleanValue = value.trim();
        if (!value || cleanValue === '') {
            if (fetchAll) {
                setLoading(true);
                try {
                    const all = await fetchAll();
                    // Asegurar que all es un array
                    setResults(Array.isArray(all) ? all : (all.data || []));
                } catch (err) {
                    setResults([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
            }
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await searchApiFn(cleanValue);
            // Asegurar que res es un array
            setResults(Array.isArray(res) ? res : []);
        } catch (err) {
            setError(err.message || 'Error al buscar');
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    return { search, setSearch: handleSearch, results, loading, error };
};

export default useSearch;
