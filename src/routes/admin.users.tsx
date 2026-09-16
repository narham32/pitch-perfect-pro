import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  adminUsersQuery,
  grantRole,
  revokeRole,
  ROLE_LABEL,
  type AppRole,
} from "@/lib/admin";
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

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

const ROLES: AppRole[] = ["super_admin", "organizer", "team_manager"];

function UsersPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(adminUsersQuery);

  const mutate = useMutation({
    mutationFn: async (v: { userId: string; role: AppRole; has: boolean }) =>
      v.has ? revokeRole(v.userId, v.role) : grantRole(v.userId, v.role),
    onSuccess: () => {
      toast.success("Roles updated");
      qc.invalidateQueries({ queryKey: ["admin"] });
      qc.invalidateQueries({ queryKey: ["my-roles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeading
        title="User management"
        subtitle="Grant or revoke platform roles for every registered account."
      />
      <div className="glass overflow-x-auto rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead className="text-right">Toggle role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4}>Loading users…</TableCell>
              </TableRow>
            ) : (data ?? []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>No users yet.</TableCell>
              </TableRow>
            ) : (
              (data ?? []).map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email ?? "—"}</TableCell>
                  <TableCell className="space-x-1">
                    {u.roles.length === 0 ? (
                      <span className="text-sm text-muted-foreground">No roles</span>
                    ) : (
                      u.roles.map((r) => (
                        <Badge key={r} variant="secondary">
                          {ROLE_LABEL[r]}
                        </Badge>
                      ))
                    )}
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    {ROLES.map((r) => {
                      const has = u.roles.includes(r);
                      return (
                        <Button
                          key={r}
                          size="sm"
                          variant={has ? "outline" : "secondary"}
                          disabled={mutate.isPending}
                          onClick={() => mutate.mutate({ userId: u.id, role: r, has })}
                        >
                          {has ? `Revoke ${ROLE_LABEL[r]}` : `Grant ${ROLE_LABEL[r]}`}
                        </Button>
                      );
                    })}
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
