import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarPlus,
  Receipt,
  TrendingUp,
  ClipboardCheck,
  Menu,
  X,
  Apple,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/bhoomish-logo.png";

const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Daily Entry", href: "/daily-entry", icon: CalendarPlus },
  { title: "Expenses", href: "/expenses", icon: Receipt },
  { title: "Analytics", href: "/analytics", icon: TrendingUp },
  { title: "Self Review", href: "/review", icon: ClipboardCheck },
];

export function AppSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Bhoomish" className="h-10 w-10 rounded-lg" />
          <span className="font-display text-lg font-semibold text-primary">Bhoomish</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-sidebar transition-transform duration-300 ease-out lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Bhoomish" className="h-12 w-12 rounded-xl shadow-medium" />
            <div>
              <h1 className="font-display text-xl font-bold text-sidebar-foreground">Bhoomish</h1>
              <p className="text-xs text-sidebar-foreground/60">Business CRM</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive(item.href)
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                  : "text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon size={20} />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-sidebar-accent/50">
            <Apple size={18} className="text-sidebar-primary" />
            <div className="text-xs">
              <p className="text-sidebar-foreground/60">Fresh Fruits • Quality Service</p>
              <p className="text-sidebar-primary font-semibold">Happy Morning!</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
