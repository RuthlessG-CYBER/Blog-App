# Personal Blog & Daily Journal Backend

This is the backend for a personal Blog / Daily Journal mobile application built with Node.js, Express, TypeScript, Prisma, PostgreSQL, and Cloudinary.

## Architecture

The backend follows a modular, layer-based architecture:
- **Routes:** Define API endpoints and apply middleware.
- **Controllers:** Handle HTTP requests and responses.
- **Services:** Contain business logic and interact with the database.
- **Prisma:** ORM used to interact with the PostgreSQL database.
- **PostgreSQL:** Stores user and post data.
- **Cloudinary:** Stores image media.

## Technology Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- Cloudinary
- JWT Authentication
- bcrypt
- Zod

## Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/blog_app
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
NODE_ENV=development
```

## Installation and Setup

1. Install dependencies:
```bash
npm install
```

2. Run database migrations:
```bash
npx prisma migrate dev --name init
```

3. Generate Prisma client:
```bash
npx prisma generate
```

4. Run development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

6. Run production server:
```bash
npm start
```

## API Endpoints and Postman Testing

### 1. Authentication

**Register a User**
- **URL:** `POST /api/auth/register`
- **Body:**
```json
{
  "name": "Somu",
  "email": "somu@example.com",
  "password": "StrongPassword123"
}
```

**Login**
- **URL:** `POST /api/auth/login`
- **Body:**
```json
{
  "email": "somu@example.com",
  "password": "StrongPassword123"
}
```
*Note: Keep the token from the response for authenticated requests.*

**Get Current User**
- **URL:** `GET /api/auth/me`
- **Headers:** `Authorization: Bearer <token>`

### 2. Posts

**Create a Post**
- **URL:** `POST /api/posts`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "title": "My Morning Routine",
  "content": "Today I woke up at 7 AM...",
  "imageUrl": "https://res.cloudinary.com/...",
  "imagePublicId": "blog/user123/abc123"
}
```
*Note: Images can optionally be uploaded directly to Cloudinary from the client.*

**Get All Posts**
- **URL:** `GET /api/posts`
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:** `page`, `limit`, `search`, `date`, `from`, `to`, `sort` (e.g., `?page=1&limit=10&sort=newest`)

**Get a Single Post**
- **URL:** `GET /api/posts/:id`
- **Headers:** `Authorization: Bearer <token>`

**Update a Post**
- **URL:** `PUT /api/posts/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

**Delete a Post**
- **URL:** `DELETE /api/posts/:id`
- **Headers:** `Authorization: Bearer <token>`

### 3. Images

**Upload an Image for a Post**
- **URL:** `POST /api/posts/:id/image`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** Form-Data with key `image` and a file.

**Delete an Image from a Post**
- **URL:** `DELETE /api/posts/:id/image`
- **Headers:** `Authorization: Bearer <token>`

## CI/CD Pipeline
GitHub Actions are configured to run linting and tests on push and pull requests to the main branch.
