import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MapPin, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import CategoriesCrud from "@/components/admin/CategoriesCrud";
import DivisionInfoForm from "@/components/admin/DivisionInfoForm";
import BulkImport from "@/components/admin/BulkImport";
import BlogEditor from "@/components/admin/BlogEditor";
import Footer from "@/components/Footer";

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();

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
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </header>

      <main className="container flex-1 py-8">
        <Tabs defaultValue="categories">
          <TabsList className="mb-6">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="division-info">Division Info</TabsTrigger>
            <TabsTrigger value="bulk-import">Bulk Import</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
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
