import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { translateRequestSchema, insertTranslationSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { v2 } from "@google-cloud/translate";

const { Translate } = v2;
const translate = new Translate({
  key: process.env.GOOGLE_TRANSLATE_API_KEY
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, targetLanguage } = translateRequestSchema.parse(req.body);

      try {
        const [translation] = await translate.translate(text, targetLanguage);
        
        const savedTranslation = await storage.createTranslation({
          sourceText: text,
          translatedText: translation,
          targetLanguage
        });

        res.json(savedTranslation);
      } catch (error) {
        console.error("Translation API error:", error);
        res.status(500).json({ 
          message: "Failed to translate text. Please try again later."
        });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ 
          message: fromZodError(error).message 
        });
      } else {
        res.status(500).json({ 
          message: "An unexpected error occurred"
        });
      }
    }
  });

  app.get("/api/translations/recent", async (_req, res) => {
    try {
      const translations = await storage.getRecentTranslations(10);
      res.json(translations);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to fetch recent translations"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
