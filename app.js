const firebaseConfig = {
    apiKey: "AIzaSyBIT8Yvb0rblzxL-5uMre04on0MkUxSxbo",
    authDomain: "banded-splicer-381114.firebaseapp.com",
    databaseURL: "https://banded-splicer-381114-default-rtdb.firebaseio.com",
    projectId: "banded-splicer-381114",
    storageBucket: "banded-splicer-381114.firebasestorage.app",
    messagingSenderId: "1094034826066",
    appId: "1:1094034826066:web:85597ac00127422631108b"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const rtcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] };
const myId = Math.random().toString(36).substring(7);

let selectedBitrateKbps = 6000;
let selectedCodec = 'VP8';

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
}

function toggleMenu(e, menuId) {
    e.stopPropagation();
    document.querySelectorAll('.custom-menu, .audio-dropdown').forEach(m => {
        if(m.id !== menuId) m.classList.remove('show');
    });
    document.getElementById(menuId).classList.toggle('show');
}

function selectBitrate(bps, labelText) {
    selectedBitrateKbps = bps;
    document.getElementById('selected-bitrate-label').innerText = labelText;
    document.getElementById('bitrate-menu').classList.remove('show');
}

function selectCodec(codec, labelText) {
    selectedCodec = codec;
    document.getElementById('selected-codec-label').innerText = labelText;
    document.getElementById('codec-menu').classList.remove('show');
}

function toggleAudioMenu(e) {
    e.stopPropagation();
    document.querySelectorAll('.custom-menu').forEach(m => m.classList.remove('show'));
    const dropdown = document.getElementById('audio-dropdown');
    dropdown.classList.toggle('show');
}

window.addEventListener('click', () => {
    document.querySelectorAll('.custom-menu, .audio-dropdown').forEach(m => m.classList.remove('show'));
});

function handleDownload() {
    window.open('https://github.com/wanderlycan/screencasting/releases/download/v1.0.0/backseat-p2p.1.0.0.exe', '_blank');
}

let audioCtx;
function startLED(stream) {
    try {
        if (!stream || stream.getAudioTracks().length === 0) return;
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 32;
        const data = new Uint8Array(analyser.frequencyBinCount);
        const led = document.getElementById('audio-led');
        function pulse() {
            analyser.getByteFrequencyData(data);
            let vol = data.reduce((a,b) => a+b) / data.length;
            if (vol > 10) led.classList.add('led-active'); else led.classList.remove('led-active');
            requestAnimationFrame(pulse);
        }
        pulse();
    } catch(e) {}
}

function optimizeSDP(sdp, bitrateKbps, codecPreference) {
    let lines = sdp.split('\r\n');
    let lineIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('a=mid:video')) {
            lineIndex = i;
            break;
        }
    }
    
    if (lineIndex !== -1) {
        lines.splice(lineIndex + 1, 0, `b=AS:${bitrateKbps}`);
    }

    if (codecPreference && codecPreference !== 'VP8') {
        let codecRtpMapId = null;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('a=rtpmap:') && lines[i].toUpperCase().includes(codecPreference)) {
                let parts = lines[i].split(':');
                if (parts[1]) {
                    codecRtpMapId = parts[1].split(' ')[0];
                }
            }
        }

        if (codecRtpMapId) {
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].startsWith('m=video')) {
                    let parts = lines[i].split(' ');
                    let proto = parts[0];
                    let port = parts[1];
                    let transport = parts[2];
                    let formats = parts.slice(3);
                    
                    formats = formats.filter(f => f !== codecRtpMapId);
                    formats.unshift(codecRtpMapId);
                    
                    lines[i] = `${proto} ${port} ${transport} ${formats.join(' ')}`;
                    break;
                }
            }
        }
    }

    return lines.join('\r\n');
}

let localStream;
async function hostGame() {
    const name = document.getElementById('host-name').value || "Host";
    try {
        let maxRes = selectedBitrateKbps >= 25000 ? 3840 : (selectedBitrateKbps >= 12000 ? 2560 : 1920);
        if (typeof require !== 'undefined') {
            const { ipcRenderer } = require('electron');
            const sources = await ipcRenderer.invoke('get-sources');

            const picker = document.getElementById('source-picker');
            const grid = document.getElementById('source-grid');
            grid.innerHTML = '';
            picker.style.display = 'flex';

            sources.forEach(source => {
                if (source.name.includes("Backseat P2P")) return;
                const card = document.createElement('div');
                card.className = 'source-card';
                card.innerHTML = `<img src="${source.thumbnail}"><span>${source.name}</span>`;
                card.onclick = () => startCapture(source.id, name, maxRes);
                grid.appendChild(card);
            });
        } else {
            // Chamada atualizada com parâmetros forçados para inclusão de áudio do sistema/aba
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { 
                    width: { ideal: maxRes }, 
                    height: { ideal: maxRes === 3840 ? 2160 : (maxRes === 2560 ? 1440 : 1080) }, 
                    frameRate: { ideal: 60, max: 60 },
                    cursor: "always"
                },
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    systemAudio: "include"
                },
                selfBrowserSurface: "exclude",
                systemAudio: "include"
            });
            finalizeHost(stream, name);
        }
    } catch (e) { alert("Erro ao abrir: " + e.message); }
}

