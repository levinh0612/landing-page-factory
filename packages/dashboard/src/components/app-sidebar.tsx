import {
  LayoutDashboard,
  Palette,
  Users,
  FolderKanban,
  Shield,
  History,
  LogOut,
  Image,
  FileText,
  MessageSquare,
  BookOpen,
  Layers,
  Paintbrush,
  Activity,
  Wrench,
  Settings,
  Puzzle,
  ChevronRight,
  Code2,
  Wand2,
  CreditCard,
  Globe2,
  Store,
  Trello,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
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
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/stores/auth-store';

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Content',
    items: [
      { title: 'Posts', url: '/posts', icon: BookOpen },
      { title: 'Media', url: '/media', icon: Image },
      { title: 'Pages', url: '/pages', icon: FileText },
      { title: 'Comments', url: '/comments', icon: MessageSquare },
    ],
  },
  {
    label: 'Design',
    items: [
      { title: 'Templates', url: '/templates', icon: Palette },
      { title: 'Marketplace', url: '/marketplace', icon: Store },
      { title: 'Components', url: '/components', icon: Layers },
      { title: 'Appearance', url: '/appearance', icon: Paintbrush },
    ],
  },
  {
    label: 'Projects',
    items: [
      { title: 'All Projects', url: '/projects', icon: FolderKanban },
      { title: 'E-Cards', url: '/e-cards', icon: CreditCard },
      { title: 'Domains', url: '/domains', icon: Globe2 },
      { title: 'Clients', url: '/clients', icon: Users },
    ],
  },
  {
    label: 'People',
    items: [
      { title: 'Users & Roles', url: '/users', icon: Shield, adminOnly: true },
      { title: 'Activity Logs', url: '/activity-logs', icon: History },
    ],
  },
  {
    label: 'Create',
    items: [
      { title: 'Editor', url: '/editor', icon: Code2 },
      { title: 'AI Generator', url: '/generator', icon: Wand2 },
    ],
  },
  {
    label: 'Team',
    items: [
      { title: 'Jira Tasks', url: '/jira', icon: Trello },
    ],
  },
  {
    label: 'System',
    items: [
      { title: 'Monitor', url: '/monitor', icon: Activity },
      { title: 'Tools', url: '/tools', icon: Wrench },
      { title: 'Settings', url: '/settings', icon: Settings },
      { title: 'Plugins', url: '/plugins', icon: Puzzle },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (url: string) => {
    if (url === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            LPF
          </div>
          <div>
            <p className="text-sm font-semibold">WebForge Pro</p>
            <p className="text-xs text-muted-foreground">Admin Dashboard</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.adminOnly || user?.role === 'ADMIN',
          );
          if (visibleItems.length === 0) return null;

          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                      >
                        <a
                          href={item.url}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(item.url);
                          }}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <p className="font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
