export type WatchProgress = {
  last_position: number;
  isFinished: boolean;
};

export type VideoModalData = {
  id: string;
  name: string;
  description?: string | null;
  length: number;
  banner: string;
  rls_year: number;
  videotype: "MOVIE" | "SERIES";
  genre: {
    id: string;
    name: string;
  };
  seasons?: Season[];
  watchProgress?: WatchProgress;
  
  // Optional fields returned when querying an individual episode
  seriesName?: string;
  episodeTitle?: string;
  episodeNumber?: number;
  seasonNumber?: number;
};

export type Episode = {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  number: number;
  length: number;
  watchProgress?: WatchProgress;
};

export type Season = {
  id: string;
  name: string;
  number: number;
  episodes: Episode[];
};
