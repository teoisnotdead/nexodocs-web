"use client";

import { Check, Copy, KeyRound, Link2, Loader2, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError, apiFetch } from "@/lib/api/client";
import type { ClientContact, ClientPortalAccessResponse } from "@/lib/api/types";

type ClientPortalSharePanelProps = {
  workspaceId: string;
  contacts: ClientContact[];
};

export function ClientPortalSharePanel({
  workspaceId,
  contacts,
}: ClientPortalSharePanelProps) {
  const defaultContactId = useMemo(
    () => contacts.find((contact) => contact.isPrimary)?.id ?? contacts[0]?.id ?? "",
    [contacts],
  );
  const contactItems =
    contacts.length === 0
      ? [{ value: "", label: "Sin contactos" }]
      : contacts.map((contact) => ({
          value: contact.id,
          label: `${contact.name}${contact.email ? ` - ${contact.email}` : ""}`,
        }));
  const [selectedContactId, setSelectedContactId] = useState(defaultContactId);
  const [access, setAccess] = useState<ClientPortalAccessResponse | null>(null);
  const [portalUrl, setPortalUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState<"link" | "code" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generateAccess() {
    setIsGenerating(true);
    setCopied(null);
    setError(null);

    try {
      const data = await apiFetch<ClientPortalAccessResponse>(
        `/workspaces/${workspaceId}/client-portal-access`,
        {
          method: "POST",
          body: {
            clientContactId: selectedContactId || undefined,
            expiresInDays: 14,
          },
        },
      );
      const nextUrl = `${window.location.origin}${data.portalPath}`;
      setAccess(data);
      setPortalUrl(nextUrl);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "No pudimos generar el acceso del portal.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function copy(value: string, type: "link" | "code") {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    window.setTimeout(() => setCopied(null), 1600);
  }

  return (
    <div className="rounded-md border border-cyan-200/15 bg-cyan-200/[0.06] p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link2 className="size-4 text-cyan-100" />
            <p className="text-sm font-semibold text-white">Portal del cliente</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Genera un link seguro y codigo de 6 digitos para que el cliente suba
            documentos de este proceso.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-[minmax(180px,1fr)_auto] lg:min-w-[420px]">
          <Select
            items={contactItems}
            value={selectedContactId}
            disabled={contacts.length === 0 || isGenerating}
            onValueChange={(nextValue) => setSelectedContactId(nextValue ?? "")}
          >
            <SelectTrigger className="h-9 w-full rounded-md border-white/12 bg-white/[0.08] px-3 text-white hover:bg-white/[0.12] focus-visible:border-cyan-300/60 focus-visible:ring-cyan-300/20">
              <SelectValue placeholder="Sin contactos" />
            </SelectTrigger>
            <SelectContent align="start">
              {contactItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            className="h-9 rounded-md"
            disabled={contacts.length === 0 || isGenerating}
            onClick={generateAccess}
          >
            {isGenerating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : access ? (
              <RefreshCw className="size-4" />
            ) : (
              <Link2 className="size-4" />
            )}
            {access ? "Regenerar" : "Generar"}
          </Button>
        </div>
      </div>

      {access ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(300px,340px)]">
          <div className="min-w-0 rounded-md border border-white/10 bg-black/20 p-3">
            <p className="text-xs font-medium uppercase text-white/45">Link</p>
            <div className="mt-2 flex gap-2">
              <Input
                readOnly
                value={portalUrl}
                className="!h-9 min-w-0 flex-1 rounded-md border border-white/10 bg-white/[0.06] px-3 text-sm text-white/80 outline-none"
              />
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-md border-white/12 bg-white/[0.06] text-white hover:bg-white/[0.12]"
                onClick={() => copy(portalUrl, "link")}
              >
                {copied === "link" ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copied === "link" ? "Copiado" : "Copiar"}
              </Button>
            </div>
          </div>

          <div className="min-w-0 rounded-md border border-white/10 bg-black/20 p-3">
            <p className="text-xs font-medium uppercase text-white/45">Codigo</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="inline-flex h-9 min-w-0 flex-1 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.06] px-3 font-mono text-lg tracking-[0.18em] text-white">
                <KeyRound className="size-4 tracking-normal text-cyan-100/70" />
                {access.code}
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-md border-white/12 bg-white/[0.06] text-white hover:bg-white/[0.12]"
                onClick={() => access.code && copy(access.code, "code")}
              >
                {copied === "code" ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copied === "code" ? "Copiado" : "Copiar"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-rose-100">{error}</p> : null}
    </div>
  );
}
