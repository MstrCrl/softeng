import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event } from './events.service.service';

export interface User {
  user_id: number;
  username: string;
  role: 'admin' | 'faculty' | 'student';
  name: string;
  section_id?: number;
  section_name?: string;
}

export interface NewStudent {
  name: string;
  section_id: number;
  username: string;
  password: string;
}

export interface NewFaculty {
  name: string;
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}
    
  getUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users`);
  }

  addStudent(student: NewStudent): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/student`, student);
  }

  addFaculty(faculty: NewFaculty): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/faculty`, faculty);
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${userId}`);
  }

  // New methods for events and archives
  getAllEvents(): Observable<any> {
    return this.http.get(`${this.baseUrl}/all-events`);
  }

  getAllArchivedEvents(): Observable<any> {
    return this.http.get(`${this.baseUrl}/all-archived-events`);
  }

  addEventAsAdmin(event: Omit<Event, 'id'>): Observable<any> {
    return this.http.post(`${this.baseUrl}/admin/events`, event);
  }

  updateEventAsAdmin(eventId: number, event: Partial<Event>): Observable<any> {
    return this.http.put(`${this.baseUrl}/admin/events/${eventId}`, event);
  }

  deleteEventAsAdmin(eventId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/events/${eventId}`);
  }
}