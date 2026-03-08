import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { RecompensasService, Recompensa } from '../../core/services/recompensas.service';

@Component({
  selector: 'app-recompensas',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './recompensas.html',
  styleUrl: './recompensas.css',
})
export class Recompensas implements OnInit {
  INITIAL_COUNT = 8;
  visibleCount = this.INITIAL_COUNT;
  selectedCoupon: Recompensa | null = null;
  copied = false;
  cargando = true;

  kioskosCompletados = 0;
  totalKiosks = 0;
  progress = 0;

  recompensas: Recompensa[] = [];

  constructor(
    private recompensasService: RecompensasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.recompensasService.obtenerRecompensas().subscribe({
      next: (res) => {
        this.recompensas = res.recompensas;
        this.kioskosCompletados = res.kioskos_completados;
        this.totalKiosks = this.contarKioskosUnicos(res.recompensas);
        this.progress = this.totalKiosks > 0
          ? (this.kioskosCompletados / this.totalKiosks) * 100
          : 0;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  contarKioskosUnicos(recompensas: Recompensa[]): number {
    const ids = new Set(recompensas.map(r => r.kiosko_id));
    return ids.size;
  }

  get visibleCoupons() {
    return this.recompensas.slice(0, this.visibleCount);
  }

  get hasMore() {
    return this.visibleCount < this.recompensas.length;
  }

  showMore() {
    this.visibleCount += 8;
  }

  openCoupon(coupon: Recompensa) {
    this.selectedCoupon = coupon;
    this.copied = false;
  }

  closeModal() {
    this.selectedCoupon = null;
  }

  async handleCopyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    } catch (err) {
      console.error('Error al copiar', err);
    }
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  formatearDescuento(tipo: string, valor: number): string {
    if (tipo === 'porcentaje') return `${valor}%`;
    if (tipo === 'monto') return `$${valor}`;
    return `${valor}`;
  }

  parsearTerminos(terminos: any): string[] {
    if (!terminos) return [];
    if (Array.isArray(terminos)) return terminos;
    return String(terminos).split(',').map(t => t.trim());
  }
}