import { Component, HostListener, inject } from '@angular/core';
import { ArticleOutlineService } from '../../services/article-outline.service';

@Component({
  selector: 'app-article-outline',
  standalone: true,
  imports: [],
  templateUrl: './article-outline.component.html',
  styleUrl: './article-outline.component.scss',
})
export class ArticleOutlineComponent {
  #articleOutlineService = inject(ArticleOutlineService);
  $articleOutline = this.#articleOutlineService.$outlineContent;
  $activeHeaderId = this.#articleOutlineService.$activeHeaderId;

  goToTitle(titleId: string): void {
    const element = document.getElementById(titleId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.scrollY; // 設定中心點

    // 檢查當前滾動位置在哪個標題範圍內
    for (let i = 0; i < this.$articleOutline().length; i++) {
      const currentHeader = this.$articleOutline()[i];
      const nextHeader = this.$articleOutline()[i + 1];
      if (
        scrollPosition >= currentHeader.offsetTop - 2 && // -2是位移誤差，避免標題偵測誤差。
        (!nextHeader || scrollPosition < nextHeader.offsetTop - 2) // 如果沒有下一個 header，則直到頁面底部。
      ) {
        this.#articleOutlineService.setActiveHeaderId(currentHeader.id);
        break;
      } else {
        this.#articleOutlineService.setActiveHeaderId(null);
      }
    }
  }
}
