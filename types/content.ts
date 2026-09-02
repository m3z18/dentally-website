import type { Database } from "@/types/database";

export type ArticleRow = Database["public"]["Tables"]["articles"]["Row"];
export type ArticleInsert = Database["public"]["Tables"]["articles"]["Insert"];
export type ArticleCategoryRow = Database["public"]["Tables"]["article_categories"]["Row"];
export type ArticleReferenceRow = Database["public"]["Tables"]["article_references"]["Row"];
export type FaqRow = Database["public"]["Tables"]["faq_items"]["Row"];
export type SiteSettingsRow = Database["public"]["Tables"]["site_settings"]["Row"];

export type PublicArticle = ArticleRow & {
  article_categories: Pick<ArticleCategoryRow, "slug" | "name_ar" | "name_en"> | null;
  article_references?: ArticleReferenceRow[];
};
