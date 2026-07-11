import { Routes } from '@angular/router';
import { adminGuard } from '../core/guards/admin.guard';

export const routes: Routes = [
  { path: 'home', loadComponent: () => import('../pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'ai-view-article/:id', loadComponent: () => import('../pages/ai-view-article/ai-view-article.component').then(m => m.AiViewArticleComponent) },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('../pages/auth/login/login.component').then(m => m.LoginComponent) },
  {
    path: 'forget-password',
    loadComponent: () => import('../pages/auth/forget-password/forget-password.component').then(m => m.ForgetPasswordComponent),
  },
  {
    path: 'reset-password/:token',
    loadComponent: () => import('../pages/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
  },
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
  {
    path: 'view-private-article/:id',
    loadComponent: () => import('../pages/view-article/view-article.component').then(m => m.ViewArticleComponent),
  },
  {
    path: 'manage-motto',
    canActivate: [adminGuard],
    loadComponent: () => import('../pages/manage-motto/manage-motto.component').then(m => m.ManageMottoComponent),
  },
  {
    path: 'manage',
    canActivate: [adminGuard],
    loadComponent: () => import('../pages/manage-index/manage-index.component').then(m => m.ManageIndexComponent),
  },
  {
    path: 'manage/categories',
    canActivate: [adminGuard],
    loadComponent: () => import('../pages/manage-categories/manage-categories.component').then(m => m.ManageCategoriesComponent),
  },
  {
    path: 'manage/requested-topics',
    canActivate: [adminGuard],
    loadComponent: () => import('../pages/manage-requested-topics/manage-requested-topics.component').then(m => m.ManageRequestedTopicsComponent),
  },
  {
    path: 'game-map',
    loadComponent: () => import('../pages/game-map/game-map.component').then(m => m.GameMapComponent),
  },
  {
    path: 'wishing-well',
    loadComponent: () => import('../pages/wishing-well/wishing-well.component').then(m => m.WishingWellComponent),
  },
  {
    path: 'manage/wishes',
    canActivate: [adminGuard],
    loadComponent: () => import('../pages/manage-wishes/manage-wishes.component').then(m => m.ManageWishesComponent),
  },
  {
    path: 'sponsor',
    loadComponent: () => import('../pages/sponsor/sponsor.component').then(m => m.SponsorComponent),
  },
  {
    path: 'sponsor/result',
    loadComponent: () => import('../pages/sponsor-result/sponsor-result.component').then(m => m.SponsorResultComponent),
  },
  { path: 'poc', loadComponent: () => import('../pages/poc/poc.component').then(m => m.PocComponent) },
];
