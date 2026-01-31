import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../shared/components/navbar/navbar/navbar';
import { Footer } from '../../shared/components/footer/footer/footer';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriesComponent } from '../categories/categories';

// Importa tus interfaces
import { Product } from '../../interfaces/product.interface';
import { Category } from '../../interfaces/category.interface';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, Navbar, Footer, ReactiveFormsModule, CategoriesComponent],
  templateUrl: './products.html',
  styleUrls: ['./products.css'],
})
export class ProductsComponent implements OnInit {
  authService = inject(AuthService);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  // --- SIGNALS DE DATOS (Tipados correctamente) ---
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal(true);
  currentPage = signal(1);
  pageSize = signal(6);

  // --- SIGNALS DE ESTADO ---
  // CORRECCIÓN: Cambiado de number | null a string | null
  selectedCategoryId = signal<string | null>(null);
  showModal = signal(false);
  isEditing = signal(false);
  selectedProduct = signal<Product | null>(null);
  showCategoryDropdown = signal(false);

  // Formulario
  productForm = this.fb.group({
    name: ['', [Validators.required]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    // CORRECCIÓN: El categoryId ahora espera un string
    categoryId: [null as string | null, [Validators.required]],
    imageUrl: [''],
  });

  // Calcula el total de páginas
  totalPages = computed(() => {
    const total = this.filteredProducts().length;
    return Math.ceil(total / this.pageSize());
  });

  // Genera un arreglo con los números de página [1, 2, 3...]
  pageNumbers = computed(() => {
    const pages = this.totalPages();
    return Array.from({ length: pages }, (_, i) => i + 1);
  });

  // Productos que se ven actualmente
  paginatedProducts = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return this.filteredProducts().slice(startIndex, endIndex);
  });

  filteredProducts = computed(() => {
    const catId = this.selectedCategoryId();
    const allProducts = this.products();

    if (!catId) return allProducts;
    // Ahora la comparación es segura: string === string
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

  // Función para obtener el nombre de la categoría seleccionada
  get currentCategoryName(): string {
    const selectedId = this.selectedCategoryId();
    if (!selectedId) return 'Todas las Categorías';

    const found = this.categories().find((c) => c.id === selectedId);
    return found ? found.name : 'Todas las Categorías';
  }

  // Función para alternar el menú
  toggleDropdown() {
    this.showCategoryDropdown.update((v) => !v);
  }

  // Actualizamos filterBy para que también cierre el menú al seleccionar
  overrideFilterBy(id: string | null) {
    this.filterBy(id); // Tu función original
    this.showCategoryDropdown.set(false); // Cerramos el menú
  }

  loadData() {
    this.isLoading.set(true);

    // 1. Cargar Productos
    this.http.get<Product[]>(`${environment.baseUrl}/products`).subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      },
    });

    // 2. Cargar Categorías
    this.http.get<Category[]>(`${environment.baseUrl}/categories`).subscribe({
      next: (data) => this.categories.set(data),
    });
  }

  // --- CORRECCIÓN: Recibe string en lugar de number ---
  selectCategoryAndScroll(catId: string) {
    this.selectedCategoryId.set(catId);

    const gridSection = document.querySelector('.inventory-grid-section');
    if (gridSection) {
      gridSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // --- CORRECCIÓN: Recibe string | null ---
  filterBy(catId: string | null) {
    this.selectedCategoryId.set(catId);
  }

  // --- Acciones CRUD ---
  openAddModal() {
    this.isEditing.set(false);
    this.selectedProduct.set(null);
    this.productForm.reset({ price: 0, stock: 0, description: '' });
    this.showModal.set(true);
  }

  openEditModal(product: Product) {
    this.isEditing.set(true);
    this.selectedProduct.set(product);

    this.productForm.patchValue({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      // Manejamos la posibilidad de que venga directo o anidado
      categoryId: product.categoryId || product.category?.id,
      imageUrl: product.imageUrl || '',
    });

    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  // CORRECCIÓN: Recibe string
  deleteProduct(id: string) {
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

    const headers = this.getHeaders();
    const formValue = this.productForm.getRawValue();
    this.isLoading.set(true);

    const payload = {
      ...formValue,
      price: Number(formValue.price),
      stock: Number(formValue.stock),
      // CORRECCIÓN CRÍTICA: NO convertir categoryId a Number() porque es un UUID string
      categoryId: formValue.categoryId,
      description: formValue.description?.trim() || null,
      imageUrl: formValue.imageUrl?.trim() || null,
    };

    if (this.isEditing() && this.selectedProduct()) {
      const id = this.selectedProduct()!.id;
      this.http
        .patch<Product>(`${environment.baseUrl}/products/${id}`, payload, { headers })
        .subscribe({
          next: (updatedProduct) => {
            // Buscamos la categoría completa para actualizar la vista localmente
            const fullCategory = this.categories().find((c) => c.id === updatedProduct.categoryId);
            const productWithCategory = { ...updatedProduct, category: fullCategory };

            this.products.update((prev) =>
              prev.map((p) => (p.id === id ? productWithCategory : p)),
            );
            this.closeModal();
            this.isLoading.set(false);
          },
          error: (err) => {
            this.isLoading.set(false);
            alert('Error al actualizar: ' + err.error?.message);
          },
        });
    } else {
      // --- CREACIÓN (POST) ---
      this.http.post<Product>(`${environment.baseUrl}/products`, payload, { headers }).subscribe({
        next: (newProduct) => {
          const fullCategory = this.categories().find((c) => c.id === newProduct.categoryId);

          const enrichedProduct = {
            ...newProduct,
            category: fullCategory,
          };

          this.products.update((prev) => [...prev, enrichedProduct]);
          this.closeModal();
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          alert('Error al crear: ' + err.error?.message);
        },
      });
    }
  }
  goToPage(page: number) {
    this.currentPage.set(page);
    // Scroll suave hacia arriba para que el usuario vea el inicio de la lista
    window.scrollTo({ top: 400, behavior: 'smooth' });
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.goToPage(this.currentPage() - 1);
    }
  }
}
