# **ManagmentTools - Backoffice**  

## **Description**  
Le backend de **ManagmentTools** est une API REST performante permettant la gestion des utilisateurs, des tâches et du chat en temps réel. Il repose sur **Node.js** et **Express.js**, avec une base de données **MongoDB** et une documentation intégrée via **Swagger**.  

## **Technologies Utilisées**  
- **Node.js** : Environnement d'exécution JavaScript.  
- **Express.js** : Framework pour la création de l'API REST.  
- **MongoDB + Mongoose** : Base de données NoSQL et ORM pour simplifier les requêtes.  
- **Socket.io** : Gestion des événements en temps réel (chat et Kanban).  
- **JWT** : Sécurisation des sessions utilisateur.  
- **Swagger** : Documentation API accessible via `/api-docs`.  

## **Fonctionnalités Principales**  
### 1. **Authentification et Gestion des Utilisateurs**  
- Inscription et connexion sécurisées (JWT).

### 2. **Gestion des Tâches (Kanban en Temps Réel)**  
- Création et gestion de projets Kanban.  
- Ajout, modification et suppression de tâches.  
- Attribution des tâches aux utilisateurs.  
- Synchronisation des modifications en temps réel via **Socket.io**.  

### 3. **Messagerie Instantanée**  
- Démarrage et gestion de conversations.  
- Affichage de l’historique des messages.

## **Installation et Déploiement**  

### **Prérequis**  
- **Node.js** (>= 16.x)  
- **MongoDB** (local ou distant)  
- **NPM**  

### **Installation**  
1. Cloner le dépôt :  
   ```sh
   git clone https://github.com/julessilvestri/ManagmentTools-backoffice.git
   cd ManagmentTools-backoffice
   ```  
2. Installer les dépendances :  
   ```sh
   npm install
   ```  
3. Lancer le serveur :  
   ```sh
   npm start
   ```  

### **Tests**  
Exécuter les tests unitaires avec :  
```sh
npm test
```  
