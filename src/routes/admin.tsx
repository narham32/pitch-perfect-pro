import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Super Admin Console — PitchForge" },
      {
        name: "description",
        content:
          "Platform control room: organizers, competitions, users, payments and global settings.",
      },
      { property: "og:title", content: "Super Admin Console — PitchForge" },
      {
        property: "og:description",
        content: "Manage organizers, competitions, users and payments across the platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminShell,
});
