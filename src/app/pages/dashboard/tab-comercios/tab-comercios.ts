import { Component, inject, input, effect, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { LucideAngularModule } from 'lucide-angular';
import { DashboardService, MetricasComercio, type Filtro } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-tab-comercios',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, LucideAngularModule],
  templateUrl: './tab-comercios.html',
})
export class TabComercios {
  private svc = inject(DashboardService);

  filtro  = input.required<Filtro>();
  data    = signal<MetricasComercio | null>(null);
  loading = signal(true);
  error   = signal(false);

  constructor() {
    effect(() => {
      const f = this.filtro();
      this.loading.set(true);
      this.error.set(false);
      this.svc.getComercio(f).subscribe({
        next:  d => { this.data.set(d); this.loading.set(false); },
        error: () => { this.error.set(true); this.loading.set(false); },
      });
    });
  }

  get maxCanjes(): number {
    return Math.max(...(this.data()?.ranking.map(r => r.total_canjeados) ?? []), 1);
  }

  get horasPicoChart(): ChartData<'bar'> {
    const d = this.data();
    if (!d) return { labels: [], datasets: [] };

    const horas = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const top5comercios = [...new Set(d.horas_pico.map(h => h.comercio))].slice(0, 5);
    const colors = ['#FF6B6B','#FFB347','#4ECDC4','#45B7D1','#94A3B8'];

    const datasets = top5comercios.map((comercio, i) => ({
      label: comercio,
      data: horas.map((_, hora) => {
        const found = d.horas_pico.find(h => h.comercio === comercio && h.hora === hora);
        return found?.canjes ?? 0;
      }),
      backgroundColor: colors[i] + 'CC',
      borderRadius: 3,
      borderSkipped: false,
    }));

    return { labels: horas, datasets };
  }

  horasPicoOpts: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 10 } }
    },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 0 } },
      y: { stacked: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } },
    }
  };

  get roiChart(): ChartData<'bar'> {
    const d = this.data();
    if (!d) return { labels: [], datasets: [] };
    const top8 = d.roi.slice(0, 8);
    return {
      labels: top8.map(r => r.nombre.length > 18 ? r.nombre.slice(0, 18) + '…' : r.nombre),
      datasets: [{
        label: 'ROI (%)',
        data: top8.map(r => r.roi_pct),
        backgroundColor: '#FFB347',
        borderRadius: 6,
        borderSkipped: false,
      }]
    };
  }

  roiOpts: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, max: 100, ticks: { callback: v => v + '%', font: { size: 11 } } },
      y: { grid: { display: false }, ticks: { font: { size: 11 } } },
    }
  };
}