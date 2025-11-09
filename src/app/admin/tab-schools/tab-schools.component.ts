import { CommonModule } from '@angular/common';

import {
  Component,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import {
  IonActionSheet,
  IonButton,
  IonButtons,
  IonChip,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonInputOtp,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonModal,
  IonProgressBar,
  IonRow,
  IonText,
  IonTitle,
  IonToast,
  IonToolbar,
} from "@ionic/angular/standalone";

import type { OverlayEventDetail } from '@ionic/core/components';
import { Observable, of ,Subscription } from 'rxjs';
import { catchError , map } from 'rxjs/operators';
import { School, SchoolCRUDService } from 'src/app/services/school-crud.service';


@Component({
  selector: 'app-tab-schools',
  templateUrl: './tab-schools.component.html',
  styleUrls: ['./tab-schools.component.scss'],
  standalone: true,
  imports: [IonCol, IonRow, IonGrid,
    CommonModule,
    FormsModule,
    IonActionSheet,
    IonButton,
    IonButtons,
    IonChip,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonInput,
    IonInputOtp,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
    IonList,
    IonModal,
    IonProgressBar,
    IonText,
    IonTitle,
    IonToast,
    IonToolbar,
    ReactiveFormsModule,
  ]
})

export class TabSchoolsComponent implements OnInit, OnDestroy {

  @ViewChildren(IonModal) modals!: QueryList<IonModal>;

  breakpoints = [0, 0.20, 0.40, 0.60, 0.80, 1];
  initialBreakpoint = 0.80;
  classGrade = '';
  classLetter = '';
  courseName = '';
  isLoading = true;
  isToastOpen = false;
  pin = 1111;
  schoolForm!: FormGroup;
  schools: School[] = [];
  private subscription?: Subscription;
  toastMessage = '';

  public actionSheetButtons = [
    {
      text: 'Eliminar',
      role: 'destructive',
      data: {
        action: 'delete',
      }
    },
    {
      text: 'Cancelar',
      role: 'cancel',
      data: {
        action: 'cancel',
      },
    },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private schoolCRUDService: SchoolCRUDService,
  ) {}

  ngOnInit() {
    this.subscription = this.schoolCRUDService.schools$.subscribe({
      next: schools => {
        this.schools = schools;
        if(schools.length !== 0){
          this.isLoading = false;
        }
      },
      error: (e) => {
        console.log('Error: ', e);
      }
    });

    this.initForm();
  }

  ngOnDestroy(){
    if(!this.subscription) {
      return;
    }
    this.subscription.unsubscribe();
  }

  get cct() {
    return this.schoolForm.get('cct')!;
  }

  private cctExistsValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value || control.value.length !== 10) {
      return of(null);
    }

    return this.schoolCRUDService.cctExists(control.value).pipe(
      map(exists => {
        console.log(`CCT "${control.value}" exists:`, exists);
        return exists ? { cctExists: true } : null;
      }),
      catchError(error => {
        console.error('Error validating CCT:', error);
        return of(null);
      })
    );
  }

  closeModal(schoolId: string | undefined) {
    if(!schoolId) {
      return;
    };

    const modal = this.modals.find(m => m.trigger === schoolId);

    if(!modal) {
      return;
    }

    modal.dismiss();
    this.pin = this.generatePin();
    this.schoolForm.reset({cct: '', nombre: '', pin: this.pin});
  }

  private generatePin() {
    const min = 1111;
    const max = 9999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  initForm() {
    this.pin = this.generatePin();

    this.schoolForm = this.formBuilder.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(15),
        Validators.maxLength(100)
      ]],
      cct: ['', [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
        ],
        [this.cctExistsValidator.bind(this)]
      ],
      pin: [this.pin]
    });

    this.schoolForm.get('cct')?.valueChanges.subscribe(value => {
      if (value) {
        const upperValue = value.toUpperCase();
        if (value !== upperValue) {
          this.schoolForm.get('cct')?.setValue(upperValue, { emitEvent: false });
        }
      }
    });
  }

  isNotDataChanged(school: any, updateNameInput: any, updatePinInput: any) {

    if(+updatePinInput.value < 1111) {
      return true;
    }

    const isSameSchoolName = school.nombre === updateNameInput.value ? true : false;
    const isSameSchoolPin = school.pin === +updatePinInput.value ? true : false;
    return (isSameSchoolName && isSameSchoolPin);
  }

  isValidClass() {
    return (this.classGrade && this.classLetter ? true : false);
  }

  isValidCourse() {
    return (this.courseName !== '' ? true : false);
  }

  onAddClass() {
    console.log(this.classGrade, this.classLetter);
    this.classGrade = '';
    this.classLetter = '';
  }

  onAddCourse() {
    console.log(this.courseName);
    this.courseName = '';
  }

  onAddSchool() {
    if(!this.schoolForm) {
      return;
    }

    const school = this.schoolForm.value;

    this.schoolCRUDService.addSchool(school).subscribe({
      next: () => {
        this.closeModal('new-school-btn');
      },
      error: error => {
        console.log('Error: ', error);
      }
    });
  }

  onDeleteSchool(event: CustomEvent<OverlayEventDetail>, slidingItem: IonItemSliding, school: School) {
    slidingItem.close();

    if(!school.id || !event.detail.data) {
      return;
    }

    const action = event.detail.data.action;

    if(action === 'cancel') {
      return;
    }

    this.schoolCRUDService.deleteSchool(school.id).subscribe({
      next: () => {
        this.showToast(`🗑️ Se eliminó ${school.nombre}`);
      },
      error: error => {
        console.log('Error: ', error);
      },
    });
  }

  async onModalDismiss(slidingItem: IonItemSliding) {
    await slidingItem.close();
  }


  onUpdateSchool(school: any, nameInput: any, pinInput: any) {
    this.isLoading = true;

    const updatedData = {
      nombre: nameInput.value,
      pin: +pinInput.value
    };

    this.schoolCRUDService.updateSchool(school.id, updatedData).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: error => {
        console.log('Error: ', error);
      }
    });

    this.closeModal('edit-' + school.id);
  }

  setOpenToast(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }

  private showToast(message: string) {
    this.toastMessage = message;
    this.isToastOpen = true;
  }
}
