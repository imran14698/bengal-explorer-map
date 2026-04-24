import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Upload, FileSpreadsheet, CheckCircle2, AlertTriangle,
  ChevronDown, ChevronUp,
} from "lucide-react";
import * as XLSX from "xlsx";

interface SkippedRow {
  rowNumber: number;
  title: string;
  reason: string;
}

const slugify = (t: string) =>
  t.toLowerCase().trim().replace(/[^a-z0-9\u0980-\u09FF]+/g, "-").replace(/(^-|-$)/g, "");

const pick = (row: any, keys: string[]): string => {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && row[k].toString().trim() !== "") {
      return row[k].toString();
    }
  }
  return "";
};

const BlogBulkImport = ({ onImported }: { onImported?: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);
  const [skippedRows, setSkippedRows] = useState<SkippedRow[]>([]);
  const [showSkipped, setShowSkipped] = useState(false);

  const parseFile = async (file: File): Promise<any[]> => {
    const name = file.name.toLowerCase();
    if (name.endsWith(".json")) {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array of objects");
      return parsed;
    }
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setResult(null);
    setSkippedRows([]);
    setShowSkipped(false);

    try {
      const rows = await parseFile(file);
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
        const titleEn = pick(row, ["title_en", "title", "Title", "Title (EN)", "title_english"]).trim();
        const titleBn = pick(row, ["title_bn", "Title (BN)", "title_bangla", "শিরোনাম"]).trim();
        const contentEn = pick(row, ["content_en", "content", "Content", "Content (EN)", "body", "Body"]).trim();
        const contentBn = pick(row, ["content_bn", "Content (BN)", "content_bangla", "কন্টেন্ট"]).trim();
        let slugEn = pick(row, ["slug_en", "slug", "Slug", "Slug (EN)]"]).trim();
        let slugBn = pick(row, ["slug_bn", "Slug (BN)", "slug_bangla"]).trim();
        const imageUrl = pick(row, ["image_url", "image", "Image", "cover", "Cover"]).trim();

        if (!titleEn || !contentEn) {
          failed++;
          skipped.push({
            rowNumber: i + 2,
            title: titleEn || "(empty)",
            reason: !titleEn ? "Missing title_en" : "Missing content_en",
          });
          continue;
        }

        if (!slugEn) slugEn = slugify(titleEn);
        else slugEn = slugify(slugEn);
        if (titleBn && !slugBn) slugBn = slugify(titleBn);
        else if (slugBn) slugBn = slugify(slugBn);

        const payload: any = {
          title_en: titleEn,
          title_bn: titleBn || null,
          slug_en: slugEn,
          slug_bn: slugBn || null,
          content_en: contentEn,
          content_bn: contentBn || null,
          image_url: imageUrl || null,
          author_id: user?.id || null,
        };

        const { error } = await supabase.from("blogs").insert(payload);

        if (error) {
          failed++;
          skipped.push({ rowNumber: i + 2, title: titleEn, reason: error.message });
        } else {
          success++;
        }
      }

      setResult({ success, failed });
      setSkippedRows(skipped);
      if (skipped.length > 0) setShowSkipped(true);

      if (success > 0) {
        toast({ title: `Imported ${success} post${success > 1 ? "s" : ""}${failed > 0 ? `, ${failed} skipped` : ""}` });
        onImported?.();
      } else {
        toast({ title: "No valid posts imported", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "File error", description: err.message, variant: "destructive" });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const sampleJson = JSON.stringify(
    [
      {
        title_en: "Hello World",
        title_bn: "হ্যালো ওয়ার্ল্ড",
        slug_en: "hello-world",
        slug_bn: "হ্যালো-ওয়ার্ল্ড",
        content_en: "<p>English content here.</p>",
        content_bn: "<p>বাংলা কন্টেন্ট এখানে।</p>",
        image_url: "",
      },
    ],
    null,
    2,
  );

  const downloadSampleJson = () => {
    const blob = new Blob([sampleJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-blog-import.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSampleCsv = () => {
    const headers = ["title_en","title_bn","slug_en","slug_bn","content_en","content_bn","image_url"];
    const sample = [
      "Hello World","হ্যালো ওয়ার্ল্ড","hello-world","হ্যালো-ওয়ার্ল্ড",
      "<p>English content here.</p>","<p>বাংলা কন্টেন্ট এখানে।</p>","",
    ];
    const csv = headers.join(",") + "\n" + sample.map((v) => `"${v.replace(/"/g, '""')}"`).join(",");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-blog-import.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 rounded-lg border border-dashed border-border bg-secondary/20 p-6">
      <div className="flex items-start gap-3">
        <FileSpreadsheet className="h-6 w-6 text-muted-foreground shrink-0 mt-1" />
        <div className="flex-1">
          <h4 className="font-heading text-base font-semibold text-foreground">Bulk Import Blog/Story Posts</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Upload <code className="rounded bg-secondary px-1">.csv</code>,{" "}
            <code className="rounded bg-secondary px-1">.xlsx</code>, or{" "}
            <code className="rounded bg-secondary px-1">.json</code>. Required:{" "}
            <code className="rounded bg-secondary px-1">title_en</code>,{" "}
            <code className="rounded bg-secondary px-1">content_en</code>. Optional:{" "}
            <code className="rounded bg-secondary px-1">title_bn</code>,{" "}
            <code className="rounded bg-secondary px-1">content_bn</code>,{" "}
            <code className="rounded bg-secondary px-1">slug_en</code>,{" "}
            <code className="rounded bg-secondary px-1">slug_bn</code>,{" "}
            <code className="rounded bg-secondary px-1">image_url</code>.
          </p>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".csv,.xlsx,.xls,.json"
        onChange={handleFile}
        className="hidden"
        id="blog-bulk-upload"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => fileRef.current?.click()} disabled={importing} variant="outline" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          {importing ? "Importing..." : "Choose File"}
        </Button>
        <Button variant="ghost" size="sm" onClick={downloadSampleCsv}>
          <FileSpreadsheet className="mr-2 h-4 w-4" /> Sample CSV
        </Button>
        <Button variant="ghost" size="sm" onClick={downloadSampleJson}>
          <FileSpreadsheet className="mr-2 h-4 w-4" /> Sample JSON
        </Button>
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
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Title</th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skippedRows.map((sr, idx) => (
                        <tr key={idx} className="border-t border-border">
                          <td className="px-3 py-2 text-foreground">{sr.rowNumber}</td>
                          <td className="px-3 py-2 text-foreground max-w-[200px] truncate">{sr.title}</td>
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

export default BlogBulkImport;
