import { Inject, Injectable } from '@angular/core';
import { BROWSER_STORAGE } from '../storage';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { TripData } from './trip-data';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  // Variable to handle Authentication Responses
  authResp: AuthResponse = new AuthResponse();

  // Setup our storage and service access
  constructor(
    @Inject(BROWSER_STORAGE) private storage: Storage,
    private tripData: TripData
  ) { }

  // Get our token from our Storage provider.
  public getToken(): string {
    let out: any = this.storage.getItem('travlr-token');
    // Make sure we return a string even if we don't have a token
    if (!out) {
      return '';
    }
    return out;
  }

  // Save our token to our Storage provider.
  public saveToken(token: string): void {
    this.storage.setItem('travlr-token', token);
  }

  // Logout of our application and remove the JWT from Storage
  public logout(): void {
    this.storage.removeItem('travlr-token');
  }

  // Boolean to determine if we are logged in and the token is
  // still valid. Even if we have a token we will still have to
  // reauthenticate if the token has expired
  public isLoggedIn(): boolean {
    const token: string = this.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > (Date.now() / 1000);
    } else {
      return false;
    }
  }

  // Retrieve the current user. This function should only be called
  // after the calling method has checked to make sure that the user
  // isLoggedIn.
  public getCurrentUser(): User {
    const token: string = this.getToken();
    if (token) {
      const { email, name } = JSON.parse(atob(token.split('.')[1]));
      return { email, name } as User;
    }
    return {} as User; // Safe fallback if called without a token
  }

  // Register method
  public async register(user: User, passwd: string): Promise<void> {
    try {
      const value = await firstValueFrom(this.tripData.register(user, passwd));
      if (value && value.token) {
        this.authResp = value;
        this.saveToken(this.authResp.token);
      }
    } catch (error) {
      console.error('Registration Error:', error);
      throw error;
    }
  }

  // Login method
  public async login(user: User, passwd: string): Promise<void> {
    try {
      const value = await firstValueFrom(this.tripData.login(user, passwd));
      if (value && value.token) {
        this.authResp = value;
        this.saveToken(this.authResp.token);
      }
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  }
}
