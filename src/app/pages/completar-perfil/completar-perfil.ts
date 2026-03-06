import { Component, inject, signal, HostListener, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/auth/auth.service';
import { PaisSelector } from '../../shared/components/pais-selector/pais-selector';
import { GeneroSelector } from '../../shared/components/genero-selector/genero-selector';

@Component({
  selector: 'app-completar-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, PaisSelector, GeneroSelector],
  templateUrl: './completar-perfil.html',
  styleUrl: './completar-perfil.css'
})
export class CompletarPerfil {
  private auth = inject(AuthService);

  private paisSelector   = viewChild(PaisSelector);
  private generoSelector = viewChild(GeneroSelector);

  userName  = this.auth.userName;
  isLoading = signal(false);
  errorMsg  = signal<string | null>(null);

  formData = {
    nacionalidad:     '',
    fecha_nacimiento: '',
    telefono:         '',
    genero:           ''
  };

  @HostListener('document:click')
  onDocumentClick() {}

  cancelar() {
    this.auth.logout();
  }

  onSubmit() {
    this.errorMsg.set(null);

    if (!this.formData.nacionalidad || !this.formData.fecha_nacimiento) {
      this.errorMsg.set('La nacionalidad y fecha de nacimiento son obligatorias.');
      return;
    }

    this.isLoading.set(true);
    const fechaFormateada = new Date(this.formData.fecha_nacimiento).toISOString().split('T')[0];

    this.auth.completarPerfil({
      nacionalidad:     this.formData.nacionalidad,
      fecha_nacimiento: fechaFormateada,
      telefono:         this.formData.telefono  || undefined,
      genero:           this.formData.genero    || undefined
    }).subscribe({
      next:  () => this.isLoading.set(false),
      error: (err) => {
        this.errorMsg.set(err.error?.error || 'Error al guardar el perfil.');
        this.isLoading.set(false);
      }
    });
  }

  onPaisOpened() {
    this.generoSelector()?.closeDropdown();
  }

  onGeneroOpened() {
    this.paisSelector()?.onClickOutside();
  }
}