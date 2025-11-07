import json
import datetime

def generer_calendrier(debut, fin, jours_feries, jours_speciaux, demi_journees):
    calendrier = []
    occurences_jours = {"Lundi": 0, "Mardi": 0, "Mercredi": 0, "Jeudi": 0, "Vendredi": 0, "Samedi": 0, "Dimanche": 0}
    
    date_actuelle = debut
    while date_actuelle <= fin:
        date_str = date_actuelle.strftime("%Y-%m-%d")
        jour_normal = date_actuelle.strftime("%A")
        
        jour_fr = {
            "Monday": "Lundi", "Tuesday": "Mardi", "Wednesday": "Mercredi", "Thursday": "Jeudi", "Friday": "Vendredi", "Saturday": "Samedi", "Sunday": "Dimanche"
        }[jour_normal]
        
        if date_str in jours_speciaux:
            jour_fr = jours_speciaux[date_str]
        
        
        if date_str in demi_journees:
            statut = demi_journees[date_str]
            if statut == "AM":
                occurences_jours[jour_fr] += 1
        else:
            if date_str in jours_feries or jour_fr in ["Samedi", "Dimanche"]:
                statut = "CONGÉ"
            else:
                statut = "COMPLET"
                occurences_jours[jour_fr] += 1
        
        print(date_str, jour_fr, occurences_jours[jour_fr], statut)
        calendrier.append({
            "date": date_str,
            "jourSemaine": jour_fr,
            "statut": statut,
            "numeroSemaine": occurences_jours[jour_fr] if not statut == "CONGÉ" else 0
        })
        
        date_actuelle += datetime.timedelta(days=1)
    
    return calendrier

# Définition des dates et exceptions
debut_session = datetime.date(2026, 1, 16)
fin_session = datetime.date(2026, 5, 15)
jours_feries = { "2026-03-02", "2026-03-03", "2026-03-04", 
     "2026-03-05", "2026-03-06", "2026-03-24", "2026-04-03", "2026-04-06", "2026-04-24", 
     "2026-05-01", "2026-05-13"}
jours_speciaux = {"2026-03-27": "Mardi", "2026-04-23": "Vendredi", "2026-04-28": "Vendredi"}
demies_journees = {}

# Générer le calendrier
calendrier_scolaire = generer_calendrier(debut_session, fin_session, jours_feries, jours_speciaux, demies_journees)

# Sauvegarder en JSON
with open("calendrier_scolaire.json", "w", encoding="utf-8") as f:
    json.dump(calendrier_scolaire, f, indent=4, ensure_ascii=False)

print("Le fichier calendrier_scolaire.json a été généré avec succès.")
