import { Component, inject, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { EInputFaUser, FaUsersComponent } from '../../../../shared/components/fa-icons/fa-users/fa-users.component';
import { DatePipe } from '@angular/common';
import { IArticleListDetails, IArticleResponses } from '../../view-article.component';
import { ApiArticleResponseService } from '../../../../shared/services/api/api-article-response/api-article-response.service';

@Component({
  selector: 'app-article-response',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, FaUsersComponent],
  templateUrl: './article-response.component.html',
  styleUrl: './article-response.component.scss',
})
export class ArticleResponseComponent {
  #apiArticleResponseService = inject(ApiArticleResponseService);

  $inputArticleListInfo = input.required<IInputArticleListInfo>({ alias: 'inputArticleListInfo' });
  outputAddResponse = output<IArticleResponses>();

  responseControl = new FormControl('', { nonNullable: true });
  eInputFaUser = EInputFaUser;

  addResponse(): void {
    const reqBody = {
      articleId: this.$inputArticleListInfo().articleDetails.id,
      userId: -1,
      responseText: this.responseControl.getRawValue(),
    };
    this.#apiArticleResponseService.createArticleResponse(reqBody).subscribe({
      next: createdArticle => {
        this.responseControl.reset();
        this.outputAddResponse.emit(createdArticle.responseData);
      },
    });
  }
}

interface IInputArticleListInfo {
  articleDetails: IArticleListDetails;
  articleResponses: IArticleResponses[];
}
