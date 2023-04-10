import { IQRCodeModal, IQRCodeModalOptions } from '@walletconnect/types';
import { toCanvas } from 'qrcode';
import { isMobile as isMobileBrowser } from '../../utils/browser-check';
import { modalStyle } from './modal.style';

const XPLA_ANDROID_URL = 'https://play.google.com/store/apps/details?id=xpla.android';
const XPLA_iOS_URL = 'https://apps.apple.com/app/xpla-vault/id1640593143';

// const C2X_ANDROID_URL = 'https://play.google.com/store/apps/details?id=c2xvault.android';
// const C2X_iOS_URL = 'https://apps.apple.com/us/app/c2x-vault/id1642858297';

const openXplaMobile = (mobileUri: string) => {
  const timeout = setTimeout(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.search('android') > -1) {
      // window.open(XPLA_ANDROID_URL);
      window.location.href = XPLA_ANDROID_URL
    } else if (
      userAgent.search('iphone') > -1 ||
      userAgent.search('ipod') > -1 ||
      userAgent.search('ipad') > -1 ||
      userAgent.search('mac') > -1) {
        window.location.href = XPLA_iOS_URL;
    } else {
      alert('Not supported');
    }
  }, 3000);

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
  } catch {

  }
};

export class XplaWalletconnectQrcodeModal implements IQRCodeModal {
  isC2X?: boolean

  constructor(isC2X?: boolean) {
    this.isC2X = isC2X
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

    if (this.isC2X) {
      schemeUri = `https://c2xvault.page.link/?link=https://www.c2x.world?${query}&apn=c2xvault.android&isi=1642858297&ibi=c2xvault.ios`;
      mobileUri = `https://c2xvault.page.link/?link=https://www.c2x.world?${query}&apn=c2xvault.android&isi=1642858297&ibi=c2xvault.ios`;
      // mobileUri = `c2xvault://wallet_connect?action=wallet_connect&payload=${encodeURIComponent(uri)}`;
    } else {
      schemeUri = `https://xplavault.page.link/?link=https://www.xpla.io?${query}&apn=xpla.android&isi=1640593143&ibi=xpla.ios`;
      mobileUri = `xplavault://wallet_connect?action=wallet_connect&payload=${encodeURIComponent(uri)}`;
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
      isC2X: this.isC2X,
    });

    if (isMobileBrowser()) {
      if (this.isC2X) {
        window.location.href = mobileUri;
      } else {
        openXplaMobile(mobileUri)
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
  isC2X,
}: {
  schemeUri: string;
  mobileUri: string;
  onClose: () => void;
  isC2X: boolean | undefined;
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
    if (isC2X) {
      button.textContent = 'Open XPLA GAMES';
    } else {
      button.textContent = 'Open XPLA Vault';
    }

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
