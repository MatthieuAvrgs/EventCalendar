var fs = require('fs');
var Tools = require('./Tools');
var Parser = require('./Parser');


// File est la classe qui permet de gérer tous les fichiers
// @param - file - string
var File = function(file) {
    this.file = file;
    this.parser = new Parser(this.file);
    this.type = this.detectType();
    this.personne = this.parse();
}

// Retourne le type du fichier à partir de l'analyse de sa première ligne
// @return - string
File.prototype.detectType = function(){
    var lines = fs.readFileSync(this.file, 'utf8').toString().split("\r\n");
    if (lines[0].trim().substr(0, 3) == "###")
        return "plan_info";
    else
        return "ical";
}

// Retourne la personne concerné par le fichier complete avec ses attributs
// @return - person
File.prototype.parse = function(){
    if(this.type == "plan_info")
        return this.parser.parsePlanInfo();
    else if(this.type == "ical")
        return this.parser.parseICal();
}

// Retourne les events passés en paramètres au format iCal
// @param - personne - Person
// @return - eventsICal - string
File.prototype.convertEventsToICal = function(){
    // Variable pour stocker le string que l'on va retourner
    var eventsICal = "";

    // début classique d'un fichier iCal
    eventsICal += "BEGIN:VCALENDAR\r\n";
    eventsICal += "VERSION:2.0\r\n";
    eventsICal += "PRODID:Yadom\r\n";

    var events = this.personne.events;
    // On fusionne les evenements qui se succede pour eviter d'avoir 6 créneau de 30 min si le RDV dure 3h
    var mergedEvents = [];
    Tools.mergeEvents(events, mergedEvents);

    // on parcourt les events pour les structurer
    for (var e in mergedEvents) {
        var now = new Date();
        var beneficiaire = mergedEvents[e].getBeneficiaire().split("--"); // Ex : M. Bernard -- 10 bis, Place du Bidule, 10000 New York
        var intervenant = mergedEvents[e].getIntervenant(); // Ex : M. Bernard -- Infirmier

        // pour manipuler l'objet: mergedEvents[e]
        eventsICal += "BEGIN:VEVENT\r\n";
        eventsICal += "CREATED:" + Tools.convertDateToICal(now) + "\r\n";
        eventsICal += "UID:" + Tools.convertDateToICal(mergedEvents[e].getDateDebut()) + intervenant.toUpperCase().trim() + "\r\n"; // Rien de spécifier dans le Cahier des charges pour le format de UID
        eventsICal += "DTSTART:" + Tools.convertDateToICal(mergedEvents[e].getDateDebut()) + "\r\n";
        eventsICal += "DTEND:" + Tools.convertDateToICal(mergedEvents[e].getDateFin()) + "\r\n";

        if(this.personne.role == "b")
            eventsICal += "SUMMARY:Intervention de " + intervenant.trim() + " chez "+ beneficiaire[0].trim() +"\r\n";
        else if (this.personne.role == "i")
            eventsICal += "SUMMARY:Intervention chez " + beneficiaire[0].trim() + " de "+ intervenant.trim() + "\r\n";

        eventsICal += "LOCATION:" + beneficiaire[1].trim() + "\r\n";
        eventsICal += "DTSTAMP:" + Tools.convertDateToICal(now) + "\r\n";
        eventsICal += "SEQUENCE:1\r\n";
        eventsICal += "END:VEVENT\r\n";
    }

    // fin classique d'un fichier ICal
    eventsICal += "END:VCALENDAR\r\n";

    return eventsICal;
}

