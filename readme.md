# Hermes

Hermes est le `chat` en ligne de la suite cantina

### ⚠️: Installer Hermes peut causer des problèmes sur votre machine si vous faites de mauvaises manipulations ! À vos risques et périls 😆 !

***

## Contribuer :

#### Attention : l'installation de l'outil [Olympe](https://github.com/Cantina-Org/Olympe) (conseillé via [Ouranos](https://github.com/Cantina-Org/Ouranos)) est obligatoire ! (Sinon c'est un peu comme avoir une voiture sans les roues 😇.)

### Étape 1:
Cloner votre [fork](https://github.com/Matyu9/Hermes/fork) de Hermes.

### Étapes 2:
Mettre la variable `debug` à `true` dans `server/index.js` (ligne 1).

### Étapes 3:
Créer un fichier `server/config.json` à la racine du projet Néphélées.

### Étapes 4:
Remplisser le fichier `server/config.json` avec ça:
```json
{
    "database": [
        {
            "database_username": "",
            "database_password": "",
            "database_addresse": "",
            "database_port": ""
        }
    ],
    "port": 3003
}
``` 
Compléter les champs de la catégorie `database` avec les identifiants de votre base de données.

### Étapes 5:
Exécuter `npm i` à la racine du projet.

### Étapes 6:
Lancer le fichier `server/index.js` via votre éditeur de code. (Vous devez exécuter le fichier depuis le dossier `server`).

### Étapes 7:
Rendez-vous sur la page `[host:port]/debug/choose_user` pour choisir l'utilisateur que vous utiliserez.

*** 

## Pour utiliser Cantina Hermes:

Nous ne fournissons aucun installateur pour la production pour le moment. Le service étant instable, nous préférons finir le développement avant de vous fournir un moyen d'installation rapide.
Cependant, si vous souhaitez utiliser `Cantina Hermes` vous pouvez quand même l'installer (↑ voir ci-dessus ↑).
