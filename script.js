//jshint esversion: 8

// For adding touch events to phones : https://stackoverflow.com/questions/11845678/adding-multiple-event-listeners-to-one-element

/*****************DOM ELEMENTS********************* */

//Top Section
const [
  backButton, //Change to button?
  speakButton,
  playlistButton, //Change to button?
] = document.querySelectorAll('section.cover-section button');
const msgText = document.querySelector('.msg-text');

const instructionsDiv = document.querySelector('.instructions-div');

//Song info
const [songNameHeader, artistNameHeader] = document.querySelectorAll(
  'section.song-text > *'
);

//Controls
const playingBar = document.querySelector('.play-bar');

const [repeatButton, prevButton, playButton, nextButton, heartButton] =
  document.querySelectorAll('div.controls button');

/*****************DOM ELEMENTS********************** */

const SECOND = 1000;

//Use to hold is mouse is clicked on element or not for drag events
let mouseDown = false;

const songs = [
  'I_Remember_You.mp3',
  'Ready_To_Fight.mp3',
  'Rise_Up.mp3',
  'Time_Alone.mp3',
  'Upon_Reflection.mp3',
];
let likedSongs = [];
const AUDIO_PATH = './assets/music/';
const songQueue = [...songs];
let currentSong;
//Audio object used to play audio
const audioPlayer = new Audio();

//Chrome supports speech recogniztion with prefixed properties as of 4/21/2021
const mySpeechRecognition = webkitSpeechRecognition || SpeechRecognition;

let recognition = new mySpeechRecognition();
const mySpeechGrammarList = webkitSpeechGrammarList || SpeechGrammarList;
const mySpeechRecognitionEvent =
  webkitSpeechRecognitionEvent || SpeechRecognitionEvent;

//Hold our phrases
const phrases = ['play', 'pause', 'next', 'previous', 'like', 'repeat'];

/*****DOM Changing Functions** */

const clearMsgTextTimer = (time) => {
  //clear the msg on the msg text
  //Make it disappear after 2 seconds
};

const resetAllSettings = () => {
  //Set everything back to default
  //Set the heart back to not active
  changeButtonActive(heartButton, 'remove');
  // heartButton.classList.remove('button-active');
  //Set the repeat to unactive
  changeButtonActive(repeatButton, 'remove');
  // repeatButton.classList.remove('button-active');
  //Start song at beginning paused
  changeAudioTime(0);
  //No text on WEB Speech Api and stop looking
  changeMsgText('');
  recognition.stop();
};

//Grab the value of the playback input
//Change to percentage
//update the value of the audio with the new value
const changeSongTime = () =>
  (audioPlayer.currentTime =
    (parseFloat(playingBar.value) / 100) * audioPlayer.duration);
const changePlayButtonIcon = (icon) =>
  (playButton.innerHTML = `<span class="fas fa-${icon}"></span>`);
const changeAudioSource = (songName) =>
  (audioPlayer.src = AUDIO_PATH + songName);
const changeAudioTime = (time) => (audioPlayer.currentTime = time);

const changeSongInfoText = (songName = '', artistName = 'Unknown') => {
  songNameHeader.textContent = songName
    .replace('.mp3', '')
    .replaceAll('_', ' ');
  artistNameHeader.textContent = artistName;
};

const updatePlayBar = () => {
  //Given the current play time of the audio to it's total play time
  //Change that into percentage
  if (audioPlayer.readyState < 1) return;
  const playTimeToPercentage =
    (audioPlayer.currentTime / audioPlayer.duration) * 100;
  //Update the value of the playbar

  playingBar.value = playTimeToPercentage;
};

const changeButtonActive = (ele, action) => {
  const clickedButton = ele.closest('button');

  if (!clickedButton || !clickedButton.dataset.activator || !action) return;
  clickedButton.classList[action]('button-active');
};

const changeMsgText = (message, type) => {
  console.log('Type is ', type);
  //Clear the msg text classes

  if (msgText.classList.contains('valid', 'invalid', 'warn'))
    msgText.classList.remove('valid', 'invalid', 'warn');

  msgText.classList.add(type);
  msgText.textContent = message;
  //For the future make it stay for 5 secs
};

const showInstructions = (toShow) => {
  instructionsDiv.classList[toShow ? 'remove' : 'add']('hide');
};

/*****DOM Changing Functions** */

const playNewSong = (song) => {
  //reset things
  resetAllSettings();

  //Change the play button to the correct icon
  changePlayButtonIcon('pause');
  currentSong = song;
  //Change the src
  changeAudioSource(song);

  //Change the song info
  changeSongInfoText(song);

  //If it's a liked song, make that active
  if (likedSongs.includes(currentSong)) changeButtonActive(heartButton, 'add');

  //Play the song
  audioPlayer.play();
};

