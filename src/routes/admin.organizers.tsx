import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminOrganizersQuery, setOrganizerStatus } from "@/lib/admin";
import { PageHeading } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin/organizers")({
  component: OrganizersPage,
});

function statusTone(status: string) {
  if (status === "approved" || status === "active") return "default" as const;
  if (status === "suspended") return "destructive" as const;
  return "secondary" as const;
}

function OrganizersPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(adminOrganizersQuery);
  const mutate = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => setOrganizerStatus(id, status),
    onSuccess: () => {
      toast.success("Organizer updated");
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeading
        title="Event organizer management"
        subtitle="Approve, reactivate or suspend organizer accounts."
      />
      <div className="glass overflow-x-auto rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organizer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4}>Loading organizers…</TableCell>
              </TableRow>
            ) : (data ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>No organizers yet.</TableCell>
              </TableRow>
            ) : (
              (data ?? []).map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.name}</TableCell>
                  <TableCell className="text-muted-foreground">{o.contact_email ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statusTone(o.status)}>{o.status}</Badge>
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button
                      size="sm"
                      disabled={mutate.isPending || o.status === "approved"}
                      onClick={() => mutate.mutate({ id: o.id, status: "approved" })}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={mutate.isPending || o.status === "suspended"}
                      onClick={() => mutate.mutate({ id: o.id, status: "suspended" })}
                    >
                      Suspend
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
