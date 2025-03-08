import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'home', loadComponent: () => import('../pages/home/home.component').then(m => m.HomeComponent) },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('../pages/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('../pages/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'add-article', loadComponent: () => import('../pages/edit-article/edit-article.component').then(m => m.EditArticleComponent) },
  {
    path: 'edit-article/:id',
    loadComponent: () => import('../pages/edit-article/edit-article.component').then(m => m.EditArticleComponent),
  },
  {
    path: 'view-article/:id',
    loadComponent: () => import('../pages/view-article/view-article.component').then(m => m.ViewArticleComponent),
  },
  { path: 'poc', loadComponent: () => import('../pages/poc/poc.component').then(m => m.PocComponent) },
];
