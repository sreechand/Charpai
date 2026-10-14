/** Split prose by measured height, preserving every word and paragraph. */
export function paginateStoryText(text: string, maxHeight: number, measure: (text: string) => number, firstPageHeight = maxHeight): string[] {
  const tokens = text.match(/\S+\s*|\s+/gu) || [];
  const pages: string[] = [];
  let cursor = 0;
  while (cursor < tokens.length) {
    const availableHeight = pages.length === 0 ? firstPageHeight : maxHeight;
    let low = 1;
    let high = tokens.length - cursor;
    let fits = 0;
    while (low <= high) {
      const count = Math.floor((low + high) / 2);
      if (measure(tokens.slice(cursor, cursor + count).join("").trim()) <= availableHeight) {
        fits = count;
        low = count + 1;
      } else high = count - 1;
    }
    if (!fits) {
      // Scripts without spaces and long URLs still need safe page boundaries.
      const chars = Array.from(tokens[cursor]);
      let count = 1;
      while (count < chars.length && measure(chars.slice(0, count + 1).join("")) <= availableHeight) count++;
      pages.push(chars.slice(0, count).join("").trim());
      const rest = chars.slice(count).join("");
      if (rest) tokens[cursor] = rest;
      else cursor++;
    } else {
      pages.push(tokens.slice(cursor, cursor + fits).join("").trim());
      cursor += fits;
    }
  }
  return pages.filter(Boolean);
}
