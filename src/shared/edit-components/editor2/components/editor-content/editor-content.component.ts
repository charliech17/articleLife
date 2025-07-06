import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  HostListener,
  input,
  OnInit,
  output,
  Renderer2,
  signal,
  ViewChild,
} from '@angular/core';
import { IEditorContentInput } from '../../interface/editor.interface';

@Component({
  selector: 'app-editor-content',
  imports: [],
  templateUrl: './editor-content.component.html',
  styleUrl: './editor-content.component.scss',
  standalone: true,
})
export class EditorContentComponent implements OnInit, AfterViewInit {
  @ViewChild('editor') editorRef!: ElementRef;
  @ViewChild('resizer') resizerRef!: ElementRef<HTMLDivElement>;

  activeImage: HTMLImageElement | null = null;
  isResizing = false;
  private startX = 0;
  private startY = 0;
  private startWidth = 0;
  private startHeight = 0;

  $input = input.required<IEditorContentInput>({ alias: 'input' });
  $output = output<string>({ alias: 'output' });

  $$articleContent = signal<string>('');

  ngAfterViewInit(): void {
    // 元件初始化後，確保編輯器有內容且可點擊
    // 預設給一個段落，讓使用者可以馬上開始輸入
    setTimeout(() => {
      this.initBlockElements();
    }, 0);
  }

  initBlockElements(): void {
    const initialParagraph = this.renderer.createElement('p');
    const br = this.renderer.createElement('br');
    this.renderer.appendChild(initialParagraph, br);
    this.renderer.appendChild(this.editorRef.nativeElement, initialParagraph);

    this.$$articleContent.set(this.editorRef.nativeElement.innerHTML);

    this.handleUpdateEditor();
  }

  // handleKeyDown(event: KeyboardEvent): void {
  //   if (event.key === 'Enter' && !event.shiftKey) {
  //     // 1. 防止瀏覽器預設行為
  //     event.preventDefault();

  //     const selection = window.getSelection();
  //     if (!selection || selection.rangeCount === 0) return;

  //     const range = selection.getRangeAt(0);
  //     const editorNode = this.editorRef.nativeElement;

  //     // 2. 核心邏輯：找到游標所在的頂層塊級元素 (在這裡是 <p>)
  //     let currentBlock = range.startContainer;

  //     // 從游標所在的節點 (可能是文字節點) 開始往上層遍歷
  //     // 直到找到編輯器 div 的直接子元素為止，這個子元素就是我們當前的段落
  //     while (currentBlock.parentNode !== editorNode) {
  //       currentBlock = currentBlock.parentNode!;
  //       if (!currentBlock) {
  //         console.error('無法找到當前的塊級元素。');
  //         return;
  //       }
  //     }

  //     // 3. 建立新的 <p> 元素 (與之前相同)
  //     const newParagraph = this.renderer.createElement('p');
  //     const br = this.renderer.createElement('br');
  //     this.renderer.appendChild(newParagraph, br);

  //     // 4. 將新段落插入到當前段落的後面
  //     // renderer.insertBefore 需要父節點、要插入的節點、以及參考節點
  //     // currentBlock.nextSibling 是當前段落的下一個兄弟節點
  //     // 如果 nextSibling 存在，就插在它前面；如果不存在 (即當前段落是最後一個)，insertBefore 會像 appendChild 一樣運作
  //     this.renderer.insertBefore(editorNode, newParagraph, currentBlock.nextSibling);

  //     // 5. 將游標移動到新建立的 <p> 元素內部 (與之前相同)
  //     const newRange = document.createRange();
  //     newRange.setStart(newParagraph, 0);
  //     newRange.collapse(true);

  //     selection.removeAllRanges();
  //     selection.addRange(newRange);

  //     this.handleUpdateEditor();
  //   }
  // }
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      const selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;

      const cursorRange = selection.getRangeAt(0);
      const currentBlock = this.getCurrentBlockElement();
      if (!currentBlock) return;

      // 1. 分割區塊
      const rangeToSplit = document.createRange();
      rangeToSplit.setStart(cursorRange.startContainer, cursorRange.startOffset);
      rangeToSplit.setEnd(currentBlock, currentBlock.childNodes.length);
      const contentToMove = rangeToSplit.extractContents();

      // 2. 建立新段落並移動內容
      const newParagraph = this.renderer.createElement('p');
      this.renderer.appendChild(newParagraph, contentToMove);

