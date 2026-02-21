import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, Users, UserPlus, LogOut, User, 
  ChevronRight, Menu, X, Shield, Settings
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const adminNavItems = [
  { path: '/admin/dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
  { path: '/admin/members', label: 'সদস্য তালিকা', icon: Users },
  { path: '/admin/members/new', label: 'নতুন সদস্য', icon: UserPlus },
];

const memberNavItems = [
  { path: '/member/profile', label: 'আমার প্রোফাইল', icon: User },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, role, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = role === 'super_admin' ? adminNavItems : memberNavItems;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground 
        transform transition-transform duration-200 ease-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary">
              <span className="text-lg font-bold text-sidebar-primary-foreground">স</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-sidebar-foreground">সমিতি ম্যানেজার</h1>
              <p className="text-xs text-sidebar-foreground/60">ব্যবস্থাপনা সিস্টেম</p>
            </div>
            <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Role Badge */}
          <div className="px-5 py-3 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-sidebar-primary" />
              <span className="text-xs text-sidebar-foreground/60">
                {role === 'super_admin' ? 'সুপার অ্যাডমিন' : 'সদস্য'}
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            <p className="px-3 mb-2 text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-semibold">মেনু</p>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/admin/dashboard' && item.path !== '/member/profile' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' 
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary/20 text-xs font-bold text-sidebar-primary">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
              লগআউট
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1" />
          <Badge variant="outline" className="text-xs gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            অনলাইন
          </Badge>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-6xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
