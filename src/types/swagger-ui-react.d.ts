declare module 'swagger-ui-react' {
  import React from 'react';

  interface SwaggerUIProps {
    url?: string;
    spec?: object;
    docExpansion?: 'none' | 'list' | 'full';
    deepLinking?: boolean;
    displayRequestDuration?: boolean;
    filter?: boolean | string;
    persistAuthorization?: boolean;
    showMutatedRequest?: boolean;
    supportedSubmitMethods?: string[];
    presets?: any[];
    onComplete?: () => void;
    requestSnippetsEnabled?: boolean;
    showCommonExtensions?: boolean;
  }

  const SwaggerUI: React.FC<SwaggerUIProps>;
  export default SwaggerUI;
}
