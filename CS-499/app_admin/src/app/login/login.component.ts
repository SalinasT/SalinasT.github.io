import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { User } from '../models/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  public formError: string = '';
  submitted = false;
  credentials = {
    name: '',
    email: '',
    password: ''
  };

  // Constructor must be INSIDE the class
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit(): void {
  }

  public onLoginSubmit(): void {
    this.formError = '';

    if (!this.credentials.email || !this.credentials.password) {
      this.formError = 'Email and password are required. Please try again.';
      return;
    }

    this.doLogin();
  }

  private doLogin(): void {
    let user = {
      name: this.credentials.name,
      email: this.credentials.email
    } as User;

    this.authenticationService.login(user, this.credentials.password)
      .then(() => {
        if (this.authenticationService.isLoggedIn()) {
          this.router.navigateByUrl('');
        }
      })
      .catch((error: any) => {
        this.formError = 'Login failed. Please check your email and password.';
        console.error('Authentication Error:', error);
      });
  }
}
