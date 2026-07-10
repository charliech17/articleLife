import { Component, inject, HostListener, signal, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AllLayoutsComponent } from '../shared/layouts/all-layouts/all-layouts.component';
import { GlobalService } from '../shared/services/global.service';
import { ThemeService } from '../shared/services/theme.service';
import { AiChatComponent } from '../pages/home/components/ai-chat/ai-chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AllLayoutsComponent, AiChatComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'articleLife';
  #globalService = inject(GlobalService);
  #themeService = inject(ThemeService);
  #platformId = inject(PLATFORM_ID);
  #ngZone = inject(NgZone);

  $showAiButton = signal<boolean>(false);
  $aiButtonPos = signal<{top: number, left: number}>({top: 0, left: 0});
  selectedText = '';

  @HostListener('document:selectionchange')
  onSelectionChange() {
    if (!isPlatformBrowser(this.#platformId)) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      this.$showAiButton.set(false);
      this.selectedText = '';
    }
  }

  @HostListener('document:mouseup', ['$event'])
  @HostListener('document:touchend', ['$event'])
  @HostListener('document:keyup', ['$event'])
  onSelectionFinish(event: Event) {
    if (!isPlatformBrowser(this.#platformId)) return;
    
    // Defer to let selection update
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        this.$showAiButton.set(false);
        this.selectedText = '';
        return;
      }
      
      const text = selection.toString().trim();
      if (text.length > 0) {
        this.selectedText = text;
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Ensure UI updates inside Angular zone
        this.#ngZone.run(() => {
          this.$aiButtonPos.set({
            top: rect.top + window.scrollY - 50,
            left: rect.left + window.scrollX + (rect.width / 2)
          });
          this.$showAiButton.set(true);
        });
      } else {
        this.$showAiButton.set(false);
        this.selectedText = '';
      }
    }, 10);
  }

  sendToAi(event: MouseEvent, autoSend: boolean) {
    event.stopPropagation();
    event.preventDefault();
    if (this.selectedText) {
      this.#globalService.aiChatTrigger.next({ text: this.selectedText, autoSend });
      this.$showAiButton.set(false);
      window.getSelection()?.removeAllRanges();
    }
  }
}
