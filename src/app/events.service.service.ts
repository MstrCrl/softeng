// src/app/services/events.service.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Event {
  id: number;
  event_name: string;
  date: string;
  faculty_id: number;
  student_name: string;
  section_id: number;
  section_name?: string;
  archived_date?: string; // Added this field
  faculty_name?: string; // Added this field
}

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  checkAndArchiveEvents(): Observable<any> {
    return this.http.post(`${this.baseUrl}/check-archive`, {});
  }
  
  getFacultyEvents(facultyId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/faculty-events/${facultyId}`);
  }

  addEvent(event: Omit<Event, 'id'>): Observable<any> {
    return this.http.post(`${this.baseUrl}/events`, event);
  }

  updateEvent(eventId: number, event: Partial<Event>): Observable<any> {
    return this.http.put(`${this.baseUrl}/events/${eventId}`, event);
  }

  deleteEvent(eventId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/events/${eventId}`);
  }
  
  getSections(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sections`);
  }
  getArchivedEvents(facultyId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/archived-events/${facultyId}`);
  }
}