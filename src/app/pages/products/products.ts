import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../shared/components/navbar/navbar/navbar';
import { Footer } from '../../shared/components/footer/footer/footer';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, Navbar, Footer, ReactiveFormsModule],
  templateUrl: './products.html',
  styleUrls: ['./products.css'],
})
export class ProductsComponent implements OnInit {
  authService = inject(AuthService);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  // --- SIGNALS DE DATOS ---
  products = signal<any[]>([]);
  categories = signal<any[]>([]);
  isLoading = signal(true);

  // --- SIGNALS DE ESTADO ---
  selectedCategoryId = signal<number | null>(null); // null = "Ver Todos"
  showModal = signal(false);
  isEditing = signal(false);
  selectedProduct = signal<any>(null);

  // Usamos un campo de texto para la URL de la imagen por ahora.
  productForm = this.fb.group({
    name: ['', [Validators.required]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    categoryId: [null as number | null, [Validators.required]],
    imageUrl: [''],
  });

  filteredProducts = computed(() => {
    const catId = this.selectedCategoryId();
    const allProducts = this.products();

    if (!catId) return allProducts;
    return allProducts.filter((p) => p.categoryId === catId || p.category?.id === catId);
  });

  private getHeaders() {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

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
    // Actualizar el filtro
    this.selectedCategoryId.set(catId);

    // croll suave hacia la tabla de productos
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
    // RESETEAR TAMBIÉN LA DESCRIPCIÓN
    this.productForm.reset({ price: 0, stock: 0, description: '' });
    this.showModal.set(true);
  }

  openEditModal(product: any) {
    this.isEditing.set(true);
    this.selectedProduct.set(product);

    this.productForm.patchValue({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId || product.category?.id,
      imageUrl: product.imageUrl || '',
    });

    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  deleteProduct(id: number) {
    if (confirm('¿Seguro que quieres eliminar este producto?')) {
      this.http
        .delete(`${environment.baseUrl}/products/${id}`, {
          headers: this.getHeaders(),
        })
        .subscribe({
          next: () => {
            this.products.update((prev) => prev.filter((p) => p.id !== id));
          },
          error: (err) => alert('Error al eliminar: ' + err.error?.message),
        });
    }
  }

  saveProduct() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      alert('Por favor completa los campos requeridos');
      return;
    }

    // Preparamos el Token de Autorización
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const formValue = this.productForm.getRawValue();
    this.isLoading.set(true);

    // Payload con conversión de tipos para Prisma
    const payload = {
      ...formValue,
      price: Number(formValue.price),
      stock: Number(formValue.stock),
      categoryId: Number(formValue.categoryId),
      description: formValue.description?.trim() || null,
      imageUrl: formValue.imageUrl?.trim() || null,
    };

    if (this.isEditing() && this.selectedProduct()) {
      // --- LÓGICA DE EDICIÓN (PATCH) ---
      const id = this.selectedProduct().id;
      this.http
        .patch<any>(`${environment.baseUrl}/products/${id}`, payload, { headers })
        .subscribe({
          next: (updatedProduct) => {
            this.products.update((prev) => prev.map((p) => (p.id === id ? updatedProduct : p)));
            this.closeModal();
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error(err);
            this.isLoading.set(false);
            alert('Error al actualizar: ' + (err.error?.message || 'intenta de nuevo'));
          },
        });
    } else {
      // --- LÓGICA DE CREACIÓN (POST) ---
      this.http.post<any>(`${environment.baseUrl}/products`, payload, { headers }).subscribe({
        next: (newProduct) => {
          this.products.update((prev) => [...prev, newProduct]);
          this.closeModal();
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false);
          alert('Error al crear: ' + (err.error?.message || 'revisa los datos'));
        },
      });
    }
  }
}
