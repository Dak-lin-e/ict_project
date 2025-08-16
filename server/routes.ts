import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuoteSchema, insertUserPreferencesSchema, insertUserFavoriteSchema, insertUserHistorySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Quotes routes
  app.get("/api/quotes", async (req, res) => {
    try {
      const { category } = req.query;
      let quotes;
      
      if (category && category !== 'all') {
        quotes = await storage.getQuotesByCategory(category as string);
      } else {
        quotes = await storage.getAllQuotes();
      }
      
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  app.get("/api/quotes/random", async (req, res) => {
    try {
      const { category } = req.query;
      let quotes;
      
      if (category && category !== 'all') {
        quotes = await storage.getQuotesByCategory(category as string);
      } else {
        quotes = await storage.getAllQuotes();
      }
      
      if (quotes.length === 0) {
        return res.status(404).json({ message: "No quotes found" });
      }
      
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      res.json(randomQuote);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch random quote" });
    }
  });

  app.get("/api/quotes/:id", async (req, res) => {
    try {
      const quote = await storage.getQuoteById(req.params.id);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      res.json(quote);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quote" });
    }
  });

  // User preferences routes
  app.get("/api/preferences", async (req, res) => {
    try {
      const preferences = await storage.getUserPreferences();
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  app.post("/api/preferences", async (req, res) => {
    try {
      const validatedPreferences = insertUserPreferencesSchema.parse(req.body);
      const preferences = await storage.createUserPreferences(validatedPreferences);
      res.json(preferences);
    } catch (error) {
      res.status(400).json({ message: "Invalid preferences data" });
    }
  });

  app.patch("/api/preferences", async (req, res) => {
    try {
      const preferences = await storage.updateUserPreferences(req.body);
      res.json(preferences);
    } catch (error) {
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  // Favorites routes
  app.get("/api/favorites", async (req, res) => {
    try {
      const favorites = await storage.getUserFavorites();
      const favoritesWithQuotes = await Promise.all(
        favorites.map(async (favorite) => {
          const quote = await storage.getQuoteById(favorite.quoteId);
          return { ...favorite, quote };
        })
      );
      res.json(favoritesWithQuotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const validatedFavorite = insertUserFavoriteSchema.parse(req.body);
      const favorite = await storage.addFavorite(validatedFavorite);
      res.json(favorite);
    } catch (error) {
      res.status(400).json({ message: "Invalid favorite data" });
    }
  });

  app.delete("/api/favorites/:quoteId", async (req, res) => {
    try {
      await storage.removeFavorite(req.params.quoteId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // History routes
  app.get("/api/history", async (req, res) => {
    try {
      const history = await storage.getUserHistory();
      const historyWithQuotes = await Promise.all(
        history.map(async (entry) => {
          const quote = await storage.getQuoteById(entry.quoteId);
          return { ...entry, quote };
        })
      );
      res.json(historyWithQuotes.slice(0, 10)); // Latest 10 entries
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  app.post("/api/history", async (req, res) => {
    try {
      const validatedHistory = insertUserHistorySchema.parse(req.body);
      const history = await storage.addToHistory(validatedHistory);
      res.json(history);
    } catch (error) {
      res.status(400).json({ message: "Invalid history data" });
    }
  });

  app.delete("/api/history", async (req, res) => {
    try {
      await storage.clearHistory();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to clear history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
