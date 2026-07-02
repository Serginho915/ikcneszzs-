import { BookOpen, Compass, Edit3, Globe2, LogOut, Plus, RefreshCw, Save, Settings, ShieldCheck, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "./api";
import { coverOptions, emptyPost, type AdminSettings, type Post } from "./domain";

type Route =
  | { name: "home" }
  | { name: "post"; slug: string }
  | { name: "about" }
  | { name: "admin" };

function getRoute(): Route {
  const path = window.location.pathname;
  if (path.startsWith("/article/")) return { name: "post", slug: decodeURIComponent(path.replace("/article/", "")) };
  if (path === "/about") return { name: "about" };
  if (path.startsWith("/admin")) return { name: "admin" };
  return { name: "home" };
}

function navigate(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function ShareBar({ title }: { title: string }) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const targets = [
    { label: "X", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { label: "Threads", href: `https://www.threads.net/intent/post?text=${encodedTitle}%20${encodedUrl}` },
    { label: "Telegram", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
  ];

  return (
    <aside className="share-bar" aria-label="Share this post">
      <span>Share</span>
      {targets.map((target) => (
        <a key={target.label} href={target.href} target="_blank" rel="noreferrer">{target.label}</a>
      ))}
    </aside>
  );
}

function Header({ route }: { route: Route }) {
  const isAdminRoute = route.name === "admin";
  return (
    <header className="site-header">
      <button className="brand" onClick={() => navigate("/")}>
        <span className="brand-mark">{isAdminRoute ? "A" : "信"}</span>
        <span>
          <strong>ikcneszzs.xyz</strong>
          <small>{isAdminRoute ? "Admin Control Center" : "文化商业指南"}</small>
        </span>
      </button>
      <nav>
        <button className={route.name === "home" ? "active" : ""} onClick={() => navigate("/")}>{isAdminRoute ? "Articles" : "文章"}</button>
        <button className={route.name === "about" ? "active" : ""} onClick={() => navigate("/about")}>{isAdminRoute ? "Author" : "作者"}</button>
        <button className={route.name === "admin" ? "active" : ""} onClick={() => navigate("/admin")}>Admin</button>
      </nav>
    </header>
  );
}

function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.listPosts().then(setPosts).catch((error) => setMessage(error.message));
  }, []);

  async function subscribe(event: FormEvent) {
    event.preventDefault();
    await api.subscribe(email);
    setEmail("");
    setMessage("已订阅。下一篇文化商业观察会发送给你。");
  }

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">The Cultural Intelligence Guide for Chinese Business Leaders</p>
          <h1>中国企业走向世界，先理解人，再赢得生意。</h1>
          <p>
            面向工厂老板、外贸负责人、品牌创始人与跨境经营者的简体中文商业文化指南。
            用霍夫斯泰德文化维度、儒家长期主义和真实国际贸易经验，解释欧美客户的信任逻辑。
          </p>
        </div>
        <div className="hero-panel" aria-label="cultural intelligence brief">
          <span>仁</span><span>义</span><span>礼</span><span>智</span><span>信</span>
        </div>
      </section>

      <section className="signal-strip">
        <div><Globe2 size={18} /> 欧美市场心理</div>
        <div><Compass size={18} /> 跨文化谈判</div>
        <div><ShieldCheck size={18} /> 长期信任建设</div>
      </section>

      <section className="feed">
        <div className="section-heading">
          <p className="eyebrow">Latest essays</p>
          <h2>最新文章</h2>
        </div>
        <div className="post-grid">
          {posts.map((post) => <ArticleCard key={post.id} post={post} />)}
        </div>
      </section>

      <section className="newsletter">
        <div>
          <p className="eyebrow">Briefing</p>
          <h2>每周一封出海文化笔记</h2>
        </div>
        <form onSubmit={subscribe}>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="you@company.com" required />
          <button type="submit">订阅</button>
        </form>
        {message && <p className="form-note">{message}</p>}
      </section>
    </main>
  );
}

function ArticleCard({ post }: { post: Post }) {
  return (
    <article className="article-card" onClick={() => navigate(`/article/${post.slug}`)}>
      <img src={post.coverImage} alt="" />
      <div>
        <p className="tag-line">{post.tags.slice(0, 3).join(" / ")}</p>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
      </div>
    </article>
  );
}

