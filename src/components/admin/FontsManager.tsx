import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Check, Loader2, RotateCcw, Type } from "lucide-react";
import {
  useFonts,
  BANGLA_PRESETS,
  ENGLISH_PRESETS,
  SCALE_PRESETS,
  DEFAULT_TYPE_SCALE,
  DEFAULT_FONTS,
  parseGoogleFontsUrl,
  type FontRole,
  type FontConfig,
  type TypeScale,
} from "@/hooks/useFonts";

const ROLES: { role: FontRole; label: string; sample: string; bangla: boolean }[] = [
  { role: "bangla_heading", label: "Bangla — Heading", sample: "বাংলাদেশ ইনফোম্যাপ", bangla: true },
  { role: "bangla_body", label: "Bangla — Body", sample: "এটি একটি নমুনা বাংলা বাক্য।", bangla: true },
  { role: "english_heading", label: "English — Heading", sample: "Bangladesh InfoMap", bangla: false },
  { role: "english_body", label: "English — Body", sample: "The quick brown fox jumps over the lazy dog.", bangla: false },
];

/** Inject a preview-only stylesheet for any family the user is hovering/considering. */
function ensurePreviewLink(family: string, weights = "400;700") {
  const id = `preview-font-${family.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const fam = family.trim().replace(/\s+/g, "+");
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${fam}:wght@${weights}&display=swap`;
  document.head.appendChild(link);
}

const RoleEditor = ({ role, label, sample, bangla }: { role: FontRole; label: string; sample: string; bangla: boolean }) => {
  const { fonts, saveFont } = useFonts();
  const current = fonts[role];
  const presets = bangla ? BANGLA_PRESETS : ENGLISH_PRESETS;

  const [saving, setSaving] = useState<string | null>(null);
  const [customFamily, setCustomFamily] = useState("");
  const [customWeights, setCustomWeights] = useState("400;500;600;700");
  const [customUrl, setCustomUrl] = useState("");

  useEffect(() => {
    presets.forEach((p) => ensurePreviewLink(p.family, p.weights));
  }, [presets]);

  const apply = async (cfg: FontConfig) => {
    setSaving(cfg.family);
    try {
      ensurePreviewLink(cfg.family, cfg.weights);
      await saveFont(role, cfg);
      toast({ title: "Font updated", description: `${label}: ${cfg.family}` });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const applyCustomName = async () => {
    if (!customFamily.trim()) return;
    await apply({ family: customFamily.trim(), weights: customWeights.trim() || undefined });
    setCustomFamily("");
  };

  const applyCustomUrl = async () => {
    const parsed = parseGoogleFontsUrl(customUrl.trim());
    if (!parsed) {
      toast({ title: "Invalid URL", description: "Paste a Google Fonts CSS URL (https://fonts.googleapis.com/css2?...)", variant: "destructive" });
      return;
    }
    await apply(parsed);
    setCustomUrl("");
  };

  return (
    <Card className="p-5 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-heading text-lg font-bold">{label}</h3>
          <p className="text-xs text-muted-foreground">
            Current: <span className="font-medium text-foreground">{current.family}</span>
          </p>
        </div>
        <div
          className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-2xl"
          style={{ fontFamily: `"${current.family}", sans-serif` }}
          lang={bangla ? "bn" : "en"}
        >
          {sample}
        </div>
      </div>

      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Presets</Label>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {presets.map((p) => {
            const isActive = current.family === p.family;
            return (
              <button
                key={p.family}
                onClick={() => apply({ family: p.family, weights: p.weights })}
                disabled={saving === p.family}
                className={`group flex items-center justify-between gap-3 rounded-lg border p-3 text-left transition-all hover:border-primary hover:bg-muted/40 ${
                  isActive ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="min-w-0">
                  <div className="text-xs font-medium text-muted-foreground">{p.family}</div>
                  <div
                    className="truncate text-base"
                    style={{ fontFamily: `"${p.family}", sans-serif` }}
                    lang={bangla ? "bn" : "en"}
                  >
                    {sample}
                  </div>
                </div>
                {saving === p.family ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                ) : isActive ? (
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border pt-4 space-y-4">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Custom Google Font</Label>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Simple — just type a Google Fonts family name:</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="e.g. Hind Siliguri"
              value={customFamily}
              onChange={(e) => setCustomFamily(e.target.value)}
            />
            <Input
              placeholder="Weights (e.g. 400;500;700)"
              value={customWeights}
              onChange={(e) => setCustomWeights(e.target.value)}
              className="sm:max-w-[200px]"
            />
            <Button onClick={applyCustomName} disabled={!customFamily.trim() || !!saving}>
              <Type className="mr-2 h-4 w-4" /> Install
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Advanced — paste full Google Fonts CSS URL:</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="https://fonts.googleapis.com/css2?family=..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
            />
            <Button onClick={applyCustomUrl} disabled={!customUrl.trim() || !!saving} variant="secondary">
              Install from URL
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

const FontsManager = () => {
  const { resetToDefaults } = useFonts();
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    if (!confirm("Reset all fonts to defaults (Noto Sans Bengali / Inter / Plus Jakarta Sans)?")) return;
    setResetting(true);
    try {
      await resetToDefaults();
      toast({ title: "Fonts reset", description: "All fonts restored to defaults." });
    } catch (err: any) {
      toast({ title: "Reset failed", description: err.message, variant: "destructive" });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-heading text-xl font-bold">Font Settings</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose Bangla and English fonts for headings and body. Bangla fonts only apply to Bangla text
              (elements with <code className="rounded bg-muted px-1 py-0.5 text-xs">lang="bn"</code>).
              Changes save instantly and apply site-wide.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset} disabled={resetting}>
            {resetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Reset to defaults
          </Button>
        </div>
      </Card>

      <Tabs defaultValue="bangla_heading">
        <TabsList className="flex w-full flex-wrap h-auto gap-1">
          {ROLES.map((r) => (
            <TabsTrigger key={r.role} value={r.role} className="flex-1 min-w-[110px] text-xs sm:text-sm">
              {r.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {ROLES.map((r) => (
          <TabsContent key={r.role} value={r.role} className="mt-5">
            <RoleEditor {...r} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default FontsManager;
