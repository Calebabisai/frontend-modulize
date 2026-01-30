import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../shared/components/navbar/navbar/navbar';
import { Footer } from '../../shared/components/footer/footer/footer';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, Navbar, Footer],
  templateUrl: './products.html',
  styleUrls: ['./products.css'],
})
export class ProductsComponent implements OnInit {
  authService = inject(AuthService);
  private http = inject(HttpClient);

  // --- SIGNALS DE DATOS ---
  products = signal<any[]>([]);
  categories = signal<any[]>([]);
  isLoading = signal(true);

  // --- SIGNALS DE ESTADO ---
  selectedCategoryId = signal<number | null>(null); // null = "Ver Todos"
  showModal = signal(false);
  isEditing = signal(false);
  selectedProduct = signal<any>(null);

  filteredProducts = computed(() => {
    const catId = this.selectedCategoryId();
    const allProducts = this.products();

    if (!catId) return allProducts;
    return allProducts.filter((p) => p.categoryId === catId || p.category?.id === catId);
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);

    // 1. Cargar Productos
    this.http.get<any[]>(`${environment.baseUrl}/products`).subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      },
    });

    // 2. Cargar Categorías (Para los filtros)
    this.http.get<any[]>(`${environment.baseUrl}/categories`).subscribe({
      next: (data) => this.categories.set(data),
    });
  }
  // --- Función para seleccionar categoría y hacer scroll ---
  selectCategoryAndScroll(catId: number) {
    // 1. Actualizar el filtro
    this.selectedCategoryId.set(catId);

    // 2. Scroll suave hacia la tabla de productos
    const gridSection = document.querySelector('.inventory-grid-section');
    if (gridSection) {
      gridSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // --- Acciones de UI ---
  filterBy(catId: number | null) {
    this.selectedCategoryId.set(catId);
  }

  // --- Acciones CRUD ---
  openAddModal() {
    this.isEditing.set(false);
    this.selectedProduct.set(null);
    this.showModal.set(true);
  }

  openEditModal(product: any) {
    this.isEditing.set(true);
    this.selectedProduct.set(product);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  deleteProduct(id: number) {
    if (confirm('¿Seguro que quieres eliminar este producto? Esta acción es irreversible')) {
      this.http.delete(`${environment.baseUrl}/products/${id}`).subscribe({
        next: () => {
          this.products.update((prev) => prev.filter((p) => p.id !== id));
        },
      });
    }
  }

  saveProduct() {
    alert('Próximo paso: Formulario Reactivo');
    this.closeModal();
  }
}
