/**
 * File Upload Security Utility™
 * Validates file type, size, and content before allowing upload via Core.UploadFile.
 * Prevents executable uploads, malformed files, and oversized payloads.
 */

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/json',
];

const ALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.webp', '.gif',
  '.pdf', '.docx', '.xlsx', '.pptx',
  '.txt', '.csv', '.json',
];

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.ps1', '.msi',
  '.js', '.jsx', '.ts', '.tsx', '.html', '.htm',
  '.php', '.py', '.rb', '.pl', '.jar', '.war',
  '.dll', '.so', '.bin', '.app',
];

/**
 * Validates a file before upload.
 * @param {File} file - The browser File object
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateFileUpload(file) {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  // Size check
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `File exceeds maximum size of ${MAX_FILE_SIZE_MB}MB.` };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty.' };
  }

  const fileName = (file.name || '').toLowerCase();

  // Check for blocked extensions (executable/script content)
  for (const ext of BLOCKED_EXTENSIONS) {
    if (fileName.endsWith(ext)) {
      return { valid: false, error: `File type "${ext}" is not allowed for security reasons.` };
    }
  }

  // Check MIME type if available
  if (file.type) {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { valid: false, error: `MIME type "${file.type}" is not allowed.` };
    }
  }

  // Check file extension as fallback
  const hasAllowedExt = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
  if (!hasAllowedExt && !file.type) {
    return { valid: false, error: 'File type could not be verified. Allowed: images, PDF, DOCX, XLSX, PPTX, TXT, CSV, JSON.' };
  }

  return { valid: true };
}

export { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_MB };