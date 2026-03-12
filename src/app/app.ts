import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './features/footer/footer';
import { Navbar } from './features/navbar/navbar';
import { NgxSonnerToaster } from 'ngx-sonner';
import { Chatbot } from './features/chatbot/chatbot';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, NgxSonnerToaster, Chatbot],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('WebMundial26');
}
