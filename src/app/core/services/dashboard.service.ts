import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

export type Filtro = 'semana' | 'mes' | 'total';

export interface MetricasUsuarios {
  total_usuarios: number;
  activos: number;
  inactivos: number;
  por_nacionalidad: { nacionalidad: string; total: number }[];
  por_genero:       { genero: string; total: number }[];
  por_edad:         { rango: string; total: number }[];
}

export interface MetricasCampanas {
  total_canjeados: number;
  por_campana: {
    campana_id: string;
    titulo: string;
    comercio: string;
    categoria: string;
    total_emitidos: number;
    total_canjeados: number;
    total_disponibles: number;
    total_expirados: number;
    tasa_conversion: number;
  }[];
  por_tipo_descuento: {
    tipo_descuento: string;
    total_emitidos: number;
    total_canjeados: number;
    tasa_conversion: number;
    valor_promedio: number;
  }[];
  cruzado: {
    nacionalidad: string;
    genero: string;
    rango_edad: string;
    comercio: string;
    categoria: string;
    canjes: number;
  }[];
}

export interface MetricasComercio {
  ranking: {
    id: string;
    nombre: string;
    categoria: string;
    logo_url: string;
    total_canjeados: number;
    usuarios_unicos: number;
    total_emitidos: number;
    roi_pct: number;
  }[];
  horas_pico: { comercio: string; hora: number; canjes: number }[];
  roi: {
    nombre: string;
    categoria: string;
    valor_total_canjeado: number;
    cupones_canjeados: number;
    cupones_emitidos: number;
    roi_pct: number;
  }[];
}

export interface MetricasKioskos {
  totales: {
    total_interacciones: number;
    completaron_flujo: number;
    no_completaron: number;
    pct_completaron: number;
  };
  por_kiosko: {
    id: string;
    nombre: string;
    ubicacion: string;
    lugar: string;
    total_interacciones: number;
    con_sesion: number;
    sin_sesion: number;
    pct_sin_sesion: number;
    con_video: number;
  }[];
  qr_scans: {
    nombre: string;
    ubicacion: string;
    escaneos_qr: number;
    usuarios_unicos: number;
  }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/dashboard`;

  private params(filtro: Filtro): HttpParams {
    return new HttpParams().set('filtro', filtro);
  }

  getUsuarios(filtro: Filtro): Observable<MetricasUsuarios> {
    return this.http.get<MetricasUsuarios>(`${this.base}/usuarios`, { params: this.params(filtro) });
  }

  getCampanas(filtro: Filtro): Observable<MetricasCampanas> {
    return this.http.get<MetricasCampanas>(`${this.base}/campanas`, { params: this.params(filtro) });
  }

  getComercio(filtro: Filtro): Observable<MetricasComercio> {
    return this.http.get<MetricasComercio>(`${this.base}/comercios`, { params: this.params(filtro) });
  }

  getKioskos(filtro: Filtro): Observable<MetricasKioskos> {
    return this.http.get<MetricasKioskos>(`${this.base}/kioskos`, { params: this.params(filtro) });
  }
}