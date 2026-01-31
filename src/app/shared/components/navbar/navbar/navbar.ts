import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar {
  authService = inject(AuthService);
  private router = inject(Router);

  onLogoClick() {
    // Si ya estamos en products, hacemos scroll al inicio
    if (this.router.url === '/products') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      // Si estamos en otra página (como categorías), navegamos a products
      this.router.navigate(['/products']);
    }
  }

  get userInitials(): string {
    const name = this.authService.currentUser()?.name || 'U';
    return name.charAt(0).toUpperCase();
  }
}
