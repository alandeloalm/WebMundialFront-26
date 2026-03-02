import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

interface VideoExperience {
  id: number;
  kiosk: string;
  location: string;
  date: string;
  thumbnail: string | null;
}

@Component({
  selector: 'app-experiencias',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './experiencias.html',
  styleUrl: './experiencias.css',
})
export class Experiencias {
  videos: VideoExperience[] = [
    {
      id: 1,
      kiosk: "Kiosco Barrio Antiguo",
      location: "Barrio Antiguo",
      date: "15 Jun 2026",
      thumbnail: null,
    },
    {
      id: 2,
      kiosk: "Kiosco Macroplaza",
      location: "Macroplaza",
      date: "16 Jun 2026",
      thumbnail: null,
    },
  ];

  qrDots = Array.from({ length: 36 }).map(() => Math.random() > 0.5);
}