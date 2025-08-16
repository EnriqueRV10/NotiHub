import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNews } from "../services/newsService";

export const useDeleteNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: any) => deleteNews(id),
    onSuccess: () => {
      // Invalidate the news list query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["news"] });
      queryClient.invalidateQueries({ queryKey: ["newsCounters"] });
    },
    onError: (error) => {
      console.error("Error deleting news:", error);
    },
  });
};
