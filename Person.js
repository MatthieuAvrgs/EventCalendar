var Event = require('./event');

// Définition de la classe Person
function Person() {
    // Ex de nom :
    // C. Michu -- Infirmière (dans le cas d'un intervenant)
    // M. Toto -- 10 Place Truc, 10000 Troyes (dans le cas d'un bénéficiaire)
    this.name = '';
    // Role : 'b' ou 'i'
    this.role = '';
    this.events = [];
}

// Fonction pour ajouter un evenement en vérifiant ses éventuelles incompatibilités
// @param - event - Event
Person.prototype.addEvent = function (e) {
    var prob = false;
    var eventDateDeb = e.getDateDebut();
    for (var i in this.events) {
        var dateDebTmp = this.events[i].getDateDebut();
        if (dateDebTmp.toString() == eventDateDeb.toString()) {
            throw {'type': 'eventError', 'msg': 'Evenement déjà présent'};
            prob = true;
        }
    }

    if (!prob)
        this.events.push(e);
};

// Recherche l'evenement ayant la date de début indiqué en paramètre et supprime l'evenement trouvé
// @param - dateDebut - Date
Person.prototype.removeEvent = function (dateDebut) {
    for (var ind_e in this.events) {
        var e = this.events[ind_e];
        var dateDebutE = e.getDateDebut();
        if (dateDebut.toString() == dateDebutE.toString())
        this.events.splice(ind_e, 1);
    }
}

// Recherche un évenement à partir de sa date de début et le retourne
// @param - dateDebut - Date
// @return - events[ind_e] - Event
Person.prototype.findEvent = function (dateDebut) {
    for (var ind_e in this.events) {
        var e = this.events[ind_e];
        var dateDebutE = e.getDateDebut();
        if (dateDebut.toString() == dateDebutE.toString())
            return this.events[ind_e];
    }
}

module.exports = Person;
