import { useMutation } from '@tanstack/react-query';
import { updateNews } from '@/api/newsApi';

export const useUpdateNews = ( id: string ) => {
  return useMutation({
    mutationFn: (payload: any) => updateNews(id, payload),
  });
};