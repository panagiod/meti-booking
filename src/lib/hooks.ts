"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Advisor Dashboard
export function useAdvisorDashboard() {
  return useQuery({
    queryKey: ["advisor-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/advisor/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json();
    },
  });
}

// Advisor Services
export function useAdvisorServices() {
  return useQuery({
    queryKey: ["advisor-services"],
    queryFn: async () => {
      const res = await fetch("/api/advisor/services");
      if (!res.ok) throw new Error("Failed to fetch services");
      return res.json();
    },
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/advisor/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create service");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisor-services"] });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/advisor/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update service");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisor-services"] });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/advisor/services?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete service");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisor-services"] });
    },
  });
}

// Advisor Schedule
export function useAdvisorSchedule() {
  return useQuery({
    queryKey: ["advisor-schedule"],
    queryFn: async () => {
      const res = await fetch("/api/advisor/schedule");
      if (!res.ok) throw new Error("Failed to fetch schedule");
      return res.json();
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/advisor/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update schedule");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisor-schedule"] });
    },
  });
}

// Advisor Profile
export function useAdvisorProfile() {
  return useQuery({
    queryKey: ["advisor-profile"],
    queryFn: async () => {
      const res = await fetch("/api/advisor/profile", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/advisor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisor-profile"] });
    },
  });
}

// Admin Dashboard
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

// Admin Advisors
export function useAdminAdvisors(params?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: ["admin-advisors", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set("status", params.status);
      if (params?.search) searchParams.set("search", params.search);

      const res = await fetch(`/api/admin/advisors?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch advisors");
      return res.json();
    },
  });
}

export function useUpdateAdvisorStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { advisorId: string; action: string }) => {
      const res = await fetch(`/api/admin/advisors/${data.advisorId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: data.action }),
      });
      if (!res.ok) throw new Error("Failed to update advisor");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-advisors"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });
}

// Admin Users
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
