import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ExperienciasService, VideoExperience } from '../../core/services/experiencias.service';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-experiencias',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './experiencias.html',
  styleUrl: './experiencias.css',
})
export class Experiencias implements OnInit {
  private _qrCanvas!: ElementRef<HTMLCanvasElement>;
  private qrGenerado = false;

  @ViewChild('qrCanvas') set qrCanvas(el: ElementRef<HTMLCanvasElement>) {
    if (el && this.qrData && !this.qrGenerado) {
      this._qrCanvas = el;
      this.generarQR();
    }
  }

  qrData: string | null = null;
  cargandoQR = true;
  errorQR = false;

  videos: VideoExperience[] = [];
  cargandoVideos = true;

  videoSeleccionado: VideoExperience | null = null;

  constructor(
    private experienciasService: ExperienciasService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.experienciasService.obtenerQR().subscribe({
      next: (res) => {
        this.qrData = res.qr_data;
        this.cargandoQR = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoQR = false;
        this.errorQR = true;
        this.cdr.detectChanges();
      },
    });

    this.experienciasService.obtenerVideos().subscribe({
      next: (res) => {
        this.videos = res.videos;
        this.cargandoVideos = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoVideos = false;
        this.cdr.detectChanges();
      },
    });
  }

  generarQR(): void {
    if (!this._qrCanvas?.nativeElement || !this.qrData) return;
    QRCode.toCanvas(this._qrCanvas.nativeElement, this.qrData, {
      width: 160,
      margin: 1,
    }, (error: Error | null | undefined) => {
      if (error) {
        this.errorQR = true;
      } else {
        this.qrGenerado = true;
      }
      this.cdr.detectChanges();
    });
  }

  cloudinaryThumbnail(videoUrl: string): string {
    if (!videoUrl || !videoUrl.includes('cloudinary.com')) return '';
    return videoUrl
      .replace('/video/upload/', '/video/upload/so_1,q_auto,f_jpg/')
      .replace(/\.(mp4|webm|mov|avi)$/i, '.jpg');
  }

  abrirVideo(video: VideoExperience): void {
    this.videoSeleccionado = video;
  }

  cerrarVideo(): void {
    this.videoSeleccionado = null;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'Sin fecha';
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return 'Sin fecha';
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}