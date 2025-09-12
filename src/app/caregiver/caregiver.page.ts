import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { AuthService } from './../services/auth.service';


@Component({
  selector: 'app-padre',
  templateUrl: './caregiver.page.html',
  styleUrls: ['./caregiver.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class CaregiverPage implements OnInit {

  constructor(private authService: AuthService, private router: Router) {
    addIcons({logOutOutline});
  }

  ngOnInit() { }

  onLogout() {
    this.authService.logout().subscribe({
      next: ()=>{
        this.router.navigateByUrl('/auth');
      },
      error: error=>{
        console.log('Error de cierre de sesión');
      }
    });
  }
}
