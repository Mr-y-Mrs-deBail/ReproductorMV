// Evento de click en "more-options" ______________________________________________________

document.getElementById("more-options").addEventListener("click", function() {
    var dropdownContent = document.querySelector(".dropdown-content");
    var icon = document.getElementById("more-options");

    if (dropdownContent.classList.contains("show")) {
        dropdownContent.classList.remove("show");
        dropdownContent.classList.add("hide");
        icon.classList.remove("transform");
        icon.innerText = "more_horiz";
    } else {
        dropdownContent.classList.remove("hide");
        dropdownContent.classList.add("show");
        icon.classList.add("transform");
        icon.innerText = "close";
    }
});

window.onclick = function(event) {
    if (!event.target.matches('.material-icons')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
                openDropdown.classList.add("hide");
                document.getElementById("more-options").classList.remove("transform");
                document.getElementById("more-options").innerText = "more_horiz";
            }
        }
    }
}

document.getElementById("search-option").addEventListener("click", function() {
    document.querySelector(".wrapper").classList.add("show-search");
});

document.getElementById("close-search").addEventListener("click", function() {
    document.querySelector(".wrapper").classList.remove("show-search");
    document.getElementById("search-input-principal").value = ''; // Limpiar el campo de búsqueda
    document.getElementById("suggestions-container-principal").style.display = 'none'; // Ocultar sugerencias
});


// Debounce Function ______________________________________________________

function debounce(func, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}

