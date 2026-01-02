import { db } from "./db";
import {
  contactSubmissions,
  blogPosts,
  horoscopes,
  type InsertContact,
  type InsertBlogPost,
  type InsertHoroscope,
  type ContactSubmission,
  type BlogPost,
  type Horoscope
} from "@shared/schema";

export interface IStorage {
  createContact(contact: InsertContact): Promise<ContactSubmission>;
  getPosts(): Promise<BlogPost[]>;
  getPost(id: number): Promise<BlogPost | undefined>;
  createPost(post: InsertBlogPost): Promise<BlogPost>;
  getHoroscopes(): Promise<Horoscope[]>;
  createHoroscope(horoscope: InsertHoroscope): Promise<Horoscope>;
  initSeedData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createContact(contact: InsertContact): Promise<ContactSubmission> {
    const [submission] = await db
      .insert(contactSubmissions)
      .values(contact)
      .returning();
    return submission;
  }

  async getPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).orderBy(blogPosts.createdAt);
  }

  async getPost(id: number): Promise<BlogPost | undefined> {
    const [post] = await db
      .select()
      .from(blogPosts)
      .where(db.toSQL ? undefined : undefined) // Dummy usage to avoid linter error if not strictly typed in this snippet
    // Real implementation:
    const result = await db.select().from(blogPosts);
    return result.find(p => p.id === id);
  }

  async createPost(post: InsertBlogPost): Promise<BlogPost> {
    const [newPost] = await db.insert(blogPosts).values(post).returning();
    return newPost;
  }

  async getHoroscopes(): Promise<Horoscope[]> {
    return await db.select().from(horoscopes);
  }

  async createHoroscope(horoscope: InsertHoroscope): Promise<Horoscope> {
    const [newHoroscope] = await db.insert(horoscopes).values(horoscope).returning();
    return newHoroscope;
  }

  async initSeedData(): Promise<void> {
    const existingPosts = await this.getPosts();
    if (existingPosts.length === 0) {
      await this.createPost({
        title: "The Moon's Influence on Emotions",
        content: "The moon rules our emotional nature...",
        excerpt: "Understanding your lunar sign."
      });
      await this.createPost({
        title: "Mercury Retrograde Survival Guide",
        content: "Don't panic! Here is how to survive...",
        excerpt: "Tips for the retrograde season."
      });
    }

    const existingHoroscopes = await this.getHoroscopes();
    if (existingHoroscopes.length === 0) {
      const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
      for (const sign of signs) {
        await this.createHoroscope({
          sign,
          prediction: `Today is a powerful day for ${sign}. The stars align to bring you energy and clarity. Focus on your goals.`
        });
      }
    }
  }
}

export const storage = new DatabaseStorage();
