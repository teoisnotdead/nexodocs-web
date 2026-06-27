import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardList,
  FileSearch,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const valueProps = [
  {
    title: "Solicitudes documentales ordenadas",
    description:
      "Centraliza pedidos, responsables, fechas limite y estados por cliente sin perseguir correos.",
    icon: ClipboardList,
  },
  {
    title: "Revision y aprobacion trazable",
    description:
      "Prepara versiones, observaciones, aprobaciones y entregas dentro de un mismo flujo.",
    icon: FileSearch,
  },
  {
    title: "Pensado para equipos y clientes",
    description:
      "Administra tu operacion por organizacion, equipo y cartera de clientes desde un solo lugar.",
    icon: LockKeyhole,
  },
];

const workflow = [
  "Crear cliente externo",
  "Abrir workspace documental",
  "Solicitar archivos",
  "Revisar y observar",
  "Aprobar y entregar",
];

const plans = [
  {
    name: "Basico",
    price: "Para equipos pequenos",
    features: ["15 clientes", "30 procesos activos", "1 usuario interno"],
  },
  {
    name: "Profesional",
    price: "Para operacion recurrente",
    features: ["75 clientes", "200 procesos activos", "5 usuarios internos"],
    highlighted: true,
  },
  {
    name: "Empresa",
    price: "Para equipos con alto volumen",
    features: ["250 clientes", "1000 procesos activos", "15 usuarios internos"],
  },
];

export default function HomePage() {
  return (
    <main className="dark-shell min-h-screen overflow-hidden text-white">
      <section className="relative min-h-[86svh]">
        <Image
          src="/images/nexodocs-glass-hero.png"
          alt="Interfaz glassmorphism de NexoDocs"
          fill
          priority
          className="object-cover opacity-60"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,7,18,0.98)_0%,rgba(5,12,25,0.90)_42%,rgba(5,12,25,0.42)_100%)]" />
        <div className="absolute inset-0 surface-grid opacity-70" />

        <div className="relative z-10 mx-auto flex min-h-[86svh] w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
          <header className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-md px-4 py-3">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-cyan-200 text-sm font-semibold text-slate-950">
                ND
              </span>
              <span className="truncate text-sm font-semibold">NexoDocs</span>
            </Link>
            <nav className="hidden items-center gap-6 text-sm font-medium text-white/70 md:flex">
              <a className="hover:text-white" href="#producto">
                Producto
              </a>
              <a className="hover:text-white" href="#flujo">
                Flujo
              </a>
              <a className="hover:text-white" href="#planes">
                Planes
              </a>
            </nav>
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "rounded-md text-white hover:bg-white/10",
                )}
              >
                Ingresar
              </Link>
              <Link
                href="/register"
                className={cn(buttonVariants(), "hidden rounded-md sm:inline-flex")}
              >
                Crear cuenta
              </Link>
            </div>
          </header>

          <div className="flex flex-1 items-center py-12">
            <div className="max-w-3xl">
              <Badge className="glass-panel rounded-md px-3 py-1 text-cyan-100 hover:bg-white/[0.09]">
                SaaS B2B para intercambio documental
              </Badge>
              <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-normal text-balance sm:text-5xl lg:text-6xl">
                NexoDocs
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
                Solicita, recibe, revisa, observa, aprueba y entrega documentos
                a clientes externos en un portal moderno, seguro y preparado
                para operar por organizacion.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className={cn(buttonVariants({ size: "lg" }), "rounded-md")}
                >
                  Empezar ahora
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "rounded-md border-white/12 bg-white/[0.06] text-white hover:bg-white/[0.12]",
                  )}
                >
                  Ingresar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="producto" className="surface-grid px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="rounded-md">
              Propuesta de valor
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-balance md:text-4xl">
              Una operacion documental clara para equipos que atienden clientes.
            </h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {valueProps.map((item) => (
              <Card key={item.title} className="glass-card rounded-md">
                <CardHeader>
                  <div className="mb-3 flex size-10 items-center justify-center rounded-md border border-cyan-200/20 bg-cyan-200/10 text-cyan-100">
                    <item.icon className="size-5" />
                  </div>
                  <CardTitle className="tracking-normal text-white">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="leading-6 text-white/60">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="flujo" className="px-4 py-20 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="min-w-0">
            <Badge variant="secondary" className="rounded-md">
              Flujo de trabajo
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-normal text-balance md:text-4xl">
              Pensado para contadores hoy, flexible para otros servicios manana.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/65">
              NexoDocs se adapta a estudios contables, consultoras, equipos
              legales y empresas de servicios que necesitan pedir y revisar
              documentos de forma recurrente.
            </p>
          </div>
          <div className="glass-panel rounded-md p-4">
            <div className="grid gap-3">
              {workflow.map((step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-4 rounded-md border border-white/10 bg-white/[0.055] p-4"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-cyan-200 text-sm font-semibold text-slate-950">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium text-white">
                    {step}
                  </span>
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="planes" className="px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <Badge variant="secondary" className="rounded-md">
                Planes
              </Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-normal text-balance md:text-4xl">
                Planes para distintos niveles de operacion.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-white/65">
              Elige una base segun el volumen de clientes, procesos activos y
              usuarios internos que necesita tu equipo.
            </p>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={cn(
                  "rounded-md",
                  plan.highlighted
                    ? "border-cyan-200/30 bg-cyan-200/[0.12] text-white"
                    : "glass-card text-white",
                )}
              >
                <CardHeader>
                  <CardTitle className="tracking-normal text-white">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    {plan.price}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <Check className="size-4 shrink-0 text-emerald-300" />
                      <span className="text-sm text-white/80">{feature}</span>
                    </div>
                  ))}
                  <Link
                    href="/register"
                    className={cn(
                      buttonVariants({
                        variant: plan.highlighted ? "default" : "outline",
                      }),
                      "mt-3 w-full rounded-md",
                      !plan.highlighted &&
                        "border-white/12 bg-white/[0.06] text-white hover:bg-white/[0.12]",
                    )}
                  >
                    Seleccionar
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6">
        <div className="glass-panel mx-auto flex max-w-7xl flex-col gap-5 rounded-md p-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-medium text-cyan-100">
              <Sparkles className="size-4 shrink-0" />
              <span>Orden documental desde el primer dia</span>
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-balance">
              Inicia sesion y seguimos por clientes.
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className={cn(buttonVariants(), "rounded-md")}
            >
              Abrir panel
            </Link>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "rounded-md border-white/12 bg-white/[0.06] text-white hover:bg-white/[0.12]",
              )}
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-8 text-sm text-white/50 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>NexoDocs</span>
          <span>tyt tech solutions</span>
        </div>
      </footer>
    </main>
  );
}
