import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Division {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface DivisionInfoRow {
  id: number;
  division_id: number;
  category_id: number;
  content: string;
  divisions: { name: string } | null;
  categories: { name: string } | null;
}

const DivisionInfoForm = () => {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [divisionId, setDivisionId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [rows, setRows] = useState<DivisionInfoRow[]>([]);
  const [filterDivision, setFilterDivision] = useState("all");
  const { toast } = useToast();

  const fetchAll = async () => {
    const [divRes, catRes, infoRes] = await Promise.all([
      supabase.from("divisions").select("id, name").order("name"),
      supabase.from("categories").select("id, name").order("name"),
      supabase
        .from("division_info")
        .select("id, division_id, category_id, content, divisions(name), categories(name)")
        .order("id", { ascending: false }),
    ]);
    setDivisions(divRes.data || []);
    setCategories(catRes.data || []);
    setRows((infoRes.data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const resetForm = () => {
    setDivisionId("");
    setCategoryId("");
    setContent("");
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!divisionId || !categoryId || !content.trim()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    if (editingId) {
      const { error } = await supabase
        .from("division_info")
        .update({
          division_id: Number(divisionId),
          category_id: Number(categoryId),
          content: content.trim(),
        })
        .eq("id", editingId);
      setSubmitting(false);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Updated successfully" });
        resetForm();
        fetchAll();
      }
    } else {
      const { error } = await supabase.from("division_info").insert({
        division_id: Number(divisionId),
        category_id: Number(categoryId),
        content: content.trim(),
      });
      setSubmitting(false);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        setContent("");
        toast({ title: "Added successfully" });
        fetchAll();
      }
    }
  };

  const handleEdit = (row: DivisionInfoRow) => {
    setEditingId(row.id);
    setDivisionId(row.division_id.toString());
    setCategoryId(row.category_id.toString());
    setContent(row.content);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("division_info").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted successfully" });
      fetchAll();
    }
  };

  const filteredRows = filterDivision === "all"
    ? rows
    : rows.filter((r) => r.division_id.toString() === filterDivision);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Form */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-foreground">
            {editingId ? "Edit Division Info" : "Add Division Info"}
          </h3>
          {editingId && (
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="mr-1 h-4 w-4" /> Cancel Edit
            </Button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div className="space-y-2">
            <Label>Division</Label>
            <Select value={divisionId} onValueChange={setDivisionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a division" />
              </SelectTrigger>
              <SelectContent>
                {divisions.map((d) => (
                  <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Information</Label>
            <Textarea
              placeholder="Enter the information text..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting
              ? editingId ? "Updating..." : "Adding..."
              : editingId ? "Update Info" : "Add Info"}
          </Button>
        </form>
      </div>

      {/* List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-foreground">
            All Division Info ({filteredRows.length})
          </h3>
          <Select value={filterDivision} onValueChange={setFilterDivision}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by division" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Divisions</SelectItem>
              {divisions.map((d) => (
                <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Division</TableHead>
                <TableHead className="w-[140px]">Category</TableHead>
                <TableHead>Content</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.divisions?.name || "—"}</TableCell>
                    <TableCell>{row.categories?.name || "—"}</TableCell>
                    <TableCell className="max-w-xs truncate">{row.content}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(row)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(row.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default DivisionInfoForm;
