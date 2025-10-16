import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  arrayUnion,
  doc,
  Firestore,
  serverTimestamp,
  setDoc
} from '@angular/fire/firestore';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { Platform } from '@ionic/angular/standalone';
import { environment } from '../../environments/environment';


@Injectable({providedIn: 'root'})
export class NotificationService {

  private currentToken: string | null = null;

  constructor(
    private messaging: Messaging,
    private platform: Platform,
    private firestore: Firestore,
    private auth: Auth
  ) {
    // Escuchar mensajes cuando la app está abierta
    this.listenToForegroundMessages();
  }

  /**
   * Verifica si las notificaciones están soportadas
   */
  isNotificationSupported(): boolean {
    return (
      'Notification' in window &&
      'serviceWorker' in navigator &&
      !this.platform.is('capacitor')
    );
  }

  /**
   * Obtiene el estado actual del permiso de notificaciones
   */
  getPermissionStatus(): NotificationPermission {
    if (!this.isNotificationSupported()) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Solicita permiso y obtiene el token FCM
   */
  async requestPermission(): Promise<string | null> {
    try {
      if (!this.isNotificationSupported()) {
        console.log('Las notificaciones no están soportadas en este dispositivo');
        return null;
      }

      // Solicitar permiso
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        console.log('Permiso de notificaciones denegado');
        return null;
      }

      console.log('Permiso de notificaciones concedido');

      // Esperar a que el service worker esté listo
      await this.waitForServiceWorker();

      // Obtener el token FCM
      const token = await getToken(this.messaging, {
        vapidKey: environment.vapidKey,
        serviceWorkerRegistration: await navigator.serviceWorker.ready
      });

      if (token) {
        console.log('✅ Token FCM obtenido:', token);
        this.currentToken = token;

        // Guardar el token en Firestore
        await this.saveTokenToFirestore(token);

        return token;
      }

      console.log('❌ No se pudo obtener el token FCM');
      return null;

    } catch (error) {
      console.error('❌ Error al solicitar permiso de notificaciones:', error);
      return null;
    }
  }

  /**
   * Espera a que el service worker esté registrado
   */
  private async waitForServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        console.log('✅ Service Worker listo:', registration);
      } catch (error) {
        console.error('❌ Error esperando Service Worker:', error);
      }
    }
  }

  /**
   * Guarda el token en Firestore asociado al usuario actual
   */
  private async saveTokenToFirestore(token: string): Promise<void> {
    try {
      const userId = this.auth.currentUser?.uid;

      if (!userId) {
        console.log('⚠️ No hay usuario autenticado, no se puede guardar el token');
        return;
      }

      const userRef = doc(this.firestore, `usuarios/${userId}`);

      await setDoc(userRef,
        {
          tokens: arrayUnion(token),
          lastTokenUpdate: serverTimestamp(),
          platform: this.getPlatformInfo(),
          userAgent: navigator.userAgent
        },
        {
          merge: true
        }
      );

      console.log('✅ Token guardado en Firestore para el usuario:', userId);
    } catch (error) {
      console.error('❌ Error al guardar token en Firestore:', error);
    }
  }

  /**
   * Escucha mensajes en primer plano (app abierta)
   */
  private listenToForegroundMessages(): void {
    if (!this.isNotificationSupported()) {
      return;
    }

    onMessage(this.messaging, (payload) => {
      console.log('📬 Mensaje recibido en primer plano:', payload);

      // Mostrar notificación del navegador
      this.showForegroundNotification(payload);
    });
  }

  /**
   * Muestra una notificación cuando la app está activa
   */
  private showForegroundNotification(payload: any): void {
    const title = payload.notification?.title || 'Escuela';

    const options: NotificationOptions = {
      body: payload.notification?.body || '',
      icon: payload.notification?.icon || '/assets/icons/icon-192x192.png',
      badge: '/assets/icons/icon-72x72.png',
      tag: payload.data?.tag || 'notification-' + Date.now(),
      data: payload.data,
      requireInteraction: false
    };

    if (Notification.permission === 'granted') {
      const notification = new Notification(title, options);

      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();

        // Manejar navegación si hay una ruta en los datos
        if (payload.data?.route) {
          window.location.href = payload.data.route;
        }
      };
    }
  }

  /**
   * Elimina el token cuando el usuario cierra sesión
   */
  async deleteToken(): Promise<void> {
    try {
      if (this.currentToken && this.auth.currentUser) {
        const userId = this.auth.currentUser.uid;
        const userRef = doc(this.firestore, `usuarios/${userId}`);

        // Remover el token del array
        await setDoc(userRef,
          {
            tokens: [],
            lastTokenUpdate: serverTimestamp()
          },
          {
            merge: true
          }
        );

        this.currentToken = null;
        console.log('✅ Token eliminado de Firestore');
      }
    } catch (error) {
      console.error('❌ Error al eliminar token:', error);
    }
  }

  /**
   * Obtiene información de la plataforma
   */
  private getPlatformInfo(): string {
    const platforms = this.platform.platforms();
    return platforms.join(', ');
  }

  /**
   * Obtiene el token actual sin solicitar permiso
   */
  getCurrentToken(): string | null {
    return this.currentToken;
  }

  /**
   * Verifica si el usuario ya tiene permiso concedido
   */
  hasPermission(): boolean {
    return this.getPermissionStatus() === 'granted';
  }
}
