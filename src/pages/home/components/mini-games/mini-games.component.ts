import { Component, inject, OnInit, OnDestroy, PLATFORM_ID, signal, HostListener } from '@angular/core';
import { isPlatformBrowser, NgClass } from '@angular/common';

@Component({
  selector: 'app-mini-games',
  standalone: true,
  imports: [NgClass],
  templateUrl: './mini-games.component.html',
  styleUrl: './mini-games.component.scss'
})
export class MiniGamesComponent implements OnInit, OnDestroy {
  #platformId = inject(PLATFORM_ID);

  $$isLightOn = signal<boolean>(true);
  $$isFlickering = signal<boolean>(false);
  $$showLight = signal<boolean>(false);
  $$characterPos = signal<{ x: number, y: number }>({ x: 0, y: 0 });
  $$characterState = signal<'idle' | 'ready' | 'walk' | 'attack'>('idle');
  $$characterDirection = signal<number>(1);
  $$chatBubble = signal<string>(''); // For the fun feature

  $$mouseX = signal<number>(0);
  $$mouseY = signal<number>(0);

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.$$isLightOn()) {
      this.$$mouseX.set(event.clientX);
      this.$$mouseY.set(event.clientY);
    }
  }

  #keysDown = new Set<string>();
  #moveInterval: any = null;
  #idleTimeout: any = null;

  ngOnInit(): void {
    if (isPlatformBrowser(this.#platformId)) {
      const pos = localStorage.getItem('al_character_pos');
      if (pos) {
        try {
          this.$$characterPos.set(JSON.parse(pos));
        } catch (e) { }
      }
    }
  }

  ngOnDestroy(): void {
    this.stopMoving();
    clearTimeout(this.#idleTimeout);
  }

  toggleLight(): void {
    const turningOn = !this.$$isLightOn();
    if (turningOn) {
      this.$$isFlickering.set(true);
      setTimeout(() => {
        this.$$isFlickering.set(false);
        this.$$isLightOn.set(true);
      }, 600); // matches flicker animation duration
    } else {
      this.$$isLightOn.set(false);
    }
  }

  showChatBubble(text: string, durationMs: number = 2000) {
    this.$$chatBubble.set(text);
    setTimeout(() => {
      if (this.$$chatBubble() === text) {
        this.$$chatBubble.set('');
      }
    }, durationMs);
  }

  onCharacterKeyDown(event: KeyboardEvent): void {
    if (this.$$characterState() === 'attack') {
      event.preventDefault();
      return;
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      this.#keysDown.add(event.key);
      if (this.$$characterState() !== 'walk') {
        this.$$characterState.set('walk');
      }
      this.startMoving();
      event.preventDefault();
    } else if (event.key === ' ' || event.key === 'Spacebar') {
      this.$$characterState.set('attack');
      this.showChatBubble('喝啊！', 1000);
      setTimeout(() => {
        this.$$characterState.set(this.#keysDown.size > 0 ? 'walk' : 'ready');
      }, 500); // 0.5s attack animation duration
      event.preventDefault();
    }
  }

  onCharacterKeyUp(event: KeyboardEvent): void {
    this.#keysDown.delete(event.key);
    if (this.#keysDown.size === 0 && this.$$characterState() === 'walk') {
      this.$$characterState.set('ready');
      this.stopMoving();
    }
  }

  onCharacterBlur(): void {
    this.#keysDown.clear();
    this.$$characterState.set('idle');
    this.stopMoving();
    clearTimeout(this.#idleTimeout);
    this.$$chatBubble.set('zzZ...');
    setTimeout(() => this.$$chatBubble.set(''), 3000);
  }

  onCharacterFocus(): void {
    if (this.$$characterState() !== 'attack') {
      this.$$characterState.set('ready');
      this.showChatBubble('準備戰鬥！', 1500);
    }
  }

  startMoving() {
    if (this.#moveInterval) return;
    const step = 6;
    this.#moveInterval = setInterval(() => {
      const pos = this.$$characterPos();
      let moved = false;
      if (this.#keysDown.has('ArrowUp')) { pos.y -= step; moved = true; }
      if (this.#keysDown.has('ArrowDown')) { pos.y += step; moved = true; }
      if (this.#keysDown.has('ArrowLeft')) {
        pos.x -= step;
        this.$$characterDirection.set(-1);
        moved = true;
      }
      if (this.#keysDown.has('ArrowRight')) {
        pos.x += step;
        this.$$characterDirection.set(1);
        moved = true;
      }

      if (moved) {
        this.$$characterPos.set({ ...pos });
        if (isPlatformBrowser(this.#platformId)) {
          localStorage.setItem('al_character_pos', JSON.stringify(this.$$characterPos()));
        }
      }
    }, 1000 / 60);
  }

  stopMoving() {
    if (this.#moveInterval) {
      clearInterval(this.#moveInterval);
      this.#moveInterval = null;
    }
  }

  simulateKey(key: string, isDown: boolean, event: Event): void {
    event.preventDefault();
    const mockEvent = { key, preventDefault: () => { } } as KeyboardEvent;
    if (isDown) {
      this.onCharacterKeyDown(mockEvent);
    } else {
      this.onCharacterKeyUp(mockEvent);
    }
  }
}
