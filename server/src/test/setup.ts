process.env.NODE_ENV = "test";
process.env.MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/sola_test";
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-jwt-secret-value";
process.env.CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";
