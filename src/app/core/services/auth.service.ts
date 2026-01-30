import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoginResponse, RegisterResponse, User } from '../../interfaces/auth.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly apiUrl = `${environment.baseUrl}/auth`;

  // Estado reactivo con Signals
  // Inicializamos intentando leer del localStorage para no perder la sesión al recargar
  #currentUser = signal<User | null>(this.getUserFromStorage());

  // Exponemos el usuario como lectura y un computado para saber si está logueado
  currentUser = this.#currentUser.asReadonly();
  isAuthenticated = computed(() => !!this.#currentUser());
  isAdmin = computed(() => this.#currentUser()?.roleId === 1);

  // Usamos RxJS por su excelente manejo de flujos asíncronos
  login(email: string, pass: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, pass }).pipe(
      tap((res) => {
        this.saveSession(res.access_token, res.user);
        this.#currentUser.set(res.user);
      }),
    );
  }

  // Registro
  register(name: string, email: string, pass: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, { name, email, pass });
  }

  // Logout
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.#currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  // Auxiliares privados
  private saveSession(token: string, user: User): void {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  private getUserFromStorage(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}
