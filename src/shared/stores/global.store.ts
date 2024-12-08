import { Injectable, signal } from '@angular/core';
import { IUserAuthInfo } from '../models/user.modes';

@Injectable({ providedIn: 'root' })
export class GlobalStore {
  private _userInfo = signal<IUserAuthInfo>(this.getInitialUserInfo());
  private _hasStoreFinishedInit = signal<boolean>(false);

  userInfo = this._userInfo.asReadonly();
  hasStoreFinishedInit = this._hasStoreFinishedInit.asReadonly();

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
}
