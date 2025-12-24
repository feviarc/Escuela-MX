/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable valid-jsdoc */
/* eslint-disable max-len */
/* eslint-disable quotes */

import {onDocumentCreated} from 'firebase-functions/v2/firestore';
import {initializeApp} from 'firebase-admin/app';
import {getFirestore, FieldValue} from 'firebase-admin/firestore';
import {getMessaging} from 'firebase-admin/messaging';

// Inicializar Firebase Admin
initializeApp();

/**
 * Cloud Function que se ejecuta cuando se crea una nueva notificación
 * Maneja tanto notificaciones de administrador como de tutor
 */
export const onNewUserNotification = onDocumentCreated('usuarios/{userId}/notificaciones/{notificationId}',
  async (event) => {
    const snapshot = event.data;

    if (!snapshot) {
      console.log('No hay datos en el snapshot');
      return;
    }

    const userId = event.params.userId;
    const notificationId = event.params.notificationId;
    const notificationData = snapshot.data();

    const db = getFirestore();

    try {
      // Obtener el usuario para conocer su rol
      const userDoc = await db.collection('usuarios').doc(userId).get();

      if (!userDoc.exists) {
        console.log('❌ Usuario no encontrado:', userId);
        return;
      }

      const userData = userDoc.data();
      const rol = userData?.rol;

      console.log(`📬 Nueva notificación creada para ${rol}: ${userId}`);

      // Ejecutar lógica según el rol del usuario
      switch (rol) {
      case 'administrador':
        return await handleAdminNotification(notificationId, notificationData);

      case 'tutor':
        return await handleTutorNotification(userId, notificationId, notificationData, userData);

      default:
        console.log(`⚠️ Rol desconocido o no soportado: ${rol}`);
        return {success: false, message: 'Rol no soportado'};
      }
    } catch (error) {
      console.error('❌ Error procesando notificación:', error);
      throw error;
    }
  }
);

/**
 * Maneja notificaciones para usuarios administrador
 * Esta función NO envía notificaciones push, solo registra el evento
 * Las notificaciones push a administradores se manejan en onNewUserRegistered
 */
async function handleAdminNotification(
  notificationId: string,
  notificationData: any
): Promise<any> {
  console.log(`✅ Notificación de administrador creada: ${notificationId}`);
  console.log(`📄 Contenido: ${notificationData.body}`);

  // Las notificaciones de admin se crean desde otras functions
  // No necesitan procesamiento adicional aquí
  return {
    success: true,
    type: 'admin_notification',
    notificationId: notificationId,
  };
}

/**
 * Maneja notificaciones para usuarios tutor (caregiver)
 * Envía notificación push al tutor sobre avisos de sus estudiantes
 */
async function handleTutorNotification(
  tutorId: string,
  notificationId: string,
  notificationData: any,
  tutorData: any
): Promise<any> {
  try {
    const {tipo, nombreCompleto, sid, fecha, materias, observaciones} = notificationData;

    console.log(`📱 Procesando notificación de tutor para estudiante: ${nombreCompleto}`);

    // Obtener tokens FCM del tutor
    const tutorTokens: string[] = tutorData.tokens || [];

    if (tutorTokens.length === 0) {
      console.log('⚠️ El tutor no tiene tokens FCM registrados');
      return {
        success: true,
        type: 'tutor_notification',
        tutorId: tutorId,
        pushNotificationsSent: 0,
        message: 'No tokens available',
      };
    }

    console.log(`📲 Enviando notificación a ${tutorTokens.length} dispositivo(s) del tutor`);

    // Construir el mensaje de la notificación
    const notificationTitle = `Aviso de ${tipo}`;
    const notificationBody = `Tienes un aviso de ${tipo} para ${nombreCompleto}`;

    // Preparar data adicional para la notificación
    const notificationDataPayload: {[key: string]: string} = {
      type: 'caregiver_notification',
      notificationId: notificationId,
      tipo: tipo || '',
      nombreCompleto: nombreCompleto || '',
      sid: sid || '',
      route: '/caregiver-dashboard/tab-notifications',
    };

    // Agregar campos opcionales solo si existen
    if (fecha) notificationDataPayload.fecha = fecha;
    if (observaciones) notificationDataPayload.observaciones = observaciones;
    if (materias && Array.isArray(materias)) {
      notificationDataPayload.materias = materias.join(', ');
    }

    // Preparar el mensaje
    const message = {
      notification: {
        title: notificationTitle,
        body: notificationBody,
      },
      data: notificationDataPayload,
      tokens: tutorTokens,
      webpush: {
        notification: {
          icon: 'https://escuela-170825.web.app/assets/icons/icon-192x192.png',
          badge: 'https://escuela-170825.web.app/assets/icons/icon-32x32.png',
        },
      },
    };

    // Enviar notificación a todos los dispositivos del tutor
    const messaging = getMessaging();
    const response = await messaging.sendEachForMulticast(message);

    console.log(
      `✅ Notificaciones enviadas: ${response.successCount} exitosas, ${response.failureCount} fallidas`
    );

    // Limpiar tokens inválidos
    if (response.failureCount > 0) {
      const tokensToRemove: string[] = [];

      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(
            `❌ Error en token ${tutorTokens[idx]}:`,
            resp.error?.code
          );

          // Si el token es inválido, marcarlo para eliminación
          if (
            resp.error?.code === 'messaging/invalid-registration-token' ||
            resp.error?.code === 'messaging/registration-token-not-registered'
          ) {
            tokensToRemove.push(tutorTokens[idx]);
          }
        }
      });

      // Eliminar tokens inválidos de Firestore
      if (tokensToRemove.length > 0) {
        console.log(`🧹 Limpiando ${tokensToRemove.length} token(s) inválido(s)`);

        const db = getFirestore();
        const cleanedTokens = tutorTokens.filter(
          (token: string) => !tokensToRemove.includes(token)
        );

        await db.collection('usuarios').doc(tutorId).update({
          tokens: cleanedTokens,
        });
      }
    }

    return {
      success: true,
      type: 'tutor_notification',
      tutorId: tutorId,
      studentName: nombreCompleto,
      notificationType: tipo,
      pushNotificationsSent: response.successCount,
      pushNotificationsFailed: response.failureCount,
    };
  } catch (error) {
    console.error('❌ Error enviando notificación a tutor:', error);
    throw error;
  }
}

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
