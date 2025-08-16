import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNews } from "@/features/news/services/newsService";

export const useCreateNews = (onSuccess?: (data: any) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNews,
    onSuccess: (data) => {
      // Actualizar el caché
      queryClient.invalidateQueries({ queryKey: ["news"] });

      // Llamar al callback personalizado si se proporcionó
      if (onSuccess) {
        onSuccess(data);
      }
    },
  });
};
