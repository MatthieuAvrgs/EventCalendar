// Libs
var fs = require('fs');
var icalendar = require('./node_modules/icalendar/lib/');
var Tools = require('./Tools');

var Event = require('./Event');
var Person = require('./Person');

// Parser est la classe qui permet de parser tous les fichiers
var Parser = function(file) {
    this.file = file;
}

// Fonction permettant de charger en mémoire tous les evenements d'un fichier iCal
// @return - Person
Parser.prototype.parseICal = function(){
    var data = fs.readFileSync(this.file, {encoding: 'utf-8'});
    var ical = icalendar.parse_calendar(data);
    var result = ical.events();
    var nb_events = result.length;
    var DateDebut = '';
    var DateFin = '';
    var adresse = '';
    var summary = '';

    var person = new Person();

    for (var indice = 0; indice < nb_events; indice++) {
        DateDebut = result[indice].properties['DTSTART'][0].value;
        DateFin = result[indice].properties['DTEND'][0].value;
        adresse = result[indice].properties['LOCATION'][0].value;
        summary = result[indice].properties['SUMMARY'][0].value;

        //remplissage objet personne lors de la récupération du 1e evenement
        if (summary.indexOf("de") == 13) {
            //ex de syntaxe Intervention de C. Gross -- Infirmière chez M. Alberti
            var recuperation_infos1 = summary.split('de');
            var recuperation_infos2 = recuperation_infos1[1].split('chez');
            var intervenant_event = recuperation_infos2[0].trim();

            var beneficiaire_event = recuperation_infos2[1].trim() + " -- " + adresse.trim();

            if (indice == 0) {
                person.name = beneficiaire_event.trim();
                person.role = 'b';
            }
        }
        else if (summary.indexOf("chez") == 13) {
            //ex de syntaxe Intervention chez M. Alberti de C. Gross -- Infirmière
            var recuperation_infos1 = summary.split(' chez ');
            var recuperation_infos2 = recuperation_infos1[1].split(' de ');
            var beneficiaire_nom = recuperation_infos2[0];
            var beneficiaire_event = beneficiaire_nom.trim() + " -- " + adresse.trim();

            var intervenant_event = recuperation_infos2[1].trim();

            if (indice == 0) {
                person.name = intervenant_event;
                person.role = 'i';
            }
        }

        var nb_creneau = Tools.getNbCreneau(DateDebut, DateFin);
        DateDebut = new Date(DateDebut.getTime() + -60 * 60000);
        if (nb_creneau > 1) {
            for (var indice_creneau = 0; indice_creneau < nb_creneau; indice_creneau++) {
                var e = new Event();
                try {
                    e.create(DateDebut, beneficiaire_event, intervenant_event);
                    person.addEvent(e);
                } catch (ex) {
                    console.log(ex.msg);
                }
                DateDebut = new Date(DateDebut.getTime() + 30 * 60000);
            }
        }
        else {
            var e = new Event();
            try {
                e.create(DateDebut, beneficiaire_event, intervenant_event);
                person.addEvent(e);
            } catch (ex) {
                console.log(ex.msg);
            }
        }
    }

    return person;
}

// Fonction permettant de charger en mémoire tous les evenements d'un fichier PlanInfo
// @return - Person
Parser.prototype.parsePlanInfo = function(){
    var events = [];

    var lines = fs.readFileSync(this.file, 'utf8').toString().split("\r\n");

    var intervenant = '';
    var beneficiaire = '';

    // On imagine que tous les calendriers commencent le même jour
    // Lundi 7/11/2016
    // En javascript, les mois commencent à 0 et non à 1
    var annee_debut = 2016;
    var mois_debut = 10;
    var jour_debut = 7;

    var person = new Person();

    for (var i in lines) {
        var line = lines[i].trim();
        if (i == 0) {
            // Matching de la première ligne avec une description d'intervenant
            var detect_inter = /^###(((?:[A-zÀ-ú\. ])*) -- ((?:[A-zÀ-ú]| )+))$/;
            var tab_inter = detect_inter.exec(line);

            // Matching de la première ligne avec une description d'un bénéficiaire
            var detect_benef = /^###(((?:[A-zÀ-ú]| |\.)*) -- ((?:(?:[0-9]+|[0-9]+ (?:[A-zÀ-ú]| )+), (?:(?:[A-zÀ-ú]| )+), (?:[0-9]{5}) (?:(?:[A-zÀ-ú]| )+))))$/;
            var tab_benef = detect_benef.exec(line);

            // Un planning PlanInfo décrit le planning d'un intervenant ou d'un bénéficiaire
            if (tab_inter) {
                // Si c'est un intervenant
                intervenant = tab_inter[1].trim();
                person.name = intervenant;
                person.role = 'i';
            } else if (tab_benef) {
                // Si c'est un bénéficiaire
                beneficiaire = tab_benef[1].trim();
                person.name = beneficiaire;
                person.role = 'b';
            } else {
                console.log('Auteur du planning inconnu');
            }
        }
        else if (i > 1) {
            // Au delà de la 2ème ligne, les informations sont des evenements
            var tab = line.split(";");
            tab.pop(); // la dernière valeur est vide
            var demi_heure = i - 2; // on initialise un compteur de demi-heures
            for (var el in tab) { // On parcourt tous les créneaux d'une même heure sur tous les jours de la semaine
                if (tab[el] != 'vide') {
                    // Dans ce cas uniquement les informations sont utiles
                    var case_content = tab[el];

                    // On définit les informations liées à l'evenement

                    var beneficiaire_event = '';

                    if (beneficiaire) {
                        // Si le planning est celui d'un bénéficiaire, on connait déjà le bénéficiaire de l'event
                        beneficiaire_event = beneficiaire;
                    } else {
                        // Nom du bénéficiaire (Adresse)
                        var case_details = case_content.split('(');
                        beneficiaire_event = case_details[0].trim() + ' -- ' + case_details[1].slice(0, -1);
                        // Nom du bénéficiaire -- Adresse
                    }

                    var intervenant_event = '';
                    if (intervenant) {
                        // Si le planning est celui d'un intervenant, on connait déjà l'intervenant de l'event
                        intervenant_event = intervenant;
                    } else {
                        // Role (Nom de l'intervenant)
                        var case_details = case_content.split('(');
                        intervenant_event = case_details[1].slice(0, -1) + ' -- ' + case_details[0].trim();
                        // Nom de l'intervenant -- Role
                    }

                    // A partir du nombre de demi_heure écoulée, on détermine l'heure et les minutes
                    var minutesDay = demi_heure * 30;
                    var heure_debut = minutesDay / 60;
                    var minute_debut = minutesDay % 60;

                    // En fonction du jour de la semaine, on devine l'avancement dans le mois
                    var jour = jour_debut + (el % 7);

                    var dateDebut = new Date(annee_debut, mois_debut, jour, heure_debut, minute_debut, 0, 0);

                    var e = new Event();

                    try {
                        e.create(dateDebut, beneficiaire_event, intervenant_event);
                        person.addEvent(e);
                    } catch (ex) {
                        console.log(ex.msg);
                    }
                }
            }
        }
    }

    // on retourne l'objet person une fois le file entièrement parcouru
    return person;
}

module.exports = Parser;
