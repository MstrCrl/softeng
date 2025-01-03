// login.ts
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../auth.service';
import { HttpClientModule } from '@angular/common/http';  // Add this import

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, HttpClientModule]
})
export class LoginPage {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private router: Router, private authService: AuthService, private http: HttpClient) {}

  login() {
    console.log('Login method triggered');
    this.authService.login(this.username, this.password).subscribe(
      (response) => {
        if (response.success) {
          console.log('Login successful, role:', response.role);
          console.log('Faculty ID:', response.faculty_id);
          
          if (response.role === 'student') 
          {
            this.router.navigate(['/home']);
          }
          else if (response.role === 'admin') {
            this.router.navigate(['/admin']);
          }
          else 
          {
            // Pass faculty_id as a query parameter
            this.router.navigate(['/faculty'], {
              queryParams: { id: response.faculty_id }
            });
          }
        } else {
          this.errorMessage = 'Invalid credentials';
          alert('Invalid credentials');
        }
      },
      (error) => {
        console.error('Login error:', error);
        this.errorMessage = 'An error occurred during login';
        alert('Login error occurred');
      }
    );
  }
}