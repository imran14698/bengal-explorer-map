import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import LinkExt from "@tiptap/extension-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Bold, Italic, Heading1, Heading2, List, ListOrdered, ImageIcon,
  Link as LinkIcon, Trash2, Pencil, Plus, Undo, Redo,
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  published: boolean;
  created_at: string;
}

const BlogEditor = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [published, setPublished] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false }),
      LinkExt.configure({ openOnClick: false }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring prose prose-sm max-w-none",
      },
    },
  });

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setExcerpt("");
    setCoverImage("");
    setPublished(false);
    setEditing(null);
    editor?.commands.setContent("");
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditing(post);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt || "");
    setCoverImage(post.cover_image || "");
    setPublished(post.published);
    editor?.commands.setContent(post.content || "");
    setDialogOpen(true);
  };

  const generateSlug = (t: string) =>
    t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

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
    if (url) setCoverImage(url);
    setUploading(false);
  };

  const insertEditorImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const url = await uploadImage(file);
      if (url) editor?.chain().focus().setImage({ src: url }).run();
    };
    input.click();
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      toast.error("Title and slug are required");
      return;
    }
    setSaving(true);
    const content = editor?.getHTML() || "";
    const payload = { title, slug, excerpt: excerpt || null, content, cover_image: coverImage || null, published };

    let error;
    if (editing) {
      ({ error } = await supabase.from("blog_posts").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("blog_posts").insert(payload));
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
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Post deleted");
      fetchPosts();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold text-foreground">Blog Posts</h3>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">
                {editing ? "Edit Post" : "New Post"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!editing) setSlug(generateSlug(e.target.value));
                    }}
                    placeholder="Post title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="post-slug" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Short description..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Cover Image</Label>
                <div className="flex items-center gap-3">
                  <Input type="file" accept="image/*" onChange={handleCoverUpload} disabled={uploading} />
                  {uploading && <span className="text-xs text-muted-foreground">Uploading...</span>}
                </div>
                {coverImage && (
                  <img src={coverImage} alt="cover" className="h-24 rounded-lg object-cover mt-2" />
                )}
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                {/* Toolbar */}
                <div className="flex flex-wrap gap-1 border border-border rounded-t-md p-1 bg-muted/50">
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8"
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    data-active={editor?.isActive("bold")}>
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8"
                    onClick={() => editor?.chain().focus().toggleItalic().run()}>
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8"
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}>
                    <Heading1 className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8"
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>
                    <Heading2 className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8"
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}>
                    <List className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8"
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8"
                    onClick={insertEditorImage}>
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8"
                    onClick={() => {
                      const url = prompt("Link URL:");
                      if (url) editor?.chain().focus().setLink({ href: url }).run();
                    }}>
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8"
                    onClick={() => editor?.chain().focus().undo().run()}>
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8"
                    onClick={() => editor?.chain().focus().redo().run()}>
                    <Redo className="h-4 w-4" />
                  </Button>
                </div>
                <EditorContent editor={editor} />
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={published} onCheckedChange={setPublished} />
                <Label>Published</Label>
              </div>

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

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No blog posts yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{post.slug}</TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${post.published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {post.published ? "Published" : "Draft"}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
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
      )}
    </div>
  );
};

export default BlogEditor;
