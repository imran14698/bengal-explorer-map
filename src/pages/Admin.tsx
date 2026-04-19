import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MapPin, LogOut, Sun, Moon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/hooks/useTheme";
import CategoriesCrud from "@/components/admin/CategoriesCrud";
import DivisionInfoForm from "@/components/admin/DivisionInfoForm";
import BulkImport from "@/components/admin/BulkImport";
import BlogEditor from "@/components/admin/BlogEditor";
import Footer from "@/components/Footer";

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-primary">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="font-heading text-base sm:text-xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
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
              <LogOut className="mr-1 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <Tabs defaultValue="categories">
          <TabsList className="mb-6 flex w-full flex-wrap h-auto gap-1">
            <TabsTrigger value="categories" className="flex-1 min-w-[80px] text-xs sm:text-sm">Categories</TabsTrigger>
            <TabsTrigger value="division-info" className="flex-1 min-w-[80px] text-xs sm:text-sm">Division Info</TabsTrigger>
            <TabsTrigger value="bulk-import" className="flex-1 min-w-[80px] text-xs sm:text-sm">Bulk Import</TabsTrigger>
            <TabsTrigger value="blog" className="flex-1 min-w-[80px] text-xs sm:text-sm">Blog</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <CategoriesCrud />
          </TabsContent>
          <TabsContent value="division-info">
            <DivisionInfoForm />
          </TabsContent>
          <TabsContent value="bulk-import">
            <BulkImport />
          </TabsContent>
          <TabsContent value="blog">
            <BlogEditor />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
