const freekeys = require('freekeys');

export interface ApiKeys {
  tmdb_key: string;
  imdb_key: string;
}

class FreeKeysManager {
  private static instance: FreeKeysManager;
  private keys: ApiKeys | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  private constructor() {}

  public static getInstance(): FreeKeysManager {
    if (!FreeKeysManager.instance) {
      FreeKeysManager.instance = new FreeKeysManager();
    }
    return FreeKeysManager.instance;
  }

  public async getKeys(): Promise<ApiKeys> {
    const now = Date.now();
    
    // Return cached keys if they're still valid
    if (this.keys && (now - this.lastFetchTime) < this.CACHE_DURATION) {
      return this.keys;
    }

    try {
      // Fetch new keys
      this.keys = await freekeys();
      this.lastFetchTime = now;
      console.log('✅ New API keys fetched successfully');
      return this.keys;
    } catch (error) {
      console.error('❌ Error fetching API keys:', error);
      
      // Return cached keys if available, even if expired
      if (this.keys) {
        console.log('⚠️ Using cached keys due to fetch error');
        return this.keys as ApiKeys;
      }
      
      // Fallback keys (you should replace these with your own)
      const fallbackKeys: ApiKeys = {
        tmdb_key: 'fb7bb23f03b6994dafc674c074d01761',
        imdb_key: '4b447405'
      };
      
      console.log('⚠️ Using fallback keys');
      return fallbackKeys;
    }
  }

  public async getTmdbKey(): Promise<string> {
    const keys = await this.getKeys();
    return keys.tmdb_key;
  }

  public async getImdbKey(): Promise<string> {
    const keys = await this.getKeys();
    return keys.imdb_key;
  }

  // Force refresh keys
  public async refreshKeys(): Promise<ApiKeys> {
    this.keys = null;
    this.lastFetchTime = 0;
    return this.getKeys();
  }
}

export default FreeKeysManager.getInstance();