'use strict'
const APIKey=`fd746aee539e0204da54b3425652e549`;

let baseURL = "https://api.themoviedb.org/3/";
let configData= null;
let baseImageURL= null;
let init = function (){
    document.addEventListener('DOMContentLoaded', getConfig)
    let form = document.getElementById("form")
    let searchInput =document.getElementById("search")
    searchInput.value=null
    form.addEventListener("submit",(ev) =>{
        ev.preventDefault()
        let searchQuery = searchInput.value
        getConfig(searchQuery)}) 
}




const getConfig = function() {
    let url= "".concat(baseURL,'configuration?api_key=',APIKey);
    fetch(url)
    .then((response)=>{ return response.json()})
    .then((data)=>{
        baseImageURL = data.images.secure_base_url;
        configData = data.images;
        console.log('config:', data)
        console.log ('config fetched')
        runSearch(searchQuery)
    })
    .catch((err)=>{console.warn(err.msg)})
}

const runSearch = function (keyword) {
    let url= `https://api.themoviedb.org/3/search/person?api_key=${APIKey}&language=en-US&query=${keyword}&page=1&include_adult=false`;
    fetch(url)
    .then((response=>response.json()))
    .then((data)=>{
        console.log(data)
        let arr = data.results
        arr.forEach((item)=>{
            let div = document.createElement("div")
            div.className="card"
            let rating=null
            if(item.popularity >= "5") {
                rating = "SUPER POPULAR"
            }
            else {rating="lame"}
            
            div.innerHTML = `<h5>${item.name}</h5> <p>"${rating}"</p>`
            let img= document.createElement("img")
            if(item.profile_path){
                img.src=`${baseImageURL}w185${item.profile_path}`}
                else{img.src="./svg/Asset1.svg"}
                img.alt = `a picture of ${item.name}`
                let pullMedia =function (ev) {
                    console.log(ev.target)}
                    div.addEventListener('click',pullMedia)
                    div.prepend(img)
                    let actorsContent = document.getElementById("actors-content")
                    actorsContent.append(div)
                })
            })
            .catch((err)=>console.warn(err))
        }
        
        
        


init()