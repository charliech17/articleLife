export interface IBattleArticle {
  id: number;
  title: string;
  intro?: string | null;
  viewTimes: number;
  categoryName?: string | null;
}

export interface IBattle {
  id: number;
  battleDate: string;
  status: 'ONGOING' | 'FINISHED';
  articleA: IBattleArticle;
  articleB: IBattleArticle;
  votesA: number;
  votesB: number;
  winnerArticleId?: number | null;
  hasVoted: boolean;
  votedArticleId?: number | null;
}

export interface IBattleVoteDTO {
  articleId: number;
  voterKey?: string | null;
}

export interface IBattleParticipation {
  /** 今日是否有對戰可參加 */
  hasBattle: boolean;
  /** 今日是否已投過票（voterKey 或同 IP 已投） */
  participated: boolean;
}

export interface IBattleLeaderboardEntry {
  articleId: number;
  title: string;
  categoryName?: string | null;
  wins: number;
  totalVotes: number;
}
