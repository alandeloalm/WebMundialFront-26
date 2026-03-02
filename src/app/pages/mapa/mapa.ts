import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { importLibrary } from '@googlemaps/js-api-loader';
import { LucideAngularModule } from 'lucide-angular';

interface MapLocation {
  id: number;
  name: string;
  description: string;
  type: 'kiosk' | 'restaurant' | 'transport' | 'attraction' | 'museum';
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './mapa.html',
  styleUrl: './mapa.css',
})
export class Mapa implements AfterViewInit {

  @ViewChild('mapContainer', { static: false })
  mapElement!: ElementRef<HTMLDivElement>;

  map!: google.maps.Map;
  markers: google.maps.marker.AdvancedMarkerElement[] = [];

  locations: MapLocation[] = [
    { id: 1, name: "Fashion Drive", description: "El centro comercial más exclusivo de San Pedro Garza García. Es un referente de la modernidad regia, albergando las firmas de moda más prestigiosas del mundo, una amplia oferta cinematográfica y una terraza gastronómica con vistas de primer nivel.", type: "kiosk", lat: 25.6511, lng: -100.33482 },
    { id: 2, name: "Parque Fundidora", description: "Un museo de sitio arqueológico industrial único en su tipo. Este vasto parque urbano ocupa los terrenos de lo que fue la primera siderúrgica de América Latina, combinando historia industrial con amplias áreas verdes, pistas de patinaje y centros culturales.", type: "kiosk", lat: 25.67702, lng: -100.28997 },
    { id: 3, name: "Barrio Antiguo", description: "El corazón histórico y bohemio de Monterrey. Alberga casonas coloniales del siglo XVIII, galerías de arte y una vibrante oferta gastronómica que fusiona la tradición con la modernidad.", type: "kiosk", lat: 25.6694, lng: -100.3064 },
    { id: 4, name: "Estadio BBVA", description: 'Conocido como "El Gigante de Acero", es uno de los estadios más modernos de Latinoamérica y sede oficial de la Copa del Mundo 2026. Destaca por su arquitectura vanguardista y la impresionante vista que ofrece hacia el Cerro de la Silla desde las tribunas.', type: "kiosk", lat: 25.66905, lng: -100.24389 },
    { id: 5, name: "El Rey del Cabrito", description: "Institución gastronómica de Monterrey famosa por su preparación del cabrito al pastor sobre brasas de carbón. Sus paredes están decoradas con trofeos y fotografías de celebridades, ofreciendo una experiencia visual y culinaria profundamente arraigada en la tradición del norte.", type: "restaurant", lat: 25.6639, lng: -100.30892 },
    { id: 6, name: "El Gaucho", description: "Restaurante de gran tradición especializado en cortes de carne al estilo argentino-regio. Con décadas de historia, es reconocido por la consistencia en su calidad, sus famosas empanadas y un servicio que transporta a los comensales a la época dorada de los asados familiares.", type: "restaurant", lat: 25.64192, lng: -100.28699 },
    { id: 7, name: "La Nacional", description: "Restaurante de cocina regional que rinde homenaje a los ingredientes locales con un toque sofisticado. Sus cortes de carne premium, fideos secos con chorizo y su atmósfera acogedora lo convierten en el lugar ideal para entender la pasión regia por la buena mesa.", type: "restaurant", lat: 25.67418, lng: -100.36622 },
    { id: 8, name: "Pangea", description: "Un icono de la alta cocina mexicana contemporánea. El menú, diseñado con técnicas francesas aplicadas a productos locales, ha colocado a este establecimiento de forma consistente en las listas de los mejores restaurantes del mundo, elevando el estándar culinario de la región.", type: "restaurant", lat: 25.64792, lng: -100.3561 },
    { id: 9, name: "Estadio Universitario (Tigres)", description: `Hogar de los Tigres de la UANL y epicentro de la pasión futbolera en Monterrey. Conocido como "El Volcán" por el fervor de su afición, es un sitio legendario donde el deporte se vive con una intensidad única en todo el país.`, type: "attraction", lat: 25.74377, lng: -100.30112 },
    { id: 10, name: "Paseo Santa Lucía", description: "Un río artificial de 2.5 kilómetros que serpentea entre fuentes, puentes y áreas verdes. Es el paseo turístico por excelencia, ofreciendo recorridos en embarcaciones que conectan la vida urbana del centro con la historia industrial de Fundidora.", type: "attraction", lat: 25.67522, lng: -100.28775 },
    { id: 11, name: "Mirador del Obispado", description: "Situado en el punto más alto del Cerro del Obispado, es el hogar de una de las banderas monumentales más grandes del país. Ofrece la mejor perspectiva fotográfica de la ciudad, rodeada por las montañas que definen el paisaje regio.", type: "attraction", lat: 25.67458, lng: -100.34649 },
    { id: 12, name: "Cascada Cola de Caballo", description: "Una espectacular caída de agua de 25 metros cuya forma emula la cola de un caballo. Ubicada en el pintoresco municipio de Santiago, es un refugio natural que ofrece frescura, vegetación exuberante y una conexión inmediata con la Sierra Madre.", type: "attraction", lat: 25.37102, lng: -100.15576 },
    { id: 13, name: "Museo MARCO", description: "Referente del arte contemporáneo en México, diseñado por Ricardo Legorreta. Su famosa escultura de 'La Paloma' es el punto de encuentro por excelencia en la Macroplaza.", type: "museum", lat: 25.66526, lng: -100.31021 },
    { id: 14, name: "MUNE (Museo del Noreste)", description: "Un viaje a través del tiempo que relata la historia de Nuevo León, Coahuila, Tamaulipas y Texas. Destaca por su arquitectura moderna unida al Paseo Santa Lucía.", type: "museum", lat: 25.67178, lng: -100.30642 },
    { id: 15, name: "Horno 3 (Museo del Acero)", description: "Antiguo horno industrial transformado en un centro de ciencia y tecnología. Ofrece un espectáculo de fuego y la oportunidad de caminar por las estructuras originales de la fundidora.", type: "museum", lat: 25.6786, lng: -100.2842 },
    { id: 16, name: "Museo de Historia Mexicana", description: "El recinto histórico más importante del norte de México. Exhibe desde piezas prehispánicas hasta objetos del siglo XX, narrando la evolución de la nación.", type: "museum", lat: 25.67167, lng: -100.30645 },
  ];

