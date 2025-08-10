import { renderHook } from "@testing-library/react";
import { useSingleNews } from "@/hooks/useSingleNews";
import { fetchSingleNews } from "@/api/newsApi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { waitFor } from "@testing-library/react";

// Mock del módulo newsApi
jest.mock("@/api/newsApi");

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {},
    },
  });

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useSingleNews", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockNewsData = {
    data: {
      id: "123",
      title: "Noticia de Prueba",
      intro: "Introducción de prueba",
      body: "Contenido de la noticia",
      start: "2024-01-01T00:00:00.000Z",
      end: "2024-12-31T23:59:59.999Z",
      publish_status: 1,
      read: [
        {
          actor__code: "USR1",
          actor__full_name: "Usuario 1",
          created: "2024-01-02T10:00:00.000Z",
        },
      ],
    },
  };

  test("debería obtener una noticia específica correctamente", async () => {
    (fetchSingleNews as jest.Mock).mockResolvedValueOnce(mockNewsData);

    const { result } = renderHook(
      () =>
        useSingleNews({
          id: "123",
        }),
      {
        wrapper: createWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchSingleNews).toHaveBeenCalledWith({
      id: "123",
      subordinates: "all",
    });

    expect(result.current.data).toEqual(mockNewsData);
    expect(result.current.isError).toBe(false);
  });

  test("debería manejar errores correctamente", async () => {
    const mockError = new Error("Error al obtener la noticia");
    (fetchSingleNews as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(
      () =>
        useSingleNews({
          id: "123",
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(mockError);
    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  test("debería aceptar parámetro subordinates personalizado", async () => {
    (fetchSingleNews as jest.Mock).mockResolvedValueOnce(mockNewsData);

    const { result } = renderHook(
      () =>
        useSingleNews({
          id: "123",
          subordinates: "none",
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchSingleNews).toHaveBeenCalledWith({
      id: "123",
      subordinates: "none",
    });
  });

  test("debería actualizar los datos cuando cambia el ID", async () => {
    (fetchSingleNews as jest.Mock).mockResolvedValueOnce(mockNewsData);

    const { result, rerender } = renderHook((props) => useSingleNews(props), {
      wrapper: createWrapper(),
      initialProps: { id: "123" },
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockNewsData);
    });

    const newNewsData = {
      ...mockNewsData,
      data: { ...mockNewsData.data, id: "456", title: "Otra Noticia" },
    };
    (fetchSingleNews as jest.Mock).mockResolvedValueOnce(newNewsData);

    rerender({ id: "456" });

    await waitFor(() => {
      expect(result.current.data).toEqual(newNewsData);
    });

    expect(fetchSingleNews).toHaveBeenCalledTimes(2);
    expect(fetchSingleNews).toHaveBeenLastCalledWith({
      id: "456",
      subordinates: "all",
    });
  });
});
