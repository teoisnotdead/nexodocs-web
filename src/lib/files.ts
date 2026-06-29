export const MAX_UPLOAD_FILE_SIZE_BYTES = 25 * 1024 * 1024;
export const MAX_UPLOAD_FILE_SIZE_LABEL = "25 MB";

export function validateUploadFileSize(file: File) {
  if (file.size <= MAX_UPLOAD_FILE_SIZE_BYTES) {
    return null;
  }

  return `El archivo supera el maximo permitido de ${MAX_UPLOAD_FILE_SIZE_LABEL}.`;
}
