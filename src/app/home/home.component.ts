import { Component } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { LoginModel } from '../models/login.model';
import { UserService } from '../services/user.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [FormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})


export class HomeComponent {

  constructor(private router: Router) { }

  username: string = '';
  password: string = '';

  async doLogin() {
    const loginModel: LoginModel = {
      username: this.username,
      password: this.password
    }

    const activeUser = await UserService.login(loginModel);

    if (activeUser) {
      if (activeUser.role === 'ROLE_ADMIN') {
        this.router.navigate(['/admin-page'])
      } else if (activeUser.role === 'ROLE_DISPATCHER') {
        this.router.navigate(['/dispatcher-page'])
      } else if (activeUser.role === 'ROLE_UNIT') {
        this.router.navigate(['/unit-page'])
      }
    } else {
      alert('Login failed')
    }
  }

}
