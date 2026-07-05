import { marked } from 'marked';

/**
 * 將文章 Intro 的 Markdown 轉換為 HTML，並自動過濾掉圖片
 */
export function parseMarkdownIntro(intro: string | undefined | null): string {
  if (!intro) return '';
  
  // 過濾掉 Markdown 格式的圖片: ![alt](url)
  let processedIntro = intro.replace(/!\[.*?\]\(.*?\)/g, '');
  
  // 轉換成 HTML
  let parsedHtml = marked.parse(processedIntro) as string;
  
  // 過濾掉 HTML 格式的圖片標籤
  parsedHtml = parsedHtml.replace(/<img[^>]*>/gi, '');
  
  return parsedHtml;
}

/**
 * 將文章主要內容的 Markdown 轉換為 HTML，並保留圖片與加上客製化樣式
 */
export function parseMarkdownArticle(md: string | undefined | null): string {
  let markdownString = md || '';
  
  // 移除最一開始的 H1 標題
  markdownString = markdownString.replace(/^\s*#\s+.*?\n/m, '');

  // 轉換成 HTML
  let html = marked.parse(markdownString) as string;
  
  // 給圖片加上預設的圓角與寬度限制
  html = html.replace(/<img([^>]*)>/gi, "<img$1 style='max-width:100%; border-radius: 8px;' />");

  return html;
}
