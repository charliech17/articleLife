import { Injectable } from '@angular/core';
import { environment } from '../env/env';

@Injectable({ providedIn: 'root' })
export class EnvService {
  get baseApiUrl(): string {
    return environment.apiPath;
  }
}
