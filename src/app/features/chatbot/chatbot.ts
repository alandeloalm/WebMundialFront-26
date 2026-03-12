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
  template: `
<!-- ── FAB ─────────────────────────────────────────────────────────── -->
<button
  (click)="toggleChat()"
  [class]="abierto()
    ? 'fixed bottom-7 right-7 z-50 w-16 h-16 rounded-full flex items-center justify-center border-none cursor-pointer gradient-coral shadow-elevated transition-all duration-300'
    : 'fixed bottom-7 right-7 z-50 w-16 h-16 rounded-full flex items-center justify-center border-none cursor-pointer gradient-hero shadow-elevated transition-all duration-300 hover:scale-110'"
  aria-label="Abrir asistente"
>
  <div
    class="relative w-9 h-9 transition-all duration-200"
    [class.opacity-0]="abierto()"
    [class.scale-75]="abierto()"
  >
    <span class="absolute top-0 left-0 text-2xl leading-none">🐷</span>
    <span class="absolute top-3 left-3 text-lg leading-none opacity-60">🍝</span>
  </div>
  <span
    class="absolute text-white font-bold text-lg transition-all duration-200"
    [class.opacity-0]="!abierto()"
    [class.opacity-100]="abierto()"
  >✕</span>
  <span class="absolute inset-0 rounded-full border-2 border-secondary animate-ping opacity-30 pointer-events-none"></span>
</button>

<!-- ── Ventana ──────────────────────────────────────────────────────── -->
<div
  class="fixed z-40 bg-white rounded-2xl flex flex-col overflow-hidden border border-border transition-all duration-300 shadow-elevated"
  [class]="abierto()
    ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
    : 'opacity-0 translate-y-4 scale-95 pointer-events-none'"
  style="bottom:108px; right:28px; width:375px; max-width:calc(100vw - 32px); max-height:620px;"
>
  <!-- Header -->
  <div class="gradient-hero flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b-2 border-secondary">
    <div class="relative flex-shrink-0">
      <div class="w-11 h-11 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-xl overflow-hidden">
        @if (avatarActual()?.imagen) {
          <img [src]="avatarActual()!.imagen" [alt]="avatarActual()!.nombre" class="w-full h-full object-cover" />
        } @else {
          <span>{{ avatarActual()?.emoji || '⚽' }}</span>
        }
      </div>
      <span class="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-primary animate-pulse"></span>
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-white font-bold text-sm text-display tracking-wide truncate m-0">
        {{ avatarActual()?.nombre || 'Asistente Mundial' }}
      </p>
      <p class="text-white/50 text-[11px] tracking-wide m-0">FIFA World Cup 2026 · Monterrey</p>
    </div>
    <button
      (click)="limpiarChat()"
      class="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all cursor-pointer"
      title="Nueva conversación"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
      </svg>
    </button>
  </div>

  <!-- Mensajes -->
  <div #messagesEl class="flex-1 overflow-y-auto p-3 flex flex-col gap-4 bg-background" style="scrollbar-width:thin;">
    @for (msg of mensajes(); track $index) {

      @if (msg.role === 'bot') {
        <div class="flex items-end gap-2">
          <div class="w-8 h-8 rounded-full bg-primary border-2 border-border flex items-center justify-center text-sm flex-shrink-0 overflow-hidden">
            @if (msg.avatarInfo?.imagen) {
              <img [src]="msg.avatarInfo!.imagen" [alt]="msg.avatarInfo!.nombre" class="w-full h-full object-cover" />
            } @else {
              <span>{{ msg.avatarInfo?.emoji || '⚽' }}</span>
            }
          </div>
          <div class="flex flex-col gap-1 max-w-[calc(100%-44px)]">
            @if (msg.avatarInfo?.nombre && msg.avatarInfo?.nombre !== '...') {
              <span class="text-[11px] font-bold text-secondary pl-1 text-display tracking-wide">
                {{ msg.avatarInfo?.nombre }}
              </span>
            }
            <div class="bg-white border border-border rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-[13.5px] leading-relaxed text-foreground shadow-card">
              @if (msg.loading) {
                <div class="flex gap-1 items-center py-0.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce" style="animation-delay:0s"></span>
                  <span class="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce" style="animation-delay:.15s"></span>
                  <span class="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce" style="animation-delay:.3s"></span>
                </div>
              } @else {
                <span [innerHTML]="formatText(msg.text)"></span>
              }
            </div>

            @if (msg.partidos?.length) {
              <div class="flex flex-col gap-2 mt-1">
                @for (p of msg.partidos; track p.numero_partido) {
                  <div class="bg-white border border-border border-l-[3px] border-l-secondary rounded-xl p-3 shadow-card">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-secondary">
                      {{ p.fase }}{{ p.grupo ? ' · Grupo ' + p.grupo : '' }}
                    </span>
                    <div class="flex items-center gap-2 my-1.5">
                      <span class="flex-1 text-[12.5px] font-bold text-primary text-display">{{ p.equipo_local }}</span>
                      <span class="text-[10px] font-black text-white bg-secondary px-1.5 py-0.5 rounded flex-shrink-0">VS</span>
                      <span class="flex-1 text-[12.5px] font-bold text-primary text-display text-right">{{ p.equipo_visitante }}</span>
                    </div>
                    <div class="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                      <span>📅 {{ p.fecha_display }}</span>
                      <span>🕐 {{ p.hora_display }} MTY</span>
                      <span>🏟 {{ p.sede_ciudad }}</span>
                    </div>
                  </div>
                }
              </div>
            }

            @if (msg.lugares?.length) {
              <div class="flex flex-col gap-2 mt-1">
                @for (l of msg.lugares; track l.id) {
                  <div class="bg-white border border-border rounded-xl overflow-hidden flex shadow-card hover:shadow-elevated transition-shadow">
                    <div class="w-16 flex-shrink-0 bg-muted flex items-center justify-center text-2xl overflow-hidden">
                      @if (l.imagen_url) {
                        <img [src]="l.imagen_url" [alt]="l.nombre" class="w-full h-full object-cover" loading="lazy" />
                      } @else {
                        <span>{{ iconCategoria(l.categoria) }}</span>
                      }
                    </div>
                    <div class="flex-1 p-2.5 flex flex-col gap-0.5 min-w-0">
                      <span class="text-[12.5px] font-bold text-primary text-display truncate">{{ l.nombre }}</span>
                      <span class="text-[10px] font-bold uppercase tracking-wide text-secondary">{{ l.categoria }}</span>
                      @if (l.distancia_texto) {
                        <span class="text-[11px] text-muted-foreground">📍 {{ l.distancia_texto }}</span>
                      }
                      <span class="text-[11px] text-muted-foreground line-clamp-2">{{ l.direccion }}</span>
                      <button
                        (click)="abrirMaps(l.maps_url)"
                        class="mt-1 w-fit text-[11px] font-semibold text-white bg-primary hover:bg-secondary px-2.5 py-1 rounded-md transition-colors cursor-pointer border-none"
                      >🗺️ Cómo llegar</button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      }

      @if (msg.role === 'user') {
        <div class="flex justify-end">
          <div
            class="gradient-hero text-white rounded-2xl rounded-br-sm px-3.5 py-2.5 text-[13.5px] leading-relaxed max-w-[80%] shadow-card"
            [innerHTML]="formatText(msg.text)"
          ></div>
        </div>
      }

    }
  </div>

  <!-- Sugerencias -->
  @if (mostrarSugerencias()) {
    <div class="px-3 pt-2 pb-1 flex flex-wrap gap-1.5 bg-background border-t border-border">
      @for (s of sugerencias; track s) {
        <button
          (click)="enviarSugerencia(s)"
          class="text-[12px] text-foreground bg-white border border-border rounded-full px-3 py-1.5 cursor-pointer hover:bg-primary hover:text-white hover:border-primary transition-all"
        >{{ s }}</button>
      }
    </div>
  }

  <!-- Input -->
  <div class="flex items-end gap-2 px-3 py-2.5 bg-white border-t border-border flex-shrink-0">
    <textarea
      #inputEl
      [value]="inputTexto()"
      (input)="onInput($event)"
      (keydown)="onKeyDown($event)"
      placeholder="Escribe tu pregunta..."
      rows="1"
      [disabled]="cargando()"
      class="flex-1 bg-background border border-border rounded-xl px-3.5 py-2.5 text-[13.5px] font-[inherit] resize-none outline-none max-h-24 leading-relaxed transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/10 focus:bg-white disabled:opacity-60"
    ></textarea>
    <button
      (click)="enviarMensaje()"
      [disabled]="sendDisabled()"
      class="w-10 h-10 rounded-xl gradient-coral text-white flex items-center justify-center border-none cursor-pointer flex-shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 shadow-card"
    >
      @if (!cargando()) {
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      } @else {
        <div class="flex gap-0.5 items-center">
          <span class="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style="animation-delay:0s"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style="animation-delay:.15s"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style="animation-delay:.3s"></span>
        </div>
      }
    </button>
  </div>
</div>
  `,
})
export class Chatbot {
  readonly #chat = inject(ChatService);

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

  /** Reemplaza el último mensaje (placeholder de loading) */
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
}