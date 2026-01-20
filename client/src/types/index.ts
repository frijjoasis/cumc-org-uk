import { ComponentType } from 'react';

interface PageRoute {
  path: string;
  name: string;
  layout: string;
  Component: ComponentType<any>;
  icon?: string;
  hide?: boolean;
  auth?: boolean;
  category?: false; // Explicitly not a category
}

interface CategoryRoute {
  name: string;
  category: true;
  path?: never;
  layout?: never;
  Component?: never;
  icon?: never;
}

export type RouteConfig = PageRoute | CategoryRoute;

// Global window extensions
declare global {
  interface Window {
    paypal?: any; // Marked optional as it loads asynchronously
  }
}
