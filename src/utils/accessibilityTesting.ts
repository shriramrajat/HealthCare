// Accessibility testing utilities for automated a11y checks

/**
 * Accessibility audit results interface
 */
interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  rule: string;
  message: string;
  element?: HTMLElement;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
}

interface AccessibilityAuditResult {
  passed: boolean;
  issues: AccessibilityIssue[];
  score: number; // 0-100
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
}

/**
 * Accessibility testing class
 */
export class AccessibilityTester {
  private static instance: AccessibilityTester;

  private constructor() {}

  public static getInstance(): AccessibilityTester {
    if (!AccessibilityTester.instance) {
      AccessibilityTester.instance = new AccessibilityTester();
    }
    return AccessibilityTester.instance;
  }

  /**
   * Run comprehensive accessibility audit on a container
   */
  public async auditContainer(container: HTMLElement = document.body): Promise<AccessibilityAuditResult> {
    const issues: AccessibilityIssue[] = [];

    // Run all accessibility checks
    issues.push(...this.checkImages(container));
    issues.push(...this.checkForms(container));
    issues.push(...this.checkHeadings(container));
    issues.push(...this.checkLinks(container));
    issues.push(...this.checkButtons(container));
    issues.push(...this.checkColorContrast(container));
    issues.push(...this.checkKeyboardNavigation(container));
    issues.push(...this.checkAriaLabels(container));
    issues.push(...this.checkFocusManagement(container));
    issues.push(...this.checkSemanticStructure(container));

    // Calculate summary
    const summary = {
      errors: issues.filter(issue => issue.type === 'error').length,
      warnings: issues.filter(issue => issue.type === 'warning').length,
      info: issues.filter(issue => issue.type === 'info').length
    };

    // Calculate score (100 - penalty points)
    const errorPenalty = summary.errors * 10;
    const warningPenalty = summary.warnings * 5;
    const infoPenalty = summary.info * 1;
    const score = Math.max(0, 100 - errorPenalty - warningPenalty - infoPenalty);

    return {
      passed: summary.errors === 0,
      issues,
      score,
      summary
    };
  }

  /**
   * Check images for accessibility issues
   */
  private checkImages(container: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const images = container.querySelectorAll('img');

    images.forEach(img => {
      // Check for alt text
      if (!img.hasAttribute('alt')) {
        issues.push({
          type: 'error',
          rule: 'img-alt',
          message: 'Image missing alt attribute',
          element: img,
          severity: 'serious'
        });
      } else if (img.getAttribute('alt') === '') {
        // Empty alt is okay for decorative images, but check if it should be decorative
        const hasAriaHidden = img.getAttribute('aria-hidden') === 'true';
        if (!hasAriaHidden) {
          issues.push({
            type: 'warning',
            rule: 'img-alt-empty',
            message: 'Image has empty alt text but is not marked as decorative',
            element: img,
            severity: 'moderate'
          });
        }
      }

      // Check for meaningful alt text
      const alt = img.getAttribute('alt');
      if (alt && (alt.toLowerCase().includes('image') || alt.toLowerCase().includes('picture'))) {
        issues.push({
          type: 'warning',
          rule: 'img-alt-meaningful',
          message: 'Alt text should be more descriptive than "image" or "picture"',
          element: img,
          severity: 'moderate'
        });
      }
    });

    return issues;
  }

  /**
   * Check forms for accessibility issues
   */
  private checkForms(container: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const formElements = container.querySelectorAll('input, select, textarea');

    formElements.forEach(element => {
      const input = element as HTMLInputElement;
      
      // Check for labels
      const hasLabel = this.hasAssociatedLabel(input);
      if (!hasLabel) {
        issues.push({
          type: 'error',
          rule: 'form-label',
          message: 'Form element missing associated label',
          element: input,
          severity: 'serious'
        });
      }

      // Check for required field indicators
      if (input.hasAttribute('required')) {
        const hasRequiredIndicator = this.hasRequiredIndicator(input);
        if (!hasRequiredIndicator) {
          issues.push({
            type: 'warning',
            rule: 'form-required',
            message: 'Required field should have visual and programmatic indication',
            element: input,
            severity: 'moderate'
          });
        }
      }

      // Check for error messages
      if (input.getAttribute('aria-invalid') === 'true') {
        const hasErrorMessage = this.hasErrorMessage(input);
        if (!hasErrorMessage) {
          issues.push({
            type: 'error',
            rule: 'form-error',
            message: 'Invalid field should have associated error message',
            element: input,
            severity: 'serious'
          });
        }
      }
    });

    return issues;
  }

