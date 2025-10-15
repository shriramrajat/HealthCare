import { useEffect, useRef, useCallback, useState } from 'react';
import { 
  FocusManager, 
  LiveRegionAnnouncer, 
  keyboardNavigation, 
  ariaUtils,
  screenReaderUtils 
} from '../utils/accessibility';

/**
 * Hook for managing focus trap in modals and dialogs
 */
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLElement>(null);
  const restoreFocusRef = useRef<() => void>();

  useEffect(() => {
    if (isActive && containerRef.current) {
      // Save current focus
      restoreFocusRef.current = FocusManager.saveFocus();
      
      // Trap focus in container
      const releaseTrap = FocusManager.trapFocus(containerRef.current);
      
      return () => {
        releaseTrap();
        // Restore focus when trap is released
        if (restoreFocusRef.current) {
          restoreFocusRef.current();
        }
      };
    }
  }, [isActive]);

  return containerRef;
};

/**
 * Hook for keyboard navigation in lists and menus
 */
export const useKeyboardNavigation = (
  items: HTMLElement[],
  orientation: 'horizontal' | 'vertical' = 'vertical'
) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLElement>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    keyboardNavigation.handleArrowNavigation(
      event,
      items,
      currentIndex,
      setCurrentIndex,
      orientation
    );
  }, [items, currentIndex, orientation]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);

  return {
    containerRef,
    currentIndex,
    setCurrentIndex
  };
};

/**
 * Hook for managing ARIA live regions and announcements
 */
export const useLiveRegion = () => {
  const announcer = LiveRegionAnnouncer.getInstance();

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announcer.announce(message, priority);
  }, [announcer]);

  const announceFormError = useCallback((fieldName: string, errorMessage: string) => {
    screenReaderUtils.announceFormError(fieldName, errorMessage);
  }, []);

  const announceFormSuccess = useCallback((message?: string) => {
    screenReaderUtils.announceFormSuccess(message);
  }, []);

  const announceLoading = useCallback((message?: string) => {
    screenReaderUtils.announceLoading(message);
  }, []);

  const announceLoadingComplete = useCallback((message?: string) => {
    screenReaderUtils.announceLoadingComplete(message);
  }, []);

  return {
    announce,
    announceFormError,
    announceFormSuccess,
    announceLoading,
    announceLoadingComplete
  };
};

/**
 * Hook for managing ARIA attributes dynamically
 */
export const useAriaAttributes = () => {
  const generateId = useCallback((prefix?: string) => {
    return ariaUtils.generateId(prefix);
  }, []);

  const setExpanded = useCallback((element: HTMLElement, expanded: boolean) => {
    ariaUtils.setExpanded(element, expanded);
  }, []);

  const setSelected = useCallback((element: HTMLElement, selected: boolean) => {
    ariaUtils.setSelected(element, selected);
  }, []);

  const setChecked = useCallback((element: HTMLElement, checked: boolean | 'mixed') => {
    ariaUtils.setChecked(element, checked);
  }, []);

  const setDisabled = useCallback((element: HTMLElement, disabled: boolean) => {
    ariaUtils.setDisabled(element, disabled);
  }, []);

  const setHidden = useCallback((element: HTMLElement, hidden: boolean) => {
    ariaUtils.setHidden(element, hidden);
  }, []);

  const setDescribedBy = useCallback((element: HTMLElement, describedByIds: string | string[]) => {
    ariaUtils.setDescribedBy(element, describedByIds);
  }, []);

  const setLabelledBy = useCallback((element: HTMLElement, labelledByIds: string | string[]) => {
    ariaUtils.setLabelledBy(element, labelledByIds);
  }, []);

  return {
    generateId,
    setExpanded,
    setSelected,
    setChecked,
    setDisabled,
    setHidden,
    setDescribedBy,
    setLabelledBy
  };
};

/**
 * Hook for form accessibility enhancements
 */
