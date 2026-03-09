import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, AfterViewInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { importLibrary } from '@googlemaps/js-api-loader';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../core/auth/auth.service';
import { LugaresService, Lugar } from '../../core/services/lugares.service';

@Component({
  selector: 'app-mapa',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './mapa.html',
  styleUrl: './mapa.css',
})
export class Mapa implements AfterViewInit {

  @ViewChild('mapContainer', { static: false })
  mapElement!: ElementRef<HTMLDivElement>;

  private auth = inject(AuthService);
  private lugaresService = inject(LugaresService);
  private cdr = inject(ChangeDetectorRef);

  map!: google.maps.Map;
  markers: google.maps.marker.AdvancedMarkerElement[] = [];
  locations: Lugar[] = [];

  isAdmin = this.auth.userRole() === 'admin';

  showModal = false;
  editando: Lugar | null = null;
  guardando = false;
  imagenPreview: string | null = null;
  imagenFile: File | null = null;

  showConfirmModal = false;
  lugarAConfirmar: Lugar | null = null;
  accionConfirmar: 'desactivar' | 'activar' = 'desactivar';

  categoriaActiva = 'todos';

  readonly tabs = [
    { key: 'todos',      label: 'Todos',        icon: 'layout-grid' },
    { key: 'kiosko',     label: 'Kioskos',       icon: 'trophy' },
    { key: 'restaurant', label: 'Restaurantes',  icon: 'utensils' },
    { key: 'attraction', label: 'Atracciones',   icon: 'map-pin' },
    { key: 'museum',     label: 'Museos',        icon: 'library' },
    { key: 'transport',  label: 'Transporte',    icon: 'bus' },
  ];

  form: Omit<Lugar, 'id'> = {
    nombre: '',
    descripcion: '',
    categoria: 'kiosko',
    latitud: 0,
    longitud: 0,
    imagen_url: '',
  };

  private readonly ordenCategorias: Record<string, number> = {
    kiosko: 0,
    attraction: 1,
    restaurant: 2,
    museum: 3,
    transport: 4,
  };

  get locationsFiltradas(): Lugar[] {
    const lista = this.categoriaActiva === 'todos'
      ? this.locations
      : this.locations.filter(l => l.categoria === this.categoriaActiva);

    return [...lista].sort((a, b) =>
      (this.ordenCategorias[a.categoria] ?? 99) - (this.ordenCategorias[b.categoria] ?? 99)
    );
  }

  cambiarTab(key: string) {
    this.categoriaActiva = key;
    this.cdr.markForCheck();
  }

  async ngAfterViewInit() {
    const obs = this.isAdmin
      ? this.lugaresService.obtenerTodosLugares()
      : this.lugaresService.obtenerLugares();

    obs.subscribe({
      next: async ({ lugares }) => {
        this.locations = lugares;
        this.cdr.markForCheck();
        try {
          const { Map } = await importLibrary('maps') as google.maps.MapsLibrary;
          const { AdvancedMarkerElement, PinElement } = await importLibrary('marker') as google.maps.MarkerLibrary;
          this.map = new Map(this.mapElement.nativeElement, {
            center: { lat: 25.6714, lng: -100.3097 },
            zoom: 14,
            mapId: 'DEMO_MAP_ID',
            disableDefaultUI: true
          });
          this.addMarkers(AdvancedMarkerElement, PinElement);
        } catch (error) {
          console.error('Error al inicializar el mapa:', error);
        }
      },
      error: (err) => console.error('Error:', err)
    });
  }

