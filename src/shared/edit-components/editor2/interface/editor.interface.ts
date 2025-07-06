export interface IEditorInput extends IEditorContentInput {}

export interface IEditorContentInput {
  content: string;
  isEditMode: boolean;
}
