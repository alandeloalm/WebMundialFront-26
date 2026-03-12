import { Component, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.html',
})
export class Footer {
  public auth = inject(AuthService);
  readonly anio = new Date().getFullYear();

  private router = inject(Router);

  readonly mostrarFooter = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e: NavigationEnd) => e.urlAfterRedirects),
      startWith(this.router.url),
      map(url => {
        const ruta = url.split('?')[0];
        if (ruta === '/login' || ruta === '/completar-perfil') return false;
        if (ruta === '/mapa') return true;
        return this.auth.isLoggedIn() && this.auth.perfilCompleto();
      })
    ),
    { initialValue: false }
  );
}