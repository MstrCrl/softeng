import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { AdminService, User, NewStudent, NewFaculty } from '../admin.service';
import { EventsService, Event } from '../events.service.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class AdminPage implements OnInit {
  // Existing properties
  users: User[] = [];
  sections: any[] = [];
  selectedSegment = 'users';
  showAddUserForm = false;
  userType: 'student' | 'faculty' = 'student';


  events: Event[] = [];
  archivedEvents: Event[] = [];
  showAddEventForm = false;
  editingEvent: Event | null = null;

  newStudent: NewStudent = {
    name: '',
    section_id: 0,
    username: '',
    password: ''
  };

  newFaculty: NewFaculty = {
    name: '',
    username: '',
    password: ''
  };

  newEvent: Event = {
    id: 0,
    event_name: '',
    date: '',
    faculty_id: 0,
    student_name: '',
    section_id: 0
  };

  constructor(
    private adminService: AdminService,
    private eventsService: EventsService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.loadUsers();
    this.loadSections();
    this.loadEvents();
    this.loadArchivedEvents();
  }

  // Added missing methods that were in HTML
  onUserTypeChange() {
    this.resetForms();
  }

   async addUser() {
    if (this.userType === 'student') {
      this.adminService.addStudent(this.newStudent).subscribe(
        response => {
          if (response.success) {
            this.loadUsers();
            this.showAddUserForm = false;
            this.resetForms();
          }
        },
        error => console.error('Error adding student:', error)
      );
    } else {
      this.adminService.addFaculty(this.newFaculty).subscribe(
        response => {
          if (response.success) {
            this.loadUsers();
            this.showAddUserForm = false;
            this.resetForms();
          }
        },
        error => console.error('Error adding faculty:', error)
      );
    }
  }

  async deleteUser(userId: number) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this user?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            this.adminService.deleteUser(userId).subscribe(
              response => {
                if (response.success) {
                  this.loadUsers();
                }
              },
              error => console.error('Error deleting user:', error)
            );
          }
        }
      ]
    });

    await alert.present();
  }

  // Existing methods
  loadUsers() {
    this.adminService.getUsers().subscribe(
      response => {
        if (response.success) {
          this.users = response.users;
        }
      },
      error => console.error('Error loading users:', error)
    );
  }

  loadSections() {
    this.eventsService.getSections().subscribe(
      response => {
        if (response.success) {
          this.sections = response.sections;
        }
      },
      error => console.error('Error loading sections:', error)
    );
  }

  loadEvents() {
    this.adminService.getAllEvents().subscribe(
      response => {
        if (response.success) {
          this.events = response.events;
        }
      },
      error => console.error('Error loading events:', error)
    );
  }

  loadArchivedEvents() {
    this.adminService.getAllArchivedEvents().subscribe(
      response => {
        if (response.success) {
          this.archivedEvents = response.events;
        }
      },
      error => console.error('Error loading archived events:', error)
    );
  }

  resetForms() {
    this.newStudent = {
      name: '',
      section_id: 0,
      username: '',
      password: ''
    };
    this.newFaculty = {
      name: '',
      username: '',
      password: ''
    };
  }

  async addEvent() {
    this.adminService.addEventAsAdmin(this.newEvent).subscribe(
      response => {
        if (response.success) {
          this.loadEvents();
          this.showAddEventForm = false;
          this.resetNewEvent();
        }
      },
      error => console.error('Error adding event:', error)
    );
  }

  async updateEvent() {
    if (this.editingEvent) {
      this.adminService.updateEventAsAdmin(this.editingEvent.id, this.editingEvent).subscribe(
        response => {
          if (response.success) {
            this.loadEvents();
            this.editingEvent = null;
          }
        },
        error => console.error('Error updating event:', error)
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
            this.adminService.deleteEventAsAdmin(eventId).subscribe(
              response => {
                if (response.success) {
                  this.loadEvents();
                }
              },
              error => console.error('Error deleting event:', error)
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

  // Helper getters
  get facultyUsers() {
    return this.users.filter(user => user.role === 'faculty');
  }
  
  get studentUsers() {
    return this.users.filter(user => user.role === 'student');
  }
}