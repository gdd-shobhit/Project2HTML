const pkmKey = "acm1551-pkm";
const prevPkmKey = "acm1551-prevPkm";

let currentPokemon = 0;
let previousPokemon = "";
let lastTerm = "";
if (localStorage.getItem(pkmKey))  
    currentPokemon = localStorage.getItem(pkmKey);
if (localStorage.getItem(prevPkmKey))  
    previousPokemon = localStorage.getItem(prevPkmKey);

window.onload = (e) => {
    console.log(localStorage.getItem(prevPkmKey));
    console.log(previousPokemon);
    //Add functionality to buttons
    if (currentPokemon == 0)
        getPokemon((Math.floor(Math.random() * Math.floor(806)) + 1))
    else
        getPokemon(currentPokemon);

    document.querySelector("#random").onclick = () => {getPokemon((Math.floor(Math.random() * Math.floor(806)) + 1))};
    document.querySelector("#previous").onclick = () => { getPokemon(previousPokemon); };
    document.querySelector("#back").onclick = () => { getPokemon((currentPokemon - 1)); };
    document.querySelector("#next").onclick = () => { getPokemon((currentPokemon + 1)); };
    document.querySelector("#search").onclick = () => { getPokemon(document.querySelector("input").value.toLowerCase()); };
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
        document.querySelector("#pkmimg").src = obj.sprites.front_default;

        //Get the pokemon info list
        let pkminfo = document.querySelector("#infolist");
        pkminfo.innerHTML = "";

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
        for (let i = 0; i < obj.stats.length; i++) {
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
        localStorage.setItem(prevPkmKey, previousPokemon);
    }
    else{
        document.querySelector("#infolist").innerHTML = "<p>No pokemon found!</p>"
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
    getData("https://pokeapi.co/api/v2/pokemon/" + pokemon, pokemonLoaded);
}