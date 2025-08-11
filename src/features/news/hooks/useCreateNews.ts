import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNews } from '@/features/news/api/newsApi';

export const useCreateNews = (onSuccess?: (data: any) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNews,
    onSuccess: (data, variables, context) => {
      // Actualizar el caché
      // queryClient.invalidateQueries(['news']);

      // Llamar al callback personalizado si se proporcionó
      if (onSuccess) {
        onSuccess(data);
      }
    },
  });
};
