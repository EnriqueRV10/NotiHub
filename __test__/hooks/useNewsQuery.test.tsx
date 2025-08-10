import { renderHook } from '@testing-library/react';
import { fetchNews } from '@/api/newsApi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import { useNewsQuery } from '@/hooks/useNewsQuery';

// Mock del módulo newsApi
jest.mock('@/api/newsApi');

// Configuración del QueryClient para pruebas
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0
    },
  },
  logger: {
    log: console.log,
    warn: console.warn,
    error: () => {},
  }
});

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useNewsQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Datos mock para las pruebas
  const mockNewsData = {
    results: [
      {
        key: '1',
        title: 'Noticia 1',
        author: 'Autor 1',
        start: '2024-01-01',
        end: '2024-12-31',
        status: '1',
        stats: 5
      },
      {
        key: '2',
        title: 'Noticia 2',
        author: 'Autor 2',
        start: '2024-02-01',
        end: '2024-12-31',
        status: '2',
        stats: 3
      }
    ],
    total: 2,
    currentPage: 1,
    pageSize: 10
  };

  test('debería obtener noticias con parámetros por defecto', async () => {
    (fetchNews as jest.Mock).mockResolvedValueOnce(mockNewsData);

    const { result } = renderHook(() => useNewsQuery({
      page: 1,
      pageSize: 10
    }), {
      wrapper: createWrapper()
    });

    // Verificar estado inicial
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verificar que se llamó con los parámetros correctos
    expect(fetchNews).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      status: 1,
      subordinates: 'all'
    });

    // Verificar datos
    expect(result.current.data).toEqual(mockNewsData);
    expect(result.current.isError).toBe(false);
  });

  test('debería filtrar noticias por status', async () => {
    (fetchNews as jest.Mock).mockResolvedValueOnce({
      ...mockNewsData,
      results: [mockNewsData.results[0]]
    });

    const { result } = renderHook(() => useNewsQuery({
      page: 1,
      pageSize: 10,
      publish_status: 1
    }), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchNews).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      status: 1,
      publish_status: 1,
      subordinates: 'all'
    });
  });

  test('debería buscar noticias por texto', async () => {
    (fetchNews as jest.Mock).mockResolvedValueOnce(mockNewsData);

    const searchText = 'noticia test';

    const { result } = renderHook(() => useNewsQuery({
      page: 1,
      pageSize: 10,
      search: searchText
    }), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchNews).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      status: 1,
      search: searchText,
      subordinates: 'all'
    });
  });

  test('debería manejar errores correctamente', async () => {
    const mockError = new Error('Error al obtener noticias');
    (fetchNews as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useNewsQuery({
      page: 1,
      pageSize: 10
    }), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(mockError);
    expect(result.current.data).toBeUndefined();
  });

  test('debería manejar paginación correctamente', async () => {
    const page2Data = {
      ...mockNewsData,
      currentPage: 2,
      results: [
        {
          key: '3',
          title: 'Noticia 3',
          author: 'Autor 3',
          start: '2024-03-01',
          end: '2024-12-31',
          status: '1',
          stats: 2
        }
      ]
    };

    (fetchNews as jest.Mock).mockResolvedValueOnce(page2Data);

    const { result } = renderHook(() => useNewsQuery({
      page: 2,
      pageSize: 10
    }), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchNews).toHaveBeenCalledWith({
      page: 2,
      pageSize: 10,
      status: 1,
      subordinates: 'all'
    });

    expect(result.current.data?.currentPage).toBe(2);
  });

  test('debería refrescar los datos cuando cambian los parámetros', async () => {
    // Primera llamada
    (fetchNews as jest.Mock).mockResolvedValueOnce(mockNewsData);

    const { result, rerender } = renderHook(
      (props) => useNewsQuery(props), 
      {
        wrapper: createWrapper(),
        initialProps: {
          page: 1,
          pageSize: 10
        }
      }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockNewsData);
    });

    // Segunda llamada con diferentes parámetros
    const newData = {
      ...mockNewsData,
      results: [mockNewsData.results[0]]
    };
    (fetchNews as jest.Mock).mockResolvedValueOnce(newData);

    rerender({
      page: 1,
      pageSize: 10,
      publish_status: 2
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(newData);
    });

    expect(fetchNews).toHaveBeenCalledTimes(2);
  });
});