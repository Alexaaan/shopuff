/**
 * Swagger Standardized Responses
 * 
 * Common response schemas for API documentation.
 * Following enterprise best practices for API responses.
 */

export const swaggerResponses = {
  /**
   * 400 Bad Request
   * Request validation failed or invalid parameters
   */
  BadRequest: {
    description: 'Bad Request - Invalid request parameters or validation failed',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Invalid request parameters' },
            error: { type: 'string', example: 'ValidationError: email must be a valid email' },
            code: { type: 'string', example: 'VALIDATION_ERROR' }
          },
          required: ['success', 'message']
        }
      }
    }
  },

  /**
   * 401 Unauthorized
   * Authentication required or token expired
   */
  Unauthorized: {
    description: 'Unauthorized - Authentication required or token expired',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Authentication required' },
            error: { type: 'string', example: 'Invalid or expired token' },
            code: { type: 'string', example: 'AUTH_REQUIRED' }
          }
        }
      }
    }
  },

  /**
   * 403 Forbidden
   * Access denied - insufficient permissions
   */
  Forbidden: {
    description: 'Forbidden - Insufficient permissions to access this resource',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Access denied' },
            error: { type: 'string', example: 'Admin privileges required' },
            code: { type: 'string', example: 'FORBIDDEN' }
          }
        }
      }
    }
  },

  /**
   * 404 Not Found
   * Resource does not exist
   */
  NotFound: {
    description: 'Not Found - Resource does not exist',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Resource not found' },
            error: { type: 'string', example: 'Product with id 999 not found' },
            code: { type: 'string', example: 'NOT_FOUND' }
          }
        }
      }
    }
  },

  /**
   * 409 Conflict
   * Resource conflict (e.g., duplicate entry)
   */
  Conflict: {
    description: 'Conflict - Resource already exists or conflict with current state',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Resource conflict' },
            error: { type: 'string', example: 'Email already registered' },
            code: { type: 'string', example: 'CONFLICT' }
          }
        }
      }
    }
  },

  /**
   * 422 Unprocessable Entity
   * Validation error - request format is correct but semantic validation failed
   */
  UnprocessableEntity: {
    description: 'Unprocessable Entity - Validation error',
    content: {
      'application/json': {
        schema: {
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
                  message: { type: 'string', example: 'must be a valid email' }
                }
              }
            },
            code: { type: 'string', example: 'VALIDATION_ERROR' }
          }
        }
      }
    }
  },

  /**
   * 429 Too Many Requests
   * Rate limit exceeded
   */
  TooManyRequests: {
    description: 'Too Many Requests - Rate limit exceeded',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Too many requests' },
            error: { type: 'string', example: 'Rate limit exceeded. Please try again in 60 seconds.' },
            code: { type: 'string', example: 'RATE_LIMIT' },
            retryAfter: { type: 'integer', example: 60 }
          }
        }
      }
    }
  },

  /**
   * 500 Internal Server Error
   * Unexpected server error
   */
  InternalServerError: {
    description: 'Internal Server Error - An unexpected error occurred',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'An unexpected error occurred' },
            error: { type: 'string', example: 'Internal server error' },
            code: { type: 'string', example: 'INTERNAL_ERROR' },
            requestId: { type: 'string', example: 'req-abc123-xyz' }
          }
        }
      }
    }
  },

  /**
   * 503 Service Unavailable
   * Service temporarily unavailable (maintenance, overload)
   */
  ServiceUnavailable: {
    description: 'Service Unavailable - Temporary service disruption',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Service temporarily unavailable' },
            error: { type: 'string', example: 'Maintenance in progress' },
            code: { type: 'string', example: 'SERVICE_UNAVAILABLE' },
            retryAfter: { type: 'integer', example: 300 }
          }
        }
      }
    }
  },

  /**
   * Success Response - Generic success without data
   */
  Success: {
    description: 'Operation completed successfully',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation completed successfully' },
            data: { type: 'object', nullable: true, example: null }
          }
        }
      }
    }
  },

  /**
   * Created Response - Resource successfully created
   */
  Created: {
    description: 'Resource successfully created',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Resource created successfully' },
            data: { type: 'object', description: 'Created resource data' }
          }
        }
      }
    }
  },

  /**
   * No Content - Successful request with no response body
   */
  NoContent: {
    description: 'Request successful with no content to return'
  }
};

/**
 * Response Helper Functions
 * Generate consistent response objects
 */
export const responseHelpers = {
  success: (message: string, data?: object) => ({
    success: true,
    message,
    data: data || null
  }),

  error: (message: string, code: string, error?: string) => ({
    success: false,
    message,
    code,
    error: error || message
  }),

  paginated: (data: object[], pagination: { page: number; limit: number; total: number }) => ({
    success: true,
    message: 'Data retrieved successfully',
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit)
    }
  })
};
