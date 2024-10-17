export default interface IEntreeCalendrier {
  title: string;
  location: string;
  start: [number, number, number, number, number];
  duration: { hours: number; minutes: number };
  busyStatus: 'FREE' | 'BUSY' | 'TENTATIVE' | 'OOF' | undefined;
  startOutputType?: 'local' | 'utc' | undefined;
}
