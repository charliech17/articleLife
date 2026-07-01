export interface IArticleCategory {
  categoryId: string;
  categoryName: string;
  description?: string;
  order?: number;
}

export interface IArticleCategoryDTO {
  categoryName: string;
  description?: string;
  order?: number;
}
