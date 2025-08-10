/* eslint-disable react/display-name */
import { renderHook } from '@testing-library/react';
import { useCreateNews } from '@/hooks/useCreateNews';
import { createNews } from '@/api/newsApi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, waitFor } from '@testing-library/react';

// Mock del módulo newsApi
jest.mock('@/api/newsApi');

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

describe('useCreateNews', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  const mockNewsData = {
    title: 'Noticia de Prueba',
    body: '',
    intro: '',
    start: '2024-01-01T00:00:00.000Z',
    end: '2024-02-01T00:00:00.000Z',
    employee_assignment_policy: {}
  };

  const mockResponse = {
    data: {
      id: '123',
      ...mockNewsData
    }
  };

  test('It should boot into idle state', () => {
    const { result } = renderHook(() => useCreateNews(), {
      wrapper: createWrapper()
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  test('I should create a news story successfully', async () => {
    (createNews as jest.Mock).mockResolvedValueOnce(mockResponse);
    const onSuccess = jest.fn();
    
    const { result } = renderHook(() => useCreateNews(onSuccess), {
      wrapper: createWrapper()
    });

    await act(async () => {
      result.current.mutate(mockNewsData);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(createNews).toHaveBeenCalledWith(mockNewsData);
    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(onSuccess).toHaveBeenCalledWith(mockResponse);
  });

  test('It should handle errors correctly', async () => {
    const mockError = new Error('Error creating the news');
    (createNews as jest.Mock).mockRejectedValueOnce(mockError);
    const onSuccess = jest.fn();
    
    const { result } = renderHook(() => useCreateNews(onSuccess), {
      wrapper: createWrapper()
    });

    await act(async () => {
      result.current.mutate(mockNewsData);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  test('should show charge status during mutation', async () => {
    let resolvePromise: (value: any) => void;
    const responsePromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    (createNews as jest.Mock).mockReturnValue(responsePromise);

    const { result } = renderHook(() => useCreateNews(), {
      wrapper: createWrapper()
    });

    act(() => {
      result.current.mutate(mockNewsData);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    await act(async () => {
      resolvePromise!(mockResponse);
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });
});