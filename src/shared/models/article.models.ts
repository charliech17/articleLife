export interface IPageArticleDetails {
  content: IArticleDetails[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
}

export const ArticleTypePublic = 'PUBLIC';
export const ArticleTypePrivate = 'PRIVATE';

export interface IArticleDetails {
  id: number;
  title: string;
  intro: string;
  articleContent: string;
  authorId: string;
  createdTime: string;
  lastModifyTime: string | null;
  viewTimes: number;
  categories: string | null;
  articleType: typeof ArticleTypePublic | typeof ArticleTypePrivate;
}

export type IArticleInfo = Omit<IArticleDetails, 'articleContent'>;

export interface ICurrentViewArticle {
  id: IArticleDetails['id'];
  authorId: IArticleDetails['authorId'];
}

export interface IArticleFile {
  id: number;
  articleId: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdTime: string;
}

export interface IArticleResponses {
  responseText: string;
  articleId: number;
  userId: number;
  userName: string;
  profileImage: string;
  createdTime: string;
  lastModifyTime: string;
  ext1: number;
}