// Throttle Function
function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function(...args) {
        if (!lastRan) {
            func.apply(this, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if (Date.now() - lastRan >= limit) {
                    func.apply(this, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

// Apply debounce and throttle to events
window.addEventListener('resize', debounce(function() {
    console.log('Resized');
}, 200));

document.addEventListener('scroll', throttle(function() {
    console.log('Scrolled');
}, 100));


// Función para remover acentos ______________________________________________________

function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Buscar canciones ______________________________________________________

document.getElementById("search-input-principal").addEventListener("input", debounce(function() {
    const searchQuery = removeAccents(this.value.toLowerCase());
    const suggestionsContainer = document.getElementById("suggestions-container-principal");

    if (searchQuery.length === 0) {
        suggestionsContainer.style.display = 'none';
        return;
    }

    suggestionsContainer.innerHTML = '';
    const filteredSongs = allMusic.filter(song =>
        removeAccents(song.name.toLowerCase()).includes(searchQuery) ||
        removeAccents(song.artist.toLowerCase()).includes(searchQuery)
    );

    if (filteredSongs.length > 0) {
        filteredSongs.forEach(song => {
            const suggestionItem = document.createElement('div');
            suggestionItem.classList.add('suggestion-item');

            // Resaltar la canción actual si está en la lista filtrada
            if (isCurrentSong(song.name, song.artist)) {
                suggestionItem.innerHTML = `<strong>${song.name} - ${song.artist}</strong>`;
            } else {
                suggestionItem.innerHTML = `${song.name} - ${song.artist}`;
            }

            suggestionItem.addEventListener("click", () => selectSongByName(song.name, song.artist));
            suggestionsContainer.appendChild(suggestionItem);
        });
        suggestionsContainer.style.display = 'block';
    } else {
        suggestionsContainer.style.display = 'none';
    }
}, 300)); // Delay de 300ms

function selectSongByName(songName, songArtist) {
    const songIndex = allMusic.findIndex(song => removeAccents(song.name.toLowerCase()) === removeAccents(songName.toLowerCase()) && removeAccents(song.artist.toLowerCase()) === removeAccents(songArtist.toLowerCase()));
    if (songIndex !== -1) {
        musicIndex = songIndex;
        loadMusic(musicIndex);
        playMusic();
        updatePlayingSong();
        document.querySelector(".wrapper").classList.remove("show-search");
        document.getElementById("suggestions-container-principal").style.display = 'none';
        document.getElementById("search-input-principal").value = ''; // Limpiar el campo de búsqueda
    }
}

function isCurrentSong(songName, songArtist) {
    return removeAccents(musicName.innerHTML.toLowerCase()).includes(removeAccents(songName.toLowerCase())) && removeAccents(musicArtist.innerText.toLowerCase()).includes(removeAccents(songArtist.toLowerCase()));
}

// Actualizar la canción en reproducción ______________________________________________________

function updatePlayingSong() {
    const allLiTags = ulTag.querySelectorAll("li");

    allLiTags.forEach((li) => {
        li.classList.remove("playing");
        const nameTag = li.querySelector("span");
        const artistTag = li.querySelector("p");
        if (nameTag) {
            nameTag.style.fontWeight = "normal";
        }
        if (artistTag) {
            artistTag.style.fontWeight = "normal";
        }
    });

    const currentLi = ulTag.querySelector(`li[li-index="${musicIndex + 1}"]`);
    if (currentLi) {
        currentLi.classList.add("playing");
        const currentNameTag = currentLi.querySelector("span");
        const currentArtistTag = currentLi.querySelector("p");
        if (currentNameTag) {
            currentNameTag.style.fontWeight = "bold";
        }
        if (currentArtistTag) {
            currentArtistTag.style.fontWeight = "bold";
        }
    }

    // Actualizar sugerencias en el buscador
    const suggestionsContainer = document.getElementById("suggestions-container");
    if (suggestionsContainer) {
        const suggestionItems = suggestionsContainer.querySelectorAll(".suggestion-item");
        suggestionItems.forEach((item) => {
            item.classList.remove("playing");
            item.innerHTML = item.innerText; // Restablecer el estilo por defecto
        });

        const currentSuggestionItem = suggestionsContainer.querySelector(`.suggestion-item[li-index="${musicIndex + 1}"]`);
        if (currentSuggestionItem) {
            currentSuggestionItem.classList.add("playing");
            const songName = musicName.innerHTML;
            const songArtist = musicArtist.innerText;
            currentSuggestionItem.innerHTML = `<strong>${songName} - ${songArtist}</strong>`;
        }
    }
}


// Controles de la pestaña ______________________________________________________

if ('mediaSession' in navigator) {
    function updateMetadata() {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: musicName.innerHTML,
            artist: musicArtist.innerText,
            album: '',
            artwork: [
                { src: `img/${allMusic[musicIndex].img}.jpg`, sizes: '96x96', type: 'image/jpeg' },
                { src: `img/${allMusic[musicIndex].img}.jpg`, sizes: '128x128', type: 'image/jpeg' },
                { src: `img/${allMusic[musicIndex].img}.jpg`, sizes: '192x192', type: 'image/jpeg' },
                { src: `img/${allMusic[musicIndex].img}.jpg`, sizes: '256x256', type: 'image/jpeg' },
                { src: `img/${allMusic[musicIndex].img}.jpg`, sizes: '384x384', type: 'image/jpeg' },
                { src: `img/${allMusic[musicIndex].img}.jpg`, sizes: '512x512', type: 'image/jpeg' }
            ]
        });
    }

    navigator.mediaSession.setActionHandler('play', playMusic);
    navigator.mediaSession.setActionHandler('pause', pauseMusic);
    navigator.mediaSession.setActionHandler('previoustrack', prevMusic);
    navigator.mediaSession.setActionHandler('nexttrack', nextMusic);
}

// Quitar la función que pausa la música en segundo plano
document.removeEventListener('visibilitychange', function() {
    if (document.hidden) {
        mainAudio.pause();
        imgArea.classList.remove("playing");
    } else {
        if (wrapper.classList.contains("paused")) {
            mainAudio.play();
            imgArea.classList.add("playing");
        }
    }
});


// Reproductor de música ______________________________________________________

const wrapper = document.querySelector(".wrapper"),
    imgArea = document.querySelector(".img-area"),
    musicImg = imgArea.querySelector("img"),
    musicName = wrapper.querySelector(".song-details .name"),
    musicArtist = wrapper.querySelector(".song-details .artist"),
    playPauseBtn = wrapper.querySelector(".play-pause"),
    prevBtn = document.querySelector("#prev"),
    nextBtn = document.querySelector("#next"),
    mainAudio = wrapper.querySelector("#main-audio"),
    progressArea = document.querySelector(".progress-area"),
    progressBar = progressArea.querySelector(".progress-bar"),
    repeatBtn = document.querySelector("#repeat-plist"),
    musicList = document.querySelector(".music-list"),
    moreMusicBtn = document.querySelector("#more-music"),
    closeMoreMusic = musicList.querySelector("#close"),
    ulTag = wrapper.querySelector("ul");

let musicIndex = Math.floor(Math.random() * allMusic.length);
let isMusicPaused = true;
let isShuffle = false;

// Ordena alfabéticamente los nombres de las canciones
allMusic.sort((a, b) => a.name.localeCompare(b.name));

window.addEventListener("load", () => {
    loadMusic(musicIndex);
    updatePlayingSong();
    displayAllSongs();
    updateMetadata();  // Actualizar metadata al cargar
});

function loadMusic(index) {
    if (mainAudio.src) {
        mainAudio.pause();
        mainAudio.removeAttribute('src'); // Libera el recurso de audio anterior
        mainAudio.load();
    }
    if (musicImg.src) {
        musicImg.removeAttribute('src'); // Libera la imagen anterior
    }

    const song = allMusic[index];
    const formattedName = song.name.replace(/ - /g, ' <br> ');
    musicName.innerHTML = formattedName;
    musicArtist.innerText = song.artist;
    musicImg.src = `img/${song.img}.jpg`;
    mainAudio.src = `music/${song.src}.mp3`;
    updateMetadata(); // Actualizar metadata al cargar
}

function playMusic() {
    if (mainAudio.src) {
        wrapper.classList.add("paused");
        playPauseBtn.querySelector("i").innerText = "pause";
        mainAudio.play();
        imgArea.classList.add("playing");
        updateMetadata();  // Asegurar que la metadata está actualizada
    }
}

function pauseMusic() {
    wrapper.classList.remove("paused");
    playPauseBtn.querySelector("i").innerText = "play_arrow";
    mainAudio.pause();
    imgArea.classList.remove("playing");
}

playPauseBtn.addEventListener("click", () => {
    const isPlaying = wrapper.classList.contains("paused");
    isPlaying ? pauseMusic() : playMusic();
});

prevBtn.addEventListener("click", prevMusic);
nextBtn.addEventListener("click", nextMusic);

function prevMusic() {
    if (isShuffle) {
        shuffleMusic();
    } else {
        musicIndex = (musicIndex - 1 + allMusic.length) % allMusic.length;
        loadMusic(musicIndex);
        playMusic();
        updatePlayingSong();
    }
}

function nextMusic() {
    if (isShuffle) {
        shuffleMusic();
    } else {
        musicIndex = (musicIndex + 1) % allMusic.length;
        loadMusic(musicIndex);
        playMusic();
        updatePlayingSong();
    }
}

mainAudio.addEventListener("timeupdate", (e) => {
    if (mainAudio.duration) {
        const progressWidth = (e.target.currentTime / mainAudio.duration) * 100;
        progressBar.style.width = `${progressWidth}%`;
        updateCurrentTime(e.target.currentTime);
    }
});

function updateCurrentTime(currentTime) {
    const currentMin = Math.floor(currentTime / 60);
    const currentSec = Math.floor(currentTime % 60).toString().padStart(2, "0");
    wrapper.querySelector(".current-time").innerText = `${currentMin}:${currentSec}`;
}

mainAudio.addEventListener("loadeddata", () => {
    const totalMin = Math.floor(mainAudio.duration / 60);
    const totalSec = Math.floor(mainAudio.duration % 60).toString().padStart(2, "0");
    wrapper.querySelector(".max-duration").innerText = `${totalMin}:${totalSec}`;
});

progressArea.addEventListener("click", (e) => {
    const progressWidth = progressArea.clientWidth;
    const clickedOffsetX = e.offsetX;
    const newTime = (clickedOffsetX / progressWidth) * mainAudio.duration;
    mainAudio.currentTime = newTime;
    playMusic();
    updatePlayingSong();
});

repeatBtn.addEventListener("click", () => {
    switch (repeatBtn.innerText) {
        case "repeat":
            repeatBtn.innerText = "repeat_one";
            repeatBtn.setAttribute("title", "Song looped");
            isShuffle = false;
            break;
        case "repeat_one":
            repeatBtn.innerText = "shuffle";
            repeatBtn.setAttribute("title", "Playback shuffled");
            isShuffle = true;
            break;
        case "shuffle":
            repeatBtn.innerText = "repeat";
            repeatBtn.setAttribute("title", "Playlist looped");
            isShuffle = false;
            break;
    }
});

mainAudio.addEventListener("ended", () => {
    if (repeatBtn.innerText === "repeat_one") {
        mainAudio.currentTime = 0;
        playMusic();
    } else if (isShuffle) {
        shuffleMusic();
    } else {
        nextMusic();
    }
});

function shuffleMusic() {
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * allMusic.length);
    } while (randomIndex === musicIndex);
    musicIndex = randomIndex;
    loadMusic(musicIndex);
    playMusic();
    updatePlayingSong();
}

// Modo aleatorio  ______________________________________________________

let playedSongs = [];
let allSongsPlayed = false;

function shuffleMusic() {
    if (playedSongs.length >= allMusic.length) {
        playedSongs = [];
        allSongsPlayed = true;
    }
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * allMusic.length);
    } while (playedSongs.includes(randomIndex) && !allSongsPlayed);
    playedSongs.push(randomIndex);
    musicIndex = randomIndex;
    loadMusic(musicIndex);
    playMusic();
    updatePlayingSong();
}

