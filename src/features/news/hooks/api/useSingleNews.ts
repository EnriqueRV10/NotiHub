import { useQuery } from "@tanstack/react-query";
import { fetchSingleNews } from "@/features/news/services/newsService";

interface useSingleNewsParams {
  id: string;
  enabled?: boolean;
}

export const useSingleNews = ({
  id,
  enabled = true, // valor por defecto
}: useSingleNewsParams) => {
  return useQuery({
    queryKey: ["singleNews", id],
    queryFn: () => fetchSingleNews(id),
    enabled: enabled && !!id, // usa el parámetro enabled
  });
};
