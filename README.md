#TinyGram

## Présentation du projet
Ce projet TinyGram a été réalisé par 
[Raphaël TENAUD](https://github.com/Raph-glitch), 
[Louis NORMAND](https://github.com/LouisNmd), 
[Sylvain BEAUDOIN](https://github.com/ParadoxeDore), et 
[Thibault COLIN](https://github.com/Thibault-COLIN).
L'objectif du projet est de réaliser une application web qui rassemble les principales fonctionnalités 
d'Instagram comme poster des photos, suivre des profils ou encore liker des publications.
Ce projet a été réalisé en 2020 dans le cadre d'un cours de Web & Cloud and Datastore dispensé par 
[Pascal MOLLY](https://sites.google.com/view/pascal-molli/teaching/webcloud) à l'Université de Nantes.

## Liens utiles

* L'application TinyGram >> [![Application TinyGram](imgReadme/favicon.png)](https://tinygram-1.ew.r.appspot.com/)
* [L'Api REST](https://endpointsportal.tinygram-1.cloud.goog/)
* [Le dépot Github](https://github.com/Raph-glitch/tinyGram)

## Contenu et Fonctionnalités
####Dans ce projet nous avons utilisé :
* [Google App Engine](https://cloud.google.com/appengine?hl=fr) pour concevoir et héberger notre application web basée sur les serveurs google.
* L'interface utilisateur a été réalisée en [mithril](https://mithril.js.org/)
* L'interface utilisateur fait appelle aux services REST écrits en Java à l'aide de [Google Cloud EndPoint](https://cloud.google.com/endpoints/?hl=fr).
* Les services REST demandent et stockent des données dans le [Google Datastore](https://cloud.google.com/datastore/?hl=fr).

####A l'aide de ces outils nous avons pu implémenter les fonctionnalités suivantes :

* **Créer un compte sur l'application** grâce à Google sign-in.
* **Poster une photo sur son profil** avec ou sans description. 
* **Aimer un post** (et unlike un post).
* **Suivre un profil** ( et unfollow un profil).
* Suivre les post des personnes qu'on suit grâce à une **Timeline**.
* **Personnaliser son profil** changer sa photo,son nom, et sa description.
* **Rechercher un profil** grâce à une barre de recherche.

[comment ####Nous avions a résoudre notamment deux problèmes dans le cadre de ce projet :

* Le problème du **Fan-out** c'est à dire comment peut-on poster à un million de
personne et ainsi tester si le nombre d'utilisateurs n'influent pas sur le temps de post d'une image.
Pour ce faire nous avons utilisé  des indexs
*
]: <>

##Benchmark
* ####Présentation des test effectués
Pour chacun des benchmark suivants nous avons réalisé 30 tests en fonction des variables que l'on voulait tester, par exemple en testant sur 10 utilisateurs puis sur 100 et enfin 500.
Ainsi on peut voir si l'exécution de ces requètes scale.
* ####Benchmark Poster un message à x "Followers"
Le temps pris pour ajouter un post au profil avec toutes ses caractéristiques et l'envoyer aux followers en fonction 
du nombre de followers de l'utilisateurs.
![Benchmark Followers](imgReadme/BenchmarkFollowers.PNG)
* ####Benchmark Afficher les x derniers posts
Le temps pris pour afficher les posts de la timeline d'une personne c'est
 à dire les posts des personnes que l'utilisateur suit en fonction du nombre de posts à afficher 
![BenchmarkAffichagePost](imgReadme/BenchmarkAffichagePost.PNG)

[insérer le benchmark des likes]: <>

[ajout d'une conclusion??]:<>

##Capture des kinds utilisés
[insérr les screens]: <>

##Templates de présentation de l'application
[insérer screen de l'application]: <>