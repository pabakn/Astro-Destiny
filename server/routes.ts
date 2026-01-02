import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize seed data
  await storage.initSeedData();

  // OpenAI Setup
  const openai = new OpenAI({ 
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });

  // Contact Form
  app.post(api.contacts.create.path, async (req, res) => {
    try {
      const contact = api.contacts.create.input.parse(req.body);
      await storage.createContact(contact);
      
      // Mock email sending
      console.log(`[EMAIL MOCK] Sending email to ${contact.email} regarding query: ${contact.query}`);
      // In a real app, we would use nodemailer or a service like SendGrid here
      // const transporter = nodemailer.createTransport({...});
      // await transporter.sendMail({...});

      res.status(201).json({ message: "Query received and email sent (mock)." });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // Blog Posts
  app.get(api.posts.list.path, async (req, res) => {
    const posts = await storage.getPosts();
    res.json(posts);
  });

  app.get(api.posts.get.path, async (req, res) => {
    const post = await storage.getPost(Number(req.params.id));
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  });

  // Horoscopes
  app.get(api.horoscopes.list.path, async (req, res) => {
    const horoscopes = await storage.getHoroscopes();
    res.json(horoscopes);
  });

  // Chat Bot
  app.post(api.chat.send.path, async (req, res) => {
    try {
      const { message } = api.chat.send.input.parse(req.body);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a helpful and mystical astrology assistant. Answer questions about zodiac signs, horoscopes, and the stars." },
          { role: "user", content: message }
        ],
      });

      const response = completion.choices[0].message.content || "The stars are silent today.";
      res.json({ response });
    } catch (err) {
      console.error("Chat error:", err);
      res.status(500).json({ message: "Failed to communicate with the spirits (AI error)." });
    }
  });

  return httpServer;
}
