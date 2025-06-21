export const music = {
    track: [
        { src: 'music/lofy1.mp3' },
        { src: 'music/lofy2.mp3' },
        { src: 'music/lofy3.mp3' },
        { src: 'music/lofy4.mp3' },
        { src: 'music/lofy5.mp3' },
    ],
    currentTrack: null,
    bgMusic: null,
};

function randomTrack() {


    const randomIndex = Math.floor(Math.random() * music.track.length);
    music.currentTrack = music.track[randomIndex];

    music.bgMusic = new Howl({
        src: [music.currentTrack.src],
        loop: false,
        volume: 0.8,
        preload: true,
        onend: () => {
            randomTrack();
            console.log('load', music.currentTrack.src);
        }
    });
    music.bgMusic.play();
}


export const sounds = {
    clickSound: new Howl({
        src: ['sounds/click1.wav'],
        volume: 0.3,
        preload: true,
    }),
    soundButtonCLick : new Howl({
        src: ['sounds/click3.mp3'],
        volume: 0.3,
        preload: true,
    })
};






const sound_button = document.querySelector('.sound_icon');
sound_button.addEventListener('click', () => {
    unlockAudio();
    if (sound_button.classList.contains('activate')) {
        sound_button.src = "img/free-icon-no-sound-2359180.png";
        sound_button.classList.remove("activate");
        music.bgMusic.pause();
    } else {
        sound_button.src = "img/free-icon-sound-4225616.png";
        sound_button.classList.add("activate");
        // setTimeout(() => {randomTrack();}, 1000);
        randomTrack();
    }
    sounds.soundButtonCLick.play();

});

const clock = document.querySelector(".timer-container");
clock.addEventListener('click', () => {
    sounds.clickSound.play();
});



function unlockAudio() {
    const context = Howler.ctx; // Получаем AudioContext Howler.js
    if (context && context.state === 'suspended') {
        context.resume().then(() => {
            console.log('AudioContext разблокирован!');
        });
    }
}