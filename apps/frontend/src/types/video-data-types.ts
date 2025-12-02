import type { PartyUser } from "./socket-types";

export type VideoData = {
    id: string
    name: string
    length: number,
    thumbnail: string
}

export type OutletContext = {
    videos: VideoData[];
}

export type VideoControlsProps = {
  name: string;
};

export type CardProps = {
    videoData: VideoData
}

export type VideoType = "ALL" | "MOVIE" | "SERIES"

export type NavbarProps = {
    setSearchQuery: (query: string) => void;
    setType: (query: VideoType) => void;
    selectedType: VideoType;
}

export type MemberCardProps = {
  user: PartyUser;
  isSelf?: boolean;
};