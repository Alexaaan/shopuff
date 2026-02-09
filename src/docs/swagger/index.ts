/**
 * Swagger/OpenAPI Documentation Index
 * 
 * This module exports all Swagger configuration files
 * and provides utilities for API documentation.
 * 
 * @see https://swagger.io/specification/
 */

// Configuration
export { swaggerConfig } from './swagger.config';
export type { OpenAPISpec } from './swagger.config';

// Tags
export { swaggerTags } from './swagger.tags';

// Security
export { swaggerSecurity, securityRequirements } from './swagger.security';

// Schemas
export { swaggerSchemas } from './swagger.schemas';

// Responses
export { swaggerResponses, responseHelpers } from './swagger.responses';

// Paths
export { pathTemplate, authPaths, productPaths, chatPaths, notificationPaths } from './swagger.paths';

/**
 * Import this file to access all Swagger exports
 * 
 * @example
 * import { swaggerConfig, swaggerTags, swaggerSchemas } from '@/docs/swagger';
 */
