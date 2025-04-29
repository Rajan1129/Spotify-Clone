console.log("lets play holi");
let currentSong = new Audio();
let songs;
let currFolder;
// let folder;

function secondsToMinutesSeconds(seconds){
    if(isNaN(seconds) || seconds < 0) {
        return"00:00";
    }

    const minutes = Math.floor(seconds/60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formatedMinutes = String(minutes).padStart(2, '0');
    const formatedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formatedMinutes}:${formatedSeconds}`;
}



async function getSongs(folder) {
  currFolder = folder;
  let a =await fetch(`http://127.0.0.1:5500/${folder}/`)
  let response=await a.text();
  let div =document.createElement("div")
  div.innerHTML=response;
 let as= div.getElementsByTagName("a")
 songs = []
 for (let index = 0; index < as.length; index++) {
    const element = as[index];
   if(element.href.endsWith(".mp3")){
      songs.push(element.href.split(`/${folder}/`)[1])
    }
  }
//show all the songs
   let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0]
   songUl.innerHTML =""
   for (const song of songs) {
       songUl.innerHTML = songUl.innerHTML + `<li>
       <img class="invert" src="img/music-1.svg" alt="">
                       <div class="info">
                           <div>${song.replaceAll("%20"," ")}</div>
                           <div>Song</div>
                       </div>
                        <div class="controls">
        <!-- Like Button -->
        <img class="like-btn invert" data-song="${song}" src="img/heart.svg.svg" title="Like" />
        <!-- Download Button -->
        <a href="/${currFolder}/${song}" download title="Download">
          <img class="download-btn invert" src="img/download.svg" />
        </a>
                       <div class="playnow">
                           <img class="song-play-toggle invert" data-song="${song}" src="img/play.svg" alt="">
                       </div>
                       </div>
                      </li>`;
   }
   function setupPlayNowButtons() {
    const buttons = document.querySelectorAll(".song-play-toggle");
  
    buttons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation(); // prevent list item click
  
        const songName = btn.dataset.song;
  
        if (!currentSong.paused && currentSong.src.includes(songName)) {
          // Pause the song
          currentSong.pause();
          btn.src = "img/play.svg";
          play.src = "img/play.svg"; // <-- sync main button!
        } else {
          // Play the song
          playMusic(songName);
          updateAllPlayIcons(); // reset all small icons
          btn.src = "img/pause.svg";
          play.src = "img/pause.svg"; // <-- sync main button!
        }
      });
    });
  }
  
  
  // Helper to reset all icons to play
  function updateAllPlayIcons() {
    document.querySelectorAll(".song-play-toggle").forEach(btn => {
      btn.src = "img/play.svg";
    });
  }
  
  setupPlayNowButtons();
  const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/${track}`;

  if (!pause) {
    currentSong.play();
    showToast(`Now playing: ${decodeURI(track)}`);

    play.src = "img/pause.svg"; // main play button icon
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

  
  function updateAllPlayIcons() {
    document.querySelectorAll(".song-play-toggle").forEach(icon => {
      icon.src = "img/play.svg";
    });
  }
  
   function setupLikeButtons() {
    const likedSongs = JSON.parse(localStorage.getItem("likedSongs") || "[]");
  
    document.querySelectorAll(".like-btn").forEach(btn => {
      const song = btn.dataset.song;
  
      // Show as liked on load
      if (likedSongs.includes(song)) {
        btn.classList.add("liked");
        btn.src = "img/heart-filled.svg"; // filled red heart
      }
  
      btn.addEventListener("click", () => {
        if (btn.classList.contains("liked")) {
          btn.classList.remove("liked");
          btn.src = "img/heart.svg.svg"; // empty heart
          const index = likedSongs.indexOf(song);
          likedSongs.splice(index, 1);
        } else {
          btn.classList.add("liked");
          btn.src = "img/filled.svg"; // red heart
          likedSongs.push(song);
        }
  
        localStorage.setItem("likedSongs", JSON.stringify(likedSongs));
      });
    });
  }
  
  setupLikeButtons();

   //append like songs in "liked songs"folder
  
   //event handler
   Array.from(document.querySelectorAll(".songList li")).forEach(li => {
    li.addEventListener("click", (event) => {
      const target = event.target;
  
      // If user clicked on like button, download button, or a link, skip playing
      if (
        target.closest(".like-btn") ||
        target.closest(".download-btn") ||
        target.closest("a")
      ) {
        return;
      }
  
      const songName = li.querySelector(".info div").textContent.trim();
      playMusic(songName);
    });
  });
  
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/${track}`;

  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg"; // update main play button
    showToast(`Now playing: ${decodeURI(track)}`);
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

  // Update small play icons (sync)
  document.querySelectorAll(".song-play-toggle").forEach(btn => {
    const songName = btn.dataset.song;
    if (songName === track) {
      btn.src = "img/pause.svg";
    } else {
      btn.src = "img/play.svg";
    }
  });
};


