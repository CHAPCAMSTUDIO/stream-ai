# StreamAI

Première fondation d'un studio vocal local destiné aux streamers.

## Fonctionnalités actuelles

- Interface responsive en français
- Autorisation et capture du microphone
- Vumètre audio en temps réel
- Sélection de profils vocaux préparatoire
- Arrêt propre du flux audio

> Les profils ne transforment pas encore la voix. Le prochain jalon est le moteur de traitement audio local.

## Lancement

```bash
npm install
npm run dev
```

Ouvrez ensuite l'adresse indiquée par Vite et autorisez l'accès au microphone.

## Prochaine étape

Brancher un AudioWorklet pour traiter le signal sans bloquer l'interface, puis intégrer un modèle vocal autorisé avec une licence commerciale claire.

## Sécurité

Le projet doit utiliser uniquement des voix originales, personnelles ou fournies avec un consentement vérifiable. Les imitations non autorisées et l'usurpation d'identité ne font pas partie du produit.
