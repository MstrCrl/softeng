// edit-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { StudentProfileService } from '../student-profile.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html'
})
export class EditProfileComponent implements OnInit {
  profile: any = {};
  sections: any[] = [];
  isEditing = false;

  constructor(
    private profileService: StudentProfileService,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Get user_id from localStorage or your auth service
    const userId = localStorage.getItem('user_id');
    if (userId) {
      this.loadProfile(parseInt(userId));
      this.loadSections();
    }
  }

  loadProfile(userId: number) {
    this.profileService.getStudentProfile(userId).subscribe({
      next: (response) => {
        if (response.success) {
          this.profile = response.data;
        }
      },
      error: (error) => {
        this.showToast('Error loading profile');
      }
    });
  }

  loadSections() {
    this.profileService.getSections().subscribe({
      next: (response) => {
        if (response.success) {
          this.sections = response.data;
        }
      },
      error: (error) => {
        this.showToast('Error loading sections');
      }
    });
  }

  saveProfile() {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      this.profileService.updateProfile(parseInt(userId), this.profile).subscribe({
        next: async (response) => {
          if (response.success) {
            await this.showToast('Profile updated successfully');
            this.isEditing = false;
          }
        },
        error: async (error) => {
          await this.showToast('Error updating profile');
        }
      });
    }
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }
}