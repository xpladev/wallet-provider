/**
 * Data type for storage and UI
 * This information is not protected (someone access)
 */
export interface WebExtensionWalletInfo {
  /**
   * Wallet display name
   * This should be primary key
   */
  name: string;

  /**
   * Wallet address
   */
  xplaAddress: string;

  /**
   * Wallet design
   * 1. some theme name (xpla, ...)
   * 2. color hex (#ffffff, #000000...)
   */
  design: string;
}
