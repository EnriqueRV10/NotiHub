import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTestAssignment } from '@/hooks/useTestAssignment';
import { testAssignment } from '@/api/newsApi';

// Mock del módulo newsApi
jest.mock('@/api/newsApi', () => ({
  testAssignment: jest.fn(),
}));

// Datos de ejemplo
const mockSuccessResponse = {
  count: 5,
  examples: ['User 1', 'User 2', 'User 3']
};

const mockTestPayload = {
  filter: {
    rules: [
      { field: 'code', operator: '=', value: 'TEST1' }
    ],
    id: '1',
    combinator: 'and'
  },
  exclude: {
    rules: [],
    id: '2',
    combinator: 'and'
  }
};

describe('useTestAssignment', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('debe realizar una mutación exitosa', async () => {
    // Simular una respuesta exitosa
    (testAssignment as jest.Mock).mockResolvedValueOnce(mockSuccessResponse);

    // Renderizar el hook
    const { result } = renderHook(() => useTestAssignment(), {
      wrapper,
    });

    // Ejecutar la mutación
    result.current.mutate(mockTestPayload);

    // Esperar a que la mutación se complete y verificar resultados
    await waitFor(() => {
      expect(testAssignment).toHaveBeenCalledWith(mockTestPayload);
      expect(result.current.data).toEqual(mockSuccessResponse);
      expect(result.current.error).toBeNull();
    });
  });

  it('debe manejar errores correctamente', async () => {
    // Configurar el mock para simular un error
    const mockError = new Error('Error testing assignment');
    (testAssignment as jest.Mock).mockRejectedValueOnce(mockError);

    // Renderizar el hook
    const { result } = renderHook(() => useTestAssignment(), {
      wrapper,
    });

    // Ejecutar la mutación
    result.current.mutate(mockTestPayload);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBeTruthy();
    });
  });

  it('debe manejar múltiples mutaciones secuenciales', async () => {
    (testAssignment as jest.Mock)
      .mockResolvedValueOnce({ ...mockSuccessResponse, count: 5 })
      .mockResolvedValueOnce({ ...mockSuccessResponse, count: 3 });

    // Renderizar el hook
    const { result } = renderHook(() => useTestAssignment(), {
      wrapper,
    });

    result.current.mutate(mockTestPayload);

    await waitFor(() => {
      expect(result.current.data?.count).toBe(5);
    });

    const secondPayload = {
      ...mockTestPayload,
      filter: {
        ...mockTestPayload.filter,
        rules: [{ field: 'code', operator: '=', value: 'TEST2' }]
      }
    };

    result.current.mutate(secondPayload);

    // Esperar y verificar segunda respuesta
    await waitFor(() => {
      expect(result.current.data?.count).toBe(3);
      expect(testAssignment).toHaveBeenCalledTimes(2);
    });
  });
});