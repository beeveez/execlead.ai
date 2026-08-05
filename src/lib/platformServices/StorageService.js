import { base44 } from '@/api/base44Client';
import { recordRepositoryCall, recordError } from '@/lib/serviceObservability';

// StorageService™ — file storage boundary. UI never calls UploadFile directly.
export const StorageService = {
  name: 'StorageService',
  async upload(file) {
    recordRepositoryCall('StorageService');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      return file_url;
    } catch (e) { recordError('StorageService'); throw e; }
  },
  async uploadPrivate(file) {
    recordRepositoryCall('StorageService');
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      return file_uri;
    } catch (e) { recordError('StorageService'); throw e; }
  },
  async signedUrl(file_uri, expires_in = 300) {
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in });
      return signed_url;
    } catch (e) { recordError('StorageService'); throw e; }
  },
};