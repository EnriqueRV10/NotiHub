import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateNews } from "../../services/newsService";

interface UpdateNewsParams {
  id: string;
  data: any;
}

export const useUpdateNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateNewsParams) => updateNews(id, data),
    onSuccess: () => {
      // Invalidar queries relacionadas para refrescar datos
      queryClient.invalidateQueries({ queryKey: ["news"] });
      queryClient.invalidateQueries({ queryKey: ["singleNews"] });
      queryClient.invalidateQueries({ queryKey: ["newsCounters"] });
    },
    onError: (error) => {
      console.error("Error updating news:", error);
    },
  });
};
