# Blog CRUD Service

A RESTful blog API service built with Node.js, Express, TypeScript, and PostgreSQL. This microservice provides full CRUD operations for blog posts with validation, error handling, and pagination.

## Features

- ✅ Full CRUD operations for blog posts
- ✅ Input validation with Zod
- ✅ PostgreSQL database with connection pooling
- ✅ TypeScript for type safety
- ✅ Docker support with Docker Compose
- ✅ Database migrations and seeding
- ✅ Automated smoke testing
- ✅ Pagination and search functionality
- ✅ Unique slug generation
- ✅ Health check endpoint

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 16
- **Validation**: Zod
- **Container**: Docker & Docker Compose
- **Security**: Helmet, CORS
- **Logging**: Morgan

## Project Structure

```
blog-crud-service/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── index.ts              # Server entry point
│   ├── db.ts                 # Database connection
│   ├── controllers/
│   │   └── posts.controller.ts
│   ├── middleware/
│   │   └── error.ts
│   ├── routes/
│   │   └── posts.routes.ts
│   ├── services/
│   │   └── posts.service.ts
│   └── validation/
│       └── post.schema.ts
├── scripts/
│   ├── migrate.ts            # Database migrations
│   ├── seed.ts               # Database seeding
│   └── smoke.ts              # API smoke tests
├── docker-compose.yml        # PostgreSQL service
├── DockerFile               # Application container
├── package.json
├── tsconfig.json
└── .env                     # Environment variables
```

## Prerequisites

- **Node.js**: v18+ (v20 recommended)
- **npm**: v8+
- **Docker**: v20+ (for PostgreSQL)
- **Docker Compose**: v2+

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd blog-crud-service
npm install
```

### 2. Environment Setup

Copy the environment variables:

```bash
# .env file content
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://bloguser:blogpass@localhost:5433/blogdb
```

### 3. Start PostgreSQL Database

```bash
# Start PostgreSQL container
docker-compose up -d

# Verify database is running
docker-compose ps
```

### 4. Run Database Migrations

```bash
# Create tables
npm run migrate
```

### 5. Seed Initial Data (Optional)

```bash
# Insert sample blog posts
npm run seed
```

### 6. Start Development Server

```bash
# Start with hot reload
npm run dev
```

The API will be available at `http://localhost:4000`

## API Endpoints

### Health Check
```http
GET /healthz
```

### Posts API

| Method | Endpoint | Description | Auth Header |
|--------|----------|-------------|-------------|
| `GET` | `/api/v1/posts` | List posts with pagination | No |
| `GET` | `/api/v1/posts/:id` | Get post by ID | No |
| `POST` | `/api/v1/posts` | Create new post | `x-user-id` |
| `PUT` | `/api/v1/posts/:id` | Update post | No |
| `DELETE` | `/api/v1/posts/:id` | Delete post | No |

### Query Parameters (List Posts)

- `limit` (number): Number of posts per page (default: 20)
- `offset` (number): Number of posts to skip (default: 0)
- `q` (string): Search query (searches title and content)
- `published` (boolean): Filter by published status

### Request/Response Examples

#### Create Post
```bash
curl -X POST http://localhost:4000/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "x-user-id: john-doe" \
  -d '{
    "title": "My First Blog Post",
    "content": "This is the content of my first blog post...",
    "published": true,
    "slug": "my-first-post"
  }'
```

Response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "My First Blog Post",
  "slug": "my-first-post",
  "content": "This is the content of my first blog post...",
  "published": true,
  "author_id": "john-doe",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

#### List Posts
```bash
curl "http://localhost:4000/api/v1/posts?limit=5&offset=0&published=true"
```

Response:
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "My First Blog Post",
      "slug": "my-first-post",
      "content": "This is the content...",
      "published": true,
      "author_id": "john-doe",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "limit": 5,
  "offset": 0
}
```

#### Update Post
```bash
curl -X PUT http://localhost:4000/api/v1/posts/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Blog Post Title",
    "published": false
  }'
```

## Development Scripts

```bash
# Development with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Run database migrations
npm run migrate

# Seed database with sample data
npm run seed

# Run API smoke tests
npm run smoke
```

## Database Schema

The `posts` table structure:

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  author_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_created_at ON posts (created_at DESC);
```

## Testing

### Smoke Tests

Run comprehensive API tests:

```bash
npm run smoke
```

This will test:
- Health endpoint
- Create post
- List posts
- Get post by ID
- Update post
- Delete post
- Verify deletion (404)

### Manual Testing with curl

```bash
# Health check
curl http://localhost:4000/healthz

# Create a post
curl -X POST http://localhost:4000/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{"title":"Test Post","content":"Test content","published":true}'

# List all posts
curl http://localhost:4000/api/v1/posts

# Search posts
curl "http://localhost:4000/api/v1/posts?q=test&published=true"
```

## Production Deployment

### Docker Build

```bash
# Build the application image
docker build -t blog-crud-service .

# Run with Docker Compose (includes PostgreSQL)
docker-compose up --build
```

### Environment Variables

For production, set these environment variables:

```bash
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://username:password@host:port/database
```

## Error Handling

The API returns consistent error responses:

```json
{
  "message": "Error description",
  "errors": {
    // Validation errors (if applicable)
  }
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Parameterized queries
- **Environment Variables**: Sensitive data protection

## Performance Features

- **Connection Pooling**: PostgreSQL connection pool
- **Pagination**: Limit/offset pagination
- **Indexing**: Database indexes for performance
- **Unique Slug Generation**: Automatic slug collision handling

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# View PostgreSQL logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Port Conflicts

If port 4000 is in use, change it in [.env](.env):
```
PORT=5000
```

If PostgreSQL port 5433 is in use, change it in [docker-compose.yml](docker-compose.yml):
```yaml
ports:
  - "5434:5432"
```

### TypeScript Build Issues

```bash
# Clean build
rm -rf dist
npm run build
```

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the error logs
3. Create an issue in the repository
