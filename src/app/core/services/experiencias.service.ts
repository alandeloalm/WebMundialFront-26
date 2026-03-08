import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

export interface VideoExperience {
  id: string;
  video_url: string;
  completado_en: string;
  kiosko_nombre: string;
  ubicacion: string;
}

@Injectable({ providedIn: 'root' })
export class ExperienciasService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  obtenerQR(): Observable<{ qr_data: string }> {
    return this.http.get<{ qr_data: string }>(`${this.apiUrl}/experiencias/qr`);
  }

  obtenerVideos(): Observable<{ videos: VideoExperience[] }> {
    return this.http.get<{ videos: VideoExperience[] }>(`${this.apiUrl}/experiencias/videos`);
  }
} 