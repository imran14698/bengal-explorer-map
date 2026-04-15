import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { MapPin, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
    const fetch = async () => {
      const { data } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .single();
      setPost(data);
      setLoading(false);
    };
    fetch();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-96 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="font-heading text-2xl font-bold text-foreground">Post Not Found</h2>
          <Link to="/blog" className="text-primary hover:underline text-sm">← Back to Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold text-foreground">Bangladesh InfoMap</h1>
              <p className="text-xs text-muted-foreground">Explore divisions interactively</p>
            </div>
          </Link>
          <nav className="flex gap-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Map</Link>
            <Link to="/blog" className="text-sm font-medium text-foreground">Blog</Link>
          </nav>
        </div>
      </header>

      <main className="container py-12">
        <div className="mx-auto max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>

          {post.image_url && (
            <img src={post.image_url} alt={post.title} className="w-full h-64 object-cover rounded-xl mb-8" />
          )}

          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">{post.title}</h1>
          <p className="text-sm text-muted-foreground mb-8">
            {new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div
            className="prose prose-green max-w-none text-foreground
              prose-headings:font-heading prose-headings:text-foreground
              prose-p:text-foreground/85 prose-a:text-primary
              prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </main>
    </div>
  );
};

export default BlogPost;
