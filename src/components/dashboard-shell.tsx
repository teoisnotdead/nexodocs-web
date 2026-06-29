import { LogoutButton } from "@/components/auth/logout-button";
import { SessionRefresh } from "@/components/auth/session-refresh";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Bell,
  BookTemplate,
  Building2,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Home,
  Settings,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const navigation = [
  { label: "Inicio", href: "/dashboard", icon: Home },
  { label: "Clientes", href: "/dashboard/clients", icon: Building2 },
  { label: "Casos / Procesos", href: "/dashboard/workspaces", icon: FolderKanban },
  { label: "Plantillas", href: "/dashboard/templates", icon: BookTemplate },
  { label: "Configuracion", href: "/dashboard/settings/plan", icon: Settings },
];

type DashboardShellProps = {
  children: ReactNode;
  organizationName: string;
  userName: string;
  userEmail: string;
  activePath?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
};

export function DashboardShell({
  children,
  organizationName,
  userName,
  userEmail,
  activePath = "/dashboard",
  breadcrumbs,
}: DashboardShellProps) {
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const activeItem = navigation.find((item) =>
    item.href === "/dashboard"
      ? activePath === item.href
      : item.href !== "#" && activePath.startsWith(item.href),
  );
  const visibleBreadcrumbs =
    breadcrumbs ??
    (activeItem
      ? activeItem.href === "/dashboard"
        ? [{ label: "Inicio" }]
        : [{ label: "Inicio", href: "/dashboard" }, { label: activeItem.label }]
      : [{ label: "Inicio" }]);

  return (
    <div className="dark-shell surface-grid min-h-screen text-white">
      <SessionRefresh />
      <aside className="glass-panel fixed inset-y-4 left-4 hidden w-60 rounded-md lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-3 px-5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-cyan-200 text-sm font-semibold text-slate-950">
            ND
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">NexoDocs</p>
            <p className="truncate text-xs text-white/50">
              {organizationName}
            </p>
          </div>
        </div>
        <Separator className="bg-white/10" />
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navigation.map((item) => {
            const active =
              item.href === "/dashboard"
                ? activePath === item.href
                : activePath.startsWith(item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  buttonVariants({
                    variant: active ? "secondary" : "ghost",
                  }),
                  "h-10 w-full justify-start gap-3 rounded-md px-3 text-white hover:bg-white/[0.08]",
                  active && "bg-cyan-200/15 text-cyan-100",
                )}
              >
                <item.icon className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-[17rem]">
        <header className="sticky top-0 z-20 p-3">
          <div className="glass-panel rounded-md">
            <div className="flex min-h-16 items-center justify-between gap-3 px-3 py-3 md:px-5">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-cyan-200 text-sm font-semibold text-slate-950 lg:hidden">
                  ND
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {organizationName}
                  </p>
                  <p className="truncate text-xs text-white/50">
                    Portal documental
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="size-9 rounded-md border-white/12 bg-white/[0.06] text-white hover:bg-white/[0.12]"
                  aria-label="Notificaciones"
                >
                  <Bell className="size-4" />
                </Button>
                <div className="hidden min-w-0 text-right md:block">
                  <p className="truncate text-xs font-medium text-white">
                    {userName}
                  </p>
                  <p className="truncate text-xs text-white/50">{userEmail}</p>
                </div>
                <Avatar className="size-9 rounded-md">
                  <AvatarFallback className="rounded-md bg-emerald-200 text-emerald-950">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <LogoutButton />
              </div>
            </div>
            <div className="relative border-t border-white/10 lg:hidden">
              <ChevronLeft className="pointer-events-none absolute left-2 top-1/2 z-10 size-4 -translate-y-1/2 text-white/35" />
              <nav className="flex gap-1 overflow-x-auto px-8 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {navigation.map((item) => {
                  const active =
                    item.href === "/dashboard"
                      ? activePath === item.href
                      : activePath.startsWith(item.href);

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        buttonVariants({
                          size: "sm",
                          variant: active ? "secondary" : "ghost",
                        }),
                        "h-9 shrink-0 gap-2 rounded-md px-3 text-white hover:bg-white/[0.08]",
                        active && "bg-cyan-200/15 text-cyan-100",
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <ChevronRight className="pointer-events-none absolute right-2 top-1/2 z-10 size-4 -translate-y-1/2 text-white/35" />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 pb-6 pt-3 md:px-6 lg:py-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex min-w-0 items-center gap-2 overflow-x-auto text-base text-white/50 md:text-lg"
          >
            {visibleBreadcrumbs.map((item, index) => {
              const isLast = index === visibleBreadcrumbs.length - 1;

              return (
                <span key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1">
                  {index > 0 ? (
                    <ChevronRight className="size-5 shrink-0 text-white/30" />
                  ) : null}
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="shrink-0 rounded-sm text-white/55 transition hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="truncate font-semibold text-cyan-100/85">
                      {item.label}
                    </span>
                  )}
                </span>
              );
            })}
          </nav>
          {children}
        </main>
      </div>
    </div>
  );
}
