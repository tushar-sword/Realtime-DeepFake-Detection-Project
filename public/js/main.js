const createUserBtn = document.getElementById('create-user');
const username = document.getElementById('username');
const allusersHtml = document.getElementById('allusers');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const endCallBtn = document.getElementById("end-call-btn");
const changeCameraBtn = document.getElementById("change-camera-btn");  
const Socket = io();

let localStream;
let caller = [];
let currentCamera = 0;  

const peerConnection = (function() {
    let peerConnection;

    const createPeerConnection = () => {
        const config = {
            iceServers: [
                {
                    urls: ['stun:stun.l.google.com:19302']
                }
            ]
        };
        peerConnection = new RTCPeerConnection(config);

        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        peerConnection.ontrack = function(event) {
            remoteVideo.srcObject = event.streams[0];

            // Start capturing frames once the remote stream starts
            startFrameCapture();
        };

        peerConnection.onicecandidate = function(event) {
            if (event.candidate) {
                Socket.emit('icecandidate', event.candidate);
            }
        };

        return peerConnection;
    };

    return {
        getInstance: () => {
            if (!peerConnection) {
                peerConnection = createPeerConnection();
            }
            return peerConnection;
        }
    };
})();

createUserBtn.addEventListener('click', (e) => {
    if (username.value !== '') {
        const usernameContainer = document.querySelector('.username-input');
        Socket.emit('join-user', username.value);
        usernameContainer.style.display = 'none';
    }
});

endCallBtn.addEventListener("click", (e) => {
    Socket.emit("call-ended", caller);
});

Socket.on('joined', allusers => {
    const createUsersHtml = () => {
        allusersHtml.innerHTML = '';
        for (const user in allusers) {
            const li = document.createElement('li');
            li.textContent = `${user} ${user == username.value ? '(You)' : ''}`;

            if (user != username.value) {
                const button = document.createElement('button');
                button.classList.add("call-btn");
                button.addEventListener('click', (e) => {
                    startCall(user);
                });
                const img = document.createElement('img');
                img.setAttribute('src', '/images/phone.png');
                img.setAttribute('width', 20);   

                button.appendChild(img);
                li.appendChild(button);
            }
            allusersHtml.appendChild(li);
        }
    };

    createUsersHtml();
});

Socket.on('offer', async({ from, to, offer }) => {
    const pc = peerConnection.getInstance();
    await pc.setRemoteDescription(offer);  

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    Socket.emit('answer', { from, to, answer: pc.localDescription });
    caller = [from, to];
});

Socket.on('answer', async({ from, to, answer }) => {
    const pc = peerConnection.getInstance();
    await pc.setRemoteDescription(answer);

    endCallBtn.style.display = 'block';
    Socket.emit("end-call", { from, to });
    caller = [from, to];
});

Socket.on('icecandidate', async(candidate) => {
    const pc = peerConnection.getInstance();
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
});

Socket.on('end-call', ({ from, to }) => {
    endCallBtn.style.display = 'block';
});

Socket.on('call-ended', (caller) => {
    endCall();
});

const startCall = async(user) => {
    const pc = peerConnection.getInstance();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    Socket.emit("offer", { from: username.value, to: user, offer: pc.localDescription });
};

const endCall = () => {
    const pc = peerConnection.getInstance();
    if (pc) {
        pc.close();
        endCallBtn.style.display = 'none';
    }
};

const startMyVideo = async() => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStream = stream;
        localVideo.srcObject = stream;

        changeCameraBtn.addEventListener("click", changeCamera);
    } catch (error) {
        console.error('Error accessing webcam:', error);
    }
};

const changeCamera = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    if (videoDevices.length > 1) {
        currentCamera = (currentCamera + 1) % videoDevices.length;
        const newStream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: videoDevices[currentCamera].deviceId },
            audio: true
        });

        const tracks = localStream.getTracks();
        tracks.forEach(track => track.stop());
        localStream = newStream;
        localVideo.srcObject = newStream;
    }
};

/* === Frame Capture and API Call === */
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

const startFrameCapture = () => {
    setInterval(() => {
        if (remoteVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            canvas.width = remoteVideo.videoWidth;
            canvas.height = remoteVideo.videoHeight;
            ctx.drawImage(remoteVideo, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                sendFrameToServer(blob);
            }, "image/jpeg");
        }
    }, 1000);  // Capture every 1000ms (1 second)
};

const sendFrameToServer = async (frameBlob) => {
    const reader = new FileReader();
    reader.readAsDataURL(frameBlob);
    reader.onloadend = async () => {
        const base64data = reader.result.split(',')[1];  // Get base64 part of the data URL

        console.log("Sending frame to server:", base64data.slice(0, 30) + "...");  // Log part of the payload

        try {
            const response = await fetch("http://localhost:5000/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ data: base64data }),
            });

            if (!response.ok) {
                console.error("Error response from server:", response.status, response.statusText);
            } else {
                const result = await response.json();
                console.log("Frame prediction:", result.prediction);
                if (result.prediction === 1) {
                    console.log("DeepFake detected!");
                }
            }
        } catch (error) {
            console.error("Error sending frame:", error);
        }
    };
};

startMyVideo();