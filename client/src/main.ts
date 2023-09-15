import './style.scss'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div id="captcha-container">
        <div id="slider-bar">
            <img src=""  alt="back"/>
            <div id="slider"><img src="" alt="slider" /></div>
            <div id="slider-status"></div>
        </div>
        
        <div id="slider-navigation">
            <input type="range" min="0" max="500" value="0" class="slider" disabled>
        </div>
    </div>
`

const slider = document.querySelector('#slider') as HTMLElement;
const sliderBar = document.querySelector('#slider-bar') as HTMLElement;
const sliderStatus = document.querySelector('#slider-status') as HTMLElement;
const input = document.querySelector('#slider-navigation input') as HTMLInputElement;

function arrayBufferToBase64(buffer: number[]) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

async function check(captchaId: string, value: string) {
    const checkResp = await fetch('http://localhost:3000/captcha', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            captchaId,
            value,
        })
    });

    const resp = await checkResp.json();

    if (resp.success) {
        sliderStatus.innerText = 'Success';
        sliderStatus.style.backgroundColor = '#0080003d';
        sliderStatus.style.opacity = '1';
    } else {
        sliderStatus.innerText = 'Failed';
        sliderStatus.style.backgroundColor = '#ff00003d';
        sliderStatus.style.opacity = '1';
    }
}


let path = [0];

input.addEventListener('input', (_) => {
    const value = parseInt(input.value, 10);
    const pos = Math.round((value - 97.5) / 1.5);
    if (pos !== path[path.length - 1]) {
        path.push(pos);
    }
    slider.style.left = value + 'px';
});

document.addEventListener('DOMContentLoaded', async () => {
    const {captchaId, back, puzzle} = await fetch('http://localhost:3000/captcha').then(res => res.json());

    let path = [0];

    sliderBar.querySelector('img')!.src = back;
    slider.querySelector('img')!.src = puzzle;
    input.disabled = false;

    input.addEventListener('change', async (_) => {
        input.disabled = true;
        const value = parseInt(input.value, 10);
        path.push(Math.round((value - 97.5) / 1.5));
        await check(captchaId, arrayBufferToBase64(path));
        path = []
    })
});
