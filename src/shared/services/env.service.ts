import { Injectable } from '@angular/core';
import { environment } from '../env/env.dev';

@Injectable({ providedIn: 'root' })
export class EnvService {
  get baseApiUrl(): string {
    return environment.apiPath;
  }
}
