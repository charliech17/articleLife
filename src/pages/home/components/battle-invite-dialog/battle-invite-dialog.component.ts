import { Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { ApiBattleService } from '../../../../shared/services/api/api-battle/api-battle.service';
import { IBattle } from '../../../../shared/models/battle.models';
import {
  ArticleReadDialogComponent,
  IArticleReadDialogData,
} from '../../../battle-arena/components/article-read-dialog/article-read-dialog.component';

export interface IBattleInviteDialogData {
  /** 由首頁預先取得的今日對戰，避免彈窗開啟後才載入 */
  battle?: IBattle | null;
}

/**
 * 首頁進站邀請彈窗：直接顯示今日對戰並可當場投票
 */
@Component({
  selector: 'app-battle-invite-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './battle-invite-dialog.component.html',
  styleUrl: './battle-invite-dialog.component.scss',
})
export class BattleInviteDialogComponent {
  #dialogRef = inject(MatDialogRef<BattleInviteDialogComponent>);
  #data = inject<IBattleInviteDialogData>(MAT_DIALOG_DATA);
  #apiBattleService = inject(ApiBattleService);
  #dialog = inject(MatDialog);
  #router = inject(Router);

  $$battle = signal<IBattle | null>(this.#data.battle ?? null);
  $$loading = signal<boolean>(!this.#data.battle);
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

  constructor() {
    if (!this.#data.battle) {
      this.#apiBattleService.getCurrentBattle().subscribe({
        next: battle => {
          this.$$battle.set(battle);
          this.$$loading.set(false);
        },
        error: () => this.$$loading.set(false),
      });
    }
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
          this.#apiBattleService.getCurrentBattle().subscribe(battle => this.$$battle.set(battle));
        } else {
          this.$$errorMsg.set('投票失敗，請稍後再試');
        }
      },
    });
  }

  /** 以彈窗瀏覽文章，不離開首頁 */
  viewArticle(articleId: number, title?: string): void {
    const data: IArticleReadDialogData = { articleId, title };
    this.#dialog.open(ArticleReadDialogComponent, {
      data,
      maxWidth: '760px',
      width: '92vw',
      autoFocus: false,
      panelClass: 'al-dialog',
      backdropClass: 'al-dialog-backdrop',
    });
  }

  goToArena(): void {
    this.#dialogRef.close();
    this.#router.navigate(['battle-arena']);
  }

  close(): void {
    this.#dialogRef.close();
  }
}
