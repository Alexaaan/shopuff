/**
 * Swagger API Paths Documentation
 * 
 * Example endpoint documentation following OpenAPI 3.0 specs.
 * This file provides templates for documenting all API endpoints.
 */

import { swaggerSchemas } from './swagger.schemas';
import { swaggerResponses } from './swagger.responses';

/**
 * Path Item Object Template
 * Used to document each API endpoint
 */
export const pathTemplate = {
  /**
   * GET endpoint documentation template
   */
  get: {
    tags: ['TagName'],
    summary: 'Brief description of the endpoint',
    description: 'Detailed description of what this endpoint does',
    operationId: 'operationName',
    parameters: [
      {
        name: 'paramName',
        in: 'query',
        description: 'Parameter description',
        required: false,
        schema: {
          type: 'string',
          example: 'example'
        }
      }
    ],
    responses: {
      '200': {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SuccessResponse' }
          }
        }
      },
      '400': { $ref: '#/components/responses/BadRequest' },
      '401': { $ref: '#/components/responses/Unauthorized' },
      '404': { $ref: '#/components/responses/NotFound' },
      '500': { $ref: '#/components/responses/InternalServerError' }
    },
    security: [{ bearerAuth: [] }]
  },

  /**
   * POST endpoint documentation template
   */
  post: {
    tags: ['TagName'],
    summary: 'Create a new resource',
    description: 'Endpoint to create a new resource in the system',
    operationId: 'createResource',
    requestBody: {
      description: 'Resource data to create',
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/CreateResourceDto' }
        }
      }
    },
    responses: {
      '201': {
        description: 'Resource created successfully',
        content: {
          'application/json': {
            schema: { $ref: '#/components/responses/Created' }
          }
        }
      },
      '400': { $ref: '#/components/responses/BadRequest' },
      '409': { $ref: '#/components/responses/Conflict' },
      '500': { $ref: '#/components/responses/InternalServerError' }
    },
    security: [{ bearerAuth: [] }]
  },

  /**
   * PUT endpoint documentation template
   */
  put: {
    tags: ['TagName'],
    summary: 'Update a resource',
    description: 'Endpoint to update an existing resource',
    operationId: 'updateResource',
    parameters: [
      {
        name: 'id',
        in: 'path',
        description: 'Resource ID',
        required: true,
        schema: {
          type: 'integer',
          example: 1
        }
      }
    ],
    requestBody: {
      description: 'Updated resource data',
      required: true,
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/UpdateResourceDto' }
        }
      }
    },
    responses: {
      '200': {
        description: 'Resource updated successfully',
        content: {
          'application/json': {
            schema: { $ref: '#/components/responses/Success' }
          }
        }
      },
      '400': { $ref: '#/components/responses/BadRequest' },
      '404': { $ref: '#/components/responses/NotFound' },
      '500': { $ref: '#/components/responses/InternalServerError' }
    },
    security: [{ bearerAuth: [] }]
  },

  /**
   * DELETE endpoint documentation template
   */
  delete: {
    tags: ['TagName'],
    summary: 'Delete a resource',
    description: 'Endpoint to delete an existing resource',
    operationId: 'deleteResource',
    parameters: [
      {
        name: 'id',
        in: 'path',
        description: 'Resource ID',
        required: true,
        schema: {
          type: 'integer',
          example: 1
        }
      }
    ],
    responses: {
      '200': {
        description: 'Resource deleted successfully',
        content: {
          'application/json': {
            schema: { $ref: '#/components/responses/Success' }
          }
        }
      },
      '404': { $ref: '#/components/responses/NotFound' },
      '500': { $ref: '#/components/responses/InternalServerError' }
    },
    security: [{ bearerAuth: [] }]
  }
};

/**
 * Example: Complete Auth Endpoints Documentation
 */
