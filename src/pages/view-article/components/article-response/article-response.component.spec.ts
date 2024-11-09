import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleResponseComponent } from './article-response.component';

describe('ArticleResponseComponent', () => {
  let component: ArticleResponseComponent;
  let fixture: ComponentFixture<ArticleResponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleResponseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticleResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
