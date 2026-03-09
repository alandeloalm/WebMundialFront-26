import { Component, inject, input, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { LucideAngularModule } from 'lucide-angular';
import { DashboardService, MetricasUsuarios, type Filtro } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-tab-usuarios',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, LucideAngularModule],
  templateUrl: './tab-usuarios.html',
})
export class TabUsuarios {
  private svc = inject(DashboardService);

  filtro = input.required<Filtro>();
  data   = signal<MetricasUsuarios | null>(null);
  loading = signal(true);
  error   = signal(false);

  constructor() {
    effect(() => {
      const f = this.filtro();
      this.loading.set(true);
      this.error.set(false);
      this.svc.getUsuarios(f).subscribe({
        next:  d => { this.data.set(d); this.loading.set(false); },
        error: () => { this.error.set(true); this.loading.set(false); },
      });
    });
  }

  // ── Chart: Nacionalidad (Doughnut) ───────────────────────────────────────
  get nacionalidadChart(): ChartData<'doughnut'> {
    const d = this.data();
    if (!d) return { labels: [], datasets: [] };
    return {
      labels: d.por_nacionalidad.map(n => n.nacionalidad),
      datasets: [{
        data: d.por_nacionalidad.map(n => n.total),
        backgroundColor: ['#FF6B6B','#FFB347','#4ECDC4','#45B7D1','#94A3B8'],
        borderWidth: 0,
        hoverOffset: 6,
      }]
    };
  }

  doughnutOpts: ChartOptions<'doughnut'> = {
    responsive: true,
    cutout: '70%',
    plugins: { legend: { position: 'right', labels: { font: { size: 12 }, boxWidth: 12 } } }
  };

  // ── Chart: Género (Bar horizontal) ───────────────────────────────────────
  get generoChart(): ChartData<'bar'> {
    const d = this.data();
    if (!d) return { labels: [], datasets: [] };
    return {
      labels: d.por_genero.map(g => g.genero),
      datasets: [{
        label: 'Usuarios',
        data: d.por_genero.map(g => g.total),
        backgroundColor: '#FF6B6B',
        borderRadius: 6,
        borderSkipped: false,
      }]
    };
  }

  barHorizOpts: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { display: false }, ticks: { font: { size: 12 } } },
    }
  };

  // ── Chart: Edad (Bar) ─────────────────────────────────────────────────────
  get edadChart(): ChartData<'bar'> {
    const d = this.data();
    if (!d) return { labels: [], datasets: [] };
    return {
      labels: d.por_edad.map(e => e.rango),
      datasets: [{
        label: 'Usuarios',
        data: d.por_edad.map(e => e.total),
        backgroundColor: '#FFB347',
        borderRadius: 6,
        borderSkipped: false,
      }]
    };
  }

  barVertOpts: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } },
    }
  };
}