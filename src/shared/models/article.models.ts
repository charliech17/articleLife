export interface IArticleDetailsResponse {
  id: number;
  title: string;
  intro: string;
  articleContent: string;
  authorId: string;
  createdTime: string;
  lastModifyTime: string;
  viewTimes: number;
  categories: string | null;
}

export interface IArticleFile {
  id: number;
  articleId: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdTime: string;
  article: IArticleDetailsResponse;
}
