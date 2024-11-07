// Déclarer un tableau JavaScript global nommé : TArticles.
var TArticles = [];
var TArticlesChoisis = [];

// Fonction init qui sera exécutée au chargement de la page
function init() {
    // Utilisation d'Ajax pour charger les articles
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "articles.json", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // Conversion du JSON reçu en tableau d'objets
            TArticles = JSON.parse(xhr.responseText).articles;
            // Remplir la liste déroulante des pizzas
            remplirListePizzas();
            // Afficher tous les articles dans le tableau
            updateCommandeTable();
        }
    };
    xhr.send();
}

// Fonction pour remplir la liste déroulante des pizzas
function remplirListePizzas() {
    var select = document.getElementById("pizza");
    TArticles.forEach(function(article) {
        var option = document.createElement("option");
        option.value = article.id;
        option.textContent = article.nom + " (" + article.prix + " DH)";
        select.appendChild(option);
    });
}

// Fonction pour ajouter une pizza à la commande
function ajouter() {
    var pizzaSelect = document.getElementById("pizza");
    var selectedPizza = TArticles.find(pizza => pizza.id === pizzaSelect.value);
    var quantity = parseInt(document.getElementById("quantite").value);

    if (!selectedPizza || isNaN(quantity) || quantity < 1 || quantity > 10) {
        alert("Veuillez sélectionner une pizza et entrer une quantité valide (entre 1 et 10).");
        return;
    }

    // Ajouter ou mettre à jour l'article choisi dans TArticlesChoisis
    var existingArticle = TArticlesChoisis.find(article => article.id === selectedPizza.id);
    if (existingArticle) {
        existingArticle.quantite += quantity;
    } else {
        TArticlesChoisis.push({
            id: selectedPizza.id,
            nom: selectedPizza.nom,
            prix: selectedPizza.prix,
            quantite: quantity
        });
    }

    // Mettre à jour le tableau HTML
    updateCommandeTable();

    // Calculer et afficher le montant total
    calculateTotal();
}

// Fonction pour mettre à jour le tableau HTML des articles
function updateCommandeTable() {
    var tableBody = document.getElementById("commandeTable").getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; // Vider le tableau

    TArticles.forEach(function(article) {
        var row = tableBody.insertRow();
        row.insertCell(0).textContent = article.nom;
        row.insertCell(1).textContent = article.prix + " DH";
        var chosenArticle = TArticlesChoisis.find(a => a.id === article.id);
        row.insertCell(2).textContent = chosenArticle ? chosenArticle.quantite : "0";
    });
}

// Fonction pour calculer et afficher le montant total
function calculateTotal() {
    var total = TArticlesChoisis.reduce((sum, article) => sum + (article.prix * article.quantite), 0);
    document.getElementById("totalFacture").textContent = total.toFixed(2);
}

// Fonction pour annuler une commande
function annuler() {
    document.getElementById("pizzaForm").reset();
    TArticlesChoisis = [];
    updateCommandeTable();
    calculateTotal();
}

// Fonction pour valider le formulaire avant l'envoi
function validateForm() {
    var nom = document.getElementById("nom").value;
    var adresse = document.getElementById("adresse").value;
    var paiement = document.querySelector('input[name="paiement"]:checked');
    var numCarte = document.getElementById("numCarte").value;

    if (!nom || !adresse) {
        alert("Le nom et l'adresse sont obligatoires.");
        return false;
    }

    if (!paiement) {
        alert("Veuillez choisir un mode de paiement.");
        return false;
    }

    if (paiement.value === "CB" && !numCarte) {
        alert("Le numéro de carte bancaire est obligatoire pour le paiement par CB.");
        return false;
    }

    if (TArticlesChoisis.length === 0) {
        alert("Veuillez ajouter au moins un article à votre commande.");
        return false;
    }

    return true;
}

// Fonction pour activer/désactiver le champ numéro de carte
function toggleNumCarte() {
    var numCarteField = document.getElementById("numCarte");
    numCarteField.disabled = document.getElementById("cheque").checked;
}

// Fonction pour envoyer les données de commande
function envoyer() {
    if (!validateForm()) return;

    var commande = {
        client: {
            nom: document.getElementById("nom").value,
            adresse: document.getElementById("adresse").value,
            paiement: document.querySelector('input[name="paiement"]:checked').value,
            numCarte: document.getElementById("numCarte").value
        },
        articles: TArticlesChoisis,
        total: document.getElementById("totalFacture").textContent
    };

    // Préparer les détails de la commande pour l'affichage
    var orderDetails = `
        <p>Nom du client : ${commande.client.nom}</p>
        <p>Adresse : ${commande.client.adresse}</p>
        <p>Moyen de paiement : ${commande.client.paiement}</p>
        <p>Numéro de carte : ${commande.client.numCarte || 'N/A'}</p>
        <h3>Articles :</h3>
        <ul>`;
    
    commande.articles.forEach(article => {
        orderDetails += `<li>${article.nom} - ${article.prix} DH x ${article.quantite}</li>`;
    });
    orderDetails += `</ul>`;

    // Afficher les détails de la commande dans le modal
    document.getElementById("orderDetails").innerHTML = orderDetails;
    document.getElementById("totalModal").textContent = commande.total;

    // Afficher le modal
    document.getElementById("orderSummaryModal").style.display = "block";
}

// Fonction pour fermer la modal
function fermerModal() {
    document.getElementById("orderSummaryModal").style.display = "none";
    // Réinitialiser le formulaire et la table de commande
    annuler();
}

// Fonction pour imprimer la commande
function imprimer() {
    window.print();
}

// Appeler la fonction init au chargement de la page
window.onload = init;