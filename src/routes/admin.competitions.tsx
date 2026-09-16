import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminCompetitionsQuery, setCompetitionStatus, money } from "@/lib/admin";
import { PageHeading } from "@/components/AdminShell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin/competitions")({
  component: CompetitionsPage,
});

const STATUSES = ["draft", "registration_open", "in_progress", "completed"];

function CompetitionsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(adminCompetitionsQuery);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const rows = useMemo(() => {
    return (data ?? []).filter((c) => {
      const matchesText = `${c.name} ${c.event_organizers?.name ?? ""} ${c.location ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesText && (status === "all" || c.status === status);
    });
  }, [data, search, status]);

  const mutate = useMutation({
    mutationFn: ({ id, next }: { id: string; next: string }) => setCompetitionStatus(id, next),
    onSuccess: () => {
      toast.success("Competition status updated");
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeading
        title="Competition monitoring"
        subtitle="Every competition across all organizers, with live status control."
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          placeholder="Search competition, organizer or city"
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="glass overflow-x-auto rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Competition</TableHead>
              <TableHead>Organizer</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Teams</TableHead>
              <TableHead>Entry fee</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6}>Loading competitions…</TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>No competitions match this filter.</TableCell>
              </TableRow>
            ) : (
              rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.location ?? "—"}</div>
                  </TableCell>
                  <TableCell>
                    {c.event_organizers?.name ?? "—"}
                    {c.event_organizers?.status === "suspended" ? (
                      <Badge variant="destructive" className="ml-2">
                        suspended
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell className="capitalize">{c.format.replace(/_/g, " ")}</TableCell>
                  <TableCell>
                    {c.competition_registrations?.[0]?.count ?? 0} / {c.max_teams}
                  </TableCell>
                  <TableCell>{money(Number(c.entry_fee ?? 0))}</TableCell>
                  <TableCell>
                    <Select
                      value={c.status}
                      onValueChange={(next) => mutate.mutate({ id: c.id, next })}
                    >
                      <SelectTrigger className="w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
