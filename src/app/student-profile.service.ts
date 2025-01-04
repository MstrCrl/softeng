// student-profile.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentProfileService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getStudentProfile(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/student-profile/${userId}`);
  }

  getSections(): Observable<any> {
    return this.http.get(`${this.apiUrl}/sections`);
  }

  updateProfile(userId: number, profileData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/student-profile/${userId}`, profileData);
  }
}