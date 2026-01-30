import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login').then((m) => m.LoginComponent),
      },
    ],
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/products').then((m) => m.ProductsComponent),
  },
  {
    path: 'categories',
    loadComponent: () => import('./pages/categories/categories').then((m) => m.CategoriesComponent),
  },
];
