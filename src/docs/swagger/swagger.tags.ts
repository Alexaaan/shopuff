/**
 * Swagger Tags Configuration
 * 
 * Organized tags for API documentation with descriptions
 * following enterprise best practices.
 */

export const swaggerTags = [
  {
    name: 'Auth',
    description: '## Authentication Endpoints\n\nAll authentication-related operations including registration, login, logout, and session management.\n\n### Authentication Flow\n1. Register a new account or login with existing credentials\n2. Receive JWT access token and refresh token\n3. Use access token in Authorization header for protected routes\n4. Refresh token when access token expires',
    externalDocs: {
      description: 'Auth Guidelines',
      url: 'https://shopuff.com/docs/auth'
    }
  },
  {
    name: 'Users',
    description: '## User Management\n\nUser profile operations, preferences, and account settings.\n\n### User Fields\n- Personal information (name, email, phone)\n- Preferences and notifications settings\n- Order history and favorites',
    externalDocs: {
      description: 'User API Spec',
      url: 'https://shopuff.com/docs/users'
    }
  },
  {
    name: 'Products',
    description: '## Product Catalog\n\nProduct browsing, search, and details with ratings and reviews.\n\n### Features\n- Full-text product search\n- Category filtering\n- Price range filtering\n- Ratings and reviews\n- Related products',
    externalDocs: {
      description: 'Product Guidelines',
      url: 'https://shopuff.com/docs/products'
    }
  },
  {
    name: 'Orders',
    description: '## Order Management\n\nOrder creation, tracking, and history.\n\n### Order Lifecycle\n1. Order created with pending status\n2. Payment processed\n3. Order confirmed and shipped\n4. Order delivered and completed\n\n### Order Status Values\n- `en_attente` - Pending payment/confirmation\n- `confirmee` - Confirmed\n- `en_preparation` - Being prepared\n- `expediee` - Shipped\n- `livree` - Delivered\n- `annulee` - Cancelled',
    externalDocs: {
      description: 'Order Flow Diagram',
      url: 'https://shopuff.com/docs/orders'
    }
  },
  {
    name: 'Chat',
    description: '## Real-time Chat System\n\nReal-time messaging between users and admins.\n\n### Features\n- Real-time message delivery\n- Online presence indicators\n- Message read receipts\n- Order-related conversations\n\n### WebSocket Events\n- `new_message` - Incoming message\n- `presence_update` - User online/offline status\n- `typing_start` / `typing_stop` - Typing indicators',
    externalDocs: {
      description: 'Chat Integration Guide',
      url: 'https://shopuff.com/docs/chat'
    }
  },
  {
    name: 'Notifications',
    description: '## Push Notifications\n\nIn-app and push notification management.\n\n### Notification Types\n- `order_update` - Order status changes\n- `promotion` - Promotional messages\n- `system` - System alerts\n- `chat` - New chat messages\n\n### Delivery Status\n- `pending` - Queued for delivery\n- `sent` - Successfully sent to device\n- `delivered` - Confirmed delivered\n- `opened` - User opened notification\n- `failed` - Delivery failed',
    externalDocs: {
      description: 'Notification Best Practices',
      url: 'https://shopuff.com/docs/notifications'
    }
  },
  {
    name: 'Admin',
    description: '## Admin Panel\n\nAdministrative operations for platform management.\n\n### Admin Features\n- User management and moderation\n- Product catalog management\n- Order oversight and support\n- Notification campaigns\n- Analytics and statistics\n\n### Authorization\nAdmin endpoints require `role: admin` in the user token.',
    externalDocs: {
      description: 'Admin Dashboard Guide',
      url: 'https://shopuff.com/docs/admin'
    }
  },
  {
    name: 'System',
    description: '## System & Monitoring\n\nHealth checks, system status, and debug endpoints.\n\n### Endpoints\n- Health check (`/api/init`)\n- Database status (`/api/debug/tables`)\n- System configuration\n\n### Status Codes\n- `healthy` - All systems operational\n- `degraded` - Some issues detected\n- `unhealthy` - Critical issues requiring attention',
    externalDocs: {
      description: 'SLA Documentation',
      url: 'https://shopuff.com/docs/sla'
    }
  }
];