const changeSong = (action) => {
  const newSongIndex =
    action === 'prev'
      ? songQueue.indexOf(currentSong) - 1
      : songQueue.indexOf(currentSong) + 1;

  //Does that index exists in the array
  if (!songQueue[newSongIndex]) {
    changeMsgText(
      songQueue.indexOf(currentSong) === 0
        ? 'Youre already at the beginning of the playlist'
        : 'Youre already at the end of the playlist'
    );
    return;
  }

  playNewSong(songQueue[newSongIndex]);
};

const playPauseSong = () => {
  const action = audioPlayer.paused ? 'play' : 'pause';

  //The icon shows what pressing the button will do and not the current action
  changePlayButtonIcon(action === 'play' ? 'pause' : 'play');
  audioPlayer[action]();
};

const editLikedSongs = () => {
  //See if the current song is in the liked songs array, if it is, remove it and if it isn't add it
  const likedSongIndex = likedSongs.indexOf(currentSong);

  if (likedSongIndex > 0) likedSongs.splice(likedSongIndex, 1);
  else likedSongs.push(currentSong);
};

const handleSongEnd = () => {
  //Change the icon to the play icon
  //If the repeat is on play the same song again
  //If not go to the next song in the queue and play it
  //if it's the end of the queue, put things to the beginning
  changePlayButtonIcon('play');

  if (audioPlayer.loop) playNewSong(currentSong);
  else if (songQueue[songQueue.length - 1] === currentSong) changeAudioTime(0);
  else changeSong('next');
};

const stopListening = (e) => {
  //Make sure it was a button that was clicked
  const buttonClicked = e.target.closest('button');
  if (!buttonClicked) return;

  console.log('%c Time to STOP listenings', 'background: #222; color: #bada55');
  changeButtonActive(buttonClicked, 'remove');
  changeMsgText('');
  showInstructions(false);
  recognition.stop();

  console.log(speakButton.classList.contains('button-active'));
};
const startListening = (e) => {
  console.log(
    '%c Time to start listenings',
    'background: #222; color: #bada55'
  );
  //Make sure it was a button that was clicked
  const buttonClicked = e.target.closest('button');
  if (!buttonClicked) return;

  changeButtonActive(buttonClicked, 'add');
  // To ensure case consistency while checking with the returned output text
  const newPhrases = phrases.map((phrase) => phrase.toLowerCase());

  const grammar =
    '#JSGF V1.0; grammar phrases; public <phrases> = ' +
    newPhrases.join(' | ') +
    ';';
  recognition = new mySpeechRecognition();
  const speechRecognitionList = new mySpeechGrammarList();
  speechRecognitionList.addFromString(grammar, 1);
  recognition.grammars = speechRecognitionList;
  recognition.lang = 'en-US';
  console.log(recognition.lang);
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.start();
  changeMsgText('Listening...', 'valid');
  showInstructions(true);

  recognition.onresult = (e) => {
    // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
    // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
    // It has a getter so it can be accessed like an array
    // The first [0] returns the SpeechRecognitionResult at position 0.
    // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
    // These also have getters so they can be accessed like arrays.
    // The second [0] returns the SpeechRecognitionAlternative at position 0.
    // We then return the transcript property of the SpeechRecognitionAlternative object
    const speechResult = e.results[0][0].transcript.toLowerCase();
    console.log('Speech Result: ' + speechResult);
    console.log(playButton.firstElementChild.classList.contains('fa-play'));
    switch (speechResult) {
      case 'play':
        //Check if the song is already playing
        if (
          playButton.firstElementChild.classList.contains('fa-play') === false
        )
          return;
        changeMsgText('Playing the song...', 'valid');
        //window.setTimeout(changeMsgText(''), 1000 * 10);
        playPauseSong();
        break;
      case 'pause':
        //Check if the song is already paused
        if (
          playButton.firstElementChild.classList.contains('fa-pause') === false
        )
          return;
        changeMsgText('Pausing the song...', 'valid');
        //window.setTimeout(changeMsgText(''), 1000 * 10);
        playPauseSong();
        break;
      case 'next':
        changeMsgText('Playing the next song...', 'valid');
        clearMsgTextTimer(SECOND * 2);
        changeSong('next');
        break;
      case 'previous':
        changeMsgText('Playing the previous song...', 'valid');
        clearMsgTextTimer(SECOND * 2);
        changeSong('prev');
        break;
      case 'like':
        changeMsgText('Liking this song...', 'valid');
        clearMsgTextTimer(SECOND * 2);
        changeButtonActive(heartButton, 'add');
        break;
      case 'repeat':
        changeMsgText('Putting this song on repeat...', 'valid');
        clearMsgTextTimer(SECOND * 2);
        changeButtonActive(repeatButton, 'add');
        break;
      default:
        changeMsgText(
          'Unable to understand your command. Please try again',
          'invalid'
        );
        break;
    }

    console.log('Confidence: ' + e.results[0][0].confidence);
  };

  recognition.onspeechend = () => {
    recognition.stop();
    changeButtonActive(speakButton, 'remove');
    changeMsgText('');
    showInstructions(false);
  };

  recognition.onerror = (e) => {
    recognition.stop();
    changeButtonActive(speakButton, 'remove');
    changeMsgText(`Error occurred in recognition: ${e.error}`, 'invalid');
  };

  recognition.onaudiostart = (e) => {
    //Fired when the user agent has started to capture audio.
    console.log('SpeechRecognition.onaudiostart');
  };
  if (recognition.onaudiostart) {
    console.log('It can start!');
  }

  recognition.onaudioend = (e) => {
    //Fired when the user agent has finished capturing audio.
    console.log('SpeechRecognition.onaudioend');
  };

  recognition.onend = (e) => {
    //Fired when the speech recognition service has disconnected.
    console.log('SpeechRecognition.onend');
  };

  recognition.onnomatch = (e) => {
    //Fired when the speech recognition service returns a final result with no significant recognition. This may involve some degree of recognition, which doesn't meet or exceed the confidence threshold.
    recognition.stop();
    changeButtonActive(speakButton, 'remove');
    changeMsgText(`There was no match!`, 'invalid');
  };

  recognition.onsoundstart = (e) => {
    //Fired when any sound — recognisable speech or not — has been detected.
    console.log('SpeechRecognition.onsoundstart');
  };

  recognition.onsoundend = (e) => {
    //Fired when any sound — recognisable speech or not — has stopped being detected.
    console.log('SpeechRecognition.onsoundend');
  };

  recognition.onspeechstart = (e) => {
    //Fired when sound that is recognised by the speech recognition service as speech has been detected.
    console.log('SpeechRecognition.onspeechstart');
  };

  recognition.onstart = (e) => {
    //Fired when the speech recognition service has begun listening to incoming audio with intent to recognize grammars associated with the current SpeechRecognition.
    console.log('SpeechRecognition.onstart');
    changeMsgText('Listening...', 'valid');
  };
};

