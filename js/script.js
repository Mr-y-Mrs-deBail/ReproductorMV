//Dropdown
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

document.getElementById("search-input-principal").addEventListener("input", function() {
    const searchQuery = this.value.toLowerCase();
    const suggestionsContainer = document.getElementById("suggestions-container-principal");

    if (searchQuery.length === 0) {
        suggestionsContainer.style.display = 'none';
        return;
    }

    suggestionsContainer.innerHTML = '';
    const filteredSongs = allMusic.filter(song =>
        song.name.toLowerCase().includes(searchQuery) ||
        song.artist.toLowerCase().includes(searchQuery)
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
});

function selectSongByName(songName, songArtist) {
    const songIndex = allMusic.findIndex(song => song.name.toLowerCase() === songName.toLowerCase() && song.artist.toLowerCase() === songArtist.toLowerCase());
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
    return musicName.innerHTML.toLowerCase().includes(songName.toLowerCase()) && musicArtist.innerText.toLowerCase().includes(songArtist.toLowerCase());
}

function updatePlayingSong() {
    // Actualizar estado en la lista principal
    const allLiTags = ulTag.querySelectorAll("li");
    allLiTags.forEach((li) => {
        li.classList.remove("playing");
        const audioTag = li.querySelector(".audio-duration");
        if (audioTag) {
            audioTag.innerText = "";
        }
        const nameTag = li.querySelector("span");
        const artistTag = li.querySelector("p");
        if (nameTag) {
            nameTag.style.fontWeight = "normal";
        }
        if (artistTag) {
            artistTag.style.fontWeight = "normal";
        }
    });

    const currentLi = ulTag.querySelector(`li[li-index="${musicIndex}"]`);
    if (currentLi) {
        currentLi.classList.add("playing");
        const currentNameTag = currentLi.querySelector("span");
        const currentArtistTag = currentLi.querySelector("p");
        currentNameTag.style.fontWeight = "bold";
        currentArtistTag.style.fontWeight = "bold";
    }

    // Actualizar estado en el buscador principal
    const suggestionsContainerPrincipal = document.getElementById("suggestions-container-principal");
    const suggestionItemsPrincipal = suggestionsContainerPrincipal.querySelectorAll(".suggestion-item");
    suggestionItemsPrincipal.forEach((item) => {
        item.classList.remove("playing");
        item.innerHTML = item.innerText; // Restablecer estilo por defecto
    });

    suggestionItemsPrincipal.forEach((item) => {
        const songName = musicName.innerHTML;
        const songArtist = musicArtist.innerText;
        if (item.innerText.includes(songName) && item.innerText.includes(songArtist)) {
            item.innerHTML = `<strong>${songName} - ${songArtist}</strong>`;
            item.classList.add("playing");
        }
    });
}

// Reproductor de música ____________________________________________________________________________________________________________

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
    moreArtistBtn = document.querySelector("#more-artist"),
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
});

function loadMusic(index) {
    const song = allMusic[index];
    const formattedName = song.name.replace(/ - /g, ' <br> ');
    musicName.innerHTML = formattedName;
    musicArtist.innerText = song.artist;
    musicImg.src = `img/${song.img}.jpg`;
    mainAudio.src = `music/${song.src}.mp3`;
}

function playMusic() {
    wrapper.classList.add("paused");
    playPauseBtn.querySelector("i").innerText = "pause";
    mainAudio.play();
    imgArea.classList.add("playing");
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

// Lista de canciones
const gifNames = ["baile", "baile2", "baile3", "baile4", "baile5", "baile6", "baile7", "baile8"];

function changeGif() {
    const randomIndex = Math.floor(Math.random() * gifNames.length);
    const gifName = gifNames[randomIndex];
    const danceGif = document.querySelector(".dance");
    danceGif.src = `img/${gifName}.gif`;
}

moreMusicBtn.addEventListener("click", () => {
    changeGif();
    displayAllSongs();
    musicList.classList.toggle("show");
});

closeMoreMusic.addEventListener("click", () => {
    musicList.classList.remove("show");
});

moreArtistBtn.addEventListener("click", () => {
    const currentArtist = musicArtist.innerText;
    displayArtistSongs(currentArtist);
});

function displayAllSongs() {
    ulTag.innerHTML = "";
    allMusic.forEach((song, index) => {
        const liTag = `<li li-index="${index + 1}">
            <div class="row">
                <span>${song.name}</span>
                <p>${song.artist}</p>
            </div>
            <audio class="${song.src}" src="songs/${song.src}.mp3"></audio>
        </li>`;
        ulTag.insertAdjacentHTML("beforeend", liTag);

        const liItem = ulTag.querySelector(`li[li-index="${index + 1}"]`);
        liItem.addEventListener("click", () => selectSong(liItem));
    });
    updatePlayingSong();
}

function displayArtistSongs(artist) {
    const filteredSongs = allMusic.filter(song => 
        song.artist.toLowerCase().includes(artist.toLowerCase())
    );

    ulTag.innerHTML = "";
    filteredSongs.forEach((song, index) => {
        const liTag = `<li li-index="${index + 1}">
            <div class="row">
                <span>${song.name}</span>
                <p>${song.artist}</p>
            </div>
            <audio class="${song.src}" src="songs/${song.src}.mp3"></audio>
        </li>`;
        ulTag.insertAdjacentHTML("beforeend", liTag);

        const liItem = ulTag.querySelector(`li[li-index="${index + 1}"]`);
        liItem.addEventListener("click", () => selectSong(liItem));
    });

    musicList.classList.add("show");
    updatePlayingSong();
}


function selectSong(element) {
    musicIndex = element.getAttribute("li-index") - 1;
    loadMusic(musicIndex);
    playMusic();
    updatePlayingSong();
}

// función bold ___________________________________________________________________________________________________________

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

    const moreArtistList = document.querySelector(".more-artist-list ul");
    if (moreArtistList) {
        const artistLiTags = moreArtistList.querySelectorAll("li");

        artistLiTags.forEach((li) => {
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

        const currentArtistLi = moreArtistList.querySelector(`li[li-index="${musicIndex + 1}"]`);
        if (currentArtistLi) {
            currentArtistLi.classList.add("playing");
            const currentArtistNameTag = currentArtistLi.querySelector("span");
            const currentArtistArtistTag = currentArtistLi.querySelector("p");
            if (currentArtistNameTag) {
                currentArtistNameTag.style.fontWeight = "bold";
            }
            if (currentArtistArtistTag) {
                currentArtistArtistTag.style.fontWeight = "bold";
            }
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
