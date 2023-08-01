import { WalletApp } from '@xpla/wallet-types';
import { IQRCodeModal, IQRCodeModalOptions } from '@walletconnect/types';
import { toCanvas } from 'qrcode';
import { isMobile as isMobileBrowser } from '../../utils/browser-check';
import { modalStyle } from './modal.style';

const XPLA_VAULT_ANDROID_URL = 'https://play.google.com/store/apps/details?id=xpla.android';
const XPLA_VALUT_iOS_URL = 'https://apps.apple.com/app/xpla-vault/id1640593143';
const XPLAYZ_ANDROID_URL = 'https://play.google.com/store/apps/details?id=com.zenaad.xplayz';
const XPLAYZ_iOS_URL = 'https://apps.apple.com/kr/app/xplayz/id1667742112';

const WalletAppName = {
  [WalletApp.XPLA_VAULT]: 'XPLA Vault',
  [WalletApp.XPLA_GAMES]: 'XPLA GAMES',
  [WalletApp.XPLAYZ]: 'xPlayz',
}

const WalletAppShemeUri = {
  [WalletApp.XPLA_VAULT]: 'https://xplavault.page.link/?link=https://www.xpla.io?{query}&apn=xpla.android&isi=1640593143&ibi=xpla.ios',
  [WalletApp.XPLA_GAMES]: 'https://c2xvault.page.link/?link=https://www.c2x.world?{query}&apn=c2xvault.android&isi=1642858297&ibi=c2xvault.ios',
  [WalletApp.XPLAYZ]: 'https://xplayz.page.link/?link=https://www.zenaad.com?{query}&apn=com.zenaad.xplayz&isi=1524577064&ibi=com.zenaad.xplayz',
}

const WalletAppMobileUri = {
  [WalletApp.XPLA_VAULT]: 'xplavault://wallet_connect?action=wallet_connect&payload={query}',
  [WalletApp.XPLA_GAMES]: 'https://c2xvault.page.link/?link=https://www.c2x.world?{query}&apn=c2xvault.android&isi=1642858297&ibi=c2xvault.ios',
  [WalletApp.XPLAYZ]: 'xplayz://wallet_connect?action=wallet_connect&payload={query}',
}

const downloadUrl = (walletApp: WalletApp) => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.search('android') > -1) {
    if (walletApp === WalletApp.XPLA_VAULT) {
      return XPLA_VAULT_ANDROID_URL;
    } else if (walletApp === WalletApp.XPLAYZ) {
      return XPLAYZ_ANDROID_URL;
    }
  } else if (
    userAgent.search('iphone') > -1 ||
    userAgent.search('ipod') > -1 ||
    userAgent.search('ipad') > -1 ||
    userAgent.search('mac') > -1) {
    if (walletApp === WalletApp.XPLA_VAULT) {
      return XPLA_VALUT_iOS_URL;
    } else if (walletApp === WalletApp.XPLAYZ) {
      return XPLAYZ_iOS_URL;
    }
  }

  return '';
}

const openXplaMobile = (mobileUri: string, download: string) => {
  const timeout = setTimeout(() => {
    window.location.href = download;
  }, 2500);

  const clearTimers = () => {
    clearInterval(heartbeat);
    clearTimeout(timeout);
  };

  const intervalHeartbeat = () => {
    if (window.document.hidden) {
      clearTimers();
    }
  };

  const heartbeat = setInterval(intervalHeartbeat, 200);

  try {
    window.location.href = mobileUri;
  } catch {}
};



export class XplaWalletconnectQrcodeModal implements IQRCodeModal {
  walletApp?: WalletApp | boolean

  constructor(walletApp?: WalletApp | boolean) {
    this.walletApp = walletApp
  }

  modalContainer: HTMLDivElement | null = null;
  styleContainer: HTMLStyleElement | null = null;

  private callback: (() => void) | null = null;

  setCloseCallback = (callback: () => void) => {
    this.callback = callback;
  };

