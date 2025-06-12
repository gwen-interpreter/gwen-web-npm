module.exports = {
  testEnvironment: "node",
  rootDir: "test",
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
};
