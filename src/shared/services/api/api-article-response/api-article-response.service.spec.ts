import { TestBed } from '@angular/core/testing';

import { ApiArticleResponseService } from './api-article-response.service';

describe('ApiArticleResponseService', () => {
  let service: ApiArticleResponseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiArticleResponseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
