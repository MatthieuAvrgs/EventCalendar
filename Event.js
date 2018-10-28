// Définition de la classe Event qui permet de s'assurer de la bonne syntaxe des evenements
var Event = function() {

    // définition des attributs privés
    var id = '';
    var beneficiaire = '';
    var intervenant = '';
    var dateDebut = '';
    var dateFin = '';

    // définition des getters
    this.getBeneficiaire = function () {
        return beneficiaire;
    }

    this.getIntervenant = function () {
        return intervenant;
    }

    this.getDateDebut = function () {
        return dateDebut;
    }

    this.getDateFin = function () {
        return dateFin;
    }

    // définition des setters
    // une vérification est faite sur la variable en entrée
    // le cas échéant, une exception est lancée

    // On essaye le faire correspondre la variable en entrée avec une regex
    // L'attribut beneficiaire est mémorisée si cela fonctionne.
    // @param - str - chaine correspondant aux infos du bénéficiaires
    this.setBeneficiaire = function (str) {
        // Ex : M. Bernard -- 10 bis, Place du Bidule, 10000 New York
        if (/^((?:[A-zÀ-ú \.])*) \-\- [0-9]+[a-zA-Z\ ]*, [a-zA-Z\ ]+, [0-9]{5} [\-a-zA-Z\ ]+$/.test(str)) {
            beneficiaire = str;
        } else {
            throw {'type': 'benefError', 'msg': 'Il y a un problème avec le bénéficiaire.'};
        }
    };

    this.setIntervenant = function (str) {
        // Ex M. Bernard -- Infirmier
        if (/^((?:[0-9A-zÀ-ú \.])+) \-\- ([0-9A-zÀ-ú\ ]+)$/.test(str)) {
            intervenant = str;
        } else {
            throw {'type': 'IntervenantError', 'msg': 'Il y a un problème avec l\'intervenant.'};
        }
    }

    // Lors de l'insertion d'une date de début, la date de fin est automatiquement calculée
    // Le système considère qu'un évenement est un créneau de 30 min
    // Il est possible de créer en amont des evenements identiques qui se suivent si on veut faire durer
    // l'evenement plus longtemps
    // @param - dt - objet Date correspondant à la date de début
    this.setDateDeb = function (dt) {
        dateDebut = dt;
        // On ajoute 30 minutes pour obtenir la date de fn
        dateFin = new Date(dateDebut.getTime() + 30 * 60000);
    }

    // Permet d'ajouter facilement 30 min à un evenement
    // utilisé uniquement dans la fusion d'evenement lors de la conversion des events au format iCal
    this.add30min = function() {
        dateFin = new Date(dateFin.getTime() + 30 * 60000);
    }
}

// create permet d'insérer plusieurs attributs en une seule fois (constructeur)
// @param - dateDebut, beneficiaire, intervenant - Date, string, string
// @return - this - objet (Event)
Event.prototype.create = function (dateDebut, beneficiaire, intervenant) {
    this.setDateDeb(dateDebut);
    this.setBeneficiaire(beneficiaire);
    this.setIntervenant(intervenant);
    return this;
};

// Définition des fonctions statiques

// equivalence permet de vérifier si deux objets sont au niveau du même identifiant mémoire
// @param - event1, event2 - 2 objets "Event"
// @return - booleen
Event.equivalence = function (event1, event2) {
    if (event1 === event2) {
        return true;
    } else {
        return false;
    }
}

// difference calcule le temps qu'il y a entre la fin de l'event1 et le début de l'event 2
// @param - event1, event2 - 2 objets "Event"
// @return - valeur - integer (temps en ms)
Event.difference = function (event1, event2) {
    var valeur = event2.dateDebut - event1.dateFin;
    return valeur;
}

// inferieur indique si l'event1 commence avant l'event2
// @param - event1, event2 - 2 objets "Event"
// @return - booleen
Event.lower = function (event1, event2) {
    return (event1.dateDebut < event2.dateDebut);
}

module.exports = Event;
