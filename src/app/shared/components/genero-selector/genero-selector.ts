import { Component, signal, computed, output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-genero-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './genero-selector.html',
  host: { class: 'block' }
})
export class GeneroSelector {
  generoSelected = output<string>();
  opened = output<void>();

  dropdownOpen  = signal(false);
  selectedValue = signal('');

  generoOptions = [
    { value: 'Masculino',           label: 'Masculino' },
    { value: 'Femenino',            label: 'Femenino' },
    { value: 'Otro',                label: 'Otro' },
    { value: 'Prefiero no decirlo', label: 'Prefiero no decirlo' },
  ];

  selectedLabel = computed(() => {
    const found = this.generoOptions.find(g => g.value === this.selectedValue());
    return found?.label ?? 'Género';
  });

  toggle(event: MouseEvent) {
    event.stopPropagation();
    const willOpen = !this.dropdownOpen();
    this.dropdownOpen.update(v => !v);
    if (willOpen) {
      this.opened.emit();
    }
  }

  select(value: string) {
    this.selectedValue.set(value);
    this.dropdownOpen.set(false);
    this.generoSelected.emit(value);
  }

  closeDropdown() { this.dropdownOpen.set(false); }

  @HostListener('document:keydown.escape')
  onEscape() { this.dropdownOpen.set(false); }
}