import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { platformSettingsQuery, saveSettings } from "@/lib/admin";
import { PageHeading } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

const FIELDS = [
  { key: "platform_name", label: "Platform name", placeholder: "PitchForge" },
  { key: "support_email", label: "Support email", placeholder: "support@pitchforge.app" },
  { key: "currency", label: "Currency code", placeholder: "IDR" },
  { key: "default_entry_fee", label: "Default entry fee", placeholder: "250000" },
  { key: "max_teams_default", label: "Default max teams", placeholder: "16" },
  { key: "registration_notice", label: "Registration notice", placeholder: "Shown to team managers" },
] as const;

function SettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(platformSettingsQuery);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!data) return;
    const next: Record<string, string> = {};
    for (const row of data) next[row.key] = row.value ?? "";
    setValues((prev) => ({ ...next, ...prev }));
  }, [data]);

  const mutate = useMutation({
    mutationFn: () =>
      saveSettings(FIELDS.map((f) => ({ key: f.key, value: values[f.key] ?? "" }))),
    onSuccess: () => {
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeading title="Platform settings" subtitle="Global configuration for the whole platform." />
      <div className="glass max-w-2xl rounded-2xl p-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading settings…</p>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              mutate.mutate();
            }}
          >
            {FIELDS.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label htmlFor={f.key}>{f.label}</Label>
                <Input
                  id={f.key}
                  placeholder={f.placeholder}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                />
              </div>
            ))}
            <Button type="submit" disabled={mutate.isPending}>
              {mutate.isPending ? "Saving…" : "Save settings"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
