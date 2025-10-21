import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { UserProfile } from '../../models/user-profile.model';
import { TeacherDataService } from 'src/app/services/teacher-data.service';

import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonToolbar,
  IonTitle,
} from "@ionic/angular/standalone";

@Component({
  selector: 'app-tab-users',
  templateUrl: './tab-users.component.html',
  styleUrls: ['./tab-users.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonToolbar,
    IonTitle,
  ]
})

export class TabUsersComponent  implements OnInit {

  teachers$!: Observable<UserProfile[]>;

  constructor(
    private teacherDataService: TeacherDataService
  ) { }

  ngOnInit() {
    this.teachers$ = this.teacherDataService.getTeachers();
  }
}
