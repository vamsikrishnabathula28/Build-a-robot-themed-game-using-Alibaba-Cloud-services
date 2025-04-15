import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { scoreSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for robot game
  app.get('/api/scores', async (req, res) => {
    try {
      const scores = await storage.getScores();
      res.json(scores);
    } catch (error) {
      console.error("Error fetching scores:", error);
      res.status(500).json({ message: "Failed to fetch scores" });
    }
  });
  
  app.post('/api/scores', async (req, res) => {
    try {
      // Validate input
      const scoreData = scoreSchema.parse(req.body);
      
      // Store score in database
      const newScore = await storage.createScore(scoreData);
      
      res.status(201).json(newScore);
    } catch (error) {
      console.error("Error creating score:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid score data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to save score" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
