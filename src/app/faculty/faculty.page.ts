import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { EventsService, Event } from '../events.service.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-faculty',
  templateUrl: './faculty.page.html',
  styleUrls: ['./faculty.page.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, IonicModule]  // Import necessary modules
})
export class FacultyPage implements OnInit {
  facultyId: number | null = null;
  events: Event[] = [];
  showAddEventForm = false;
  editingEvent: Event | null = null;
  
  newEvent: Event = {
    id: 0, // This will be set by the database
    event_name: '',
    date: '',
    faculty_id: 0, // This will be set when adding
    student_name: '',
    section_id: 0
  };

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private eventsService: EventsService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.authService.facultyId$.subscribe(id => {
      if (id) {
        this.facultyId = id;
        this.loadEvents();
      }
    });
  }

  loadEvents() {
    if (this.facultyId) {
      this.eventsService.getFacultyEvents(this.facultyId).subscribe(
        response => {
          if (response.success) {
            this.events = response.events;
          }
        },
        error => {
          console.error('Error loading events:', error);
        }
      );
    }
  }

  async addEvent() {
    if (this.facultyId) {
      const newEventData = {
        ...this.newEvent,
        faculty_id: this.facultyId
      };

      this.eventsService.addEvent(newEventData as Event).subscribe(
        response => {
          if (response.success) {
            this.loadEvents();
            this.showAddEventForm = false;
            this.resetNewEvent();
          }
        },
        error => {
          console.error('Error adding event:', error);
        }
      );
    }
  }

  async updateEvent() {
    if (this.editingEvent) {
      this.eventsService.updateEvent(this.editingEvent.id, this.editingEvent).subscribe(
        response => {
          if (response.success) {
            this.loadEvents();
            this.editingEvent = null;
          }
        },
        error => {
          console.error('Error updating event:', error);
        }
      );
    }
  }

  async deleteEvent(eventId: number) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this event?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            this.eventsService.deleteEvent(eventId).subscribe(
              response => {
                if (response.success) {
                  this.loadEvents();
                }
              },
              error => {
                console.error('Error deleting event:', error);
              }
            );
          }
        }
      ]
    });

    await alert.present();
  }

  resetNewEvent() {
    this.newEvent = {
      id: 0,
      event_name: '',
      date: '',
      faculty_id: 0,
      student_name: '',
      section_id: 0
    };
  }

  startEdit(event: Event) {
    this.editingEvent = { ...event };
  }

  cancelEdit() {
    this.editingEvent = null;
  }
}