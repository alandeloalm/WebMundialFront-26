import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  public auth = inject(AuthService);
  mobileOpen = signal(false);

  navItems = [
    { path: '/recompensas', label: 'Recompensas', icon: 'trophy' },
    { path: '/experiencias', label: 'Experiencias', icon: 'qr-code' },
    { path: '/mapa', label: 'Mapa', icon: 'map' },
    { path: '/dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
  ];

  toggleMobileMenu() {
    this.mobileOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.mobileOpen.set(false);
  }
}