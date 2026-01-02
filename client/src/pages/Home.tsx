import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { StarryBackground } from "@/components/StarryBackground";
import { ChatWidget } from "@/components/ChatWidget";
import { useHoroscopes, useBlogPosts, useContactMutation } from "@/hooks/use-astrology";
import { insertContactSchema, type InsertContact } from "@shared/schema";
import { 
  Loader2, 
  Send, 
  Moon, 
  Sun, 
  Stars, 
  BookOpen, 
  Mail, 
  Info,
  Calendar
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", 
  "Leo", "Virgo", "Libra", "Scorpio", 
  "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

// Helper to get image for section
const getSectionImage = (section: string) => {
  switch(section) {
    case "hero": return "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&q=80"; // Starry night sky
    case "about": return "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80"; // Mountains stars
    default: return "";
  }
};

export default function Home() {
  const [activeTab, setActiveTab] = useState("feed");

  return (
    <div className="min-h-screen relative flex flex-col">
      <StarryBackground />
      
      {/* Hero Header */}
      <header className="relative pt-20 pb-32 px-4 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-[-1]">
          {/* Unsplash: Starry Night Sky */}
          <img 
            src={getSectionImage("hero")} 
            alt="Starry Background" 
            className="w-full h-full object-cover opacity-30" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        <div className="max-w-7xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-display font-bold text-primary drop-shadow-[0_0_15px_rgba(255,191,0,0.3)]">
              Lumina Zodiac
            </h1>
            <p className="mt-4 text-xl md:text-2xl text-foreground/80 font-light tracking-wider max-w-2xl mx-auto">
              Your Daily Guide Through the Lunar Cycles
            </p>
          </motion.div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-20">
        <Tabs defaultValue="feed" className="w-full" onValueChange={setActiveTab}>
          <div className="flex justify-center mb-12">
            <TabsList className="bg-card/50 backdrop-blur-md border border-white/10 p-1 h-auto rounded-full shadow-2xl">
              <TabsTrigger 
                value="feed" 
                className="rounded-full px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 flex gap-2 items-center"
              >
                <Moon className="w-4 h-4" /> Daily Feed
              </TabsTrigger>
              <TabsTrigger 
                value="about" 
                className="rounded-full px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 flex gap-2 items-center"
              >
                <Info className="w-4 h-4" /> About Us
              </TabsTrigger>
              <TabsTrigger 
                value="publications" 
                className="rounded-full px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 flex gap-2 items-center"
              >
                <BookOpen className="w-4 h-4" /> Publications
              </TabsTrigger>
              <TabsTrigger 
                value="contact" 
                className="rounded-full px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 flex gap-2 items-center"
              >
                <Mail className="w-4 h-4" /> Contact Us
              </TabsTrigger>
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="feed">
                <DailyFeedTab />
              </TabsContent>

              <TabsContent value="about">
                <AboutTab />
              </TabsContent>

              <TabsContent value="publications">
                <PublicationsTab />
              </TabsContent>

              <TabsContent value="contact">
                <ContactTab />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </main>

      <ChatWidget />
    </div>
  );
}

// --- SUB-COMPONENTS ---

function DailyFeedTab() {
  const { data: horoscopes, isLoading } = useHoroscopes();

  // Create a map for easy lookup, or fallback to default text
  const getPrediction = (sign: string) => {
    return horoscopes?.find(h => h.sign.toLowerCase() === sign.toLowerCase())?.prediction || 
           "The stars align mysteriously today. Seek inner guidance.";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {ZODIAC_SIGNS.map((sign, index) => (
        <Card key={sign} className="glass-card hover:border-primary/50 transition-all duration-300 group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Stars className="w-24 h-24 text-primary" />
          </div>
          <CardHeader>
            <CardTitle className="flex justify-between items-center text-2xl">
              {sign}
              <span className="text-xs font-sans font-normal text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full border border-white/5">
                {format(new Date(), "MMM d")}
              </span>
            </CardTitle>
            <CardDescription className="text-primary/80 uppercase tracking-widest text-xs font-semibold">
              Daily Horoscope
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/90 leading-relaxed font-light">
              {getPrediction(sign)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AboutTab() {
  return (
    <Card className="glass-card max-w-4xl mx-auto overflow-hidden">
      <div className="grid md:grid-cols-2 gap-0">
        <div className="relative h-64 md:h-auto">
          {/* Unsplash: Mystical Mountain */}
          <img 
            src={getSectionImage("about")}
            alt="Mystical Landscape" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/20 mix-blend-overlay" />
        </div>
        <div className="p-8 md:p-12 space-y-6">
          <h2 className="text-3xl font-display font-bold text-primary">Ancient Wisdom, Modern Insight</h2>
          <div className="space-y-4 text-lg text-foreground/80 font-light leading-relaxed">
            <p>
              Lumina Zodiac was founded on the belief that the movements of the cosmos reflect the movements of our souls. We combine ancient lunar astrology with modern interpretative techniques to provide guidance that resonates with your daily life.
            </p>
            <p>
              Our team of expert astrologers and intuitive readers work tirelessly to decipher the celestial language, bringing you clarity, hope, and direction in an ever-changing world.
            </p>
          </div>
          <div className="pt-4 flex gap-4">
            <div className="text-center">
              <h4 className="text-2xl font-bold text-primary font-display">12+</h4>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Years Experience</p>
            </div>
            <div className="h-12 w-px bg-white/10" />
            <div className="text-center">
              <h4 className="text-2xl font-bold text-primary font-display">50k+</h4>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Readings Given</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function PublicationsTab() {
  const { data: posts, isLoading } = useBlogPosts();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-20 glass-card rounded-xl">
        <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-display text-primary">The Library is Quiet</h3>
        <p className="text-muted-foreground mt-2">No scrolls have been published yet. Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <Card key={post.id} className="glass-card hover:shadow-primary/10 transition-all duration-300 flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2 text-xs text-primary/80 font-semibold tracking-wider uppercase">
              <Calendar className="w-3 h-3" />
              {format(new Date(post.createdAt || Date.now()), "MMMM d, yyyy")}
            </div>
            <CardTitle className="text-2xl line-clamp-2">{post.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-muted-foreground leading-relaxed line-clamp-4">
              {post.excerpt}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="text-primary hover:text-primary/80 p-0 hover:bg-transparent group">
              Read Full Article 
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function ContactTab() {
  const contactMutation = useContactMutation();
  
  const form = useForm<InsertContact>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      query: ""
    }
  });

  const onSubmit = (data: InsertContact) => {
    contactMutation.mutate(data, {
      onSuccess: () => form.reset()
    });
  };

  return (
    <Card className="glass-card max-w-2xl mx-auto">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-3xl">Reach the Cosmos</CardTitle>
        <CardDescription className="text-base">
          Have a question about your reading? Fill out the form below and our guides will respond via email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary/90">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} className="bg-secondary/50 border-white/10 focus-visible:ring-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary/90">Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} className="bg-secondary/50 border-white/10 focus-visible:ring-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary/90">Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 000-0000" {...field} className="bg-secondary/50 border-white/10 focus-visible:ring-primary" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary/90">Your Query</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What do the stars say about..." 
                      className="min-h-[150px] bg-secondary/50 border-white/10 focus-visible:ring-primary" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg h-12"
              disabled={contactMutation.isPending}
            >
              {contactMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Transmitting...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
