import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Calendar, Search, Languages } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage, pickLang, type Lang } from "@/hooks/useLanguage";

interface Blog {
  id: string;
  title_en: string;
  title_bn: string | null;
  slug_en: string;
  slug_bn: string | null;
  content_en: string;
  content_bn: string | null;
  image_url: string | null;
  created_at: string;
}

const POSTS_PER_PAGE = 15;

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const ui = {
  en: {
    heading: "Stories",
    subtitle: "Stories, guides & insights about Bangladesh",
    search: "Search by title...",
    noMatch: "No matching articles",
    tryDiff: "Try a different keyword.",
    switchTo: "বাংলা",
  },
  bn: {
    heading: "গল্প",
    subtitle: "বাংলাদেশ সম্পর্কে গল্প, গাইড ও তথ্য",
    search: "শিরোনাম দিয়ে খুঁজুন...",
    noMatch: "কোনো লেখা পাওয়া যায়নি",
    tryDiff: "অন্য কীওয়ার্ড চেষ্টা করুন।",
    switchTo: "English",
  },
};

const Blog = () => {
  const { lang: globalLang, setLang: setGlobalLang } = useLanguage();
  const [lang, setLocalLang] = useState<Lang>(globalLang);
  useEffect(() => { setLocalLang(globalLang); }, [globalLang]);

  const [posts, setPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const t = ui[lang];

  useEffect(() => { setPage(0); }, [search, lang]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const from = page * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;
      const trimmed = search.trim();

      let countQuery = supabase.from("blogs").select("id", { count: "exact", head: true });
      let dataQuery = supabase
        .from("blogs")
        .select("id, title_en, title_bn, slug_en, slug_bn, content_en, content_bn, image_url, created_at")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (trimmed) {
        const titleCol = lang === "bn" ? "title_bn" : "title_en";
        // search both fields, prefer current lang
        const filter = `${titleCol}.ilike.%${trimmed}%,title_en.ilike.%${trimmed}%,title_bn.ilike.%${trimmed}%`;
        countQuery = countQuery.or(filter);
        dataQuery = dataQuery.or(filter);
      }

      const [{ count }, { data }] = await Promise.all([countQuery, dataQuery]);
      setTotal(count || 0);
      setPosts((data as Blog[]) || []);
      setLoading(false);
    };

    void fetchPosts();
  }, [page, search, lang]);

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  const getExcerpt = (html: string) => {
    const text = html.replace(/<[^>]+>/g, "");
    return text.length > 120 ? `${text.slice(0, 120)}…` : text;
  };

  const switchLang = () => {
    const next: Lang = lang === "en" ? "bn" : "en";
    setLocalLang(next);
    setGlobalLang(next);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background font-body">
      <Navbar />

      <main className="container flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 sm:mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">{t.heading}</h1>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground">{t.subtitle}</p>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.search}
                  className="rounded-xl border-border/70 bg-card pl-9"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={switchLang}
                className="rounded-xl gap-1.5 shrink-0"
                title={`Switch to ${t.switchTo}`}
              >
                <Languages className="h-4 w-4" />
                {t.switchTo}
              </Button>
            </div>
          </motion.div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-72 w-full rounded-2xl" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <Calendar className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-muted-foreground">{t.noMatch}</p>
              <p className="mt-1 text-sm text-muted-foreground/70">{t.tryDiff}</p>
            </motion.div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                {posts.map((post, i) => {
                  const title = pickLang(lang, post.title_bn, post.title_en);
                  const content = pickLang(lang, post.content_bn, post.content_en);
                  const slug = lang === "bn" && post.slug_bn ? post.slug_bn : post.slug_en;
                  return (
                    <motion.div
                      key={post.id}
                      custom={i}
                      initial="hidden"
                      animate="visible"
                      variants={cardVariants}
                    >
                      <Link to={`/blog/${slug}`} className="group block h-full">
                        <Card className="h-full overflow-hidden rounded-2xl border border-border/60 bg-card hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                          {post.image_url ? (
                            <div className="h-44 overflow-hidden">
                              <img
                                src={post.image_url}
                                alt={title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            </div>
                          ) : (
                            <div className="flex h-44 items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5">
                              <span className="font-heading text-5xl font-bold text-primary/25">{title.charAt(0)}</span>
                            </div>
                          )}
                          <CardHeader className="pb-2">
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              {new Date(post.created_at).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                            <CardTitle className="font-heading text-lg leading-snug transition-colors group-hover:text-primary">
                              {title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="line-clamp-2 text-sm text-muted-foreground">{getExcerpt(content)}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-10 flex items-center justify-center gap-2"
                >
                  <Button variant="outline" size="icon" className="rounded-xl" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i}
                      variant={i === page ? "default" : "outline"}
                      size="icon"
                      className="h-9 w-9 rounded-xl text-sm"
                      onClick={() => setPage(i)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button variant="outline" size="icon" className="rounded-xl" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
