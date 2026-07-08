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

  static decodeBase64Id(id: string): string {
    if (!id) return id;
    try {
      const decoded = atob(id);
      // Verify if it was truly base64 encoded by re-encoding
      // Note: we need to handle padding differences if any, but btoa(decoded) 
      // will generate the standard base64 string.
      // A more robust check for base64 strings:
      if (btoa(decoded) === id.trim() || btoa(decoded).replace(/=/g, '') === id.trim().replace(/=/g, '')) {
        return decoded;
      }
      return id;
    } catch (e) {
      return id;
    }
  }
}
