import { Component, OnInit, signal, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiAiService } from '../../../../shared/services/api/api-ai/api-ai.service';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat.component.html',
  styleUrl: './ai-chat.component.scss'
})
export class AiChatComponent implements OnInit {

  #apiAiService = inject(ApiAiService);

  $isOpen = signal<boolean>(false);
  $messages = signal<ChatMessage[]>([]);
  $inputText = signal<string>('');
  $isTyping = signal<boolean>(false);

  @ViewChild('chatMessagesContainer') private chatMessagesContainer!: ElementRef;

  private readonly STORAGE_KEY = 'al_ai_chat_history';
  readonly maxHistory = 20;

  constructor() { }

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.$messages.set(parsed);
            return;
          }
        } catch (e) {
          console.error('Failed to parse chat history', e);
        }
      }
    }

    // Initial greeting if no history
    this.$messages.set([
      {
        id: this.generateId(),
        sender: 'ai',
        text: '你好！我是 ArticleLife 助理，有什麼我可以幫忙的嗎？',
        timestamp: new Date()
      }
    ]);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
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

    // Call API
    this.#apiAiService.chat(text).subscribe({
      next: (res) => {
        const aiMsg: ChatMessage = {
          id: this.generateId(),
          sender: 'ai',
          text: res.responseData || '不好意思，我現在有點無法回答您的問題。',
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
        const aiMsg: ChatMessage = {
          id: this.generateId(),
          sender: 'ai',
          text: '很抱歉，伺服器連線出現問題，請稍後再試！',
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
    if (event.key === 'Enter' && !event.shiftKey) {
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
