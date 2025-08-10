import { useQuery } from "@tanstack/react-query";
import { fetchNewsCounters } from "@/api/newsApi";

// tipo para los parametros del hook
interface UseNewsCountersParams {
    status?: number;
    subordinates?: string;
}

export const useNewsCounters = ({
    status = 1,
    subordinates = 'all',
}: UseNewsCountersParams) => {
    return useQuery({
        queryKey:['newsCounters', status, subordinates],
        queryFn: () => fetchNewsCounters({status, subordinates}),
    });
};