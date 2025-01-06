
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
import { ToastController } from '@ionic/angular';


interface Section {
  id: number;
  name: string;
}
interface ProfileData {
  name: string;
  username: string;
  password: string;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-faculty',
  templateUrl: './faculty.page.html',
  styleUrls: ['./faculty.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]  // Import necessary modules

})

export class FacultyPage implements OnInit {
  

    // Add these properties
    showProfileModal = false;
    isEditing = false;
    profile = {
      name: '',
      username: '',
      password: '',
      status: 'active'
    };

  // profile
  showProfileForm = false;
  profileData: ProfileData = {
    name: '',
    username: '',
    password: '',
    status: 'active'
  };  

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
    student_name: 'All',
    section_id: 0
  };


  events1: any[] = [];
  eventComments: { [key: number]: any[] } = {};
  newComments: { [key: number]: string } = {};
  expandedEvents: Set<number> = new Set();
  userId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private eventsService: EventsService,
    private alertController: AlertController,
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router
  ) { 
    this.userId = localStorage.getItem('user_id');
  }


  logout() {
    this.authService.logout();
    console.log("logout")
    // this.router.navigate(['/login']); // Redirect to the login page after logout
  }

  // COMMENTS
  // New methods for comments
  toggleComments(eventId: number) {
    if (this.expandedEvents.has(eventId)) {
      this.expandedEvents.delete(eventId);
    } else {
      this.expandedEvents.add(eventId);
      this.loadComments(eventId);
    }
  }

  loadComments(eventId: number) {
    this.http.get(`http://localhost:3000/api/comments/${eventId}`).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.eventComments[eventId] = response.data;
        }
      },
      error: async (error) => {
        const toast = await this.toastController.create({
          message: 'Error loading comments',
          duration: 2000,
          position: 'bottom'
        });
        toast.present();
      }
    });
  }

  async addComment(eventId: number) {
    if (!this.newComments[eventId]?.trim() || !this.userId) {
      return;
    }

    const commentData = {
      event_id: eventId,
      user_id: this.userId,
      comment_text: this.newComments[eventId]
    };

    this.http.post('http://localhost:3000/api/comments', commentData).subscribe({
      next: async (response: any) => {
        if (response.success) {
          this.loadComments(eventId);
          this.newComments[eventId] = '';
          const toast = await this.toastController.create({
            message: 'Comment added successfully',
            duration: 2000,
            position: 'bottom'
          });
          toast.present();
        }
      },
      error: async (error) => {
        const toast = await this.toastController.create({
          message: 'Error adding comment',
          duration: 2000,
          position: 'bottom'
        });
        toast.present();
      }
    });
  }







  // Add to FacultyPage class ARCHIVEEEEE
  archivedEvents: Event[] = [];
  selectedTab = 'active';
  
  // ARCHIVE END

  ngOnInit() {
    console.log('FacultyPage initialized');
    
    // First check and archive past events
    this.eventsService.checkAndArchiveEvents().subscribe(
      response => {
        if (response.success) {
          console.log(`${response.archivedCount} events archived`);
          
          // Then load everything else
          this.authService.facultyName$.subscribe(name => {
            console.log('Received faculty name:', name);
            this.facultyName = name;
          });
          
          this.loadSections();
          
          this.authService.facultyId$.subscribe(id => {
            if (id) {
              this.facultyId = id;
              this.loadEvents();
              this.loadArchivedEvents();
            }
          });
        }
      },
      error => {
        console.error('Error checking archives:', error);
        // Still load the page even if archiving fails
        this.authService.facultyName$.subscribe(name => {
          this.facultyName = name;
        });
        this.loadSections();
        this.authService.facultyId$.subscribe(id => {
          if (id) {
            this.facultyId = id;
            this.loadEvents();
            this.loadArchivedEvents();
          }
        });
      }
    );
  }

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



  async updateProfile() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.http.put(`http://localhost:3000/api/faculty/profile/${userId}`, this.profileData).subscribe({
        next: async (response: any) => {
          if (response.success) {
            const toast = await this.toastController.create({
              message: 'Profile updated successfully',
              duration: 2000,
              position: 'bottom'
            });
            toast.present();
            this.showProfileForm = false;
            
            // Update the displayed faculty name if it changed
            if (this.profileData.name !== this.facultyName) {
              this.facultyName = this.profileData.name;
              localStorage.setItem('faculty_name', this.profileData.name);
            }
          }
        },
        error: async (error) => {
          const toast = await this.toastController.create({
            message: 'Error updating profile',
            duration: 2000,
            position: 'bottom'
          });
          toast.present();
        }
      });
    }
  }
  // Add a button/method to open the modal
  openProfile() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.http.get(`http://localhost:3000/api/faculty/profile/${userId}`).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.profile = {
              name: response.data.name,
              username: response.data.username,
              password: '', // Don't show the actual password
              status: response.data.status
            };
            this.showProfileModal = true;
            this.isEditing = false;
          }
        },
        error: async (error) => {
          const toast = await this.toastController.create({
            message: 'Error loading profile',
            duration: 2000,
            position: 'bottom'
          });
          toast.present();
        }
      });
    }
  }

  async saveProfile() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.http.put(`http://localhost:3000/api/faculty/profile/${userId}`, this.profile).subscribe({
        next: async (response: any) => {
          if (response.success) {
            const toast = await this.toastController.create({
              message: 'Profile updated successfully',
              duration: 2000,
              position: 'bottom'
            });
            toast.present();
            this.isEditing = false;
            
            // Update the displayed faculty name if it changed
            if (this.profile.name !== this.facultyName) {
              this.facultyName = this.profile.name;
              localStorage.setItem('faculty_name', this.profile.name);
            }
          }
        },
        error: async (error) => {
          const toast = await this.toastController.create({
            message: 'Error updating profile',
            duration: 2000,
            position: 'bottom'
          });
          toast.present();
        }
      });
    }
  }
}