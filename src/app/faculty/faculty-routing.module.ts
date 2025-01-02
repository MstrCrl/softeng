import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FacultyPage } from './faculty.page';

const routes: Routes = [
  {
    path: '',
    component: FacultyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FacultyPageRoutingModule {}
