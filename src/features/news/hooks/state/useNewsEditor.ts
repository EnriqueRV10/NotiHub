import { useCallback, useEffect, useMemo } from "react";
import { message, FormInstance } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useSingleNewsEditor } from "../api/useSingleNewsEditor";
import { useNewsOperations } from "./useNewsOperations";

// Interfaces
interface FormValues {
  title: string;
  intro?: string;
  content: string;
  dateRange: [Dayjs, Dayjs];
  status: string;
}

interface UseNewsEditorOptions {
  id: string;
  enableNotifications?: boolean;
  onSuccessRedirect?: string | null;
}

interface UseNewsEditorReturn {
  // Datos
  newsData: any | undefined;

  // Estados consolidados
  loading: {
    fetching: boolean;
    updating: boolean;
  };

  error: {
    fetch: any;
    update: any;
  };

  // Operaciones principales
  operations: {
    updateNews: (formData: FormValues) => Promise<void>;
    syncFormWithData: (form: FormInstance) => void;
  };

  // Utilidades de transformación
  utils: {
    transformFormToAPI: (values: FormValues) => any;
    transformAPIToForm: (apiData: any) => Partial<FormValues>;
  };

  // Context para notificaciones
  contextHolder: React.ReactElement;
}

export const useNewsEditor = ({
  id,
  enableNotifications = true,
  onSuccessRedirect = null,
}: UseNewsEditorOptions): UseNewsEditorReturn => {
  const [messageApi, contextHolder] = message.useMessage();

  // Hooks para datos y operaciones
  const {
    data: newsData,
    error: fetchError,
    isLoading: isFetching,
  } = useSingleNewsEditor({ id });

  const newsOperations = useNewsOperations({
    enableNotifications,
    autoRefresh: true,
    onSuccessRedirect,
  });

  // Utilidad para transformar datos de formulario a API
  const transformFormToAPI = useCallback((values: FormValues): any => {
    if (!values.dateRange || values.dateRange.length !== 2) {
      throw new Error("Rango de fechas requerido");
    }

    const [startDate, endDate] = values.dateRange;

    return {
      title: values.title.trim(),
      // intro: values.intro?.trim() ?? "",
      content: values.content?.trim() ?? "",
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      publish_status: parseInt(values.status, 10),
    };
  }, []);

  // Utilidad para transformar datos de API a formulario
  const transformAPIToForm = useCallback(
    (apiData: any): Partial<FormValues> => {
      if (!apiData) return {};

      return {
        title: apiData.title || "",
        intro: apiData.intro || "",
        content: apiData.content || "",
        dateRange: [
          apiData.start_date ? dayjs(apiData.start_date) : dayjs(),
          apiData.end_date ? dayjs(apiData.end_date) : dayjs(),
        ],
        status: apiData.publish_status?.toString() || "0",
      };
    },
    []
  );

  // Operación de actualización con transformación automática
  const updateNews = useCallback(
    async (formData: FormValues) => {
      try {
        const payload = transformFormToAPI(formData);
        await newsOperations.operations.update(id, payload, {
          onSuccess: () => {
            if (enableNotifications) {
              messageApi.success({
                content: "Noticia actualizada exitosamente",
                duration: 5,
              });
            }
          },
          onError: (error: any) => {
            if (enableNotifications) {
              const errorMessage =
                error?.message ||
                error?.response?.data?.message ||
                "Error al actualizar la noticia";

              messageApi.error({
                content: errorMessage,
                duration: 5,
              });
            }
          },
        });
      } catch (transformError: any) {
        if (enableNotifications) {
          messageApi.error({
            content:
              transformError.message || "Error en la validación de datos",
            duration: 5,
          });
        }
        throw transformError;
      }
    },
    [
      id,
      transformFormToAPI,
      newsOperations.operations,
      messageApi,
      enableNotifications,
    ]
  );

  // Sincronización automática del formulario con los datos cargados
  const syncFormWithData = useCallback(
    (form: FormInstance) => {
      if (newsData?.data) {
        const formValues = transformAPIToForm(newsData.data);
        form.setFieldsValue(formValues);
      }
    },
    [newsData, transformAPIToForm]
  );

  // Auto-sincronización cuando los datos cambian

  // Estados consolidados
  const loading = useMemo(
    () => ({
      fetching: isFetching,
      updating: newsOperations.loading.update,
    }),
    [isFetching, newsOperations.loading.update]
  );

  const error = useMemo(
    () => ({
      fetch: fetchError,
      update: newsOperations.errors.update,
    }),
    [fetchError, newsOperations.errors.update]
  );

  // Manejo de errores de carga
  useEffect(() => {
    if (fetchError && enableNotifications) {
      messageApi.error({
        content: "Error al cargar la noticia",
        duration: 5,
      });
    }
  }, [fetchError, messageApi, enableNotifications]);

  return {
    // Datos
    newsData,

    // Estados consolidados
    loading,
    error,

    // Operaciones principales
    operations: {
      updateNews,
      syncFormWithData,
    },

    // Utilidades de transformación
    utils: {
      transformFormToAPI,
      transformAPIToForm,
    },

    // Context para notificaciones
    contextHolder,
  };
};