const handleControlElementClick = (e) => {
  //Make sure it was a button that was clicked
  const buttonClicked = e.target.closest('button');
  if (!buttonClicked) return;
  console.log(buttonClicked);

  switch (buttonClicked) {
    case repeatButton:
      changeButtonActive(
        repeatButton,
        repeatButton.classList.contains('button-active') ? 'remove' : 'add'
      );
      audioPlayer.loop = !audioPlayer.loop;
      break;
    case prevButton:
      changeSong('prev');
      break;
    case playButton:
      playPauseSong();
      break;
    case nextButton:
      changeSong('next');
      break;
    case heartButton:
      changeButtonActive(
        heartButton,
        heartButton.classList.contains('button-active') ? 'remove' : 'add'
      );
      editLikedSongs();
      break;
    default:
      console.log('None of the control buttons have been clicked');
      break;
  }
};

/********Used solely to check if the user is using edge which is an edge-case for the Speech Recognition */
/*
https://stackoverflow.com/questions/66000711/how-to-detect-if-webkitspeechrecognition-actually-works-in-a-browser

*/
function isEdge(userAgent = navigator.userAgent.toLowerCase()) {
  if (userAgent.indexOf('chrome') !== -1 && userAgent.indexOf('edg') !== -1) {
    return true;
  }
  return false;
}

//On page load
const initPage = () => {
  //Load up the first song from the queue
  changeAudioSource(songQueue[0]);
  changeSongInfoText(songQueue[0]);
  currentSong = songQueue[0];

  //Connect the Music Service
  //Setup event listeners to the buttons

  document
    .querySelector('div.controls')
    .addEventListener('click', (e) => handleControlElementClick(e));

  //Audio player events
  audioPlayer.addEventListener('timeupdate', updatePlayBar);

  audioPlayer.addEventListener('ended', handleSongEnd);
  //Speak button event listener
  speakButton.addEventListener('click', (e) => {
    if (!recognition || (recognition && isEdge())) {
      changeMsgText(
        'This feature is only supported in the chrome browser',
        'warning'
      );
      return;
    }
    return speakButton.classList.contains('button-active')
      ? stopListening(e)
      : startListening(e);
  });

  //Add event listeners to the song playback
  playingBar.addEventListener('mousedown', () => (mouseDown = true));
  playingBar.addEventListener('mouseup', () => (mouseDown = false));
  playingBar.addEventListener('mousemove', () => mouseDown && changeSongTime);
  playingBar.addEventListener('click', changeSongTime);

  //Previous play and next button should have the same event listener
  //repeat activates a boolean value
};
initPage();
