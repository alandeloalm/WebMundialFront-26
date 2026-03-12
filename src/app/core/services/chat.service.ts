// src/app/core/services/chat.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AvatarInfo {
  nombre: string;
  emoji: string;
  imagen: string | null;
}

export interface LugarCard {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  latitud: number;
  longitud: number;
  imagen_url: string;
  distancia_texto?: string;
  maps_url: string;
  direccion?: string;
}

export interface PartidoCard {
  numero_partido: number;
  equipo_local: string;
  equipo_visitante: string;
  fecha_display: string;
  hora_display: string;
  estadio: string;
  sede_ciudad: string;
  fase: string;
  grupo: string;
}

export interface ChatRequest {
  mensaje: string;
  sessionId: string;
  lat?: number;
  lng?: number;
}

export interface ChatResponse {
  respuesta: string;
  avatar: string;
  avatarInfo: AvatarInfo;
  lugares: LugarCard[];
  partidos: PartidoCard[];
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  readonly #http = inject(HttpClient);
  readonly #api  = environment.apiUrl;

  enviarMensaje(body: ChatRequest): Observable<ChatResponse> {
    return this.#http.post<ChatResponse>(`${this.#api}/chat`, body);
  }

  limpiarSesion(sessionId: string): Observable<void> {
    return this.#http.delete<void>(`${this.#api}/chat/sesion/${sessionId}`);
  }
}