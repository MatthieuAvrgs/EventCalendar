var Tools = function () {
}

// Retourne le nombre de creneau possible entre deux dates
// @param - dateDebut, dateFin - Date, DateFin
// @return - difference - integer
Tools.getNbCreneau = function (dateDebut, dateFin) {
    var difference = (dateFin - dateDebut) / 60 / 1000 / 30;
    return difference;
}

// Retourne un string contenant une date au format iCal (format en début de fichier)
// @param - date - date
// @return - dateICal - string
Tools.convertDateToICal = function (date) {
    // Year : getFullYear = donne l'annee (ex: 2016)
    var dateICal = date.getFullYear().toString(); // toString obligatoire pour éviter des additions par la suite !

    // Month : getMonth = donne le mois de 0 à 11
    if (date.getMonth() + 1 < 10)
        dateICal += "0";
    dateICal += date.getMonth() + 1;

    // Day : getDate = donne le jour de 1 à 31
    if (date.getDate() < 10)
        dateICal += "0";
    dateICal += date.getDate();

    dateICal += "T";

    // Hours : getHours = donne l'heure de 0 à 23
    if (date.getHours() < 10)
        dateICal += "0";
    dateICal += date.getHours();

    // Minutes : getMinutes = donne les minutes de 0 à 59
    if (date.getMinutes() < 10)
        dateICal += "0";
    dateICal += date.getMinutes();

    // Seconds : getSeconds = donne les secondes de 0 à 59
    if (date.getSeconds() < 10)
        dateICal += "0";
    dateICal += date.getSeconds();

    dateICal += "Z";

    return dateICal;
}

// Fonction recursive qui permet de fusionner les events qui se suivent
// @param - eventsToMerge, mergedEvents - array<Event>, array<Event>
Tools.mergeEvents = function (eventsToMerge, mergedEvents) {
    // On vérifie si le tableau possède au moins un element
    if (eventsToMerge.length > 0) {
        // Index de l'evenement à supprimer en cas de fusion
        var indexToRemove = -1;
        // On parcourt le tableau des events a fusionner dans le but de trouver un event qui vient à la suite du premier event du tableau
        for (var i = 1; i < eventsToMerge.length; i++) {
            // On sauvegarde dans des variables temporaires pour éviter les problèmes liés aux attributs privés
            var b1 = eventsToMerge[0].getBeneficiaire();
            var b2 = eventsToMerge[i].getBeneficiaire();

            var i1 = eventsToMerge[0].getIntervenant();
            var i2 = eventsToMerge[i].getIntervenant();

            var d1 = eventsToMerge[0].getDateFin().toString();
            var d2 = eventsToMerge[i].getDateDebut().toString();

            // Si on trouve un event qui correspond à la suite du premier event du tableau, alors on note son index et on quitte la boucle for puisqu'on l'a trouve
            if (b1 == b2 && i1 == i2 && d1 == d2) {
                indexToRemove = i;
                break;
            }
        }
        // Si on a trouvé un event a fusionné, on supprime l'event trouvé et on ajoute simplement 30 min au premier event
        if (indexToRemove != -1) {
            eventsToMerge[0].add30min();
            eventsToMerge.splice(i, 1);
        }
        // Si on a rien trouvé, c'est que cet event est maintenant independant, on peut l'ajouter dans les events fusionnés
        else {
            mergedEvents.push(eventsToMerge[0]);
            eventsToMerge.splice(0, 1);
        }
        // On appelle la fonction en recursif afin de continuer la fusion
        Tools.mergeEvents(eventsToMerge, mergedEvents);
    }
    // si ce n'est pas le cas, c'est qu'on a terminé
}

//fonction permettant d'obtenir les numeros (entre 1 er 336) de creneaux de l'evenement
// @param - dateDebut, dateFin - Date, Date
// @return - nbr_creneau, num_creneau_debut - int, int
Tools.createCreneau = function (dateDebut, dateFin) {
    //on recupere la date decomposée en jour, heure , minute pour pouvoir exploiter les données
    var jour_debut = dateDebut.getDay(); //return  un num correspondant au jour (lundi=0, mardi=1...)
    var jour_fin = dateFin.getDay();
    var heure_debut = dateDebut.getHours(); //return l'heure sous forme d'un nbr (22 pour 22h)
    var heure_fin = dateFin.getHours();
    var minute_debut = dateDebut.getMinutes(); //return les minutes sous forme d'un nbr (30 pour 30)
    var minute_fin = dateFin.getMinutes();

    //conversion des jours parceque dans DateTime le dimanche correspond à 0 (US)
    if (jour_debut == 0)
        jour_debut = 7;
    if (jour_fin == 0)
        jour_fin = 7;

    // Si le creneau commence a 30 il faut ajouter 7 au numéro de creneau dans le calendrier car il faut aller à la ligne suivante
    if (minute_debut == 30)
        minute_debut_modif = 7;
    else
        minute_debut_modif = 0;

    //On obtient le num de creneau nbr entre 1 et 336
    var num_creneau_debut = heure_debut * 7 * 2 + jour_debut + minute_debut_modif; //*7 car 7j dans la semaine|*2 car on a des heures qu'on converti en 1/2 heure| par exemple heure:01/jour:Jeudi/minute:30 => 01*7*2+4+7=25 => cela correspond au creneau 25 sur le calendrier

    //on calcule le nbr de creneau d1/2 heure lié à l'event
    var difference_heure = heure_fin - heure_debut;
    var difference_minute = minute_fin - minute_debut;
    if (difference_minute < 0) {
        difference_heure = difference_heure - 1;
        difference_minute = 0.5;
    }
    else if (difference_minute == 30) {
        difference_minute = 0.5
    }
    else {
        difference_minute = 0;
    }
    var difference_totale = difference_heure + difference_minute;
    var nbr_creneau = 1;
    while (0.5 * nbr_creneau < difference_totale) {
        nbr_creneau = nbr_creneau + 1;
    }

    //on a récupéré le numero de creneau du debut et le nbr de creneau, on les return dans la fonction principale
    return [nbr_creneau, num_creneau_debut];
}

Tools.convertDateTempToDate = function (dateTemp) {
    var week = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
    // Lundi 10h // Dimanche 20h30
    var dateDetails = dateTemp.trim().toLowerCase().split(' ');
    var day = week.indexOf(dateDetails[0]);
    var heureDetails = dateDetails[1].split('h');
    return (new Date(2016, 10, day + 7, heureDetails[0], heureDetails[1]));
}

module.exports = Tools;
