export interface IEditorInput extends IEditorContentInput {}

export interface IEditorContentInput {
  content: string;
  isEditMode: boolean;
}

/**
 * 用於儲存選區路徑和偏移量的序列化格式
 */
export interface SerializableRange {
  startPath: number[];
  startOffset: number;
  endPath: number[];
  endOffset: number;
}

/**
 * 儲存一次編輯器狀態的完整物件
 */
export interface EditorState {
  html: string;
  selection: SerializableRange | null;
}