function nextMusic() {
    if (isShuffle) {
        shuffleMusic();
    } else {
        musicIndex = (musicIndex + 1) % allMusic.length;
        loadMusic(musicIndex);
        playMusic();
        updatePlayingSong();
    }

    // Cargar más canciones si llegamos al final del buffer actual
    if (musicIndex % increment === 0 && musicIndex > 0 && loadedSongs < allMusic.length) {
        loadMoreSongs();
    }
}

function prevMusic() {
    if (playedSongs.length > 1) {
        playedSongs.pop(); // Remover la canción actual
        musicIndex = playedSongs[playedSongs.length - 1]; // Volver a la canción anterior
        loadMusic(musicIndex);
        playMusic();
        updatePlayingSong();
    } else {
        musicIndex = (musicIndex - 1 + allMusic.length) % allMusic.length;
        loadMusic(musicIndex);
        playMusic();
        updatePlayingSong();
    }
}

// Repetición de canción
repeatBtn.addEventListener("click", () => {
    switch (repeatBtn.innerText) {
        case "repeat":
            repeatBtn.innerText = "repeat_one";
            repeatBtn.setAttribute("title", "Song looped");
            isShuffle = false;
            break;
        case "repeat_one":
            repeatBtn.innerText = "shuffle";
            repeatBtn.setAttribute("title", "Playback shuffled");
            isShuffle = true;
            break;
        case "shuffle":
            repeatBtn.innerText = "repeat";
            repeatBtn.setAttribute("title", "Playlist looped");
            isShuffle = false;
            break;
    }
});


