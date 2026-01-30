import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificamos si hay usuario o token activo
  if (authService.isAuthenticated()) {
    return true;
  }

  // Si no está logueado, lo mandamos al login con un "ticket" de regreso
  console.warn('Acceso denegado, Necesitas iniciar sesión.');
  return router.createUrlTree(['/auth/login']);
};
