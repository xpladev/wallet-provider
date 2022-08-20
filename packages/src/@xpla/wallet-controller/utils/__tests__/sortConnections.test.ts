import { ConnectType } from '@xpla/wallet-types';
import { sortConnections } from '../sortConnections';
import { describe, expect, test } from 'vitest';

describe('sortConnections', () => {
  test('xpla vault should be at the top', () => {
    // Arrange, Act
    const result = sortConnections([
      {
        type: ConnectType.EXTENSION,
        identifier: 'xxxx',
        name: 'Wallet X',
        icon: '',
      },
      {
        type: ConnectType.EXTENSION,
        identifier: 'xplavault',
        name: 'Xpla Wallet',
        icon: '',
      },
      {
        type: ConnectType.EXTENSION,
        identifier: 'yyyy',
        name: 'Wallet Y',
        icon: '',
      },
    ]);

    // Assert
    expect(result.map(({ identifier }) => identifier)).toEqual([
      'xplavault',
      'xxxx',
      'yyyy',
    ]);
  });
});
