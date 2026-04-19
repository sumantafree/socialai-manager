const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

// ─── Content ─────────────────────────────────────────────────

export interface GenerateContentParams {
  platform: string;
  niche: string;
  topic: string;
  tone: string;
}

export interface GeneratedContent {
  hook: string;
  caption: string;
  cta: string;
  hashtags: string[];
  script?: string;
  creative_idea?: string;
  seo_title?: string;
}

export const generateContent = (params: GenerateContentParams) =>
  request<GeneratedContent>("/generate-content", {
    method: "POST",
    body: JSON.stringify(params),
  });

// ─── Posts ───────────────────────────────────────────────────

export interface SchedulePostParams {
  platform: string;
  content: string;
  media_url?: string;
  scheduled_at: string;
}

export const schedulePost = (params: SchedulePostParams) =>
  request<{ id: string; status: string }>("/schedule-post", {
    method: "POST",
    body: JSON.stringify(params),
  });

export const getPosts = () =>
  request<{ posts: Array<{ id: string; platform: string; content: string; status: string; scheduled_at: string }> }>("/posts");

// ─── Analytics ───────────────────────────────────────────────

export const getAnalytics = (period = "7d") =>
  request<{ data: Array<{ date: string; reach: number; engagement: number }> }>(`/analytics?period=${period}`);

// ─── Trends ──────────────────────────────────────────────────

export const getTrends = (niche?: string) =>
  request<{ topics: Array<{ topic: string; volume: string; growth: string }> }>(
    `/trends${niche ? `?niche=${niche}` : ""}`
  );

// ─── Accounts ────────────────────────────────────────────────

export const connectAccount = (platform: string, code: string) =>
  request<{ success: boolean }>("/connect-account", {
    method: "POST",
    body: JSON.stringify({ platform, code }),
  });

export const getAccounts = () =>
  request<{ accounts: Array<{ platform: string; handle: string; followers: number }> }>("/accounts");

// ─── Blog Converter ──────────────────────────────────────────

export const convertBlogToSocial = (blogContent: string, platforms: string[]) =>
  request<{ posts: Record<string, GeneratedContent> }>("/convert-blog", {
    method: "POST",
    body: JSON.stringify({ content: blogContent, platforms }),
  });
