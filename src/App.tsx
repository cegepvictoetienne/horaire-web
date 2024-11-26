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

import { HoraireHebdoComponent } from './components/horaire-hebdo';

function App() {
  return (
    <>
      <div className="flex justify-end items-center h-screen">
        <HoraireHebdoComponent />
        <img
          src="/cegep.png"
          alt="Cégep de Victoriaville"
          className="w-1/4 h-auto hidden md:block"
        />
      </div>
    </>
  );
}

export default App;
