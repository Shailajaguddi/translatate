import { translations, type Translation, type InsertTranslation } from "@shared/schema";

export interface IStorage {
  createTranslation(translation: InsertTranslation): Promise<Translation>;
  getRecentTranslations(limit: number): Promise<Translation[]>;
}

export class MemStorage implements IStorage {
  private translations: Map<number, Translation>;
  private currentId: number;

  constructor() {
    this.translations = new Map();
    this.currentId = 1;
  }

  async createTranslation(insertTranslation: InsertTranslation): Promise<Translation> {
    const id = this.currentId++;
    const translation: Translation = {
      ...insertTranslation,
      id,
      timestamp: new Date()
    };
    this.translations.set(id, translation);
    return translation;
  }

  async getRecentTranslations(limit: number): Promise<Translation[]> {
    return Array.from(this.translations.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
