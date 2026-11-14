# Textes de présentation (français)

## Nom

WeAdU RSA Lint

## Description courte

Vérifie une annonce responsive dans une note. Specs : 1 à 15 titres et 1 à 4 descriptions. L'éditeur en demande 3 et 2 avant l'enregistrement. Longueurs et ponctuation. En local.

## Description longue

WeAdU RSA Lint vérifie une annonce responsive sur le Réseau de Recherche rédigée dans Obsidian, avant de la coller dans Google Ads.

- Écrivez l'annonce dans un bloc de code `rsa`, avec des lignes Titres:, Descriptions: et Chemins: explicites. Rien n'est deviné d'après la longueur d'une ligne.
- Le rapport prend 1 à 15 titres et 1 à 4 descriptions comme bornes des specs Search. Moins de 3 titres ou de 2 descriptions est un avertissement, parce que l'éditeur en demande autant avant l'enregistrement. Il contrôle aussi les limites de 30, 90 et 15 caractères, les doublons et les signes répétés (`!!`, `??`). Un seul point d'exclamation et une ellipse sont admis. Il signale les numéros de téléphone (hors dates), les mots en capitales (un sigle n'est pas dit interdit) et les superlatifs.
- Une commande vérifie la sélection, le bloc `rsa` ou la note, et ouvre le rapport dans une fenêtre. Le plugin ne modifie jamais vos notes.

Les caractères chinois, japonais et coréens comptent double. Un rapport sans erreur est un contrôle local, pas une validation par Google.

Aucun modèle d'IA, aucune requête réseau, aucune collecte de données. Gratuit et open source (licence MIT), conçu par WeAdU.

Note : l'interface du plugin est en anglais, et la détection des superlatifs ne couvre que quelques formules anglaises (« best », « number one », « no. 1 ») et « n°1 ».