export const authPaths = {
  '/api/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register a new user',
      description: 'Creates a new user account with email and password authentication.',
      operationId: 'register',
      requestBody: {
        description: 'User registration data',
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/RegisterDto' },
            example: {
              email: 'john@example.com',
              password: 'SecurePassword123!',
              nom: 'Doe',
              prenom: 'John',
              telephone: '+33123456789'
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'User registered successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthResponse' },
              example: {
                success: true,
                message: 'User registered successfully',
                data: {
                  user: {
                    id: 1,
                    email: 'john@example.com',
                    nom: 'Doe',
                    prenom: 'John',
                    role: 'user'
                  },
                  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  expiresIn: 3600
                }
              }
            }
          }
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '409': { $ref: '#/components/responses/Conflict' },
        '500': { $ref: '#/components/responses/InternalServerError' }
      }
    }
  },

  '/api/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'User login',
      description: 'Authenticates user with email and password, returns JWT tokens.',
      operationId: 'login',
      requestBody: {
        description: 'Login credentials',
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/LoginDto' },
            example: {
              email: 'john@example.com',
              password: 'SecurePassword123!'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthResponse' }
            }
          }
        },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '500': { $ref: '#/components/responses/InternalServerError' }
      }
    }
  }
};

/**
 * Example: Product Endpoints Documentation
 */
export const productPaths = {
  '/api/products': {
    get: {
      tags: ['Products'],
      summary: 'List all products',
      description: 'Retrieves a paginated list of products with optional filtering.',
      operationId: 'listProducts',
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Page number',
          required: false,
          schema: { type: 'integer', default: 1 }
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Items per page',
          required: false,
          schema: { type: 'integer', default: 20 }
        },
        {
          name: 'search',
          in: 'query',
          description: 'Search query for product name',
          required: false,
          schema: { type: 'string' }
        },
        {
          name: 'category',
          in: 'query',
          description: 'Filter by category',
          required: false,
          schema: { type: 'string' }
        }
      ],
      responses: {
        '200': {
          description: 'Products retrieved successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaginatedResponse' },
              example: {
                success: true,
                message: 'Products retrieved successfully',
                data: [
                  {
                    id: 1,
                    nom: 'Premium Coffee',
                    prix: 29.99,
                    category: 'coffee',
                    average_rating: 4.5
                  }
                ],
                pagination: {
                  page: 1,
                  limit: 20,
                  total: 50,
                  totalPages: 3
                }
              }
            }
          }
        },
        '500': { $ref: '#/components/responses/InternalServerError' }
      }
    }
  }
};

/**
 * Example: Chat Message Endpoint Documentation
 */
export const chatPaths = {
  '/api/messages': {
    post: {
      tags: ['Chat'],
      summary: 'Send a chat message',
      description: 'Sends a new message in a conversation. Requires authentication.',
      operationId: 'sendMessage',
      requestBody: {
        description: 'Message data',
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SendMessageDto' },
            example: {
              orderId: 1,
              content: 'Hello, I have a question about my order.',
              clientId: 'uuid-1234-5678-abcd'
            }
          }
        }
      },
      responses: {
        '201': {
          description: 'Message sent successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
              example: {
                success: true,
                message: 'Message sent successfully',
                data: {
                  id: 1,
                  order_id: 1,
                  content: 'Hello, I have a question about my order.',
                  created_at: '2024-01-15T10:30:00Z'
                }
              }
            }
          }
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '500': { $ref: '#/components/responses/InternalServerError' }
      },
      security: [{ bearerAuth: [] }]
    }
  }
};

/**
 * Example: Notification Send Endpoint Documentation
 */
export const notificationPaths = {
  '/api/notifications': {
    post: {
      tags: ['Notifications'],
      summary: 'Send a notification campaign',
      description: 'Creates and sends a notification to targeted users. Admin only.',
      operationId: 'sendNotification',
      requestBody: {
        description: 'Notification data',
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SendNotificationDto' },
            example: {
              title: 'Summer Sale!',
              message: 'Get 20% off on all products this weekend.',
              type: 'promotion',
              target: 'all'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Notification sent successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
              example: {
                success: true,
                message: 'Notification sent successfully',
                data: {
                  campaignId: 1,
                  devicesTargeted: 1500,
                  sent: 1450,
                  failed: 50
                }
              }
            }
          }
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '403': { $ref: '#/components/responses/Forbidden' },
        '500': { $ref: '#/components/responses/InternalServerError' }
      },
      security: [{ bearerAuth: [] }]
    }
  }
};
