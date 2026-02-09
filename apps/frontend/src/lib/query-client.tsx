import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useUserStore } from "@/stores/userStore";
import type { VideoData } from "@/types/video-data-types";

export const useVideos = () => {
    const user = useUserStore();

    return useQuery({
        queryKey: ["videos", user.userId],
        queryFn: async () => {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}video`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            return data as VideoData[];
        },
        enabled: !!user.token,
        staleTime: 1000 * 60 * 15, // 15 minutes
    });
};
