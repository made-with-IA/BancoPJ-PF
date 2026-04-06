import { useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Settings, Menu, X, Building2, ChevronRight } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { cn } from "@/lib/utils";

function NavLink({ href, icon: Icon, label, onClick }: { href: string; icon: React.ElementType; label: string; onClick?: () => void }) {
  const [location] = useLocation();
  const active = location === href || (href !== "/" && location.startsWith(href));
  return (
    <Link
      href={href}
      onClick={onClick}
      data-testid={`nav-link-${href.replace(/\//g, "-")}`}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon size={18} />
      <span>{label}</span>
      {active && <ChevronRight size={14} className="ml-auto" />}
    </Link>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useSettings();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", icon: LayoutDashboard, label: t.nav.dashboard },
    { href: "/clientes", icon: Users, label: t.nav.clients },
    { href: "/configuracoes", icon: Settings, label: t.nav.settings },
  ];

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 size={18} className="text-sidebar-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-sidebar-foreground leading-tight">Sistema Bancário</p>
          <p className="text-xs text-sidebar-foreground/60">Admin</p>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navLinks.map((l) => (
          <NavLink key={l.href} {...l} onClick={() => setMobileOpen(false)} />
        ))}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/40 text-center">v1.0.0</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-sidebar flex-shrink-0">
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-60 bg-sidebar flex flex-col z-10">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="flex md:hidden items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <button
            onClick={() => setMobileOpen(true)}
            data-testid="button-mobile-menu"
            className="p-1.5 rounded-md hover:bg-muted"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-primary" />
            <span className="text-sm font-semibold">Sistema Bancário</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
