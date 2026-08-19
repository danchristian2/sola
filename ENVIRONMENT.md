# Environment

Copy `.env.example` to `.env`.

| Variable | Purpose |
|----------|---------|
| NODE_ENV | development / test / production |
| PORT | API port (default 4000) |
| MONGODB_URI | Mongo connection string |
| JWT_SECRET | Signing secret (long random string) |
| JWT_EXPIRES_IN | e.g. 7d |
| CLIENT_URL | SPA origin for CORS |
| COOKIE_NAME | Auth cookie name |
| FILE_STORAGE_PROVIDER | local (default) |
| FILE_STORAGE_DIR | Local upload directory |
| LOG_LEVEL | info / debug / error |

Never commit `.env`.
