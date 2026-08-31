// Loaded by jest before the test framework. Keeps tests independent of a
// developer's real .env.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-not-used-outside-jest';
