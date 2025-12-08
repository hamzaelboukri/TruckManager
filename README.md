# TruckManager

Full-stack application for managing trucks with Node.js, Express, MongoDB, and Docker.

## Project Structure

```
TruckManager/
├── backend/              # Node.js Express API
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # Request handlers
│   │   ├── models/      # Mongoose models
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Custom middleware
│   │   └── utils/       # Helper functions
│   ├── Dockerfile       # Backend Docker image
│   └── package.json
├── docker-compose.yml   # Docker orchestration
└── README.md
```

## Prerequisites

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose

## Quick Start with Docker

### 1. Clone or navigate to the project directory

```bash
cd TruckManager
```

### 2. Start all services with Docker Compose

```bash
docker-compose up -d
```

This will:
- Pull MongoDB 7.0 image
- Build the backend Node.js application
- Create a network for services to communicate
- Start MongoDB on port 27017
- Start Backend API on port 3000

### 3. Check if services are running

```bash
docker-compose ps
```

### 4. View logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# MongoDB only
docker-compose logs -f mongodb
```

### 5. Test the API

Open your browser or use curl:
```bash
curl http://localhost:3000
curl http://localhost:3000/health
curl http://localhost:3000/api/v1/trucks
```

## Docker Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### Stop and remove volumes (deletes database data)
```bash
docker-compose down -v
```

### Rebuild backend image
```bash
docker-compose build backend
```

### Restart a specific service
```bash
docker-compose restart backend
```

### View service logs
```bash
docker-compose logs -f [service-name]
```

### Execute commands in a container
```bash
# Access backend container shell
docker-compose exec backend sh

# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p admin123
```

## API Endpoints

### Trucks
- `GET /api/v1/trucks` - Get all trucks
- `GET /api/v1/trucks/:id` - Get truck by ID
- `GET /api/v1/trucks/status/:status` - Get trucks by status
- `POST /api/v1/trucks` - Create new truck
- `PUT /api/v1/trucks/:id` - Update truck
- `DELETE /api/v1/trucks/:id` - Delete truck

### Example Request

```bash
# Create a truck
curl -X POST http://localhost:3000/api/v1/trucks \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "Volvo",
    "model": "FH16",
    "year": 2023,
    "licensePlate": "ABC-123",
    "status": "available"
  }'
```

## Environment Variables

The docker-compose.yml contains default environment variables. For production:

1. Create a `.env` file in the root directory
2. Override default values:

```env
# MongoDB
MONGO_ROOT_USERNAME=your_username
MONGO_ROOT_PASSWORD=your_secure_password

# Backend
NODE_ENV=production
PORT=3000
JWT_SECRET=your_very_secure_jwt_secret
```

3. Update docker-compose.yml to use `.env` file

## MongoDB Access

### Connection String (from outside Docker)
```
mongodb://admin:admin123@localhost:27017/truckmanager?authSource=admin
```

### Using MongoDB Compass or Studio 3T
- Host: `localhost`
- Port: `27017`
- Username: `admin`
- Password: `admin123`
- Auth Database: `admin`

## Development

For local development without Docker:

1. Install MongoDB locally or use MongoDB Atlas
2. Navigate to backend folder:
```bash
cd backend
npm install
```

3. Create `.env` file:
```bash
copy .env.example .env
```

4. Update MongoDB URI in `.env`

5. Start development server:
```bash
npm run dev
```

## Production Deployment

For production deployment:

1. Update environment variables with secure values
2. Use secrets management for sensitive data
3. Configure proper MongoDB backup strategy
4. Set up SSL/TLS certificates
5. Use a reverse proxy (nginx) for the backend
6. Implement rate limiting and security best practices

## Technologies

- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose ODM
- **Containerization**: Docker & Docker Compose
- **Security**: Helmet, CORS
- **Logging**: Morgan

## License

ISC
