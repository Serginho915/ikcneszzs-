export type PostStatus = "draft" | "published";

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  status: PostStatus;
  coverImage: string;
  seoTitle: string;
  seoDescription: string;
  contentHtml: string;
  publishedAt: string;
  updatedAt: string;
};

export type AdminSettings = {
  masterPrompt: string;
  generationEnabled: boolean;
  generationFrequencyCount: number;
  generationFrequencyPeriod: "day" | "week" | "month";
  generationTimes: string[];
};

export const emptyPost: Omit<Post, "id" | "publishedAt" | "updatedAt"> = {
  title: "",
  slug: "",
  excerpt: "",
  tags: [],
  status: "draft",
  coverImage: "/covers/silk-road-ledger.svg",
  seoTitle: "",
  seoDescription: "",
  contentHtml: ""
};

export const coverOptions = [
  "/covers/silk-road-ledger.svg",
  "/covers/boardroom-bridge.svg",
  "/covers/harbor-contract.svg",
  "/covers/trust-compass.svg"
];
