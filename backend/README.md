# TruckManager Backend

Backend API for TruckManager application built with Node.js, Express, and MVC architecture.

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Helper functions
│   ├── views/           # Templates (if needed)
│   └── server.js        # Main application file
├── .env.example         # Example environment variables
├── .gitignore          # Git ignore file
└── package.json        # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. Install dependencies:
```bash
npm install
```
2. Create environment file:
```bash
copy .env.example .env
```

3. Configure your `.env` file with your MongoDB connection string:
```
MONGODB_URI=mongodb://localhost:27017/truckmanager
```

Or for MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/truckmanager
```

4. Make sure MongoDB is running (if using local installation)
3. Configure your `.env` file with appropriate values.

### Running the Application

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
- `GET /api/v1/trucks` - Get all trucks
- `GET /api/v1/trucks/:id` - Get truck by ID
- `GET /api/v1/trucks/status/:status` - Get trucks by status (available, in-use, maintenance)
- `POST /api/v1/trucks` - Create new truck
- `PUT /api/v1/trucks/:id` - Update truck
- `DELETE /api/v1/trucks/:id` - Delete truck000` (or your configured PORT).

## API Endpoints

### Trucks

- `GET /api/v1/trucks` - Get all trucks
- `GET /api/v1/trucks/:id` - Get truck by ID
- `POST /api/v1/trucks` - Create new truck
- `PUT /api/v1/trucks/:id` - Update truck
- `DELETE /api/v1/trucks/:id` - Delete truck

### Health Check

- `GET /health` - Server health check

## Example Request

Create a new truck:
```bash
POST /api/v1/trucks
Content-Type: application/json

{
  "brand": "Volvo",
  "model": "FH16",
  "year": 2023,
  "licensePlate": "XYZ-789",
  "status": "available"
}
```

## Technologies Used

- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing
- **helmet** - Security headers
- **morgan** - HTTP request logger
- **nodemon** - Development auto-reload

## Development

The project follows MVC (Model-View-Controller) architecture:

- **Models**: Define data structure and validation
- **Views**: API responses (JSON)
- **Controllers**: Business logic and request handling
- **Routes**: API endpoint definitions

## License

ISC
