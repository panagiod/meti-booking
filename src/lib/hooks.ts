"use client";

import { useQuery } from "@tanstack/react-query";

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
  });
}

export function useAdminUsers(params?: { role?: string; search?: string }) {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.role) searchParams.set("role", params.role);
      if (params?.search) searchParams.set("search", params.search);

      const res = await fetch(`/api/admin/users?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });
}