async function displayAlbums(){
  let a = await fetch(`http://127.0.0.1:5500/songs/`)
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");

  Array.from(anchors).forEach(async e => {
    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-1)[0];

      // Fetch album metadata
      let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
      let response = await a.json();

      // ✅ Fetch number of mp3 files in this folder
      let folderSongsResp = await fetch(`http://127.0.0.1:5500/songs/${folder}/`);
      let text = await folderSongsResp.text();
      let tempDiv = document.createElement("div");
      tempDiv.innerHTML = text;
      let mp3Count = Array.from(tempDiv.getElementsByTagName("a"))
                          .filter(link => link.href.endsWith(".mp3")).length;

      // ✅ Add icon + song count
      cardContainer.innerHTML += `
        <div data-folder="${folder}" class="card">
          <div class="play">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                stroke-linejoin="round" />
            </svg>
          </div>
          <img src="/songs/${folder}/cover.jpg" alt="">
          <h2>${response.title}</h2>
          <p>${response.description}</p>
          <p style="color: grey; display: flex; align-items: center; gap: 6px; font-size: 14px;">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="16" height="16" viewBox="0 0 24 24">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
            ${mp3Count} song${mp3Count !== 1 ? 's' : ''}
          </p>
        </div>`;
        
    }
  });
}


