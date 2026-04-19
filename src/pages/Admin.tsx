import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Sun, Moon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/hooks/useTheme";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import CategoriesCrud from "@/components/admin/CategoriesCrud";
import DivisionInfoForm from "@/components/admin/DivisionInfoForm";
import BulkImport from "@/components/admin/BulkImport";
import BlogEditor from "@/components/admin/BlogEditor";
import FontsManager from "@/components/admin/FontsManager";
import AdminSidebar, { type AdminSection } from "@/components/admin/AdminSidebar";

const SECTION_TITLES: Record<AdminSection, string> = {
  categories: "Categories",
  "division-info": "Division Info",
  "bulk-import": "Bulk Import",
  blog: "Blog Posts",
  fonts: "Fonts",
};

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();

  const validSections: AdminSection[] = ["categories", "division-info", "bulk-import", "blog", "fonts"];
  const paramSection = searchParams.get("section") as AdminSection | null;
  const section: AdminSection =
    paramSection && validSections.includes(paramSection) ? paramSection : "categories";

  useEffect(() => {
    if (!paramSection || !validSections.includes(paramSection as AdminSection)) {
      setSearchParams({ section: "categories" }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSection = (next: AdminSection) => {
    setSearchParams({ section: next });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-64 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-3 text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground">Access Denied</h2>
          <p className="text-sm text-muted-foreground">You don't have admin privileges.</p>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar active={section} onChange={setSection} />

        <SidebarInset className="flex flex-col min-w-0">
          {/* Sticky header */}
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card/80 px-3 backdrop-blur-sm sm:px-6">
            <SidebarTrigger className="shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="font-heading text-base sm:text-lg font-bold text-foreground truncate">
                {SECTION_TITLES[section]}
              </h1>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="h-9 w-9"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 px-3 py-5 sm:px-6 sm:py-8 overflow-x-hidden">
            <div className="max-w-6xl mx-auto">
              {section === "categories" && <CategoriesCrud />}
              {section === "division-info" && <DivisionInfoForm />}
              {section === "bulk-import" && <BulkImport />}
              {section === "blog" && <BlogEditor />}
              {section === "fonts" && <FontsManager />}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
