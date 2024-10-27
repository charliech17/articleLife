import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleOutlineComponent } from './article-outline.component';

describe('ArticleOutlineComponent', () => {
  let component: ArticleOutlineComponent;
  let fixture: ComponentFixture<ArticleOutlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleOutlineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticleOutlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
