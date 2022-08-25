import { Observable, of, switchMap } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { catchError, map } from 'rxjs/operators';
import { getDesktopBrowserType } from '../utils/browser-check';

interface Extensions {
  whitelist: Array<{
    name: string;
    identifier: string;
    icon: string;
    urls: Array<{
      browser: 'chrome' | 'edge' | 'firefox' | 'safari';
      url: string;
    }>;
  }>;
}

const FALLBACK: Extensions = {
  whitelist: [
    {
      name: 'Xpla Wallet',
      identifier: 'xplavault',
      icon: 'https://assets.xpla.io/icon/extension/icon.png',
      urls: [
        {
          browser: 'chrome',
          url: 'https://chrome.google.com/webstore/detail/xpla-vault-wallet/ocjobpilfplciaddcbafabcegbilnbnb',
        },
        {
          browser: 'firefox',
          url: 'https://addons.mozilla.org/ko/firefox/addon/xpla-vault-wallet',
        },
      ],
    },
  ],
};

interface InstallableExtension {
  name: string;
  identifier: string;
  icon: string;
  url: string;
}

export function getExtensions(): Observable<InstallableExtension[]> {
  const currentBrowser = getDesktopBrowserType(navigator.userAgent);

  if (!currentBrowser) {
    return of([]);
  }

  return fromFetch('https://assets.xpla.io/extensions.json').pipe<
    Extensions,
    Extensions,
    InstallableExtension[]
  >(
    switchMap((res) => {
      if (res.ok) {
        return res.json();
      } else {
        return of(FALLBACK);
      }
    }),
    catchError(() => {
      return of(FALLBACK);
    }),
    map(({ whitelist }) => {
      return whitelist
        .filter(({ urls }) =>
          urls.some(({ browser }) => currentBrowser === browser),
        )
        .map(({ name, identifier, icon, urls }) => {
          return {
            name,
            identifier,
            icon,
            url: urls.find(({ browser }) => currentBrowser === browser)!.url,
          };
        });
    }),
  );
}
