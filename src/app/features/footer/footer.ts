import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.html',
})
export class Footer {
  public auth = inject(AuthService);
  readonly anio = new Date().getFullYear();
}