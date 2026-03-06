import { Component, signal, computed, output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import allCountries from 'world-countries';

interface Country {
  name: { common: string };
  cca2: string;
}

@Component({
  selector: 'app-pais-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pais-selector.html',
  host: { class: 'block' }
})
export class PaisSelector {
  countrySelected = output<string>();
  opened = output<void>();

  countrySearch   = signal('');
  dropdownOpen    = signal(false);
  selectedCountry = signal<Country | null>(null);

  countries: Country[] = (allCountries as Country[])
    .sort((a, b) => a.name.common.localeCompare(b.name.common));

  filteredCountries = computed(() => {
    const q = this.countrySearch().toLowerCase();
    if (!q) return this.countries;
    return this.countries.filter(c => c.name.common.toLowerCase().includes(q));
  });

  open(event?: MouseEvent | FocusEvent) {
    event?.stopPropagation();
    this.dropdownOpen.set(true);
    this.opened.emit();
  }

  select(country: Country) {
    this.selectedCountry.set(country);
    this.countrySearch.set('');
    this.dropdownOpen.set(false);
    this.countrySelected.emit(country.name.common);
  }

  clear() {
    this.selectedCountry.set(null);
    this.countrySearch.set('');
    this.countrySelected.emit('');
  }

  @HostListener('document:click')
  onClickOutside() {
    this.dropdownOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.dropdownOpen.set(false);
  }
}