async function startCapture(sourceId, name, maxRes) {
    try {
        document.getElementById('source-picker').style.display = 'none';
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: { mandatory: { chromeMediaSource: 'desktop' } },
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: sourceId,
                    minWidth: 1280, maxWidth: maxRes, 
                    minHeight: 720, maxHeight: maxRes === 3840 ? 2160 : (maxRes === 2560 ? 1440 : 1080),
                    maxFrameRate: 60
                }
            }
        });
        finalizeHost(stream, name);
    } catch (e) { alert("Erro ao capturar: " + e.message); }
}

function finalizeHost(stream, name) {
    localStream = stream;
    document.getElementById('local-preview').srcObject = localStream;
    document.getElementById('local-preview').style.display = 'block';
    document.getElementById('btn-start').style.display = 'none';
    document.getElementById('btn-stop').style.display = 'block';
    startLED(localStream);
    
    const roomRef = db.ref('rooms/' + myId);
    roomRef.set({ name: name, id: myId });
    roomRef.onDisconnect().remove();

    const connectionsRef = roomRef.child('connections');
    connectionsRef.off();
    
    connectionsRef.on('value', snap => {
        const conns = snap.val();
        const count = conns ? Object.keys(conns).length : 0;
        document.getElementById('viewer-count').innerText = count;
        roomRef.update({ viewerCount: count });
    });

    connectionsRef.on('child_added', snap => {
        if (snap.val() && snap.val().request) {
            setupHostPeer(snap.key);
        }
    });

    setTimeout(() => {
        if(window.innerWidth < 768) {
            const sidebar = document.getElementById('sidebar');
            if(!sidebar.classList.contains('collapsed')) toggleSidebar();
        }
    }, 200);
}

async function setupHostPeer(viewerId) {
    const pc = new RTCPeerConnection(rtcConfig);
    const ref = db.ref(`rooms/${myId}/connections/${viewerId}`);
    
    if (localStream) {
        localStream.getTracks().forEach(t => {
            const sender = pc.addTrack(t, localStream);
            if (t.kind === 'video' && sender.getParameters) {
                try {
                    const parameters = sender.getParameters();
                    if (!parameters.encodings) parameters.encodings = [{}];
                    parameters.encodings[0].maxBitrate = selectedBitrateKbps * 1000;
                    parameters.encodings[0].networkPriority = "high";
                    parameters.encodings[0].scaleResolutionDownBy = 1.0;
                    sender.setParameters(parameters).catch(err => {});
                } catch (e) {}
            }
        });
    }

    pc.onicecandidate = e => { 
        if (e.candidate) ref.child('hostCandidates').push(e.candidate.toJSON()); 
    };

    try {
        let offer = await pc.createOffer();
        offer.sdp = optimizeSDP(offer.sdp, selectedBitrateKbps, selectedCodec);
        
        await pc.setLocalDescription(offer);
        await ref.update({ offer: { type: offer.type, sdp: offer.sdp } });

        ref.child('answer').on('value', async snap => {
            const answerVal = snap.val();
            if (answerVal && !pc.currentRemoteDescription) {
                await pc.setRemoteDescription(new RTCSessionDescription(answerVal));
            }
        });

        ref.child('viewerCandidates').on('child_added', snap => {
            const candidateVal = snap.val();
            if (candidateVal) {
                pc.addIceCandidate(new RTCIceCandidate(candidateVal)).catch(e => {});
            }
        });
    } catch(err) {
        console.error("Erro no setupHostPeer:", err);
    }
}

db.ref('rooms').on('value', snap => {
    const list = document.getElementById('server-list');
    list.innerHTML = "";
    const rooms = snap.val();
    if (!rooms) return;
    for (let id in rooms) {
        if (id === myId) continue;
        const div = document.createElement('div');
        div.className = "server-item";
        div.innerText = rooms[id].name;
        div.onclick = () => { 
            connect(id); 
            if(window.innerWidth < 768) toggleSidebar(); 
        };
        list.appendChild(div);
    }
});

async function connect(hostId) {
    const viewerId = Math.random().toString(36).substring(7);
    const pc = new RTCPeerConnection(rtcConfig);
    const ref = db.ref(`rooms/${hostId}/connections/${viewerId}`);

    db.ref(`rooms/${hostId}/viewerCount`).on('value', snap => {
        const count = snap.val() || 0;
        document.getElementById('viewer-count').innerText = count;
    });

    pc.ontrack = e => {
        const vid = document.getElementById('remote-video');
        vid.srcObject = e.streams[0];
        startLED(e.streams[0]);
        vid.play().catch(() => document.getElementById('click-overlay').style.display = 'flex');
    };

    pc.onicecandidate = e => { 
        if (e.candidate) ref.child('viewerCandidates').push(e.candidate.toJSON()); 
    };

    await ref.set({ request: true });
    ref.onDisconnect().remove();

    ref.child('offer').on('value', async snap => {
        const offerVal = snap.val();
        if (offerVal && !pc.currentRemoteDescription) {
            await pc.setRemoteDescription(new RTCSessionDescription(offerVal));
            let answer = await pc.createAnswer();
            answer.sdp = optimizeSDP(answer.sdp, selectedBitrateKbps, selectedCodec);
            await pc.setLocalDescription(answer);
            await ref.update({ answer: { type: answer.type, sdp: answer.sdp } });
        }
    });

    ref.child('hostCandidates').on('child_added', snap => {
        const candidateVal = snap.val();
        if (candidateVal) {
            pc.addIceCandidate(new RTCIceCandidate(candidateVal)).catch(e => {});
        }
    });
}

function unmuteVideo() { 
    if(audioCtx) audioCtx.resume(); 
    document.getElementById('remote-video').play(); 
    document.getElementById('click-overlay').style.display = 'none'; 
}
