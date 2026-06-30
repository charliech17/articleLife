import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IMotto, IMottoDTO } from '../../../models/motto.models';

@Injectable({ providedIn: 'root' })
export class ApiMottoService {
  #http = inject(HttpClient);
  private apiUrl = 'api/mottos';

  constructor() { }

  getRandomMotto(): Observable<IMotto> {
    return this.#http.get<IMotto>(`${this.apiUrl}`);
  }

  getAllMottos(): Observable<IMotto[]> {
    return this.#http.get<IMotto[]>(`${this.apiUrl}/all`);
  }

  createMotto(mottoData: IMottoDTO): Observable<IMotto> {
    return this.#http.post<IMotto>(`${this.apiUrl}/create`, mottoData)
  }

  updateMotto(mottoId: string, mottoData: IMottoDTO): Observable<IMotto> {
    return this.#http.post<IMotto>(`${this.apiUrl}/update/${mottoId}`, mottoData)
  }

  deleteMotto(mottoId: string): Observable<void> {
    return this.#http.post<void>(`${this.apiUrl}/delete/${mottoId}`, {});
  }
}
