import { Routes } from '@angular/router';
import { PocComponent } from '../pages/poc/poc.component';
import { HomeComponent } from '../pages/home/home.component';

export const routes: Routes = [
  { path: 'poc', component: PocComponent },
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
];
