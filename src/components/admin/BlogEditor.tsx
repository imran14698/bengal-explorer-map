import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Trash2, Pencil, Plus, Search, ChevronLeft, ChevronRight,
} from "lucide-react";
import RichEditor from "./RichEditor";
import BlogBulkImport from "./BlogBulkImport";

interface Blog {
  id: string;
  title_en: string;
  title_bn: string | null;
  slug_en: string;
  slug_bn: string | null;
  content_en: string;
  content_bn: string | null;
  image_url: string | null;
  author_id: string | null;
  created_at: string;
}

const PAGE_SIZE = 15;

const slugify = (t: string) =>
  t.toLowerCase().trim().replace(/[^a-z0-9\u0980-\u09FF]+/g, "-").replace(/(^-|-$)/g, "");

const BlogEditor = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);

  // Bilingual fields
  const [titleEn, setTitleEn] = useState("");
  const [titleBn, setTitleBn] = useState("");
  const [slugEn, setSlugEn] = useState("");
  const [slugBn, setSlugBn] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [contentBn, setContentBn] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"en" | "bn">("en");

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });
    setPosts((data as Blog[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const filteredPosts = posts.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      p.title_en?.toLowerCase().includes(q) ||
      p.title_bn?.toLowerCase().includes(q) ||
      p.slug_en?.toLowerCase().includes(q) ||
      p.slug_bn?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPosts = filteredPosts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetForm = () => {
    setTitleEn(""); setTitleBn("");
    setSlugEn(""); setSlugBn("");
    setContentEn(""); setContentBn("");
    setImageUrl("");
    setEditing(null);
    setActiveTab("en");
  };

  const openCreate = () => { resetForm(); setDialogOpen(true); };

  const openEdit = (post: Blog) => {
    setEditing(post);
    setTitleEn(post.title_en || "");
    setTitleBn(post.title_bn || "");
    setSlugEn(post.slug_en || "");
    setSlugBn(post.slug_bn || "");
    setContentEn(post.content_en || "");
    setContentBn(post.content_bn || "");
    setImageUrl(post.image_url || "");
    setActiveTab("en");
    setDialogOpen(true);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from("blog-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) {
      toast.error("Upload failed: " + error.message);
      return null;
    }
    const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    if (url) setImageUrl(url);
    setUploading(false);
  };

  const handleSave = async () => {
    if (!titleEn.trim() || !slugEn.trim() || !contentEn.trim()) {
      toast.error("English title, slug and content are required");
      setActiveTab("en");
      return;
    }
    setSaving(true);
    const payload = {
      title_en: titleEn.trim(),
      title_bn: titleBn.trim() || null,
      slug_en: slugEn.trim(),
      slug_bn: slugBn.trim() || null,
      content_en: contentEn,
      content_bn: contentBn.trim() ? contentBn : null,
      image_url: imageUrl || null,
      author_id: user?.id || null,
    };

    let error;
    if (editing) {
      ({ error } = await supabase.from("blogs").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("blogs").insert(payload));
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(editing ? "Post updated" : "Post created");
      setDialogOpen(false);
      resetForm();
      fetchPosts();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("blogs").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Post deleted"); fetchPosts(); }
  };

  return (
    <div className="space-y-6">
      <BlogBulkImport onImported={fetchPosts} />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between mb-4">
        <h3 className="font-heading text-base sm:text-lg font-semibold text-foreground">
          Blog Posts ({filteredPosts.length})
        </h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blogs..."
              className="w-full sm:w-48 pl-9"
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openCreate} className="shrink-0">
                <Plus className="mr-2 h-4 w-4" /> New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-[calc(100vw-1.5rem)] max-h-[92vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle className="font-heading">{editing ? "Edit Post" : "New Post"}</DialogTitle>
              </DialogHeader>

              <div className="space-y-5 mt-4">
                {/* Cover image (shared between languages) */}
                <div className="space-y-2">
                  <Label>Cover Image (shared)</Label>
                  <div className="flex items-center gap-3">
                    <Input type="file" accept="image/*" onChange={handleCoverUpload} disabled={uploading} />
                    {uploading && <span className="text-xs text-muted-foreground">Uploading...</span>}
                  </div>
                  {imageUrl && (
                    <img src={imageUrl} alt="cover" className="h-24 rounded-lg object-cover mt-2 border border-border" />
                  )}
                </div>

                {/* Bilingual tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "en" | "bn")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="en">
                      English <Badge variant="secondary" className="ml-2 text-[10px]">required</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="bn">
                      বাংলা <Badge variant="outline" className="ml-2 text-[10px]">optional</Badge>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="en" className="space-y-4 mt-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Title (EN)</Label>
                        <Input
                          value={titleEn}
                          onChange={(e) => {
                            setTitleEn(e.target.value);
                            if (!editing) setSlugEn(slugify(e.target.value));
                          }}
                          placeholder="Post title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Slug (EN)</Label>
                        <Input value={slugEn} onChange={(e) => setSlugEn(slugify(e.target.value))} placeholder="post-slug" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Content (EN)</Label>
                      <RichEditor
                        value={contentEn}
                        onChange={setContentEn}
                        onUploadImage={uploadImage}
                        placeholder="Write your English content here..."
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="bn" className="space-y-4 mt-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>শিরোনাম (BN)</Label>
                        <Input
                          value={titleBn}
                          onChange={(e) => {
                            setTitleBn(e.target.value);
                            if (!editing && !slugBn) setSlugBn(slugify(e.target.value));
                          }}
                          placeholder="পোস্টের শিরোনাম"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>স্লাগ (BN)</Label>
                        <Input value={slugBn} onChange={(e) => setSlugBn(slugify(e.target.value))} placeholder="post-slug-bn" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>কন্টেন্ট (BN)</Label>
                      <RichEditor
                        value={contentBn}
                        onChange={setContentBn}
                        onUploadImage={uploadImage}
                        placeholder="এখানে বাংলা কন্টেন্ট লিখুন..."
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : editing ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : paginatedPosts.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          {searchQuery.trim() ? "No matching blog posts." : "No blog posts yet."}
        </p>
      ) : (
        <>
          <div className="rounded-lg border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[160px]">Title (EN)</TableHead>
                  <TableHead className="hidden sm:table-cell min-w-[140px]">Title (BN)</TableHead>
                  <TableHead className="hidden md:table-cell">Slug</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">
                      <div className="line-clamp-2">{post.title_en}</div>
                      <div className="sm:hidden mt-1 text-xs text-muted-foreground">
                        {post.title_bn ? <span className="line-clamp-1">{post.title_bn}</span> : null}
                        <span className="block">{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-foreground/80">
                      {post.title_bn || <span className="text-muted-foreground italic text-xs">—</span>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-xs">{post.slug_en}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {new Date(post.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(post)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(post.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredPosts.length)} of {filteredPosts.length}
              </p>
              <div className="flex items-center gap-1 flex-wrap">
                <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                  .reduce<(number | string)[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    typeof p === "string" ? (
                      <span key={`e-${idx}`} className="px-2 text-sm text-muted-foreground">…</span>
                    ) : (
                      <Button
                        key={p}
                        variant={p === safePage ? "default" : "outline"}
                        size="sm"
                        className="min-w-[36px]"
                        onClick={() => setCurrentPage(p as number)}
                      >
                        {p}
                      </Button>
                    )
                  )}
                <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BlogEditor;
