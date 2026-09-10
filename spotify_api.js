var client_id = "293d21a0aea7465d8ce171c5691a37fa";
var client_secret = "c1010d60281a42c79ec2156ee64812f5";
var redirect_uri = "https://zsync231.github.io/slider-game/";
var access_token = localStorage.getItem("access_token");
var refresh_token = localStorage.getItem("refresh_token");
var currently_playing_data = null;
const authorise = "https://accounts.spotify.com/authorize";
const token = "https://accounts.spotify.com/api/token";
const currently_playing = "https://api.spotify.com/v1/me/player/currently-playing";
localStorage.setItem("client_id", client_id);
localStorage.setItem("client_secret", client_secret);
document.addEventListener("keydown", function (event) {
    if (event.key == "R" || event.key == "r") {
        requestAuthorisation();
    };
});

function requestAuthorisation() {
    let url = authorise;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&scope=user-read-currently-playing";
    url += "&show_dialog=false";
    window.location.href = url;
};

function getCode() {
    let code = null;
    const queryString = window.location.search;
    if (queryString.length > 0) {
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get("code");
    };
    return code;
};

function onPageLoad() {
    client_id = localStorage.getItem("client_id");
    client_secret = localStorage.getItem("client_secret");
    if (window.location.search.length > 0) {
        handleRedirect();
    };
};

function refreshAccessToken() {
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;
    callAuthorisationApi(body);
};

function handleAuthorisationResponse() {
    if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        console.log(data);
        if (data.access_token != undefined) {
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        };
        if (data.refresh_token != undefined) {
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        };
    } else if (this.status == 400 || this.status == 401) {
        refreshAccessToken();
    } else {
        console.log(this.responseText);
        alert(this.responseText);
    };
};

function callAuthorisationApi(body) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", token, true);
    xhr.setRequestHeader("Authorization", "Basic " + btoa(client_id + ":" + client_secret));
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(body);
    xhr.onload = handleAuthorisationResponse;
};

function fetchAccessToken(code) {
    let body = "grant_type=authorization_code";
    body += "&code=" + code;
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    callAuthorisationApi(body);
};

function handleRedirect() {
    let code = getCode();
    fetchAccessToken(code);
    window.history.pushState("", "", redirect_uri);
};

function callApi(method, url, body, callback) {
    let xhr = new XMLHttpRequest();
    if (url == currently_playing) {
        url += "?market=GB";
    };
    xhr.open(method, url, true);
    xhr.setRequestHeader("Authorization", "Bearer " + access_token);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(body);
    xhr.onload = callback;
};

function handleCurrentlyPlayingResponse() {
    console.log(this.status);
    if (this.status == 200) {
        currently_playing_data = JSON.parse(this.responseText);
        if (currently_playing_data.currently_playing_type != "ad") {
            progressBar.style.visibility = "visible";
            trackName.innerHTML = currently_playing_data.item.name;
            trackNameMarquee.innerHTML = currently_playing_data.item.name;        
            
            trackImage.src = currently_playing_data.item.album.images[0].url;
            
            var artistString = "";
            currently_playing_data.item.artists.forEach(artist => {
                artistString += artist.name + ", ";
            });
            artistNames.innerHTML = artistString.slice(0, -2);
            artistNamesMarquee.innerHTML = artistString.slice(0, -2);

            if (trackName.offsetWidth > 290) {
                trackName.style.visibility = "hidden";
                trackNameMarquee.style.visibility = "visible";
                trackNameMarqueeShadow.style.visibility = "visible";
            } else {
                trackName.style.visibility = "visible";
                trackNameMarquee.style.visibility = "hidden";
                trackNameMarqueeShadow.style.visibility = "hidden";
            };

            if (artistNames.offsetWidth > 290) {
                artistNames.style.visibility = "hidden";
                artistNamesMarquee.style.visibility = "visible";
                artistNamesMarqueeShadow.style.visibility = "visible";
            } else {
                artistNames.style.visibility = "visible";
                artistNamesMarquee.style.visibility = "hidden";
                artistNamesMarqueeShadow.style.visibility = "hidden";
            };

            var durationMSMinutes = Math.floor(currently_playing_data.item.duration_ms / 60000);
            var durationMSSeconds = String(Math.floor(currently_playing_data.item.duration_ms % 60000 / 1000)).padStart(2, "0");
            trackDuration.innerHTML = `${durationMSMinutes}:${durationMSSeconds}`;
            
            progressBar.style.width = currently_playing_data.progress_ms / currently_playing_data.item.duration_ms * 395 + "px";
        } else {
            trackName.innerHTML = "Advertisement";
            trackName.style.visibility = "visible";
            trackNameMarquee.style.visibility = "hidden";
            trackNameMarqueeShadow.style.visibility = "hidden";
            artistNamesMarquee.style.visibility = "hidden";
            artistNamesMarqueeShadow.style.visibility = "hidden";
            trackImage.src = "advertisementImage.png";
            artistNames.innerHTML = "";
            progressBar.style.visibility = "hidden";
            trackDuration.innerHTML = "-:--";
        };
        var progressMSMinutes = Math.floor(currently_playing_data.progress_ms / 60000);
        var progressMSSeconds = String(Math.floor(currently_playing_data.progress_ms % 60000 / 1000)).padStart(2, "0");
        trackProgress.innerHTML = `${progressMSMinutes}:${progressMSSeconds}`;
    } else if (this.status == 204) {
        trackName.innerHTML = "nothing playing :(";
    } else if (this.status == 401) {
        refreshAccessToken();
    } else {
        console.log(responseText);
        alert("handlecurrentlyplayingresponse" + responseText);
    };
};

function refreshCurrentSongTile() {
    callApi("GET", currently_playing, null, handleCurrentlyPlayingResponse);
};

refreshCurrentSongTile();
setInterval(refreshCurrentSongTile, 500);