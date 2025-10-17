/* eslint-disable max-len */
/* eslint-disable quotes */

import {onDocumentCreated} from 'firebase-functions/v2/firestore';
import {initializeApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {getMessaging} from 'firebase-admin/messaging';

// Inicializar Firebase Admin
initializeApp();

/**
 * Cloud Function que se ejecuta cuando se crea un nuevo usuario
 * Envía notificación al administrador
 */
export const onNewUserRegistered = onDocumentCreated('usuarios/{userId}',
  async (event) => {
    const snapshot = event.data;

    if (!snapshot) {
      console.log('No hay datos en el snapshot');
      return;
    }

    const userId = event.params.userId;
    const newUser = snapshot.data();

    console.log(`✅ Nuevo ${newUser.rol} registrado: ${newUser.email}`);

    if (newUser.rol !== 'maestro') {
      return;
    }

    try {
      const db = getFirestore();

      // 1. Buscar al administrador
      const adminSnapshot = await db
        .collection('usuarios')
        .where('rol', '==', 'administrador')
        .get();

      if (adminSnapshot.empty) {
        console.log('⚠️ No se encontró ningún administrador');
        return;
      }

      // 2. Obtener tokens FCM de todos los administradores
      const adminTokens: string[] = [];

      adminSnapshot.forEach((adminDoc) => {
        const adminData = adminDoc.data();
        const tokens = adminData.tokens || [];
        adminTokens.push(...tokens);
      });

      if (adminTokens.length === 0) {
        console.log('⚠️ El administrador no tiene tokens FCM');
        return;
      }

      console.log(`📱 Enviando notificación a ${adminTokens.length} dispositivos`);

      // 3. Preparar el mensaje
      const message = {
        notification: {
          title: 'Nuevo Usuario:',
          body: `Se registró un usuario con el correo: ${newUser.email}`,
        },
        data: {
          type: 'new_user',
          userId: userId,
          userEmail: newUser.email || '',
          userRole: newUser.rol || '',
          route: '/admin-dashboard',
        },
        tokens: adminTokens,
        webpush: {
          notification: {
            icon: 'https://escuela-170825.web.app/assets/icons/icon-192x192.png',
            badge: 'https://escuela-170825.web.app/assets/icons/icon-32x32.png',
          },
        },
      };

      // 4. Enviar notificación a todos los dispositivos del admin
      const messaging = getMessaging();
      const response = await messaging.sendEachForMulticast(message);

      console.log(`✅ Notificaciones enviadas: ${response.successCount} exitosas, ${response.failureCount} fallidas`);

      // 5. Limpiar tokens inválidos
      if (response.failureCount > 0) {
        const tokensToRemove: string[] = [];

        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.error(
              `❌ Error en token ${adminTokens[idx]}:`,
              resp.error?.code
            );

            // Si el token es inválido, marcarlo para eliminación
            if (
              resp.error?.code === 'messaging/invalid-registration-token' ||
              resp.error?.code === 'messaging/registration-token-not-registered'
            ) {
              tokensToRemove.push(adminTokens[idx]);
            }
          }
        });

        // Eliminar tokens inválidos de Firestore
        if (tokensToRemove.length > 0) {
          console.log(`🧹 Limpiando ${tokensToRemove.length} tokens inválidos`);

          adminSnapshot.forEach(async (adminDoc) => {
            const adminData = adminDoc.data();
            const currentTokens = adminData.tokens || [];
            const cleanedTokens = currentTokens.filter(
              (token: string) => !tokensToRemove.includes(token)
            );

            await adminDoc.ref.update({
              tokens: cleanedTokens,
            });
          });
        }
      }

      return {
        success: true,
        sent: response.successCount,
        failed: response.failureCount,
      };
    } catch (error) {
      console.error('❌ Error enviando notificación:', error);
      throw error;
    }
  }
);
