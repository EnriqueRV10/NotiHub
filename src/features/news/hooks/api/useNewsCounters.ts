import { useQuery } from "@tanstack/react-query";
import { fetchNewsCounters } from "../../services/newsService";

// tipo para los parametros del hook
interface UseNewsCountersParams {
  status?: number;
  subordinates?: string;
}

export const useNewsCounters = ({}: UseNewsCountersParams) => {
  return useQuery({
    queryKey: ["newsCounters"],
    queryFn: () => fetchNewsCounters(),
  });
};
