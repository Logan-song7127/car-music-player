if('serviceWorker' in navigator) {
	navigator.serviceWorker.register('sw.js');
}

const SERVER_URL = "http://192.168.1.73:5000/api/playlist";
let playlistTracks=[];
let activeTrackIndex=0;

const audioEngine=document.getElementById('audio-engine');
const uiTitle=document.getElementById('ui-title');
const uiArtist=document.getElementById('ui-artist');
const btnPlay=document.getElementById('btn-play');
const btnPrev=document.getElementById('btn-prev');
const btnNext=document.getElementById('btn-next');

async function initializeApp(){
	try{
		const networkResponse= await fetch(SERVER_URL);
		const data=await networkResponse.json();
		playlistTracks=data.tracks;
		
		localStorage.setItem('cached_playlist', JSON.stringify(playlistTracks));
		
		if(playlistTracks.length > 0) {
			prepareTrack(activeTrackIndex);
		}
	}catch(networkError){
		console.log("No network connection.  Checking for offline backup...");
		const savedData=localStorage.getItem('cached_playlist');
		if(savedData){
			playlistTracks=JSON.parse(savedData);
			uiTitle.innerText="Offline";
			uiArtist.innerText=`${playlistTracks.length} Songs loaded from cache`;
			prepareTrack(activeTrackIndex);
		} else{
			uiTitle.innerText="cannot Connect to PC";
			uiArtist.innerText="connect to Wi-fi to load your songs first.";
		}
	}
}

function prepareTrack(index){
	const track=playlistTracks[index];
	audioEngine.src=track.url;
	uiTitle.innerText=track.title;
	uiArtist.innerText=track.artist;
	
	if('mediaSession' in navigator) {
		navigator.mediaSession.metadata=new MediaMetadata({
			title:track.title,
			artist:track.artist,
			album: "My Offline Car Collection"
		});
	}
}
function executePlay(){
	audioEngine.play();
	btnPlay.innerText="⏸";
}

function executePause(){
	audioEngine.pause();
	btnPlay.innerText="▶";
}

btnPlay.addEventListener('click', ()=>{
	if(audioEngine.paused){executePlay();} else{executePause();}
});
btnNext.addEventListener('click',()=>{
	activeTrackIndex=(activeTrackIndex+1)%playlistTracks.length;
	prepareTrack(activeTrackIndex);
	executePlay();
});
btnPrev.addEventListener('click',()=>{
	activeTrackIndex=(activeTrackIndex-1+playlistTracks.length)%playlistTracks.length;
	prepareTrack(activeTrackIndex);
	executePlay();
});
audioEngine.addEventListener('ended',()=>{
	btnNext.click();
});
if('mediaSession' in navigator)
{
	navigator.mediaSession.setActionHandler('play', executePlay);
	navigator.mediaSession.setActionHandler('pause', executePause);
	navigator.mediaSession.setActionHandler('nexttrack', () => btnNext.click());
	navigator.mediaSession.setActionHandler('previoustrack', () => btnPrev.click());
}
initializeApp();