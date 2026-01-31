import { Component } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-admin-page',
  imports: [],
  templateUrl: './admin-page.component.html',
  styleUrl: './admin-page.component.css'
})
export class AdminPageComponent {

  ngOnInit(){
    const user = UserService.checkActive();
    if(user == null || user.role !== 'ROLE_ADMIN'){
      window.location.href = '/home';
    }
  }
}
