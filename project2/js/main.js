const pkmKey = "acm1551-pkm";

let currentPokemon = 0;
let previousPokemon = "";
let lastTerm = "";
let pokemonList = "";

getData("https://pokeapi.co/api/v2/pokemon/?limit=808", loadList);

if (localStorage.getItem(pkmKey))  
    currentPokemon = localStorage.getItem(pkmKey);

window.onload = (e) => {
    //Add functionality to buttons
    if (currentPokemon == 0)
        getPokemon((Math.floor(Math.random() * Math.floor(806)) + 1))
    else
        getPokemon(currentPokemon);

    autocomplete(document.querySelector("#search-box"), pokemonList.results);
    document.querySelector("#random").onclick = () => {getPokemon((Math.floor(Math.random() * Math.floor(806)) + 1))};
    document.querySelector("#previous").onclick = () => { getPokemon(previousPokemon); };
    document.querySelector("#back").onclick = () => { getPokemon((currentPokemon - 1)); };
    document.querySelector("#next").onclick = () => { getPokemon((currentPokemon + 1)); };
    document.querySelector("#search").onclick = () => { 
        input = document.querySelector("input").value.toLowerCase();
        if (!input){
            document.querySelector("#information").innerHTML = "<p>Please enter a search term!</p>"
            document.querySelector("#pkmimg").src = "";
        }
        else
            getPokemon(input); 
    };
};

//Load in a kanye quote
function dataLoaded(e) {
    let obj = JSON.parse(e.target.responseText);
    document.querySelector("#quote").innerHTML = `<p>${obj.quote}</p>`
}

//Create a description list element using the strings passed in and
//the list passed in
function createDescription(title, description, list) {
    let name = document.createElement("dt");
    name.innerHTML = "<dt>" + title + "</dt>";
    list.appendChild(name);
    let nameDes = document.createElement("dd");
    nameDes.innerHTML = "<dd>" + description + "</dd>";
    list.appendChild(nameDes)
}

function pokemonLoaded(e) {
    //Change the image
    if (e.target.responseText != "Not Found") {
        previousPokemon = lastTerm;
        let obj = JSON.parse(e.target.responseText);

        let pkmDisplay = document.querySelector("#information");
        document.querySelector("#pkmimg").src = obj.sprites.front_default;

        //Get the pokemon info list
        let pkminfo = document.createElement("dl");

        //Name
        createDescription("Name", obj.name, pkminfo);

        //Height and Weight
        createDescription("Weight", obj.weight, pkminfo);
        createDescription("Height", obj.height, pkminfo);

        //Types
        let types = "";
        for (let i = 0; i < obj.types.length; i++) {
            if (i > 0)
                types += ", " + obj.types[i].type.name;
            else
                types += obj.types[i].type.name;
        }
        createDescription("Types", types, pkminfo);

        //Abilities
        let abilities = ""
        for (let i = 0; i < obj.abilities.length; i++) {
            if (i > 0)
                abilities += ", " + obj.abilities[i].ability.name;
            else
                abilities += obj.abilities[i].ability.name;
        }
        createDescription("Abilities", abilities, pkminfo);

        //Stats
        let stats = "<ul>";
        for (let i = obj.stats.length - 1; i >= 0; i--) {
            stats += `<li>${obj.stats[i].stat.name} : ${obj.stats[i].base_stat}</li>`;
        }
        stats += "</ul>";
        createDescription("Stats", stats, pkminfo);

        //Also load a kanye quote
        getData("https://api.kanye.rest", dataLoaded);

        //set the current pokemon 
        currentPokemon = parseInt(obj.id);
        lastTerm = obj.name;
        if (previousPokemon != "")
            document.querySelector("#previous").innerHTML = "Go back to: " + previousPokemon;
        if (currentPokemon - 1 >= 1)
            document.querySelector("#back").innerHTML = "Pokemon " + (currentPokemon - 1);
        if (currentPokemon + 1 <= 807)
            document.querySelector("#next").innerHTML = "Pokemon " + (currentPokemon + 1);

        //Store the search terms
        localStorage.setItem(pkmKey, currentPokemon);
        pkmDisplay.innerHTML = "";
        pkmDisplay.appendChild(pkminfo);
    }
    else{
        document.querySelector("#information").innerHTML = "<p>Pokemon not found!</p>"
        document.querySelector("#pkmimg").src = "";
    }
}

//Handle any errors
function dataError(e) {
    console.log("An error occurred");
}

//Pull data from the API
function getData(url, dataLoaded) {
    let xhr = new XMLHttpRequest();
    xhr.onload = dataLoaded;
    xhr.onerror = dataError;
    xhr.open("GET", url)
    xhr.send();
}

//Get a random pokemon
function getPokemon(pokemon) {
    document.querySelector("#information").innerHTML = "<p>Searching for pokemon</p>";
    getData("https://pokeapi.co/api/v2/pokemon/" + pokemon, pokemonLoaded);
}

function loadList (e){
    pokemonList = JSON.parse(e.target.responseText);
}

//Create a list of possible pokemon to pull from when the user
//makes changes in the input box
function autocomplete (input, args){
    let currentFocus;

    //Tack on the autocomplete after the user enters new input
    input.addEventListener("input", function(e){
        let a, b, val = this.value;
        closeAllLists();
        if (!val){return false;}
        currentFocus = -1;

        //Create a div to hold the autocomplete options
        a = document.createElement("div");
        a.setAttribute("id", "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);

        //Loop through every pokemon to check if it fits
        for (let i = 0; i < args.length; i++){
            if (args[i].name.substr(0, val.length).toLowerCase() == val.toLowerCase()){
                b = document.createElement("div");
                b.innerHTML = "<p>" + args[i].name + "</p><input type='hidden' value='" + args[i].name + "'>";
                b.addEventListener("click", function(e){
                    input.value = this.getElementsByTagName("input")[0].value;
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });

    //Set the currently selected option when the user uses the arrow keys
    input.addEventListener("keydown", function(e){
        let x = document.getElementById("autocomplete-list");
        if (x) {x = x.getElementsByTagName("div");}

        //executes when the down arrow key is pressed
        if (e.keyCode == 40){
            currentFocus++;
            addActive(x);
        }

        //executes when the up arrow key is pressed
        else if (e.keyCode == 38){
            currentFocus--;
            addActive(x);
        }

        //executes when enter is pressed
        else if (e.keyCode == 13){
            e.preventDefault();
            if (currentFocus > -1){
                if (x){x[currentFocus].click();}
            }
        }
    });

    //Set the active element
    function addActive(x){
        if (!x){return false;}
        removeActive(x);
        if (currentFocus >= x.length) {currentFocus = 0;}
        if (currentFocus < 0) {currentFocus = (x.length - 1);}
        x[currentFocus].classList.add("autocomplete-active");
    }

    //Remove all other active elements
    function removeActive(x){
        for (let i = 0; i < x.length; i++){
            x[i].classList.remove("autocomplete-active");
        }
    }

    //Close out any open autocomplete lists
    function closeAllLists(element){
        let x = document.getElementsByClassName("autocomplete-items");
        for (let i = 0; i < x.length; i++){
            if (element != x[i] && element != input){x[i].parentNode.removeChild(x[i])};
        }
    }

    //Close out the list when the user clicks outside the list
    document.addEventListener("click", function(e) {closeAllLists(e.target);});
}