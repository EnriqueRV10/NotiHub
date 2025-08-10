import { renderHook } from '@testing-library/react';
import { useNewsCounters } from '@/hooks/useNewsCounters';
import { fetchNewsCounters } from '@/api/newsApi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';

// Mock del módulo newsApi
jest.mock('@/api/newsApi');

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

describe('useNewsCounters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCountersData = {
    published: 10,
    draft: 5,
    due: 2
  };

  test('debería obtener contadores', async () => {
    (fetchNewsCounters as jest.Mock).mockResolvedValueOnce(mockCountersData);

    const { result } = renderHook(() => useNewsCounters({}), {
      wrapper: createWrapper()
    });

    // Verificar estado inicial de carga
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Esperar a que los datos se carguen
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verificar que fetchNewsCounters fue llamado con los parámetros por defecto
    expect(fetchNewsCounters).toHaveBeenCalledWith({
      status: 1,
      subordinates: 'all'
    });

    // Verificar los datos
    expect(result.current.data).toEqual(mockCountersData);
    expect(result.current.isError).toBe(false);
  });

  test('debería manejar errores correctamente', async () => {
    const mockError = new Error('Error al obtener contadores');
    (fetchNewsCounters as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useNewsCounters({}), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(mockError);
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  test('debería actualizar datos cuando cambian los parámetros', async () => {
    const initialData = { published: 5, draft: 2, due: 1 };
    (fetchNewsCounters as jest.Mock).mockResolvedValueOnce(initialData);

    const { result, rerender } = renderHook(
      (props) => useNewsCounters(props), 
      {
        wrapper: createWrapper(),
        initialProps: { status: 1 }
      }
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(initialData);
    });

    const newData = { published: 8, draft: 3, due: 2 };
    (fetchNewsCounters as jest.Mock).mockResolvedValueOnce(newData);

    // Rerenderizar con nuevos props
    rerender({ status: 2 });

    await waitFor(() => {
      expect(result.current.data).toEqual(newData);
    });

    expect(fetchNewsCounters).toHaveBeenCalledTimes(2);
  });

  test('debería manejar el estado de carga correctamente', async () => {
    let resolvePromise: (value: any) => void;
    const loadingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (fetchNewsCounters as jest.Mock).mockReturnValueOnce(loadingPromise);

    const { result } = renderHook(() => useNewsCounters({}), {
      wrapper: createWrapper()
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isFetching).toBe(true);

    resolvePromise!(mockCountersData);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isFetching).toBe(false);
    });

    expect(result.current.data).toEqual(mockCountersData);
  });
});