  open = (
    uri: string,
    cb: () => void,
    _qrcodeModalOptions?: IQRCodeModalOptions,
  ) => {
    const modalContainer = document.createElement('div');
    const stylecontainer = document.createElement('style');

    const query = encodeURIComponent(
      `action=wallet_connect&payload=${encodeURIComponent(uri)}`,
    );

    let schemeUri = '';
    let mobileUri = '';
    let appName = '';
    let download = '';

    if (!this.walletApp || typeof this.walletApp === 'boolean') {
      if (this.walletApp) {
        schemeUri = WalletAppShemeUri[WalletApp.XPLA_GAMES].replace('{query}', query);
        mobileUri = WalletAppMobileUri[WalletApp.XPLA_GAMES].replace('{query}', query);
        appName = WalletAppName[WalletApp.XPLA_GAMES];
      } else {
        schemeUri = WalletAppShemeUri[WalletApp.XPLA_VAULT].replace('{query}', query);
        mobileUri = WalletAppMobileUri[WalletApp.XPLA_VAULT].replace('{query}', encodeURIComponent(uri));
        appName = WalletAppName[WalletApp.XPLA_VAULT];

        download = downloadUrl(WalletApp.XPLA_VAULT);
      }
    } else {
      if (this.walletApp === WalletApp.XPLA_VAULT || this.walletApp === WalletApp.XPLAYZ) {
        schemeUri = WalletAppShemeUri[this.walletApp].replace('{query}', query);
        mobileUri = WalletAppMobileUri[this.walletApp].replace('{query}', encodeURIComponent(uri));

        download = downloadUrl(this.walletApp);
      } else {
        schemeUri = WalletAppShemeUri[this.walletApp].replace('{query}', query);
        mobileUri = WalletAppMobileUri[this.walletApp].replace('{query}', query);
      }
      appName = WalletAppName[this.walletApp];
    }

    const element = createModalElement({
      schemeUri,
      mobileUri,
      onClose: () => {
        if (this.callback) {
          this.callback();
          this.callback = null;
        }
        this.close();
      },
      appName
    });

    if (isMobileBrowser()) {
      if (!this.walletApp || this.walletApp === WalletApp.XPLA_VAULT || this.walletApp === WalletApp.XPLAYZ) {
        openXplaMobile(mobileUri, download)
      } else {
        window.location.href = mobileUri;
      }
    }

    stylecontainer.textContent = modalStyle;
    modalContainer.appendChild(element);

    document.querySelector('head')?.appendChild(stylecontainer);
    document.querySelector('body')?.appendChild(modalContainer);

    this.modalContainer = modalContainer;
    this.styleContainer = stylecontainer;
  };

  close = () => {
    if (this.modalContainer) {
      this.modalContainer.parentElement?.removeChild(this.modalContainer);
    }

    if (this.styleContainer) {
      this.styleContainer.parentElement?.removeChild(this.styleContainer);
    }

    this.callback = null;
  };
}

function createModalElement({
  schemeUri,
  mobileUri,
  onClose,
  appName
}: {
  schemeUri: string;
  mobileUri: string;
  onClose: () => void;
  appName: string;
}): HTMLElement {
  const isMobile = isMobileBrowser();

  // ---------------------------------------------
  // container
  // ---------------------------------------------
  const container = document.createElement('div');
  container.setAttribute('class', 'wallet-wc-modal');

  // ---------------------------------------------
  // container > div.wallet-wc-modal--dim
  // ---------------------------------------------
  const dim = document.createElement('div');
  dim.setAttribute('class', 'wallet-wc-modal--dim');

  container.appendChild(dim);

  // ---------------------------------------------
  // container > div.wallet-wc-modal--content
  // ---------------------------------------------
  const content = document.createElement('section');
  content.setAttribute('class', 'wallet-wc-modal--content');
  content.setAttribute('data-device', isMobile ? 'mobile' : 'desktop');

  container.appendChild(content);

  // h1
  const title = document.createElement('h1');
  content.appendChild(title);

  const img = document.createElement('img');
  img.setAttribute(
    'src',
    'https://assets.xpla.io/icon/wallet-provider/walletconnect.svg',
  );
  img.setAttribute(
    'style',
    'width: 1em; margin-right: 10px; transform: scale(1.5) translateY(0.08em)',
  );

  const span = document.createElement('span');
  span.textContent = 'Wallet Connect';

  title.appendChild(img);
  title.appendChild(span);

  // p
  const description = document.createElement('p');
  description.textContent =
    'Scan QR code with a WalletConnect-compatible wallet';
  content.appendChild(description);

  if (isMobile) {
    // button
    const button = document.createElement('button');
    button.addEventListener('click', () => {
      window.location.href = mobileUri;
    });
    button.textContent = `Open ${appName}`;

    content.appendChild(button);
  } else {
    // qrcode
    const canvas = document.createElement('canvas');
    toCanvas(canvas, schemeUri, {
      width: 220,
      margin: 0,
      color: {
        dark: '#2043b5ff',
      },
    });

    content.appendChild(canvas);
  }

  // events
  dim.addEventListener('click', onClose);

  return container;
}
