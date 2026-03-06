// src/app/core/auth/auth.service.ts
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environments';

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface LoginResponse {
  mensaje: string;
  token: string;
  usuario: {
    nombre: string;
    correo: string;
    rol: string;
  };
}

interface GoogleLoginResponse {
  token: string;
  esNuevo: boolean;
  usuario: {
    id: number;
    nombre: string;
    correo: string;
    perfilCompleto: boolean;
  };
}

interface RegisterResponse {
  mensaje: string;
  usuario: {
    id: number;
    correo: string;
  };
}

interface CompletarPerfilResponse {
  mensaje: string;
  token: string;
  usuario: any;
}

// ─── Servicio ─────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  // Signals — persisten la sesión leyendo localStorage al iniciar
  isLoggedIn = signal<boolean>(localStorage.getItem('is_logged') === 'true');
  userRole = signal<string | null>(this.leerDelToken('rol'));
  userName = signal<string | null>(this.leerDelToken('nombre'));
  perfilCompleto = signal<boolean>(this.leerPerfilCompletoDelToken());

  constructor() {
    if (localStorage.getItem('is_logged') !== 'true') {
      this.logout();
    }
  }

  // ─── Login con correo y contraseña ─────────────────────────────────────────
  login(correo: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { correo, password })
      .pipe(
        tap(response => {
          this.guardarSesion(response.token);
          this.redirectByRole(this.userRole());
        })
      );
  }

  // ─── Login con Google ───────────────────────────────────────────────────────
  loginConGoogle(googleToken: string): Observable<GoogleLoginResponse> {
    return this.http.post<GoogleLoginResponse>(`${this.apiUrl}/google`, { token: googleToken })
      .pipe(
        tap(response => {
          this.guardarSesion(response.token);

          if (response.esNuevo || !response.usuario.perfilCompleto) {
            // Usuario nuevo de Google → debe completar su perfil primero
            this.router.navigate(['/completar-perfil']);
          } else {
            this.redirectByRole(this.userRole());
          }
        })
      );
  }

  // ─── Registro ──────────────────────────────────────────────────────────────
  registro(datos: {
    nombre: string;
    correo: string;
    password: string;
    nacionalidad: string;
    fecha_nacimiento: string;
    telefono?: string;
    genero?: string;
  }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/registro`, datos);
  }

  // ─── Completar perfil (usuarios de Google) ─────────────────────────────────
  completarPerfil(datos: {
    nacionalidad: string;
    fecha_nacimiento: string;
    telefono?: string;
    genero?: string;
  }): Observable<CompletarPerfilResponse> {
    return this.http.put<CompletarPerfilResponse>(`${this.apiUrl}/completar-perfil`, datos)
    .pipe(
      tap((response: any) => {
        this.guardarSesion(response.token);
        this.redirectByRole(this.userRole());
      })
    );
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────
  private guardarSesion(token: string) {
    localStorage.setItem('is_logged', 'true');
    localStorage.setItem('token', token);
  
    this.isLoggedIn.set(true);
    this.userRole.set(this.leerDelToken('rol'));
    this.userName.set(this.leerDelToken('nombre'));
    this.perfilCompleto.set(this.leerPerfilCompletoDelToken());
  }

  redirectByRole(role: string | null) {
    const routesByRole: Record<string, string> = {
      'admin': '/dashboard',
      'user': '/recompensas'
    };

    const target = routesByRole[role || ''] || '/login';
    this.router.navigate([target]);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private leerPerfilCompletoDelToken(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.perfilCompleto === true;
    } catch {
      return false;
    }
  }

  private leerDelToken(campo: string): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.[campo] ?? null;
    } catch {
      return null;
    }
  }

  logout() {
    localStorage.clear();
    this.isLoggedIn.set(false);
    this.userRole.set(null);
    this.userName.set(null);
    this.perfilCompleto.set(false);
    this.router.navigate(['/login']);
  }
}