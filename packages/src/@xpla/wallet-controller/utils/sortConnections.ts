import { Connection } from '@xpla/wallet-types';

export function sortConnections(connections: Connection[]): Connection[] {
  const vaultIndex = connections.findIndex(
    ({ identifier }) => identifier === 'xplavault',
  );

  if (vaultIndex > -1) {
    const vault = connections.splice(vaultIndex, 1);
    return [...vault, ...connections];
  }

  return connections;
}
