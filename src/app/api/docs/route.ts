import { NextRequest, NextResponse } from 'next/server';

/**
 * OpenAPI 3.0 Specification Endpoint
 * 
 * GET /api/docs
 * 
 * Returns the complete OpenAPI 3.0 specification for the Shopuff API.
 */

// Import swagger configuration
import { swaggerConfig } from '@/docs/swagger/swagger.config';
import { swaggerTags } from '@/docs/swagger/swagger.tags';
import { swaggerSchemas, swaggerResponses, swaggerSecurity } from '@/docs/swagger';
import { authPaths, productPaths, chatPaths, notificationPaths } from '@/docs/swagger/swagger.paths';
import { securityRequirements } from '@/docs/swagger/swagger.security';

// Build the complete OpenAPI spec
function buildOpenAPISpec() {
  return {
    openapi: swaggerConfig.openapi,
    info: swaggerConfig.info,
    servers: swaggerConfig.servers,
    tags: swaggerTags,
    components: {
      securitySchemes: swaggerSecurity,
      schemas: {
        ...swaggerSchemas
      },
      responses: swaggerResponses,
      parameters: {
        pageParam: {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          required: false,
          schema: { type: 'integer', minimum: 1, default: 1 }
        },
        limitParam: {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
        }
      }
    },
    security: securityRequirements.authenticated,
    paths: {
      // Auth endpoints
      '/api/auth/register': authPaths['/api/auth/register'],
      '/api/auth/login': authPaths['/api/auth/login'],
      
      // Products endpoints
      '/api/products': productPaths['/api/products'],
      '/api/products/{id}': {
        get: {
          tags: ['Products'],
          summary: 'Get product by ID',
          description: 'Retrieves detailed information about a specific product',
          operationId: 'getProductById',
          parameters: [
            {
              name: 'id',
              in: 'path',
              description: 'Product ID',
              required: true,
              schema: { type: 'integer', example: 1 }
            }
          ],
          responses: {
            '200': {
              description: 'Product retrieved successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SuccessResponse' }
                }
              }
            },
            '404': { $ref: '#/components/responses/NotFound' }
          }
        }
      },
      
      // Chat endpoints
      '/api/messages': chatPaths['/api/messages'],
      '/api/messages/read': {
        post: {
          tags: ['Chat'],
          summary: 'Mark messages as read',
          description: 'Marks chat messages as read',
          operationId: 'markMessagesRead',
          requestBody: {
            description: 'Message IDs to mark as read',
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    messageIds: {
                      type: 'array',
                      items: { type: 'integer' },
                      example: [1, 2, 3]
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': { $ref: '#/components/responses/Success' },
            '400': { $ref: '#/components/responses/BadRequest' }
          },
          security: securityRequirements.authenticated
        }
      },
      
      // Notifications endpoints
      '/api/notifications': notificationPaths['/api/notifications'],
      '/api/notifications/user': {
        get: {
          tags: ['Notifications'],
          summary: 'Get user notifications',
          description: 'Retrieves paginated notifications for a user',
          operationId: 'getUserNotifications',
          parameters: [
            { $ref: '#/components/parameters/pageParam' },
            { $ref: '#/components/parameters/limitParam' },
            {
              name: 'userId',
              in: 'query',
              description: 'User ID',
              required: true,
              schema: { type: 'integer', example: 1 }
            }
          ],
          responses: {
            '200': {
              description: 'Notifications retrieved successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PaginatedResponse' }
                }
              }
            }
          },
          security: securityRequirements.authenticated
        },
        post: {
          tags: ['Notifications'],
          summary: 'Create notification',
          description: 'Creates a new notification for a user',
          operationId: 'createNotification',
          requestBody: {
            description: 'Notification data',
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    userId: { type: 'integer', example: 1 },
                    type: { type: 'string', enum: ['order_update', 'promotion', 'system', 'chat'], example: 'order_update' },
                    title: { type: 'string', example: 'Order Confirmed' },
                    message: { type: 'string', example: 'Your order has been confirmed.' },
                    data: { type: 'object', example: { orderId: 123 } },
                    actionUrl: { type: 'string', nullable: true }
                  }
                }
              }
            }
          },
          responses: {
            '201': { $ref: '#/components/responses/Created' },
            '400': { $ref: '#/components/responses/BadRequest' }
          },
          security: securityRequirements.authenticated
        }
      },
      '/api/notifications/count': {
        get: {
          tags: ['Notifications'],
          summary: 'Get unread notification count',
          description: 'Returns the count of unread notifications for a user',
          operationId: 'getUnreadCount',
          parameters: [
            {
              name: 'userId',
              in: 'query',
              description: 'User ID',
              required: true,
              schema: { type: 'integer', example: 1 }
            }
          ],
          responses: {
            '200': {
              description: 'Count retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      unreadCount: { type: 'integer', example: 5 }
                    }
                  }
                }
              }
            }
          }
        }
      },
      
      // Orders endpoints
      '/api/orders': {
        get: {
          tags: ['Orders'],
          summary: 'List orders',
          description: 'Retrieves paginated list of orders',
          operationId: 'listOrders',
          parameters: [
            { $ref: '#/components/parameters/pageParam' },
            { $ref: '#/components/parameters/limitParam' }
          ],
          responses: {
            '200': {
              description: 'Orders retrieved successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PaginatedResponse' }
                }
              }
            }
          },
          security: securityRequirements.authenticated
        },
        post: {
          tags: ['Orders'],
          summary: 'Create order',
          description: 'Creates a new order',
          operationId: 'createOrder',
          requestBody: {
            description: 'Order data',
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateOrderDto' }
              }
            }
          },
          responses: {
            '201': { $ref: '#/components/responses/Created' },
            '400': { $ref: '#/components/responses/BadRequest' }
          },
          security: securityRequirements.authenticated
        }
      },
      
      // Users endpoints
      '/api/users': {
        get: {
          tags: ['Users'],
          summary: 'List users',
          description: 'Retrieves paginated list of users (Admin only)',
          operationId: 'listUsers',
          parameters: [
            { $ref: '#/components/parameters/pageParam' },
            { $ref: '#/components/parameters/limitParam' }
          ],
          responses: {
            '200': {
              description: 'Users retrieved successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PaginatedResponse' }
                }
              }
            }
          },
          security: securityRequirements.authenticated
        }
      },
      
      // Devices endpoints
      '/api/devices/register': {
        post: {
          tags: ['Notifications'],
          summary: 'Register device for push notifications',
          description: 'Registers a device token for push notification delivery',
          operationId: 'registerDevice',
          requestBody: {
            description: 'Device registration data',
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DeviceRegistration' }
              }
            }
          },
          responses: {
            '201': { $ref: '#/components/responses/Created' },
            '400': { $ref: '#/components/responses/BadRequest' }
          },
          security: securityRequirements.authenticated
        }
      },
      
      // System endpoints
      '/api/init': {
        get: {
          tags: ['System'],
          summary: 'Health check',
          description: 'Returns the health status of the API',
          operationId: 'healthCheck',
          responses: {
            '200': {
              description: 'API is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'healthy' },
                      timestamp: { type: 'string', format: 'date-time' },
                      uptime: { type: 'number' },
                      version: { type: 'string', example: '1.0.0' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    externalDocs: swaggerConfig.externalDocs
  };
}

export async function GET(request: NextRequest) {
  try {
    const spec = buildOpenAPISpec();
    
    return NextResponse.json(spec, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Error generating OpenAPI spec:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate API documentation',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
