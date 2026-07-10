import { BookOpen, Compass, Edit3, Globe2, ImagePlus, LogOut, Menu, Plus, RefreshCw, Save, Settings, ShieldCheck, Trash2, X } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { api, assetUrl } from "./api";
import { coverOptions, emptyPost, type AdminSettings, type MediaAsset, type Post } from "./domain";

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

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

function SocialIcon({ name }: { name: "x" | "threads" | "telegram" | "linkedin" }) {
  if (name === "x") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2H21.5l-7.11 8.126L22.75 22h-6.54l-5.12-6.693L5.23 22H1.97l7.605-8.692L1.55 2h6.705l4.627 6.118L18.244 2Zm-1.143 17.91h1.804L7.27 3.98H5.334L17.1 19.91Z" />
      </svg>
    );
  }
  if (name === "threads") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.08 2C7.02 2 4 5.36 4 10.93v2.14C4 18.64 7.02 22 12.08 22c4.38 0 7.13-2.28 7.13-5.86 0-2.58-1.48-4.2-4.2-4.82-.16-2.32-1.53-3.77-3.88-3.77-1.5 0-2.76.52-3.73 1.55l1.22 1.42c.67-.7 1.46-1.05 2.37-1.05 1.1 0 1.78.62 1.94 1.74h-1.44c-2.72 0-4.41 1.3-4.41 3.38 0 2 1.55 3.3 3.94 3.3 2.35 0 3.82-1.2 4.14-3.45 1.26.45 1.9 1.24 1.9 2.37 0 2.02-1.88 3.29-4.88 3.29-3.82 0-5.99-2.48-5.99-6.9v-2.24c0-4.42 2.17-6.9 5.99-6.9 2.98 0 4.84 1.38 5.28 3.9h2.1C19.03 4.43 16.32 2 12.08 2Zm-1 13.96c-1.13 0-1.82-.52-1.82-1.36 0-.92.83-1.46 2.27-1.46h1.48c-.17 1.84-.83 2.82-1.93 2.82Z" />
      </svg>
    );
  }
  if (name === "telegram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21.74 4.67 18.5 19.95c-.24 1.08-.88 1.34-1.78.84l-4.92-3.63-2.37 2.28c-.26.26-.48.48-.98.48l.35-5.02 9.13-8.25c.4-.35-.09-.55-.62-.2L6.03 13.56 1.17 12.04c-1.05-.33-1.07-1.05.22-1.55L20.4 3.16c.88-.33 1.65.2 1.34 1.51Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.33 8h4.33v14H.33V8Zm7 0h4.15v1.92h.06c.58-1.1 2-2.25 4.1-2.25 4.38 0 5.19 2.88 5.19 6.63V22H16.5v-6.82c0-1.63-.03-3.72-2.27-3.72-2.27 0-2.62 1.77-2.62 3.6V22H7.33V8Z" />
    </svg>
  );
}

