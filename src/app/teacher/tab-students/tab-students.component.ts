import {
  Component,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';

import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonListHeader,
  IonModal,
  IonNote,
  IonProgressBar,
  IonTitle,
  IonToolbar,
} from "@ionic/angular/standalone";


@Component({
  selector: 'app-teacher-tab-students',
  templateUrl: './tab-students.component.html',
  styleUrls: ['./tab-students.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonButton,
    IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonList,
    IonListHeader,
    IonModal,
    IonNote,
    IonProgressBar,
    IonTitle,
    IonToolbar,
    ReactiveFormsModule,
  ]
})

export class TabStudentsComponent  implements OnInit {

  @ViewChildren(IonModal) modals!: QueryList<IonModal>;

  isLoading = false;
  breakpoints = [0, 0.20, 0.40, 0.50, 0.80, 1];
  initialBreakpoint = 0.50;

  form = this.formBuilder.group({
    nombre: ['',[
      Validators.required,
      Validators.pattern('^[A-Za-zÑñÁÉÍÓÚáéíóú ]+$')
    ]],
    apellidoPaterno: ['',[
      Validators.required,
      Validators.pattern('^[A-Za-zÑñÁÉÍÓÚáéíóú ]+$')
    ]],
    apellidoMaterno: ['',[
      Validators.pattern('^[A-Za-zÑñÁÉÍÓÚáéíóú ]+$')
    ]]
  });

  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {}

  closeModal(triggerId: string) {
    if(!triggerId) {
      return;
    }

    const modal = this.modals.find(m => m.trigger === triggerId);

    if(!modal) {
      return;
    }

    modal.dismiss();
    this.form.reset();

  }

  generateFullName() {
    const apellidoPaterno = this.form.get('apellidoPaterno')?.value?.trim();
    const apellidoMaterno = this.form.get('apellidoMaterno')?.value?.trim();
    const nombre = this.form.get('nombre')?.value?.trim();
    let fullName;

    if(apellidoMaterno) {
      fullName = `${apellidoPaterno} ${apellidoMaterno} ${nombre}`.trim().toUpperCase();
    } else {
      fullName =  `${apellidoPaterno} ${nombre}`.trim().toUpperCase();
    }

    return fullName;
  }

  onAddStudent() {
    const student = this.form.value;
    const studentFullName = this.generateFullName();
    console.log(studentFullName);

    this.closeModal('add-student-btn');
    this.form.reset();
  }
}
