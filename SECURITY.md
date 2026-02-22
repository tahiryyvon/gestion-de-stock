# Security Policy

## 🛡️ Supported Versions

Nous fournissons des mises à jour de sécurité pour les versions suivantes :

| Version | Support         |
| ------- | --------------- |
| 1.0.x   | ✅ Supporté     |
| < 1.0   | ❌ Non supporté |

## 🚨 Signaler une vulnérabilité

La sécurité de notre application est une priorité absolue. Si vous découvrez une vulnérabilité de sécurité, merci de nous la signaler de manière responsable.

### 📧 Contact sécurisé

**NE PAS créer d'issue publique pour les vulnérabilités de sécurité.**

Pour signaler une vulnérabilité :

1. **Email sécurisé** : Envoyez un email à `security@[domain].com`
2. **Chiffrement** : Utilisez notre clé PGP si possible (voir ci-dessous)
3. **Urgence** : Mentionnez le niveau de criticité dans l'objet

### 📝 Informations à inclure

Pour nous aider à évaluer et corriger rapidement la vulnérabilité, veuillez inclure :

- **Type de problème** (ex: injection SQL, XSS, déni de service, etc.)
- **URL(s) affectée(s)** ou localisation du code
- **Étapes pour reproduire** la vulnérabilité
- **Impact potentiel** et scénarios d'exploitation
- **Versions affectées**
- **Preuves de concept** (PoC) si disponible
- **Recommandations** pour la correction si vous en avez

### ⏱️ Délais de réponse

| Étape | Délai |
|-------|-------|
| Accusé de réception | 24 heures |
| Évaluation initiale | 72 heures |
| Plan de correction | 1 semaine |
| Correction déployée | Variable selon la criticité |

### 🏆 Programme de récompense

Nous apprécions les signalements responsables de vulnérabilités :

| Criticité | Récompense |
|-----------|------------|
| Critique | 500€ - 1000€ |
| Haute | 200€ - 500€ |
| Moyenne | 100€ - 200€ |
| Basse | 50€ - 100€ |

**Conditions :**
- Première découverte de la vulnérabilité
- Signalement responsable (pas de divulgation publique)
- Respect de nos systèmes et données
- Coopération durant le processus de correction

### 🔐 Clé PGP publique

```
-----BEGIN PGP PUBLIC KEY BLOCK-----
[Votre clé PGP publique ici]
-----END PGP PUBLIC KEY BLOCK-----
```

## 🛠️ Mesures de sécurité implémentées

### 🔒 Authentification et autorisation
- Authentification JWT sécurisée
- Hachage bcrypt pour les mots de passe
- Gestion des rôles et permissions
- Protection CSRF avec next-auth
- Sessions sécurisées

### 🌐 Sécurité web
- Headers de sécurité (CSP, HSTS, etc.)
- Protection XSS avec React et sanitisation
- Validation d'entrée côté serveur
- Protection contre l'injection SQL avec Prisma
- Rate limiting sur les API

### 🗄️ Base de données
- Connexions chiffrées (SSL/TLS)
- Principe du moindre privilège
- Sauvegarde chiffrée
- Audit trail des accès

### 📊 Monitoring et logging
- Logging des actions sensibles
- Monitoring des tentatives d'intrusion
- Alertes automatiques sur les anomalies
- Audit régulier des logs

## 📋 Checklist de sécurité pour les développeurs

### ✅ Avant chaque release
- [ ] Audit des dépendances avec `npm audit`
- [ ] Scan de sécurité avec Snyk
- [ ] Tests de pénétration sur les nouvelles fonctionnalités
- [ ] Revue de code focalisée sécurité
- [ ] Vérification des permissions et accès

### ✅ Configuration sécurisée
- [ ] Variables d'environnement sensibles dans `.env`
- [ ] Aucun secret hardcodé dans le code
- [ ] HTTPS en production
- [ ] Headers de sécurité configurés
- [ ] CORS correctement configuré

## 🚫 Scope exclusions

Les éléments suivants sont **exclus** de notre programme de sécurité :

- Attaques DoS/DDoS
- Spam ou social engineering
- Vulnérabilités nécessitant un accès physique
- Attaques sur des environnements de développement/test
- Vulnérabilités dans des dépendances tierces déjà corrigées

## 📞 Contact d'urgence

En cas d'incident de sécurité critique en cours :

- **Téléphone** : +33 X XX XX XX XX (24/7)
- **Email urgent** : `incident@[domain].com`

## 📚 Ressources

### 🔗 Liens utiles
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Guide de sécurité Next.js](https://nextjs.org/docs/going-to-production#security-headers)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/security)

### 📖 Documentation interne
- [Architecture de sécurité](docs/security-architecture.md)
- [Guide de développement sécurisé](docs/secure-development.md)
- [Procédures d'incident](docs/incident-response.md)

## 🎯 Politique de divulgation

1. **Coordination** : Nous travaillons avec vous pour planifier la divulgation
2. **Délais** : 90 jours maximum entre le signalement et la divulgation publique
3. **Crédit** : Nous mentionnons votre contribution (avec votre accord)
4. **Transparence** : Publication d'un rapport post-incident si pertinent

## ⚖️ Aspect légal

En signalant une vulnérabilité de manière responsable :
- Vous êtes protégé contre les poursuites légales
- Vous respectez nos conditions d'utilisation
- Vous ne violez pas la confidentialité des données
- Vous n'interrompez pas nos services

---

**Dernière mise à jour :** Janvier 2024  
**Version de la politique :** 1.0