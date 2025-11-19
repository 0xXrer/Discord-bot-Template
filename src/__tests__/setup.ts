import 'reflect-metadata';

beforeAll(() => {
  process.env.BOT_TOKEN = 'test_token';
  process.env.CLIENT_ID = 'test_client_id';
  process.env.CLIENT_SECRET = 'test_client_secret';
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error';
});
