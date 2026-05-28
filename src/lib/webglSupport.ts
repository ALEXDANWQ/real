export const isWebGLRuntimeSupported = () => {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl' as 'webgl'),
    );
  } catch {
    return false;
  }
};
