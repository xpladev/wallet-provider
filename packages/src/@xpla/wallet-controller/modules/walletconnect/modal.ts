import { WalletApp } from '@xpla/wallet-types';
import { IQRCodeModal, IQRCodeModalOptions } from '@walletconnect/types';
import { toCanvas } from 'qrcode';
import { isMobile as isMobileBrowser } from '../../utils/browser-check';
import { modalStyle } from './modal.style';

const walletName = {
  [WalletApp.XPLA_VAULT]: 'XPLA Vault',
  [WalletApp.XPLA_GAMES]: 'XPLA GAMES',
  [WalletApp.XPLAYZ]: 'xPlayz',
}

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

    const encodeURI = encodeURIComponent(uri);
    const query = encodeURIComponent(
      `action=wallet_connect&payload=${encodeURI}`,
    );

    const walletSchemeUri = {
      [WalletApp.XPLA_VAULT]: `https://xplavault.page.link/?link=https://www.xpla.io?${query}&apn=xpla.android&isi=1640593143&ibi=xpla.ios`,
      [WalletApp.XPLA_GAMES]: `https://c2xvault.page.link/?link=https://www.xpla.games?${query}&apn=c2xvault.android&isi=1642858297&ibi=c2xvault.ios`,
      [WalletApp.XPLAYZ]: `https://xplayz.page.link/?link=https://www.zenaad.com?${query}&apn=com.zenaad.xplayz&isi=1524577064&ibi=com.zenaad.xplayz`,
    }

    let schemeUri = '';
    let appName = '';

    if (!this.walletApp || typeof this.walletApp === 'boolean') {
      if (this.walletApp) {
        // XPLA GAMES
        schemeUri = walletSchemeUri[WalletApp.XPLA_GAMES];
        appName = walletName[WalletApp.XPLA_GAMES];
      } else {
        // XPLA Vault
        schemeUri = walletSchemeUri[WalletApp.XPLA_VAULT];
        appName = walletName[WalletApp.XPLA_VAULT];
      }
    } else {
      schemeUri = walletSchemeUri[this.walletApp];
      appName = walletName[this.walletApp];
    }

    const element = createModalElement({
      schemeUri,
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
      window.location.href = schemeUri;
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
  onClose,
  appName
}: {
  schemeUri: string;
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
      window.location.href = schemeUri;
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
