import { Routes } from '@angular/router';
import { PocComponent } from '../pages/poc/poc.component';
import { HomeComponent } from '../pages/home/home.component';
import { EditArticleComponent } from '../pages/edit-article/edit-article.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'add-article', component: EditArticleComponent },
  { path: 'edit-article/:id', component: EditArticleComponent },
  { path: 'poc', component: PocComponent },
];
