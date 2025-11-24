/**
 * Utility for managing critical CSS and font loading optimization
 */

/**
 * Preload critical fonts programmatically
 * This can be used to dynamically preload fonts based on user preferences or conditions
 */
export function preloadFont(fontUrl: string, fontType: string = 'woff2') {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.type = `font/${fontType}`;
  link.href = fontUrl;
  link.crossOrigin = 'anonymous';
  
  document.head.appendChild(link);
}

/**
 * Preload critical CSS file
 */
export function preloadCSS(cssUrl: string) {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = cssUrl;
  
  document.head.appendChild(link);
  
  // Convert to stylesheet after load
  link.onload = () => {
    link.rel = 'stylesheet';
  };
}

/**
 * Check if fonts are loaded and ready
 */
export async function waitForFontsReady(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;
  
  try {
    await document.fonts.ready;
  } catch (error) {
    console.warn('Font loading check failed:', error);
  }
}

/**
 * Get font loading status
 */
export function getFontLoadingStatus(): 'loading' | 'loaded' | 'error' {
  if (typeof document === 'undefined' || !document.fonts) return 'loaded';
  
  return document.fonts.status === 'loaded' ? 'loaded' : 'loading';
}
