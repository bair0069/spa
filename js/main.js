//  - - - - - - - - - -**********HTML**************- - - - - - - - 
// Clicking on the search button needs to navigate the user to the actors page. This can be done from any screen.
// Clicking on anywhere in an actors card or list item should navigate the user to the media page and show the proper information.
// There needs to be an obvious way for the user to navigate back to the actors page.


//  *********************- - - - - - - -CSS - - - - - -******************** 
// The web app must work with a single HTML file.
// The web page must be a mobile-first responsive site. Layout and font-sizes should adjust based on screen size.
// The search field must always be visible.
// There needs to be three screens - home, search results for actors, and the movies & tv shows the actor is best known for.
// The home page should provide an introduction to the web app and what it does. Just static content. This would be a good place to display TheMovieDB logo, which is required by the terms of service. Images and colours


// ************************- - - - - - - JS - - - - - - - *************************
// Namespaces must be used to hold ALL of your JavaScript properties and functions.
// The results of each search fetch need to be saved in the same property in a namespace so that it can be accessed again later on.
// (opens new window).
// The actors page should display a series of cards or list items with information about each actor. You must put at least, the name, popularity, and image of each actor into the HTML. Their id should be kept in a data- property to be accessed later. Old search results must be removed before the new results are shown.
// The media page should show a series of cards or list items with information about each of the shows or movies that the selected actor is best known for, according to the API. Their id should be kept in a data- property. Old results must be removed before the new results are shown.
const APP = {
  //app is for general control over the application
  //and connections between the other components
    APIKey       :"fd746aee539e0204da54b3425652e549",
    baseURL      : "https://api.themoviedb.org/3/",
    configData   : null,
    baseImageURL : null,
    form         : document.getElementById("form"),
    searchInput  :document.getElementById("search"),
    dataArr      : [],
    instructions : document.getElementById("instructions"),
    actors       : document.getElementById("actors"),
    actorsContent: document.getElementById("actors-content"),
    media        : document.getElementById("media"),
    mediaContent : document.getElementById("media-content"),
    footer       : document.getElementById("footer"),
    init        : () => {
        
        //this function runs when the page loads
        console.log(APP.APIKey)
        document.addEventListener('DOMContentLoaded', SEARCH.getConfig)
        APP.searchInput.value=null
        form.addEventListener("submit",(ev) =>{
            
            ev.preventDefault()
            SEARCH.getConfig()})
        }
};
    //search is for anything to do with the fetch api
const SEARCH = {
    url             : `${APP.baseURL}configuration?api_key=${APP.APIKey}`,

    getConfig       :function() {
        console.log(SEARCH.url)
        fetch(SEARCH.url)
        .then((response)=>
        { return response.json()})
        .then((data)=>{
            APP.baseImageURL = data.images.secure_base_url;
            APP.configData = data.images;
            console.log('config:', data)
            console.log ('config fetched')
            SEARCH.runSearch(APP.searchInput.value)
        })
        .catch((err)=>{
            if(APP.searchInput.value){console.warn(err)}
            else{}})
        APP.footer.classList.remove("active")
    },

    runSearch       : function (keyword) {
        let url= `https://api.themoviedb.org/3/search/person?api_key=${APP.APIKey}&language=en-US&query=${keyword}&page=1&include_adult=false`;
        fetch(url)
        .then((response=>response.json()))
        .then((data)=>{
            console.log(data)
            APP.dataArr = data.results
            ACTORS.getActors()
        })
        .catch((err)=>console.warn(err))
    }
}

//actors is for changes connected to content in the actors section
const ACTORS = {
    actorsContent: document.getElementById("actors-content"),
    getActors    : function () {if(APP.searchInput.value)
                            {
                            APP.actors.classList.add("active")
                            APP.footer.classList.add("active")
                            APP.instructions.classList.remove("active")
                            console.log(APP.dataArr)
                            ACTORS.actorsContent.innerHTML=""     //clear actors
                            APP.mediaContent.innerHTML= "" //clear media
                                APP.dataArr.forEach((item)=>{
                                    localStorage.setItem(`${item.name}`, JSON.stringify(item))
                                    let div = document.createElement("div")
                                    div.className="card"
                                    div.setAttribute("data-id", item.id)
                                    let rating=item.popularity
                                    div.innerHTML = `<h5 actor="${item.name}">${item.name}</h5> <p actor="${item.name}">${item.                 name}'s popularity is ${rating}</p>`
                                    let img= document.createElement("img")
                                    if(item.profile_path){
                                        img.src=`${APP.baseImageURL}w185${item.profile_path}`}
                                    else{img.src="./svg/Asset1.svg"
                                    }
                                img.alt = `"a picture of ${item.name}"`
                                img.setAttribute("actor",item.name)
                                div.setAttribute("actor",item.name)
                                div.addEventListener('click',MEDIA.pullMedia)
                                div.prepend(img)
                                ACTORS.actorsContent.append(div)
                                })
                            }
                            },
    showActors   : function () {APP.media.classList.remove("active")
                                APP.actors.classList.add("active")
                                APP.mediaContent.innerHTML=""
                                }      

}                   
    //media is for changes connected to content in the media section
    const MEDIA = {
        pullMedia :function (ev) {
            APP.media.classList.add("active") // replace actors with media
            APP.actors.classList.remove("active") // remove actors active.
            let actorName = ev.target.getAttribute("actor")
            console.log(actorName)
            let actor = JSON.parse(localStorage.getItem(actorName))
            let knownFor = actor.known_for  // top 3 things actor is known for.
            console.log(knownFor)
            let movieDiv = document.createElement("div") // declared outside to prevent repeated MOVIE H2. will not show up unless actor is known for movies.
                movieDiv.innerHTML = `<h3> Movies </h3>`
            let tvDiv = document.createElement("div") //same situation as movieDiv.
                tvDiv.innerHTML = `<h3> TV </h3>`
            knownFor.forEach((item) => {
                console.log(item.media_type)   
                //sort between movies and tv shows 
                if (item.media_type.toLowerCase()==="movie"){
                    let div = document.createElement("div")
                    div.classList.add("card")
                    movieDiv.classList.add("movie")
                    div.innerHTML = `<img src=${APP.baseImageURL}w185${item.poster_path} alt="A movie poster for ${item.title}"> <h5>${item.title}</h5> <p>${item.title} was released ${item.release_date}</p>`
                    movieDiv.append(div)
                    APP.mediaContent.append(movieDiv)
                }
                if (item.media_type.toLowerCase()==="tv"){
                    let div = document.createElement("div")
                    div.classList.add("card")
                    tvDiv.classList.add("tv")
                    div.innerHTML = `<img src=${APP.baseImageURL}w185${item.poster_path} alt= "cover art for ${item.name}"> <h5>${item.name}</h5> <p>${item.name} first air date was ${item.first_air_date}</p>`
                    tvDiv.append(div)
                    APP.mediaContent.append(tvDiv) 
                }
            })
            document.getElementById("actors-return").addEventListener("click",ACTORS.showActors)
        }
    };

//storage is for working with localstorage
const STORAGE = {
  //this will be used in Assign 4
};

//nav is for anything connected to the history api and location
const NAV = {
  //this will be used in Assign 4
};

//Start everything running

APP.init();