  addMarkers(
    AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement,
    PinElement: typeof google.maps.marker.PinElement
  ) {
    const infoWindow = new google.maps.InfoWindow();

    this.locations.forEach(loc => {
      const pin = new PinElement({
        background: loc.categoria === 'museum'     ? '#7c3aed' :
                    loc.categoria === 'kiosko'     ? '#fb923c' :
                    loc.categoria === 'restaurant' ? '#fbbf24' :
                    loc.categoria === 'attraction' ? '#10b981' :
                    '#3b82f6',
        glyphColor: '#ffffff',
        borderColor: loc.activo === false ? '#ef4444' : '#ffffff',
      });

      const marker = new AdvancedMarkerElement({
        map: this.map,
        position: { lat: Number(loc.latitud), lng: Number(loc.longitud) },
        title: loc.nombre,
        content: pin
      });

      marker.addListener('gmp-click', () => {
        const categoriaColor: Record<string, string> = {
          kiosko:     '#fb923c',
          restaurant: '#fbbf24',
          attraction: '#10b981',
          museum:     '#7c3aed',
          transport:  '#3b82f6',
        };
        const categoriaLabel: Record<string, string> = {
          kiosko:     'Kiosko',
          restaurant: 'Restaurante',
          attraction: 'Atracción',
          museum:     'Museo',
          transport:  'Transporte',
        };

        const color = categoriaColor[loc.categoria] ?? '#64748b';
        const label = categoriaLabel[loc.categoria] ?? loc.categoria;

        const imgHtml = loc.imagen_url
          ? `<img src="${loc.imagen_url}" alt="${loc.nombre}"
                 style="width:100%;height:140px;object-fit:cover;border-radius:10px 10px 0 0;display:block;" />`
          : '';

        const inactivoBadge = loc.activo === false
          ? `<span style="background:#fee2e2;color:#ef4444;font-size:10px;font-weight:700;
                          padding:2px 8px;border-radius:99px;border:1px solid #fca5a5;">
               Inactivo
             </span>`
          : '';

        infoWindow.setContent(`
          <div style="width:240px;font-family:'Inter',sans-serif;border-radius:12px;overflow:hidden;margin:-12px -12px -12px -12px;">
            ${imgHtml}
            <div style="padding:12px 14px 14px;">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                <span style="background:${color}22;color:${color};font-size:10px;font-weight:700;
                              padding:2px 8px;border-radius:99px;text-transform:uppercase;letter-spacing:.5px;">
                  ${label}
                </span>
                ${inactivoBadge}
              </div>
              <div style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:4px;line-height:1.3;">
                ${loc.nombre}
              </div>
              <div style="font-size:12px;color:#64748b;line-height:1.5;">
                ${loc.descripcion}
              </div>
            </div>
          </div>
        `);
        infoWindow.open({ anchor: marker, map: this.map });
      });

      this.markers.push(marker);
    });
  }

  focusLocation(loc: Lugar) {
    if (!this.map) return;
    this.map.panTo({ lat: Number(loc.latitud), lng: Number(loc.longitud) });
    this.map.setZoom(17);
  }

  getIconName(categoria: string): string {
    switch (categoria) {
      case 'museum':     return 'library';
      case 'kiosko':     return 'trophy';
      case 'restaurant': return 'utensils';
      case 'transport':  return 'bus';
      case 'attraction': return 'map-pin';
      default:           return 'info';
    }
  }

  abrirModalNuevo() {
    this.editando = null;
    this.imagenPreview = null;
    this.imagenFile = null;
    this.form = { nombre: '', descripcion: '', categoria: 'kiosko', latitud: 0, longitud: 0, imagen_url: '' };
    this.showModal = true;
    this.cdr.markForCheck();
  }

  abrirModalEditar(loc: Lugar, event: Event) {
    event.stopPropagation();
    this.editando = loc;
    this.imagenPreview = loc.imagen_url || null;
    this.imagenFile = null;
    this.form = {
      nombre: loc.nombre,
      descripcion: loc.descripcion,
      categoria: loc.categoria,
      latitud: loc.latitud,
      longitud: loc.longitud,
      imagen_url: loc.imagen_url
    };
    this.showModal = true;
    this.cdr.markForCheck();
  }

  cerrarModal() {
    this.showModal = false;
    this.editando = null;
    this.cdr.markForCheck();
  }

  onImagenSeleccionada(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.imagenFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagenPreview = reader.result as string;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  guardar() {
    this.guardando = true;
    const imagen = this.imagenFile ?? undefined;

    const op = this.editando
      ? this.lugaresService.editarLugar(this.editando.id, this.form, imagen)
      : this.lugaresService.crearLugar(this.form, imagen);

    op.subscribe({
      next: ({ lugar }) => {
        if (this.editando) {
          const i = this.locations.findIndex(l => l.id === this.editando!.id);
          if (i !== -1) this.locations[i] = lugar;
        } else {
          this.locations = [...this.locations, lugar];
        }
        this.guardando = false;
        this.cerrarModal();
      },
      error: () => {
        this.guardando = false;
        this.cdr.markForCheck();
      }
    });
  }

  abrirConfirm(loc: Lugar, accion: 'desactivar' | 'activar', event: Event) {
    event.stopPropagation();
    this.lugarAConfirmar = loc;
    this.accionConfirmar = accion;
    this.showConfirmModal = true;
    this.cdr.markForCheck();
  }

  cerrarConfirm() {
    this.showConfirmModal = false;
    this.lugarAConfirmar = null;
    this.cdr.markForCheck();
  }

  confirmarAccion() {
    if (!this.lugarAConfirmar) return;
    const loc = this.lugarAConfirmar;
    if (this.accionConfirmar === 'desactivar') {
      this.lugaresService.desactivarLugar(loc.id).subscribe(() => {
        const i = this.locations.findIndex(l => l.id === loc.id);
        if (i !== -1) this.locations[i] = { ...this.locations[i], activo: false };
        this.locations = [...this.locations];
        this.cerrarConfirm();
      });
    } else {
      this.lugaresService.activarLugar(loc.id).subscribe(() => {
        const i = this.locations.findIndex(l => l.id === loc.id);
        if (i !== -1) this.locations[i] = { ...this.locations[i], activo: true };
        this.locations = [...this.locations];
        this.cerrarConfirm();
      });
    }
  }
}