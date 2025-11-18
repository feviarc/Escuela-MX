import { Component, OnInit } from '@angular/core';

import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonProgressBar,
  IonTitle,
  IonToolbar,
} from "@ionic/angular/standalone";

import { School } from '../../services/school-crud.service';
import { SchoolStateService } from 'src/app/services/school-state-service';

@Component({
  selector: 'app-teacher-tab-groups',
  templateUrl: './tab-groups.component.html',
  styleUrls: ['./tab-groups.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonProgressBar,
    IonTitle,
    IonToolbar,
  ]
})

export class TabGroupsComponent  implements OnInit {

  isLoading = false;
  school: School | null = null;

  constructor(
    private schoolStateService: SchoolStateService,
  ) { }

  ngOnInit() {
    this.schoolStateService.school$.subscribe(
      school => {
        this.school = school;
        console.log('tab-groups.component.ts', this.school);
      }
    );
  }
}
