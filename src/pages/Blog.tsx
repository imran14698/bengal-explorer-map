import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("blogs")
        .select("id, title, slug, content, image_url, created_at")
        .order("created_at", { ascending: false });
      setPosts(data || []);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const getExcerpt = (html: string) => {
    const text = html.replace(/<[^>]+>/g, "");
    return text.length > 150 ? text.slice(0, 150) + "…" : text;
  };

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
          <h2 className="font-heading text-3xl font-bold text-foreground mb-8">Blog</h2>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <p className="text-muted-foreground text-center py-16">No articles yet.</p>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex flex-col sm:flex-row">
                      {post.image_url && (
                        <div className="sm:w-48 h-40 sm:h-auto flex-shrink-0">
                          <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                        <CardHeader>
                          <CardTitle className="font-heading text-lg">{post.title}</CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                          </p>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">{getExcerpt(post.content)}</p>
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Blog;
