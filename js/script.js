//js para dropdown

//Control del Dropdown

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
    document.getElementById("search-input").value = ''; // Limpiar el campo de búsqueda
    document.getElementById("suggestions-container").style.display = 'none'; // Ocultar sugerencias
});

document.getElementById("search-input").addEventListener("input", function() {
    const searchQuery = this.value.toLowerCase();
    const suggestionsContainer = document.getElementById("suggestions-container");
    
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

            if (isCurrentSong(song.name)) {
                suggestionItem.innerHTML = `<strong>${song.name} - ${song.artist}</strong>`;
            } else {
                suggestionItem.innerHTML = `${song.name} - ${song.artist}`;
            }

            suggestionItem.addEventListener("click", () => selectSongByName(song.name));
            suggestionsContainer.appendChild(suggestionItem);
        });
        suggestionsContainer.style.display = 'block';
    } else {
        suggestionsContainer.style.display = 'none';
    }
});

function selectSongByName(songName) {
    const songIndex = allMusic.findIndex(song => song.name.toLowerCase() === songName.toLowerCase());
    if (songIndex !== -1) {
        loadMusic(songIndex);
        playMusic();
        updatePlayingSong();
        document.querySelector(".wrapper").classList.remove("show-search");
        document.getElementById("suggestions-container").style.display = 'none';
        document.getElementById("search-input").value = ''; // Limpiar el campo de búsqueda
    }
}

function isCurrentSong(songName) {
    const currentLi = ulTag.querySelector(`li[li-index="${musicIndex + 1}"]`);
    return currentLi && currentLi.querySelector("span").innerText.toLowerCase() === songName.toLowerCase();
}

// Reproductor de música
const wrapper = document.querySelector(".wrapper"),
    imgArea = document.querySelector(".img-area"),
    musicImg = imgArea.querySelector("img"),
    musicName = wrapper.querySelector(".song-details .name"),
    musicArtist = wrapper.querySelector(".song-details .artist"),
    playPauseBtn = wrapper.querySelector(".play-pause"),
    prevBtn = document.querySelector("#prev"),
    nextBtn = document.querySelector("#next"),
    mainAudio = wrapper.querySelector("#main-audio"),
    progressArea = wrapper.querySelector(".progress-area"),
    progressBar = progressArea.querySelector(".progress-bar"),
    musicList = wrapper.querySelector(".music-list"),
    moreMusicBtn = document.querySelector("#more-music"),
    closeMoreMusic = musicList.querySelector("#close"),
    repeatBtn = document.querySelector("#repeat-plist"),
    ulTag = wrapper.querySelector("ul");

let musicIndex = Math.floor(Math.random() * allMusic.length);
let isMusicPaused = true;
let isShuffle = false; // Variable para controlar el modo shuffle

// Ordena alfabéticamente los nombres de las canciones
allMusic.sort((a, b) => a.name.localeCompare(b.name));

window.addEventListener("load", () => {
    loadMusic(musicIndex);
    updatePlayingSong();
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
    mainAudio.currentTime = (clickedOffsetX / progressWidth) * mainAudio.duration;
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

moreMusicBtn.addEventListener("click", () => {
    musicList.classList.toggle("show");
});

closeMoreMusic.addEventListener("click", () => {
    musicList.classList.remove("show");
});

allMusic.forEach((song, index) => {
    const liTag = `<li li-index="${index + 1}">
        <div class="row">
            <span>${song.name}</span>
            <p>${song.artist}</p>
        </div>
        <span id="${song.src}" class="audio-duration">3:40</span>
        <audio class="${song.src}" src="songs/${song.src}.mp3"></audio>
    </li>`;

    ulTag.insertAdjacentHTML("beforeend", liTag);

    const liAudioTag = ulTag.querySelector(`.${song.src}`);
    liAudioTag.addEventListener("loadeddata", () => {
        const duration = liAudioTag.duration;
        const totalMin = Math.floor(duration / 60);
        const totalSec = Math.floor(duration % 60).toString().padStart(2, "0");
        const durationTag = ulTag.querySelector(`#${song.src}`);
        durationTag.innerText = `${totalMin}:${totalSec}`;
        durationTag.setAttribute("t-duration", `${totalMin}:${totalSec}`);
    });

    const liItem = ulTag.querySelector(`li[li-index="${index + 1}"]`);
    liItem.addEventListener("click", () => selectSong(liItem));
});

function selectSong(element) {
    musicIndex = element.getAttribute("li-index") - 1;
    loadMusic(musicIndex);
    playMusic();
    updatePlayingSong();
}

function updatePlayingSong() {
    const allLiTags = ulTag.querySelectorAll("li");
    allLiTags.forEach((li) => {
        li.classList.remove("playing");
        const audioTag = li.querySelector(".audio-duration");
        const songDuration = audioTag.getAttribute("t-duration");
        audioTag.innerText = songDuration;
        const nameTag = li.querySelector("span");
        const artistTag = li.querySelector("p");
        nameTag.style.fontWeight = "normal";
        artistTag.style.fontWeight = "normal"; 
    });

    const currentLi = ulTag.querySelector(`li[li-index="${musicIndex + 1}"]`);
    currentLi.classList.add("playing");
    const currentAudioTag = currentLi.querySelector(".audio-duration");
    currentAudioTag.innerText = "";
    const currentNameTag = currentLi.querySelector("span");
    const currentArtistTag = currentLi.querySelector("p");
    currentNameTag.style.fontWeight = "bold";
    currentArtistTag.style.fontWeight = "bold";
}
