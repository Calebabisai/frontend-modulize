import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../shared/components/navbar/navbar/navbar';
import { Footer } from '../../shared/components/footer/footer/footer';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
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
    price: [0, [Validators.required, Validators.min(0)]],
    categoryId: [null as number | null, [Validators.required]],
    imageUrl: [''],
  });

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
    this.productForm.reset({ price: 0 });
    this.showModal.set(true);
  }

  openEditModal(product: any) {
    this.isEditing.set(true);
    this.selectedProduct.set(product);

    // PRE-LLENAR EL FORMULARIO AL ABRIR "EDITAR"
    this.productForm.patchValue({
      name: product.name,
      price: product.price,
      categoryId: product.categoryId || product.category?.id,
      imageUrl: product.imageUrl || '', // Cargar la URL si existe
    });

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
    if (this.productForm.invalid) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    const formValue = this.productForm.getRawValue();
    this.isLoading.set(true);

    if (this.isEditing() && this.selectedProduct()) {
      // --- LÓGICA DE EDICIÓN (PATCH) ---
      const id = this.selectedProduct().id;
      this.http.patch<any>(`${environment.baseUrl}/products/${id}`, formValue).subscribe({
        next: (updatedProduct) => {
          // Actualizar la lista localmente
          this.products.update((prev) => prev.map((p) => (p.id === id ? updatedProduct : p)));
          this.closeModal();
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false);
          alert('Error al actualizar el producto');
        },
      });
    } else {
      // --- LÓGICA DE CREACIÓN (POST) ---
      this.http.post<any>(`${environment.baseUrl}/products`, formValue).subscribe({
        next: (newProduct) => {
          // Agregar el nuevo producto a la lista
          this.products.update((prev) => [...prev, newProduct]);
          this.closeModal();
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.isLoading.set(false);
          alert('Error al crear el producto');
        },
      });
    }
  }
}
