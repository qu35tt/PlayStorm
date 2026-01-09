export type VideoModalData = {
  id: string;
  name: string;
  description?: string;
  length: number;
  banner: string;
  rls_year: number;
  videotype: "MOVIE" | "SERIES";
  genre: {
    id: string;
    name: string;
  };
  seasons: Season[]; // Add seasons array
};

export type Episode = {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  number: number;
  length: number;
};

export type Season = {
  id: string;
  name: string;
  number: number;
  episodes: Episode[];
};