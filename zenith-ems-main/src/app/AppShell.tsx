import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Building2,
  Clock,
  CalendarCheck,
  DollarSign,
  FileText,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DarkModeToggle } from '@/components/ui/dark-mode-toggle';
import { cn } from '@/lib/utils';
import { getUser, clearAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Departments', href: '/departments', icon: Building2 },
  { name: 'Designations', href: '/designations', icon: Settings },
  { name: 'Shifts', href: '/shifts', icon: Clock },
  { name: 'Shift Assignments', href: '/shift-assignments', icon: CalendarCheck },
  { name: 'Attendance', href: '/attendance', icon: CalendarCheck },
  { name: 'Salary Templates', href: '/salary-templates', icon: DollarSign },
  { name: 'Payroll', href: '/payroll', icon: DollarSign },
  { name: 'Reports', href: '/reports', icon: FileText },
];

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          sidebarOpen ? 'block' : 'hidden'
        )}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex h-full w-64 flex-col glass-card rounded-r-2xl">
          <div className="flex h-16 items-center justify-between px-6">
            <h1 className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
              EMS
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-1 glass-card rounded-r-2xl m-4 ml-0">
          <div className="flex h-16 items-center px-6">
            <h1 className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
              EMS
            </h1>
          </div>
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover-lift',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-glow'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="flex h-16 items-center justify-between px-4 lg:px-8 glass-card m-4 rounded-2xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-4">
            <DarkModeToggle />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">{user?.role}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-xs"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="px-4 lg:px-8 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}