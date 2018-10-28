// Help and program options.
/**
* TuringSolution.js [-options]
* -h or --help --> affiche le fichier d'aide
* -r or --read file.ics|.txt --> affiche le contenu du fichier iCalendar ou PlanInfo dans la console
* -a or --add "L. Beneficiaire -- Adresse" "L. Intervenant -- Fonction" "Jour HHhMM" fileBeneficiaire fileIntervenant
 * --> ajoute un evenement aux fichiers indiqués (avec détection d'incompatibilité)
 * -u or --update "Jour HHhMM" "Jour_Souhaité HHhMM" fileBeneficiaire fileIntervenant
 * --> Déplace le créneau indiqué en premier vers le créneau souhaité sur les fichiers indiqués (avec détection d'incompatiblité)
 * -d or --delete "Jour HHhMM" fileBeneficiaire fileIntervenant
 * --> Supprimer le créneau renseigné sur les fichiers indiqués
**/

var fs = require('fs');
var File = require('./File');
var Event = require('./Event');
var Tools = require('./Tools');

var myArgs = process.argv.slice(2);
var fileToParse = myArgs[myArgs.length-1];

switch(myArgs[0]){
	case "-h":
	case "help":
	case "--help":
		fs.readFile("README.txt", 'utf8', function(err, data){
			if(err)
				return console.log(err);
			console.log(data);
			process.exit();
		});
		break;

	case "-r":
    case "read":
	case "--read":
        fs.readFile(fileToParse, 'utf8', function(err, data){
            if(err)
                return console.log(err);
            console.log(data);
            process.exit();
        });
        break;

	case "-c":
    case "convert":
	case "--convert":
		var fileToRead = new File(fileToParse);
        var convertedEvents = fileToRead.autoConvert(true);
        var fileToWrite = fileToRead.getFileToWrite();
        fileToRead.write(convertedEvents, fileToWrite);
        console.log("Fichier converti et sauvegardé dans: " + fileToWrite);
		break;

    // node TuringSolution.js add nomBeneficiaire nomIntervenant dateDebut fileBeneficiaire fileIntervenant
    case "-a":
    case "add":
	case "--add":
        if(myArgs.length == 6){
            var beneficiaire = myArgs[1];
            var intervenant = myArgs[2];
            var dateDebut = Tools.convertDateTempToDate(myArgs[3]);
            var fileBeneficiaire = new File(myArgs[myArgs.length-2]); // 4
            var fileIntervenant = new File(fileToParse);

            var e = new Event();
            e.create(dateDebut, beneficiaire, intervenant);
            try {
                fileBeneficiaire.personne.addEvent(e);
                fileIntervenant.personne.addEvent(e);

                var intervenantEvents = fileIntervenant.autoConvert(false);
                var beneficiaireEvents = fileBeneficiaire.autoConvert(false);

                fileIntervenant.write(intervenantEvents);
                fileBeneficiaire.write(beneficiaireEvents);

                console.log("Evenement ajouté aux fichiers");
            }
            catch (e) {
                console.log(e);
                console.log('Incompatibilité détectée');
            }
        }
		break;

    // node TuringSolution.js update oldDateDebut newDateDebut fileBeneficiaire fileIntervenant
    case "-u":
    case "update":
	case "--update":
        if(myArgs.length == 5){
            var oldDateDebut = Tools.convertDateTempToDate(myArgs[1]);
            var newDateDebut = Tools.convertDateTempToDate(myArgs[2]);
            var fileBeneficiaire = new File(myArgs[3]); // 3
            var fileIntervenant = new File(fileToParse);

            var eventBeneficiaire = fileBeneficiaire.personne.findEvent(oldDateDebut);
            var eventIntervenant = fileIntervenant.personne.findEvent(oldDateDebut);
            var b1 = eventBeneficiaire.getBeneficiaire();
            var b2 = eventIntervenant.getBeneficiaire();
            var i1 = eventBeneficiaire.getIntervenant();
            var i2 = eventIntervenant.getIntervenant();
            if(b1 == b2 && i1 == i2){
                fileBeneficiaire.personne.removeEvent(oldDateDebut);
                fileIntervenant.personne.removeEvent(oldDateDebut);

                var e = new Event();
                e.create(newDateDebut, b1, i1);

                try {
                    fileBeneficiaire.personne.addEvent(e);
                    fileIntervenant.personne.addEvent(e);

                    var intervenantEvents = fileIntervenant.autoConvert(false);
                    var beneficiaireEvents = fileBeneficiaire.autoConvert(false);

                    fileIntervenant.write(intervenantEvents);
                    fileBeneficiaire.write(beneficiaireEvents);

                    console.log("Evenement modifié dans les fichiers");
                }
                catch(e) {
                    console.log(e);
                    console.log("Incompatibilité détectée");
                }
            }
        }
		break;

    // node TuringSolution.js update dateDebut fileBeneficiaire fileIntervenant
    case "-d":
    case "delete":
	case "--delete":
        if(myArgs.length == 4){
            var dateDebut = Tools.convertDateTempToDate(myArgs[1]);
            var fileBeneficiaire = new File(myArgs[2]); // 2
            var fileIntervenant = new File(fileToParse);

            var eventBeneficiaire = fileBeneficiaire.personne.findEvent(dateDebut);
            var eventIntervenant = fileIntervenant.personne.findEvent(dateDebut);

            var b1 = eventBeneficiaire.getBeneficiaire();
            var b2 = eventIntervenant.getBeneficiaire();
            var i1 = eventBeneficiaire.getIntervenant();
            var i2 = eventIntervenant.getIntervenant();
            if(b1 == b2 && i1 == i2){
                fileBeneficiaire.personne.removeEvent(dateDebut);
                fileIntervenant.personne.removeEvent(dateDebut);

                var intervenantEvents = fileIntervenant.autoConvert(false);
                var beneficiaireEvents = fileBeneficiaire.autoConvert(false);

                fileIntervenant.write(intervenantEvents);
                fileBeneficiaire.write(beneficiaireEvents);

                console.log("Evenement supprimé dans les fichiers");
            }
        }
		break;

    default:
        console.log("Commande inexistante ou nombre de paramètre incorrect");
        break;
}