export const useFormAccessibility = () => {
  const { announceFormError, announceFormSuccess } = useLiveRegion();
  const { generateId, setDescribedBy } = useAriaAttributes();

  const enhanceFormField = useCallback((
    fieldElement: HTMLElement,
    labelText: string,
    errorMessage?: string,
    helpText?: string
  ) => {
    const fieldId = fieldElement.id || generateId('field');
    const labelId = generateId('label');
    const errorId = generateId('error');
    const helpId = generateId('help');

    fieldElement.id = fieldId;

    // Set up describedby relationships
    const describedByIds: string[] = [];
    if (helpText) describedByIds.push(helpId);
    if (errorMessage) describedByIds.push(errorId);
    
    if (describedByIds.length > 0) {
      setDescribedBy(fieldElement, describedByIds);
    }

    // Announce errors to screen readers
    if (errorMessage) {
      announceFormError(labelText, errorMessage);
    }

    return {
      fieldId,
      labelId,
      errorId,
      helpId
    };
  }, [generateId, setDescribedBy, announceFormError]);

  return {
    enhanceFormField,
    announceFormError,
    announceFormSuccess
  };
};

/**
 * Hook for managing skip links
 */
export const useSkipLinks = () => {
  const skipLinksRef = useRef<HTMLElement>(null);

  const addSkipLink = useCallback((targetId: string, label: string) => {
    if (!skipLinksRef.current) return;

    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = label;
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50';
    
    skipLinksRef.current.appendChild(skipLink);

    return () => {
      if (skipLinksRef.current && skipLinksRef.current.contains(skipLink)) {
        skipLinksRef.current.removeChild(skipLink);
      }
    };
  }, []);

  return {
    skipLinksRef,
    addSkipLink
  };
};

/**
 * Hook for managing roving tabindex in component groups
 */
export const useRovingTabindex = (items: HTMLElement[], activeIndex: number = 0) => {
  useEffect(() => {
    items.forEach((item, index) => {
      if (item) {
        item.tabIndex = index === activeIndex ? 0 : -1;
      }
    });
  }, [items, activeIndex]);

  const setActiveIndex = useCallback((newIndex: number) => {
    if (newIndex >= 0 && newIndex < items.length) {
      items.forEach((item, index) => {
        if (item) {
          item.tabIndex = index === newIndex ? 0 : -1;
          if (index === newIndex) {
            item.focus();
          }
        }
      });
    }
  }, [items]);

  return { setActiveIndex };
};

/**
 * Hook for managing modal accessibility
 */
export const useModalAccessibility = (isOpen: boolean) => {
  const modalRef = useFocusTrap(isOpen);
  const { announce } = useLiveRegion();
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Save currently focused element
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Announce modal opening
      announce('Dialog opened', 'polite');
      
      // Set aria-hidden on other elements
      const otherElements = document.querySelectorAll('body > *:not([aria-hidden])');
      otherElements.forEach(element => {
        if (element !== modalRef.current && element.getAttribute('aria-hidden') !== 'true') {
          element.setAttribute('aria-hidden', 'true');
          element.setAttribute('data-modal-hidden', 'true');
        }
      });
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Restore aria-hidden
      const hiddenElements = document.querySelectorAll('[data-modal-hidden]');
      hiddenElements.forEach(element => {
        element.removeAttribute('aria-hidden');
        element.removeAttribute('data-modal-hidden');
      });
      
      // Restore focus
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
      
      // Announce modal closing
      announce('Dialog closed', 'polite');
    }

    return () => {
      // Cleanup on unmount
      document.body.style.overflow = '';
      const hiddenElements = document.querySelectorAll('[data-modal-hidden]');
      hiddenElements.forEach(element => {
        element.removeAttribute('aria-hidden');
        element.removeAttribute('data-modal-hidden');
      });
    };
  }, [isOpen, announce, modalRef]);

  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      // This should be handled by the parent component
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isOpen, handleEscapeKey]);

  return modalRef;
};

export default {
  useFocusTrap,
  useKeyboardNavigation,
  useLiveRegion,
  useAriaAttributes,
  useFormAccessibility,
  useSkipLinks,
  useRovingTabindex,
  useModalAccessibility
};