import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const { data } = await supabase.from("blogs").select("*").eq("slug", slug).single();
      setPost(data);
      setLoading(false);
    };
    void fetchPost();
  }, [slug]);

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
            <h2 className="font-heading text-2xl font-bold text-foreground">Post Not Found</h2>
            <Link to="/blog" className="text-sm text-primary hover:underline">← Back to Blog</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
          <Link to="/blog" className="group mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Blog
          </Link>

          {post.image_url && (
            <motion.img
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              src={post.image_url}
              alt={post.title}
              className="mb-8 h-72 w-full rounded-2xl object-cover shadow-lg"
            />
          )}

          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {new Date(post.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <h1 className="mb-8 font-heading text-4xl font-extrabold leading-tight tracking-tight text-foreground">{post.title}</h1>

          <div
            className="prose prose-green dark:prose-invert max-w-none text-foreground/90
              prose-headings:font-heading prose-headings:tracking-tight prose-headings:text-foreground
              prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl prose-img:shadow-md
              prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </motion.article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
