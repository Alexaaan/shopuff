/**
 * Swagger Schemas (DTOs)
 * 
 * Centralized data transfer objects for API documentation.
 * All schemas follow the standardized response format.
 */

/**
 * Generic API Response Wrapper
 */
export const swaggerSchemas = {
  /**
   * Success response with data
   */
  SuccessResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true,
        description: 'Indicates if the request was successful'
      },
      message: {
        type: 'string',
        example: 'Operation completed successfully',
        description: 'Human-readable message describing the result'
      },
      data: {
        type: 'object',
        description: 'Response data payload'
      }
    },
    required: ['success', 'message', 'data']
  },

  /**
   * Paginated response
   */
  PaginatedResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Data retrieved successfully' },
      data: {
        type: 'array',
        items: { type: 'object' },
        description: 'Array of items'
      },
      pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 20 },
          total: { type: 'integer', example: 100 },
          totalPages: { type: 'integer', example: 5 }
        }
      }
    }
  },

  // ========== AUTH SCHEMAS ==========

  User: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      email: { type: 'string', format: 'email', example: 'john@example.com' },
      nom: { type: 'string', example: 'Doe' },
      prenom: { type: 'string', example: 'John' },
      telephone: { type: 'string', example: '+33123456789' },
      role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
      created_at: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' }
    }
  },

  LoginDto: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email', example: 'john@example.com' },
      password: { type: 'string', format: 'password', example: 'SecurePassword123!' }
    },
    required: ['email', 'password']
  },

  RegisterDto: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email', example: 'john@example.com' },
      password: { type: 'string', format: 'password', example: 'SecurePassword123!' },
      nom: { type: 'string', example: 'Doe' },
      prenom: { type: 'string', example: 'John' },
      telephone: { type: 'string', example: '+33123456789' }
    },
    required: ['email', 'password', 'nom', 'prenom']
  },

  AuthResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Login successful' },
      data: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          expiresIn: { type: 'integer', example: 3600 }
        }
      }
    }
  },

  // ========== PRODUCT SCHEMAS ==========

  Product: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      nom: { type: 'string', example: 'Premium Coffee Beans' },
      description: { type: 'string', example: 'High-quality arabica beans' },
      prix: { type: 'number', format: 'decimal', example: 29.99 },
      stock: { type: 'integer', example: 100 },
      category: { type: 'string', example: 'coffee' },
      image_url: { type: 'string', example: 'https://cdn.shopuff.com/products/1.jpg' },
      is_available: { type: 'boolean', example: true },
      average_rating: { type: 'number', format: 'float', example: 4.5 },
      created_at: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' }
    }
  },

  ProductRating: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      product_id: { type: 'integer', example: 1 },
      user_id: { type: 'integer', example: 1 },
      rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
      comment: { type: 'string', example: 'Excellent product!' },
      created_at: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' }
    }
  },

  // ========== ORDER SCHEMAS ==========

  Order: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      utilisateur_id: { type: 'integer', example: 1 },
      statut: { 
        type: 'string', 
        enum: ['en_attente', 'confirmee', 'en_preparation', 'expediee', 'livree', 'annulee'],
        example: 'en_attente'
      },
      total: { type: 'number', format: 'decimal', example: 59.99 },
      payment_method: { type: 'string', example: 'card' },
      created_at: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' }
    }
  },

  OrderProduct: {
    type: 'object',
    properties: {
      quantite: { type: 'integer', example: 2 },
      prix_unitaire: { type: 'number', format: 'decimal', example: 29.99 },
      products: {
        type: 'object',
        properties: {
          nom: { type: 'string', example: 'Premium Coffee' },
          image_url: { type: 'string', example: 'https://cdn.shopuff.com/products/1.jpg' }
        }
      }
    }
  },

  CreateOrderDto: {
    type: 'object',
    properties: {
      products: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            productId: { type: 'integer', example: 1 },
            quantite: { type: 'integer', example: 2 }
          }
        }
      },
      paymentMethod: { type: 'string', example: 'card' }
    },
    required: ['products', 'paymentMethod']
  },

  // ========== CHAT SCHEMAS ==========

  ChatMessage: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      order_id: { type: 'integer', example: 1 },
      sender_id: { type: 'integer', example: 1 },
      receiver_id: { type: 'integer', example: 2 },
      content: { type: 'string', example: 'Hello, I have a question about my order.' },
      client_id: { type: 'string', example: 'uuid-1234-5678' },
      is_read: { type: 'boolean', example: false },
      created_at: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' }
    }
  },

  ChatPresence: {
    type: 'object',
    properties: {
      user_id: { type: 'integer', example: 1 },
      order_id: { type: 'integer', example: 1 },
      status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
      last_seen: { type: 'string', format: 'date-time', example: '2024-01-15T10:35:00Z' }
    }
  },

  SendMessageDto: {
    type: 'object',
    properties: {
      orderId: { type: 'integer', example: 1 },
      content: { type: 'string', example: 'Hello!' },
      clientId: { type: 'string', example: 'uuid-1234-5678' }
    },
    required: ['orderId', 'content']
  },

  // ========== NOTIFICATION SCHEMAS ==========

  UserNotification: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      user_id: { type: 'integer', example: 1 },
      type: { 
        type: 'string', 
        enum: ['order_update', 'promotion', 'system', 'chat'],
        example: 'order_update'
      },
      title: { type: 'string', example: 'Order Confirmed' },
      message: { type: 'string', example: 'Your order #123 has been confirmed.' },
      data: { type: 'object', example: { orderId: 123 } },
      is_read: { type: 'boolean', example: false },
      read_at: { type: 'string', format: 'date-time', nullable: true },
      created_at: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' }
    }
  },

  NotificationCampaign: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      title: { type: 'string', example: 'Summer Sale' },
      message: { type: 'string', example: 'Get 20% off on all products!' },
      type: { type: 'string', enum: ['info', 'promotion', 'alert'], example: 'promotion' },
      target_type: { type: 'string', enum: ['all', 'role', 'user'], example: 'all' },
      target_value: { type: 'string', nullable: true },
      devices_targeted: { type: 'integer', example: 1500 },
      devices_success: { type: 'integer', example: 1450 },
      devices_failed: { type: 'integer', example: 50 },
      created_at: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' }
    }
  },

  SendNotificationDto: {
    type: 'object',
    properties: {
      title: { type: 'string', example: 'Order Update' },
      message: { type: 'string', example: 'Your order has been shipped.' },
      type: { type: 'string', enum: ['info', 'promotion', 'alert'], example: 'info' },
      target: { type: 'string', enum: ['all', 'role', 'user'], example: 'all' },
      targetValue: { type: 'string', nullable: true, example: null }
    },
    required: ['title', 'message', 'type', 'target']
  },

  // ========== DEVICE SCHEMAS ==========

  DeviceRegistration: {
    type: 'object',
    properties: {
      user_id: { type: 'integer', example: 1 },
      device_token: { type: 'string', example: 'fcm-token-abc123' },
      platform: { type: 'string', enum: ['web', 'ios', 'android'], example: 'web' },
      is_active: { type: 'boolean', example: true }
    },
    required: ['user_id', 'device_token', 'platform']
  },

  // ========== ERROR SCHEMAS ==========

  ValidationError: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string', example: 'Validation failed' },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            field: { type: 'string', example: 'email' },
            message: { type: 'string', example: 'Invalid email format' }
          }
        }
      }
    }
  }
};
