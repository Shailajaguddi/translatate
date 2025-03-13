import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  sourceText: text("source_text").notNull(),
  translatedText: text("translated_text").notNull(),
  targetLanguage: text("target_language").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});

export const insertTranslationSchema = createInsertSchema(translations).pick({
  sourceText: true,
  translatedText: true,
  targetLanguage: true
});

export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type Translation = typeof translations.$inferSelect;

export const translateRequestSchema = z.object({
  text: z.string().min(1, "Text is required"),
  targetLanguage: z.string().min(2, "Language code is required")
});

export type TranslateRequest = z.infer<typeof translateRequestSchema>;

export const languageOptions = [
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
  { value: "ar", label: "Arabic" }
];
