# Vidly - Movie Rental Backend API

A production-ready RESTful API for a movie rental application built with **Node.js 25.6.0**, **Express 5.2.1**, and **MongoDB Atlas**.

This project implements core rental system functionality including JWT authentication, movie management, rentals, returns, and role-based access control.

## ✨ Features

- 🔐 **JWT-based Authentication** - Secure user registration and login
- 🎬 **Movie Management** - Full CRUD operations with stock tracking
- 🎭 **Genre Management** - Categorize and manage movie genres
- 👥 **Customer Management** - Track customer information
- 🏆 **Rental System** - Rent movies with automatic stock validation
- 📋 **Returns Processing** - Return movies with fee calculation
- 🔒 **Role-Based Access Control** - Admin-only operations
- ✔️ **Input Validation** - Joi schema validation on all endpoints
- 🛡️ **Async Error Handling** - Centralized error middleware
- 📧 **MongoDB Integration** - Atlas cloud database support

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Runtime** | Node.js v25.6.0 |
| **Framework** | Express.js 5.2.1 |
| **Database** | MongoDB 9.1.3 (Atlas) |
| **Validation** | Joi 18.0.2 |
| **Authentication** | JWT (jsonwebtoken 9.0.3) |
| **Password Hashing** | bcrypt 6.0.0 |
| **Configuration** | config 4.2.0 |
| **Testing** | Jest 30.3.0 + Supertest 7.2.2 |
| **Logging** | Winston 3.19.0 |
| **Security** | Helmet 8.1.0 |
| **Compression** | compression 1.8.1 |

## 📡 API Endpoints

### Authentication
- `POST /api/auth` - Login user (returns JWT token)

### Users
- `POST /api/users` - Register new user
- `GET /api/users/me` - Get current user profile

### Genres
- `GET /api/genres` - List all genres
- `POST /api/genres` - Create genre (requires auth)
- `PUT /api/genres/:id` - Update genre (requires auth)
- `DELETE /api/genres/:id` - Delete genre (admin only)

### Movies
- `GET /api/movies` - List all movies with stock info
- `GET /api/movies/:id` - Get single movie
- `POST /api/movies` - Create movie (requires auth)
- `PUT /api/movies/:id` - Update movie (requires auth)
- `DELETE /api/movies/:id` - Delete movie (admin only)

### Customers
- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create customer (requires auth)
- `PUT /api/customers/:id` - Update customer (requires auth)
- `DELETE /api/customers/:id` - Delete customer (requires auth)

### Rentals
- `GET /api/rentals` - List all rentals (requires auth)
- `GET /api/rentals/:id` - Get rental details (requires auth)
- `POST /api/rentals` - Create rental (requires auth)

### Returns
- `POST /api/returns` - Return a rented movie (requires auth)

## 🚀 Quick Start

### Prerequisites
- Node.js 25.6.0 or higher
- npm or yarn
- MongoDB Atlas account (free tier available)
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/uShaukat3737/Vidly.git
   cd Vidly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** (using `.env.example` as template)
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vidly?retryWrites=true&w=majority
   vidly_jwtPrivateKey=your_super_secret_jwt_key_here
   NODE_ENV=development
   PORT=3001
   ```

5. **Start the app**
   ```bash
   npm start
   ```

   The server will be available at `http://localhost:3001`

6. **Run tests**
   ```bash
   npm test
   ```

## 📁 Project Structure

```
Vidly/
├── config/                        # Environment configuration
│   ├── default.json              # Default config
│   ├── custom-environment-variables.json  # Maps env vars
│   ├── production.json           # Production config
│   └── test.json                 # Test config
├── middleware/
│   ├── auth.js                   # JWT authentication
│   ├── admin.js                  # Admin authorization
│   ├── async.js                  # Async error wrapper
│   ├── error.js                  # Global error handler
│   ├── validate.js               # Input validation
│   └── validateObjectId.js       # MongoDB ID validation
├── models/
│   ├── user.js                   # User schema
│   ├── genre.js                  # Genre schema
│   ├── movie.js                  # Movie schema
│   ├── customer.js               # Customer schema
│   └── rental.js                 # Rental schema with methods
├── routers/
│   ├── auth.js                   # Login endpoint
│   ├── users.js                  # User registration
│   ├── genres.js                 # Genre CRUD
│   ├── movies.js                 # Movie CRUD
│   ├── customers.js              # Customer CRUD
│   ├── rentals.js                # Rental management
│   ├── returns.js                # Return processing
│   └── home.js                   # Welcome route
├── startup/
│   ├── config.js                 # Config validation
│   ├── db.js                     # MongoDB connection
│   ├── logging.js                # Winston logger setup
│   ├── prod.js                   # Production middleware
│   ├── routes.js                 # Route registration
│   └── validation.js             # Joi validation setup
├── test/                         # Test suites
│   ├── integration/              # Integration tests
│   └── unit/                     # Unit tests
├── index.js                      # Application entry point
├── package.json
├── .env.example                  # Environment template
├── .npmrc                        # NPM config
├── DEPLOYMENT.md                 # Deployment guide
└── README.md
```

