import { inject, Injectable, makeStateKey, PLATFORM_ID, TransferState } from '@angular/core';
import { ENVS } from '../constant/env.constant';
import { isPlatformServer } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class EnvService {
  #platformId = inject(PLATFORM_ID);
  #transferState = inject(TransferState);
  private _baseApiUrlKey = makeStateKey<string>('');

  constructor() {
    // if server side, set the base url
    if (isPlatformServer(this.#platformId)) {
      this.#transferState.set(this._baseApiUrlKey, process.env[ENVS.NG_API_URL]);
    }
  }

  get(key: string): string {
    return process.env[key] || '';
  }

  get baseApiUrl(): string {
    return this.#transferState.get(this._baseApiUrlKey, '');
  }
}
