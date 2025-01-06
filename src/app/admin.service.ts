// admin.service.ts
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
  faculty_id?: number;
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
  private readonly PROGRAM_CHAIR_ID = 16  ;

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

  addEventAsAdmin(event: Partial<Event>): Observable<any> {
    // Always set the faculty_id to Program Chair
    const eventWithProgramChair = {
      ...event,
      faculty_id: this.PROGRAM_CHAIR_ID
    };
    return this.http.post(`${this.baseUrl}/events`, eventWithProgramChair);
  }

  updateEventAsAdmin(eventId: number, event: Partial<Event>): Observable<any> {
    // Use the regular events endpoint instead of admin/events
    return this.http.put(`${this.baseUrl}/events/${eventId}`, {
      event_name: event.event_name,
      date: event.date,
      student_name: event.student_name,
      section_id: event.section_id,
      faculty_id: 1 // Always use Program Chair's faculty ID (assuming it's 1)
    });
  }

  deleteEventAsAdmin(eventId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/admin/events/${eventId}`);
  }
}