import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';
import { PaisSelector } from '../../shared/components/pais-selector/pais-selector';
import { GeneroSelector } from '../../shared/components/genero-selector/genero-selector';
import { toast } from 'ngx-sonner';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, PaisSelector, GeneroSelector],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  private auth   = inject(AuthService);

  @ViewChild('paisSelector') paisSelector!: PaisSelector;
@ViewChild('generoSelector') generoSelector!: GeneroSelector;

  isRegister = signal(false);
  isLoading  = signal(false);
  errorMsg   = signal<string | null>(null);
  showPassword = signal(false);

  formData = {
    email:       '',
    password:    '',
    name:        '',
    nationality: '',
    birthdate:   '',
    gender:      '',
    phone:       ''
  };

  ngOnInit() {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => {
        this.handleGoogleCallback(response.credential);
      }
    });
  }

  toggleMode() {
    this.isRegister.update(v => !v);
    this.errorMsg.set(null);
    this.formData.nationality = '';
    this.formData.gender = '';
    if (this.paisSelector) {
      this.paisSelector.clear();
    }
  }

  onSubmit() {
    this.errorMsg.set(null);
    if (!this.formData.email || !this.formData.password) {
      this.errorMsg.set('El correo y la contraseña son obligatorios.');
      return;
    }
    if (this.isRegister()) {
      this.handleRegistro();
    } else {
      this.handleLogin();
    }
  }

  private handleLogin() {
    this.isLoading.set(true);
    this.auth.login(this.formData.email, this.formData.password).subscribe({
      next: (res) => {
        toast.success(`¡Bienvenido, ${res.usuario.nombre}!`, {  
          description: 'Sesión iniciada correctamente.'
        });
      },
      error: (err) => {
        const status = err.status;
        const msg = err.error?.error;
  
        if (status === 0) {
          this.errorMsg.set('Sin conexión. Verifica tu internet.');
        } else if (status === 403) {
          this.errorMsg.set(msg || 'Tu cuenta ha sido desactivada.');
        } else if (status === 500) {
          this.errorMsg.set('Error en el servidor. Intenta más tarde.');
        } else {
          this.errorMsg.set(msg || 'Correo o contraseña incorrectos.');
        }
        this.isLoading.set(false);
      }
    });
  }

  private handleRegistro() {
    const { email, password, name, nationality, birthdate, gender, phone } = this.formData;

    if (!name || !nationality || !birthdate) {
      this.errorMsg.set('Nombre, nacionalidad y fecha de nacimiento son obligatorios.');
      return;
    }

    this.isLoading.set(true);
    const fechaFormateada = new Date(birthdate).toISOString().split('T')[0];

    this.auth.registro({
      nombre:           name,
      correo:           email,
      password,
      nacionalidad:     nationality,
      fecha_nacimiento: fechaFormateada,
      telefono:         phone    || undefined,
      genero:           gender   || undefined
    }).subscribe({
      next: () => {
        this.isRegister.set(false);
        this.errorMsg.set(null);
        this.limpiarFormulario();
        toast.success('¡Cuenta creada exitosamente!', {
          description: 'Ahora inicia sesión para continuar.'
        });
      },
      error: (err) => {
        const status = err.status;
        const msg = err.error?.error;
      
        if (status === 0) {
          this.errorMsg.set('Sin conexión. Verifica tu internet.');
        } else if (status === 409) {
          this.errorMsg.set(msg || 'El correo ya está registrado.');
        } else if (status === 500) {
          this.errorMsg.set('Error en el servidor. Intenta más tarde.');
        } else {
          this.errorMsg.set(msg || 'Error al crear la cuenta.');
        }
        this.isLoading.set(false);
      }
    });
  }

  handleGoogleLogin() {
    this.errorMsg.set(null);
    google.accounts.id.prompt();
  }

  private handleGoogleCallback(idToken: string) {
    this.isLoading.set(true);
    this.auth.loginConGoogle(idToken).subscribe({
      next: (res) => {
        toast.success(`¡Bienvenido, ${res.usuario.nombre}!`, { 
          description: res.esNuevo ? 'Cuenta creada con Google.' : 'Sesión iniciada correctamente.'
        });
      },
      error: (err) => {
        const status = err.status;
        const msg = err.error?.error;
  
        if (status === 0) {
          this.errorMsg.set('Sin conexión. Verifica tu internet.');
        } else if (status === 500) {
          this.errorMsg.set('Error en el servidor. Intenta más tarde.');
        } else {
          this.errorMsg.set(msg || 'No se pudo iniciar sesión con Google.');
        }
        this.isLoading.set(false);
      }
    });
  }

  private limpiarFormulario() {
    this.formData = { email: '', password: '', name: '', nationality: '', birthdate: '', gender: '', phone: '' };
    this.isLoading.set(false);
  }
}