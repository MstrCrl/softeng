// src/app/services/events.service.ts
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
}

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

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
}