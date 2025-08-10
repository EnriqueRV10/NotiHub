import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdateNews } from '@/hooks/useUpdateNews';
import { updateNews } from '@/api/newsApi';

jest.mock('@/api/newsApi', () => ({
  updateNews: jest.fn(),
}));

const mockId = '123';

const mockUpdatePayload = {
  title: 'Noticia Actualizada',
  intro: 'Nueva introducción',
  body: 'Nuevo contenido',
  start: '2024-01-01T00:00:00Z',
  end: '2024-02-01T00:00:00Z',
  publish_status: 1,
  employee_assignment_policy: {
    filter: {},
    exclude: {}
  },
  attachements: []
};

const mockSuccessResponse = {
  id: mockId,
  ...mockUpdatePayload,
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
  author: 'Test User'
};

describe('useUpdateNews', () => {
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

  it('debe actualizar una noticia exitosamente', async () => {
    // Configurar el mock para simular una actualización exitosa
    (updateNews as jest.Mock).mockResolvedValueOnce(mockSuccessResponse);

    // Renderizar el hook
    const { result } = renderHook(() => useUpdateNews(mockId), {
      wrapper,
    });

    // Verificar estado inicial
    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);

    // Ejecutar la mutación
    result.current.mutate(mockUpdatePayload);

    // Esperar y verificar la actualización exitosa
    await waitFor(() => {
      expect(updateNews).toHaveBeenCalledWith(mockId, mockUpdatePayload);
      expect(result.current.data).toEqual(mockSuccessResponse);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.error).toBeNull();
    });
  });

  it('debe manejar errores de actualización', async () => {
    // Configurar el mock para simular un error
    const mockError = new Error('Error al actualizar la noticia');
    (updateNews as jest.Mock).mockRejectedValueOnce(mockError);

    // Renderizar el hook
    const { result } = renderHook(() => useUpdateNews(mockId), {
      wrapper,
    });

    // Ejecutar la mutación
    result.current.mutate(mockUpdatePayload);

    // Esperar y verificar el manejo del error
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBeTruthy();
      expect(result.current.data).toBeUndefined();
    });
  });

  it('debe manejar actualización con payload parcial', async () => {
    // Payload con solo algunos campos actualizados
    const partialPayload = {
      title: 'Título Actualizado',
      publish_status: 2
    };

    // Configurar respuesta exitosa con los campos actualizados
    const partialResponse = {
      ...mockSuccessResponse,
      ...partialPayload
    };
    
    (updateNews as jest.Mock).mockResolvedValueOnce(partialResponse);

    // Renderizar el hook
    const { result } = renderHook(() => useUpdateNews(mockId), {
      wrapper,
    });

    // Ejecutar la mutación con payload parcial
    result.current.mutate(partialPayload);

    // Verificar que se llama con el payload parcial y se maneja correctamente
    await waitFor(() => {
      expect(updateNews).toHaveBeenCalledWith(mockId, partialPayload);
      expect(result.current.data).toEqual(partialResponse);
      expect(result.current.isSuccess).toBe(true);
    });
  });
});