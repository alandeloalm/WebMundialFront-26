import { Component, inject, input, effect, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { LucideAngularModule } from 'lucide-angular';
import { DashboardService, MetricasCampanas, type Filtro } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-tab-campanas',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, LucideAngularModule],
  templateUrl: './tab-campanas.html',
})
export class TabCampanas {
  private svc = inject(DashboardService);

  filtro  = input.required<Filtro>();
  data    = signal<MetricasCampanas | null>(null);
  loading = signal(true);
  error   = signal(false);

  // Filtros del análisis cruzado
  filtroCruzNac   = signal<string>('todos');
  filtroCruzGen   = signal<string>('todos');
  filtroCruzEdad  = signal<string>('todos');

  constructor() {
    effect(() => {
      const f = this.filtro();
      this.loading.set(true);
      this.error.set(false);
      this.svc.getCampanas(f).subscribe({
        next:  d => { this.data.set(d); this.loading.set(false); },
        error: () => { this.error.set(true); this.loading.set(false); },
      });
    });
  }

  // ── Opciones únicas para los selectores del cruzado ──────────────────────
  get nacionalidades(): string[] {
    return ['todos', ...new Set(this.data()?.cruzado.map(r => r.nacionalidad) ?? [])];
  }
  get generos(): string[] {
    return ['todos', ...new Set(this.data()?.cruzado.map(r => r.genero) ?? [])];
  }
  get edades(): string[] {
    const orden = ['Menor de 18','18-24','25-34','35-44','45-54','55+','No especificado'];
    const unicos = [...new Set(this.data()?.cruzado.map(r => r.rango_edad) ?? [])];
    return ['todos', ...unicos.sort((a, b) => orden.indexOf(a) - orden.indexOf(b))];
  }

  // ── Dataset cruzado filtrado ──────────────────────────────────────────────
  cruzadoFiltrado = computed(() => {
    const raw = this.data()?.cruzado ?? [];
    const nac  = this.filtroCruzNac();
    const gen  = this.filtroCruzGen();
    const edad = this.filtroCruzEdad();

    return raw
      .filter(r =>
        (nac  === 'todos' || r.nacionalidad === nac) &&
        (gen  === 'todos' || r.genero === gen) &&
        (edad === 'todos' || r.rango_edad === edad)
      )
      .reduce((acc, r) => {
        const key = r.comercio;
        if (!acc[key]) acc[key] = { comercio: r.comercio, categoria: r.categoria, canjes: 0 };
        acc[key].canjes += r.canjes;
        return acc;
      }, {} as Record<string, { comercio: string; categoria: string; canjes: number }>);
  });

  get cruzadoArray() {
    return Object.values(this.cruzadoFiltrado()).sort((a, b) => b.canjes - a.canjes).slice(0, 10);
  }

  get maxCanjesCruzado(): number {
    return Math.max(...this.cruzadoArray.map(r => r.canjes), 1);
  }

  // ── Chart: Tasa de conversión por campaña (Bar horizontal) ───────────────
  get conversionChart(): ChartData<'bar'> {
    const d = this.data();
    if (!d) return { labels: [], datasets: [] };
    const top8 = d.por_campana.slice(0, 8);
    return {
      labels: top8.map(c => c.titulo.length > 22 ? c.titulo.slice(0, 22) + '…' : c.titulo),
      datasets: [{
        label: 'Tasa de conversión (%)',
        data: top8.map(c => c.tasa_conversion),
        backgroundColor: '#4ECDC4',
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
      x: { grid: { display: false }, max: 100, ticks: { callback: v => v + '%', font: { size: 11 } } },
      y: { grid: { display: false }, ticks: { font: { size: 11 } } },
    }
  };

  // ── Chart: Tipo de descuento (Doughnut) ───────────────────────────────────
  get tipoDescuentoChart(): ChartData<'doughnut'> {
    const d = this.data();
    if (!d) return { labels: [], datasets: [] };
    return {
      labels: d.por_tipo_descuento.map(t => t.tipo_descuento ?? 'Sin tipo'),
      datasets: [{
        data: d.por_tipo_descuento.map(t => t.tasa_conversion),
        backgroundColor: ['#FF6B6B','#FFB347','#4ECDC4','#45B7D1'],
        borderWidth: 0,
        hoverOffset: 6,
      }]
    };
  }

  doughnutOpts: ChartOptions<'doughnut'> = {
    responsive: true,
    cutout: '68%',
    plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 10 } } }
  };
}