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

interface Section {
  id: number;
  name: string;
}

@Component({
  selector: 'app-faculty',
  templateUrl: './faculty.page.html',
  styleUrls: ['./faculty.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]  // Import necessary modules

})

export class FacultyPage implements OnInit {

  facultyName: string | null = null;

  facultyId: number | null = null;
  events: Event[] = [];
  showAddEventForm = false;
  editingEvent: Event | null = null;
  sections: Section[] = [];

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
  ) { }

  // Add to FacultyPage class ARCHIVEEEEE
  archivedEvents: Event[] = [];
  selectedTab = 'active';

  loadArchivedEvents() {
    if (this.facultyId) {
      this.eventsService.getArchivedEvents(this.facultyId).subscribe(
        response => {
          if (response.success) {
            this.archivedEvents = response.events;
          }
        },
        error => console.error('Error loading archived events:', error)
      );
    }
  }
  // ARCHIVE END

  ngOnInit() {
    this.loadArchivedEvents();
    console.log('FacultyPage initialized');
    this.authService.facultyName$.subscribe(name => {
      console.log('Received faculty name:', name); // Debug faculty name
      this.facultyName = name;
    });
    this.loadSections();
    this.authService.facultyId$.subscribe(id => {
      if (id) {
        this.facultyId = id;
        this.loadEvents();
      }
    });

  }
  onTabChange(event: any) {
    this.selectedTab = event.detail.value;
  }
  loadSections() {
    console.log('Loading sections...');
    this.eventsService.getSections().subscribe(
      response => {
        console.log('Sections loaded:', response);
        if (response.success) {
          this.sections = response.sections;
        } else {
          console.error('Failed to load sections:', response);
        }
      },
      error => {
        console.error('Error loading sections:', error);
      }
    );
  }

  loadEvents() {
    console.log('Loading events for faculty ID:', this.facultyId);
    if (this.facultyId) {
      this.eventsService.getFacultyEvents(this.facultyId).subscribe(
        response => {
          console.log('Events loaded:', response);
          if (response.success) {
            this.events = response.events;
          } else {
            console.error('Failed to load events:', response);
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
            this.loadEvents(); // Refresh the list
            this.editingEvent = null; // Exit editing mode
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
    console.log("napindot");
    this.editingEvent = { ...event };
  }

  cancelEdit() {
    this.editingEvent = null;
  }
}