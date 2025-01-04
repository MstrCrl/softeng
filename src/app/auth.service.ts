// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

interface LoginResponse {
  success: boolean;
  message: string;
  role?: string;
  faculty_id?: number;
  user_id?: number;
  username: string;
  faculty_name?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/login';

  private facultyIdSubject = new BehaviorSubject<number | null>(null);
  private facultyNameSubject = new BehaviorSubject<string | null>(null);
  private userIdSubject = new BehaviorSubject<number | null>(null);
  private usernameSubject = new BehaviorSubject<string | null>(null);
  private roleSubject = new BehaviorSubject<string | null>(null);
  
  facultyId$ = this.facultyIdSubject.asObservable();
  facultyName$ = this.facultyNameSubject.asObservable();
  userId$ = this.userIdSubject.asObservable();
  username$ = this.usernameSubject.asObservable();
  role$ = this.roleSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Initialize subjects with stored values
    this.initializeFromStorage();
  }

  private initializeFromStorage() {
    const userId = localStorage.getItem('user_id');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const facultyId = localStorage.getItem('faculty_id');
    const facultyName = localStorage.getItem('faculty_name');

    if (userId) this.userIdSubject.next(parseInt(userId));
    if (username) this.usernameSubject.next(username);
    if (role) this.roleSubject.next(role);
    if (facultyId) this.facultyIdSubject.next(parseInt(facultyId));
    if (facultyName) this.facultyNameSubject.next(facultyName);
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, { username, password })
      .pipe(
        tap(response => {
          if (response.success) {
            // Store user data in localStorage
            if (response.user_id) {
              localStorage.setItem('user_id', response.user_id.toString());
              this.userIdSubject.next(response.user_id);
            }
            
            localStorage.setItem('username', response.username);
            this.usernameSubject.next(response.username);
            
            if (response.role) {
              localStorage.setItem('role', response.role);
              this.roleSubject.next(response.role);
            }

            // Handle faculty-specific data
            if (response.faculty_id) {
              localStorage.setItem('faculty_id', response.faculty_id.toString());
              this.facultyIdSubject.next(response.faculty_id);
            } else {
              localStorage.removeItem('faculty_id');
              this.facultyIdSubject.next(null);
            }

            if (response.faculty_name) {
              localStorage.setItem('faculty_name', response.faculty_name);
              this.facultyNameSubject.next(response.faculty_name);
            } else {
              localStorage.removeItem('faculty_name');
              this.facultyNameSubject.next(null);
            }
          }
        })
      );
  }

  logout() {
    // Clear localStorage
    localStorage.clear();
    
    // Reset all subjects
    this.userIdSubject.next(null);
    this.usernameSubject.next(null);
    this.roleSubject.next(null);
    this.facultyIdSubject.next(null);
    this.facultyNameSubject.next(null);
    console.log("logout");
    this.router.navigate(['/login']).then(() => {
      // Ensure modal is fully closed after navigation
      const modal = document.querySelector('ion-modal');
      if (modal) {
        modal.dismiss();
      }
    });
  }


  
  // Getter methods
  getFacultyId(): number | null {
    return this.facultyIdSubject.value;
  }

  getUserId(): number | null {
    return this.userIdSubject.value;
  }

  getUsername(): string | null {
    return this.usernameSubject.value;
  }

  getRole(): string | null {
    return this.roleSubject.value;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.userIdSubject.value;
  }
}