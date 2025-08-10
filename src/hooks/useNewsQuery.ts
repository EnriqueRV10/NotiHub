import { useQuery } from '@tanstack/react-query';
import { fetchNews } from '../api/newsApi';

// tipo para los parámetros del hook
interface UseNewsQueryParams {
  page: number;
  pageSize: number;
  subordinates?: string;  // Parámetro opcional
  search?: string;  // Parámetro opcional
  publish_status?: number;  // Parámetro opcional
  status?: number;
}

export const useNewsQuery = ({
  publish_status,
  page,
  pageSize,
  search,
  subordinates = 'all',
  status = 1,
}: UseNewsQueryParams) => {
  return useQuery({
    queryKey: ['news', publish_status, page, pageSize, search, subordinates, status],
    queryFn: () => fetchNews({
      publish_status,
      page,
      pageSize,
      search,
      subordinates,
      status,
    }),
  });
};