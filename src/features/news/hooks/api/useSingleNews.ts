import { useQuery } from "@tanstack/react-query";
import { fetchSingleNews } from "@/features/news/services/newsService";

interface useSingleNewsParams {
    id: string;
}

export const useSingleNews = ({
    id,
}: useSingleNewsParams) => {
    return useQuery({
        queryKey:['singleNews', id],
        queryFn: () => fetchSingleNews(id),
    });
};
