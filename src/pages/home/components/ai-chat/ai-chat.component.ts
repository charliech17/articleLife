import { Component, OnInit, signal, ViewChild, ElementRef, AfterViewChecked, inject } from '@angular/core';
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
export class AiChatComponent implements OnInit, AfterViewChecked {

  #apiAiService = inject(ApiAiService);

  $isOpen = signal<boolean>(false);
  $messages = signal<ChatMessage[]>([]);
  $inputText = signal<string>('');
  $isTyping = signal<boolean>(false);

  @ViewChild('chatMessagesContainer') private chatMessagesContainer!: ElementRef;

  constructor() { }

  ngOnInit(): void {
    // Initial greeting
    this.$messages.set([
      {
        id: Date.now().toString(),
        sender: 'ai',
        text: '你好！我是 ArticleLife 助理，有什麼我可以幫忙的嗎？',
        timestamp: new Date()
      }
    ]);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.$isOpen.update(v => !v);
  }

  sendMessage() {
    const text = this.$inputText().trim();
    if (!text) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date()
    };

    this.$messages.update(msgs => [...msgs, userMsg]);
    this.$inputText.set('');
    this.$isTyping.set(true);

    // Call API
    this.#apiAiService.chat(text).subscribe({
      next: (res) => {
        const aiMsg: ChatMessage = {
          id: Date.now().toString(),
          sender: 'ai',
          text: res.responseData || '不好意思，我現在有點無法回答您的問題。',
          timestamp: new Date()
        };
        this.$messages.update(msgs => [...msgs, aiMsg]);
        this.$isTyping.set(false);
      },
      error: (err) => {
        console.error('Failed to get AI response', err);
        const aiMsg: ChatMessage = {
          id: Date.now().toString(),
          sender: 'ai',
          text: '很抱歉，伺服器連線出現問題，請稍後再試！',
          timestamp: new Date()
        };
        this.$messages.update(msgs => [...msgs, aiMsg]);
        this.$isTyping.set(false);
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

  private scrollToBottom(): void {
    try {
      if (this.chatMessagesContainer) {
        this.chatMessagesContainer.nativeElement.scrollTop = this.chatMessagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) { }
  }
}
