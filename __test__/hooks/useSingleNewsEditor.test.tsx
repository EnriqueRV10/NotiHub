import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSingleNewsEditor } from "@/features/news/hooks";
import { fetchSingleNews } from "@/api/newsApi";

// Mock del módulo newsApi
jest.mock("@/api/newsApi", () => ({
  fetchSingleNews: jest.fn(),
}));

// Datos de ejemplo
const mockNewsData = {
  data: {
    id: "1",
    title: "Test News",
    body: "Test Body",
    intro: "Test Intro",
    start: "2024-01-01T00:00:00Z",
    end: "2024-02-01T00:00:00Z",
    publish_status: 1,
    employee_assignment_policy: {},
  },
};

describe("useSingleNewsEditor", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("debe obtener correctamente los datos de una noticia", async () => {
    (fetchSingleNews as jest.Mock).mockResolvedValueOnce(mockNewsData);

    const { result } = renderHook(() => useSingleNewsEditor({ id: "1" }), {
      wrapper,
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockNewsData);
    expect(result.current.error).toBeNull();
  });

  it("debe manejar errores correctamente", async () => {
    const mockError = new Error("Error fetching news");
    (fetchSingleNews as jest.Mock).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useSingleNewsEditor({ id: "1" }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeUndefined();
  });

  it("debe llamar a fetchSingleNews con los parámetros correctos", async () => {
    (fetchSingleNews as jest.Mock).mockResolvedValueOnce(mockNewsData);

    renderHook(
      () =>
        useSingleNewsEditor({
          id: "1",
          subordinates: "custom",
        }),
      {
        wrapper,
      }
    );

    expect(fetchSingleNews).toHaveBeenCalledWith({
      id: "1",
      subordinates: "custom",
    });
  });

  it("no debe refrescar los datos cuando la ventana recupera el foco", async () => {
    (fetchSingleNews as jest.Mock).mockResolvedValueOnce(mockNewsData);

    renderHook(() => useSingleNewsEditor({ id: "1" }), {
      wrapper,
    });

    window.dispatchEvent(new Event("blur-sm"));
    window.dispatchEvent(new Event("focus"));

    expect(fetchSingleNews).toHaveBeenCalledTimes(1);
  });
});
