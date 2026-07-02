/**
 * Utility functions for clean PDF generation using html2pdf.js
 * and bypassing the oklch parser crash in html2canvas.
 */

// Simple mathematically correct OKLCH to sRGB conversion
export function oklchToRgb(l: number, c: number, h: number, a: number = 1): string {
  // Convert h from degrees to radians
  const hRad = (h * Math.PI) / 180;
  
  // Oklch to Oklab
  const L = l;
  const a_lab = c * Math.cos(hRad);
  const b_lab = c * Math.sin(hRad);
  
  // Oklab to LMS
  const l_lms = L + 0.3963377774 * a_lab + 0.2158037573 * b_lab;
  const m_lms = L - 0.1055613458 * a_lab - 0.0638541728 * b_lab;
  const s_lms = L - 0.0894841775 * a_lab - 1.291485548 * b_lab;
  
  // LMS to linear sRGB
  const l_cube = Math.pow(Math.max(0, l_lms), 3);
  const m_cube = Math.pow(Math.max(0, m_lms), 3);
  const s_cube = Math.pow(Math.max(0, s_lms), 3);
  
  const r_lin = +4.0767416621 * l_cube - 3.3077115913 * m_cube + 0.2309699292 * s_cube;
  const g_lin = -1.2684380046 * l_cube + 2.6097574011 * m_cube - 0.3413193965 * s_cube;
  const b_lin = -0.0041960863 * l_cube - 0.7034186147 * m_cube + 1.707614701 * s_cube;
  
  // linear sRGB to sRGB (gamma correction)
  const toSRGB = (x: number) => {
    return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
  };
  
  const r = Math.min(255, Math.max(0, Math.round(toSRGB(r_lin) * 255)));
  const g = Math.min(255, Math.max(0, Math.round(toSRGB(g_lin) * 255)));
  const b = Math.min(255, Math.max(0, Math.round(toSRGB(b_lin) * 255)));
  
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// Replaces any instances of oklch(...) in CSS text with standard rgb/rgba fallbacks
export function replaceOklchInCss(cssText: string): string {
  return cssText.replace(/oklch\(([^)]+)\)/g, (match, content) => {
    try {
      const parts = content.trim().split(/\s+/);
      
      if (parts.includes('from')) {
        return 'rgb(100, 100, 100)';
      }
      
      const lVal = parseFloat(parts[0]);
      const cVal = parseFloat(parts[1]);
      const hVal = parseFloat(parts[2]);
      
      let alpha = 1;
      const slashIndex = parts.indexOf('/');
      if (slashIndex !== -1 && parts[slashIndex + 1]) {
        const aPart = parts[slashIndex + 1];
        if (aPart.endsWith('%')) {
          alpha = parseFloat(aPart) / 100;
        } else {
          alpha = parseFloat(aPart);
        }
      } else if (parts[3] === '/' && parts[4]) {
        const aPart = parts[4];
        if (aPart.endsWith('%')) {
          alpha = parseFloat(aPart) / 100;
        } else {
          alpha = parseFloat(aPart);
        }
      } else if (parts[3] && parts[3].startsWith('/')) {
        const aPart = parts[3].substring(1);
        if (aPart.endsWith('%')) {
          alpha = parseFloat(aPart) / 100;
        } else {
          alpha = parseFloat(aPart);
        }
      }
      
      if (isNaN(lVal) || isNaN(cVal) || isNaN(hVal)) {
        return 'rgb(100, 100, 100)';
      }
      
      return oklchToRgb(lVal, cVal, hVal, isNaN(alpha) ? 1 : alpha);
    } catch (e) {
      return 'rgb(100, 100, 100)';
    }
  });
}

interface RestoredStyle {
  el: HTMLStyleElement | HTMLLinkElement;
  type: 'style' | 'link';
  originalText?: string;
  tempStyleEl?: HTMLStyleElement;
}

let restoredStyles: RestoredStyle[] = [];

/**
 * Preprocess all style tags and stylesheets to eliminate oklch() color functions
 * before generating a canvas/PDF.
 */
export async function preprocessStylesheets(): Promise<void> {
  restoredStyles = [];
  const styleElements = Array.from(document.querySelectorAll('style'));
  const linkElements = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];

  // Process <style> tags
  for (const styleEl of styleElements) {
    const text = styleEl.innerHTML;
    if (text.includes('oklch')) {
      restoredStyles.push({ el: styleEl, type: 'style', originalText: text });
      const cleanText = replaceOklchInCss(text);
      styleEl.innerHTML = cleanText;
    }
  }

  // Process <link> tags from same-origin
  for (const linkEl of linkElements) {
    try {
      if (!linkEl.href) continue;
      const url = new URL(linkEl.href, window.location.origin);
      if (url.origin !== window.location.origin) continue;

      const response = await fetch(linkEl.href);
      if (response.ok) {
        const text = await response.text();
        if (text.includes('oklch')) {
          const cleanText = replaceOklchInCss(text);
          const tempStyle = document.createElement('style');
          tempStyle.innerHTML = cleanText;
          document.head.appendChild(tempStyle);
          
          linkEl.disabled = true;
          restoredStyles.push({ el: linkEl, type: 'link', tempStyleEl: tempStyle });
        }
      }
    } catch (err) {
      console.warn("Could not preprocess stylesheet:", linkEl.href, err);
    }
  }
}

/**
 * Restore all style tags and stylesheets to their original state after PDF generation.
 */
export function restoreStylesheets(): void {
  for (const item of restoredStyles) {
    if (item.type === 'style' && item.originalText !== undefined) {
      (item.el as HTMLStyleElement).innerHTML = item.originalText;
    } else if (item.type === 'link') {
      (item.el as HTMLLinkElement).disabled = false;
      if (item.tempStyleEl) {
        item.tempStyleEl.remove();
      }
    }
  }
  restoredStyles = [];
}
