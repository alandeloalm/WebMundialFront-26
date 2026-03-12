// src/app/features/chatbot/chatbot.ts
import {
  Component,
  inject,
  signal,
  computed,
  viewChild,
  ElementRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService, AvatarInfo, LugarCard, PartidoCard } from '../../core/services/chat.service';
import { AuthService } from '../../core/auth/auth.service';

export interface Mensaje {
  role: 'user' | 'bot';
  text: string;
  loading?: boolean;
  avatarInfo?: AvatarInfo;
  lugares?: LugarCard[];
  partidos?: PartidoCard[];
}

const BIENVENIDA: Mensaje = {
  role: 'bot',
  text: '¡Hola! Soy tu guía del Mundial FIFA 2026 en Monterrey 🏆\n\n¿En qué te puedo ayudar?\n• 📅 Partidos y horarios\n• 📍 Lugares y cómo llegar\n• 🚨 Emergencias\n• 🗺️ Qué hacer en Monterrey',
  avatarInfo: { nombre: 'Asistente', emoji: '⚽', imagen: null },
};

function newSessionId(): string {
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

@Component({
  selector: 'app-chatbot',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chatbot.html',
})
export class Chatbot {
  readonly #chat = inject(ChatService);
  public auth    = inject(AuthService);

  // ── refs ──────────────────────────────────────────────────────────
  readonly messagesEl = viewChild<ElementRef<HTMLElement>>('messagesEl');
  readonly inputEl    = viewChild<ElementRef<HTMLTextAreaElement>>('inputEl');

  // ── state ─────────────────────────────────────────────────────────
  readonly abierto      = signal(false);
  readonly cargando     = signal(false);
  readonly inputTexto   = signal('');
  readonly mensajes     = signal<Mensaje[]>([]);
  readonly avatarActual = signal<AvatarInfo | null>(null);
  readonly sessionId    = signal<string>(newSessionId());

  // ── computed ──────────────────────────────────────────────────────
  readonly mostrarSugerencias = computed(() => this.mensajes().length <= 1 && !this.cargando());
  readonly sendDisabled       = computed(() => this.cargando() || !this.inputTexto().trim());

  readonly sugerencias = [
    '¿Cuándo juega México?',
    'Partidos en Monterrey',
    'Restaurantes cerca del BBVA',
    'Números de emergencia',
  ] as const;

  // ── helpers ───────────────────────────────────────────────────────
  private scrollBottom(): void {
    setTimeout(() => {
      const el = this.messagesEl()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 0);
  }

  private pushMensaje(m: Mensaje): void {
    this.mensajes.update(list => [...list, m]);
    this.scrollBottom();
  }

  private replaceLast(m: Mensaje): void {
    this.mensajes.update(list => [...list.slice(0, -1), m]);
    this.scrollBottom();
  }

  // ── acciones ──────────────────────────────────────────────────────
  toggleChat(): void {
    const opening = !this.abierto();
    this.abierto.set(opening);
    if (opening) {
      if (this.mensajes().length === 0) this.pushMensaje({ ...BIENVENIDA });
      setTimeout(() => this.inputEl()?.nativeElement.focus(), 50);
    }
  }

  enviarSugerencia(s: string): void {
    this.inputTexto.set(s);
    this.enviarMensaje();
  }

  async enviarMensaje(): Promise<void> {
    const texto = this.inputTexto().trim();
    if (!texto || this.cargando()) return;

    this.inputTexto.set('');
    this.cargando.set(true);

    this.pushMensaje({ role: 'user', text: texto });
    this.pushMensaje({
      role: 'bot',
      text: '',
      loading: true,
      avatarInfo: this.avatarActual() ?? { nombre: '...', emoji: '⚽', imagen: null },
    });

    let lat: number | undefined;
    let lng: number | undefined;
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation?.getCurrentPosition(res, rej, { timeout: 3000 })
      );
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch { /* sin ubicación */ }

    this.#chat
      .enviarMensaje({ mensaje: texto, sessionId: this.sessionId(), lat, lng })
      .subscribe({
        next: (resp) => {
          if (resp.avatarInfo) {
            this.avatarActual.set(resp.avatarInfo);
            this.mensajes.update(list =>
              list.map((m, i) =>
                i === 0 && m.avatarInfo?.nombre === 'Asistente'
                  ? { ...m, avatarInfo: resp.avatarInfo }
                  : m
              )
            );
          }
          this.replaceLast({
            role: 'bot',
            text: resp.respuesta,
            avatarInfo: resp.avatarInfo,
            lugares: resp.lugares,
            partidos: resp.partidos,
          });
          this.cargando.set(false);
        },
        error: () => {
          this.replaceLast({
            role: 'bot',
            text: 'Hubo un error al conectar. Intenta de nuevo.',
            avatarInfo: this.avatarActual() ?? { nombre: 'Asistente', emoji: '⚽', imagen: null },
          });
          this.cargando.set(false);
        },
      });
  }

  limpiarChat(): void {
    this.#chat.limpiarSesion(this.sessionId()).subscribe();
    this.sessionId.set(newSessionId());
    this.avatarActual.set(null);
    this.mensajes.set([{ ...BIENVENIDA }]);
  }

  // ── eventos ───────────────────────────────────────────────────────
  onInput(e: Event): void {
    this.inputTexto.set((e.target as HTMLTextAreaElement).value);
  }

  onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.enviarMensaje();
    }
  }

  abrirMaps(url: string): void {
    window.open(url, '_blank', 'noopener');
  }

  // ── formato ───────────────────────────────────────────────────────
  formatText(t: string): string {
    return t
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  iconCategoria(cat: string): string {
    const icons: Record<string, string> = {
      restaurant: '🍽️', museum: '🏛️', transport: '🚇', attraction: '⭐', kiosko: '🏪',
    };
    return icons[cat] ?? '📍';
  }

  avatarImagen(avatar: string | undefined): string | null {
    const imagenes: Record<string, string> = {
      'Chicharrón': 'chicharron.png',
      'Macarrón':   'macarron.png',
    };
    return avatar ? (imagenes[avatar] ?? null) : null;
  }
}