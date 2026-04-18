import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
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

interface SkippedRow {
  rowNumber: number;
  division: string;
  category: string;
  info: string;
  reason: string;
}

const BulkImport = () => {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);
  const [skippedRows, setSkippedRows] = useState<SkippedRow[]>([]);
  const [showSkipped, setShowSkipped] = useState(false);
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

    const existing = categories.find(
      (c) => c.name.toLowerCase() === lower || c.id.toString() === lower
    );
    if (existing) return existing.id;

    const { data, error } = await supabase
      .from("categories")
      .insert({ name: trimmed })
      .select("id, name")
      .single();

    if (error || !data) return null;

    setCategories((prev) => [...prev, data as Category]);
    categories.push(data as Category);
    return data.id;
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setResult(null);
    setSkippedRows([]);
    setShowSkipped(false);

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
      const skipped: SkippedRow[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const divisionValue = (row["division"] || row["Division"] || row["division_name"] || "").toString();
        const categoryValue = (row["category"] || row["Category"] || row["category_name"] || "").toString();
        const infoValue = (row["info"] || row["Info"] || row["information"] || row["Information"] || row["content"] || row["Content"] || "").toString();
        const bnInfoValue = (row["info_bn"] || row["bn_info"] || row["bn_content"] || row["content_bn"] || row["Information (Bangla)"] || row["Bangla"] || row["bangla"] || "").toString();

        const divisionId = findDivisionId(divisionValue);
        const categoryId = await findOrCreateCategory(categoryValue);

        if (divisionId && categoryId && infoValue.trim()) {
          const { error } = await supabase.from("division_info").insert({
            division_id: divisionId,
            category_id: categoryId,
            content: infoValue.trim(),
            bn_content: bnInfoValue.trim() || null,
          });
          if (error) {
            failed++;
            skipped.push({
              rowNumber: i + 2,
              division: divisionValue,
              category: categoryValue,
              info: infoValue.substring(0, 80),
              reason: `Insert error: ${error.message}`,
            });
          } else {
            success++;
          }
        } else {
          failed++;
          const reasons: string[] = [];
          if (!divisionId) reasons.push(`Division "${divisionValue}" not found`);
          if (!categoryId) reasons.push(`Category "${categoryValue}" could not be created`);
          if (!infoValue.trim()) reasons.push("Empty info");
          skipped.push({
            rowNumber: i + 2,
            division: divisionValue,
            category: categoryValue,
            info: infoValue.substring(0, 80),
            reason: reasons.join("; "),
          });
        }
      }

      setResult({ success, failed });
      setSkippedRows(skipped);
      if (skipped.length > 0) setShowSkipped(true);

      if (success > 0) {
        toast({ title: `Imported ${success} records${failed > 0 ? `, ${failed} skipped` : ""}` });
      } else {
        toast({ title: "No valid records imported", variant: "destructive" });
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
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-foreground">
              Import complete: {result.success} added, {result.failed} skipped
            </span>
          </div>

          {skippedRows.length > 0 && (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => setShowSkipped(!showSkipped)}
              >
                <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                {skippedRows.length} skipped row{skippedRows.length > 1 ? "s" : ""}
                {showSkipped ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
              </Button>

              {showSkipped && (
                <div className="rounded-md border border-border overflow-auto max-h-64">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Row</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Division</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Category</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Info</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skippedRows.map((sr, idx) => (
                        <tr key={idx} className="border-t border-border">
                          <td className="px-3 py-2 text-foreground">{sr.rowNumber}</td>
                          <td className="px-3 py-2 text-foreground">{sr.division || "—"}</td>
                          <td className="px-3 py-2 text-foreground">{sr.category || "—"}</td>
                          <td className="px-3 py-2 text-foreground max-w-[200px] truncate">{sr.info || "—"}</td>
                          <td className="px-3 py-2 text-destructive">{sr.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkImport;
