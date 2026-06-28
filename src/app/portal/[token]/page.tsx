import { ClientPortalPageClient } from "@/components/client-portal/client-portal-page-client";

export const dynamic = "force-dynamic";

type ClientPortalPageProps = {
  params: Promise<{ token: string }>;
};

export default async function ClientPortalPage({
  params,
}: ClientPortalPageProps) {
  const { token } = await params;

  return <ClientPortalPageClient token={token} />;
}
