import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PRIMA Clone API Documentation',
      version: '1.0.0',
      description: 'Complete API documentation for PRIMA Clone - HR Management System',
      contact: {
        name: 'API Support',
        email: 'support@mailinator.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5004',
        description: 'Development server'
      },
      {
        url: 'http://localhost:5004',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', example: 'user@example.com' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            role: { 
              type: 'string', 
              enum: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
              example: 'EMPLOYEE'
            },
            phone: { type: 'string', example: '1234567890' },
            designation: { type: 'string', example: 'SOFTWARE_ENGINEER' },
            status: { 
              type: 'string', 
              enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
              example: 'ACTIVE'
            },
            isActive: { type: 'boolean', example: true }
          }
        },
        Leave: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            type: { 
              type: 'string', 
              enum: ['CASUAL', 'SICK', 'EARNED', 'UNPAID'],
              example: 'CASUAL'
            },
            reason: { type: 'string', example: 'Family function' },
            startDate: { type: 'string', format: 'date', example: '2024-01-15' },
            endDate: { type: 'string', format: 'date', example: '2024-01-17' },
            status: { 
              type: 'string', 
              enum: ['PENDING', 'APPROVED', 'REJECTED'],
              example: 'PENDING'
            },
            department: { type: 'string', example: 'Engineering' },
            approvedBy: { type: 'string', example: 'John Doe' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Attendance: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            date: { type: 'string', format: 'date', example: '2024-01-15' },
            checkIn: { type: 'string', format: 'time', example: '09:00:00' },
            checkOut: { type: 'string', format: 'time', example: '18:00:00' },
            status: { 
              type: 'string', 
              enum: ['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE'],
              example: 'PRESENT'
            },
            workingHours: { type: 'number', example: 9.0 }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Error message' },
            details: { type: 'string', example: 'Detailed error information' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/modules/routes/**/*.ts', './src/modules/controller/**/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
