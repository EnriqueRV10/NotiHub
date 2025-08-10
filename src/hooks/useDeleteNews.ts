import { useMutation } from '@tanstack/react-query';
import { deleteNews } from '@/api/newsApi';

export const useDeleteNews = () => {
  return useMutation({
    mutationFn: (id: any) => deleteNews(id),
  });
};