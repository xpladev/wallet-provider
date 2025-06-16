import { CreateTxOptions, SignMode } from '@xpla/xpla.js';
import { WalletApp } from '@xpla/wallet-types';
import Connector from '@walletconnect/core';
import * as cryptoLib from '@walletconnect/iso-crypto';
import {
  IPushServerOptions,
  IWalletConnectOptions,
} from '@walletconnect/types';
import { uuid } from '@walletconnect/utils';
import { BehaviorSubject, Observable } from 'rxjs';
import { isMobile } from '../../utils/browser-check';
import {
  WalletConnectCreateTxFailed,
  WalletConnectTimeout,
  WalletConnectTxFailed,
  WalletConnectTxUnspecifiedError,
  WalletConnectUserDenied,
  WalletConnectSignUnspecifiedError,
  WalletConnectSignBytesUnspecifiedError
} from './errors';
import SocketTransport from './impl/socket-transport';
import { XplaWalletconnectQrcodeModal } from './modal';
import {
  WalletConnectSession,
  WalletConnectSessionStatus,
  WalletConnectTxResult,
} from './types';
import {
  WebExtensionSignPayload,
  WebExtensionSignBytesPayload,
} from '@xpla/web-extension-interface';

export interface WalletConnectControllerOptions {
  /**
   * Configuration parameter that `new WalletConnect(connectorOpts)`
   *
   * @default
   * ```js
   * {
   *   bridge: 'https://walletconnect.xpla.io/',
   *   qrcodeModal: new XplaWalletconnectQrcodeModal(),
   * }
   * ```
   */
  connectorOpts?: IWalletConnectOptions;

  /**
   * Configuration parameter that `new WalletConnect(_, pushServerOpts)`
   *
   * @default undefined
   */
  pushServerOpts?: IPushServerOptions;
}

export interface WalletConnectController {
  session: () => Observable<WalletConnectSession>;
  getLatestSession: () => WalletConnectSession;
  post: (tx: CreateTxOptions, _walletApp?: WalletApp | boolean) => Promise<WalletConnectTxResult>;
  sign: (
    tx: CreateTxOptions & {
      sequence?: number;
      accountNumber?: number;
      signMode?: SignMode;
    }, 
    _walletApp?: WalletApp | boolean
  ) => Promise<WebExtensionSignPayload>;
  signBytes: (bytes: Buffer, _walletApp?: WalletApp | boolean) => Promise<WebExtensionSignBytesPayload>;
  disconnect: () => void;
}

const WALLETCONNECT_STORAGE_KEY = 'walletconnect';

export function connectIfSessionExists(
  options: WalletConnectControllerOptions = {},
): WalletConnectController | null {
  const storedSession = localStorage.getItem(WALLETCONNECT_STORAGE_KEY);

  if (typeof storedSession === 'string') {
    return connect(options, true);
  }

  return null;
}

