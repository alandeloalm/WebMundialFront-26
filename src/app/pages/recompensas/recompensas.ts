import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

interface Coupon {
  id: number;
  store: string;
  discount: string;
  image: string;
  code: string;
  description: string;
  terms: string[];
  validFrom: string;
  validUntil: string;
  category: string;
}

@Component({
  selector: 'app-recompensas',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './recompensas.html',
  styleUrl: './recompensas.css',
})
export class Recompensas {
  INITIAL_COUNT = 8;
  visibleCount = this.INITIAL_COUNT;
  selectedCoupon: Coupon | null = null;
  copied = false;

  completedCount = 2;
  totalKiosks = 4;
  progress = (this.completedCount / this.totalKiosks) * 100;

  coupons: Coupon[] = [
    {
      id: 1, store: "Oxxo", discount: "20% en bebidas frías", image: "/placeholder.svg",
      code: "MUNDIAL-OXXO20", category: "Conveniencia",
      description: "Disfruta de un 20% de descuento en todas las bebidas frías disponibles en tu Oxxo más cercano. Válido en refrescos, aguas, jugos y cervezas seleccionadas.",
      terms: ["Válido una sola vez por usuario", "No acumulable con otras promociones", "Solo en tiendas participantes de Monterrey"],
      validFrom: "1 Mar 2026", validUntil: "30 Jun 2026",
    },
    {
      id: 2, store: "Starbucks", discount: "2x1 en Frappuccinos", image: "/placeholder.svg",
      code: "MUNDIAL-SBUX2X1", category: "Cafetería",
      description: "Lleva dos Frappuccinos de cualquier tamaño y sabor por el precio de uno. Perfecto para compartir mientras disfrutas los partidos.",
      terms: ["Válido de lunes a viernes", "No válido en delivery", "Aplica en cualquier tamaño"],
      validFrom: "1 Mar 2026", validUntil: "15 Jul 2026",
    },
    {
      id: 3, store: "Liverpool", discount: "15% en ropa deportiva", image: "/placeholder.svg",
      code: "MUNDIAL-LIV15", category: "Moda",
      description: "Obtén un 15% de descuento en toda la sección de ropa deportiva. Incluye marcas como Nike, Adidas, Puma y Under Armour.",
      terms: ["Mínimo de compra $500 MXN", "No aplica en artículos ya rebajados", "Válido en tienda física y en línea"],
      validFrom: "1 Mar 2026", validUntil: "31 May 2026",
    },
    {
      id: 4, store: "Cinépolis", discount: "Combo gratis en tu entrada", image: "/placeholder.svg",
      code: "MUNDIAL-CINE", category: "Entretenimiento",
      description: "Recibe un combo de palomitas medianas y refresco gratis con la compra de cualquier boleto de cine. Disfruta las transmisiones en pantalla grande.",
      terms: ["Solo en funciones de pantallas mundialistas", "No acumulable", "Sujeto a disponibilidad"],
      validFrom: "1 Mar 2026", validUntil: "19 Jul 2026",
    },
    {
      id: 5, store: "Uber Eats", discount: "$100 de descuento", image: "/placeholder.svg",
      code: "MUNDIAL-UBER100", category: "Delivery",
      description: "Obtén $100 pesos de descuento en tu próximo pedido de Uber Eats. Ideal para pedir comida mientras ves los partidos desde casa.",
      terms: ["Pedido mínimo de $250 MXN", "Válido una vez por cuenta", "Solo en Monterrey"],
      validFrom: "1 Mar 2026", validUntil: "30 Jun 2026",
    },
    {
      id: 6, store: "Nike", discount: "30% en jerseys mundialistas", image: "/placeholder.svg",
      code: "MUNDIAL-NIKE30", category: "Moda",
      description: "30% de descuento en todos los jerseys oficiales del Mundial 2026. Consigue el de tu selección favorita a un precio increíble.",
      terms: ["Máximo 2 jerseys por persona", "Solo en Nike Store Monterrey", "Mientras duren existencias"],
      validFrom: "15 Mar 2026", validUntil: "19 Jul 2026",
    },
    {
      id: 7, store: "Domino's", discount: "Pizza mediana gratis", image: "/placeholder.svg",
      code: "MUNDIAL-PIZZA", category: "Comida",
      description: "Recibe una pizza mediana de un ingrediente gratis en la compra de cualquier pizza grande. ¡La mejor para los partidos!",
      terms: ["Solo a domicilio", "No válido con otras promociones", "Ingredientes extra tienen costo adicional"],
      validFrom: "1 Mar 2026", validUntil: "30 Jun 2026",
    },
    {
      id: 8, store: "Amazon", discount: "Envío gratis todo el mes", image: "/placeholder.svg",
      code: "MUNDIAL-AMZFREE", category: "E-commerce",
      description: "Envío gratis en todos tus pedidos de Amazon durante un mes completo, sin mínimo de compra. Aplica en productos enviados por Amazon.",
      terms: ["Solo productos vendidos por Amazon México", "No aplica en productos de terceros con envío propio", "Activación única"],
      validFrom: "1 Mar 2026", validUntil: "31 Jul 2026",
    },
    {
      id: 9, store: "Coca-Cola", discount: "Botella edición Mundial gratis", image: "/placeholder.svg",
      code: "MUNDIAL-COKE", category: "Bebidas",
      description: "Canjea una botella coleccionable edición especial del Mundial 2026 de Coca-Cola totalmente gratis en puntos de canje autorizados.",
      terms: ["Sujeto a disponibilidad", "Un canje por persona", "Solo en puntos de canje oficiales"],
      validFrom: "1 Abr 2026", validUntil: "19 Jul 2026",
    },
    {
      id: 10, store: "Adidas", discount: "25% en balones oficiales", image: "/placeholder.svg",
      code: "MUNDIAL-BALL25", category: "Deportes",
      description: "25% de descuento en balones oficiales del Mundial 2026. Incluye el balón de réplica y el modelo profesional de partido.",
      terms: ["Máximo 3 balones por persona", "Solo en Adidas Store y adidas.com.mx", "No acumulable"],
      validFrom: "1 Mar 2026", validUntil: "19 Jul 2026",
    },
    {
      id: 11, store: "Rappi", discount: "$80 de descuento en tu pedido", image: "/placeholder.svg",
      code: "MUNDIAL-RAPPI80", category: "Delivery",
      description: "Aplica $80 pesos de descuento en tu próximo pedido de Rappi. Válido en restaurantes, supermercados y farmacias.",
      terms: ["Pedido mínimo de $200 MXN", "Una vez por usuario", "Solo en zona metropolitana de Monterrey"],
      validFrom: "1 Mar 2026", validUntil: "30 Jun 2026",
    },
    {
      id: 12, store: "7-Eleven", discount: "Café gratis en la mañana", image: "/placeholder.svg",
      code: "MUNDIAL-7CAFE", category: "Conveniencia",
      description: "Recibe un café de cualquier tamaño totalmente gratis antes de las 11:00 AM. El mejor inicio de un día mundialista.",
      terms: ["Válido solo antes de las 11:00 AM", "Un café por día", "Solo en sucursales de Monterrey"],
      validFrom: "1 Mar 2026", validUntil: "19 Jul 2026",
    },
  ];

  get visibleCoupons() {
    return this.coupons.slice(0, this.visibleCount);
  }

  get hasMore() {
    return this.visibleCount < this.coupons.length;
  }

  showMore() {
    this.visibleCount += 8;
  }

  openCoupon(coupon: Coupon) {
    this.selectedCoupon = coupon;
    this.copied = false;
  }

  closeModal() {
    this.selectedCoupon = null;
  }

  async handleCopyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      this.copied = true;
      // Nota: Si usas una librería de toasts como 'ngx-sonner', llámala aquí
      setTimeout(() => (this.copied = false), 2000);
    } catch (err) {
      console.error('Error al copiar', err);
    }
  }
}