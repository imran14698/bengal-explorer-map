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

interface Division {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

const DivisionInfoForm = () => {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [divisionId, setDivisionId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [info, setInfo] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      const [divRes, catRes] = await Promise.all([
        supabase.from("divisions").select("id, name").order("name"),
        supabase.from("categories").select("id, name").order("name"),
      ]);
      setDivisions(divRes.data || []);
      setCategories(catRes.data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!divisionId || !categoryId || !info.trim()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("division_info").insert({
      division_id: divisionId,
      category_id: categoryId,
      info: info.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setInfo("");
      toast({ title: "Division info added successfully" });
    }
  };

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
    <div className="space-y-6">
      <h3 className="font-heading text-lg font-bold text-foreground">Add Division Information</h3>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div className="space-y-2">
          <Label>Division</Label>
          <Select value={divisionId} onValueChange={setDivisionId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a division" />
            </SelectTrigger>
            <SelectContent>
              {divisions.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
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
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Information</Label>
          <Textarea
            placeholder="Enter the information text..."
            value={info}
            onChange={(e) => setInfo(e.target.value)}
            rows={4}
          />
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add Info"}
        </Button>
      </form>
    </div>
  );
};

export default DivisionInfoForm;
