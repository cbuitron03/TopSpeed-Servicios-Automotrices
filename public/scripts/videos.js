// Cargar la API de YouTube
let tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Variables para los reproductores
let player1, player2, player3;

// Función llamada por la API de YouTube
function onYouTubeIframeAPIReady() {
    // Primer reproductor
    player1 = new YT.Player('youtube-player-1', {
        height: '640',
        width: '390',
        videoId: 'wd1IOzUcu3w', // ID del primer video
        playerVars: {
            autoplay: 0,
            controls: 0,
            rel: 0,
            modestbranding: 1
        }
    });

    // Segundo reproductor
    player2 = new YT.Player('youtube-player-2', {
        height: '640',
        width: '390',
        videoId: 'nm-9ClyHFUY', // ID del segundo video
        playerVars: {
            autoplay: 0,
            controls: 0,
            rel: 0,
            modestbranding: 0
        }
    });

    // Tercer reproductor
    player3 = new YT.Player('youtube-player-3', {
        height: '640',
        width: '390',
        videoId: 'VIaTHiD5hmc', // ID del tercer video
        playerVars: {
            autoplay: 0,
            controls: 0,
            rel: 0,
            modestbranding: 0
        }
    });
}

// Agregar eventos a los botones
document.addEventListener("DOMContentLoaded", () => {
    // Controles para el primer reproductor
    document.getElementById("play-button-1").addEventListener("click", () => player1.playVideo());
    document.getElementById("pause-button-1").addEventListener("click", () => player1.pauseVideo());
    document.getElementById("mute-button-1").addEventListener("click", () => {
        if (player1.isMuted()) {
            player1.unMute();
            document.getElementById("mute-button-1").textContent = "Silenciar";
        } else {
            player1.mute();
            document.getElementById("mute-button-1").textContent = "Desmutear";
        }
    });

    // Controles para el segundo reproductor
    document.getElementById("play-button-2").addEventListener("click", () => player2.playVideo());
    document.getElementById("pause-button-2").addEventListener("click", () => player2.pauseVideo());
    document.getElementById("mute-button-2").addEventListener("click", () => {
        if (player2.isMuted()) {
            player2.unMute();
            document.getElementById("mute-button-2").textContent = "Silenciar";
        } else {
            player2.mute();
            document.getElementById("mute-button-2").textContent = "Desmutear";
        }
    });

    // Controles para el tercer reproductor
    document.getElementById("play-button-3").addEventListener("click", () => player3.playVideo());
    document.getElementById("pause-button-3").addEventListener("click", () => player3.pauseVideo());
    document.getElementById("mute-button-3").addEventListener("click", () => {
        if (player3.isMuted()) {
            player3.unMute();
            document.getElementById("mute-button-3").textContent = "Silenciar";
        } else {
            player3.mute();
            document.getElementById("mute-button-3").textContent = "Desmutear";
        }
    });
});