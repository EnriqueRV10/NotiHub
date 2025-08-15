import { useQuery } from "@tanstack/react-query";
import { fetchSingleNews } from "../services/newsService";

interface useSingleNewsParams {
    id: string;
}

export const useSingleNewsEditor = ({
    id,
}: useSingleNewsParams) => {
    return useQuery({
        queryKey:['singleNews', id],
        queryFn: () => fetchSingleNews(id),
        refetchOnWindowFocus: false,
    });
};
