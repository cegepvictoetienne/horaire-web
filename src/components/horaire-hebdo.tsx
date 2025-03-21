/**
 * Générateur de calendrier selon le calendrier scolaire
 * Composante principale pour la création d'un horaire hebdomadaire.
 */

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

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Trash2 } from 'lucide-react';
import { ArrowDown } from 'lucide-react';
import { motion } from 'motion/react';

import IEntree from '@/models/ientree';

import collegeCalendarData from '@/data/collegeCalendarData.json';
import { genererCalendrier } from '@/tools/calendar';
import * as ics from 'ics';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

import GrosCalendrier from './gros-calendrier';
import IJourCalendrier from '@/models/ijourcalendrier';

export function HoraireHebdoComponent() {
  const [nomCours, setNomCours] = useState('');
  const [groupe, setGroupe] = useState('');
  const [salle, setSalle] = useState('');
  const [heureDebut, setHeureDebut] = useState('');
  const [heureFin, setHeureFin] = useState('');
  const [jour, setJour] = useState('');
  const [rappel, setRappel] = useState('15 minutes avant');
  const [horaire, setHoraire] = useState<IEntree[]>([]);
  const [session, setSession] = useState('');
  const [joursCalendrier, setJoursCalendrier] = useState<IJourCalendrier[]>([]);
  const [ajouterSemaine, setAjouterSemaine] = useState(false);
  const [genererDisabled, setGenererDisabled] = useState(true);
  const [erreurs, setErreurs] = useState({
    nomCours: '',
    groupe: '',
    salle: '',
    heureDebut: '',
    heureFin: '',
    jour: '',
    rappel: '',
  });
  const [isOpen, setIsOpen] = useState(false);

  const genererCalendrierAvecStartEtEnd = (horaire: IEntree[]) => {
    // Extraire le calendrier pour la session sélectionnée
    const calendrierData = collegeCalendarData.filter(
      (calendrier) => calendrier.session === session
    )[0];

    // Générer le calendrier en prenant l'horaire hebdo et le calendrier scolaire pour la session sélectionnée
    const calendrier = genererCalendrier(
      horaire,
      calendrierData.calendrier,
      ajouterSemaine,
      rappel
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

  // Activer le bouton seulement si une session et des entrées sont présentes
  useEffect(() => {
    if (session && horaire.length > 0) {
      setGenererDisabled(false);
    } else {
      setGenererDisabled(true);
    }
  }, [session, horaire]);

  // Choisir heure de fin = heure de début + 2h par défaut
  useEffect(() => {
    if (heureDebut && !heureFin) {
      const [heure] = heureDebut.split(':').map(Number);
      const heureFin = (heure + 2).toString().padStart(2, '0');
      setHeureFin(`${heureFin}:05`);
    }
  }, [heureDebut]);

  useEffect(() => {
    if (!session) return;
    // Extraire le calendrier pour la session sélectionnée
    const calendrierData = collegeCalendarData.filter(
      (calendrier) => calendrier.session === session
    )[0];

    setJoursCalendrier(calendrierData.calendrier);
  }, [session]);

  // Générer les heures début à la minute 15 de chaque heure
  const listeHeureDebut = Array.from({ length: 24 }, (_, i) => {
    const heure = i.toString().padStart(2, '0');
    return `${heure}:15`;
  });

  // Générer les heures fin à la minute 05 de chaque heure
  const listeHeureFin = Array.from({ length: 24 }, (_, i) => {
    const heure = i.toString().padStart(2, '0');
    return `${heure}:05`;
  });

  // Extraire les sessions du calendrier scolaire
  const listeCalendriers = collegeCalendarData.map(
    (calendrier) => calendrier.session
  );

  const listeJourDeSemaine = [
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
    'Dimanche',
  ];

  const listeRappels = ['15 minutes avant', '30 minutes avant', 'aucun rappel'];

  const validerFormulaire = () => {
    let estValide = true;
    const nouvellesErreurs = {
      nomCours: '',
      groupe: '',
      salle: '',
      heureDebut: '',
      heureFin: '',
      jour: '',
      rappel: '',
    };

    if (!nomCours.trim()) {
      nouvellesErreurs.nomCours = 'Le nom du cours est obligatoire';
      estValide = false;
    }

    if (!salle.trim()) {
      nouvellesErreurs.salle = 'Le nom de la salle est obligatoire';
      estValide = false;
    }

    if (!jour) {
      nouvellesErreurs.jour = 'Le jour de la semaine est obligatoire';
      estValide = false;
    }

    if (!heureDebut) {
      nouvellesErreurs.heureDebut = "L'heure de début est obligatoire";
      estValide = false;
    }

    if (!heureFin) {
      nouvellesErreurs.heureFin = "L'heure de fin est obligatoire";
      estValide = false;
    }

    if (heureDebut && heureFin && heureDebut >= heureFin) {
      nouvellesErreurs.heureFin =
        "L'heure de fin doit être après l'heure de début";
      estValide = false;
    }

    setErreurs(nouvellesErreurs);
    return estValide;
  };

  const gereAjoutEntree = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!validerFormulaire()) {
      return;
    }
    if (nomCours && salle && heureDebut && heureFin && jour) {
      setHoraire([
        ...horaire,
        {
          nomCours: nomCours,
          groupe: groupe,
          salle: salle,
          heureDebut: heureDebut,
          heureFin: heureFin,
          jour: jour,
        },
      ]);
      setNomCours('');
      setGroupe('');
      setSalle('');
      setHeureDebut('');
      setHeureFin('');
      setJour('');
    }
  };

  const gereRetraitEntree = (index: number) => {
    const nouvelHoraire = horaire.filter((_, i) => i !== index);
    setHoraire(nouvelHoraire);
  };

  const gereRetraitToutesLesEntrees = () => {
    setHoraire([]);
  };

  const gereGenererCalendrier = () => {
    // Extraire le calendrier pour la session sélectionnée
    const calendrierData = collegeCalendarData.filter(
      (calendrier) => calendrier.session === session
    )[0];

    // Générer le calendrier en prenant l'horaire hebdo et le calendrier scolaire pour la session sélectionnée
    const calendrier = genererCalendrier(
      horaire,
      calendrierData.calendrier,
      ajouterSemaine,
      rappel
    );

    // Créer le fichier de calendrier
    const { error, value } = ics.createEvents(calendrier);
    if (error) {
      console.log(error);
      return;
    }

    // Enregistrer le fichier et le télécharger
    const blob = new Blob([value!], { type: 'text/calendar' });
    saveAs(blob, `horaire.ics`);
  };

  const genererExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      genererCalendrierAvecStartEtEnd(horaire)
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Horaire');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'horaire.xlsx');
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">
        Générateur de rendez-vous Outlook selon le calendrier scolaire
      </h1>

      <form onSubmit={gereAjoutEntree} className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nomCours">Nom du cours</Label>
            <Input
              id="nomCours"
              value={nomCours}
              onChange={(e) => setNomCours(e.target.value)}
              required
              className={erreurs.nomCours ? 'border-red-500' : ''}
            />
            {erreurs.nomCours && (
              <p className="text-red-500 text-sm mt-1">{erreurs.nomCours}</p>
            )}
          </div>
          <div>
            <Label htmlFor="groupe">Groupe</Label>
            <Input
              id="groupe"
              value={groupe}
              onChange={(e) => setGroupe(e.target.value)}
              className={erreurs.groupe ? 'border-red-500' : ''}
            />
            {erreurs.groupe && (
              <p className="text-red-500 text-sm mt-1">{erreurs.groupe}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="salle">Salle</Label>
            <Input
              id="salle"
              value={salle}
              onChange={(e) => setSalle(e.target.value)}
              required
              className={erreurs.salle ? 'border-red-500' : ''}
            />
            {erreurs.salle && (
              <p className="text-red-500 text-sm mt-1">{erreurs.salle}</p>
            )}
          </div>
          <div>
            <Label htmlFor="jourDeSemaine">Jour</Label>
            <Select value={jour} onValueChange={setJour} required>
              <SelectTrigger
                id="jourDeSemaine"
                className={erreurs.jour ? 'border-red-500' : ''}
              >
                <SelectValue placeholder="Choisir le jour de la semaine" />
              </SelectTrigger>
              <SelectContent>
                {listeJourDeSemaine.map((nomJour) => (
                  <SelectItem key={nomJour} value={nomJour}>
                    {nomJour}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {erreurs.jour && (
              <p className="text-red-500 text-sm mt-1">{erreurs.jour}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="heureDebut">Heure début</Label>
            <Select value={heureDebut} onValueChange={setHeureDebut} required>
              <SelectTrigger
                id="heureDebut"
                className={erreurs.heureDebut ? 'border-red-500' : ''}
              >
                <SelectValue placeholder="Choisir l'heure de début" />
              </SelectTrigger>
              <SelectContent>
                {listeHeureDebut.map((heure) => (
                  <SelectItem key={heure} value={heure}>
                    {heure}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {erreurs.heureDebut && (
              <p className="text-red-500 text-sm mt-1">{erreurs.heureDebut}</p>
            )}
          </div>

          <div>
            <Label htmlFor="heureFin">Heure de fin</Label>
            <Select value={heureFin} onValueChange={setHeureFin} required>
              <SelectTrigger
                id="heureFin"
                className={erreurs.heureFin ? 'border-red-500' : ''}
              >
                <SelectValue placeholder="Choisir heure de fin" />
              </SelectTrigger>
              <SelectContent>
                {listeHeureFin.map((heure) => (
                  <SelectItem key={heure} value={heure}>
                    {heure}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {erreurs.heureFin && (
              <p className="text-red-500 text-sm mt-1">{erreurs.heureFin}</p>
            )}
          </div>
        </div>

        <Button type="submit">Ajout à l'horaire</Button>
      </form>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Horaire actuel</h2>
          <Button variant="destructive" onClick={gereRetraitToutesLesEntrees}>
            Retirer toutes les entrées
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom du cours</TableHead>
              <TableHead>Groupe</TableHead>
              <TableHead>Salle</TableHead>
              <TableHead>Jour</TableHead>
              <TableHead>Heure de début</TableHead>
              <TableHead>Heure de fin</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {horaire.map((entry, index) => (
              <TableRow key={index}>
                <TableCell>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    {entry.nomCours}
                  </motion.div>
                </TableCell>
                <TableCell>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    {entry.groupe}
                  </motion.div>
                </TableCell>
                <TableCell>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    {entry.salle}
                  </motion.div>
                </TableCell>
                <TableCell>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    {entry.jour}
                  </motion.div>
                </TableCell>
                <TableCell>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    {entry.heureDebut}
                  </motion.div>
                </TableCell>
                <TableCell>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    {entry.heureFin}
                  </motion.div>
                </TableCell>
                <TableCell className="text-right">
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => gereRetraitEntree(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Retirer entrée</span>
                    </Button>
                  </motion.div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="session">Session</Label>
          <Select value={session} onValueChange={setSession} required>
            <SelectTrigger id="session">
              <SelectValue placeholder="Choisir la session" />
            </SelectTrigger>
            <SelectContent>
              {listeCalendriers.map((nomSession) => (
                <SelectItem key={nomSession} value={nomSession}>
                  {nomSession}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="ajouterSemaine">Numéro de semaine?</Label>
          <Input
            id="ajouterSemaine"
            checked={ajouterSemaine}
            onChange={(e) => setAjouterSemaine(e.target.checked)}
            type="checkbox"
          />
        </div>
        <div>
          <Label htmlFor="rappel">Rappel</Label>
          <Select value={rappel} onValueChange={setRappel} required>
            <SelectTrigger
              id="rappel"
              className={erreurs.rappel ? 'border-red-500' : ''}
            >
              <SelectValue placeholder="Choisir le rappel" />
            </SelectTrigger>
            <SelectContent>
              {listeRappels.map((nomRappel) => (
                <SelectItem key={nomRappel} value={nomRappel}>
                  {nomRappel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {erreurs.rappel && (
            <p className="text-red-500 text-sm mt-1">{erreurs.rappel}</p>
          )}
        </div>
      </div>

      <motion.div
        animate={{
          opacity: !genererDisabled ? 1 : 0.5,
          cursor: !genererDisabled ? 'pointer' : 'not-allowed',
        }}
        transition={{ duration: 1.5 }}
        className="mt-4 w-full flex justify-between"
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full"
          disabled={genererDisabled}
        >
          Afficher calendrier
        </Button>

        <Button
          onClick={gereGenererCalendrier}
          disabled={genererDisabled}
          className="w-full"
        >
          Générer le ficher de rendez-vous (.ics)
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger disabled={genererDisabled}>
            <Button disabled={genererDisabled}>
              <ArrowDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Autres formats</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={genererExcel}>Excel</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
      <GrosCalendrier
        horaire={horaire}
        joursCalendrier={joursCalendrier}
        ajouterSemaine={ajouterSemaine}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}
