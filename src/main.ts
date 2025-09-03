import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)), provideFirebaseApp(() => initializeApp({ projectId: "escuela-mx", appId: "1:913432788471:web:439bd307de5889e5ec02f2", storageBucket: "escuela-mx.firebasestorage.app", apiKey: "AIzaSyCbb5XIbL6lWA98J2uhfguoDvwxgfiYbJo", authDomain: "escuela-mx.firebaseapp.com", messagingSenderId: "913432788471" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()),
  ],
});
