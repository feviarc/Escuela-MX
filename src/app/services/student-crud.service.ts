import { Injectable } from '@angular/core';

import {
  addDoc,
  collection,
  collectionData,
  CollectionReference,
  deleteDoc,
  doc,
  docData,
  DocumentReference,
  Firestore,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from '@angular/fire/firestore';

import {
  BehaviorSubject,
  Observable,
} from 'rxjs';

import {
  catchError,
  map,
} from 'rxjs/operators';

// ==================== INTERFACES ====================

/**
 * Student model (Alumno)
 */
export interface Student {
  id?: string; // Autogenerado por Firestore
  gid?: string; // ID del grupo (opcional, se asigna después)
  tid?: string; // ID del tutor (opcional, se asigna después)
  nombre: string; // Requerido en creación
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Student Notification model (Notificación del alumno)
 * Subcollection dentro de cada alumno
 */
export interface StudentNotification {
  id?: string; // Autogenerado por Firestore
  tipo: string; // Requerido (ej: "tarea", "examen", "aviso")
  body: string; // Requerido (contenido de la notificación)
  materias: string[]; // Requerido (array de nombres de materias)
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Input for creating a notification
 */
export interface NotificationInput {
  tipo: string;
  body: string;
  materias: string[];
}

// ==================== SERVICE ====================

/**
 * Service to manage CRUD operations for Students (Alumnos)
 * Structure: alumnos/{id}/notificaciones/{notificationId}
 * Uses Promise for write operations and Observable for reads
 */
@Injectable({
  providedIn: 'root'
})
export class StudentCRUDService {

  private readonly STUDENTS_COLLECTION = 'alumnos';
  private readonly NOTIFICATIONS_SUBCOLLECTION = 'notificaciones';

  private studentsCollection: CollectionReference;

  // BehaviorSubject to maintain students state
  private studentsSubject = new BehaviorSubject<Student[]>([]);

  /**
   * Observable stream of all students (real-time)
   * ⚠️ REQUIERE UNSUBSCRIBE: Usa async pipe o unsubscribe en ngOnDestroy
   */
  public students$ = this.studentsSubject.asObservable();

  constructor(private firestore: Firestore) {
    this.studentsCollection = collection(this.firestore, this.STUDENTS_COLLECTION);
    this.loadStudents();
  }

  /**
   * Get notifications subcollection reference for a student
   */
  private getNotificationsCollection(studentId: string): CollectionReference {
    return collection(
      this.firestore,
      this.STUDENTS_COLLECTION,
      studentId,
      this.NOTIFICATIONS_SUBCOLLECTION
    );
  }

  /**
   * Load all students and update BehaviorSubject
   */
  private loadStudents(): void {
    this.getStudents().subscribe({
      next: (students) => this.studentsSubject.next(students),
      error: (error) => console.error('Error loading students:', error)
    });
  }

  // ==================== STUDENTS CRUD (CREATE) ====================

  /**
   * Add a new student (only nombre is required)
   * @param nombre - Student name
   * @returns Promise with the created student ID
   */
  async addStudent(student: Student): Promise<string> {
    try {
      const timeStamp = {
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const studentData = {...timeStamp, ...student};
      const docRef = await addDoc(this.studentsCollection, studentData);
      console.log('Student added with ID:', docRef.id);
      this.loadStudents(); // Refresh list

      return docRef.id;

    } catch (error) {
      console.error('Error adding student:', error);
      throw new Error('Could not add student');
    }
  }

  // ==================== STUDENTS CRUD (READ) ====================

  /**
   * Get all students (real-time)
   * Ordered by nombre
   * ⚠️ REQUIERE UNSUBSCRIBE: Usa async pipe o unsubscribe en ngOnDestroy
   * @returns Observable with array of students
   */
  getStudents(): Observable<Student[]> {
    const q = query(this.studentsCollection, orderBy('nombre', 'asc'));

    return collectionData(q, { idField: 'id' }).pipe(
      map(students => students as Student[]),
      catchError(error => {
        console.error('Error getting students:', error);
        throw error;
      })
    );
  }

  /**
   * Get all students (snapshot - one-time read)
   * @returns Promise with array of students
   */
  async getStudentsSnapshot(): Promise<Student[]> {
    try {
      const q = query(this.studentsCollection, orderBy('nombre', 'asc'));
      const querySnapshot = await getDocs(q);

      const students: Student[] = [];
      querySnapshot.forEach(doc => {
        students.push({
          id: doc.id,
          ...doc.data()
        } as Student);
      });

      return students;
    } catch (error) {
      console.error('Error getting students snapshot:', error);
      throw new Error('Could not get students');
    }
  }

  /**
   * Get a student by ID (real-time)
   * ⚠️ REQUIERE UNSUBSCRIBE: Usa async pipe o unsubscribe en ngOnDestroy
   * @param id - Student ID
   * @returns Observable with student data
   */
  getStudentById(id: string): Observable<Student | null> {
    const docRef = doc(this.firestore, this.STUDENTS_COLLECTION, id) as DocumentReference;

    return docData(docRef, { idField: 'id' }).pipe(
      map(data => data ? data as Student : null),
      catchError(error => {
        console.error('Error getting student by ID:', error);
        throw error;
      })
    );
  }

  /**
   * Get a student by ID (snapshot - one-time read)
   * @param id - Student ID
   * @returns Promise with student data or null
   */
  async getStudentByIdSnapshot(id: string): Promise<Student | null> {
    try {
      const docRef = doc(this.firestore, this.STUDENTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Student;
      }
      return null;
    } catch (error) {
      console.error('Error getting student by ID:', error);
      throw error;
    }
  }

  /**
   * Get students by tutor ID
   * ⚠️ REQUIERE UNSUBSCRIBE: Usa async pipe o unsubscribe en ngOnDestroy
   * @param tid - Tutor ID
   * @returns Observable with array of students
   */
  getStudentsByTutor(tid: string): Observable<Student[]> {
    const q = query(
      this.studentsCollection,
      where('tid', '==', tid),
      orderBy('nombre', 'asc')
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map(students => students as Student[]),
      catchError(error => {
        console.error('Error getting students by tutor:', error);
        throw error;
      })
    );
  }

  /**
   * Get students by group ID
   * ⚠️ REQUIERE UNSUBSCRIBE: Usa async pipe o unsubscribe en ngOnDestroy
   * @param gid - Group ID
   * @returns Observable with array of students
   */
  getStudentsByGroup(gid: string): Observable<Student[]> {
    const q = query(
      this.studentsCollection,
      where('gid', '==', gid),
      orderBy('nombre', 'asc')
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map(students => students as Student[]),
      catchError(error => {
        console.error('Error getting students by group:', error);
        throw error;
      })
    );
  }

  /**
   * Get students without tutor assigned
   * ⚠️ REQUIERE UNSUBSCRIBE: Usa async pipe o unsubscribe en ngOnDestroy
   * @returns Observable with array of students without tid
   */
  getStudentsWithoutTutor(): Observable<Student[]> {
    return this.getStudents().pipe(
      map(students => students.filter(s => !s.tid))
    );
  }

  /**
   * Get students without group assigned
   * ⚠️ REQUIERE UNSUBSCRIBE: Usa async pipe o unsubscribe en ngOnDestroy
   * @returns Observable with array of students without gid
   */
  getStudentsWithoutGroup(): Observable<Student[]> {
    return this.getStudents().pipe(
      map(students => students.filter(s => !s.gid))
    );
  }

  /**
   * Check if a student exists
   * @param id - Student ID
   * @returns Promise<boolean>
   */
  async studentExists(id: string): Promise<boolean> {
    try {
      const docRef = doc(this.firestore, this.STUDENTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      console.error('Error checking student existence:', error);
      return false;
    }
  }

  // ==================== STUDENTS CRUD (UPDATE) ====================

  /**
   * Update a student
   * @param id - Student ID
   * @param data - Partial data to update
   * @returns Promise<void>
   */
  async updateStudent(id: string, data: Partial<Omit<Student, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(this.firestore, this.STUDENTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Student does not exist');
      }

      const updateData = {
        ...data,
        updatedAt: new Date()
      };

      await updateDoc(docRef, updateData);
      console.log('Student updated:', id);
      this.loadStudents(); // Refresh list
    } catch (error) {
      console.error('Error updating student:', error);
      throw new Error('Could not update student');
    }
  }

  /**
   * Assign a tutor to a student
   * @param studentId - Student ID
   * @param tutorId - Tutor ID
   * @returns Promise<void>
   */
  async assignTutor(studentId: string, tutorId: string): Promise<void> {
    await this.updateStudent(studentId, { tid: tutorId });
  }

  /**
   * Assign a group to a student
   * @param studentId - Student ID
   * @param groupId - Group ID
   * @returns Promise<void>
   */
  async assignGroup(studentId: string, groupId: string): Promise<void> {
    await this.updateStudent(studentId, { gid: groupId });
  }

  /**
   * Remove tutor from student
   * @param studentId - Student ID
   * @returns Promise<void>
   */
  async removeTutor(studentId: string): Promise<void> {
    await this.updateStudent(studentId, { tid: undefined });
  }

  /**
   * Remove group from student
   * @param studentId - Student ID
   * @returns Promise<void>
   */
  async removeGroup(studentId: string): Promise<void> {
    await this.updateStudent(studentId, { gid: undefined });
  }

  // ==================== STUDENTS CRUD (DELETE) ====================

  /**
   * Delete a student and all their notifications
   * @param id - Student ID
   * @returns Promise<void>
   */
  async deleteStudent(id: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, this.STUDENTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Student does not exist');
      }

      // Delete all notifications first
      await this.clearStudentNotifications(id);

      // Delete student
      await deleteDoc(docRef);
      console.log('Student deleted:', id);
      this.loadStudents(); // Refresh list
    } catch (error) {
      console.error('Error deleting student:', error);
      throw new Error('Could not delete student');
    }
  }

  // ==================== NOTIFICATIONS CRUD (CREATE) ====================

  /**
   * Add a notification to a student
   * @param studentId - Student ID
   * @param notification - Notification data
   * @returns Promise with notification ID
   */
  async addNotificationToStudent(studentId: string, notification: NotificationInput): Promise<string> {
    try {
      const notificationsCol = this.getNotificationsCollection(studentId);

      const notificationData = {
        ...notification,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(notificationsCol, notificationData);
      console.log('Notification added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding notification:', error);
      throw new Error('Could not add notification');
    }
  }

  // ==================== NOTIFICATIONS CRUD (READ) ====================

  /**
   * Get all notifications for a student (real-time)
   * ⚠️ REQUIERE UNSUBSCRIBE: Usa async pipe o unsubscribe en ngOnDestroy
   * @param studentId - Student ID
   * @returns Observable with array of notifications
   */
  getStudentNotifications(studentId: string): Observable<StudentNotification[]> {
    const notificationsCol = this.getNotificationsCollection(studentId);
    const q = query(notificationsCol, orderBy('createdAt', 'desc'));

    return collectionData(q, { idField: 'id' }).pipe(
      map(notifications => notifications as StudentNotification[]),
      catchError(error => {
        console.error('Error getting student notifications:', error);
        throw error;
      })
    );
  }

  /**
   * Get all notifications for a student (snapshot)
   * @param studentId - Student ID
   * @returns Promise with array of notifications
   */
  async getStudentNotificationsSnapshot(studentId: string): Promise<StudentNotification[]> {
    try {
      const notificationsCol = this.getNotificationsCollection(studentId);
      const q = query(notificationsCol, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const notifications: StudentNotification[] = [];
      querySnapshot.forEach(doc => {
        notifications.push({
          id: doc.id,
          ...doc.data()
        } as StudentNotification);
      });

      return notifications;
    } catch (error) {
      console.error('Error getting notifications snapshot:', error);
      throw new Error('Could not get notifications');
    }
  }

  /**
   * Get a notification by ID
   * ⚠️ REQUIERE UNSUBSCRIBE: Usa async pipe o unsubscribe en ngOnDestroy
   * @param studentId - Student ID
   * @param notificationId - Notification ID
   * @returns Observable with notification data
   */
  getNotificationById(studentId: string, notificationId: string): Observable<StudentNotification | null> {
    const docRef = doc(
      this.firestore,
      this.STUDENTS_COLLECTION,
      studentId,
      this.NOTIFICATIONS_SUBCOLLECTION,
      notificationId
    ) as DocumentReference;

    return docData(docRef, { idField: 'id' }).pipe(
      map(data => data ? data as StudentNotification : null),
      catchError(error => {
        console.error('Error getting notification by ID:', error);
        throw error;
      })
    );
  }

  /**
   * Get notifications by type
   * ⚠️ REQUIERE UNSUBSCRIBE: Usa async pipe o unsubscribe en ngOnDestroy
   * @param studentId - Student ID
   * @param tipo - Notification type
   * @returns Observable with array of notifications
   */
  getNotificationsByType(studentId: string, tipo: string): Observable<StudentNotification[]> {
    return this.getStudentNotifications(studentId).pipe(
      map(notifications => notifications.filter(n => n.tipo === tipo))
    );
  }

  // ==================== NOTIFICATIONS CRUD (UPDATE) ====================

  /**
   * Update a notification
   * @param studentId - Student ID
   * @param notificationId - Notification ID
   * @param data - Partial data to update
   * @returns Promise<void>
   */
  async updateNotification(
    studentId: string,
    notificationId: string,
    data: Partial<Omit<StudentNotification, 'id' | 'createdAt'>>
  ): Promise<void> {
    try {
      const docRef = doc(
        this.firestore,
        this.STUDENTS_COLLECTION,
        studentId,
        this.NOTIFICATIONS_SUBCOLLECTION,
        notificationId
      );

      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Notification does not exist');
      }

      const updateData = {
        ...data,
        updatedAt: new Date()
      };

      await updateDoc(docRef, updateData);
      console.log('Notification updated:', notificationId);
    } catch (error) {
      console.error('Error updating notification:', error);
      throw new Error('Could not update notification');
    }
  }

  /**
   * Add a subject to a notification's materias array
   * @param studentId - Student ID
   * @param notificationId - Notification ID
   * @param materia - Subject name to add
   * @returns Promise<void>
   */
  async addSubjectToNotification(studentId: string, notificationId: string, materia: string): Promise<void> {
    try {
      const notification = await this.getStudentNotificationsSnapshot(studentId);
      const current = notification.find(n => n.id === notificationId);

      if (!current) {
        throw new Error('Notification not found');
      }

      if (current.materias.includes(materia)) {
        throw new Error('Subject already exists in notification');
      }

      const updatedMaterias = [...current.materias, materia];
      await this.updateNotification(studentId, notificationId, { materias: updatedMaterias });
    } catch (error) {
      console.error('Error adding subject to notification:', error);
      throw error;
    }
  }

  /**
   * Remove a subject from a notification's materias array
   * @param studentId - Student ID
   * @param notificationId - Notification ID
   * @param materia - Subject name to remove
   * @returns Promise<void>
   */
  async removeSubjectFromNotification(studentId: string, notificationId: string, materia: string): Promise<void> {
    try {
      const notifications = await this.getStudentNotificationsSnapshot(studentId);
      const current = notifications.find(n => n.id === notificationId);

      if (!current) {
        throw new Error('Notification not found');
      }

      const updatedMaterias = current.materias.filter(m => m !== materia);
      await this.updateNotification(studentId, notificationId, { materias: updatedMaterias });
    } catch (error) {
      console.error('Error removing subject from notification:', error);
      throw error;
    }
  }

  // ==================== NOTIFICATIONS CRUD (DELETE) ====================

  /**
   * Delete a notification
   * @param studentId - Student ID
   * @param notificationId - Notification ID
   * @returns Promise<void>
   */
  async deleteNotification(studentId: string, notificationId: string): Promise<void> {
    try {
      const docRef = doc(
        this.firestore,
        this.STUDENTS_COLLECTION,
        studentId,
        this.NOTIFICATIONS_SUBCOLLECTION,
        notificationId
      );

      await deleteDoc(docRef);
      console.log('Notification deleted:', notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error('Could not delete notification');
    }
  }

  /**
   * Delete all notifications for a student (batch delete)
   * @param studentId - Student ID
   * @returns Promise<void>
   */
  async clearStudentNotifications(studentId: string): Promise<void> {
    try {
      const notifications = await this.getStudentNotificationsSnapshot(studentId);

      if (notifications.length === 0) {
        return;
      }

      const batch = writeBatch(this.firestore);

      notifications.forEach(notification => {
        const docRef = doc(
          this.firestore,
          this.STUDENTS_COLLECTION,
          studentId,
          this.NOTIFICATIONS_SUBCOLLECTION,
          notification.id!
        );
        batch.delete(docRef);
      });

      await batch.commit();
      console.log('All notifications cleared for student:', studentId);
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw new Error('Could not clear notifications');
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Count total students
   * @returns Promise<number>
   */
  async countStudents(): Promise<number> {
    try {
      const querySnapshot = await getDocs(this.studentsCollection);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error counting students:', error);
      return 0;
    }
  }

  /**
   * Count notifications for a student
   * @param studentId - Student ID
   * @returns Promise<number>
   */
  async countStudentNotifications(studentId: string): Promise<number> {
    try {
      const notifications = await this.getStudentNotificationsSnapshot(studentId);
      return notifications.length;
    } catch (error) {
      console.error('Error counting notifications:', error);
      return 0;
    }
  }

  /**
   * Get current students value without subscription
   * @returns Current array of students
   */
  getCurrentStudents(): Student[] {
    return this.studentsSubject.value;
  }

  /**
   * Manually refresh students list
   */
  refreshStudents(): void {
    this.loadStudents();
  }
}
