/*
 * Copyright (C) 2024 Étienne Rivard
 *
 * Ce programme est un logiciel libre : vous pouvez le redistribuer et/ou
 * le modifier selon les termes de la Licence Publique Générale GNU, telle
 * que publiée par la Free Software Foundation, soit la version 3 de
 * la licence, soit (à votre choix) toute version ultérieure.
 *
 * Ce programme est distribué dans l'espoir qu'il sera utile,
 * mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de
 * COMMERCIALISABILITÉ ou d'ADÉQUATION À UN OBJECTIF PARTICULIER.
 * Voir la Licence Publique Générale GNU pour plus de détails.
 *
 * Vous devriez avoir reçu une copie de la Licence Publique Générale GNU
 * avec ce programme. Si ce n'est pas le cas, consultez
 * <https://www.gnu.org/licenses/>.
 */

export interface ITrigger {
  hours: number;
  minutes: number;
  before: boolean;
}
export interface IAlarme {
  action: 'display';
  trigger: ITrigger;
  description: string;
}
export interface IEntreeCalendrierICS {
  title: string;
  location: string;
  start: [number, number, number, number, number];
  duration: { hours: number; minutes: number };
  busyStatus: 'FREE' | 'BUSY' | 'TENTATIVE' | 'OOF' | undefined;
  startOutputType?: 'local' | 'utc' | undefined;
  alarms?: IAlarme[];
}

export interface IEntreeCalendrier {
  title: string;
  start: Date;
  end: Date;
}
