import { users, type User, type InsertUser, type Score, type InsertScore, scores } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getScores(): Promise<Score[]>;
  createScore(score: InsertScore): Promise<Score>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private scoresList: Map<number, Score>;
  currentId: number;
  scoreId: number;

  constructor() {
    this.users = new Map();
    this.scoresList = new Map();
    this.currentId = 1;
    this.scoreId = 1;
    
    // Add some initial sample scores
    this.createScore({
      playerName: "RoboChampion",
      score: 1500,
      timeElapsed: 120
    });
    
    this.createScore({
      playerName: "AI_Master",
      score: 1200,
      timeElapsed: 90
    });
    
    this.createScore({
      playerName: "Tech_Guru",
      score: 900,
      timeElapsed: 75
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getScores(): Promise<Score[]> {
    // Return scores sorted by highest score first
    return Array.from(this.scoresList.values())
      .sort((a, b) => b.score - a.score);
  }
  
  async createScore(insertScore: InsertScore): Promise<Score> {
    const id = this.scoreId++;
    const now = new Date();
    
    const score: Score = {
      ...insertScore,
      id,
      createdAt: now
    };
    
    this.scoresList.set(id, score);
    return score;
  }
}

export const storage = new MemStorage();
