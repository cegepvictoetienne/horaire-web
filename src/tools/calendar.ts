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
import IEntreeCalendrier from '@/models/ientreeCalendrier';
import IJourCalendrier from '@/models/ijourcalendrier';

export function genererCalendrier(
  entrees: IEntree[],
  joursCalendrier: IJourCalendrier[],
  ajouterSemaine: boolean
): IEntreeCalendrier[] {
  const calendrier: IEntreeCalendrier[] = [];

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
        console.log(tableauDebut);
        const dureeHeure = heureFinSansMinutes - heureDebutSansMinutes - 1;
        const dureeMinutes = 50;
        let nomCoursComplet = entree.nomCours;
        if (ajouterSemaine) {
          nomCoursComplet = `${entree.nomCours} - Sem. ${jour.numeroSemaine}`;
        }
        calendrier.push({
          title: nomCoursComplet,
          location: entree.salle,
          start: tableauDebut,
          duration: { hours: dureeHeure, minutes: dureeMinutes },
          busyStatus: 'BUSY',
          startOutputType: 'local',
        });
      }
    });
  });

  return calendrier;
}
