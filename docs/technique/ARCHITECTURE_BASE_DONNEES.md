# Architecture de la Base de Données - Shu-no

## Vue d'ensemble

La base de données de **Shu-no** a été conçue selon une architecture relationnelle optimisée pour une plateforme de réservation de gîtes. Elle comprend **7 entités principales** interconnectées qui couvrent l'ensemble des besoins fonctionnels du projet.

## Entités Principales

| Entité           | Rôle                     | Caractéristiques                                |
| ---------------- | ------------------------ | ----------------------------------------------- |
| **User**         | Gestion des utilisateurs | Authentification, rôles (client/admin), profils |
| **Product**      | Catalogue des gîtes      | Descriptions, tarifs, localisation, équipements |
| **Order**        | Système de réservation   | Dates, invités, statuts, prix total             |
| **PricePeriod**  | Tarification dynamique   | Périodes saisonnières, tarifs variables         |
| **Contact**      | Communication client     | Messages, demandes d'information                |
| **RefreshToken** | Sécurité JWT             | Authentification persistante et sécurisée       |
| **Setting**      | Configuration système    | Paramètres globaux de l'application             |

## Relations Clés

- **User → Order** (1-N) : Un utilisateur peut avoir plusieurs réservations
- **Product → Order** (1-N) : Un gîte peut avoir plusieurs réservations
- **Product → PricePeriod** (1-N) : Gestion des tarifs selon les saisons
- **User → RefreshToken** (1-N) : Sécurisation des sessions utilisateur

## Avantages de cette Architecture

✅ **Évolutive** : Structure modulaire permettant l'ajout de nouvelles fonctionnalités  
✅ **Performante** : Index optimisés sur les champs critiques (recherche, réservations)  
✅ **Sécurisée** : Contraintes d'intégrité référentielle et gestion des tokens  
✅ **Flexible** : Tarification dynamique et gestion des périodes complexes

## Schéma Relationnel

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      User       │    │     Product     │    │   PricePeriod   │
│                 │    │                 │    │                 │
│ • id (PK)       │    │ • id (PK)       │    │ • id (PK)       │
│ • email         │    │ • name          │    │ • productId (FK)│
│ • password      │    │ • description   │    │ • startDate     │
│ • firstName     │    │ • price         │    │ • endDate       │
│ • lastName      │    │ • location      │    │ • price         │
│ • role          │    │ • maxGuests     │    │ • name          │
│ • isActive      │    │ • amenities     │    └─────────────────┘
└─────────────────┘    │ • images        │             │
         │              │ • isActive      │             │
         │              └─────────────────┘             │
         │                       │                      │
         │                       │                      │
         ▼                       ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│     Order       │    │    Contact      │
│                 │    │                 │
│ • id (PK)       │    │ • id (PK)       │
│ • userId (FK)   │    │ • firstName     │
│ • productId (FK)│    │ • lastName      │
│ • checkIn       │    │ • email         │
│ • checkOut      │    │ • phone         │
│ • guests        │    │ • subject       │
│ • totalPrice    │    │ • message       │
│ • status        │    │ • isRead        │
│ • notes         │    └─────────────────┘
└─────────────────┘
```

## Technologies Utilisées

- **PostgreSQL** : Base de données relationnelle robuste
- **TypeORM** : ORM pour TypeScript avec migrations automatiques
- **Migrations** : Versioning de la structure de base de données
- **Index** : Optimisation des performances sur les requêtes critiques

## Conclusion

Cette conception répond parfaitement aux **besoins métier** de la plateforme tout en garantissant une **base solide** pour les évolutions futures du projet. L'architecture permet une gestion complète des réservations de gîtes avec une tarification flexible et une sécurité renforcée.

---

_Document créé dans le cadre du projet de stage DWWM - Shu-no_  
_Aurélien Thébault - AFPA Brest - Novembre 2025_
