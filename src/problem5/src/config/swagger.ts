import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Product CRUD API',
      version: '1.0.0',
      description:
        'A production-ready RESTful API for managing product resources with JWT authentication',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from /api/auth/login or /api/auth/register',
        },
      },
      schemas: {
        Product: {
          type: 'object',
          required: ['name', 'sku', 'description'],
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Auto-generated UUID',
            },
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 200,
              description: 'Product name',
            },
            sku: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'Product SKU (unique identifier)',
            },
            description: {
              type: 'string',
              minLength: 0,
              maxLength: 2000,
              description: 'Product description',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Auto-generated creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Auto-updated timestamp',
            },
          },
        },
        CreateProductRequest: {
          type: 'object',
          required: ['name', 'sku', 'description'],
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 200,
              example: 'Laptop Pro 15',
            },
            sku: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              example: 'LAP-PRO-15-001',
            },
            description: {
              type: 'string',
              minLength: 0,
              maxLength: 2000,
              example: 'High-performance laptop with 15-inch display',
            },
          },
        },
        UpdateProductRequest: {
          type: 'object',
          required: ['name', 'sku', 'description'],
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 200,
              example: 'Laptop Pro 15 Updated',
            },
            sku: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              example: 'LAP-PRO-15-002',
            },
            description: {
              type: 'string',
              minLength: 0,
              maxLength: 2000,
              example: 'Updated high-performance laptop',
            },
          },
        },
        PatchProductRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 1,
              maxLength: 200,
              example: 'Laptop Pro 15 Updated',
            },
            sku: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              example: 'LAP-PRO-15-002',
            },
            description: {
              type: 'string',
              minLength: 0,
              maxLength: 2000,
              example: 'Partially updated description',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              minLength: 8,
              example: 'SecurePassword123',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              example: 'SecurePassword123',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'JWT token for authentication',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            user: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  format: 'uuid',
                },
                email: {
                  type: 'string',
                  format: 'email',
                },
              },
            },
          },
        },
        ProductListResponse: {
          type: 'object',
          properties: {
            products: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Product',
              },
            },
            total: {
              type: 'integer',
              description: 'Total number of products matching filters',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                  description: 'Human-readable error message',
                },
                code: {
                  type: 'string',
                  description: 'Machine-readable error code',
                },
                details: {
                  type: 'object',
                  description: 'Additional error details',
                },
              },
            },
          },
        },
      },
    },
    security: [],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
