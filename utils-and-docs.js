// utils/validation.js
const { body, validationResult } = require('express-validator');

const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const validateProfile = [
  body('age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be between 13 and 120'),
  
  body('weight')
    .optional()
    .isFloat({ min: 30, max: 300 })
    .withMessage('Weight must be between 30 and 300 kg'),
  
  body('height')
    .optional()
    .isFloat({ min: 100, max: 250 })
    .withMessage('Height must be between 100 and 250 cm'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  
  body('activityLevel')
    .optional()
    .isIn(['sedentary', 'lightly_active', 'moderately_active', 'very_active'])
    .withMessage('Invalid activity level'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfile,
  handleValidationErrors
};

// utils/aiService.js
const axios = require('axios');

class AIService {
  static async getPersonalizedRecommendations(userProfile, currentProgress) {
    try {
      // In production, this would connect to an actual AI service
      // For now, we'll provide intelligent mock responses
      
      const recommendations = {
        workout: this.generateWorkoutRecommendations(userProfile, currentProgress),
        nutrition: this.generateNutritionRecommendations(userProfile, currentProgress),
        lifestyle: this.generateLifestyleRecommendations(userProfile, currentProgress)
      };
      
      return recommendations;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to generate AI recommendations');
    }
  }
  
  static generateWorkoutRecommendations(userProfile, currentProgress) {
    const { fitnessGoals, activityLevel, preferences } = userProfile;
    const recommendations = [];
    
    // Analyze current progress and adjust recommendations
    if (currentProgress && currentProgress.length > 0) {
      const recentProgress = currentProgress[0];
      
      if (recentProgress.workoutCompleted === false) {
        recommendations.push({
          type: 'motivation',
          message: 'You missed yesterday\'s workout. Let\'s get back on track with a lighter session today!',
          action: 'Start with a 20-minute beginner workout'
        });
      }
    }
    
    // Goal-specific recommendations
    if (fitnessGoals.includes('weight_loss')) {
      recommendations.push({
        type: 'cardio',
        message: 'Add 15 minutes of HIIT training to boost fat burning',
        action: 'Try interval running or cycling'
      });
    }
    
    if (fitnessGoals.includes('muscle_gain')) {
      recommendations.push({
        type: 'strength',
        message: 'Focus on progressive overload this week',
        action: 'Increase weights by 5% or add 2 more reps'
      });
    }
    
    return recommendations;
  }
  
  static generateNutritionRecommendations(userProfile, currentProgress) {
    const recommendations = [];
    const { fitnessGoals, preferences } = userProfile;
    
    if (currentProgress && currentProgress.length > 0) {
      const recentProgress = currentProgress[0];
      
      if (recentProgress.caloriesConsumed > recentProgress.targetCalories * 1.2) {
        recommendations.push({
          type: 'calorie_control',
          message: 'You exceeded your calorie target yesterday. Let\'s focus on portion control today.',
          action: 'Try using smaller plates and eating slowly'
        });
      }
    }
    
    // Dietary restrictions
    if (preferences.dietaryRestrictions && preferences.dietaryRestrictions.includes('vegetarian')) {
      recommendations.push({
        type: 'protein',
        message: 'Ensure adequate protein intake with plant-based sources',
        action: 'Include lentils, quinoa, or Greek yogurt in your meals'
      });
    }
    
    return recommendations;
  }
  
  static generateLifestyleRecommendations(userProfile, currentProgress) {
    const recommendations = [];
    
    // Sleep recommendations
    recommendations.push({
      type: 'sleep',
      message: 'Quality sleep is crucial for recovery and weight management',
      action: 'Aim for 7-9 hours of sleep tonight'
    });
    
    // Hydration
    recommendations.push({
      type: 'hydration',
      message: 'Stay hydrated to support your metabolism and workout performance',
      action: 'Drink at least 8 glasses of water today'
    });
    
    return recommendations;
  }
  
  static async generateMealPlan(userProfile, preferences = {}) {
    const { dietaryRestrictions = [], cuisinePreferences = [] } = preferences;
    const { dailyCalories, macros } = this.calculateNutritionNeeds(userProfile);
    
    const mealDatabase = {
      breakfast: [
        {
          name: 'Overnight Oats with Berries',
          calories: 350,
          protein: 15,
          carbs: 55,
          fats: 8,
          ingredients: ['oats', 'milk', 'berries', 'honey'],
          prepTime: 5,
          vegan: false,
          glutenFree: true
        },
        {
          name: 'Avocado Toast',
          calories: 320,
          protein: 12,
          carbs: 35,
          fats: 18,
          ingredients: ['whole grain bread', 'avocado', 'eggs', 'tomato'],
          prepTime: 10,
          vegan: false,
          glutenFree: false
        }
      ],
      lunch: [
        {
          name: 'Grilled Chicken Salad',
          calories: 450,
          protein: 35,
          carbs: 25,
          fats: 22,
          ingredients: ['chicken breast', 'mixed greens', 'olive oil', 'vegetables'],
          prepTime: 15,
          vegan: false,
          glutenFree: true
        },
        {
          name: 'Quinoa Buddha Bowl',
          calories: 420,
          protein: 18,
          carbs: 52,
          fats: 16,
          ingredients: ['quinoa', 'chickpeas', 'vegetables', 'tahini'],
          prepTime: 20,
          vegan: true,
          glutenFree: true
        }
      ],
      dinner: [
        {
          name: 'Baked Salmon with Vegetables',
          calories: 480,
          protein: 40,
          carbs: 20,
          fats: 25,
          ingredients: ['salmon', 'broccoli', 'sweet potato', 'olive oil'],
          prepTime: 25,
          vegan: false,
          glutenFree: true
        }
      ]
    };
    
    // Filter meals based on dietary restrictions
    const filteredMeals = {};
    Object.keys(mealDatabase).forEach(mealType => {
      filteredMeals[mealType] = mealDatabase[mealType].filter(meal => {
        if (dietaryRestrictions.includes('vegan') && !meal.vegan) return false;
        if (dietaryRestrictions.includes('gluten_free') && !meal.glutenFree) return false;
        return true;
      });
    });
    
    return filteredMeals;
  }
  
  static calculateNutritionNeeds(userProfile) {
    // Implementation from the main server file
    const { age, weight, height, gender, activityLevel, fitnessGoals } = userProfile;
    
    let bmr;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
    
    const activityFactors = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725
    };
    
    const tdee = bmr * (activityFactors[activityLevel] || 1.2);
    
    let targetCalories = tdee;
    if (fitnessGoals.includes('weight_loss')) {
      targetCalories = tdee - 500;
    } else if (fitnessGoals.includes('muscle_gain')) {
      targetCalories = tdee + 300;
    }
    
    return {
      dailyCalories: Math.round(targetCalories),
      macros: {
        protein: Math.round(targetCalories * 0.25 / 4),
        carbs: Math.round(targetCalories * 0.45 / 4),
        fats: Math.round(targetCalories * 0.30 / 9)
      }
    };
  }
}

module.exports = AIService;

// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ai-health-coach' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;

// scripts/seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User'); // You'll need to extract models to separate files

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await User.deleteMany({});
    console.log('Cleared existing users');
    
    // Create sample users
    const sampleUsers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        profile: {
          age: 28,
          gender: 'male',
          height: 175,
          weight: 75,
          activityLevel: 'moderately_active',
          fitnessGoals: ['weight_loss', 'muscle_gain'],
          preferences: {
            workoutTypes: ['strength', 'cardio'],
            duration: 45,
            daysPerWeek: 4,
            dietaryRestrictions: []
          }
        }
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: await bcrypt.hash('password123', 10),
        profile: {
          age: 32,
          gender: 'female',
          height: 165,
          weight: 60,
          activityLevel: 'lightly_active',
          fitnessGoals: ['endurance', 'strength'],
          preferences: {
            workoutTypes: ['cardio', 'flexibility'],
            duration: 30,
            daysPerWeek: 3,
            dietaryRestrictions: ['vegetarian']
          }
        }
      }
    ];
    
    await User.insertMany(sampleUsers);
    console.log('Sample users created');
    
    console.log('Seeding completed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();

// tests/auth.test.js
const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');

describe('Authentication Endpoints', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/ai-health-coach-test');
  });
  
  beforeEach(async () => {
    await User.deleteMany({});
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
  });
  
  describe('POST /api/auth/register', () => {
    test('Should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
        
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
    });
    
    test('Should not register user with invalid email', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'Password123'
      };
      
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
    });
    
    test('Should not register user with weak password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123'
      };
      
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);
    });
  });
  
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123'
        });
    });
    
    test('Should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123'
        })
        .expect(200);
        
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBeDefined();
    });
    
    test('Should not login with invalid credentials', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(400);
    });
  });
});

