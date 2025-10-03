export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

export const sanitizeFileName = (filename: string): string => {
  return filename
    .replace(/[^a-z0-9.-]/gi, '_')
    .toLowerCase()
    .substring(0, 100);
};

export const sanitizeThemeName = (name: string): string => {
  return name
    .replace(/[^a-z0-9\s-]/gi, '')
    .trim()
    .replace(/\s+/g, ' ')
    .substring(0, 50);
};

export const isAllowedAssetType = (url: string): boolean => {
  const allowedExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico',
    '.mp4', '.webm', '.ogg', '.avi',
    '.woff', '.woff2', '.ttf', '.otf', '.eot',
    '.css', '.js', '.mjs'
  ];

  const ext = url.split('.').pop()?.toLowerCase();
  return ext ? allowedExtensions.includes(`.${ext}`) : false;
};

export const validateJobId = (jobId: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(jobId);
};
