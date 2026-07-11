import { AfterViewInit, Component, ElementRef, inject, OnDestroy, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { isPlatformBrowser, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { GAME_WORLD_ITEMS, GameWorldItem } from '../../shared/config/game-world.config';

const CHARACTER_SIZE = 64;
const INTERACT_DISTANCE = 75;

@Component({
  selector: 'app-game-map',
  standalone: true,
  imports: [NgClass],
  templateUrl: './game-map.component.html',
  styleUrls: ['./game-map.component.scss']
})
export class GameMapComponent implements AfterViewInit, OnDestroy {
  #platformId = inject(PLATFORM_ID);
  #router = inject(Router);

  arenaRef = viewChild<ElementRef<HTMLDivElement>>('arena');

  /** 地圖上的所有地點：共用項目 + 回家小屋 */
  locations: GameWorldItem[] = [
    ...GAME_WORLD_ITEMS,
    {
      id: 'home',
      name: '溫暖小屋',
      description: '回到文章首頁',
      icon: '🏠',
      url: '/home',
      internal: true,
      mapX: 14,
      mapY: 26,
      actionText: '回首頁'
    }
  ];

  $$pos = signal<{ x: number, y: number }>({ x: 0, y: 0 });
  $$state = signal<'idle' | 'ready' | 'walk' | 'attack'>('idle');
  $$direction = signal<number>(1);
  $$nearby = signal<GameWorldItem | null>(null);
  $$bubble = signal<string>('');

  #keysDown = new Set<string>();
  #moveInterval: any = null;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.#platformId)) {
      return;
    }

    const arena = this.arenaRef()?.nativeElement;
    if (!arena) return;

    // 還原上次位置，否則從地圖中央偏下出發
    let pos = { x: arena.clientWidth / 2 - CHARACTER_SIZE / 2, y: arena.clientHeight * 0.7 };
    const saved = localStorage.getItem('al_map_character_pos');
    if (saved) {
      try {
        pos = JSON.parse(saved);
      } catch (e) { }
    }
    this.$$pos.set(this.clampToArena(pos));
    this.checkProximity();

    setTimeout(() => {
      arena.focus({ preventScroll: true });
      this.showBubble('用方向鍵探索這座小島吧！', 3000);
    });
  }

  ngOnDestroy(): void {
    this.stopMoving();
  }

  showBubble(text: string, durationMs: number = 2000): void {
    this.$$bubble.set(text);
    setTimeout(() => {
      if (this.$$bubble() === text) {
        this.$$bubble.set('');
      }
    }, durationMs);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.goHome();
      return;
    }

    if (event.key === 'Enter') {
      const nearby = this.$$nearby();
      if (nearby) {
        this.interact(nearby);
      }
      event.preventDefault();
      return;
    }

    if (this.$$state() === 'attack') {
      event.preventDefault();
      return;
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      this.#keysDown.add(event.key);
      if (this.$$state() !== 'walk') {
        this.$$state.set('walk');
      }
      this.startMoving();
      event.preventDefault();
    } else if (event.key === ' ' || event.key === 'Spacebar') {
      this.$$state.set('attack');
      this.showBubble('喝啊！', 1000);
      setTimeout(() => {
        this.$$state.set(this.#keysDown.size > 0 ? 'walk' : 'ready');
      }, 500);
      event.preventDefault();
    }
  }

  onKeyUp(event: KeyboardEvent): void {
    this.#keysDown.delete(event.key);
    if (this.#keysDown.size === 0 && this.$$state() === 'walk') {
      this.$$state.set('ready');
      this.stopMoving();
    }
  }

  onFocus(): void {
    if (this.$$state() !== 'attack') {
      this.$$state.set('ready');
    }
  }

  onBlur(): void {
    this.#keysDown.clear();
    this.$$state.set('idle');
    this.stopMoving();
  }

  startMoving(): void {
    if (this.#moveInterval) return;
    const step = 5;
    this.#moveInterval = setInterval(() => {
      const pos = { ...this.$$pos() };
      let moved = false;
      if (this.#keysDown.has('ArrowUp')) { pos.y -= step; moved = true; }
      if (this.#keysDown.has('ArrowDown')) { pos.y += step; moved = true; }
      if (this.#keysDown.has('ArrowLeft')) {
        pos.x -= step;
        this.$$direction.set(-1);
        moved = true;
      }
      if (this.#keysDown.has('ArrowRight')) {
        pos.x += step;
        this.$$direction.set(1);
        moved = true;
      }

      if (moved) {
        this.$$pos.set(this.clampToArena(pos));
        this.checkProximity();
        if (isPlatformBrowser(this.#platformId)) {
          localStorage.setItem('al_map_character_pos', JSON.stringify(this.$$pos()));
        }
      }
    }, 1000 / 60);
  }

  stopMoving(): void {
    if (this.#moveInterval) {
      clearInterval(this.#moveInterval);
      this.#moveInterval = null;
    }
  }

  simulateKey(key: string, isDown: boolean, event: Event): void {
    event.preventDefault();
    const mockEvent = { key, preventDefault: () => { } } as KeyboardEvent;
    if (isDown) {
      this.onKeyDown(mockEvent);
    } else {
      this.onKeyUp(mockEvent);
    }
  }

  clampToArena(pos: { x: number, y: number }): { x: number, y: number } {
    const arena = this.arenaRef()?.nativeElement;
    if (!arena) return pos;
    return {
      x: Math.min(Math.max(pos.x, 0), Math.max(arena.clientWidth - CHARACTER_SIZE, 0)),
      y: Math.min(Math.max(pos.y, 0), Math.max(arena.clientHeight - CHARACTER_SIZE, 0))
    };
  }

  checkProximity(): void {
    const arena = this.arenaRef()?.nativeElement;
    if (!arena) return;

    const pos = this.$$pos();
    const cx = pos.x + CHARACTER_SIZE / 2;
    const cy = pos.y + CHARACTER_SIZE / 2;

    let found: GameWorldItem | null = null;
    for (const loc of this.locations) {
      const lx = (loc.mapX / 100) * arena.clientWidth;
      const ly = (loc.mapY / 100) * arena.clientHeight;
      const distance = Math.sqrt((cx - lx) ** 2 + (cy - ly) ** 2);
      if (distance < INTERACT_DISTANCE) {
        found = loc;
        break;
      }
    }

    if (this.$$nearby()?.id !== found?.id) {
      this.$$nearby.set(found);
    }
  }

  interact(loc: GameWorldItem): void {
    if (!isPlatformBrowser(this.#platformId)) {
      return;
    }
    if (loc.internal) {
      this.#router.navigate([loc.url]);
    } else {
      window.open(loc.url, '_blank');
    }
  }

  goHome(): void {
    this.#router.navigate(['home']);
  }
}
