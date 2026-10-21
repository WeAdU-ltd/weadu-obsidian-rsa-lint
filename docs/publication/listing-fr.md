# Textes de présentation (français)

## Nom

WeAdU RSA Lint

## Description courte

Vérifie les annonces responsives Google Ads écrites dans vos notes : 3 à 15 titres, 2 à 4 descriptions, longueurs, doublons et problèmes éditoriaux courants. En local.

## Description longue

WeAdU RSA Lint vérifie une annonce responsive sur le Réseau de Recherche rédigée dans Obsidian, avant de la coller dans Google Ads.

- Écrivez l'annonce dans un bloc de code `rsa`, avec des lignes Titres:, Descriptions: et Chemins: explicites. Rien n'est deviné d'après la longueur d'une ligne.
- Le rapport vérifie 3 à 15 titres, 2 à 4 descriptions, au plus 2 chemins, les limites de 30, 90 et 15 caractères, les doublons, le point d'exclamation dans un titre et la ponctuation répétée, et signale les numéros de téléphone (hors dates), les mots en capitales et les superlatifs.
- Une commande vérifie la sélection, le bloc `rsa` ou la note, et ouvre le rapport dans une fenêtre. Le plugin ne modifie jamais vos notes.

Les caractères chinois, japonais et coréens comptent double. Un rapport sans erreur est un contrôle local, pas une validation par Google.

Aucun modèle d'IA, aucune requête réseau, aucune collecte de données. Gratuit et open source (licence MIT), conçu par WeAdU.

Note : l'interface du plugin est en anglais, et la détection des superlatifs ne couvre que quelques formules anglaises (« best », « number one », « no. 1 ») et « n°1 ».