## 🔧 Debugging & Problem Solving

### Express 5.x Compatibility Issue (Resolved ✅)
**Problem**: `express-async-errors` package was incompatible with Express 5.x, causing module not found errors.

**Solution**: 
- Removed `express-async-errors` dependency
- Created custom `asyncHandler` middleware in `middleware/async.js`
- Wrapped all async route handlers with `asyncHandler()` for centralized error handling
- Error middleware automatically catches rejected promises

**How it works**:
```javascript
const asyncHandler = require('../middleware/async');

router.get('/', asyncHandler(async (req, res) => {
  // Errors automatically caught and passed to error middleware
  const data = await SomeModel.find();
  res.send(data);
}));
```

### Express Version Warning (Resolved ✅)
**Problem**: `npm warn config production Use '--omit=dev' instead`

**Solution**: Updated `.npmrc` file with `omit=dev` setting

### MongoDB Connection Error Handling (Improved ✅)
**Before**: Simple connection, no error handling
**After**: Added robust error handling with fallback and exit code
```javascript
mongoose.connect(db)
  .then(() => winston.info('Connected to MongoDB...'))
  .catch(err => {
    winston.error(`Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  });
```

### Configuration Management
- Uses `config` library for environment-based configuration
- Environment variables override defaults
- Safely validates JWT key at startup

## 🌐 Deployment

### Railway Deployment (Current)

Your app is live on Railway! They provide:
- ✅ Automatic deploys from GitHub commits
- ✅ Free tier with generous limits
- ✅ MongoDB Atlas integration
- ✅ Zero configuration needed

**Environment Variables on Railway**:
```
MONGODB_URI = your_mongodb_atlas_connection_string
vidly_jwtPrivateKey = your_jwt_secret
NODE_ENV = production
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete setup instructions.

### Deploying Changes
Any push to GitHub automatically triggers deployment:
```bash
git add .
git commit -m "Your changes"
git push
```

## 📝 Example Usage

### Register a User
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
# Returns: JWT token
```

### Rent a Movie
```bash
curl -X POST http://localhost:3001/api/rentals \
  -H "Content-Type: application/json" \
  -H "x-auth-token: <JWT_TOKEN>" \
  -d '{
    "customerId": "60f8c2e5e2a5b123456789ab",
    "movieId": "60f8c3a1b2c4d5e6f7a8b9c0"
  }'
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- test/integration/movies.test.js

# Run with coverage
npm test -- --coverage
```

## 📚 Best Practices Implemented

- ✅ **Async/Await** with centralized error handling
- ✅ **Environment-based configuration** using `config` library
- ✅ **Input validation** on all endpoints with Joi
- ✅ **JWT authentication** with secure token generation
- ✅ **Password hashing** with bcrypt (12 salt rounds)
- ✅ **Role-based access control** (admin vs user)
- ✅ **Structured logging** with Winston
- ✅ **Security headers** with Helmet
- ✅ **Response compression** for production
- ✅ **MongoDB transactions** for data consistency
- ✅ **Middleware separation** of concerns
- ✅ **Test coverage** with Jest and Supertest

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Verify `MONGODB_URI` in environment variables
- Ensure MongoDB Atlas Network Access allows your IP (0.0.0.0/0 for Render)
- Check username and password in connection string

### JWT Token Invalid
- Generate a new `vidly_jwtPrivateKey` value
- Ensure token is passed in `x-auth-token` header
- Verify token hasn't expired (24 hours default)

### Port Already in Use
- Change `PORT` environment variable
- Or kill process using port: `lsof -i :3001`

### Tests Failing
- Ensure `NODE_ENV` is set to `test` or unset
- Check MongoDB connection in test config
- Clear Jest cache: `npm test -- --clearCache`

## 📄 License

ISC License - Feel free to use this project for learning and development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👨‍💻 Author

**Usman Shaukat** - [GitHub](https://github.com/uShaukat3737)
httpPOST /api/returns
x-auth-token: <jwt_token>
{
  "customerId": "...",
  "movieId": "..."
}
License
This project is created for educational and portfolio purposes.