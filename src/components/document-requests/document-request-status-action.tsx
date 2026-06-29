import { DocumentRequestStatusBadge } from "@/components/document-requests/document-request-status";
import type { DocumentRequest } from "@/lib/api/types";

type DocumentRequestStatusActionProps = {
  request: DocumentRequest;
};

export function DocumentRequestStatusAction({
  request,
}: DocumentRequestStatusActionProps) {
  return (
    <div className="flex min-h-9 items-start">
      <DocumentRequestStatusBadge status={request.status} />
    </div>
  );
}
