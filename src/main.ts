import { io, Socket } from "socket.io-client";
import Peer, { type MediaConnection } from "peerjs";

type ServerToClientEvents = {
    'user-connected': (userId: string) => void;
    'user-disconnected': (userId: string) => void;
};

type ClientToServerEvents = {
    'join-room': (roomId: string, userId: string) => void;
};

type GetUserParams = {
    'id': string;
}

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io("http://localhost:3000");
const videoGrid = document.getElementById('video-grid') as HTMLElement;
const peer = new Peer();

const myVideo = document.createElement('video');
myVideo.muted = true;
let audioEnabled = true;
let videoEnabled = true;
let stream: MediaStream;

document.getElementById("toggle-audio")?.addEventListener("click", toggleAudio);
document.getElementById("toggle-video")?.addEventListener("click", toggleVideo);


navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(mediaStream => {
    stream = mediaStream;
    addVideoStream(myVideo, stream);

    peer.on('open', id => {
        socket.emit('join-room', getSearchParameters().id, id);
        console.log(id)
    });

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
    });

    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
    });

    socket.on('user-disconnected', userId => {
        if (peers[userId]) peers[userId].close();
    });
}).catch(error => {
    console.error('Error accessing media devices.', error);
});

const peers: { [key: string]: MediaConnection } = {};

function connectToNewUser(userId: string, stream: MediaStream) {
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });
    call.on('close', () => {
        video.remove();
    });

    peers[userId] = call;
}

function addVideoStream(video: HTMLVideoElement, stream: MediaStream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}

function toggleAudio() {
    if (stream) {
        stream.getAudioTracks().forEach(track => {
            track.enabled = !track.enabled;
            audioEnabled = track.enabled;
        });

        const button = document.getElementById("toggle-audio");
        if (button) {
            button.innerHTML = !audioEnabled ? `<i class="fa-solid fa-microphone fa-xl"></i>` : `<i class="fa-solid fa-microphone-slash fa-xl"></i>`;
        }
    }
}

function toggleVideo() {
    if (stream) {
        stream.getVideoTracks().forEach(track => {
            track.enabled = !track.enabled;
            videoEnabled = track.enabled;
        });

        const button = document.getElementById("toggle-video");
        if (button) {
            button.innerHTML = !videoEnabled ? `<i class="fa-solid fa-video fa-xl"></i>` : `<i class="fa-solid fa-video-slash fa-xl"></i>`;
        }
    }
}

function getSearchParameters(): GetUserParams {
    const prmstr = window.location.search.substr(1);
    return transformToAssocArray(prmstr) as GetUserParams;
}

function transformToAssocArray(prmstr) {
    const params = {};
    const prmarr = prmstr.split("&");
    for (let i = 0; i < prmarr.length; i++) {
        const tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
    }
    return params;
}

document.getElementById("screen-share-btn")?.addEventListener("click", () => {
    navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
    }).then(screenStream => {
        const screenVideo = document.createElement('video');
        addVideoStream(screenVideo, screenStream);
    })
})