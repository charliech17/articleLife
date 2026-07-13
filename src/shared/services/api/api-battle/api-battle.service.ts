import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { IBattle, IBattleLeaderboardEntry, IBattleVoteDTO } from '../../../models/battle.models';

@Injectable({ providedIn: 'root' })
export class ApiBattleService {
  #http = inject(HttpClient);
  #platformId = inject(PLATFORM_ID);

  private apiUrl = 'api/battles';
  private voterKeyStorageKey = 'battle-voter-key';

  getCurrentBattle(): Observable<IBattle | null> {
    let params = new HttpParams();
    const voterKey = this.getVoterKey();
    if (voterKey) {
      params = params.set('voterKey', voterKey);
    }
    return this.#http.get<IBattle | null>(`${this.apiUrl}/current`, { params });
  }

  vote(battleId: number, articleId: number): Observable<IBattle> {
    const dto: IBattleVoteDTO = { articleId, voterKey: this.getVoterKey() };
    return this.#http.post<IBattle>(`${this.apiUrl}/${battleId}/vote`, dto);
  }

  getWeeklyLeaderboard(): Observable<IBattleLeaderboardEntry[]> {
    return this.#http.get<IBattleLeaderboardEntry[]>(`${this.apiUrl}/leaderboard`);
  }

  getRecentBattles(days = 14): Observable<IBattle[]> {
    const params = new HttpParams().set('days', days);
    return this.#http.get<IBattle[]>(`${this.apiUrl}/recent`, { params });
  }

  /** 訪客投票去重用的指紋，存於 localStorage（SSR 時回傳 null） */
  private getVoterKey(): string | null {
    if (!isPlatformBrowser(this.#platformId)) {
      return null;
    }
    let key = localStorage.getItem(this.voterKeyStorageKey);
    if (!key) {
      key = crypto.randomUUID().replace(/-/g, '');
      localStorage.setItem(this.voterKeyStorageKey, key);
    }
    return key;
  }
}
