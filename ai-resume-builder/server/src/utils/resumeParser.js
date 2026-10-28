import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

const extractTextFromPdf = async (buffer) => {
  const uint8Array = new Uint8Array(buffer);
  const pdf = await getDocument({ data: uint8Array }).promise;
  let fullText = '';
  const discoveredLinks = new Set();

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    let pageText = '';
    let lastY = null;

    for (const item of content.items) {
      if (!item.str && !item.hasEOL) continue;
      const currentY = item.transform ? item.transform[5] : null;

      // When vertical Y coordinate changes significantly, treat as new line
      if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 3) {
        pageText += '\n';
      } else if (item.hasEOL) {
        pageText += '\n';
      } else if (pageText.length > 0 && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
        pageText += ' ';
      }

      pageText += item.str;
      if (currentY !== null) {
        lastY = currentY;
      }
    }

    fullText += pageText + '\n';

    try {
      const annotations = await page.getAnnotations();
      for (const ann of annotations) {
        const link = ann.url || ann.unsafeUrl;
        if (link && typeof link === 'string') {
          discoveredLinks.add(link.trim());
        }
      }
    } catch {
      // Ignore annotation extraction failures
    }
  }

  if (discoveredLinks.size > 0) {
    fullText += '\n[Extracted Links: ' + Array.from(discoveredLinks).join(', ') + ']\n';
  }

  return fullText.trim();
};

export default extractTextFromPdf;