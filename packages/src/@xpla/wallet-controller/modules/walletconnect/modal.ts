import { IQRCodeModal, IQRCodeModalOptions } from '@walletconnect/types';
import { toCanvas } from 'qrcode';
import { isMobile as isMobileBrowser } from '../../utils/browser-check';
import { modalStyle } from './modal.style';

export class XplaWalletconnectQrcodeModal implements IQRCodeModal {
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

    const schemeUri = `https://metamagnet.page.link/?link=https://www.xpla.io?${query}&apn=xpla.android&ibi=xpla.io&isi=1548434735`;
    const mobileUri = `xplavault://wallet_connect?action=wallet_connect&payload=${encodeURIComponent(uri)}`;

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
    });

    if (isMobileBrowser()) {
      window.location.href = mobileUri;
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
}: {
  schemeUri: string;
  mobileUri: string;
  onClose: () => void;
}): HTMLElement {
  const isMobile = isMobileBrowser();

  const openXplaStationMobile = () => {
    window.location.href = mobileUri;
  };

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
    button.addEventListener('click', openXplaStationMobile);
    button.textContent = 'Open Xpla Mobile';

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
