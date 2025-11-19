import { Config } from '../Config';

describe('Config', () => {
  let config: Config;

  beforeAll(() => {
    process.env.BOT_TOKEN = 'test_token_123';
    process.env.CLIENT_ID = 'test_client_id';
    process.env.CLIENT_SECRET = 'test_client_secret';
    process.env.OWNER_ID = 'test_owner_id';
    process.env.NODE_ENV = 'test';
    process.env.LOG_LEVEL = 'debug';
  });

  beforeEach(() => {
    config = new Config();
  });

  describe('Configuration retrieval', () => {
    it('should get configuration values', () => {
      expect(config.get('token')).toBe('test_token_123');
      expect(config.get('clientId')).toBe('test_client_id');
      expect(config.get('clientSecret')).toBe('test_client_secret');
      expect(config.get('ownerId')).toBe('test_owner_id');
    });

    it('should get all configuration', () => {
      const allConfig = config.getAll();
      expect(allConfig.token).toBe('test_token_123');
      expect(allConfig.nodeEnv).toBe('test');
    });
  });

  describe('Environment checks', () => {
    it('should identify test environment', () => {
      expect(config.isTest()).toBe(true);
      expect(config.isDevelopment()).toBe(false);
      expect(config.isProduction()).toBe(false);
    });
  });

  describe('Validation', () => {
    it('should throw error for missing required fields', () => {
      const originalToken = process.env.BOT_TOKEN;
      delete process.env.BOT_TOKEN;

      expect(() => new Config()).toThrow();

      process.env.BOT_TOKEN = originalToken;
    });
  });
});
