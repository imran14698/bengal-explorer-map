import { Folder, MapPinned, Upload, FileText, Type, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export type AdminSection = "categories" | "division-info" | "bulk-import" | "blog" | "fonts";

const items: { id: AdminSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "categories", label: "Categories", icon: Folder },
  { id: "division-info", label: "Division Info", icon: MapPinned },
  { id: "bulk-import", label: "Bulk Import", icon: Upload },
  { id: "blog", label: "Stories", icon: FileText },
  { id: "fonts", label: "Fonts", icon: Type },
];

interface AdminSidebarProps {
  active: AdminSection;
  onChange: (section: AdminSection) => void;
}

const AdminSidebar = ({ active, onChange }: AdminSidebarProps) => {
  const { state, setOpenMobile, isMobile } = useSidebar();
  const collapsed = state === "collapsed";

  const handleClick = (id: AdminSection) => {
    onChange(id);
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex h-12 items-center gap-2 px-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <span className="font-heading text-sm font-bold">B</span>
          </div>
          {!collapsed && (
            <span className="font-heading text-sm font-bold text-sidebar-foreground truncate">
              Admin Panel
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Manage</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => handleClick(item.id)}
                      tooltip={item.label}
                      className={cn(
                        "transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "hover:bg-sidebar-accent/60"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="View Site"
              className="hover:bg-sidebar-accent/60"
            >
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => isMobile && setOpenMobile(false)}
              >
                <ExternalLink className="h-4 w-4" />
                <span>View Site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
