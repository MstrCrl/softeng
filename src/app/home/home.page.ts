// home.page.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  sections: any = [];
  events: any = [];
  selectedSection: any = null;
  
  // COMMENTS
  eventComments: { [key: number]: any[] } = {};
  newComments: { [key: number]: string } = {};
  expandedEvents: Set<number> = new Set();


  // Profile related properties
  showProfileModal = false;
  isEditing = false;
  profile: any = {};
  userId: string | null = null;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router, 
    private authService: AuthService,
  ) { this.userId = localStorage.getItem('user_id');
  }
  
  logout() {
    this.showProfileModal = false;
    this.authService.logout(); 
  }
  ngOnInit() {
    this.getSections();
    this.showAllEvents();
    // Get userId from localStorage (set during login)
    this.userId = localStorage.getItem('user_id');
    if (this.userId) {
      this.loadProfile();
    }
  }

  

  // Add these new methods
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


  // Profile related methods
  loadProfile() {
    if (!this.userId) return;
    
    this.http.get(`http://localhost:3000/api/student-profile/${this.userId}`)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.profile = response.data;
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

  saveProfile() {
    if (!this.userId) return;

    this.http.put(`http://localhost:3000/api/student-profile/${this.userId}`, this.profile)
      .subscribe({
        next: async (response: any) => {
          if (response.success) {
            const toast = await this.toastController.create({
              message: 'Profile updated successfully',
              duration: 2000,
              position: 'bottom'
            });
            toast.present();
            this.isEditing = false;
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

  toggleProfileModal() {
    this.showProfileModal = !this.showProfileModal;
    if (this.showProfileModal) {
      this.loadProfile();
    }
  }

  // Existing methods remain the same
  getSections() {
    this.http.get('http://localhost/acechedule/sections.php').subscribe((response) => {
      this.sections = response;
    });
  }

  showAllEvents() {
    this.http.get('http://localhost/acechedule/events.php').subscribe((response) => {
      this.events = response;
      this.selectedSection = null;
    });
  }

  showEventsBySection(sectionId: number) {
    this.http.get(`http://localhost/acechedule/events.php?section_id=${sectionId}`).subscribe((response) => {
      this.events = response;
    });
  }

  selectSection(section: any) {
    this.selectedSection = section;
    if (section) {
      this.showEventsBySection(section.id);
    }
  }
}