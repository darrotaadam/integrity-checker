Intégrité de documents

Deux fonctionnalités: 
    - Signer un document : enregistre une entrée a partir du hash (avec signataire et date de signature) dans la blockchain
    - Vérifier l'authenticité d'un document : vérifier si le document existe dans la blockchain ( recherche a partir de son hash qui agit comme une clé de mapping)


Contrat: 

    

    struct Signature {
        date,
        addr-signataire
     }
    Mapping signatures : <hashdoc, Signature[]>
    #--> Plusieurs personnes peuvent signer un document

    Mapping deja_signes : <hashdoc, Mapping <addr, bool> >
    #--> Verification en O(1) qu'une personne a déjà signé ou non : Verifie que personne ne signe deux fois un document -> Evite pollution de la blockchain et faussement du compte

Synopsis:
1 : Signature
    -L'utilisateur importe un document dans un input sur l'application
    -js hash le document
    #js cherche si le hash existe deja dans la blockchain
    #    Si non : ajoute une entrée au mapping avec le hash comme clé
    #    Si oui : utilise l'entrée du mapping ayant ce hash comme clé
    -si deja_signes[hash][addr] == True c'est que la personne a deja signé : on refuse
    -ajoute une structure Signature au mapping signatures[hash] avec date, adresse du signataire, et potentiellement nom du Document -> pas besoin de verifier si existe 
    on peut utiliser signatures[hash].push()
    -ajoute une entrée dans le mapping deja_signes[hash][addr] = True 

2  : Verification de l'authenticité d'un document
    L'utilisateur importe un document dans un input sur l'application
    js hash le document
    js cherche si le hash existe dans la blockchain | le nombre de signatures pour ce hash (0 par defaut)
    Si oui ça valide l'authenticité du document
    + On peut indiquer le nombre de signataires, et la liste des Signature (date, addr-signataire)


(3) :
    On peut rechercher un hash


(4) : 
    On peut partager un "certificat" au format pdf par ex, qui contient
        nom du fichier
        date de signature
        adresse du signataire
        hash du document signé


Détails techniques : 




