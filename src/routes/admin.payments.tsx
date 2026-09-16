import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminPaymentsQuery, setPaymentStatus, money } from "@/lib/admin";
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

export const Route = createFileRoute("/admin/payments")({
  component: PaymentsPage,
});

function tone(status: string) {
  if (status === "verified" || status === "paid" || status === "approved") return "default" as const;
  if (status === "rejected") return "destructive" as const;
  return "secondary" as const;
}

function PaymentsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(adminPaymentsQuery);
  const mutate = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => setPaymentStatus(id, status),
    onSuccess: () => {
      toast.success("Payment updated");
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = data ?? [];
  const total = rows
    .filter((p) => ["verified", "paid", "approved"].includes(p.status))
    .reduce((s, p) => s + Number(p.amount ?? 0), 0);

  return (
    <div>
      <PageHeading
        title="Payment monitoring"
        subtitle="Track and verify competition registration payments."
      />
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <div className="glass rounded-2xl p-5">
          <p className="eyebrow text-muted-foreground">Verified revenue</p>
          <p className="text-stat mt-2">{money(total)}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="eyebrow text-muted-foreground">Pending</p>
          <p className="text-stat mt-2">{rows.filter((p) => p.status === "pending").length}</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="eyebrow text-muted-foreground">Total records</p>
          <p className="text-stat mt-2">{rows.length}</p>
        </div>
      </div>

      <div className="glass overflow-x-auto rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead>Competition</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Proof</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>Loading payments…</TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>No payments recorded yet.</TableCell>
              </TableRow>
            ) : (
              rows.map((p) => {
                const reg = p.competition_registrations;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{reg?.teams?.name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {reg?.competitions?.name ?? "—"}
                      {reg?.competitions?.event_organizers?.name ? (
                        <span className="block text-xs">
                          {reg.competitions.event_organizers.name}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell>{money(Number(p.amount ?? 0))}</TableCell>
                    <TableCell>
                      <Badge variant={tone(p.status)}>{p.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {p.proof_url ? (
                        <a
                          href={p.proof_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-primary underline"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <Button
                        size="sm"
                        disabled={mutate.isPending || p.status === "verified"}
                        onClick={() => mutate.mutate({ id: p.id, status: "verified" })}
                      >
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={mutate.isPending || p.status === "rejected"}
                        onClick={() => mutate.mutate({ id: p.id, status: "rejected" })}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
