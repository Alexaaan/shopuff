declare module 'swagger-ui-dist' {
  interface SwaggerUIBundleOptions {
    url?: string;
    spec?: object;
    dom_id?: string;
    deepLinking?: boolean;
    presets?: any[];
    layout?: string;
    showRequestDuration?: boolean;
    filter?: boolean | string;
    persistAuthorization?: boolean;
    docExpansion?: 'none' | 'list' | 'full';
    defaultModelsExpandDepth?: number;
    defaultModelExpandDepth?: number;
    defaultModelRendering?: 'example' | 'model';
    displayRequestDuration?: boolean;
    showExtensions?: boolean;
    showCommonExtensions?: boolean;
  }

  function SwaggerUIBundle(options: SwaggerUIBundleOptions): void;

  export default SwaggerUIBundle;
}
