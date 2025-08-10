import { renderHook } from '@testing-library/react';
import { useDeleteNews } from '@/hooks/useDeleteNews';
import { deleteNews } from '@/api/newsApi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, waitFor } from '@testing-library/react';

// Mock del módulo newsApi
jest.mock('@/api/newsApi');

// Configuración del QueryClient
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
      cacheTime: 0,
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

describe('useDeleteNews', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockNewsId = '123';

  test('debería iniciar en estado inactivo', () => {
    const { result } = renderHook(() => useDeleteNews(), {
      wrapper: createWrapper()
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  test('debería eliminar una noticia exitosamente', async () => {
    // Mock de respuesta exitosa
    const mockResponse = { status: 200, data: {} };
    (deleteNews as jest.Mock).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useDeleteNews(), {
      wrapper: createWrapper()
    });

    await act(async () => {
      result.current.mutate(mockNewsId);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verificaciones
    expect(deleteNews).toHaveBeenCalledWith(mockNewsId);
    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toEqual(mockResponse);
  });

  test('debería manejar errores correctamente', async () => {
    // Mock de error
    const mockError = new Error('Error al eliminar la noticia');
    (deleteNews as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useDeleteNews(), {
      wrapper: createWrapper()
    });

    await act(async () => {
      result.current.mutate(mockNewsId);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error).toBe(mockError);
  });

  test('debería mostrar estado de carga durante la eliminación', async () => {
    let resolvePromise: (value: any) => void;
    const responsePromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    (deleteNews as jest.Mock).mockReturnValue(responsePromise);

    const { result } = renderHook(() => useDeleteNews(), {
      wrapper: createWrapper()
    });

    act(() => {
      result.current.mutate(mockNewsId);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    await act(async () => {
      resolvePromise!({ status: 200, data: {} });
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });

  test('debería llamar onSuccess cuando se proporciona', async () => {
    const mockResponse = { status: 200, data: {} };
    (deleteNews as jest.Mock).mockResolvedValueOnce(mockResponse);
    
    const onSuccess = jest.fn();
    const onError = jest.fn();

    const { result } = renderHook(() => useDeleteNews(), {
      wrapper: createWrapper()
    });

    await act(async () => {
      result.current.mutate(mockNewsId, {
        onSuccess,
        onError
      });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockResponse, mockNewsId, undefined);
    });
    
    expect(onError).not.toHaveBeenCalled();
  });

  test('debería llamar onError cuando falla la eliminación', async () => {
    const mockError = new Error('Error al eliminar');
    (deleteNews as jest.Mock).mockRejectedValueOnce(mockError);
    
    const onSuccess = jest.fn();
    const onError = jest.fn();
  
    const { result } = renderHook(() => useDeleteNews(), {
      wrapper: createWrapper()
    });
  
    await act(async () => {
      result.current.mutate(mockNewsId, {
        onSuccess,
        onError
      });
    });
  
    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0]).toBe(mockError); 
    });
    
    expect(onSuccess).not.toHaveBeenCalled();
  });
});