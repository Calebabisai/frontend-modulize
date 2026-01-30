import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { computed } from '@angular/core';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class ProductsComponent {
  authService = inject(AuthService);
}
