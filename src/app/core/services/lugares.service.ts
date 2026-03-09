import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Lugar {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  latitud: number;
  longitud: number;
  imagen_url: string;
  activo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class LugaresService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/lugares`;

  obtenerLugares(): Observable<{ lugares: Lugar[] }> {
    return this.http.get<{ lugares: Lugar[] }>(this.apiUrl);
  }

  obtenerTodosLugares(): Observable<{ lugares: Lugar[] }> {
    return this.http.get<{ lugares: Lugar[] }>(`${this.apiUrl}/admin`);
  }

  crearLugar(lugar: Omit<Lugar, 'id'>, imagen?: File): Observable<{ lugar: Lugar }> {
    const formData = new FormData();
    Object.entries(lugar).forEach(([k, v]) => formData.append(k, String(v)));
    if (imagen) formData.append('imagen', imagen);
    return this.http.post<{ lugar: Lugar }>(this.apiUrl, formData);
  }

  editarLugar(id: string, lugar: Omit<Lugar, 'id'>, imagen?: File): Observable<{ lugar: Lugar }> {
    const formData = new FormData();
    Object.entries(lugar).forEach(([k, v]) => formData.append(k, String(v)));
    if (imagen) formData.append('imagen', imagen);
    return this.http.put<{ lugar: Lugar }>(`${this.apiUrl}/${id}`, formData);
  }

  desactivarLugar(id: string): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(`${this.apiUrl}/${id}/desactivar`, {});
  }

  activarLugar(id: string): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(`${this.apiUrl}/${id}/activar`, {});
  }
}