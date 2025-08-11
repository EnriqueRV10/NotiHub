import { useMutation } from "@tanstack/react-query";
import { testAssignment } from "@/api/newsApi";

export const useTestAssignment = () => {
  return useMutation({
    mutationFn: (payload:any) => testAssignment(payload),
  })
};
