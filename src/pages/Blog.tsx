import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

const POSTS_PER_PAGE = 6;

const Blog = () => {
  const [posts, setPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const from = page * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      const { count } = await supabase
        .from("blogs")
        .select("id", { count: "exact", head: true });
      setTotal(count || 0);

      const { data } = await supabase
        .from("blogs")
        .select("id, title, slug, content, image_url, created_at")
        .order("created_at", { ascending: false })
        .range(from, to);
      setPosts(data || []);
      setLoading(false);
    };
    fetchPosts();
  }, [page]);

  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  const getExcerpt = (html: string) => {
    const text = html.replace(/<[^>]+>/g, "");
    return text.length > 120 ? text.slice(0, 120) + "…" : text;
  };

  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar />

      <main className="container py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10">
            <h2 className="font-heading text-4xl font-extrabold tracking-tight text-foreground">Blog</h2>
            <p className="mt-2 text-muted-foreground">Stories, guides & insights about Bangladesh</p>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-72 w-full rounded-2xl" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Calendar className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg font-medium">No articles yet</p>
              <p className="text-muted-foreground/70 text-sm mt-1">Check back soon for new content.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                {posts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="group">
                    <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                      {post.image_url ? (
                        <div className="h-44 overflow-hidden">
                          <img
                            src={post.image_url}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="h-44 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                          <span className="font-heading text-5xl font-bold text-primary/20">
                            {post.title.charAt(0)}
                          </span>
                        </div>
                      )}
                      <CardHeader className="pb-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {new Date(post.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <CardTitle className="font-heading text-lg leading-snug group-hover:text-primary transition-colors">
                          {post.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">{getExcerpt(post.content)}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i}
                      variant={i === page ? "default" : "outline"}
                      size="icon"
                      className="rounded-xl h-9 w-9 text-sm"
                      onClick={() => setPage(i)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Blog;
