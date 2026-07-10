import { z } from "zod";
import { coverImages } from "../data/samplePosts.js";
import { getAdminSettings } from "./adminSettings.js";
import { sanitizeHtml } from "./htmlSanitizer.js";

const articleSchema = z.object({
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  tags: z.array(z.string()),
  seoTitle: z.string(),
  seoDescription: z.string(),
  contentHtml: z.string()
});

function pickCover(slug: string) {
  const value = [...slug].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return coverImages[value % coverImages.length];
}

export async function generateArticle() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      const slug = `dev-placeholder-${Date.now()}`;
      return {
        title: "开发环境占位文章：如何用文化理解赢得客户信任",
        slug,
        excerpt: "这是缺少 OpenRouter key 时的开发占位内容，生产环境会返回明确错误。",
        tags: ["开发环境", "跨文化", "信任"],
        status: "published" as const,
        coverImage: pickCover(slug),
        seoTitle: "开发环境占位文章：跨文化商业信任",
        seoDescription: "OpenRouter key 未配置时生成的开发占位文章，用于验证后台流程。",
        contentHtml: sanitizeHtml(
          "<h2>开篇思考</h2><p>没有真实AI key时，系统仍应稳定运行。</p><p>这篇文章证明生成流程、数据库保存、封面持久化和管理后台都可以工作。</p>"
        )
      };
    }
    throw new Error("OPENROUTER_API_KEY is not configured");
  }
  const settings = await getAdminSettings();
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL ?? "meta-llama/llama-3.1-8b-instruct",
      messages: [
        { role: "system", content: settings.masterPrompt },
        {
          role: "user",
          content:
            "请根据 master prompt 生成一篇全新的简体中文文章。不要生成图片。只返回JSON，字段必须是 title, slug, excerpt, tags, seoTitle, seoDescription, contentHtml。"
        }
      ],
      response_format: { type: "json_object" }
    })
  });
  if (!response.ok) throw new Error(`OpenRouter error: ${response.status}`);
  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content;
  const article = articleSchema.parse(JSON.parse(raw));
  return {
    ...article,
    status: "published" as const,
    coverImage: pickCover(article.slug),
    contentHtml: sanitizeHtml(article.contentHtml)
  };
}
