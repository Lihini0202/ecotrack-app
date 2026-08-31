module.exports = {
  testEnvironment: 'node',
  // mongodb-memory-server downloads and boots a mongod on first run; the 5s
  // default is not enough for a cold CI cache.
  testTimeout: 60000,
  setupFiles: ['<rootDir>/tests/setup/env.js'],
  collectCoverageFrom: [
    'app.js',
    'config/**/*.js',
    'controllers/**/*.js',
    'models/**/*.js',
    'routes/**/*.js',
    'services/**/*.js',
    'utils/**/*.js'
  ],
  // Each suite owns its own in-memory mongod, so they must not share a process.
  maxWorkers: 1
};
