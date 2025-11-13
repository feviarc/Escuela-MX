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
  IonSpinner,
  IonText,
  IonTitle,
  IonToast,
  IonToolbar,
} from "@ionic/angular/standalone";

import type { OverlayEventDetail } from '@ionic/core/components';
import { Observable, of ,Subscription } from 'rxjs';
import { catchError , map } from 'rxjs/operators';
import { School, SchoolCRUDService } from 'src/app/services/school-crud.service';
import { Group, GroupCRUDService } from 'src/app/services/group-crud.service';
import { Subject, SubjectCRUDService } from 'src/app/services/subject-crud.service';

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
    IonSpinner,
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
  classGrade = '';
  classLetter = '';
  subjectName = '';
  groups: Group[] = [];
  initialBreakpoint = 0.80;
  isLoadingData = true;
  isSaveButtonDisabled = false;
  isSpinnerActive = false;
  isToastOpen = false;
  pin = 1111;
  private groupSubscription?: Subscription;
  private schoolSubscription?: Subscription;
  private subjectSubscription?: Subscription;
  schoolForm!: FormGroup;
  schools: School[] = [];
  subjects: Subject[] = [];
  spinnerText = '';
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
    private groupCRUDService: GroupCRUDService,
    private schoolCRUDService: SchoolCRUDService,
    private subjectCRUDService: SubjectCRUDService
  ) {}

  ngOnInit() {
    this.schoolSubscription = this.schoolCRUDService.schools$.subscribe({
      next: schools => {
        this.schools = schools;
        if(schools.length !== 0){
          this.isLoadingData = false;
        }
      },
      error: (e) => {
        console.log('Error: ', e);
      }
    });

    this.groupSubscription = this.groupCRUDService.groups$.subscribe({
      next: groups => {
        this.groups = groups;
        console.log('Grupos: ', groups);
      },
      error: (e) => {
        console.log('Error:', e);
      }
    });

    this.subjectSubscription = this.subjectCRUDService.subjects$.subscribe({
      next: subjects => {
        this.subjects = subjects;
        console.log('Materias:', subjects);
      },
      error: (e) => {
        console.log('Error:', e);
      }
    });

    this.initForm();
  }

  ngOnDestroy(){
    if(!this.groupSubscription) {
      return;
    }

    if(!this.schoolSubscription) {
      return;
    }

    if(!this.subjectSubscription) {
      return;
    }

    this.groupSubscription.unsubscribe();
    this.schoolSubscription.unsubscribe();
    this.subjectSubscription.unsubscribe();
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

    this.schoolForm.get('nombre')?.valueChanges.subscribe(value => {
      if (value) {
        const upperValue = value.toUpperCase();
        if (value !== upperValue) {
          this.schoolForm.get('nombre')?.setValue(upperValue, { emitEvent: false });
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

  isValidSubject() {
    return (this.subjectName !== '' ? true : false);
  }

  onAddClass() {
    const group = {
      grado: this.classGrade,
      letra: this.classLetter.toLocaleUpperCase(),
      nombre: `Grupo ${this.classGrade}° "${this.classLetter.toUpperCase()}"`
    };

    this.classGrade = '';
    this.classLetter = '';

    this.groupCRUDService.addGroup(group).subscribe({
      next: id => {
        console.log(`Se creo ${id}`);
      },
      error: (e) => {
        console.log(e);
      }
    });
  }

  onAddSubject() {
    const subject = {
      nombre: this.subjectName.toUpperCase()
    };

    this.subjectName = '';

    this.subjectCRUDService.addSubject(subject).subscribe({
      next: id => {
        console.log(`Se creo ${id}`);
      },
      error: (e) => {
        console.log('Error: ', e);
      }
    });
  }

  onAddSchool() {
    if(!this.schoolForm) {
      return;
    }

    this.isSaveButtonDisabled = true;
    const school = this.schoolForm.value;

    this.schoolCRUDService.addSchool(school).subscribe({
      next: () => {
        this.closeModal('new-school-btn');
        this.isSaveButtonDisabled = false;
      },
      error: (e) => {
        console.log('Error: ', e);
      }
    });
  }

  onDeleteGroup(group: Group) {
    console.log(group);
    this.groupCRUDService.deleteGroup(group.id!).subscribe({
      next: () => {
        console.log('Se eliminó ', group.nombre);
      },
      error: (e) => {
        console.log('Error:', e);
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

    this.spinnerText = 'Eliminando...';
    this.isSpinnerActive = true;

    this.schoolCRUDService.deleteSchool(school.id).subscribe({
      next: () => {
        this.showToast(`🗑️ Se eliminó ${school.nombre}`);
        this.isSpinnerActive = false;
      },
      error: (e) => {
        console.log('Error: ', e);
      },
    });
  }

  onDeleteSubject(subject: Subject) {
    console.log(subject);
    this.subjectCRUDService.deleteSubject(subject.id!).subscribe({
      next: () => {
        console.log('Se eliminó ', subject.nombre);
      },
      error: (e) => {
        console.log('Error:', e);
      }
    });
  }

  async onModalDismiss(slidingItem: IonItemSliding) {
    await slidingItem.close();
  }


  onUpdateSchool(school: any, nameInput: any, pinInput: any) {

    const updatedData = {
      nombre: nameInput.value.toUpperCase(),
      pin: +pinInput.value
    };

    this.isSaveButtonDisabled = true;

    this.schoolCRUDService.updateSchool(school.id, updatedData).subscribe({
      next: () => {
        this.isSaveButtonDisabled = false;
      },
      error: (e) => {
        console.log('Error: ', e);
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