      // 3. 將新段落插入 DOM
      this.renderer.insertBefore(currentBlock.parentNode, newParagraph, currentBlock.nextSibling);

      // 4. 【核心修正】在所有 DOM 操作完成後，統一檢查並修正兩個相關區塊
      this.ensureBlockIsVisible(currentBlock);
      this.ensureBlockIsVisible(newParagraph);

      // 5. 移動游標到新段落的開頭
      const newCursorRange = document.createRange();
      newCursorRange.setStart(newParagraph, 0);
      newCursorRange.collapse(true);

      selection.removeAllRanges();
      selection.addRange(newCursorRange);
    }
  }

  /**
   * 【新增的輔助函式】
   * 檢查一個塊級元素是否在視覺上為空，如果是，則為其添加 <br> 佔位符。
   * @param blockElement 要檢查的 HTML 元素
   */
  private ensureBlockIsVisible(blockElement: HTMLElement): void {
    // 判斷條件：沒有子元素，或者只有一個 <br>，或者文字內容為空且沒有子圖片等元素
    const isEmpty =
      !blockElement.hasChildNodes() ||
      (blockElement.childNodes.length === 1 && blockElement.firstElementChild?.tagName === 'BR') ||
      (blockElement.textContent?.trim() === '' && blockElement.childElementCount === 0);

    if (isEmpty) {
      // 為了避免重複添加，先清空
      blockElement.innerHTML = '';
      this.renderer.appendChild(blockElement, this.renderer.createElement('br'));
    }
  }

  constructor(private renderer: Renderer2) {
    effect(() => {
      this.$$articleContent.set(this.$input().content);
    });
  }

  ngOnInit() {
    // Initialize the content from input
    this.$$articleContent.set(this.$input().content);
  }

  handleEditorInput(event: Event): void {
    // 當編輯器內容變更時，更新 signal
    const target = event.target as HTMLElement;
    const text = target.innerHTML.trim();
    if (!text || text === '<br>') {
      this.$$articleContent.set('');
      this.initBlockElements();
    }

    this.handleUpdateEditor();
  }

  handleUpdateEditor() {
    this.$output.emit(this.editorRef.nativeElement.innerHTML);
  }

  /**
   * 找到目前游標所在的塊級元素 (p, h1, div 等)
   * @returns HTMLElement | null
   */
  private getCurrentBlockElement(): HTMLElement | null {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    let node = range.startContainer;

    // 從游標所在節點向上遍歷，直到找到編輯器的直接子元素
    while (node && node.parentNode !== this.editorRef.nativeElement) {
      node = node.parentNode as Node;
    }

    return node instanceof HTMLElement ? node : null;
  }

  transformBlock(tagName: string): void {
    const currentBlock = this.getCurrentBlockElement();
    if (!currentBlock || currentBlock.tagName.toLowerCase() === tagName.toLowerCase()) {
      return;
    }

    // 1. 建立新元素
    const newBlock = this.renderer.createElement(tagName);

    // 2. 將舊元素的所有子節點移動到新元素中
    currentBlock.childNodes.forEach(child => {
      this.renderer.appendChild(newBlock, child.cloneNode(true));
    });
    // 或者使用 innerHTML (更簡單但可能有效能問題)
    // newBlock.innerHTML = currentBlock.innerHTML;

    // 3. 在 DOM 中用新元素取代舊元素
    this.renderer.insertBefore(currentBlock.parentNode, newBlock, currentBlock);
    this.renderer.removeChild(currentBlock.parentNode, currentBlock);

    // 4. 恢復游標位置到新元素的末尾
    const selection = window.getSelection();
    if (selection) {
      const newRange = document.createRange();
      selection.removeAllRanges();
      // 將游標設定在新區塊內容的最後面
      newRange.selectNodeContents(newBlock);
      newRange.collapse(false); // false 表示摺疊到範圍的末端
      selection.addRange(newRange);
    }
    this.editorRef.nativeElement.focus();
    this.handleUpdateEditor();
  }

  manualInsertImage(event: Event): void {
    event.preventDefault();

    const url = prompt('請輸入圖片的網址：');
    if (!url) return;

    this.editorRef.nativeElement.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    // 1. 建立 img 元素
    const img = this.renderer.createElement('img');
    this.renderer.setAttribute(img, 'src', url);
    // 為了美觀，可以給一些預設樣式
    this.renderer.setStyle(img, 'maxWidth', '100%');
    this.renderer.setStyle(img, 'height', 'auto');
    this.renderer.setAttribute(img, 'class', 'editor-image');

    // 2. 在游標處插入圖片
    const range = selection.getRangeAt(0);
    range.deleteContents(); // 如果有選取文字，先刪除
    range.insertNode(img);

    // 在img的父元素增加text-align: center; 讓圖片置中
    const parentElement = img.parentElement;
    if (parentElement) {
      this.renderer.setStyle(parentElement, 'textAlign', 'center');
    }

    // 3. 將游標移動到圖片之後，讓使用者可以繼續打字
    const newRange = document.createRange();
    newRange.setStartAfter(img); // 將範圍的起點設在 img 節點之後
    newRange.collapse(true); // 變成游標

    selection.removeAllRanges();
    selection.addRange(newRange);

    this.editorRef.nativeElement.focus();
    this.handleUpdateEditor();
  }

  /**
   * 處理編輯器區域的點擊事件
   */
  onEditorClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target && target.tagName === 'IMG') {
      this.selectImage(target as HTMLImageElement);
    } else {
      this.deselectImage();
    }
  }

  /**
   * 選中一個圖片，並顯示縮放控制項
   */
  private selectImage(img: HTMLImageElement): void {
    this.activeImage = img;
    this.updateResizerPosition();
  }

  /**
   * 取消選中圖片，並隱藏縮放控制項
   */
  private deselectImage(): void {
    this.activeImage = null;
  }

  /**
   * 更新縮放覆蓋層的位置與大小，使其與選中的圖片完全吻合
   */
  private updateResizerPosition(): void {
    if (!this.activeImage || !this.resizerRef) return;

    const resizer = this.resizerRef.nativeElement;
    const editorRect = this.editorRef.nativeElement.getBoundingClientRect();
    const imageRect = this.activeImage.getBoundingClientRect();

    // 計算覆蓋層相對於編輯器的位置
    const top = imageRect.top - editorRect.top + this.editorRef.nativeElement.scrollTop;
    const left = imageRect.left - editorRect.left + this.editorRef.nativeElement.scrollLeft;

    this.renderer.setStyle(resizer, 'top', `${top}px`);
    this.renderer.setStyle(resizer, 'left', `${left}px`);
    this.renderer.setStyle(resizer, 'width', `${imageRect.width}px`);
    this.renderer.setStyle(resizer, 'height', `${imageRect.height}px`);
  }

  /**
   * 當滑鼠在縮放控制點上按下時觸發
   */
  onResizeHandleMouseDown(event: MouseEvent): void {
    console.log('onResizeHandleMouseDown', event);
    event.preventDefault(); // 防止預設行為 (如文字選取)
    event.stopPropagation(); // 阻止事件冒泡到編輯器點擊事件

    if (!this.activeImage) return;

    this.isResizing = true;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startWidth = this.activeImage.offsetWidth;
    this.startHeight = this.activeImage.offsetHeight;
  }

  /**
   * 【重要】使用 HostListener 監聽整個文件的滑鼠移動事件
   * 這樣即使滑鼠移出編輯器，縮放也能繼續
   */
  @HostListener('document:mousemove', ['$event'])
  onDocumentMouseMove(event: MouseEvent): void {
    if (!this.isResizing || !this.activeImage) return;

    const deltaX = event.clientX - this.startX;
    let newWidth = this.startWidth + deltaX;

    // 為了保持圖片比例，我們根據寬度變化來計算高度
    const aspectRatio = this.startHeight / this.startWidth;
    const newHeight = newWidth * aspectRatio;

    const editorWidth = this.editorRef.nativeElement.clientWidth;
    if (newWidth > editorWidth) {
      newWidth = editorWidth;
    }

    // 【新增】限制圖片的最小寬度
    if (newWidth < 20) {
      newWidth = 20;
    }

    // 更新圖片的樣式
    this.renderer.setStyle(this.activeImage, 'width', `${newWidth}px`);
    this.renderer.setStyle(this.activeImage, 'height', `${newHeight}px`);

    // 即時更新覆蓋層的位置
    this.updateResizerPosition();
  }

  /**
   * 【重要】使用 HostListener 監聽整個文件的滑鼠放開事件
   */
  @HostListener('document:mouseup', ['$event'])
  onDocumentMouseUp(event: MouseEvent): void {
    if (this.isResizing) {
      this.isResizing = false;
    }
  }
}
