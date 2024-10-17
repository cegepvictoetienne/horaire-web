import IEntree from '@/models/ientree';
import IEntreeCalendrier from '@/models/ientreeCalendrier';
import IJourCalendrier from '@/models/ijourcalendrier';

export function genererCalendrier(
  entrees: IEntree[],
  joursCalendrier: IJourCalendrier[]
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

        calendrier.push({
          title: entree.nomCours,
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
