import zlib from 'zlib';

const MAX_TEXT = 20000;

/** Pull searchable words out of a CV. Binary layout is ignored. */
export function extractResumeText(file: Buffer, extension: '.pdf' | '.docx'): string {
  const text = extension === '.docx' ? extractDocx(file) : extractPdf(file);
  return text.replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT);
}

export function extractDocx(file: Buffer): string {
  const xml = readZipEntry(file, 'word/document.xml');
  if (!xml) return '';
  return xml
    .replace(/<w:p[^>]*\/?>/g, '\n')
    .replace(/<[^>]+>/g, ' ');
}

export function extractPdf(file: Buffer): string {
  const parts: string[] = [pdfOperators(file.toString('latin1'))];
  let cursor = 0;
  const marker = Buffer.from('stream');
  while (cursor < file.length) {
    const start = file.indexOf(marker, cursor);
    if (start < 0) break;
    let dataStart = start + marker.length;
    if (file[dataStart] === 0x0d) dataStart += 1;
    if (file[dataStart] === 0x0a) dataStart += 1;
    const end = file.indexOf(Buffer.from('endstream'), dataStart);
    if (end < 0) break;
    const raw = file.subarray(dataStart, end);
    try {
      parts.push(pdfOperators(zlib.inflateSync(raw).toString('latin1')));
    } catch {
      // Not a FlateDecode stream.
    }
    cursor = end + 9;
  }
  return parts.join(' ');
}

function pdfOperators(source: string): string {
  const words: string[] = [];
  const pattern = /\(((?:\\.|[^)\\])*)\)\s*Tj/g;
  let match = pattern.exec(source);
  while (match) {
    words.push(unescapePdf(match[1]));
    match = pattern.exec(source);
  }
  return words.join(' ');
}

function unescapePdf(value: string): string {
  return value.replace(/\\([()\\])/g, '$1').replace(/\\n/g, ' ');
}

function readZipEntry(file: Buffer, name: string): string | null {
  let offset = 0;
  while (offset + 30 < file.length) {
    if (file.readUInt32LE(offset) !== 0x04034b50) return null;
    const method = file.readUInt16LE(offset + 8);
    const compressedSize = file.readUInt32LE(offset + 18);
    const nameLength = file.readUInt16LE(offset + 26);
    const extraLength = file.readUInt16LE(offset + 28);
    const filename = file.subarray(offset + 30, offset + 30 + nameLength).toString();
    const dataStart = offset + 30 + nameLength + extraLength;
    const data = file.subarray(dataStart, dataStart + compressedSize);
    if (filename === name) {
      if (method === 0) return data.toString('utf8');
      if (method === 8) return zlib.inflateRawSync(data).toString('utf8');
      return null;
    }
    offset = dataStart + compressedSize;
  }
  return null;
}
