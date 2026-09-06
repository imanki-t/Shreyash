export interface DocketItem {
  docketNumber: string;
  name: string;
  slug: string;
  description: string;
  classificationDefault: string;
  isPrivate?: boolean;
  bannerUrl?: string;
  iconUrl?: string;
}

export const DEFAULT_DOCKETS: DocketItem[] = [
  {
    docketNumber: "c/general",
    name: "General",
    slug: "general",
    description: "The central lounge for discussions, stories, thoughts, and community updates.",
    classificationDefault: "PUBLIC",
  },
  {
    docketNumber: "c/memes",
    name: "Memes",
    slug: "memes",
    description: "Top tier memes, shitposts, comedy clips, and hilarious reactions.",
    classificationDefault: "PUBLIC",
  },
  {
    docketNumber: "c/tech",
    name: "Tech & Gaming",
    slug: "tech",
    description: "Hardware setups, coding projects, gaming clutches, and tech discussions.",
    classificationDefault: "PUBLIC",
  },
  {
    docketNumber: "c/ask",
    name: "Ask Community",
    slug: "ask",
    description: "Open questions, AMA discussions, life advice, and opinions.",
    classificationDefault: "PUBLIC",
  },
  {
    docketNumber: "c/music",
    name: "Music & Media",
    slug: "music",
    description: "Favorite playlists, tracks, audio snippets, and video creations.",
    classificationDefault: "PUBLIC",
  },
];
