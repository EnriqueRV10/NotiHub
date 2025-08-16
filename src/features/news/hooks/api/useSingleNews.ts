import { useQuery } from "@tanstack/react-query";
import { fetchSingleNews } from "@/features/news/api/newsApi";

interface useSingleNewsParams {
    id: string;
    subordinates?: string;
}

export const useSingleNews = ({
    id,
    subordinates = 'all',
}: useSingleNewsParams) => {
    return useQuery({
        queryKey:['singleNews', id, subordinates],
        queryFn: () => fetchSingleNews({id, subordinates}),
    });
};
