import {
  RenderMode,
  ServerRoute
} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Client
  },
  {
    path: 'login',
    renderMode: RenderMode.Client
  },
  {
    path: 'register',
    renderMode: RenderMode.Client
  },
  {
    path: 'dashboard',
    renderMode: RenderMode.Client
  },
  {
    path: 'guests',
    renderMode: RenderMode.Client
  },
  {
    path: 'family',
    renderMode: RenderMode.Client
  },
  {
    path: 'expenses',
    renderMode: RenderMode.Client
  },
  {
    path: 'addguest',
    renderMode: RenderMode.Client
  },
  {
    path: 'sendemail',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
