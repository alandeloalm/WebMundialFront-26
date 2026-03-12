import { Component, inject, input, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { LucideAngularModule } from 'lucide-angular';
import { DashboardService, MetricasKioskos, type Filtro } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-tab-kioskos',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, LucideAngularModule],
  templateUrl: './tab-kioskos.html',
})
export class TabKioskos {
  private svc = inject(DashboardService);

  filtro  = input.required<Filtro>();
  data    = signal<MetricasKioskos | null>(null);
  loading = signal(true);
  error   = signal(false);

  constructor() {
    effect(() => {
      const f = this.filtro();
      this.loading.set(true);
      this.error.set(false);
      this.svc.getKioskos(f).subscribe({
        next:  d => { this.data.set(d); this.loading.set(false); },
        error: () => { this.error.set(true); this.loading.set(false); },
      });
    });
  }

  get maxInteracciones(): number {
    return Math.max(...(this.data()?.por_kiosko.map(k => k.total_interacciones) ?? []), 1);
  }

  get maxQR(): number {
    return Math.max(...(this.data()?.qr_scans.map(k => k.escaneos_qr) ?? []), 1);
  }

  get sesionesChart(): ChartData<'bar'> {
    const d = this.data();
    if (!d) return { labels: [], datasets: [] };
    return {
      labels: d.por_kiosko.map(k => k.nombre),
      datasets: [
        {
          label: 'Con sesión',
          data: d.por_kiosko.map(k => k.con_sesion),
          backgroundColor: '#4ECDC4',
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          label: 'Sin sesión',
          data: d.por_kiosko.map(k => k.sin_sesion),
          backgroundColor: '#FF6B6B',
          borderRadius: 4,
          borderSkipped: false,
        }
      ]
    };
  }

  sesionesOpts: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 10 } }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } },
    }
  };
}