// API Documentation (README.md format)
# AI Health Coach Backend API

## Overview
A comprehensive REST API for the AI Health Coach application, providing personalized fitness and nutrition recommendations powered by AI.

## Features
- User authentication and authorization
- Personalized workout plan generation
- Custom diet plan creation
- Progress tracking and analytics
- AI-powered recommendations
- Secure data handling with JWT tokens
- Rate limiting and security middlewares

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd ai-health-coach-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB (if running locally)
mongod

# Run the development server
npm run dev
```

### Environment Variables
```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ai-health-coach
JWT_SECRET=your-super-secret-jwt-key
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### User Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Workout Plans
- `POST /api/workout-plans/generate` - Generate AI workout plan
- `GET /api/workout-plans/active` - Get active workout plan

### Diet Plans
- `POST /api/diet-plans/generate` - Generate AI diet plan
- `GET /api/diet-plans/active` - Get active diet plan

### Progress Tracking
- `POST /api/progress` - Record progress entry
- `GET /api/progress` - Get progress history

### Dashboard
- `GET /api/dashboard` - Get dashboard data
- `GET /api/health` - Health check endpoint

## Request/Response Examples

### Register User
```javascript
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response:
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Update Profile
```javascript
PUT /api/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "age": 28,
  "gender": "male",
  "height": 175,
  "weight": 75,
  "activityLevel": "moderately_active",
  "fitnessGoals": ["weight_loss", "muscle_gain"],
  "preferences": {
    "workoutTypes": ["strength", "cardio"],
    "duration": 45,
    "daysPerWeek": 4,
    "dietaryRestrictions": []
  }
}
```

### Generate Workout Plan
```javascript
POST /api/workout-plans/generate
Authorization: Bearer <token>

Response:
{
  "message": "Workout plan generated successfully",
  "workoutPlan": {
    "planName": "Personalized weight_loss & muscle_gain Plan",
    "description": "AI-generated workout plan based on your profile",
    "duration": 8,
    "workouts": [
      {
        "day": "Monday",
        "exercises": [
          {
            "name": "Push-ups",
            "type": "strength",
            "sets": 3,
            "reps": "10-15",
            "targetMuscles": ["chest", "shoulders", "triceps"]
          }
        ]
      }
    ]
  }
}
```

## Error Handling
The API uses standard HTTP status codes and returns consistent error responses:

```javascript
{
  "error": "Error message",
  "details": [] // Additional validation errors if applicable
}
```

## Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet.js security headers
- Input validation and sanitization

## Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## Deployment
The application can be deployed using Docker:

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individual container
docker build -t ai-health-coach-backend .
docker run -p 3000:3000 ai-health-coach-backend
```

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

## License
MIT License
