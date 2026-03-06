// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { 
  Map, LayoutDashboard, LogOut, Menu, QrCode, Trophy, X, 
  LucideAngularModule, Mail, User, ChevronRight, Lock, 
  Globe, Calendar, Phone, Activity, Users, BarChart3,
  MapPin, Bus, Utensils, Library, Play, Tag, Gift,
  ChevronDown, Copy, Clock, ShieldCheck, CircleAlert, LoaderCircle,
  Eye, EyeOff
} from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([authInterceptor])),

    importProvidersFrom(
      LucideAngularModule.pick({ 
        Mail, Lock, User, ChevronRight, Globe, Calendar, Phone,
        Map, Trophy, QrCode, LayoutDashboard, Menu, X, LogOut,
        Users, Activity, BarChart3, MapPin, Bus, Utensils, Library,
        Play, Tag, Gift, ChevronDown, Copy, Clock, ShieldCheck,
        CircleAlert, LoaderCircle, Eye, EyeOff
      })
    )
  ]
};