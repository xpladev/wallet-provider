export const CHROME_EXTENSION_INSTALL_URL =
  'https://chrome.google.com/webstore/detail/c2x-station-wallet/ofeeamlegilfbjlgbephmdhchpblfigo';

export const DEFAULT_CHROME_EXTENSION_COMPATIBLE_BROWSER_CHECK = (
  userAgent: string,
) => {
  return /MathWallet\//.test(userAgent);
};
