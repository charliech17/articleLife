import { provideServerRendering } from '@angular/platform-server';
import { Routes } from '@angular/router';
import { PocComponent } from '../pages/poc/poc.component';
import { HomeComponent } from '../pages/home/home.component';
import { EditArticleComponent } from '../pages/edit-article/edit-article.component';
import { ViewArticleComponent } from '../pages/view-article/view-article.component';
import { LoginComponent } from '../pages/auth/login/login.component';
import { RegisterComponent } from '../pages/auth/register/register.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'add-article', component: EditArticleComponent },
  { path: 'edit-article/:id', component: EditArticleComponent },
  { path: 'view-article/:id', component: ViewArticleComponent },
  { path: 'poc', component: PocComponent },
];
