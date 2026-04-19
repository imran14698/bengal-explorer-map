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
  const { fonts, saveFont, resetRole } = useFonts();
  const current = fonts[role];
  const presets = bangla ? BANGLA_PRESETS : ENGLISH_PRESETS;
  const isDefault = current.family === DEFAULT_FONTS[role].family;

  const [saving, setSaving] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
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

  const handleResetRole = async () => {
    setResetting(true);
    try {
      await resetRole(role);
      toast({ title: "Reset", description: `${label} restored to ${DEFAULT_FONTS[role].family}` });
    } catch (err: any) {
      toast({ title: "Reset failed", description: err.message, variant: "destructive" });
    } finally {
      setResetting(false);
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
        <div className="flex items-start gap-3">
          <div>
            <h3 className="font-heading text-lg font-bold">{label}</h3>
            <p className="text-xs text-muted-foreground">
              Current: <span className="font-medium text-foreground">{current.family}</span>
              {isDefault && <span className="ml-2 text-[10px] uppercase tracking-wider">(default)</span>}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetRole}
            disabled={resetting || isDefault}
            title={`Reset ${label} to ${DEFAULT_FONTS[role].family}`}
          >
            {resetting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
            <span className="ml-1 text-xs">Reset</span>
          </Button>
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

const ScaleEditor = () => {
  const { scale, saveScale, resetScale } = useFonts();
  const [draft, setDraft] = useState<TypeScale>(scale);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    setDraft(scale);
  }, [scale.scale, scale.leading, scale.weightBody, scale.weightHeading]);

  const dirty =
    draft.scale !== scale.scale ||
    draft.leading !== scale.leading ||
    draft.weightBody !== scale.weightBody ||
    draft.weightHeading !== scale.weightHeading;

  const applyPreset = async (t: TypeScale) => {
    setSaving(true);
    try {
      await saveScale(t);
      toast({ title: "Typography updated" });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      await saveScale(draft);
      toast({ title: "Typography saved" });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetScale();
      toast({ title: "Typography reset to defaults" });
    } catch (err: any) {
      toast({ title: "Reset failed", description: err.message, variant: "destructive" });
    } finally {
      setResetting(false);
    }
  };

  return (
    <Card className="p-5 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-heading text-lg font-bold">Typography Scale</h3>
          <p className="text-xs text-muted-foreground">
            Global font size, line-height, and weight emphasis. Applies to entire site.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset} disabled={resetting}>
          {resetting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
          <span className="ml-1 text-xs">Reset</span>
        </Button>
      </div>

      <div>
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Quick presets</Label>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
          {SCALE_PRESETS.map((p) => {
            const active =
              scale.scale === p.scale.scale &&
              scale.leading === p.scale.leading &&
              scale.weightBody === p.scale.weightBody &&
              scale.weightHeading === p.scale.weightHeading;
            return (
              <button
                key={p.id}
                onClick={() => applyPreset(p.scale)}
                disabled={saving}
                className={`rounded-lg border p-3 text-left transition-all hover:border-primary hover:bg-muted/40 ${
                  active ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{p.label}</span>
                  {active && <Check className="h-3.5 w-3.5 text-primary" />}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  {Math.round(p.scale.scale * 100)}% · lh {p.scale.leading}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border pt-4 space-y-5">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Fine-tune</Label>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Font size</span>
            <span className="font-mono text-xs text-muted-foreground">
              {Math.round(draft.scale * 100)}% ({(16 * draft.scale).toFixed(1)}px)
            </span>
          </div>
          <Slider
            min={0.85}
            max={1.2}
            step={0.0125}
            value={[draft.scale]}
            onValueChange={([v]) => setDraft((d) => ({ ...d, scale: v }))}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Line height</span>
            <span className="font-mono text-xs text-muted-foreground">{draft.leading.toFixed(2)}</span>
          </div>
          <Slider
            min={1.2}
            max={1.9}
            step={0.05}
            value={[draft.leading]}
            onValueChange={([v]) => setDraft((d) => ({ ...d, leading: v }))}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Body weight</span>
            <span className="font-mono text-xs text-muted-foreground">{draft.weightBody}</span>
          </div>
          <Slider
            min={300}
            max={600}
            step={100}
            value={[draft.weightBody]}
            onValueChange={([v]) => setDraft((d) => ({ ...d, weightBody: v }))}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Heading weight</span>
            <span className="font-mono text-xs text-muted-foreground">{draft.weightHeading}</span>
          </div>
          <Slider
            min={500}
            max={900}
            step={100}
            value={[draft.weightHeading]}
            onValueChange={([v]) => setDraft((d) => ({ ...d, weightHeading: v }))}
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setDraft(scale)} disabled={!dirty || saving}>
            Cancel
          </Button>
          <Button size="sm" onClick={saveDraft} disabled={!dirty || saving}>
            {saving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Save changes
          </Button>
        </div>
      </div>

      <div
        className="rounded-lg border border-border bg-muted/30 p-4"
        style={{
          fontSize: `${16 * draft.scale}px`,
          lineHeight: draft.leading,
          fontWeight: draft.weightBody,
        }}
      >
        <div className="font-heading mb-2" style={{ fontWeight: draft.weightHeading, fontSize: "1.6em" }}>
          Live preview heading
        </div>
        <p>
          The quick brown fox jumps over the lazy dog. এটি একটি নমুনা বাংলা বাক্য যেখানে স্কেল ও লাইন
          হাইট পরিবর্তন দেখা যাচ্ছে।
        </p>
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
            Reset all fonts
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
          <TabsTrigger value="__scale" className="flex-1 min-w-[110px] text-xs sm:text-sm">
            Scale
          </TabsTrigger>
        </TabsList>
        {ROLES.map((r) => (
          <TabsContent key={r.role} value={r.role} className="mt-5">
            <RoleEditor {...r} />
          </TabsContent>
        ))}
        <TabsContent value="__scale" className="mt-5">
          <ScaleEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FontsManager;
