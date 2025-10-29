import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChildren, QueryList } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  IonActionSheet,
  IonChip,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonModal,
  IonProgressBar,
  IonTitle,
  IonToast,
  IonToolbar, IonButtons, IonButton } from "@ionic/angular/standalone";

import type { OverlayEventDetail } from '@ionic/core/components';
import { Subscription } from 'rxjs';
import { SchoolCRUDService, School } from 'src/app/services/school-crud.service';


@Component({
  selector: 'app-tab-schools',
  templateUrl: './tab-schools.component.html',
  styleUrls: ['./tab-schools.component.scss'],
  standalone: true,
  imports: [IonButton, IonButtons,
    CommonModule,
    FormsModule,
    IonActionSheet,
    IonChip,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
    IonList,
    IonModal,
    IonProgressBar,
    IonTitle,
    IonToast,
    IonToolbar,
  ]
})

export class TabSchoolsComponent implements OnInit, OnDestroy {

  @ViewChildren(IonModal) modals!: QueryList<IonModal>;

  isLoading = true;
  schools: School[] = [];
  private subscription?: Subscription;

  isToastOpen = false;
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

  constructor(private schoolCRUDService: SchoolCRUDService) {}

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
  }

  ngOnDestroy(){
    if(!this.subscription) {
      return;
    }
    this.subscription.unsubscribe();
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
  }

  onAddSchool() {
    console.log(Date.now());
  }

  onDeleteSchool(event: CustomEvent<OverlayEventDetail>, slidingItem: IonItemSliding, school: School) {
    const eventButton = event.detail.data;
    slidingItem.close();

    if(!school.id) {
      return;
    }

    if(!eventButton || eventButton.action === 'cancel') {
      return;
    }

    this.schoolCRUDService.deleteSchool(school.id).subscribe({
      next: () => {
        this.toastMessage = `✅ Se eliminó ${school.nombre}`;
        this.setOpenToast(true);
      },
      error: error => {
        console.log('Error: ', error);
      },
    });

  }

  async onModalDismiss(event: any, slidingItem: IonItemSliding) {
    await slidingItem.close();
  }

  setOpenToast(openStatus: boolean) {
    this.isToastOpen = openStatus;
  }
}
