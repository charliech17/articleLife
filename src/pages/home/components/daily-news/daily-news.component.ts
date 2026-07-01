import { Component, OnInit, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ApiNewsService, DailyNews } from '../../../../shared/services/api/api-news/api-news.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-daily-news',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './daily-news.component.html',
  styleUrl: './daily-news.component.scss'
})
export class DailyNewsComponent implements OnInit, OnDestroy {

  #apiNewsService = inject(ApiNewsService);
  #destroy$ = new Subject<void>();

  // Use signal for data
  $$newsList = signal<DailyNews[]>([]);

  constructor() { }

  ngOnInit(): void {
    this.fetchNews();
  }

  ngOnDestroy(): void {
    this.#destroy$.next();
    this.#destroy$.complete();
  }

  private fetchNews() {
    this.#apiNewsService.getDailyNews(0, 10)
      .pipe(takeUntil(this.#destroy$))
      .subscribe({
        next: (res) => {
          if (res.responseData && res.responseData.content.length > 0) {
            this.$$newsList.set(res.responseData.content);
          } else {
            // Fallback to mock data if DB is empty
            this.setMockData();
          }
        },
        error: (err) => {
          console.error('Failed to fetch daily news', err);
          this.setMockData();
        }
      });
  }

  private setMockData() {
    this.$$newsList.set([
      {
        id: 1,
        title: '科技巨頭發布最新 AI 模型 (Mock)',
        summary: '在今日的開發者大會上，發布了擁有千億參數的新一代多模態 AI 模型，將大幅提升程式開發與影像辨識能力。',
        publishedDate: new Date().toISOString(),
        createdTime: new Date().toISOString(),
        url: '#'
      },
      {
        id: 2,
        title: '全球經濟復甦超乎預期 (Mock)',
        summary: '根據最新發布的全球經濟展望報告，今年度的經濟成長率預測上修至 3.2%，主要受惠於新興市場的強勁需求。',
        publishedDate: new Date(Date.now() - 86400000).toISOString(),
        createdTime: new Date(Date.now() - 86400000).toISOString(),
        url: '#'
      }
    ]);
  }

  onReadMore(event: Event, news: DailyNews) {
    if (news.url && news.url !== '#') {
      // Allow default link behavior to open news
      window.open(news.url, '_blank');
    } else {
      event.preventDefault();
      alert(`即將前往閱讀: ${news.title}`);
    }
  }
}
