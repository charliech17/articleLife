import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ArticleOutlineService {
  $$outlineContent = signal<IArticleOutline[]>([]);
  $outlineContent = this.$$outlineContent.asReadonly();

  $$activeHeaderId = signal<string | null>(null);
  $activeHeaderId = this.$$activeHeaderId.asReadonly();

  constructor() {}

  setOutlineContent(outlineContent: IArticleOutline[]): void {
    this.$$outlineContent.set(outlineContent);
  }

  setActiveHeaderId(activeHeaderId: string | null): void {
    this.$$activeHeaderId.set(activeHeaderId);
  }
}

export interface IArticleOutline {
  id: string;
  title: string;
  isActive: boolean;
  offsetTop: number;
}