// Mouse ______________________________________________________

let isDragging = false;

function updateProgress(e) {
    const progressWidth = progressArea.clientWidth;
    const offsetX = e.touches ? e.touches[0].clientX - progressArea.getBoundingClientRect().left : e.offsetX;
    const newTime = (offsetX / progressWidth) * mainAudio.duration;
    mainAudio.currentTime = newTime;
    const progressPercentage = (mainAudio.currentTime / mainAudio.duration) * 100;
    progressBar.style.width = `${progressPercentage}%`;
}

// Mouse Events
progressArea.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateProgress(e);
});

progressArea.addEventListener('mousemove', (e) => {
    if (isDragging) {
        updateProgress(e);
    }
});

progressArea.addEventListener('mouseup', () => {
    isDragging = false;
});

progressArea.addEventListener('mouseleave', () => {
    isDragging = false;
});

// Touch Events
progressArea.addEventListener('touchstart', (e) => {
    isDragging = true;
    updateProgress(e);
});

progressArea.addEventListener('touchmove', (e) => {
    if (isDragging) {
        updateProgress(e);
    }
});

progressArea.addEventListener('touchend', () => {
    isDragging = false;
});

// Lista de canciones ______________________________________________________

const gifNames = ["baile", "baile2", "baile3", "baile4", "baile5", "baile6", "baile7", "baile8"];

