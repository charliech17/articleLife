import { Component, OnInit, signal, ViewChild, ElementRef, inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { FormsModule } from '@angular/forms';
import { ApiAiService } from '../../../../shared/services/api/api-ai/api-ai.service';
import { GlobalService } from '../../../../shared/services/global.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  safeHtml?: SafeHtml;
  timestamp: Date;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat.component.html',
  styleUrl: './ai-chat.component.scss'
})
export class AiChatComponent implements OnInit, OnDestroy {

  #apiAiService = inject(ApiAiService);
  #globalService = inject(GlobalService);
  #platformId = inject(PLATFORM_ID);
  #router = inject(Router);
  #sanitizer = inject(DomSanitizer);

  $isOpen = signal<boolean>(false);
  $isArticlePage = signal<boolean>(false);
  #routerSub?: Subscription;
  $messages = signal<ChatMessage[]>([]);
  $inputText = signal<string>('');
  $isTyping = signal<boolean>(false);

  @ViewChild('chatMessagesContainer') private chatMessagesContainer!: ElementRef;

  private readonly STORAGE_KEY = 'al_ai_chat_history';
  readonly maxHistory = 20;

  constructor() { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.#platformId)) {
      this.#globalService.aiChatTrigger.subscribe(msg => {
        const text = typeof msg === 'string' ? msg : msg.text;
        const autoSend = typeof msg === 'string' ? true : (msg.autoSend !== false);

        this.$isOpen.set(true);
        this.$inputText.set(text);
        this.scrollToBottomWithDelay();
        // Optional: wait a moment and send automatically
        if (autoSend) {
          setTimeout(() => this.sendMessage(), 100);
        }
      });
      
      this.checkIfArticlePage(window.location.pathname);
      this.#routerSub = this.#router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: any) => {
        this.checkIfArticlePage(event.urlAfterRedirects);
      });
    }

    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Apply markdown parsing to historical messages
            const parsedWithHtml = parsed.map(msg => ({
              ...msg,
              safeHtml: this.parseMarkdown(msg.text)
            }));
            this.$messages.set(parsedWithHtml);
            return;
          }
        } catch (e) {
          console.error('Failed to parse chat history', e);
        }
      }
    }

    // Initial greeting if no history
    const initialText = '你好！我是 ArticleLife 助理，有什麼我可以幫忙的嗎？';
    this.$messages.set([
      {
        id: this.generateId(),
        sender: 'ai',
        text: initialText,
        safeHtml: this.parseMarkdown(initialText),
        timestamp: new Date()
      }
    ]);
  }

  private parseMarkdown(text: string): SafeHtml {
    const rawHtml = marked.parse(text) as string;
    return this.#sanitizer.bypassSecurityTrustHtml(rawHtml);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }

  ngOnDestroy(): void {
    if (this.#routerSub) {
      this.#routerSub.unsubscribe();
    }
  }

  private checkIfArticlePage(url: string) {
    this.$isArticlePage.set(url.includes('/view-article') || url.includes('/ai-view-article'));
  }

  tagCurrentArticle() {
    if (isPlatformBrowser(this.#platformId)) {
      const currentText = this.$inputText();
      this.$inputText.set(currentText + (currentText.length > 0 && !currentText.endsWith(' ') ? ' ' : '') + '[當前文章] ');
      // Focus the textarea (optional, could be handled if we have ViewChild for textarea)
    }
  }

  askAiToSummarize() {
    if (isPlatformBrowser(this.#platformId)) {
      const url = new URL(window.location.href);
      url.searchParams.delete('title');
      const message = `請總結這篇文章：[當前文章]`;
      this.$inputText.set(message);
      this.sendMessage();
    }
  }

  private saveHistory(msgs: ChatMessage[]) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(msgs));
    }
  }

  deleteMessage(id: string) {
    this.$messages.update(msgs => {
      const newMsgs = msgs.filter(m => m.id !== id);
      this.saveHistory(newMsgs);
      return newMsgs;
    });
  }

  toggleChat() {
    this.$isOpen.update(v => !v);
    if (this.$isOpen()) {
      this.scrollToBottomWithDelay();
    }
  }

  sendMessage() {
    const text = this.$inputText().trim();
    if (!text) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: this.generateId(),
      sender: 'user',
      text: text,
      safeHtml: this.parseMarkdown(text),
      timestamp: new Date()
    };

    this.$messages.update(msgs => {
      const newMsgs = [...msgs, userMsg].slice(-this.maxHistory);
      this.saveHistory(newMsgs);
      return newMsgs;
    });
    this.$inputText.set('');
    this.$isTyping.set(true);
    this.scrollToBottomWithDelay();

    let apiText = text;
    if (apiText.includes('[當前文章]')) {
      if (isPlatformBrowser(this.#platformId)) {
        const url = new URL(window.location.href);
        url.searchParams.delete('title');
        apiText = apiText.replace(/\[當前文章\]/g, url.href);
      }
    }

    // Call API
    this.#apiAiService.chat(apiText).subscribe({
      next: (res) => {
        const responseText = res.responseData || '不好意思，我現在有點無法回答您的問題。';
        const aiMsg: ChatMessage = {
          id: this.generateId(),
          sender: 'ai',
          text: responseText,
          safeHtml: this.parseMarkdown(responseText),
          timestamp: new Date()
        };
        this.$messages.update(msgs => {
          const newMsgs = [...msgs, aiMsg].slice(-this.maxHistory);
          this.saveHistory(newMsgs);
          return newMsgs;
        });
        this.$isTyping.set(false);
        this.scrollToBottomWithDelay();
      },
      error: (err) => {
        console.error('Failed to get AI response', err);
        const errorText = '很抱歉，伺服器連線出現問題，請稍後再試！';
        const aiMsg: ChatMessage = {
          id: this.generateId(),
          sender: 'ai',
          text: errorText,
          safeHtml: this.parseMarkdown(errorText),
          timestamp: new Date()
        };
        this.$messages.update(msgs => {
          const newMsgs = [...msgs, aiMsg].slice(-this.maxHistory);
          this.saveHistory(newMsgs);
          return newMsgs;
        });
        this.$isTyping.set(false);
        this.scrollToBottomWithDelay();
      }
    });
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.isComposing) {
      return;
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    if (event.key === 'Enter' && !event.shiftKey) {
      if (isMobile) {
        // Let default behavior (newline) happen on mobile
        return;
      }
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottomWithDelay(): void {
    setTimeout(() => {
      this.scrollToBottom();
    }, 50);
  }

  private scrollToBottom(): void {
    try {
      if (this.chatMessagesContainer) {
        this.chatMessagesContainer.nativeElement.scrollTop = this.chatMessagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) { }
  }
}