export function connect(
  options: WalletConnectControllerOptions = {},
  useCachedSession: boolean = false,
  walletApp?: WalletApp | boolean
): WalletConnectController {
  let connector: Connector | null = null;

  let sessionSubject: BehaviorSubject<WalletConnectSession> =
    new BehaviorSubject<WalletConnectSession>({
      status: WalletConnectSessionStatus.DISCONNECTED,
    });

  const qrcodeModal =
    options.connectorOpts?.qrcodeModal ?? new XplaWalletconnectQrcodeModal(walletApp);

  const connectorOpts: IWalletConnectOptions = {
    bridge: 'https://walletconnect.xpla.io/',
    qrcodeModal,
    ...options.connectorOpts,
  };

  const pushServerOpts: IPushServerOptions | undefined = options.pushServerOpts;

  // ---------------------------------------------
  // event listeners
  // ---------------------------------------------
  function initEvents() {
    if (!connector) {
      throw new Error(`WalletConnect is not defined!`);
    }

    connector.on('session_update', async (error, payload) => {
      if (error) throw error;

      sessionSubject.next({
        status: WalletConnectSessionStatus.CONNECTED,
        peerMeta: payload.params[0],
        xplaAddress: payload.params[0].accounts[0],
        chainId: payload.params[0].chainId,
      });

      console.log('WALLETCONNECT SESSION UPDATED:', payload.params[0]);
    });

    connector.on('connect', (error, payload) => {
      if (error) throw error;

      sessionSubject.next({
        status: WalletConnectSessionStatus.CONNECTED,
        peerMeta: payload.params[0],
        xplaAddress: payload.params[0].accounts[0],
        chainId: payload.params[0].chainId,
      });
    });

    connector.on('disconnect', (error, payload) => {
      if (error) throw error;

      sessionSubject.next({
        status: WalletConnectSessionStatus.DISCONNECTED,
      });
    });
  }

  // ---------------------------------------------
  // initialize
  // ---------------------------------------------
  const cachedSession = localStorage.getItem('walletconnect');

  if (typeof cachedSession === 'string' && useCachedSession) {
    const cachedSessionObject = JSON.parse(cachedSession);
    const clientId = cachedSessionObject.clientId;
    const draftConnector = new Connector({
      connectorOpts: {
        ...connectorOpts,
        session: JSON.parse(cachedSession),
      },
      pushServerOpts,
      cryptoLib,
      transport: new SocketTransport({
        protocol: 'wc',
        version: 1,
        url: connectorOpts.bridge!,
        subscriptions: [clientId],
      }),
    });
    draftConnector.clientId = clientId;

    connector = draftConnector;

    initEvents();

    sessionSubject.next({
      status: WalletConnectSessionStatus.CONNECTED,
      peerMeta: draftConnector.peerMeta!,
      xplaAddress: draftConnector.accounts[0],
      chainId: draftConnector.chainId,
    });
  } else {
    const clientId = uuid();
    const draftConnector = new Connector({
      connectorOpts,
      pushServerOpts,
      cryptoLib,
      transport: new SocketTransport({
        protocol: 'wc',
        version: 1,
        url: connectorOpts.bridge!,
        subscriptions: [clientId],
      }),
    });
    draftConnector.clientId = clientId;

    connector = draftConnector;

    if (!draftConnector.connected) {
      draftConnector.createSession().catch(console.error);

      if (qrcodeModal instanceof XplaWalletconnectQrcodeModal) {
        qrcodeModal.setCloseCallback(() => {
          sessionSubject.next({
            status: WalletConnectSessionStatus.DISCONNECTED,
          });
        });
      }

      initEvents();

      sessionSubject.next({
        status: WalletConnectSessionStatus.REQUESTED,
      });
    }
  }

  // ---------------------------------------------
  // methods
  // ---------------------------------------------
  function disconnect() {
    if (connector && connector.connected) {
      try {
        connector.killSession();
      } catch {}
    }

    sessionSubject.next({
      status: WalletConnectSessionStatus.DISCONNECTED,
    });
  }

  function session(): Observable<WalletConnectSession> {
    return sessionSubject.asObservable();
  }

  function getLatestSession(): WalletConnectSession {
    return sessionSubject.getValue();
  }

  /**
   * post transaction
   *
   * @param tx transaction data
   * @param walletApp wallet type, default is XPLA Vault
   * @throws { WalletConnectUserDenied }
   * @throws { WalletConnectCreateTxFailed }
   * @throws { WalletConnectTxFailed }
   * @throws { WalletConnectTimeout }
   * @throws { WalletConnectTxUnspecifiedError }
   */
  function post(tx: CreateTxOptions, _walletApp?: WalletApp | boolean): Promise<WalletConnectTxResult> {
    if (!connector || !connector.connected) {
      throw new Error(`WalletConnect is not connected!`);
    }

    const id = Date.now();

    const serializedTxOptions = {
      msgs: tx.msgs.map((msg) => msg.toJSON()),
      fee: tx.fee?.toJSON(),
      memo: tx.memo,
      gas: tx.gas,
      gasPrices: tx.gasPrices?.toString(),
      gasAdjustment: tx.gasAdjustment?.toString(),
      //account_number: tx.account_number,
      //sequence: tx.sequence,
      feeDenoms: tx.feeDenoms,
      timeoutHeight: tx.timeoutHeight,
    };

    if (isMobile()) {
      const payload = btoa(
        JSON.stringify({
          id,
          handshakeTopic: connector.handshakeTopic,
          method: 'post',
          params: serializedTxOptions,
        }),
      );

      confirm(payload, walletApp);
    }

    return connector
      .sendCustomRequest({
        id,
        method: 'post',
        params: [serializedTxOptions],
      })
      .catch((error) => {
        let throwError = error;

        try {
          const { code, txhash, message, raw_message } = JSON.parse(
            error.message,
          );
          switch (code) {
            case 1:
              throwError = new WalletConnectUserDenied();
              break;
            case 2:
              throwError = new WalletConnectCreateTxFailed(message);
              break;
            case 3:
              throwError = new WalletConnectTxFailed(
                txhash,
                message,
                raw_message,
              );
              break;
            case 4:
              throwError = new WalletConnectTimeout(message);
              break;
            case 99:
              throwError = new WalletConnectTxUnspecifiedError(message);
              break;
          }
        } catch {
          throwError = new WalletConnectTxUnspecifiedError(error.message);
        }

        throw throwError;
      });
  }

  /**
   * sign transaction
   *
   * @param bytes: Buffer
   * @param walletApp wallet type, default is XPLA Vault
   * @throws { WalletConnectUserDenied }
   * @throws { WalletConnectTimeout }
   * @throws { WalletConnectSignBytesUnspecifiedError }
   */
  function sign(
    tx: CreateTxOptions  & {
      sequence?: number;
      accountNumber?: number;
      signMode?: SignMode;
    }, 
    _walletApp?: WalletApp | boolean
  ): Promise<WebExtensionSignPayload> {
    if (!connector || !connector.connected) {
      throw new Error(`WalletConnect is not connected!`);
    }

    const id = Date.now();

    const serializedTxOptions = {
      msgs: tx.msgs.map((msg) => msg.toJSON()),
      fee: tx.fee?.toJSON(),
      memo: tx.memo,
      gas: tx.gas,
      gasPrices: tx.gasPrices?.toString(),
      gasAdjustment: tx.gasAdjustment?.toString(),
      //account_number: tx.account_number,
      //sequence: tx.sequence,
      feeDenoms: tx.feeDenoms,
      timeoutHeight: tx.timeoutHeight,
      sequence: tx.sequence,
      accountNumber: tx.accountNumber,
      signMode: tx.signMode
    };

    if (isMobile()) {
      const payload = btoa(
        JSON.stringify({
          id,
          handshakeTopic: connector.handshakeTopic,
          method: 'sign',
          params: serializedTxOptions,
        }),
      );
      confirm(payload, _walletApp);
    }

    return connector
      .sendCustomRequest({
        id,
        method: 'sign',
        params: [serializedTxOptions],
      })
      .catch((error) => {
        let throwError = error;

        try {
          const { code, txhash, message, raw_message } = JSON.parse(
            error.message,
          );
          switch (code) {
            case 1:
              throwError = new WalletConnectUserDenied();
              break;
            case 2:
              throwError = new WalletConnectCreateTxFailed(message);
              break;
            case 3:
              throwError = new WalletConnectTxFailed(
                txhash,
                message,
                raw_message,
              );
              break;
            case 4:
              throwError = new WalletConnectTimeout(message);
              break;
            case 99:
              throwError = new WalletConnectSignUnspecifiedError(message);
              break;
          }
        } catch {
          throwError = new WalletConnectSignUnspecifiedError(error.message);
        }

        throw throwError;
      });
  }

  /**
   * signBytes transaction
   *
   * @param bytes: Buffer
   * @param bytes: WalletApp | boolean
   * @throws { WalletConnectUserDenied }
   * @throws { WalletConnectTimeout }
   * @throws { WalletConnectSignBytesUnspecifiedError }
   */
  function signBytes(bytes: Buffer, _walletApp?: WalletApp | boolean): Promise<WebExtensionSignBytesPayload> {
    if (!connector || !connector.connected) {
      throw new Error(`WalletConnect is not connected!`);
    }

    const id = Date.now();

    if (isMobile()) {
      const payload = btoa(
        JSON.stringify({
          id,
          handshakeTopic: connector.handshakeTopic,
          method: 'signBytes',
          params: bytes,
        }),
      );

      confirm(payload, _walletApp);
    }

    return connector
      .sendCustomRequest({
        id,
        method: 'signBytes',
        params: [bytes],
      })
      .catch((error) => {
        let throwError = error;

        try {
          const { code, message } = JSON.parse(
            error.message,
          );

          switch (code) {
            case 1:
              throwError = new WalletConnectUserDenied();
              break;
            case 4:
              throwError = new WalletConnectTimeout(message);
              break;
            case 99:
              throwError = new WalletConnectSignBytesUnspecifiedError(message);
              break;
          }
        } catch {
          throwError = new WalletConnectSignBytesUnspecifiedError(error.message);
        }

        throw throwError;
      });
  }

  /**
   * mobile confirm
   * 
   * @param payload paylaod
   * @param _walletApp wallet type, default is XPLA Vault
   */
  function confirm(payload: string, _walletApp?: WalletApp | boolean) {
    if (!_walletApp || typeof _walletApp === 'boolean') {
      if (_walletApp) {
        window.location.href = `c2xvault://walletconnect_confirm/?payload=${payload}`;  
      } else {
        window.location.href = `xplavault://walletconnect_confirm/?payload=${payload}`;
      }
    } else {
      if (_walletApp === WalletApp.XPLA_VAULT) {
        window.location.href = `xplavault://walletconnect_confirm/?payload=${payload}`;
      } else if (_walletApp === WalletApp.XPLA_GAMES) {
        window.location.href = `c2xvault://walletconnect_confirm/?payload=${payload}`;  
      } else if (_walletApp === WalletApp.XPLA_GAMES_NEW) {
        window.location.href = `xgameswallet://walletconnect_confirm/?payload=${payload}`;
      } else if (_walletApp === WalletApp.XPLAYZ) {
        window.location.href = `xplayz://walletconnect_confirm/?payload=${payload}`;  
      } else {
        window.location.href = `xplavault://walletconnect_confirm/?payload=${payload}`;
      }
    }
  }

  // ---------------------------------------------
  // return
  // ---------------------------------------------
  return {
    session,
    getLatestSession,
    post,
    sign,
    signBytes,
    disconnect,
  };
}
