export class AppUtil {
  static getCookie(name: string): string | null {
    const value = document.cookie;
    const parts = value.split('; ');
    for (let part of parts) {
      const [key, val] = part.split('=');
      if (key === name) {
        return decodeURIComponent(val);
      }
    }
    return null;
  }
}
