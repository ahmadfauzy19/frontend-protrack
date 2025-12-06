import { useQuery } from "@tanstack/react-query";
import { getDeveloperDropdown } from "../service/api/DeveloperApi";

export const useDeveloperDropdown = () => {
  return useQuery({
    queryKey: ["developerDropdown"],
    queryFn: getDeveloperDropdown,
    staleTime: 10 * 60 * 1000, 
  });
};
