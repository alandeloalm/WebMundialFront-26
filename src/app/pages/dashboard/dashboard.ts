import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { TabUsuarios } from './tab-usuarios/tab-usuarios';
import { TabCampanas } from './tab-campanas/tab-campanas';
import { TabComercios } from './tab-comercios/tab-comercios';
import { TabKioskos } from './tab-kioskos/tab-kioskos';
import { type Filtro }   from '../../core/services/dashboard.service';

type Tab = 'usuarios' | 'campanas' | 'comercios' | 'kioskos';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, TabUsuarios, TabCampanas, TabComercios, TabKioskos],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  activeTab  = signal<Tab>('usuarios');
  filtro     = signal<Filtro>('total');

  tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'usuarios',  label: 'Usuarios',  icon: 'users' },
    { id: 'campanas',  label: 'Campañas',  icon: 'tag' },
    { id: 'comercios', label: 'Comercios', icon: 'store' },
    { id: 'kioskos',   label: 'Kioskos',   icon: 'monitor' },
  ];

  filtros: { id: Filtro; label: string }[] = [
    { id: 'semana', label: 'Semana' },
    { id: 'mes',    label: 'Mes' },
    { id: 'total',  label: 'Total' },
  ];

  setTab(tab: Tab)      { this.activeTab.set(tab); }
  setFiltro(f: Filtro)  { this.filtro.set(f); }
}