  async ngAfterViewInit() {
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
      console.error("Error al inicializar el mapa:", error);
    }
  }

  addMarkers(
    AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement,
    PinElement: typeof google.maps.marker.PinElement
  ) {
    const infoWindow = new google.maps.InfoWindow();

    this.locations.forEach(loc => {
      const pin = new PinElement({
        background: loc.type === 'museum' ? '#7c3aed' : // Violeta para museos
                    loc.type === 'kiosk' ? '#fb923c' :
                    loc.type === 'restaurant' ? '#fbbf24' :
                    '#3b82f6',
        glyphColor: '#ffffff',
        borderColor: '#ffffff'
      });

      const marker = new AdvancedMarkerElement({
        map: this.map,
        position: { lat: loc.lat, lng: loc.lng },
        title: loc.name,
        content: pin // ✅ SE PASA EL OBJETO DIRECTO (Corrige el error de tu imagen)
      });

      marker.addListener('gmp-click', () => {
        infoWindow.setContent(`
          <div style="padding:8px; color:#333; font-family:sans-serif;">
            <b style="font-size:14px;">${loc.name}</b><br>
            <span style="font-size:12px;">${loc.description}</span>
          </div>
        `);
        infoWindow.open({ anchor: marker, map: this.map });
      });

      this.markers.push(marker);
    });
  }

  focusLocation(loc: MapLocation) {
    if (!this.map) return;
    this.map.panTo({ lat: loc.lat, lng: loc.lng });
    this.map.setZoom(17);
  }

  getIconName(type: string): string {
    switch(type) {
      case 'museum': return 'library';
      case 'kiosk': return 'trophy';
      case 'restaurant': return 'utensils';
      case 'transport': return 'bus'; 
      case 'attraction': return 'map-pin';
      default: return 'info';
    }
  }
}