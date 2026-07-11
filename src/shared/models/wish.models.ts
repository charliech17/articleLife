export interface IWish {
  id: number;
  wishContent: string;
  wisherName?: string | null;
  contactEmail?: string | null;
  ip?: string | null;
  completed: boolean;
  createdAt: string;
}

export interface IWishCreateDTO {
  wishContent: string;
  wisherName?: string | null;
  contactEmail?: string | null;
}