  /**
   * Check heading structure
   */
  private checkHeadings(container: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    let previousLevel = 0;
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      
      // Check for skipped heading levels
      if (level > previousLevel + 1) {
        issues.push({
          type: 'warning',
          rule: 'heading-order',
          message: `Heading level ${level} skips level ${previousLevel + 1}`,
          element: heading as HTMLElement,
          severity: 'moderate'
        });
      }

      // Check for empty headings
      if (!heading.textContent?.trim()) {
        issues.push({
          type: 'error',
          rule: 'heading-empty',
          message: 'Heading element is empty',
          element: heading as HTMLElement,
          severity: 'serious'
        });
      }

      previousLevel = level;
    });

    // Check for missing h1
    const h1Elements = container.querySelectorAll('h1');
    if (h1Elements.length === 0) {
      issues.push({
        type: 'warning',
        rule: 'heading-h1',
        message: 'Page should have at least one h1 element',
        severity: 'moderate'
      });
    } else if (h1Elements.length > 1) {
      issues.push({
        type: 'info',
        rule: 'heading-h1-multiple',
        message: 'Page has multiple h1 elements',
        severity: 'minor'
      });
    }

    return issues;
  }

  /**
   * Check links for accessibility issues
   */
  private checkLinks(container: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const links = container.querySelectorAll('a');

    links.forEach(link => {
      // Check for href attribute
      if (!link.hasAttribute('href')) {
        issues.push({
          type: 'warning',
          rule: 'link-href',
          message: 'Link element should have href attribute or use button element instead',
          element: link,
          severity: 'moderate'
        });
      }

      // Check for accessible name
      const accessibleName = this.getAccessibleName(link);
      if (!accessibleName) {
        issues.push({
          type: 'error',
          rule: 'link-name',
          message: 'Link must have accessible name',
          element: link,
          severity: 'serious'
        });
      }

      // Check for generic link text
      const genericTexts = ['click here', 'read more', 'more', 'here', 'link'];
      if (accessibleName && genericTexts.includes(accessibleName.toLowerCase().trim())) {
        issues.push({
          type: 'warning',
          rule: 'link-text',
          message: 'Link text should be more descriptive',
          element: link,
          severity: 'moderate'
        });
      }

      // Check for external links
      if (link.hostname && link.hostname !== window.location.hostname) {
        const hasExternalIndicator = link.getAttribute('aria-label')?.includes('external') ||
                                   link.textContent?.includes('external') ||
                                   link.querySelector('[aria-label*="external"]');
        if (!hasExternalIndicator) {
          issues.push({
            type: 'info',
            rule: 'link-external',
            message: 'External link should indicate it opens in new context',
            element: link,
            severity: 'minor'
          });
        }
      }
    });

    return issues;
  }

  /**
   * Check buttons for accessibility issues
   */
  private checkButtons(container: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const buttons = container.querySelectorAll('button, [role="button"]');

    buttons.forEach(button => {
      // Check for accessible name
      const accessibleName = this.getAccessibleName(button as HTMLElement);
      if (!accessibleName) {
        issues.push({
          type: 'error',
          rule: 'button-name',
          message: 'Button must have accessible name',
          element: button as HTMLElement,
          severity: 'serious'
        });
      }

      // Check for keyboard accessibility
      if (button.tagName !== 'BUTTON') {
        const hasTabIndex = button.hasAttribute('tabindex');
        const hasKeyHandler = button.hasAttribute('onkeydown') || button.hasAttribute('onkeyup');
        
        if (!hasTabIndex) {
          issues.push({
            type: 'error',
            rule: 'button-keyboard',
            message: 'Custom button should be keyboard accessible',
            element: button as HTMLElement,
            severity: 'serious'
          });
        }
      }
    });

    return issues;
  }

  /**
   * Check color contrast (simplified check)
   */
  private checkColorContrast(container: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    
    // This is a simplified check - in a real implementation, you'd use a proper color contrast library
    const textElements = container.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, label');
    
    textElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const fontSize = parseFloat(styles.fontSize);
      const fontWeight = styles.fontWeight;
      
      // Check for very small text
      if (fontSize < 12) {
        issues.push({
          type: 'warning',
          rule: 'color-contrast-size',
          message: 'Text size may be too small for good readability',
          element: element as HTMLElement,
          severity: 'moderate'
        });
      }

      // Check for low contrast colors (simplified)
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      if (color === 'rgb(128, 128, 128)' && backgroundColor === 'rgb(255, 255, 255)') {
        issues.push({
          type: 'warning',
          rule: 'color-contrast',
          message: 'Color contrast may be insufficient',
          element: element as HTMLElement,
          severity: 'moderate'
        });
      }
    });

    return issues;
  }

  /**
   * Check keyboard navigation
   */
  private checkKeyboardNavigation(container: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const focusableElements = container.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.forEach(element => {
      const tabIndex = element.getAttribute('tabindex');
      
      // Check for positive tabindex (anti-pattern)
      if (tabIndex && parseInt(tabIndex) > 0) {
        issues.push({
          type: 'warning',
          rule: 'tabindex-positive',
          message: 'Avoid positive tabindex values',
          element: element as HTMLElement,
          severity: 'moderate'
        });
      }

      // Check for focus indicators
      const styles = window.getComputedStyle(element as HTMLElement, ':focus');
      const outline = styles.outline;
      const boxShadow = styles.boxShadow;
      
      if (outline === 'none' && boxShadow === 'none') {
        issues.push({
          type: 'warning',
          rule: 'focus-indicator',
          message: 'Focusable element should have visible focus indicator',
          element: element as HTMLElement,
          severity: 'moderate'
        });
      }
    });

    return issues;
  }

  /**
   * Check ARIA labels and attributes
   */
  private checkAriaLabels(container: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const elementsWithAria = container.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]');

    elementsWithAria.forEach(element => {
      // Check aria-labelledby references
      const labelledBy = element.getAttribute('aria-labelledby');
      if (labelledBy) {
        const ids = labelledBy.split(' ');
        ids.forEach(id => {
          if (!container.querySelector(`#${id}`)) {
            issues.push({
              type: 'error',
              rule: 'aria-labelledby',
              message: `aria-labelledby references non-existent element with id "${id}"`,
              element: element as HTMLElement,
              severity: 'serious'
            });
          }
        });
      }

      // Check aria-describedby references
      const describedBy = element.getAttribute('aria-describedby');
      if (describedBy) {
        const ids = describedBy.split(' ');
        ids.forEach(id => {
          if (!container.querySelector(`#${id}`)) {
            issues.push({
              type: 'error',
              rule: 'aria-describedby',
              message: `aria-describedby references non-existent element with id "${id}"`,
              element: element as HTMLElement,
              severity: 'serious'
            });
          }
        });
      }
    });

    return issues;
  }

  /**
   * Check focus management
   */
  private checkFocusManagement(container: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    
    // Check for focus traps in modals
    const modals = container.querySelectorAll('[role="dialog"], [aria-modal="true"]');
    modals.forEach(modal => {
      const focusableElements = modal.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) {
        issues.push({
          type: 'warning',
          rule: 'modal-focus',
          message: 'Modal should contain at least one focusable element',
          element: modal as HTMLElement,
          severity: 'moderate'
        });
      }
    });

    return issues;
  }

  /**
   * Check semantic structure
   */
  private checkSemanticStructure(container: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    
    // Check for landmark elements
    const landmarks = container.querySelectorAll('main, nav, aside, section, article, header, footer');
    if (landmarks.length === 0) {
      issues.push({
        type: 'info',
        rule: 'landmarks',
        message: 'Page should use semantic landmark elements',
        severity: 'minor'
      });
    }

    // Check for list structure
    const listItems = container.querySelectorAll('li');
    listItems.forEach(li => {
      const parent = li.parentElement;
      if (parent && !['UL', 'OL'].includes(parent.tagName)) {
        issues.push({
          type: 'error',
          rule: 'list-structure',
          message: 'List item must be contained within ul or ol element',
          element: li,
          severity: 'serious'
        });
      }
    });

    return issues;
  }

  /**
   * Helper methods
   */
  private hasAssociatedLabel(element: HTMLElement): boolean {
    const id = element.id;
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    
    if (ariaLabel || ariaLabelledBy) return true;
    if (id && document.querySelector(`label[for="${id}"]`)) return true;
    
    // Check if wrapped in label
    let parent = element.parentElement;
    while (parent) {
      if (parent.tagName === 'LABEL') return true;
      parent = parent.parentElement;
    }
    
    return false;
  }

  private hasRequiredIndicator(element: HTMLElement): boolean {
    const ariaRequired = element.getAttribute('aria-required') === 'true';
    const hasRequiredAttr = element.hasAttribute('required');
    
    // Check for visual indicators (asterisk, "required" text, etc.)
    const label = this.getAssociatedLabel(element);
    const hasVisualIndicator = label?.textContent?.includes('*') || 
                              label?.textContent?.toLowerCase().includes('required');
    
    return (ariaRequired || hasRequiredAttr) && hasVisualIndicator;
  }

  private hasErrorMessage(element: HTMLElement): boolean {
    const describedBy = element.getAttribute('aria-describedby');
    if (describedBy) {
      const ids = describedBy.split(' ');
      return ids.some(id => {
        const errorElement = document.getElementById(id);
        return errorElement && (
          errorElement.getAttribute('role') === 'alert' ||
          errorElement.textContent?.toLowerCase().includes('error') ||
          errorElement.classList.contains('error')
        );
      });
    }
    return false;
  }

  private getAssociatedLabel(element: HTMLElement): HTMLElement | null {
    const id = element.id;
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) return label as HTMLElement;
    }
    
    // Check if wrapped in label
    let parent = element.parentElement;
    while (parent) {
      if (parent.tagName === 'LABEL') return parent;
      parent = parent.parentElement;
    }
    
    return null;
  }

  private getAccessibleName(element: HTMLElement): string {
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;
    
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const ids = ariaLabelledBy.split(' ');
      const texts = ids.map(id => {
        const el = document.getElementById(id);
        return el?.textContent || '';
      });
      return texts.join(' ').trim();
    }
    
    return element.textContent?.trim() || '';
  }
}

