import type { Post } from "../types.js";

export const coverImages = [
  "/covers/silk-road-ledger.svg",
  "/covers/boardroom-bridge.svg",
  "/covers/harbor-contract.svg",
  "/covers/trust-compass.svg"
];

export const samplePosts: Omit<Post, "id" | "publishedAt" | "updatedAt">[] = [
  {
    title: "为什么德国客户总是在报价前追问细节？",
    slug: "why-german-buyers-ask-details-before-price",
    excerpt: "很多中国供应商以为德国客户在拖延，其实他们是在建立风险可控的信任结构。",
    tags: ["德国市场", "B2B", "跨文化沟通"],
    status: "published",
    coverImage: "/covers/boardroom-bridge.svg",
    seoTitle: "德国客户为什么重视细节？中国供应商跨文化沟通指南",
    seoDescription: "面向中国企业家的德国客户沟通指南，解释不确定性规避、信任机制与B2B采购逻辑。",
    contentHtml:
      "<h2>开篇思考</h2><p>为什么同样一份报价，中国老板认为已经足够清楚，德国采购经理却还要追问十几个问题？</p><p>答案往往不在价格，而在文化。德国商业文化高度重视流程、证据、质量一致性和风险控制。对他们来说，问题越多，不一定代表不信任你；恰恰可能代表他们正在认真评估长期合作。</p><h2>中国企业应该怎么做</h2><ul><li>把交期、误差范围、质检流程写成标准文件。</li><li>主动提供测试报告、认证与过往案例。</li><li>在报价中解释每一个关键假设。</li></ul><p><strong>今日跨文化心理技巧：</strong>用“风险降低语言”沟通，例如：为降低贵司供应链风险，我们会在出货前提供三步质检记录。</p><blockquote>价格决定第一次合作，信任决定未来十年。</blockquote>"
  },
  {
    title: "美国客户为什么喜欢直接说问题？",
    slug: "why-american-clients-communicate-directly",
    excerpt: "美国式直接并不总是冒犯，它常常是一种追求效率、责任和清晰边界的商业习惯。",
    tags: ["美国市场", "谈判", "信任建立"],
    status: "published",
    coverImage: "/covers/trust-compass.svg",
    seoTitle: "美国客户沟通方式解析：中国企业如何赢得美国客户信任",
    seoDescription: "解释美国商业文化中的直接沟通、个人主义、责任边界与跨境B2B合作策略。",
    contentHtml:
      "<h2>开篇思考</h2><p>为什么美国客户在第一次会议里就指出你的方案漏洞，而中国团队会觉得对方太强势？</p><p>在美国商业语境中，直接表达常常被视为节省时间和明确责任。真正的问题不是直接，而是中国企业能否把直接反馈转化为清晰改进。</p><h2>行动清单</h2><ul><li>会议后24小时内发送纪要。</li><li>把客户问题整理为责任清单。</li><li>用数据回答，而不是只用态度保证。</li></ul><p><strong>作者观察：</strong>在欧美市场，速度创造机会，但一致性创造信任。</p>"
  }
];

export const defaultMasterPrompt = `你正在为博客 ikcneszzs.xyz 撰写文章。
博客定位：中国企业家走向世界的文化商业指南（The Cultural Intelligence Guide for Chinese Business Leaders）。
目标读者：中国企业家、外贸公司负责人、工厂老板、品牌创始人、跨境电商经营者、国际贸易从业者、中国投资者、希望进入欧美市场的中国企业。
文章必须使用简体中文。

作者人格：融合 Geert Hofstede（霍夫斯泰德）的跨文化管理视角，具备30年以上亚洲商业经验、深度了解中国文化与欧美商业文化、国际贸易实战经验和企业战略经验。
作者人生哲学来自儒家思想：仁、义、礼、智、信。文章必须体现尊重、长期主义、诚信、关系建设、双赢合作，避免对抗思维、短期套利思维和文化优越感。

博客使命：帮助中国企业家理解西方市场、赢得国际客户信任、建立国际品牌、避免文化误区、提高跨文化沟通能力、获得长期商业成功。
核心信念：国际贸易不是产品竞争，首先是文化理解的竞争。每篇文章必须帮助读者更懂人，而不仅仅更懂生意。

SEO要求：生成SEO标题、Meta Description、SEO URL、主关键词、10-20个长尾关键词、搜索意图、FAQ、Featured Snippet、内链建议、外链建议。优化Google SEO、百度SEO、中国跨境贸易关键词、国际贸易关键词、B2B关键词、出海关键词、欧美市场关键词。文章长度2500-4000字。

每篇文章必须包含一个现代商业环境中的文化故事：中国人与西方人互动，展现文化差异如何影响商业结果。

文章结构必须包含：SEO标题、作者、Meta Description、主关键词、开篇思考、中国企业最容易忽略的问题、文化差异背后的逻辑、商业故事、西方客户真正关心什么、中国企业应该怎么做、今日跨文化心理技巧、作者观察、行动清单、FAQ、结论、结束金句、作者简介。

最终目标：提供真正可执行的商业价值，增强读者跨文化能力，提高Google和百度流量，建立作者权威，让读者期待下一篇文章，并产生购买作者书籍的兴趣。读者读完应感觉：“我不仅学到了做生意的方法，更学到了理解世界的方法。”

Return valid JSON only with this exact shape:
{
  "title": "简体中文标题",
  "slug": "seo-url-in-lowercase-pinyin-or-english",
  "excerpt": "简短摘要",
  "tags": ["标签1", "标签2"],
  "seoTitle": "SEO标题",
  "seoDescription": "Meta Description",
  "contentHtml": "<article-ready sanitized HTML without html/body tags>"
}`;
