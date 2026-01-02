import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { InsertContact, BlogPost, Horoscope } from "@shared/schema";
import { z } from "zod";

// Fetch Daily Horoscopes
export function useHoroscopes() {
  return useQuery({
    queryKey: [api.horoscopes.list.path],
    queryFn: async () => {
      const res = await fetch(api.horoscopes.list.path);
      if (!res.ok) throw new Error("Failed to fetch horoscopes");
      return api.horoscopes.list.responses[200].parse(await res.json());
    },
  });
}

// Fetch Blog Posts
export function useBlogPosts() {
  return useQuery({
    queryKey: [api.posts.list.path],
    queryFn: async () => {
      const res = await fetch(api.posts.list.path);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return api.posts.list.responses[200].parse(await res.json());
    },
  });
}

// Submit Contact Form
export function useContactMutation() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: InsertContact) => {
      const validated = api.contacts.create.input.parse(data);
      const res = await fetch(api.contacts.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to submit query");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "The stars have received your query. We will respond shortly.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Transmission Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Chat Bot Mutation
export function useChatMutation() {
  return useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch(api.chat.send.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      
      if (!res.ok) throw new Error("The oracle is silent right now.");
      const data = await res.json();
      return api.chat.send.responses[200].parse(data);
    },
  });
}
