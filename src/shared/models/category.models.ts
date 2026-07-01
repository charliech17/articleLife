export interface ICategory {
  id: string;
  name: string;
  description?: string;
  order?: number;
}

export interface ICategoryDTO {
  name: string;
  description?: string;
  order?: number;
}
