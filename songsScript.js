const songsButtons = Array.from(
  document.querySelectorAll('section.card button')
);

const onSongClick = (e) => {
  console.log(e.target.textContent);
  console.log(location.protocol + '//' + window.location.host);
  //Get the text content from the song and save it as sessionstorage
  console.log(e.target.textContent.split(' ').join('_'));
  sessionStorage.setItem(
    'songToPlay',
    e.target.textContent.split(' ').join('_') + '.mp3'
  );

  //Redirect to home page
  window.location.href = `${window.location.protocol}//${window.location.host}`;
};

songsButtons.forEach((button) => {
  button.onclick = onSongClick;
});
