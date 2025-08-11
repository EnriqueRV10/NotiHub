import { useMutation } from '@tanstack/react-query';
import { deleteNews } from '@/features/news/api/newsApi';

export const useDeleteNews = () => {
  return useMutation({
    mutationFn: (id: any) => deleteNews(id),
  });
};
