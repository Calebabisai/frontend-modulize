import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard'; // 👈 Importamos el guard

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
    //  Ruta protegida
    canActivate: [authGuard],
    loadComponent: () => import('./pages/products/products').then((m) => m.ProductsComponent),
  },
  {
    path: 'categories',
    //  Ruta protegida
    canActivate: [authGuard],
    loadComponent: () => import('./pages/categories/categories').then((m) => m.CategoriesComponent),
  },
  { path: '**', redirectTo: 'auth/login' },
];
