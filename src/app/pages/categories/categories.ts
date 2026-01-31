import { Component, inject, signal, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Category } from '../../interfaces/category.interface';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories.html',
  styleUrls: ['./categories.css'],
})
export class CategoriesComponent implements OnInit {
  authService = inject(AuthService);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  // Signals
  categories = signal<Category[]>([]);
  isLoading = signal(true);
  showModal = signal(false);
  isEditing = signal(false);

  // Aquí guardamos toda la categoría seleccionada, incluyendo su ID
  selectedCategory = signal<Category | null>(null);

  // Formulario actualizado (description en vez de imageUrl)
  categoryForm = this.fb.group({
    name: ['', [Validators.required]],
    description: [''],
  });

  private getHeaders() {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // El ID suele ser string en bases de datos modernas, cambiamos number -> string
  @Output() categorySelected = new EventEmitter<string>();

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoading.set(true);
    this.http.get<Category[]>(`${environment.baseUrl}/categories`).subscribe({
      next: (data) => {
        this.categories.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      },
    });
  }

  // Recibe string
  selectCategory(id: string) {
    this.categorySelected.emit(id);
  }

  // --- MODALES ---
  openAddModal() {
    this.isEditing.set(false);
    this.selectedCategory.set(null);
    this.categoryForm.reset();
    this.showModal.set(true);
  }

  openEditModal(category: Category, event: Event) {
    event.stopPropagation();
    this.isEditing.set(true);

    // CORREGIDO: Usamos el signal existente en lugar de 'this.selectedId'
    this.selectedCategory.set(category);

    // Rellenamos el formulario
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description,
    });

    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  // --- GUARDAR (Crear/Editar) ---
  saveCategory() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const headers = this.getHeaders();
    const formValue = this.categoryForm.getRawValue();

    // Preparamos el objeto a enviar
    const payload = {
      name: formValue.name,
      description: formValue.description?.trim() || null,
    };

    // Lógica de Editar
    if (this.isEditing() && this.selectedCategory()) {
      const id = this.selectedCategory()!.id; // Obtenemos el ID del signal

      this.http
        .patch<Category>(`${environment.baseUrl}/categories/${id}`, payload, { headers })
        .subscribe({
          next: (updatedCat) => {
            this.categories.update((prev) => prev.map((c) => (c.id === id ? updatedCat : c)));
            this.closeModal();
            this.isLoading.set(false);
          },
          error: (err) => {
            this.isLoading.set(false);
            alert('Error al editar: ' + (err.error?.message || err.message));
          },
        });
    }
    // Lógica de Crear
    else {
      this.http
        .post<Category>(`${environment.baseUrl}/categories`, payload, { headers })
        .subscribe({
          next: (newCat) => {
            this.categories.update((prev) => [...prev, newCat]);
            this.closeModal();
            this.isLoading.set(false);
          },
          error: (err) => {
            this.isLoading.set(false);
            alert('Error al crear: ' + (err.error?.message || err.message));
          },
        });
    }
  }

  // Recibe string para coincidir con el tipo de dato real
  deleteCategory(id: string, event: Event) {
    event.stopPropagation();
    if (confirm('¿Seguro? Esto podría afectar a los productos que tengan esta categoría.')) {
      this.http
        .delete(`${environment.baseUrl}/categories/${id}`, { headers: this.getHeaders() })
        .subscribe({
          next: () => {
            // Ahora la comparación es segura (string con string)
            this.categories.update((prev) => prev.filter((c) => c.id !== id));
          },
          error: (err) => alert('Error: ' + err.error?.message),
        });
    }
  }
}