// Recupère les events passés en paramètres au format planInfo
// @param - personne - Person
// @return - eventsPlanInfo - string
File.prototype.convertEventsToPlanInfo = function(){
    // Variable pour stocker le string que l'on va retourner
    var eventsPlanInfo = "";
    // variable qui va stocker les infos des creneaux + leur numéro
    var creneaux_infos = new Object();

    if (this.personne.role == "b"){
        // recup info beneficiaire (affichage en haut du fichier) (ex : ### M. Alberti -- 55 bis, rue Pinel, 99120 Yers)
        var beneficiaire = this.personne.name;
        var res1 = beneficiaire.split("--");
        var nom_beneficiaire = res1[0].trim();
        var adresse_beneficiaire = res1[1].trim();
    }
    else {
        // recup infos intervenant (ex d'affichage :### C. Gross -- Infirmière)
        var intervenant = this.personne.name;
        var res1 = intervenant.split("--");
        var nom_intervenant = res1[0].trim();
        var fonction_intervenant = res1[1].trim();
    }


    var events = this.personne.events;
    // on parcourt les events pour les structurer
    for (var e in events){
        // on donne les dates de l'event, on y recupère le numero de creneau et le nbr de creneau d1/2h (utile pour l'affichage en PlanInfo)
        var tab_info_creneau = Tools.createCreneau(events[e].getDateDebut(), events[e].getDateFin());

        // reformulation des variables pour que ce soit plus clair
        var num_creneau_debut = tab_info_creneau[1];
        var nbr_creneau = tab_info_creneau[0];

        //si role est beneficiare, je dois recuperer le nom et la fonction de l'intervenant pour pouvoir afficher ensuite
        if (this.personne.role == "b"){
            //recuperation des données à mettre dans le calendrier  affichage ...vide;Infirmière (C. Gross);vide....
            var intervenant = events[e].getIntervenant();
            var res2 = intervenant.split("--");
            var infos_event = res2[1].trim() + " " + "(" + res2[0].trim() + ")";
        }
        //sinon je recupere le nom et l'adresse du beneficiaire
        else {
            //recuperation des données à mettre dans le calendrier  affichage ...vide;Mme Auban (53, rue Pinel, 99120 Yers);vide...
            var beneficiaire = events[e].getBeneficiaire();
            var res2 = beneficiaire.split("--");
            var infos_event = res2[0].trim() + " " + "(" + res2[1].trim() + ")";
        }

        //enregistrement dans le tableau du premier creneau lié à l'evenement
        creneaux_infos[num_creneau_debut] = infos_event;
        var num_creneau = num_creneau_debut;

        //enregistrement dans le tableau des infos de l'event avec comme cle le num de creneau
        for (var e = 1; e < nbr_creneau; e++){
            num_creneau = num_creneau + 7;
            creneaux_infos[num_creneau_debut] = infos_event;
        }
    }

    // debut classique d'un fichier PlanInfo
    if (this.personne.role == "b"){
        // ### M. Alberti -- 55 bis, rue Pinel, 99120 Yers
        eventsPlanInfo += "###" + " " + nom_beneficiaire + " " + "--" + " " + adresse_beneficiaire + "\r\n";
        eventsPlanInfo += "lundi;mardi;mercredi;jeudi;vendredi;samedi;dimanche" + "\r\n";
    }
    else {
        // ### C. Gross -- Infirmière
        eventsPlanInfo += "###" + " " + nom_intervenant + " " + "--" + " " + fonction_intervenant + "\r\n";
        eventsPlanInfo += "lundi;mardi;mercredi;jeudi;vendredi;samedi;dimanche" + "\r\n";
    }

    //boucle for permettant l'enregistrement des creneaux dans eventsPlanInfo
    for (var e_creneau = 1; e_creneau <= 336; e_creneau++){
        //si creneaux_infos[e_creneau] existe, on enregistre les infos liées au creneau sinon on enregistre vide;
        if (creneaux_infos.hasOwnProperty(e_creneau))
            eventsPlanInfo += creneaux_infos[e_creneau] + ";";
        else
            eventsPlanInfo += "vide;";

        //sachant qu'il y a 336 creneau d'1/2h dans 1 semaine, lorsque le num de creneau est multiple de 7, il y a un retour à la ligne
        if (e_creneau % 7 == 0)
            eventsPlanInfo += "\r\n";
    }

    return eventsPlanInfo;
}

// Choisi seul la conversion a effectuer
// @param - inverse - boolean
// @return - string
File.prototype.autoConvert = function(inverse){
    if((this.type == "plan_info" && inverse) || (this.type == "ical" && !inverse))
        return this.convertEventsToICal();
    else if((this.type == "ical" && inverse) || (this.type == "plan_info" && !inverse))
        return this.convertEventsToPlanInfo();
}

// Ecris le string en paramètre dans le fichier
// @param - str - string
File.prototype.write = function(str, fileToWrite){
    if(typeof fileToWrite == "undefined")
        fs.writeFile(this.file, str);
    else
        fs.writeFile(fileToWrite, str);
}

// Indique le nom que doit porter le fichier dans lequel ecrire, en fonction du type actuel
// @return - fileToWrite - string
File.prototype.getFileToWrite = function(){
    var fileToWrite = this.file.substr(0, this.file.length-4);
    if(this.type == "plan_info")
        fileToWrite += ".ics";
    else if(this.type == "ical")
        fileToWrite += ".txt";
    return fileToWrite;
}

module.exports = File;
