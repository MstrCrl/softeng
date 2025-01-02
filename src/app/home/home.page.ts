import { Component, OnInit } from '@angular/core'; // Import OnInit interface
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit { // Implement OnInit
  sections: any = [];
  events: any = [];
  selectedSection: any = null;

  constructor(private http: HttpClient) { }

  // Automatically call this method when the component is initialized
  ngOnInit() {
    this.getSections();
    this.showAllEvents();
  }

  // Fetch sections from the API
  getSections() {
    this.http.get('http://localhost/acechedule/sections.php').subscribe((response) => {
      console.log(response);
      this.sections = response;
    });
  }

  // Fetch all events for "Home"
  showAllEvents() {
    this.http.get('http://localhost/acechedule/events.php').subscribe((response) => {
      console.log(response);
      this.events = response;
      this.selectedSection = null; // Reset selected section to show "Home"
    });
  }

  // Fetch events by a specific section
  showEventsBySection(sectionId: number) {
    this.http.get(`http://localhost/acechedule/events.php?section_id=${sectionId}`).subscribe((response) => {
      console.log(response);
      this.events = response;
    });
  }

  // Set the selected section and fetch events for it
  selectSection(section: any) {
    this.selectedSection = section;
    this.showEventsBySection(section.id);
  }
}
