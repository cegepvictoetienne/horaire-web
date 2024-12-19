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

import IEntree from '@/models/ientree';
import { IAlarme, IEntreeCalendrierICS } from '@/models/ientreeCalendrier';
import IJourCalendrier from '@/models/ijourcalendrier';

export function genererCalendrier(
  entrees: IEntree[],
  joursCalendrier: IJourCalendrier[],
  ajouterSemaine: boolean
): IEntreeCalendrierICS[] {
  const calendrier: IEntreeCalendrierICS[] = [];

  let alarms: IAlarme[] = [
    {
      action: 'display',
      trigger: { hours: 0, minutes: 15, before: true },
      description: '15 minutes avant le cours',
    },
  ];

  joursCalendrier.forEach((jour) => {
    const jourDate = new Date(jour.date);
    jourDate.setHours(jourDate.getHours() + 5); // 5 heures de décalage
    entrees.forEach((entree) => {
      const heureDebutSansMinutes = Number(entree.heureDebut.split(':')[0]);
      const heureDebutSeulementMinutes = Number(
        entree.heureDebut.split(':')[1]
      );
      const heureFinSansMinutes = Number(entree.heureFin.split(':')[0]);
      const mode_horaire = heureDebutSansMinutes < 12 ? 'AM' : 'PM';

      if (
        (jour.statut === 'COMPLET' || jour.statut === mode_horaire) &&
        jour.jourSemaine === entree.jour
      ) {
        const tableauDebut: [number, number, number, number, number] = [
          jourDate.getFullYear(),
          jourDate.getMonth() + 1, // 0-based
          jourDate.getDate(),
          heureDebutSansMinutes,
          heureDebutSeulementMinutes,
        ];
        const dureeHeure = heureFinSansMinutes - heureDebutSansMinutes - 1;
        const dureeMinutes = 50;
        let nomCoursComplet = entree.nomCours;
        if (entree.groupe) {
          nomCoursComplet = `${entree.nomCours} - Gr ${entree.groupe}`;
        }
        if (ajouterSemaine) {
          nomCoursComplet = `${nomCoursComplet} - Sem. ${jour.numeroSemaine}`;
        }
        calendrier.push({
          title: nomCoursComplet,
          location: entree.salle,
          start: tableauDebut,
          duration: { hours: dureeHeure, minutes: dureeMinutes },
          busyStatus: 'BUSY',
          startOutputType: 'local',
          alarms: alarms,
        });
      }
    });
  });

  return calendrier;
}

export const genererCalendrierAvecStartEtEnd = (
  horaire: IEntree[],
  joursCalendrier: IJourCalendrier[],
  ajouterSemaine: boolean
) => {
  // Générer le calendrier en prenant l'horaire hebdo et le calendrier scolaire pour la session sélectionnée
  const calendrier = genererCalendrier(
    horaire,
    joursCalendrier,
    ajouterSemaine
  );

  const calendrierAvecStartEtEnd = calendrier.map((entry) => {
    const startDate = new Date(
      entry.start[0],
      entry.start[1] - 1,
      entry.start[2],
      entry.start[3],
      entry.start[4]
    );
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + entry.duration.hours);
    endDate.setMinutes(endDate.getMinutes() + entry.duration.minutes);
    return {
      title: entry.title,
      start: startDate,
      end: endDate,
    };
  });
  return calendrierAvecStartEtEnd;
};
