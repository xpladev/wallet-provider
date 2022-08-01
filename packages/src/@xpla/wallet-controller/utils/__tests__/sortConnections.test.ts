import { ConnectType } from '@xpla/wallet-types';
import { sortConnections } from '../sortConnections';
import { describe, expect, test } from 'vitest';

describe('sortConnections', () => {
  test('terra station should be at the top', () => {
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
        identifier: 'station',
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
      'station',
      'xxxx',
      'yyyy',
    ]);
  });
});
