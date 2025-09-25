import { Injectable } from '@angular/core';
import {
  collection,
  getDocs,
  Firestore,
  query,
  where,
} from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class SchoolService {

  private cctPinValidSource = new BehaviorSubject<boolean>(false);
  cctPinValid$ = this.cctPinValidSource.asObservable();

  constructor(private firestore: Firestore) { }

  getValidationStatus(): boolean {
    return this.cctPinValidSource.getValue();
  }

  async validateCredentials(cct: string, pin: string): Promise<boolean> {

    const escuelasCollection = collection(this.firestore, 'escuelas');

    const q = query(
      escuelasCollection,
      where('cct', '==', cct),
      where('pin', '==', pin)
    );

    try {
      const querySnapshot = await getDocs(q);
      const isValid = !querySnapshot.empty;
      this.cctPinValidSource.next(isValid);
      return isValid;

    } catch(error) {
      console.log('Error al validar la CCT y el PIN: ', error);
      this.cctPinValidSource.next(false);
      return false;
    }
  }

}
