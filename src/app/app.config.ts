import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { Map, LayoutDashboard, LogOut, Menu, QrCode, Trophy, X, LucideAngularModule, Mail, User, ChevronRight, Lock} from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withViewTransitions()),
    importProvidersFrom(
      LucideAngularModule.pick({ 
        Mail, Lock, User, ChevronRight,
        Map, Trophy, QrCode, LayoutDashboard, Menu, X, LogOut })
    )
  ]
};