function ArticlePage({ slug }: { slug: string }) {
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getPost(slug).then(setPost).catch((err) => setError(err.message));
  }, [slug]);

  if (error) return <main className="narrow"><p className="error">{error}</p></main>;
  if (!post) return <main className="narrow"><p>文章加载中...</p></main>;

  return (
    <main className="article-detail">
      <img className="detail-cover" src={post.coverImage} alt="" />
      <div className="article-shell">
        <p className="tag-line">{post.tags.join(" / ")}</p>
        <h1>{post.title}</h1>
        <p className="description">{post.excerpt}</p>
        <ShareBar title={post.title} />
        <div className="content" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      </div>
    </main>
  );
}

function AboutPage() {
  return (
    <main className="about-page">
      <section>
        <p className="eyebrow">Author</p>
        <h1>以东方智慧理解西方市场。</h1>
        <p>
          作者长期研究跨文化管理、国际贸易与商业心理学，专注帮助中国企业建立国际竞争力。
          文章融合霍夫斯泰德文化维度、儒家商业伦理与真实B2B经验，为中国企业出海提供可落地的方法论。
        </p>
      </section>
      <aside>
        <BookOpen size={24} />
        <h2>核心原则</h2>
        <p>尊重、长期主义、诚信、关系建设、双赢合作。</p>
      </aside>
    </main>
  );
}

function AdminPage() {
  const [authenticated, setAuthenticated] = useState(api.isAuthenticated());
  const [email, setEmail] = useState("admin@ikcneszzs.local");
  const [password, setPassword] = useState("MySecretPassword123!");
  const [error, setError] = useState("");

  async function login(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api.login(email, password);
      setAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  if (!authenticated) {
    return (
      <main className="admin-login">
        <form onSubmit={login}>
          <ShieldCheck size={28} />
          <h1>Superadmin login</h1>
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
          <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" />
          <button type="submit">Login</button>
          {error && <p className="error">{error}</p>}
        </form>
      </main>
    );
  }

  return <AdminDashboard onLogout={() => setAuthenticated(false)} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selected, setSelected] = useState<Post | null>(null);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [status, setStatus] = useState("");

  async function load() {
    const [nextPosts, nextSettings] = await Promise.all([api.adminPosts(), api.getSettings()]);
    setPosts(nextPosts);
    setSettings(nextSettings);
    setSelected(nextPosts[0] ?? null);
  }

  useEffect(() => {
    load().catch((error) => setStatus(error.message));
  }, []);

  async function logout() {
    await api.logout();
    onLogout();
  }

  async function generateNow() {
    setStatus("Generating draft...");
    const post = await api.generateNow();
    setPosts((items) => [post, ...items]);
    setSelected(post);
    setStatus("Draft generated and saved.");
  }

  return (
    <main className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-title">
          <Settings size={20} />
          <strong>Admin Studio</strong>
        </div>
        <button onClick={() => setSelected({ ...emptyPost, id: "", publishedAt: "", updatedAt: "" })}><Plus size={16} /> New article</button>
        <button onClick={generateNow}><RefreshCw size={16} /> Generate now</button>
        <button onClick={logout}><LogOut size={16} /> Logout</button>
        <div className="post-list">
          {posts.map((post) => (
            <button key={post.id} className={selected?.id === post.id ? "active" : ""} onClick={() => setSelected(post)}>
              <span>{post.title}</span>
              <small>{post.status}</small>
            </button>
          ))}
        </div>
      </aside>
      <section className="admin-main">
        {status && <p className="form-note">{status}</p>}
        {selected && <PostEditor post={selected} onSaved={load} onDeleted={load} />}
        {settings && <SettingsEditor settings={settings} onSaved={setSettings} />}
      </section>
    </main>
  );
}

