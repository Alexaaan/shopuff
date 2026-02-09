/**
 * Professional Swagger/OpenAPI 3.0 Configuration
 * Generated for shopuff.next-app API
 * 
 * This configuration provides enterprise-grade API documentation
 * with security, pagination, and standardized responses.
 */

// Type definition for OpenAPI 3.0 Specification
export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    description: string;
    version: string;
    contact?: {
      name: string;
      email: string;
      url?: string;
    };
    license?: {
      name: string;
      url: string;
    };
    termsOfService?: string;
  };
  servers: Array<{
    url: string;
    description: string;
    variables?: Record<string, {
      default: string;
      enum?: string[];
    }>;
  }>;
  tags: Array<{
    name: string;
    description: string;
    externalDocs?: {
      description: string;
      url: string;
    };
  }>;
  components: {
    securitySchemes: Record<string, any>;
    schemas: Record<string, any>;
    responses: Record<string, any>;
    parameters?: Record<string, any>;
  };
  security: Array<Record<string, any[]>>;
  externalDocs?: {
    description: string;
    url: string;
  };
}

export const swaggerConfig = {
  openapi: '3.0.3',
  info: {
    title: 'Shopuff API',
    description: `
# Shopuff E-Commerce Platform API Documentation

## Overview
This API provides access to the Shopuff e-commerce platform, including:
- **Authentication** - User registration, login, and session management
- **Users** - User profile management and preferences
- **Products** - Product catalog with ratings and reviews
- **Orders** - Order creation and management
- **Chat** - Real-time messaging system
- **Notifications** - Push notifications and in-app alerts

## Base URL
- Development: \`http://localhost:3000\`
- Production: \`https://shopuff.vercel.app\`

## Response Format
All responses follow a standardized format:
\`\`\`json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "meta": {}
}
\`\`\`

## Pagination
List endpoints support pagination via query parameters:
- \`page\` - Page number (default: 1)
- \`limit\` - Items per page (default: 20)

## Rate Limiting
API requests are limited to 100 requests per minute per IP.

## Support
For API support, please contact: **support@shopuff.com**
    `,
    version: '1.0.0',
    contact: {
      name: 'API Support',
      email: 'support@shopuff.com',
      url: 'https://shopuff.com/support'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    },
    termsOfService: 'https://shopuff.com/terms'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
      variables: {
        port: {
          default: '3000',
          enum: ['3000', '3001', '3002']
        }
      }
    },
    {
      url: 'https://shopuff.vercel.app',
      description: 'Production server'
    }
  ],
  externalDocs: {
    description: 'Postman Collection',
    url: 'https://postman.com/shopuff'
  }
};
