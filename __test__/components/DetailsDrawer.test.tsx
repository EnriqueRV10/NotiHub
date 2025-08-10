import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DetailsDrawer } from "@/components/DetailsDrawer";
import { useSingleNews } from "@/hooks/useSingleNews";
import { message } from "antd";
import { AxiosResponse, AxiosRequestHeaders, RawAxiosRequestHeaders } from "axios";
import { UseQueryResult } from "@tanstack/react-query";

jest.mock("@/hooks/useSingleNews");
const mockUseSingleNews = useSingleNews as jest.MockedFunction<typeof useSingleNews>;

// Mock de antd
jest.mock("antd", () => ({
  ...jest.requireActual("antd"),
  message: {
    useMessage: jest.fn(() => [
      {
        error: jest.fn(),
        warning: jest.fn(),
        success: jest.fn(),
      },
      null,
    ]),
  },
}));

// Mock XLSX
jest.mock("xlsx", () => ({
  writeFile: jest.fn(),
  utils: {
    json_to_sheet: jest.fn(),
    book_new: jest.fn(() => ({})),
    book_append_sheet: jest.fn(),
  },
}));

// Helper para crear un mock completo de UseQueryResult
function createMockQueryResult<TData, TError>(
  overrides?: Partial<UseQueryResult<TData, TError>>
): UseQueryResult<TData, TError> {
  return {
    data: undefined,
    dataUpdatedAt: 0,
    error: null,
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    isError: false,
    isFetched: false,
    isFetchedAfterMount: false,
    isFetching: false,
    isLoading: false,
    isLoadingError: false,
    isPaused: false,
    isPending: false,
    isPlaceholderData: false,
    isRefetchError: false,
    isRefetching: false,
    isStale: false,
    isSuccess: false,
    refetch: jest.fn(),
    status: 'loading',
    ...overrides,
  };
}

// Datos de prueba
const mockNewsData = {
  id: "123",
  title: "Noticia de prueba",
  read: [
    {
      actor__code: "EMP123",
      actor__full_name: "Usuario Test",
      created: "2024-01-01T10:00:00Z",
    },
    {
      actor__code: "EMP123",
      actor__full_name: "Usuario Test",
      created: "2024-01-02T15:30:00Z",
    },
  ],
};

// Helper para crear respuesta de Axios
const createAxiosResponse = (data: any): AxiosResponse => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {} as RawAxiosRequestHeaders,
  config: {
    headers: {} as AxiosRequestHeaders
  } as any,
});


