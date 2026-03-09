import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Recompensa {
  campana_id: string;
  titulo: string;
  descripcion: string | null;
  tipo_descuento: string;
  valor_descuento: number;
  kiosko_id: string;
  terminos: string | null;
  inicia_en: string;
  expira_en: string;
  comercio_nombre: string;
  comercio_logo: string | null;
  comercio_categoria: string;
  codigo: string | null;
  estado_cupon: string | null;
  desbloqueado: boolean;
}

export interface RecompensasResponse {
  total: number;
  kioskos_completados: number;
  recompensas: Recompensa[];
}

@Injectable({ providedIn: 'root' })
export class RecompensasService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  obtenerRecompensas(): Observable<RecompensasResponse> {
    return this.http.get<RecompensasResponse>(`${this.apiUrl}/recompensas`);
  }
}