# Swagger/OpenAPI Documentation

This directory contains the professional OpenAPI 3.0 documentation for the Shopuff API.

## 📁 File Structure

```
src/docs/swagger/
├── index.ts              # Main export file
├── README.md             # This file
├── swagger.config.ts     # Main configuration (info, servers, tags)
├── swagger.tags.ts       # Tag descriptions (Auth, Users, Products, etc.)
├── swagger.security.ts   # Security schemes (JWT, API Key, etc.)
├── swagger.schemas.ts    # DTO schemas (UserDto, ProductDto, etc.)
├── swagger.responses.ts # Standardized responses (400, 401, 404, etc.)
└── swagger.paths.ts      # Endpoint documentation templates
```

## 🚀 Quick Start

### View Documentation

1. **API Docs Page**: Visit `/docs` for interactive documentation
2. **Raw OpenAPI JSON**: Access `/api/docs` for the complete specification

### Example Usage

```typescript
// Import swagger configuration
import { swaggerConfig, swaggerTags, swaggerSchemas } from '@/docs/swagger';

// Access configuration
console.log(swaggerConfig.info.title); // "Shopuff API"
console.log(swaggerConfig.info.version); // "1.0.0"
```

## 📖 Documentation Sections

### 1. Global Info (`swagger.config.ts`)

- API title, description, version
- Contact information
- License terms
- Server configurations (dev, staging, prod)
- External docs links

### 2. Security (`swagger.security.ts`)

- **JWT Bearer** - Main authentication scheme
- **Refresh Token** - Session renewal
- **API Key** - Server-to-server auth
- **FCM Token** - Push notification auth

### 3. Tags (`swagger.tags.ts`)

Organized API sections:
- Auth - Authentication endpoints
- Users - User management
- Products - Product catalog
- Orders - Order management
- Chat - Real-time messaging
- Notifications - Push notifications
- Admin - Admin panel
- System - Health checks

### 4. Schemas (`swagger.schemas.ts`)

DTO definitions:
- `User`, `LoginDto`, `RegisterDto`
- `Product`, `ProductRating`
- `Order`, `CreateOrderDto`
- `ChatMessage`, `SendMessageDto`
- `UserNotification`, `NotificationCampaign`
- `DeviceRegistration`

### 5. Responses (`swagger.responses.ts`)

Standardized error responses:
- `BadRequest` (400)
- `Unauthorized` (401)
- `Forbidden` (403)
- `NotFound` (404)
- `Conflict` (409)
- `InternalServerError` (500)

### 6. Paths (`swagger.paths.ts`)

Endpoint documentation templates with examples:
- Request/response schemas
- Parameter documentation
- Response examples
- Security requirements

## 🔒 Security Requirements

```yaml
security:
  - bearerAuth: []  # Requires JWT token
```

Protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - List products
- `GET /api/products/{id}` - Get product details

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order

### Chat
- `POST /api/messages` - Send message
- `POST /api/messages/read` - Mark as read

### Notifications
- `GET /api/notifications/user` - Get user notifications
- `POST /api/notifications` - Send notification (admin)
- `GET /api/notifications/count` - Get unread count

## 🛠️ Tools Integration

### Swagger Editor
1. Visit [editor.swagger.io](https://editor.swagger.io)
2. Paste content from `/api/docs`
3. Explore interactive documentation

### Postman
1. Import OpenAPI spec from `/api/docs`
2. Generate collection automatically
3. Test endpoints with pre-built requests

### Redoc
```bash
npm install @stoplight/elements
```

## 📝 Adding New Endpoints

### 1. Add Schema (if needed)
```typescript
// swagger.schemas.ts
export const swaggerSchemas = {
  // ... existing schemas
  NewDto: {
    type: 'object',
    properties: {
      field1: { type: 'string', example: 'value' },
      field2: { type: 'integer', example: 1 }
    }
  }
};
```

### 2. Document Endpoint
```typescript
// In swagger.paths.ts or api/docs/route.ts
'/api/endpoint': {
  get: {
    tags: ['TagName'],
    summary: 'Endpoint summary',
    description: 'Detailed description',
    responses: {
      '200': { description: 'Success' },
      '400': { $ref: '#/components/responses/BadRequest' }
    }
  }
}
```

## 🏗️ Building for Production

The OpenAPI spec is automatically generated at `/api/docs`. Use it with:

- **Swagger UI**: `https://swagger.io/tools/swagger-ui/`
- **Redoc**: `https://redoc.ly/`
- **OpenAPI Generator**: `https://openapi-generator.tech/`

## 📞 Support

For API documentation questions:
- Email: **support@shopuff.com**
- Docs: **https://shopuff.com/docs**

## 📄 License

MIT License - See project root for full license.
