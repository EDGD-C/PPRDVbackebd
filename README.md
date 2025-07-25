# PPRDV

A modern Node.js REST API built with Fastify framework, featuring user authentication, role-based access control, and MySQL database integration.

## Features

- 🚀 **Fast Performance**: Built on Fastify for high-performance HTTP requests
- 🔐 **JWT Authentication**: Secure token-based authentication system
- 👥 **Role-Based Access Control**: User and admin roles with permission management
- 📊 **Database Integration**: MySQL with Sequelize ORM
- 📚 **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- 🔄 **Database Migrations**: Automated database schema management with Umzug
- ✅ **Input Validation**: Request validation with JSON schemas
- 🌐 **CORS Support**: Cross-origin resource sharing enabled
- 🔧 **Environment Configuration**: Flexible configuration with environment variables

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Fastify 5.x
- **Database**: MySQL
- **ORM**: Sequelize 7.x
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Documentation**: Swagger UI
- **Migrations**: Umzug
- **Testing**: Node.js built-in test runner

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v18 or higher)
- MySQL Server (v8.0 or higher)
- npm or yarn package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pprdv
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   
   Create a MySQL database:
   ```sql
   CREATE DATABASE pprdv;
   ```

4. **Configure Database Connection**
   
   Edit `src/config/database.js` to match your MySQL configuration:
   ```javascript
   const sequelize = new Sequelize({
     dialect: MySqlDialect,
     database: 'pprdv',     // Your database name
     user: 'root',          // Your MySQL username
     password: 'yourpass',  // Your MySQL password
     host: 'localhost',
     port: 3306,
   });
   ```

5. **Run Database Migrations**
   ```bash
   node migrate.js
   ```

## Usage

### Development Mode
```bash
npm run dev
```
This starts the server with auto-reload on file changes.

### Production Mode
```bash
npm start
```

### Testing
```bash
npm test
```

The server will start on `http://localhost:3000` by default.

## API Documentation

Once the server is running, access the interactive API documentation at:
- **Swagger UI**: `http://localhost:3000/documentation`

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/create-first-admin` | Create first admin user | No |
| GET | `/api/auth/system-status` | Get system status | No |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/profile` | Get current user profile | Yes |
| PUT | `/api/users/profile` | Update user profile | Yes |
| DELETE | `/api/users/:id` | Delete user | Admin |

### Test Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/test` | Server health check | No |

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **user**: Standard user with basic permissions
- **admin**: Administrator with full access to user management

## Environment Variables

You can configure the application using the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `HOST` | Server host | localhost |
| `JWT_SECRET` | JWT signing secret | (required) |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 3306 |
| `DB_NAME` | Database name | pprdv |
| `DB_USER` | Database username | root |
| `DB_PASS` | Database password | (empty) |

Create a `.env` file in the root directory:
```env
PORT=3000
HOST=localhost
JWT_SECRET=your-super-secret-jwt-key
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pprdv
DB_USER=root
DB_PASS=yourpassword
```

## Project Structure

```
pprdv/
├── src/
│   ├── app.js              # Main application setup
│   ├── server.js           # Server startup
│   ├── config/
│   │   └── database.js     # Database configuration
│   ├── controllers/
│   │   ├── authController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── roleMiddleware.js
│   ├── models/
│   │   └── User.js         # User model
│   ├── plugins/
│   │   ├── auth.js         # JWT authentication
│   │   ├── cors.js         # CORS configuration
│   │   ├── database.js     # Database plugin
│   │   └── swagger.js      # API documentation
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   └── users.js        # User management routes
│   ├── schemas/            # JSON validation schemas
│   ├── services/           # Business logic services
│   └── utils/              # Utility functions
├── migrations/             # Database migrations
├── test/                   # Test files
├── migrate.js             # Migration runner
└── package.json
```

## Getting Started

1. **First-time Setup**: After installation and database setup, create your first admin user:
   ```bash
   curl -X POST http://localhost:3000/api/auth/create-first-admin \
     -H "Content-Type: application/json" \
     -d '{
       "username": "admin",
       "email": "admin@example.com",
       "password": "securepassword"
     }'
   ```

2. **Login**: Use the admin credentials to get a JWT token:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "password": "securepassword"
     }'
   ```

3. **Access Protected Routes**: Use the returned token for authenticated requests:
   ```bash
   curl -X GET http://localhost:3000/api/users \
     -H "Authorization: Bearer <your-jwt-token>"
   ```

## Database Migrations

The project uses Umzug for database migrations. 

### Run Migrations
```bash
node migrate.js
```

### Rollback Last Migration
```bash
node migrate.js down
```

### Creating New Migrations

1. Create a new migration file in the `migrations/` directory following the naming pattern: `YYYYMMDD-description.js`
2. Follow the structure of existing migration files
3. Run migrations to apply changes

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

<!-- ## Support

For support, please open an issue in the repository or contact the development team.  -->