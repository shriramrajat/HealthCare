// Accessibility utilities for the healthcare app

/**
 * ARIA live region announcer for screen readers
 */
export class LiveRegionAnnouncer {
  private static instance: LiveRegionAnnouncer;
  private liveRegion: HTMLElement | null = null;

  private constructor() {
    this.createLiveRegion();
  }

  public static getInstance(): LiveRegionAnnouncer {
    if (!LiveRegionAnnouncer.instance) {
      LiveRegionAnnouncer.instance = new LiveRegionAnnouncer();
    }
    return LiveRegionAnnouncer.instance;
  }

  private createLiveRegion(): void {
    if (typeof window === 'undefined') return;

    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.setAttribute('aria-relevant', 'additions text');
    this.liveRegion.className = 'sr-only';
    this.liveRegion.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;
    
    document.body.appendChild(this.liveRegion);
  }

  public announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.liveRegion) return;

    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;

    // Clear after announcement to allow repeated messages
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, 1000);
  }
}

/**
 * Focus management utilities
 */
export class FocusManager {
  private static focusStack: HTMLElement[] = [];

  /**
   * Trap focus within a container element
   */
  public static trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }

  /**
   * Save current focus and return a function to restore it
   */
  public static saveFocus(): () => void {
    const activeElement = document.activeElement as HTMLElement;
    this.focusStack.push(activeElement);

    return () => {
      const elementToFocus = this.focusStack.pop();
      if (elementToFocus && elementToFocus.focus) {
        elementToFocus.focus();
      }
    };
  }

  /**
   * Get all focusable elements within a container
   */
  public static getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }

  /**
   * Move focus to the next focusable element
   */
  public static focusNext(container?: HTMLElement): void {
    const focusableElements = this.getFocusableElements(container || document.body);
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    const nextIndex = (currentIndex + 1) % focusableElements.length;
    focusableElements[nextIndex]?.focus();
  }

  /**
   * Move focus to the previous focusable element
   */
  public static focusPrevious(container?: HTMLElement): void {
    const focusableElements = this.getFocusableElements(container || document.body);
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    const previousIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
    focusableElements[previousIndex]?.focus();
  }
}

/**
 * Keyboard navigation utilities
 */
export const keyboardNavigation = {
  /**
   * Handle arrow key navigation for lists
   */
  handleArrowNavigation: (
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (index: number) => void,
    orientation: 'horizontal' | 'vertical' = 'vertical'
  ) => {
    const { key } = event;
    let newIndex = currentIndex;

    if (orientation === 'vertical') {
      if (key === 'ArrowDown') {
        newIndex = (currentIndex + 1) % items.length;
      } else if (key === 'ArrowUp') {
        newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
      }
    } else {
      if (key === 'ArrowRight') {
        newIndex = (currentIndex + 1) % items.length;
      } else if (key === 'ArrowLeft') {
        newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
      }
    }

    if (newIndex !== currentIndex) {
      event.preventDefault();
      onIndexChange(newIndex);
      items[newIndex]?.focus();
    }
  },

  /**
   * Handle escape key to close modals/dropdowns
   */
  handleEscape: (event: KeyboardEvent, onEscape: () => void) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onEscape();
    }
  },

  /**
   * Handle enter/space key for button-like elements
   */
  handleActivation: (event: KeyboardEvent, onActivate: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onActivate();
    }
  }
};

/**
 * ARIA utilities
 */
export const ariaUtils = {
  /**
   * Generate unique IDs for ARIA relationships
   */
  generateId: (prefix: string = 'aria'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Set ARIA expanded state
   */
  setExpanded: (element: HTMLElement, expanded: boolean) => {
    element.setAttribute('aria-expanded', expanded.toString());
  },

  /**
   * Set ARIA selected state
   */
  setSelected: (element: HTMLElement, selected: boolean) => {
    element.setAttribute('aria-selected', selected.toString());
  },

  /**
   * Set ARIA checked state
   */
  setChecked: (element: HTMLElement, checked: boolean | 'mixed') => {
    element.setAttribute('aria-checked', checked.toString());
  },

  /**
   * Set ARIA disabled state
   */
  setDisabled: (element: HTMLElement, disabled: boolean) => {
    element.setAttribute('aria-disabled', disabled.toString());
  },

  /**
   * Set ARIA hidden state
   */
  setHidden: (element: HTMLElement, hidden: boolean) => {
    element.setAttribute('aria-hidden', hidden.toString());
  },

  /**
   * Set ARIA live region
   */
  setLive: (element: HTMLElement, live: 'off' | 'polite' | 'assertive') => {
    element.setAttribute('aria-live', live);
  },

  /**
   * Set ARIA describedby relationship
   */
  setDescribedBy: (element: HTMLElement, describedByIds: string | string[]) => {
    const ids = Array.isArray(describedByIds) ? describedByIds.join(' ') : describedByIds;
    element.setAttribute('aria-describedby', ids);
  },

  /**
   * Set ARIA labelledby relationship
   */
  setLabelledBy: (element: HTMLElement, labelledByIds: string | string[]) => {
    const ids = Array.isArray(labelledByIds) ? labelledByIds.join(' ') : labelledByIds;
    element.setAttribute('aria-labelledby', ids);
  }
};

/**
 * Screen reader utilities
 */
export const screenReaderUtils = {
  /**
   * Announce form validation errors
   */
  announceFormError: (fieldName: string, errorMessage: string) => {
    const announcer = LiveRegionAnnouncer.getInstance();
    announcer.announce(`Error in ${fieldName}: ${errorMessage}`, 'assertive');
  },

  /**
   * Announce form submission success
   */
  announceFormSuccess: (message: string = 'Form submitted successfully') => {
    const announcer = LiveRegionAnnouncer.getInstance();
    announcer.announce(message, 'polite');
  },

  /**
   * Announce loading states
   */
  announceLoading: (message: string = 'Loading...') => {
    const announcer = LiveRegionAnnouncer.getInstance();
    announcer.announce(message, 'polite');
  },

  /**
   * Announce completion of loading
   */
  announceLoadingComplete: (message: string = 'Content loaded') => {
    const announcer = LiveRegionAnnouncer.getInstance();
    announcer.announce(message, 'polite');
  },

  /**
   * Announce navigation changes
   */
  announceNavigation: (pageName: string) => {
    const announcer = LiveRegionAnnouncer.getInstance();
    announcer.announce(`Navigated to ${pageName}`, 'polite');
  }
};

/**
 * Color contrast utilities
 */
export const colorUtils = {
  /**
   * Calculate relative luminance of a color
   */
  getLuminance: (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio: (color1: [number, number, number], color2: [number, number, number]): number => {
    const lum1 = colorUtils.getLuminance(...color1);
    const lum2 = colorUtils.getLuminance(...color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  },

  /**
   * Check if color combination meets WCAG AA standards
   */
  meetsWCAGAA: (color1: [number, number, number], color2: [number, number, number]): boolean => {
    return colorUtils.getContrastRatio(color1, color2) >= 4.5;
  },

  /**
   * Check if color combination meets WCAG AAA standards
   */
  meetsWCAGAAA: (color1: [number, number, number], color2: [number, number, number]): boolean => {
    return colorUtils.getContrastRatio(color1, color2) >= 7;
  }
};

/**
 * Performance utilities for accessibility
 */
export const performanceUtils = {
  /**
   * Debounce function for reducing excessive announcements
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle function for performance-critical operations
   */
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

export default {
  LiveRegionAnnouncer,
  FocusManager,
  keyboardNavigation,
  ariaUtils,
  screenReaderUtils,
  colorUtils,
  performanceUtils
};