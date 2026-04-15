import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import * as XLSX from "xlsx";

interface Division {
  id: number;
  name: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
}

const BulkImport = () => {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      const [divRes, catRes] = await Promise.all([
        supabase.from("divisions").select("id, name, slug").order("name"),
        supabase.from("categories").select("id, name").order("name"),
      ]);
      setDivisions(divRes.data || []);
      setCategories(catRes.data || []);
    };
    fetch();
  }, []);

  const findDivisionId = (value: string): number | null => {
    const lower = value?.toString().trim().toLowerCase();
    if (!lower) return null;
    const match = divisions.find(
      (d) => d.name.toLowerCase() === lower || d.slug.toLowerCase() === lower || d.id.toString() === lower
    );
    return match?.id ?? null;
  };

  const findOrCreateCategory = async (value: string): Promise<number | null> => {
    const trimmed = value?.toString().trim();
    if (!trimmed) return null;
    const lower = trimmed.toLowerCase();

    // Check existing
    const existing = categories.find(
      (c) => c.name.toLowerCase() === lower || c.id.toString() === lower
    );
    if (existing) return existing.id;

    // Create new category
    const { data, error } = await supabase
      .from("categories")
      .insert({ name: trimmed })
      .select("id, name")
      .single();

    if (error || !data) return null;

    // Add to local cache
    setCategories((prev) => [...prev, data as Category]);
    categories.push(data as Category);
    return data.id;
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      if (rows.length === 0) {
        toast({ title: "Empty file", description: "No rows found.", variant: "destructive" });
        setImporting(false);
        return;
      }

      let success = 0;
      let failed = 0;
      const skippedDetails: string[] = [];

      for (const row of rows) {
        const divisionValue = row["division"] || row["Division"] || row["division_name"] || "";
        const categoryValue = row["category"] || row["Category"] || row["category_name"] || "";
        const infoValue = row["info"] || row["Info"] || row["information"] || row["Information"] || row["content"] || row["Content"] || "";

        const divisionId = findDivisionId(divisionValue);
        const categoryId = await findOrCreateCategory(categoryValue);

        if (divisionId && categoryId && infoValue.toString().trim()) {
          const { error } = await supabase.from("division_info").insert({
            division_id: divisionId,
            category_id: categoryId,
            content: infoValue.toString().trim(),
          });
          if (error) {
            failed++;
            skippedDetails.push(`Insert error: ${error.message}`);
          } else {
            success++;
          }
        } else {
          failed++;
          const reasons: string[] = [];
          if (!divisionId) reasons.push(`division "${divisionValue}" not found`);
          if (!categoryId) reasons.push(`category "${categoryValue}" could not be created`);
          if (!infoValue.toString().trim()) reasons.push("empty info");
          skippedDetails.push(reasons.join(", "));
        }
      }

      setResult({ success, failed });
      if (success > 0) {
        toast({ title: `Imported ${success} records${failed > 0 ? `, ${failed} skipped` : ""}` });
      } else {
        toast({
          title: "No valid records",
          description: skippedDetails.length > 0
            ? `Issues: ${[...new Set(skippedDetails)].slice(0, 3).join("; ")}`
            : "Check columns: division, category, info",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({ title: "File error", description: err.message, variant: "destructive" });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-heading text-lg font-bold text-foreground">Bulk Import from Excel</h3>

      <div className="rounded-lg border border-dashed border-border bg-secondary/20 p-8 text-center">
        <FileSpreadsheet className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="mb-1 text-sm font-medium text-foreground">Upload an Excel file (.xlsx)</p>
        <p className="mb-4 text-xs text-muted-foreground">
          Required columns: <code className="rounded bg-secondary px-1">division</code>,{" "}
          <code className="rounded bg-secondary px-1">category</code>,{" "}
          <code className="rounded bg-secondary px-1">info</code>
        </p>
        <p className="mb-4 text-xs text-muted-foreground">
          Use division/category <strong>names</strong> (e.g. "Dhaka", "Education"). Missing categories will be auto-created.
        </p>
        <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" id="bulk-upload" />
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => fileRef.current?.click()} disabled={importing} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            {importing ? "Importing..." : "Choose File"}
          </Button>
          <a href="/sample-bulk-import.xlsx" download>
            <Button variant="ghost" size="sm" type="button">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Download Sample
            </Button>
          </a>
        </div>
      </div>

      {result && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-foreground">
              Import complete: {result.success} added, {result.failed} skipped
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkImport;
