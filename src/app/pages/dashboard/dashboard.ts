import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  stats = [
    { label: "Usuarios registrados", value: "1,247", change: "+12%", icon: 'users' },
    { label: "Bailes completados", value: "834", change: "+8%", icon: 'activity' },
    { label: "Sin sesión", value: "213", change: "-3%", icon: 'qr-code' },
    { label: "Cupones reclamados", value: "456", change: "+15%", icon: 'trophy' },
  ];

  kioskMetrics = [
    { name: "Barrio Antiguo", sessions: 312, completion: 89 },
    { name: "Macroplaza", sessions: 245, completion: 76 },
    { name: "Fundidora", sessions: 178, completion: 82 },
    { name: "Santa Lucía", sessions: 99, completion: 91 },
  ];

  get maxSessions(): number {
    return Math.max(...this.kioskMetrics.map(k => k.sessions), 1);
  }
}