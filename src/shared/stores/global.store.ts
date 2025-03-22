import { Injectable, signal } from '@angular/core';
import { IUserAuthInfo } from '../models/user.modes';
import { ICurrentViewArticle } from '../models/article.models';

@Injectable({ providedIn: 'root' })
export class GlobalStore {
  private _userInfo = signal<IUserAuthInfo>(this.getInitialUserInfo());
  private _hasStoreFinishedInit = signal<boolean>(false);
  private _currentArticleInfo = signal<ICurrentViewArticle | null>(null);

  userInfo = this._userInfo.asReadonly();
  hasStoreFinishedInit = this._hasStoreFinishedInit.asReadonly();
  currentArticleInfo = this._currentArticleInfo.asReadonly();

  getInitialUserInfo(): IUserAuthInfo {
    return {
      id: -1,
      loginId: null,
      email: '',
      emailVerified: false,
      displayName: '',
      profileImage: '',
      lastLogin: '',
      isActive: false,
      createdAt: '',
    };
  }

  setUserInfo(newState: IUserAuthInfo) {
    this._userInfo.set(newState);
  }

  clearUserInfo() {
    this._userInfo.set(this.getInitialUserInfo());
  }

  setStoreFinishedInit() {
    this._hasStoreFinishedInit.set(true);
  }

  setCurrentArticleInfo(newState: ICurrentViewArticle | null) {
    this._currentArticleInfo.set(newState);
  }
}
