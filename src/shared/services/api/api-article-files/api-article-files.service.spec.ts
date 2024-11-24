import { TestBed } from '@angular/core/testing';

import { ApiArticleFilesService } from './api-article-files.service';

describe('ApiArticleFilesService', () => {
  let service: ApiArticleFilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiArticleFilesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
