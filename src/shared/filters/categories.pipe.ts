import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'categories',
  standalone: true,
})
export class CategoriesPipe implements PipeTransform {
  transform(categories: string | null, joinSymbol: string = ', '): string {
    if (!categories) {
      return '未分類';
    }

    return JSON.parse(categories).join(joinSymbol);
  }
}
