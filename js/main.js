
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
    sort         : document.getElementById("sort"),
    order        : document.getElementById("order"),
    customSort   :  function (array,prop,order,){
                        array.sort((a,b)=> {
                            if(order==="ascending"){
                                console.log("ascending")
                                if( a[prop] > b[prop]){ 
                                    return 1
                                }
                                if( a[prop] < b[prop]){
                                    return -1
                                }
                                else{
                                    return 0 
                                } 
                            }
                            else if(order==="descending"){
                                console.log("descending")
                                if( a[prop] > b[prop]){ 
                                    return -1
                                }
                                if( a[prop] < b[prop]){
                                    return 1
                                }
                                else{
                                    return 0 
                                } 
                            }
                        } )
                    },

    init        : () => {
        
        //this function runs when the page loads
        
        document.addEventListener('DOMContentLoaded', SEARCH.getConfig)
        /*    Use History API to update the URL to reflect search term and current screen. Include the details about where you are in the app as part of the location.hash.*/
        window.history.replaceState("#","title"," /# ")
        window.addEventListener("popstate",NAV.popchange)
        APP.sort.addEventListener('change',ACTORS.getActors)
        APP.order.addEventListener('change',ACTORS.getActors)
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
        
                        fetch(SEARCH.url)
                        .then((response)=>
                        { return response.json()})
                        .then((data)=>{
                            APP.baseImageURL = data.images.secure_base_url;
                            APP.configData = data.images;
                            if(JSON.parse(localStorage.getItem(`${APP.searchInput.value}`))){
                                APP.dataArr=JSON.parse(localStorage.getItem(`${APP.searchInput.value}`))
                            ACTORS.getActors()
                            }

                            else{
                            SEARCH.runSearch(APP.searchInput.value)}
                        })
                        .catch((err)=>{
                            if(APP.searchInput.value){console.warn(err)}
                            else{}})
                    },

    runSearch       : function (keyword) {
                        let url= `https://api.themoviedb.org/3/search/person?api_key=${APP.APIKey}&language=en-US&query=${keyword}&page=1&include_adult=false`;
                        NAV.displayLoader()
                        fetch(url)
                        .then((response=>response.json()))
                        .then((data)=>{
                            NAV.hideLoader()
                            APP.dataArr = data.results
                            ACTORS.getActors()
                        })
                        .catch((err)=>alert(`Fetch failed due to: ${err}`))
                    }
}

//actors is for changes connected to content in the actors section
const ACTORS = {
    actorsContent: document.getElementById("actors-content"),
    getActors    : function () {
                    if(APP.searchInput.value)
                    {
                        location.hash=APP.searchInput.value
                        APP.actors.classList.add("active")
                        APP.instructions.classList.remove("active")
                        APP.media.classList.remove("active")
                        ACTORS.actorsContent.innerHTML=""     //clear actors
                        APP.mediaContent.innerHTML= "" //clear media
                        history.replaceState(`actor`,'', `#${APP.searchInput.value}`)
                        console.log(history.state)
                        localStorage.setItem(`${APP.searchInput.value}`, JSON.stringify(APP.dataArr))
                        
                        
                        // sort via type and stated order.
                        APP.customSort(APP.dataArr,APP.sort.value,APP.order.value)
                        // loop through stored array to create actors cards.
                            APP.dataArr.forEach((item)=>{
                                let div = document.createElement("div")
                                div.className="card"
                                div.setAttribute("data-id", item.id)
                                let rating=item.popularity
                                div.innerHTML = `<h5 data-id="${item.id}">${item.name}</h5> <p data-id="${item.id}">${item.name}'s popularity is ${rating}</p>`
                                let img= document.createElement("img")
                                if(item.profile_path){
                                    img.src=`${APP.baseImageURL}w185${item.profile_path}`}
                                else{img.src="./svg/Asset1.svg"
                                }
                            img.alt = `"a picture of ${item.name}"`
                            img.setAttribute("data-id",item.id)
                            div.addEventListener('click',MEDIA.pullMedia)
                            div.prepend(img)
                            ACTORS.actorsContent.append(div)
                            })
                        }
                        },
}                  
    //media is for changes connected to content in the media section
    const MEDIA = { 
        // render media page
        pullMedia :function (ev) {
            APP.mediaContent.innerHTML="" // clear out old results
            APP.media.classList.add("active") // replace actors with media
            APP.actors.classList.remove("active") // remove actors active.
            // replace current state with this one
            let actorName = ev.target.getAttribute("data-id")
            location.hash+="/" +actorName
            history.replaceState("id","title",`${location.hash}`)
            console.log(actorName)
            console.log("Location.hash:" + location.hash.split("/")[0])   
            let actors = JSON.parse(localStorage.getItem(APP.searchInput.value))
            //Pull list of known media if data-id matches actors array Id
            actors.forEach((actor) => {
                if (JSON.stringify(actor.id) === actorName){
                    let knownFor = actor.known_for  // top 3 things actor is known for.
                    let movieDiv = document.createElement("div") // declared outside to prevent repeated MOVIE H2. will not show up unless actor is known for movies.
                    movieDiv.innerHTML = `<h3> Movies </h3>`
                    let tvDiv = document.createElement("div") //same situation as movieDiv.
                    tvDiv.innerHTML = `<h3> TV </h3>`
                    knownFor.forEach((item) => { 
                        //sort between movies and tv shows 
                        if (item.media_type.toLowerCase()==="movie"){
                
                            let div = document.createElement("div")
                            div.classList.add("card")
                            movieDiv.classList.add("movie")
                            div.setAttribute("data-id",item.id)
                            div.innerHTML = `<img src=${APP.baseImageURL}w185${item.poster_path} alt="A movie poster for ${item.title}"> <h5>${item.title}</h5> <p>${item.title} was released ${item.release_date}</p>`
                            movieDiv.append(div)
                            APP.mediaContent.append(movieDiv)
                        }
                        if (item.media_type.toLowerCase()==="tv"){
                            let div = document.createElement("div")
                            div.classList.add("card")
                            div.setAttribute("data-id",item.id)
                            tvDiv.classList.add("tv")
                            div.innerHTML = `<img src=${APP.baseImageURL}w185${item.poster_path} alt= "cover art for ${item.name}"> <h5>${item.name}</h5> <p>${item.name} first air date was ${item.first_air_date}</p>`
                            tvDiv.append(div)
                            APP.mediaContent.append(tvDiv) 
                        }
                    }) 
                }
            })
            //click listener on return to actors button
            document.getElementById("actors-return").addEventListener("click",ACTORS.getActors)
            
        }
    };

