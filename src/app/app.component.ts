import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add,
  book,
  business,
  calendarNumber,
  create,
  laptopOutline,
  logoAndroid,
  logoApple,
  logOutOutline,
  logoWhatsapp,
  mail,
  notifications,
  people,
  person,
  personAdd,
  personRemove,
  sad,
  school,
  trash,
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})

export class AppComponent {
  constructor() {
    addIcons({
      add,
      book,
      business,
      calendarNumber,
      create,
      laptopOutline,
      logoAndroid,
      logoApple,
      logOutOutline,
      logoWhatsapp,
      mail,
      notifications,
      people,
      person,
      personAdd,
      personRemove,
      sad,
      school,
      trash,
    });
  }
}
