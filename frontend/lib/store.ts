import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ────────────────────────────────────────────────────

interface GeneratedContent {
  hook: string;
  caption: string;
  cta: string;
  hashtags: string[];
  script?: string;
  creative_idea?: string;
  seo_title?: string;
  platform: string;
}

interface ScheduledPost {
  id: string;
  platform: string;
  content: string;
  status: "draft" | "scheduled" | "published";
  scheduledAt: string;
}

interface UserPlan {
  plan: "free" | "pro" | "agency";
  postsUsed: number;
  postsLimit: number;
}

// ─── Content Studio Store ────────────────────────────────────

interface ContentStudioState {
  lastGenerated: GeneratedContent | null;
  history: GeneratedContent[];
  setLastGenerated: (content: GeneratedContent) => void;
  clearHistory: () => void;
}

export const useContentStudio = create<ContentStudioState>()(
  persist(
    (set) => ({
      lastGenerated: null,
      history: [],
      setLastGenerated: (content) =>
        set((state) => ({
          lastGenerated: content,
          history: [content, ...state.history].slice(0, 20),
        })),
      clearHistory: () => set({ history: [], lastGenerated: null }),
    }),
    { name: "socialai-content-studio" }
  )
);

// ─── User / Plan Store ───────────────────────────────────────

interface UserState {
  plan: UserPlan;
  setPlan: (plan: UserPlan) => void;
  canGenerate: () => boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      plan: { plan: "free", postsUsed: 0, postsLimit: 5 },
      setPlan: (plan) => set({ plan }),
      canGenerate: () => {
        const { plan } = get();
        return plan.postsUsed < plan.postsLimit;
      },
    }),
    { name: "socialai-user" }
  )
);

// ─── Posts Store ─────────────────────────────────────────────

interface PostsState {
  drafts: ScheduledPost[];
  addDraft: (post: Omit<ScheduledPost, "id">) => void;
  removeDraft: (id: string) => void;
  clearDrafts: () => void;
}

export const usePostsStore = create<PostsState>()(
  persist(
    (set) => ({
      drafts: [],
      addDraft: (post) =>
        set((state) => ({
          drafts: [
            { ...post, id: Math.random().toString(36).slice(2) },
            ...state.drafts,
          ].slice(0, 50),
        })),
      removeDraft: (id) =>
        set((state) => ({ drafts: state.drafts.filter((d) => d.id !== id) })),
      clearDrafts: () => set({ drafts: [] }),
    }),
    { name: "socialai-posts" }
  )
);

// ─── UI Store (sidebar collapse, theme, mobile) ─────────────

interface UIState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (v: boolean) => void;
  toggleMobileSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setMobileSidebarOpen: (v) => set({ mobileSidebarOpen: v }),
      toggleMobileSidebar: () => set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
    }),
    { name: "socialai-ui", partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }) }
  )
);