function ShareBar({ title, url }: { title: string; url: string }) {
  const absoluteUrl = typeof window !== "undefined" ? new URL(url, window.location.origin).href : url;
  const shareText = `${title} ${absoluteUrl}`;
  const encodedUrl = encodeURIComponent(absoluteUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedShareText = encodeURIComponent(shareText);
  const targets = [
    { label: "X", icon: "x" as const, href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { label: "Threads", icon: "threads" as const, href: `https://www.threads.net/intent/post?text=${encodedShareText}` },
    { label: "Telegram", icon: "telegram" as const, href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}` },
    { label: "LinkedIn", icon: "linkedin" as const, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
  ];

  return (
    <aside className="share-bar" aria-label="Share this post">
      <span className="share-label">Share this post</span>
      <div className="share-actions">
        {targets.map((target) => (
          <a key={target.label} className="share-link" href={target.href} target="_blank" rel="noreferrer" aria-label={`Share on ${target.label}`}>
            <SocialIcon name={target.icon} />
            <span>{target.label}</span>
          </a>
        ))}
      </div>
    </aside>
  );
}


function Header({ route }: { route: Route }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isAdminRoute = route.name === "admin";
  const go = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <header className={"site-header " + (menuOpen ? "menu-open" : "")}>
      <button className="brand" onClick={() => go("/")}>
        <span className="brand-mark">{isAdminRoute ? "A" : "信"}</span>
        <span>
          <strong>ikcneszzs.xyz</strong>
          <small>{isAdminRoute ? "Admin Control Center" : "文化商业指南"}</small>
        </span>
      </button>
      <button className="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
      <nav>
        <button className={route.name === "home" ? "active" : ""} onClick={() => go("/")}>{isAdminRoute ? "Articles" : "文章"}</button>
        <button className={route.name === "about" ? "active" : ""} onClick={() => go("/about")}>{isAdminRoute ? "Author" : "作者"}</button>
        <button className={route.name === "admin" ? "active" : ""} onClick={() => go("/admin")}>Admin</button>
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
      <img src={assetUrl(post.coverImage)} alt="" />
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
      <img className="detail-cover" src={assetUrl(post.coverImage)} alt="" />
      <div className="article-shell">
        <p className="tag-line">{post.tags.join(" / ")}</p>
        <h1>{post.title}</h1>
        <p className="description">{post.excerpt}</p>
        <ShareBar title={post.title} url={`/article/${post.slug}`} />
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
  const [coverImages, setCoverImages] = useState<MediaAsset[]>([]);
  const [status, setStatus] = useState("");

  async function load() {
    const [nextPosts, nextSettings, nextCoverImages] = await Promise.all([api.adminPosts(), api.getSettings(), api.listCoverImages()]);
    setPosts(nextPosts);
    setSettings(nextSettings);
    setCoverImages(nextCoverImages);
    setSelected((current) => current ?? nextPosts[0] ?? null);
  }

  async function refreshCovers() {
    setCoverImages(await api.listCoverImages());
  }

  useEffect(() => {
    load().catch((error) => setStatus(error.message));
  }, []);

  async function logout() {
    await api.logout();
    onLogout();
  }

  async function generateNow() {
    setStatus("Generating and publishing...");
    const post = await api.generateNow();
    setPosts((items) => [post, ...items]);
    setSelected(post);
    setStatus("Article generated and published.");
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
        <MediaManager images={coverImages} onChanged={refreshCovers} />
        {selected && <PostEditor post={selected} coverImages={coverImages} onSaved={load} onDeleted={load} />}
        {settings && <SettingsEditor settings={settings} onSaved={setSettings} />}
      </section>
    </main>
  );
}

function MediaManager({ images, onChanged }: { images: MediaAsset[]; onChanged: () => void }) {
  const [status, setStatus] = useState("");

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus("Uploading...");
    try {
      await api.uploadCoverImage(file.name, await readFileAsDataUrl(file));
      event.target.value = "";
      setStatus("Cover uploaded.");
      await onChanged();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed");
    }
  }

  async function remove(name: string) {
    await api.deleteCoverImage(name);
    await onChanged();
  }

  return (
    <div className="admin-card media-manager">
      <div className="card-heading">
        <h2><ImagePlus size={18} /> Cover images</h2>
        <label className="upload-button">
          Upload image
          <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={upload} />
        </label>
      </div>
      {status && <p className="form-note">{status}</p>}
      <div className="media-grid">
        {images.map((image) => (
          <div className="media-card" key={image.name}>
            <img src={assetUrl(image.url)} alt="" />
            <div>
              <span>{image.name}</span>
              <button className="danger" onClick={() => remove(image.name)}><Trash2 size={14} /> Delete</button>
            </div>
          </div>
        ))}
        {!images.length && <p className="empty-note">Upload covers here, then generated articles will randomly use them.</p>}
      </div>
    </div>
  );
}

function PostEditor({ post, coverImages, onSaved, onDeleted }: { post: Post; coverImages: MediaAsset[]; onSaved: () => void; onDeleted: () => void }) {
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
        {[...coverOptions, ...coverImages.map((image) => image.url)].map((cover) => (
          <button key={cover} className={draft.coverImage === cover ? "active" : ""} onClick={() => setDraft({ ...draft, coverImage: cover })}>
            <img src={assetUrl(cover)} alt="" />
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
