// src/features/news/hooks/state/useNewsOperations.ts

import { useCallback } from "react";
import { message } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

// Importar hooks individuales existentes
import { useCreateNews } from "../api/useCreateNews";
import { useUpdateNews } from "../api/useUpdateNews";
import { useDeleteNews } from "../api/useDeleteNews";

interface UseNewsOperationsOptions {
  enableNotifications?: boolean;
  autoRefresh?: boolean;
  onSuccessRedirect?: string | null;
}

interface OperationCallbacks {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  onFinally?: () => void;
}

export const useNewsOperations = (options: UseNewsOperationsOptions = {}) => {
  const {
    enableNotifications = true,
    autoRefresh = true,
    onSuccessRedirect = null,
  } = options;

  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Hooks de mutaciones individuales
  const createMutation = useCreateNews();
  const updateMutation = useUpdateNews();
  const deleteMutation = useDeleteNews();

  // Función para refrescar queries relacionadas
  const refreshQueries = useCallback(async () => {
    if (autoRefresh) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["news"] }),
        queryClient.invalidateQueries({ queryKey: ["news-counters"] }),
      ]);
    }
  }, [queryClient, autoRefresh]);

  // Manejador de éxito genérico
  const handleSuccess = useCallback(
    async (message: string, callbacks?: OperationCallbacks) => {
      if (enableNotifications) {
        messageApi.success({
          content: message,
          duration: 5,
        });
      }

      await refreshQueries();

      if (onSuccessRedirect) {
        router.push(onSuccessRedirect);
      }

      callbacks?.onSuccess?.();
    },
    [messageApi, enableNotifications, refreshQueries, onSuccessRedirect, router]
  );

  // Manejador de error genérico
  const handleError = useCallback(
    (error: any, defaultMessage: string, callbacks?: OperationCallbacks) => {
      const errorMessage =
        error?.message || error?.response?.data?.message || defaultMessage;

      if (enableNotifications) {
        messageApi.error({
          content: errorMessage,
          duration: 5,
        });
      }

      console.error("News operation error:", error);
      callbacks?.onError?.(error);
    },
    [messageApi, enableNotifications]
  );

  // Operación de creación
  const createNews = useCallback(
    async (data: any, callbacks?: OperationCallbacks) => {
      try {
        const result = await createMutation.mutateAsync(data);
        await handleSuccess("Noticia creada exitosamente", callbacks);
        return result;
      } catch (error) {
        handleError(error, "Error al crear la noticia", callbacks);
        throw error;
      } finally {
        callbacks?.onFinally?.();
      }
    },
    [createMutation, handleSuccess, handleError]
  );

  // Operación de actualización
  const updateNews = useCallback(
    async (id: string, data: any, callbacks?: OperationCallbacks) => {
      try {
        const result = await updateMutation.mutateAsync({ id, data });
        await handleSuccess("Noticia actualizada exitosamente", callbacks);
        return result;
      } catch (error) {
        handleError(error, "Error al actualizar la noticia", callbacks);
        throw error;
      } finally {
        callbacks?.onFinally?.();
      }
    },
    [updateMutation, handleSuccess, handleError]
  );

  // Operación de eliminación individual
  const deleteNews = useCallback(
    async (id: string, callbacks?: OperationCallbacks) => {
      try {
        await deleteMutation.mutateAsync(id);
        await handleSuccess("Noticia eliminada exitosamente", callbacks);
      } catch (error) {
        handleError(error, "Error al eliminar la noticia", callbacks);
        throw error;
      } finally {
        callbacks?.onFinally?.();
      }
    },
    [deleteMutation, handleSuccess, handleError]
  );

  // Operación de eliminación múltiple
  const deleteBulkNews = useCallback(
    async (ids: string[], callbacks?: OperationCallbacks) => {
      try {
        await Promise.all(ids.map((id) => deleteMutation.mutateAsync(id)));
        await handleSuccess(
          `${ids.length} noticia${ids.length > 1 ? "s" : ""} eliminada${
            ids.length > 1 ? "s" : ""
          } exitosamente`,
          callbacks
        );
      } catch (error) {
        handleError(
          error,
          "Error al eliminar las noticias seleccionadas",
          callbacks
        );
        throw error;
      } finally {
        callbacks?.onFinally?.();
      }
    },
    [deleteMutation, handleSuccess, handleError]
  );

  // Estado de loading consolidado
  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return {
    // Operaciones principales
    operations: {
      create: createNews,
      update: updateNews,
      delete: deleteNews,
      deleteBulk: deleteBulkNews,
    },

    // Estados de loading individuales
    loading: {
      create: createMutation.isPending,
      update: updateMutation.isPending,
      delete: deleteMutation.isPending,
      any: isLoading,
    },

    // Errores individuales
    errors: {
      create: createMutation.error,
      update: updateMutation.error,
      delete: deleteMutation.error,
    },

    // Utilidades
    utils: {
      refreshQueries,
      handleSuccess,
      handleError,
    },

    // Context para notificaciones
    contextHolder,
  };
};
