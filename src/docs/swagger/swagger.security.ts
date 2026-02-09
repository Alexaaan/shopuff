/**
 * Swagger Security Schemes Configuration
 * 
 * Defines all security schemes used in the API
 * following OpenAPI 3.0 specifications.
 */

export const swaggerSecurity = {
  /**
   * JWT Bearer Token Authentication
   * 
   * Used for most protected endpoints.
   * Include the token in the Authorization header:
   * `Authorization: Bearer <token>`
   */
  bearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'JWT Authorization header using the Bearer scheme. Enter the JWT token in the format: Bearer <token>'
  },

  /**
   * Refresh Token
   * 
   * Used to obtain a new access token when it expires.
   * Send refresh token in request body or cookie.
   */
  refreshToken: {
    type: 'apiKey',
    in: 'cookie',
    name: 'refreshToken',
    description: 'Refresh token stored in HTTP-only cookie for session renewal'
  },

  /**
   * API Key Authentication
   * 
   * Alternative authentication for server-to-server calls.
   * Include API key in the X-API-Key header.
   */
  apiKey: {
    type: 'apiKey',
    in: 'header',
    name: 'X-API-Key',
    description: 'API key for server-to-server authentication. Request an API key from the admin panel.'
  },

  /**
   * Firebase Cloud Messaging Token
   * 
   * Used for push notification delivery.
   * Device registration token for FCM.
   */
  fcmToken: {
    type: 'apiKey',
    in: 'header',
    name: 'X-FCM-Token',
    description: 'Firebase Cloud Messaging device registration token for push notifications'
  }
};

/**
 * Security Requirements
 * 
 * Define which security schemes are required for different endpoints.
 */
export const securityRequirements = {
  /**
   * Public endpoints - no authentication required
   */
  public: [],

  /**
   * Authenticated user endpoints
   */
  authenticated: [
    {
      bearerAuth: []
    }
  ],

  /**
   * Refresh token flow
   */
  refresh: [
    {
      refreshToken: []
    }
  ],

  /**
   * Admin-only endpoints
   */
  admin: [
    {
      bearerAuth: []
    }
  ],

  /**
   * Server-to-server API calls
   */
  apiKey: [
    {
      apiKey: []
    }
  ]
};
