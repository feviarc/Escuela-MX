/* eslint-disable max-len */
/* eslint-disable quotes */

import {onDocumentCreated} from 'firebase-functions/v2/firestore';
import {initializeApp} from 'firebase-admin/app';
import {getFirestore, FieldValue} from 'firebase-admin/firestore';
import {getMessaging} from 'firebase-admin/messaging';

// Inicializar Firebase Admin
initializeApp();

/**
 * Cloud Function que se ejecuta cuando se crea un nuevo usuario
 * Envía notificación al administrador y guarda registro en Firestore
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
      const adminIds: string[] = [];

      adminSnapshot.forEach((adminDoc) => {
        const adminData = adminDoc.data();
        const tokens = adminData.tokens || [];
        adminTokens.push(...tokens);
        adminIds.push(adminDoc.id);
      });

      // 3. Crear el contenido de la notificación
      const notificationBody = `Se registró un usuario con el correo: ${newUser.email}`;
      const timestamp = FieldValue.serverTimestamp();

      // 4. Guardar notificación en Firestore para cada administrador
      const notificationPromises = adminIds.map(async (adminId) => {
        await db
          .collection('usuarios')
          .doc(adminId)
          .collection('notificaciones')
          .add({
            body: notificationBody,
            createdAt: timestamp,
          });
      });

      await Promise.all(notificationPromises);
      console.log(`💾 Notificación guardada en Firestore para ${adminIds.length} administrador(es)`);

      // 5. Enviar notificación push si hay tokens
      if (adminTokens.length === 0) {
        console.log('⚠️ El administrador no tiene tokens FCM');
        return {
          success: true,
          firestoreNotificationsSaved: adminIds.length,
          pushNotificationsSent: 0,
        };
      }

      console.log(`📱 Enviando notificación a ${adminTokens.length} dispositivos`);

      // 6. Preparar el mensaje
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
          route: '/admin-dashboard/tab-notifications',
        },
        tokens: adminTokens,
        webpush: {
          notification: {
            icon: 'https://escuela-170825.web.app/assets/icons/icon-192x192.png',
            badge: 'https://escuela-170825.web.app/assets/icons/icon-32x32.png',
          },
        },
      };

      // 7. Enviar notificación a todos los dispositivos del admin
      const messaging = getMessaging();
      const response = await messaging.sendEachForMulticast(message);

      console.log(`✅ Notificaciones enviadas: ${response.successCount} exitosas, ${response.failureCount} fallidas`);

      // 8. Limpiar tokens inválidos
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
        firestoreNotificationsSaved: adminIds.length,
        pushNotificationsSent: response.successCount,
        pushNotificationsFailed: response.failureCount,
      };
    } catch (error) {
      console.error('❌ Error enviando notificación:', error);
      throw error;
    }
  }
);
