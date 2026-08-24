import { ApiError } from '../errors/api-error';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
];

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB Limit

export function sanitizeFilename(filename: string): string {
  // Strip directory path traversal sequences (../ or ..\)
  const baseName = filename.replace(/^.*[\\/]/, '');
  // Sanitize non-alphanumeric characters except dot, dash, underscore
  return baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function validateUploadedFile(file: {
  name: string;
  type: string;
  size: number;
}): { sanitizedName: string } {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw ApiError.badRequest(
      `File size exceeds maximum limit of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB`
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    throw ApiError.badRequest(
      `Unsupported file type '${file.type}'. Allowed types: PDF, PNG, JPEG, WEBP`
    );
  }

  const sanitizedName = sanitizeFilename(file.name);
  if (!sanitizedName || sanitizedName.startsWith('.')) {
    throw ApiError.badRequest('Invalid file name');
  }

  return { sanitizedName };
}