function PostEditor({ post, onSaved, onDeleted }: { post: Post; onSaved: () => void; onDeleted: () => void }) {
  const [draft, setDraft] = useState(post);
  const tagsText = useMemo(() => draft.tags.join(", "), [draft.tags]);

  useEffect(() => setDraft(post), [post]);

  async function save() {
    const payload = { ...draft, tags: tagsText.split(",").map((tag) => tag.trim()).filter(Boolean) };
    if (draft.id) await api.updatePost(draft.id, payload);
    else await api.createPost(payload);
    await onSaved();
  }

  async function remove() {
    if (!draft.id) return;
    await api.deletePost(draft.id);
    await onDeleted();
  }

  return (
    <div className="admin-card editor">
      <div className="card-heading">
        <h2><Edit3 size={18} /> Article editor</h2>
        <div className="button-row">
          <button onClick={save}><Save size={16} /> Save</button>
          {draft.id && <button className="danger" onClick={remove}><Trash2 size={16} /> Delete</button>}
        </div>
      </div>
      <div className="form-grid">
        <label>Title<input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
        <label>Slug<input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} /></label>
        <label>Status<select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Post["status"] })}><option value="draft">Draft</option><option value="published">Published</option></select></label>
        <label>Tags<input value={tagsText} onChange={(e) => setDraft({ ...draft, tags: e.target.value.split(",").map((tag) => tag.trim()) })} /></label>
      </div>
      <label>Excerpt<textarea value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} /></label>
      <label>SEO title<input value={draft.seoTitle} onChange={(e) => setDraft({ ...draft, seoTitle: e.target.value })} /></label>
      <label>SEO description<textarea value={draft.seoDescription} onChange={(e) => setDraft({ ...draft, seoDescription: e.target.value })} /></label>
      <div className="cover-picker">
        {coverOptions.map((cover) => (
          <button key={cover} className={draft.coverImage === cover ? "active" : ""} onClick={() => setDraft({ ...draft, coverImage: cover })}>
            <img src={cover} alt="" />
          </button>
        ))}
      </div>
      <label>Content HTML<textarea className="html-box" value={draft.contentHtml} onChange={(e) => setDraft({ ...draft, contentHtml: e.target.value })} /></label>
    </div>
  );
}

function SettingsEditor({ settings, onSaved }: { settings: AdminSettings; onSaved: (settings: AdminSettings) => void }) {
  const [draft, setDraft] = useState(settings);

  async function save() {
    onSaved(await api.updateSettings(draft));
  }

  return (
    <div className="admin-card settings-card">
      <div className="card-heading">
        <h2><Settings size={18} /> AI generation settings</h2>
        <button onClick={save}><Save size={16} /> Save settings</button>
      </div>
      <label className="toggle"><input type="checkbox" checked={draft.generationEnabled} onChange={(e) => setDraft({ ...draft, generationEnabled: e.target.checked })} /> Autogeneration enabled</label>
      <div className="form-grid">
        <label>Generations<input type="number" min="1" value={draft.generationFrequencyCount} onChange={(e) => setDraft({ ...draft, generationFrequencyCount: Number(e.target.value) })} /></label>
        <label>Period<select value={draft.generationFrequencyPeriod} onChange={(e) => setDraft({ ...draft, generationFrequencyPeriod: e.target.value as AdminSettings["generationFrequencyPeriod"] })}><option value="day">Day</option><option value="week">Week</option><option value="month">Month</option></select></label>
        <label>Times<input value={draft.generationTimes.join(", ")} onChange={(e) => setDraft({ ...draft, generationTimes: e.target.value.split(",").map((item) => item.trim()) })} /></label>
      </div>
      <label>Master prompt<textarea className="prompt-box" value={draft.masterPrompt} onChange={(e) => setDraft({ ...draft, masterPrompt: e.target.value })} /></label>
    </div>
  );
}

export function App() {
  const [route, setRoute] = useState<Route>(getRoute());

  useEffect(() => {
    const update = () => setRoute(getRoute());
    window.addEventListener("popstate", update);
    api.refresh();
    return () => window.removeEventListener("popstate", update);
  }, []);

  return (
    <>
      <Header route={route} />
      {route.name === "home" && <HomePage />}
      {route.name === "post" && <ArticlePage slug={route.slug} />}
      {route.name === "about" && <AboutPage />}
      {route.name === "admin" && <AdminPage />}
      <footer>{route.name === "admin" ? "ikcneszzs.xyz · Culture is not a barrier to business, but its map." : "ikcneszzs.xyz · 文化不是商业的障碍，而是商业的地图。"}</footer>
    </>
  );
}
