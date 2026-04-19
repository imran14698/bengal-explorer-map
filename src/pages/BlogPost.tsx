import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Languages } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage, pickLang, type Lang } from "@/hooks/useLanguage";

interface Post {
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

const ui = {
  en: { back: "Back to Blog", notFound: "Post Not Found", switchTo: "বাংলা", noTrans: "No Bangla translation available — showing English." },
  bn: { back: "ব্লগে ফিরে যান", notFound: "পোস্ট পাওয়া যায়নি", switchTo: "English", noTrans: "ইংরেজি অনুবাদ পাওয়া যায়নি — বাংলা দেখানো হচ্ছে।" },
};

const BlogPost = () => {
  const { slug } = useParams();
  const { lang: globalLang, setLang: setGlobalLang } = useLanguage();
  const [lang, setLocalLang] = useState<Lang>(globalLang);
  useEffect(() => { setLocalLang(globalLang); }, [globalLang]);

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const t = ui[lang];

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      // Match either slug_en or slug_bn
      const { data } = await supabase
        .from("blogs")
        .select("*")
        .or(`slug_en.eq.${slug},slug_bn.eq.${slug}`)
        .maybeSingle();
      setPost(data as Post | null);
      setLoading(false);
    };
    void fetchPost();
  }, [slug]);

  const switchLang = () => {
    const next: Lang = lang === "en" ? "bn" : "en";
    setLocalLang(next);
    setGlobalLang(next);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="container mx-auto max-w-3xl flex-1 space-y-4 py-12">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="flex flex-1 items-center justify-center py-32">
          <div className="space-y-4 text-center">
            <h2 className="font-heading text-2xl font-bold text-foreground">{t.notFound}</h2>
            <Link to="/blog" className="text-sm text-primary hover:underline">← {t.back}</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const title = pickLang(lang, post.title_bn, post.title_en);
  const content = pickLang(lang, post.content_bn, post.content_en);
  const fellBack =
    (lang === "bn" && (!post.title_bn?.trim() || !post.content_bn?.trim())) ||
    (lang === "en" && (!post.title_en?.trim() || !post.content_en?.trim()));

  return (
    <div className="flex min-h-screen flex-col bg-background font-body">
      <Navbar />

      <main className="container flex-1 py-12">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl"
        >
          <div className="mb-8 flex items-center justify-between gap-3">
            <Link to="/blog" className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> {t.back}
            </Link>
            <Button variant="outline" size="sm" onClick={switchLang} className="rounded-xl gap-1.5">
              <Languages className="h-4 w-4" /> {t.switchTo}
            </Button>
          </div>

          {post.image_url && (
            <motion.img
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              src={post.image_url}
              alt={title}
              className="mb-8 h-72 w-full rounded-2xl object-cover shadow-lg"
            />
          )}

          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {new Date(post.created_at).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <h1 className="mb-4 font-heading text-4xl font-extrabold leading-tight tracking-tight text-foreground">{title}</h1>

          {fellBack && (
            <p className="mb-6 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              {t.noTrans}
            </p>
          )}

          <div
            className="rich-content text-foreground/90"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </motion.article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
