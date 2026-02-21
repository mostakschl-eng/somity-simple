import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, Users, UserPlus, LogOut, User, 
  ChevronRight, Menu, X, Shield
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
    <div className="flex h-[100dvh] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-60 sm:w-64 bg-sidebar text-sidebar-foreground 
        transform transition-transform duration-200 ease-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 border-b border-sidebar-border px-4 sm:px-5 py-4 sm:py-5">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-sidebar-primary">
              <span className="text-base sm:text-lg font-bold text-sidebar-primary-foreground">স</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-sidebar-foreground truncate">সমিতি ম্যানেজার</h1>
              <p className="text-[10px] sm:text-xs text-sidebar-foreground/60">ব্যবস্থাপনা সিস্টেম</p>
            </div>
            <button className="ml-auto lg:hidden p-1" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Role Badge */}
          <div className="px-4 sm:px-5 py-2.5 sm:py-3 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-sidebar-primary" />
              <span className="text-[10px] sm:text-xs text-sidebar-foreground/60">
                {role === 'super_admin' ? 'সুপার অ্যাডমিন' : 'সদস্য'}
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 space-y-1 px-2.5 sm:px-3 py-3 sm:py-4">
            <p className="px-3 mb-2 text-[9px] sm:text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-semibold">মেনু</p>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/admin/dashboard' && item.path !== '/member/profile' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 sm:gap-3 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium transition-all active:scale-[0.98] ${
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
          <div className="border-t border-sidebar-border p-3 sm:p-4">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-2 sm:mb-3">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-sidebar-primary/20 text-[10px] sm:text-xs font-bold text-sidebar-primary">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs font-medium text-sidebar-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs sm:text-sm text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-colors active:scale-[0.98]"
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
        <header className="flex h-12 sm:h-14 items-center gap-3 sm:gap-4 border-b border-border bg-card px-3 sm:px-4 lg:px-6">
          <button className="lg:hidden p-1" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1" />
          <Badge variant="outline" className="text-[10px] sm:text-xs gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            অনলাইন
          </Badge>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          <div className="mx-auto max-w-6xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
