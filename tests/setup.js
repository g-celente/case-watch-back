// Global test setup file
// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing';
process.env.JWT_EXPIRES_IN = '1h';
process.env.BCRYPT_ROUNDS = '1'; // Faster hashing for tests
process.env.DATABASE_URL = 'file:./test.db';
