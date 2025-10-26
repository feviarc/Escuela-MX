import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

import {
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
  IonToolbar,
} from "@ionic/angular/standalone";

import { Subscription } from 'rxjs';
import { SchoolCRUDService, School } from 'src/app/services/school-crud.service';


@Component({
  selector: 'app-tab-schools',
  templateUrl: './tab-schools.component.html',
  styleUrls: ['./tab-schools.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
    IonToolbar,
  ]
})

export class TabSchoolsComponent implements OnInit, OnDestroy {

  isLoading: boolean = true;
  schools: School[] = [];
  private subscription?: Subscription;

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
}
