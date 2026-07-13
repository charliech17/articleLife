import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ApiBattleService } from '../../shared/services/api/api-battle/api-battle.service';
import { IBattle, IBattleLeaderboardEntry } from '../../shared/models/battle.models';

@Component({
  selector: 'app-battle-arena',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule],
  templateUrl: './battle-arena.component.html',
  styleUrls: ['./battle-arena.component.scss']
})
export class BattleArenaComponent implements OnInit {
  #apiBattleService = inject(ApiBattleService);
  #router = inject(Router);

  $$battle = signal<IBattle | null>(null);
  $$leaderboard = signal<IBattleLeaderboardEntry[]>([]);
  $$recentBattles = signal<IBattle[]>([]);
  $$loading = signal<boolean>(true);
  $$voting = signal<boolean>(false);
  $$errorMsg = signal<string>('');

  $$totalVotes = computed(() => {
    const battle = this.$$battle();
    return battle ? battle.votesA + battle.votesB : 0;
  });

  $$percentA = computed(() => {
    const total = this.$$totalVotes();
    return total === 0 ? 50 : Math.round((this.$$battle()!.votesA / total) * 100);
  });

  $$percentB = computed(() => 100 - this.$$percentA());

  /** 投票前隱藏票數，避免從眾效應 */
  $$showResult = computed(() => {
    const battle = this.$$battle();
    return !!battle && (battle.hasVoted || battle.status === 'FINISHED');
  });

  ngOnInit(): void {
    this.#apiBattleService.getCurrentBattle().subscribe({
      next: battle => {
        this.$$battle.set(battle);
        this.$$loading.set(false);
      },
      error: () => this.$$loading.set(false)
    });
    this.#apiBattleService.getWeeklyLeaderboard().subscribe(entries => this.$$leaderboard.set(entries));
    this.#apiBattleService.getRecentBattles().subscribe(battles => this.$$recentBattles.set(battles));
  }

  vote(articleId: number): void {
    const battle = this.$$battle();
    if (!battle || battle.hasVoted || this.$$voting()) {
      return;
    }

    this.$$voting.set(true);
    this.$$errorMsg.set('');
    this.#apiBattleService.vote(battle.id, articleId).subscribe({
      next: updated => {
        this.$$battle.set(updated);
        this.$$voting.set(false);
      },
      error: err => {
        this.$$voting.set(false);
        if (err?.status === 409 || err?.status === 429) {
          this.$$errorMsg.set(typeof err.error === 'string' && err.error ? err.error : '你已經投過票囉！');
          // 同步狀態：重新取得對戰資訊
          this.#apiBattleService.getCurrentBattle().subscribe(battle => this.$$battle.set(battle));
        } else {
          this.$$errorMsg.set('投票失敗，請稍後再試');
        }
      }
    });
  }

  viewArticle(articleId: number): void {
    this.#router.navigate(['ai-view-article', articleId]);
  }

  winnerTitle(battle: IBattle): string {
    if (battle.winnerArticleId == null) {
      return '平手';
    }
    return battle.winnerArticleId === battle.articleA.id ? battle.articleA.title : battle.articleB.title;
  }

  goHome(): void {
    this.#router.navigate(['home']);
  }
}
