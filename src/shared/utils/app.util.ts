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

  static isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  }
}