/**
 * Quick accessibility check function
 */
export const checkAccessibility = async (container?: HTMLElement): Promise<AccessibilityAuditResult> => {
  const tester = AccessibilityTester.getInstance();
  return await tester.auditContainer(container);
};

/**
 * Generate accessibility report
 */
export const generateAccessibilityReport = (result: AccessibilityAuditResult): string => {
  const { passed, issues, score, summary } = result;
  
  let report = `Accessibility Audit Report\n`;
  report += `==========================\n\n`;
  report += `Overall Score: ${score}/100\n`;
  report += `Status: ${passed ? 'PASSED' : 'FAILED'}\n\n`;
  report += `Summary:\n`;
  report += `- Errors: ${summary.errors}\n`;
  report += `- Warnings: ${summary.warnings}\n`;
  report += `- Info: ${summary.info}\n\n`;
  
  if (issues.length > 0) {
    report += `Issues Found:\n`;
    report += `=============\n\n`;
    
    issues.forEach((issue, index) => {
      report += `${index + 1}. [${issue.type.toUpperCase()}] ${issue.rule}\n`;
      report += `   ${issue.message}\n`;
      report += `   Severity: ${issue.severity}\n`;
      if (issue.element) {
        report += `   Element: ${issue.element.tagName.toLowerCase()}`;
        if (issue.element.id) report += `#${issue.element.id}`;
        if (issue.element.className) report += `.${issue.element.className.split(' ').join('.')}`;
        report += `\n`;
      }
      report += `\n`;
    });
  }
  
  return report;
};

export default AccessibilityTester;