describe("DetailsDrawer", () => {
  const mockOnClose = jest.fn();
  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    newsId: "123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it("should render correctly when visible", () => {
      mockUseSingleNews.mockReturnValue(
        createMockQueryResult({
          data: createAxiosResponse({ read: [], title: "Test" }),
          isSuccess: true,
          status: 'success',
        })
      );

      render(<DetailsDrawer {...defaultProps} />);
      expect(screen.getByText("Lecturas por Usuario")).toBeInTheDocument();
    });

    it("should show skeleton", () => {
      mockUseSingleNews.mockReturnValue(
        createMockQueryResult({
          isLoading: true,
          isPending: true,
        })
      );

      render(<DetailsDrawer {...defaultProps} />);
      
      // Verificamos que el título del drawer está presente
      expect(screen.getByText("Lecturas por Usuario")).toBeInTheDocument();
      
      // Verificamos que el contenido normal no está presente
      expect(screen.queryByText("Código")).not.toBeInTheDocument();
      expect(screen.queryByText("Usuario")).not.toBeInTheDocument();
      
      // Verificamos que el skeleton está presente
      expect(document.querySelector('.ant-skeleton')).toBeInTheDocument();
    });

    it("debería llamar onClose cuando se cierra el drawer", () => {
      render(<DetailsDrawer {...defaultProps} />);
      const closeButton = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    });
  })

  describe('Data', () => {
    it("should display error message when there is an error loading data", async () => {
      const messageErrorMock = jest.fn();
      (message.useMessage as jest.Mock).mockReturnValue([
        { error: messageErrorMock },
        null,
      ]);
  
      mockUseSingleNews.mockReturnValue(
        createMockQueryResult({
          error: new Error("Error de carga"),
          isError: true,
          status: 'error',
        })
      );
  
      render(<DetailsDrawer {...defaultProps} />);
  
      await waitFor(() => {
        expect(messageErrorMock).toHaveBeenCalledWith({
          content: "Error al cargar la información de lecturas. Por favor, intente nuevamente.",
          duration: 5,
        });
      });
    });

    it("should show warning when there is no data to export", () => {
      const messageWarningMock = jest.fn();
      (message.useMessage as jest.Mock).mockReturnValue([
        { warning: messageWarningMock },
        null,
      ]);
  
      mockUseSingleNews.mockReturnValue(
        createMockQueryResult({
          data: createAxiosResponse({ read: [], title: "" }),
          isSuccess: true,
          status: 'success',
        })
      );
  
      render(<DetailsDrawer {...defaultProps} />);
      fireEvent.click(screen.getByRole("button", { name: /Generar Reporte/i }));
  
      expect(messageWarningMock).toHaveBeenCalledWith({
        content: "No hay datos disponibles para exportar.",
        duration: 5,
      });
    });
  })
  

  describe('Tabla', () => {
    it("It should display the table with data correctly", async () => {
      mockUseSingleNews.mockReturnValue(
        createMockQueryResult({
          data: createAxiosResponse(mockNewsData),
          isSuccess: true,
          isLoading: false,
          isFetching: false,
          isFetchedAfterMount: true,
          isFetched: true,
          status: 'success'
        })
      );
  
      render(<DetailsDrawer {...defaultProps} />);
  
      // Verificar primero que no aparece el mensaje de "no hay datos"
      expect(screen.queryByText("No hay datos de lectura disponibles.")).not.toBeInTheDocument();
  
      // Verificar los encabezados de la tabla
      expect(screen.getByText("Código")).toBeInTheDocument();
      expect(screen.getByText("Usuario")).toBeInTheDocument();
      expect(screen.getByText("No. de lecturas")).toBeInTheDocument();
      expect(screen.getByText("Fecha")).toBeInTheDocument();
  
      // Esperar y verificar que los datos se muestren
      await waitFor(() => {
        expect(screen.getByText("EMP123")).toBeInTheDocument();
        expect(screen.getByText("Usuario Test")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
      });
  
      // Verificar el formato de fecha
      const fecha = new Date(mockNewsData.read[0].created)
        .toLocaleDateString("es-MX", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      expect(screen.getByText(fecha)).toBeInTheDocument();
    });

    it("It should expand the row on click and show additional details", async () => {
      const mockData = {
        read: [
          {
            actor__code: "EMP123",
            actor__full_name: "Usuario Test",
            created: "2024-01-01T16:30:00Z",
          },
          {
            actor__code: "EMP123",
            actor__full_name: "Usuario Test",
            created: "2024-01-02T14:45:00Z",
          },
        ],
      };
    
      mockUseSingleNews.mockReturnValue(
        createMockQueryResult({
          data: createAxiosResponse(mockData),
          isSuccess: true,
          status: 'success',
        })
      );
    
      render(<DetailsDrawer {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText("Usuario Test")).toBeInTheDocument();
      });
    
      const expandIcon = document.querySelector('.ant-table-row-expand-icon');
      if (!expandIcon) throw new Error('Expand icon not found');
      fireEvent.click(expandIcon);
    
      await waitFor(() => {
        const expandedTableBody = document.querySelector('.ant-table-expanded-row .ant-table-tbody');
        if (!expandedTableBody) throw new Error('Expanded table not found');
    
        const rows = expandedTableBody.querySelectorAll('tr');
        const firstRow = rows[0];
        const secondRow = rows[1];
    
        // Patrones de formato
        const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
        const timePattern = /^\d{2}:\d{2}:\d{2}$/;
    
        // Verifica el formato de las fechas
        expect(firstRow.querySelector('td')?.textContent).toMatch(datePattern);
        expect(secondRow.querySelector('td')?.textContent).toMatch(datePattern);
    
        // Verifica el formato de las horas
        expect(firstRow.querySelectorAll('td')[1]?.textContent).toMatch(timePattern);
        expect(secondRow.querySelectorAll('td')[1]?.textContent).toMatch(timePattern);
      });
    });
  }) 

  describe('Excel', () => {
    it("should handle the export to Excel correctly", async () => {
      const messageSuccessMock = jest.fn();
      (message.useMessage as jest.Mock).mockReturnValue([
        { success: messageSuccessMock },
        null,
      ]);
  
      const mockData = {
        title: "Noticia Test",
        read: [
          {
            actor__code: "EMP123",
            actor__full_name: "Usuario Test",
            created: "2024-01-01T10:00:00Z",
          },
        ],
      };
  
      mockUseSingleNews.mockReturnValue(
        createMockQueryResult({
          data: createAxiosResponse(mockData),
          isSuccess: true,
          status: 'success',
        })
      );
  
      render(<DetailsDrawer {...defaultProps} />);
      
      const exportButton = screen.getByRole("button", { name: /Generar Reporte/i });
      fireEvent.click(exportButton);
  
      await waitFor(() => {
        expect(messageSuccessMock).toHaveBeenCalledWith({
          content: "Archivo Excel generado con éxito.",
          duration: 5,
        });
      });
    });

    it("should handle error when generating Excel file", async () => {
      // Mock error de XLSX
      const mockError = new Error('Error al escribir archivo');
      const writeFileMock = jest.spyOn(require('xlsx'), 'writeFile')
        .mockImplementation(() => { throw mockError; });
    
      const messageErrorMock = jest.fn();
      (message.useMessage as jest.Mock).mockReturnValue([
        { error: messageErrorMock },
        null,
      ]);
    
      const mockData = {
        title: "Test",
        read: [
          {
            actor__code: "EMP123",
            actor__full_name: "Usuario Test",
            created: "2024-01-01T10:00:00Z",
          }
        ]
      };
    
      mockUseSingleNews.mockReturnValue(
        createMockQueryResult({
          data: createAxiosResponse(mockData),
          isSuccess: true,
          status: 'success',
        })
      );
    
      render(<DetailsDrawer {...defaultProps} />);
      
      const exportButton = screen.getByRole("button", { name: /Generar Reporte/i });
      fireEvent.click(exportButton);
    
      await waitFor(() => {
        expect(messageErrorMock).toHaveBeenCalledWith({
          content: "Error al generar el archivo Excel. Por favor, inténtelo de nuevo.",
          duration: 5,
        });
      });
    
      writeFileMock.mockRestore();
    });
  })

});