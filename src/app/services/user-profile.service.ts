import { Injectable } from '@angular/core';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  Firestore,
  setDoc
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserProfile } from '../models/user-profile.model';


@Injectable({ providedIn: 'root' })
export class UserProfileService {

  constructor(private firestore: Firestore) { }

  async createUserProfile(profile: UserProfile): Promise<void> {
    const userDocRef = doc(this.firestore, `usuarios/${profile.uid}`);
    await setDoc(userDocRef, profile);
  }

  getUserProfile(uid: string): Observable<UserProfile | null> {

    const userDocRef = doc(this.firestore, `usuarios/${uid}`);

    return from(getDoc(userDocRef)).pipe(
      map(docSnap => {
        if(docSnap.exists()) {
          return {id: docSnap.id, ...docSnap.data() as UserProfile};
        }
        else {
          return null;
        }
      })
    );
  }

  async isFirstUser(): Promise<boolean> {
    const usuariosCollectionRef = collection(this.firestore, 'usuarios');
    const querySnapshot = await getDocs(usuariosCollectionRef);
    return querySnapshot.empty;
  }

}
