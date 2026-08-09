# StreamAI

MVP gratuit et open source d'un studio vocal local pour streamers et createurs.

## Fonctions actuelles

- Capture du microphone dans le navigateur
- Vumetre en temps reel
- Quatre profils audio gratuits
- Egalisation et compression traitees localement
- Ecoute de l'effet avec un casque
- Aucun compte, abonnement ou paiement

> La version actuelle applique des effets audio classiques. Elle ne reproduit pas la voix d'une personne et n'utilise pas encore de modele de conversion vocale par IA.

## Demarrer en local

```bash
npm install
npm run dev
```

Ouvrez l'adresse affichee par Vite, autorisez le microphone et utilisez un casque avant d'activer l'ecoute.

## Publier gratuitement

Le projet est compatible avec Vercel, Netlify et GitHub Pages. Le microphone exige une page HTTPS en production.

## Prochaines etapes

1. Ajouter un AudioWorklet pour reduire la latence
2. Ajouter l'enregistrement avant/apres
3. Creer une application de bureau et une sortie audio virtuelle pour OBS et Discord
4. Integrer des modeles vocaux originaux avec consentement explicite

## Regles du projet

- Fonctions principales gratuites pour tous
- Traitement local lorsque cela est techniquement possible
- Aucune imitation de voix sans autorisation
- Transparence sur les effets et contenus generes
