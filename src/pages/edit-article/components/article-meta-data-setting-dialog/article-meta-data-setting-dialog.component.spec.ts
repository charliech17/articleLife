import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleMetaDataSettingDialogComponent } from './article-meta-data-setting-dialog.component';

describe('ArticleMetaDataSettingDialogComponent', () => {
  let component: ArticleMetaDataSettingDialogComponent;
  let fixture: ComponentFixture<ArticleMetaDataSettingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleMetaDataSettingDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticleMetaDataSettingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