async function main(){
 //get play list of all the songs
  await getSongs("songs/ncs")
  playMusic(songs[0], true)


  //display all the albums on the page
  displayAlbums()

  //to play , next & previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
  
      // Sync small icon to pause if a song is playing
      const current = currentSong.src.split("/").slice(-1)[0];
      document.querySelectorAll(".song-play-toggle").forEach(btn => {
        btn.src = btn.dataset.song === current ? "img/pause.svg" : "img/play.svg";
      });
  
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
  
      // Sync all icons to play
      document.querySelectorAll(".song-play-toggle").forEach(btn => {
        btn.src = "img/play.svg";
      });
    }
  });
  //loop 
 let isPlaylistLooping = false;


  document.getElementById("loop").addEventListener("click", () => {
    isPlaylistLooping = !isPlaylistLooping;
  
    const loopIcon = document.getElementById("loop");
    loopIcon.style.filter = isPlaylistLooping
      ? "invert(48%) sepia(88%) saturate(500%) hue-rotate(90deg) brightness(90%) contrast(90%)"
      : "invert(1)";
  
    showToast(isPlaylistLooping ? "Playlist loop enabled" : "Playlist loop disabled");
  });
  


   //time update
  currentSong.addEventListener("timeupdate",()=>{
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} /  ${secondsToMinutesSeconds(currentSong.duration)}`
    document.querySelector(".circle").style.left=(currentSong.currentTime / currentSong.duration)*100+"%";
  })
  currentSong.addEventListener("ended", () => {
    let currentIndex = songs.indexOf(currentSong.src.split("/").pop());
  
    if (currentIndex < songs.length - 1) {
      playMusic(songs[currentIndex + 1]);
    } else if (isPlaylistLooping) {
      playMusic(songs[0]); // Restart from beginning
    } else {
      play.src = "img/play.svg"; // Reset play button
      showToast("Playback ended");
    }
  });
  

   //event listner to seekbar
  document.querySelector(".seekbar").addEventListener("click",e=>{
    let percent =(e.offsetX/e.target.getBoundingClientRect().width)*100;
    document.querySelector(".circle").style.left= percent+"%";
    currentSong.currentTime = ((currentSong.duration)*percent)/100
 })

   //eventlistner for hamburger
   document.querySelector(".hamburger").addEventListener("click",()=>{
    document.querySelector(".left").style.left="0"
   })
 //eventlistner for close
 document.querySelector(".close").addEventListener("click",()=>{
    document.querySelector(".left").style.left ="-120%"
   })

  //event listner for previous 
  
  previous.addEventListener("click", ()=>{
    console.log("Previous clicked")
    console.log(currentSong)
  let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
    if((index-1) >=0) {
        playMusic(songs[index-1])
    }
  })
 //event listner for next
  next.addEventListener("click", ()=>{
    console.log("Next clicked")

    let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
    if((index+1) < songs.length) {
        playMusic(songs[index+1])
    }
   })
   //add event to volume
   document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
     console.log("setting volume to", e.target.value, "/100")
    currentSong.volume=parseInt(e.target.value)/100
   })

   // add event listner to volume
   document.querySelector(".volume>img").addEventListener("click",e=>{
    console.log(e.target)
    console.log("changing", e.target.src)
    if(e.target.src.includes("volume.svg")){
      e.target.src=e.target.src.replace("volume.svg","mute.svg")
      currentSong.volume=0;
      document.querySelector(".range").getElementsByTagName("input")[0].value=0;
    }
    else{
      e.target.src=e.target.src.replace("mute.svg","volume.svg")
      currentSong.volume=.10;
      document.querySelector(".range").getElementsByTagName("input")[0].value=10;
    }
   })
   
   //load Playlistmusic when card clicked
   document.addEventListener("click", async (e) => {
    const card = e.target.closest(".card");
    if (card && card.dataset.folder) {
      console.log("Card clicked:", card.dataset.folder);
  
      // Store current song name to check if it's still in the new folder
      const currentSongName = currentSong.src.split("/").pop();
  
      await getSongs(`songs/${card.dataset.folder}`);
  
      // If the new folder has the current song, do nothing.
      // If it doesn't, just keep playing the old song.
      if (!songs.includes(currentSongName)) {
        // Optional: you can show a toast
        showToast("Select a song to start playing from this album.");
      }
    }
  });
  
  

} 
// Inside main() or after DOM is ready
document.querySelector("li:nth-child(2)").addEventListener("click", () => {
  const searchBar = document.querySelector(".searchBar");
  searchBar.style.display = searchBar.style.display === "none" ? "block" : "none";

  if (searchBar.style.display === "block") {
    document.getElementById("searchInput").focus();
  }
});

function enableSongSearch() {
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", () => {
    const filter = searchInput.value.toLowerCase();
    const songItems = document.querySelectorAll(".songList ul li");

    songItems.forEach(item => {
      const songName = item.querySelector(".info div").textContent.toLowerCase();
      item.style.display = songName.includes(filter) ? "" : "none";
    });
  });
}

async function enableGlobalSongSearch() {
  const searchInput = document.getElementById("searchInput");

  // Gather all songs from all folders
  let allSongs = [];

  const songsResp = await fetch(`http://127.0.0.1:5500/songs/`);
  const songsHTML = await songsResp.text();
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = songsHTML;
  const folderLinks = Array.from(tempDiv.getElementsByTagName("a"));

  for (let folderLink of folderLinks) {
    if (!folderLink.href.includes("/songs/")) continue;

    const folder = folderLink.href.split("/").slice(-1)[0];
    const folderResp = await fetch(`http://127.0.0.1:5500/songs/${folder}/`);
    const folderHTML = await folderResp.text();
    const folderDiv = document.createElement("div");
    folderDiv.innerHTML = folderHTML;

    const mp3Links = Array.from(folderDiv.getElementsByTagName("a")).filter(a => a.href.endsWith(".mp3"));

    mp3Links.forEach(link => {
      allSongs.push({
        name: decodeURIComponent(link.href.split(`/${folder}/`).pop()),
        folder: folder
      });
    });
  }

  // Filter & show results
  searchInput.addEventListener("input", () => {
    const filter = searchInput.value.toLowerCase();
    const songList = document.querySelector(".songList ul");
    songList.innerHTML = "";

    const filteredSongs = allSongs.filter(song => song.name.toLowerCase().includes(filter));

    for (const song of filteredSongs) {
      songList.innerHTML += `
        <li data-folder="${song.folder}" data-name="${song.name}">
          <img class="invert" src="img/music-1.svg" alt="">
          <div class="info">
            <div>${song.name}</div>
            <div>From: ${song.folder}</div>
          </div>
          <div class="playnow">
            <img class="song-play-toggle invert" data-song="${song.name}" data-folder="${song.folder}" src="img/play.svg" alt="">
          </div>
        </li>`;
    }

    setupGlobalPlayNowButtons();
  });
}
function setupGlobalPlayNowButtons() {
  document.querySelectorAll(".song-play-toggle").forEach(btn => {
    btn.addEventListener("click", async () => {
      const songName = btn.dataset.song;
      const folder = btn.dataset.folder;

      if (currFolder !== `songs/${folder}`) {
        await getSongs(`songs/${folder}`);  // 🔁 Load that folder's songs
      }

      playMusic(songName);  // ▶️ Play the clicked song
    });
  });
}

enableGlobalSongSearch();
// call it in main()
function setupCardPlayButtons() {
  const buttons = document.querySelectorAll(".play-button");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const folder = button.dataset.folder;

      fetch(`${folder}/info.json`)
        .then(res => res.json())
        .then(songs => {
          playSongsInSequence(songs, folder);
        })
        .catch(err => console.error("Error loading songs:", err));
    });
  });
}

function playSongsInSequence(songs, folder) {
  let index = 0;
  const audio = new Audio();

  function playNext() {
    if (index < songs.length) {
      audio.src = `${folder}/${songs[index].src}`;
      document.querySelector(".currentSongName").textContent = songs[index].name; // optional UI update
      audio.play();
      index++;
      audio.onended = playNext;
    }
  }

  playNext();
}

// Initialize the buttons after DOM is loaded
setupCardPlayButtons();
// msg to show which song playing
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}
//click on card play button then songs play
// Function to play all songs from a folder sequentially
async function playAlbumSequentially(folder) {
  await getSongs(`songs/${folder}`);  // Load songs from that folder
  let index = 0;
  
  playMusic(songs[index]);
  
  currentSong.onended = () => {
    index++;
    if (index < songs.length) {
      playMusic(songs[index]);
    }
  };
}

main()