function changeGif() {
    const randomIndex = Math.floor(Math.random() * gifNames.length);
    const gifName = gifNames[randomIndex];
    const danceGif = document.querySelector(".dance");
    danceGif.src = `img/${gifName}.gif`;
}

moreMusicBtn.addEventListener("click", () => {
    changeGif();
    displayInitialSongs(); // Mostrar solo las primeras 20 canciones
    musicList.classList.toggle("show");
});

closeMoreMusic.addEventListener("click", () => {
    musicList.classList.remove("show");
});

let loadedSongs = 20; // Número inicial de canciones para cargar
const increment = 20; // Número de canciones para cargar cada vez

function displayInitialSongs() {
    ulTag.innerHTML = "";
    for (let i = 0; i < loadedSongs; i++) {
        const song = allMusic[i];
        const liTag = `<li li-index="${i + 1}">
            <div class="row">
                <span>${song.name}</span>
                <p>${song.artist}</p>
            </div>
            <audio class="${song.src}" src="songs/${song.src}.mp3"></audio>
        </li>`;
        ulTag.insertAdjacentHTML("beforeend", liTag);
        const liItem = ulTag.querySelector(`li[li-index="${i + 1}"]`);
        liItem.addEventListener("click", () => selectSong(liItem));
    }
    updatePlayingSong();
}

// Función para cargar más canciones
function loadMoreSongs() {
    const totalSongs = allMusic.length;
    const start = loadedSongs;
    const end = Math.min(loadedSongs + increment, totalSongs);
    const fragment = document.createDocumentFragment();

    for (let i = start; i < end; i++) {
        const song = allMusic[i];
        const liTag = document.createElement('li');
        liTag.setAttribute('li-index', i + 1);
        liTag.innerHTML = `
            <div class="row">
                <span>${song.name}</span>
                <p>${song.artist}</p>
            </div>
            <audio class="${song.src}" src="songs/${song.src}.mp3"></audio>
        `;
        liTag.addEventListener("click", () => selectSong(liTag));
        fragment.appendChild(liTag);
    }

    ulTag.appendChild(fragment);
    loadedSongs += increment;
}

// Evento para cargar más canciones cuando la lista llegue al final
musicList.addEventListener('scroll', () => {
    if (musicList.scrollTop + musicList.clientHeight >= musicList.scrollHeight) {
        loadMoreSongs();
    }
});

function selectSong(element) {
    musicIndex = element.getAttribute("li-index") - 1;
    loadMusic(musicIndex);
    playMusic();
    updatePlayingSong();
}


// función bold ______________________________________________________

function updatePlayingSong() {
    const allLiTags = ulTag.querySelectorAll("li");

    allLiTags.forEach((li) => {
        li.classList.remove("playing");
        const nameTag = li.querySelector("span");
        const artistTag = li.querySelector("p");
        if (nameTag) {
            nameTag.style.fontWeight = "normal";
        }
        if (artistTag) {
            artistTag.style.fontWeight = "normal";
        }
    });

    const currentLi = ulTag.querySelector(`li[li-index="${musicIndex + 1}"]`);
    if (currentLi) {
        currentLi.classList.add("playing");
        const currentNameTag = currentLi.querySelector("span");
        const currentArtistTag = currentLi.querySelector("p");
        if (currentNameTag) {
            currentNameTag.style.fontWeight = "bold";
        }
        if (currentArtistTag) {
            currentArtistTag.style.fontWeight = "bold";
        }
    }

    // Actualizar sugerencias en el buscador
    const suggestionsContainer = document.getElementById("suggestions-container");
    if (suggestionsContainer) {
        const suggestionItems = suggestionsContainer.querySelectorAll(".suggestion-item");
        suggestionItems.forEach((item) => {
            item.classList.remove("playing");
            item.innerHTML = item.innerText; // Restablecer el estilo por defecto
        });

        const currentSuggestionItem = suggestionsContainer.querySelector(`.suggestion-item[li-index="${musicIndex + 1}"]`);
        if (currentSuggestionItem) {
            currentSuggestionItem.classList.add("playing");
            const songName = musicName.innerHTML;
            const songArtist = musicArtist.innerText;
            currentSuggestionItem.innerHTML = `<strong>${songName} - ${songArtist}</strong>`;
        }
    }
}
