import { ArrowLeft, FileCheck2, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthPanel({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthPanelProps) {
  return (
    <main className="dark-shell surface-grid flex min-h-screen items-center justify-center px-4 py-10 text-white sm:px-6">
      <div className="grid w-full max-w-6xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="glass-dark flex min-h-[460px] flex-col justify-between rounded-md p-6 lg:min-h-[590px]">
          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 text-sm text-white/80 hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Volver
          </Link>
          <div>
            <div className="mb-5 flex size-12 items-center justify-center rounded-md border border-white/12 bg-white/[0.08] text-cyan-100">
              <FileCheck2 className="size-6" />
            </div>
            <p className="text-sm font-medium text-cyan-100">{eyebrow}</p>
            <h1 className="mt-3 max-w-md text-3xl font-semibold tracking-normal text-balance sm:text-4xl">
              {title}
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
              {description}
            </p>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-white/80">
            <div className="flex gap-3 rounded-md border border-white/12 bg-white/[0.06] p-4">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-200" />
              <span>
                Portal interno para organizar solicitudes, revisiones y entregas.
              </span>
            </div>
            <div className="flex gap-3 rounded-md border border-white/12 bg-white/[0.06] p-4">
              <LockKeyhole className="mt-0.5 size-4 shrink-0 text-amber-200" />
              <span>
                Acceso seguro para que tu equipo trabaje con tranquilidad.
              </span>
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-md p-6 md:p-8">
          <div className="mx-auto max-w-md">
            <div className="mb-8">
              <p className="text-sm font-medium text-cyan-100">NexoDocs</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-normal text-white">
                {title}
              </h2>
            </div>
            {children}
            <div className="mt-6 text-center text-sm text-white/60">
              {footer}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
