import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private auth = inject(AuthService);
  isRegister = signal(false);
  
  formData = {
    email: '',
    password: '',
    name: '',
    nationality: '',
    birthdate: '',
    gender: '',
    phone: ''
  };

  toggleMode() {
    this.isRegister.update(v => !v);
    // Limpiar campos opcionales al cambiar de modo si deseas
  }

  // login.ts
  onSubmit() {
    const { email, password } = this.formData;

    if (!email || !password) {
      alert('Por favor, rellena todos los campos');
      return;
    }

    // Simulación profesional: 
    // Si el correo contiene "admin", entra al dashboard. Si no, a recompensas.
    if (email.includes('admin')) {
      this.auth.login('admin');
    } else {
      this.auth.login('user');
    }
  }

  handleGoogleLogin() {
    // Por defecto, el login social suele ser para usuarios normales
    this.auth.login('user');
  }
}