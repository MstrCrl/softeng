// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

interface LoginResponse {
  success: boolean;
  message: string;
  role?: string;
  faculty_id?: number;
  user_id?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/login';
  private facultyIdSubject = new BehaviorSubject<number | null>(null);
  facultyId$ = this.facultyIdSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, { username, password })
      .pipe(
        tap(response => {
          if (response.success && response.faculty_id) {
            this.facultyIdSubject.next(response.faculty_id);
          }
        })
      );
  }

  getFacultyId(): number | null {
    return this.facultyIdSubject.value;
  }
}