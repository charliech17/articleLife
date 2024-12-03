import { Component, computed, effect, ElementRef, input, OnInit, output, signal, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { EditTitleComponent, IEditTitleInput } from '../edit-title/edit-title.component';

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [ReactiveFormsModule, EditTitleComponent],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.scss',
})
export class TextareaComponent implements OnInit {
  $iptTextarea = input.required<ITextareaInput>({ alias: 'iptTextarea' });
  $cptTextareaClass = computed(() => {
    return `cus-edit_${this.$iptTextarea().headerType}-title`;
  });
  optUpdateText = output<string>();
  timeOutId: ReturnType<typeof setTimeout> | undefined = undefined;

  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;
  textControl = new FormControl('', { nonNullable: true });

  constructor() {
    this.onInputChangeResizeTextarea();
  }

  ngOnInit(): void {
    this.textControl.setValue(this.$iptTextarea().initText);
  }

  private onInputChangeResizeTextarea(): void {
    effect(() => {
      this.$iptTextarea();
      this.resizeTextarea();
    });
  }

  handleInputEvent(): void {
    this.resizeTextarea();
    this.debounceTextInput();
  }

  private debounceTextInput() {
    clearTimeout(this.timeOutId);
    this.timeOutId = setTimeout(() => {
      this.emitToParent(this.textControl.value);
    });
  }

  resizeTextarea(): void {
    this.textarea.nativeElement.style.height = 'auto';
    this.textarea.nativeElement.style.height = `${this.textarea.nativeElement.scrollHeight}px`;
  }

  handleChangeEvent(): void {
    this.emitToParent(this.textControl.value);
  }

  emitToParent(newText: string): void {
    // Emit to parent
    this.optUpdateText.emit(newText);
  }
}

interface ITextareaInput {
  headerType: 'h1' | 'h2';
  placeholder: string;
  initText: string;
  titleColor?: IEditTitleInput['color'];
}