//storage is for working with localstorage
const STORAGE = {
  //this will be used in Assign 4
};

//nav is for anything connected to the history api and location
const NAV = {
  //this will be used in Assign 4

    popchange : function () { console.log("popchange")
                console.log(location.href)
                
                if (history.state==="#") {
                    APP.instructions.classList.add("active")
                    APP.media.classList.remove("active")
                    APP.actors.classList.remove("active")
                }
                else if (history.state ==="actor") {
                    APP.instructions.classList.remove("active")
                    APP.media.classList.remove("active")
                    APP.actors.classList.add("active")
                    APP.searchInput.value = location.hash.split("#")[1]
                    SEARCH.getConfig()
                }
                else if (history.state ==="id") {
                    APP.instructions.classList.remove("active")
                    APP.media.classList.add("active")
                    APP.actors.classList.remove("active")
                    actorName = location.hash.split("#")[1].split("/")[1]
                    APP.searchInput.value = location.hash.split("#")[1].split("/")[0]
                    let actors = JSON.parse(localStorage.getItem(APP.searchInput.value))
            //Pull list of known media if data-id matches actors array Id
            actors.forEach((actor) => {
                if (JSON.stringify(actor.id) === actorName){
                    let knownFor = actor.known_for  // top 3 things actor is known for.
                    let movieDiv = document.createElement("div") // declared outside to prevent repeated MOVIE H2. will not show up unless actor is known for movies.
                    movieDiv.innerHTML = `<h3> Movies </h3>`
                    let tvDiv = document.createElement("div") //same situation as movieDiv.
                    tvDiv.innerHTML = `<h3> TV </h3>`
                    knownFor.forEach((item) => { 
                        //sort between movies and tv shows 
                        if (item.media_type.toLowerCase()==="movie"){
                
                            let div = document.createElement("div")
                            div.classList.add("card")
                            movieDiv.classList.add("movie")
                            div.setAttribute("data-id",item.id)
                            div.innerHTML = `<img src=${APP.baseImageURL}w185${item.poster_path} alt="A movie poster for ${item.title}"> <h5>${item.title}</h5> <p>${item.title} was released ${item.release_date}</p>`
                            movieDiv.append(div)
                            APP.mediaContent.append(movieDiv)
                        }
                        if (item.media_type.toLowerCase()==="tv"){
                            let div = document.createElement("div")
                            div.classList.add("card")
                            div.setAttribute("data-id",item.id)
                            tvDiv.classList.add("tv")
                            div.innerHTML = `<img src=${APP.baseImageURL}w185${item.poster_path} alt= "cover art for ${item.name}"> <h5>${item.name}</h5> <p>${item.name} first air date was ${item.first_air_date}</p>`
                            tvDiv.append(div)
                            APP.mediaContent.append(tvDiv) 
                        }
                    }) 
                }
            })
            //click listener on return to actors button
            document.getElementById("actors-return").addEventListener("click",ACTORS.getActors)
            }
                
    },
    displayLoader () {
        document.getElementById("loader").classList.add("active")
        setTimeout(()=>{
            document.getElementById("loader").classList.remove("active");
        },5000)
    },

    hideLoader () {
        document.getElementById("loader").classList.remove("active")
    },

    handleUrlChange () {
        console.log(location.hash.split("#")[1])
        if (location.hash.split("#")[1]!== APP.searchInput.value){
            APP.searchInput.value = location.hash.split("#")[1]}
    }
}

//Start everything running

APP.init();


