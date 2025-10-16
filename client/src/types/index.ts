import { ComponentType } from 'react';

export interface RouteConfig {
  path?: string;
  name: string;
  icon?: string;
  Component?: ComponentType<any>;
  layout?: string;
  category?: boolean;
  hide?: boolean;
  auth?: boolean;
}

// Extend Window interface to include PayPal
declare global {
  interface Window {
    paypal: any;
  }
}
