import { Connection } from '@xpla/wallet-types';

export function sortConnections(connections: Connection[]): Connection[] {
  const stationIndex = connections.findIndex(
    ({ identifier }) => identifier === 'xplawallet',
  );

  if (stationIndex > -1) {
    const station = connections.splice(stationIndex, 1);
    return [...station, ...connections];
  }

  return connections;
}
