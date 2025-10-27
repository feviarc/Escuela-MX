import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

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
  IonProgressBar,
  IonTitle,
  IonToast,
  IonToolbar,
} from "@ionic/angular/standalone";

import type { OverlayEventDetail } from '@ionic/core/components';
import { Subscription } from 'rxjs';
import { SchoolCRUDService, School } from 'src/app/services/school-crud.service';


@Component({
  selector: 'app-tab-schools',
  templateUrl: './tab-schools.component.html',
  styleUrls: ['./tab-schools.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
    IonProgressBar,
    IonTitle,
    IonToast,
    IonToolbar,
  ]
})

export class TabSchoolsComponent implements OnInit, OnDestroy {

  isLoading = true;
  isToastOpen = false;
  schools: School[] = [];
  toastMessage = '';
  private subscription?: Subscription;

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
    if(this.subscription) {
      this.subscription.unsubscribe();
    }
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

  onUpdateSchool(slidingItem: IonItemSliding, school: School) {
    slidingItem.close();
  }

  setOpenToast(openStatus: boolean) {
    this.isToastOpen = openStatus;
  }
}
