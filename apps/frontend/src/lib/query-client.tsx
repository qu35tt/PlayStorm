import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useUserStore } from "@/stores/userStore";
import type { VideoData } from "@/types/video-data-types";
import type { VideoModalData } from "@/types/video-modal.types";

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

export const useVideoData = <T extends VideoModalData>(id: string | undefined) => {
    const user = useUserStore();

    return useQuery({
        queryKey: ["video-data", id],
        queryFn: async () => {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}video/data/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            return data as T;
        },
        enabled: !!user.token && !!id,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};

export const useProfileData = () => {
    const user = useUserStore();

    return useQuery({
        queryKey: ["profile-data", user.userId],
        queryFn: async () => {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}user/me/${user.userId}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            return data;
        },
        enabled: !!user.token,
        staleTime: 1000 * 60 * 60, // 1 hour
    });
};

export const setVideoData = (id: string, data: VideoModalData) => {
    queryClient.setQueryData(["video-data", id], data);
};
