"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  PlusCircle, 
  Calendar, 
  User, 
  LogOut, 
  Flame,
  Menu,
  X
} from "lucide-react";

interface NavigationProps {
  user: {
    name: string;
    email: string;
    dailyCalories: number;
  };
}

export function Navigation({ user }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Registar", href: "/meals/add", icon: PlusCircle },
    { name: "Histórico", href: "/history", icon: Calendar },
    { name: "Perfil", href: "/profile", icon: User },
  ];

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (response.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-emerald-400">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-orange-500 shadow-md shadow-emerald-500/20">
              <Flame className="h-5 w-5 text-zinc-950 fill-zinc-950" />
            </div>
            <span>Cal<span className="text-orange-500">Tracker</span></span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-emerald-400 ${
                    isActive ? "text-emerald-400 border-b-2 border-emerald-400 pb-1" : "text-zinc-400"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex flex-col text-right">
              <span className="text-sm font-medium text-zinc-200">{user.name}</span>
              <span className="text-xs text-zinc-500">{user.dailyCalories} kcal / dia</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-zinc-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-zinc-900"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={handleLogout}
              className="text-zinc-400 hover:text-red-400 p-2 rounded-lg"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-900"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (from side/top) */}
      <div 
        className={`fixed inset-0 z-30 md:hidden bg-zinc-950 pt-20 px-4 transition-all duration-300 ease-in-out ${
          mobileMenuOpen 
            ? "opacity-100 translate-y-0 pointer-events-auto" 
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 text-lg font-medium p-3 rounded-xl transition-all ${
                  isActive 
                    ? "bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-400" 
                    : "text-zinc-400 hover:bg-zinc-900"
                }`}
              >
                <Icon className="h-6 w-6" />
                {item.name}
              </Link>
            );
          })}
          <div className="mt-8 border-t border-zinc-800 pt-6 px-3 flex items-center justify-between">
            <div>
              <p className="text-zinc-200 font-semibold">{user.name}</p>
              <p className="text-sm text-zinc-500">{user.dailyCalories} kcal / dia</p>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Bottom Tab Bar (Extremely Premium UX for Mobile views) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden flex justify-around items-center h-16 bg-zinc-950/90 backdrop-blur-lg border-t border-zinc-850 px-2 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.4)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
                isActive ? "text-emerald-400 scale-105" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
