import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IMotto } from '../../../models/motto.models';

@Injectable({ providedIn: 'root' })
export class ApiMottoService {
  #http = inject(HttpClient);
  private apiUrl = 'api/mottos';

  constructor() {}

  getRandomMotto(): Observable<IMotto> {
    return this.#http.get<IMotto>(`${this.apiUrl}`);
  }
}
