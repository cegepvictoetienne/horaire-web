'use client';

import { useState } from 'react';
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
import { Trash2 } from 'lucide-react';

import IEntree from '@/models/ientree';

import collegeCalendarData from '@/data/collegeCalendarData.json';
import { genererCalendrier } from '@/tools/calendar';
import * as ics from 'ics';
import { saveAs } from 'file-saver';

export function HoraireHebdoComponent() {
  const [nomCours, setNomCours] = useState('');
  const [salle, setSalle] = useState('');
  const [heureDebut, setHeureDebut] = useState('');
  const [heureFin, setHeureFin] = useState('');
  const [jour, setJour] = useState('');
  const [horaire, setHoraire] = useState<IEntree[]>([]);
  const [session, setSession] = useState('');

  const listeHeureDebut = Array.from({ length: 24 }, (_, i) => {
    const heure = i.toString().padStart(2, '0');
    return `${heure}:15`;
  });

  const listeHeureFin = Array.from({ length: 24 }, (_, i) => {
    const heure = i.toString().padStart(2, '0');
    return `${heure}:05`;
  });

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

  const gereAjoutEntree = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (nomCours && salle && heureDebut && heureFin && jour) {
      setHoraire([
        ...horaire,
        {
          nomCours: nomCours,
          salle: salle,
          heureDebut: heureDebut,
          heureFin: heureFin,
          jour: jour,
        },
      ]);
      setNomCours('');
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
    const calendrier = genererCalendrier(
      horaire,
      collegeCalendarData[0].calendrier
    );

    const { error, value } = ics.createEvents(calendrier);
    if (error) {
      console.log(error);
      return;
    }

    const blob = new Blob([value!], { type: 'text/calendar' });
    saveAs(blob, `horaire.ics`);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">
        Générateur de calendrier selon le calendrier scolaire
      </h1>

      <form onSubmit={gereAjoutEntree} className="space-y-4 mb-6">
        <div>
          <Label htmlFor="nomCours">Nom du cours</Label>
          <Input
            id="nomCours"
            value={nomCours}
            onChange={(e) => setNomCours(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="salle">Salle</Label>
            <Input
              id="salle"
              value={salle}
              onChange={(e) => setSalle(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="jourDeSemaine">Jour</Label>
            <Select value={jour} onValueChange={setJour} required>
              <SelectTrigger id="jourDeSemaine">
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
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="heureDebut">Heure début</Label>
            <Select value={heureDebut} onValueChange={setHeureDebut} required>
              <SelectTrigger id="heureDebut">
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
          </div>

          <div>
            <Label htmlFor="heureFin">Heure de fin</Label>
            <Select value={heureFin} onValueChange={setHeureFin} required>
              <SelectTrigger id="heureFin">
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
          </div>
        </div>

        <Button type="submit">Ajout à l'horaire</Button>
      </form>

      {horaire.length > 0 && (
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
                  <TableCell>{entry.nomCours}</TableCell>
                  <TableCell>{entry.salle}</TableCell>
                  <TableCell>{entry.jour}</TableCell>
                  <TableCell>{entry.heureDebut}</TableCell>
                  <TableCell>{entry.heureFin}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => gereRetraitEntree(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Retirer entrée</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

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
      <Button onClick={gereGenererCalendrier} className="w-full">
        Générer le ficher de calendrier
      </Button>
    </div>
  );
}
