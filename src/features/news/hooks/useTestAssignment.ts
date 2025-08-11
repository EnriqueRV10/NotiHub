import { useMutation } from "@tanstack/react-query";
import { testAssignment } from "@/features/news/api/newsApi";

export const useTestAssignment = () => {
  return useMutation({
    mutationFn: (payload:any) => testAssignment(payload),
  })
};
