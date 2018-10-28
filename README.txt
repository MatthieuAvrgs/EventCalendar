### README - Yadom - Projet GL02

Description : Ce programme permet d’importer et d’exporter aux formats PlanInfo et iCalendar les plannings des intervenants et des bénéficiaires de l’entreprise Yadom. Il est également possible de modifier ces plannings directement depuis le logiciel.

### Dépendance :
Le programme ré-utilise l’extension node-icalendar écrit par “Tri Tech Computers Ltd.” (sous licence MIT)
Pour installer l’extension, il faut saisir la commande “npm install icalendar”.

### Utilisation :
$ node TuringSolution.js -h or --help (--> affiche le fichier d'aide)

$ node TuringSolution.js -r or --read <file.ics> (--> affiche le contenu du fichier iCalendar dans la console)

$ node TuringSolution.js -r or --read <file.txt> (--> affiche le contenu du fichier PlanInfo dans la console)

$ node TuringSolution.js -a or --add "Nom_Beneficiaire -- Adresse" "Nom_Intervenant -- Fonction" "Jour HHhMM" <fileBeneficiaire> <fileIntervenant> (--> ajoute un evenement aux fichiers indiqués (formats ICalendar ou PlanInfo) avec détection d'incompatibilité)

“Jour” correspond au jour de la semaine en toutes lettres (par exemple : “Lundi”)
“Nom_Beneficiaire” peut être précédé de la première lettre du prénom de la personne (par exemple : “A. Toto”)

$ node TuringSolution.js -u or --update "Jour HHhMM" "Jour_Souhaité HHhMM" <fileBeneficiaire> <fileIntervenant> (--> Déplace le créneau indiqué en premier vers le créneau souhaité sur les fichiers indiqués (formats ICalendar ou PlanInfo) avec détection d'incompatiblité)

$ node TuringSolution.js -d or --delete "Jour HHhMM" <fileBeneficiaire> <fileIntervenant> (--> Supprimer le créneau renseigné sur les fichiers indiqués (formats ICalendar ou PlanInfo))


### Préconisation d’usage :
Les chemins vers les fichiers sont relatifs par rapport à l’emplacement du fichier TuringSolution.js
Pour la conversion et/ou l'affichage de fichiers sous le format en PlanInfo, il faut bien vérifier que le fichier d'origine de type PlanInfo soit encodé en UTF-8 (sans BOM).

### Ecart avec le cahier des charges :
La spécification fonctionnelle liée à la détection de conflits ne s’utilise pas comme les autres spécifications (1 ligne de commande pour réaliser l’action), elle intervient lors de la création ou modification d’évènements. S’il y a un conflit, l'événement n’est pas créé ou modifié (un message notifie l’utilisateur). La détection de conflit se fait côté intervenant mais aussi côté bénéficiaire. Dans les deux cas, seul un rendez-vous est possible pour un créneau donné.
La modification d’un créneau ne peut se faire qu’au niveau de l’horaire de début. En l’absence de base de données relationnelle, nous n’avons pas permis la modification du bénéficiaire ou de l’intervenant d’un créneau.
Les collections d'événements sont représentées par la classe “Personne”. Quelques signatures de ces collections d'événements (intersection, union) n’ont pas été réalisées car elles n’étaient pas nécessaires pour effectuer les spécifications algébriques. Un certain nombre des opérations indiquées dans le cahier des charges sont proposées nativement par les tableaux Javascript.
Dans la classe Evenement, nous avons essayé de suivre les spécifications algébriques mais nous nous en servons finalement pas.
Le format de données indique que le genre peut être indiqué pour un intervenant ou un bénéficiaire. Or c’est la première lettre du prénom de la personne qui figure devant son nom. Nous avons adapté le logiciel en conséquence.

### Améliorations futures :
L’interface utilisateur pourrait être changée afin que ce dernier ait plus de facilité lors de la création d’un événement / modification d’un événement (version 0.01). Cela permettrait de mieux guider l’utilisateur pour être sûr qu’il effectue les bonnes actions. Cela permettrait aussi une meilleure vérification du contenu que l’utilisateur saisit et ainsi permettre de lui notifier plus précisément d’où vient le problème (s’il y en a un).

### Version : 
version 0.01 (commit de 25 à 50) : développement d’un système de questions/réponses pour que l’utilisateur ait plus de facilités à comprendre le système de création d’évènement.
version 0.02 (commit de 51 à 116) : abandon du système de questions/réponses pour se concentrer sur les fonctions du logiciel. Les paramètres seront désormais passés directement depuis l’appel du fichier.
version 0.03 (commit de 117 à 119) : après épuration et restructuration du code, toutes les fonctionnalités sont désormais exploitables en passant par la console. Le résultat final donne un ‘logiciel’ fonctionnel répondant au cahier des charges.




### Liste des contributeurs :
Matthieu Avargues, Etienne Cunin, Quentin Pierre, Fangxu Zhou
