import { 
  type User, 
  type InsertUser, 
  type Quote, 
  type InsertQuote,
  type UserPreferences,
  type InsertUserPreferences,
  type UserFavorite,
  type InsertUserFavorite,
  type UserHistory,
  type InsertUserHistory
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Quotes
  getAllQuotes(): Promise<Quote[]>;
  getQuotesByCategory(category: string): Promise<Quote[]>;
  getQuoteById(id: string): Promise<Quote | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  
  // User Preferences
  getUserPreferences(): Promise<UserPreferences | undefined>;
  createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences>;
  
  // Favorites
  getUserFavorites(): Promise<UserFavorite[]>;
  addFavorite(favorite: InsertUserFavorite): Promise<UserFavorite>;
  removeFavorite(quoteId: string): Promise<void>;
  
  // History
  getUserHistory(): Promise<UserHistory[]>;
  addToHistory(history: InsertUserHistory): Promise<UserHistory>;
  clearHistory(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private quotes: Map<string, Quote>;
  private userPreferences: UserPreferences | undefined;
  private userFavorites: Map<string, UserFavorite>;
  private userHistory: Map<string, UserHistory>;

  constructor() {
    this.users = new Map();
    this.quotes = new Map();
    this.userFavorites = new Map();
    this.userHistory = new Map();
    this.initializeQuotes();
  }

  private initializeQuotes() {
    const initialQuotes: InsertQuote[] = [
      // 집중 카테고리
      { text: "완벽 대신 시작.", category: "focus", tags: ["시작", "완벽주의"], isPersonalizable: 0 },
      { text: "5분만 하면, 25분이 따라온다.", category: "focus", tags: ["포모도로", "시간관리"], isPersonalizable: 0 },
      { text: "의지가 약하면 루틴이 지켜준다.", category: "focus", tags: ["루틴", "의지"], isPersonalizable: 0 },
      { text: "앉는 순간 절반은 성공.", category: "focus", tags: ["시작", "성공"], isPersonalizable: 0 },
      { text: "지금 단 한 장이 내일의 자신감.", category: "focus", tags: ["자신감", "꾸준함"], isPersonalizable: 0 },
      { text: "작게 시작해, 크게 쌓아.", category: "focus", tags: ["시작", "성장"], isPersonalizable: 0 },
      { text: "{name}, 지금 10분만 시작해. 시작이 {goal}의 절반이야.", category: "focus", tags: ["개인화", "시작"], isPersonalizable: 1 },

      // 동기 카테고리
      { text: "오늘의 1%가 100일 뒤의 나를 바꾼다.", category: "motivation", tags: ["성장", "변화"], isPersonalizable: 0 },
      { text: "미래의 나는 오늘의 나에게 감사할 거야.", category: "motivation", tags: ["미래", "감사"], isPersonalizable: 0 },
      { text: "천천히 가도 멈추지 않으면 도착한다.", category: "motivation", tags: ["꾸준함", "인내"], isPersonalizable: 0 },
      { text: "방향이 맞다면 느려도 걱정 없다.", category: "motivation", tags: ["방향", "확신"], isPersonalizable: 0 },
      { text: "목표는 멀리, 발걸음은 가까이.", category: "motivation", tags: ["목표", "실행"], isPersonalizable: 0 },
      { text: "꿈은 기록할 때 계획이 된다.", category: "motivation", tags: ["꿈", "계획"], isPersonalizable: 0 },

      // 시험 카테고리
      { text: "D-{days_left}: 한 문제 더 = 등급 한 칸.", category: "exam", tags: ["시험", "디데이"], isPersonalizable: 1 },
      { text: "지금 한 회독이 시험장에서 안정감이 된다.", category: "exam", tags: ["회독", "안정감"], isPersonalizable: 0 },
      { text: "시험은 요행이 아니라 준비의 총합.", category: "exam", tags: ["준비", "노력"], isPersonalizable: 0 },
      { text: "모르는 건 두려움, 알게 되면 도구.", category: "exam", tags: ["지식", "두려움"], isPersonalizable: 0 },
      { text: "마지막 1주: 틈새 복습이 점수를 만든다.", category: "exam", tags: ["복습", "점수"], isPersonalizable: 0 },
      { text: "정답률은 운이 아니라 습관의 통계.", category: "exam", tags: ["습관", "정답률"], isPersonalizable: 0 },

      // 슬럼프 카테고리
      { text: "무너지는 건 순간, 일어서는 건 선택.", category: "slump", tags: ["극복", "선택"], isPersonalizable: 0 },
      { text: "실수는 정지선이 아니라 이정표.", category: "slump", tags: ["실수", "성장"], isPersonalizable: 0 },
      { text: "오늘 흔들려도 내일은 단단해진다.", category: "slump", tags: ["회복", "강함"], isPersonalizable: 0 },
      { text: "포기는 아웃, 휴식은 타임아웃.", category: "slump", tags: ["포기", "휴식"], isPersonalizable: 0 },
      { text: "넘어졌다면 데이터를 챙겨라: 왜, 언제, 어떻게.", category: "slump", tags: ["분석", "학습"], isPersonalizable: 0 },
      { text: "힘들수록 기본기로 돌아가.", category: "slump", tags: ["기본기", "원리"], isPersonalizable: 0 },
      { text: "지금 포기하면 어제의 노력이 울어. {name}, 5문제만 더.", category: "slump", tags: ["개인화", "포기"], isPersonalizable: 1 },

      // 루틴 카테고리
      { text: "할 일을 시간에 넣어라. 시간이 일을 지켜준다.", category: "routine", tags: ["시간관리", "계획"], isPersonalizable: 0 },
      { text: "캘린더에 없으면, 세상에도 없다.", category: "routine", tags: ["계획", "실행"], isPersonalizable: 0 },
      { text: "집중 25, 휴식 5—리듬이 실력.", category: "routine", tags: ["포모도로", "리듬"], isPersonalizable: 0 },
      { text: "아침 1시간은 저녁 2시간의 가치.", category: "routine", tags: ["아침", "효율"], isPersonalizable: 0 },
      { text: "작업을 쪼개면 부담도 쪼개진다.", category: "routine", tags: ["분할", "관리"], isPersonalizable: 0 },
      { text: "끝낼 수 없다면, 시작 시간을 정하라.", category: "routine", tags: ["시작", "시간"], isPersonalizable: 0 },

      // 성장 카테고리
      { text: "나는 '못해'가 아니라 '아직'이야.", category: "growth", tags: ["성장마인드", "가능성"], isPersonalizable: 0 },
      { text: "실력은 반복의 별명.", category: "growth", tags: ["반복", "실력"], isPersonalizable: 0 },
      { text: "비교는 잠깐, 기록은 평생의 증거.", category: "growth", tags: ["기록", "비교"], isPersonalizable: 0 },
      { text: "동기부여는 오프닝, 습관이 메인 스토리.", category: "growth", tags: ["습관", "동기"], isPersonalizable: 0 },
      { text: "오늘의 나와 경쟁하라.", category: "growth", tags: ["자기계발", "경쟁"], isPersonalizable: 0 },
      { text: "꾸준함은 재능을 이긴다.", category: "growth", tags: ["꾸준함", "재능"], isPersonalizable: 0 },
    ];

    initialQuotes.forEach(quote => this.createQuote(quote));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllQuotes(): Promise<Quote[]> {
    return Array.from(this.quotes.values());
  }

  async getQuotesByCategory(category: string): Promise<Quote[]> {
    return Array.from(this.quotes.values()).filter(quote => quote.category === category);
  }

  async getQuoteById(id: string): Promise<Quote | undefined> {
    return this.quotes.get(id);
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const id = randomUUID();
    const quote: Quote = { 
      ...insertQuote, 
      id, 
      createdAt: new Date(),
      tags: insertQuote.tags as string[] || [],
      isPersonalizable: insertQuote.isPersonalizable || 0
    };
    this.quotes.set(id, quote);
    return quote;
  }

  async getUserPreferences(): Promise<UserPreferences | undefined> {
    return this.userPreferences;
  }

  async createUserPreferences(insertPreferences: InsertUserPreferences): Promise<UserPreferences> {
    const id = randomUUID();
    const preferences: UserPreferences = { 
      ...insertPreferences,
      targetDate: insertPreferences.targetDate || null,
      notificationTime: insertPreferences.notificationTime || "09:00",
      darkMode: insertPreferences.darkMode || 0,
      largeText: insertPreferences.largeText || 0,
      notificationsEnabled: insertPreferences.notificationsEnabled || 1,
      streak: insertPreferences.streak || 0,
      id, 
      createdAt: new Date() 
    };
    this.userPreferences = preferences;
    return preferences;
  }

  async updateUserPreferences(updates: Partial<UserPreferences>): Promise<UserPreferences> {
    if (!this.userPreferences) {
      throw new Error("No user preferences found");
    }
    this.userPreferences = { ...this.userPreferences, ...updates };
    return this.userPreferences;
  }

  async getUserFavorites(): Promise<UserFavorite[]> {
    return Array.from(this.userFavorites.values());
  }

  async addFavorite(insertFavorite: InsertUserFavorite): Promise<UserFavorite> {
    const id = randomUUID();
    const favorite: UserFavorite = { 
      ...insertFavorite, 
      id, 
      createdAt: new Date() 
    };
    this.userFavorites.set(id, favorite);
    return favorite;
  }

  async removeFavorite(quoteId: string): Promise<void> {
    const favoriteToRemove = Array.from(this.userFavorites.entries()).find(
      ([_, favorite]) => favorite.quoteId === quoteId
    );
    if (favoriteToRemove) {
      this.userFavorites.delete(favoriteToRemove[0]);
    }
  }

  async getUserHistory(): Promise<UserHistory[]> {
    return Array.from(this.userHistory.values()).sort(
      (a, b) => (b.viewedAt?.getTime() || 0) - (a.viewedAt?.getTime() || 0)
    );
  }

  async addToHistory(insertHistory: InsertUserHistory): Promise<UserHistory> {
    const id = randomUUID();
    const history: UserHistory = { 
      ...insertHistory, 
      id, 
      viewedAt: new Date() 
    };
    this.userHistory.set(id, history);
    return history;
  }

  async clearHistory(): Promise<void> {
    this.userHistory.clear();
  }
}

export const storage = new MemStorage();
