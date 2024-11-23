const canvas = document.getElementById('snowflakesCanvas');
const ctx = canvas.getContext('2d');
const snowflakes = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function createSnowflake() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 4 + 1,
        speed: Math.random() * 1 + 0.5,
        wind: Math.random() * 2 - 1,
        changeSpeed: Math.random() * 0.02
    };
}

function updateSnowflakes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const snowflakeColor = document.body.classList.contains('light-mode') ? 'black' : 'white';
    for (let i = 0; i < snowflakes.length; i++) {
        const flake = snowflakes[i];
        flake.y += flake.speed;
        flake.x += flake.wind;

        if (Math.random() < 0.01) {
            flake.speed += flake.changeSpeed * (Math.random() < 0.5 ? -1 : 1);
            flake.speed = Math.max(0.5, Math.min(flake.speed, 2));
        }

        if (flake.y > canvas.height) {
            flake.y = 0;
            flake.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fillStyle = snowflakeColor;
        ctx.fill();
    }
}

function animateSnowflakes() {
    updateSnowflakes();
    requestAnimationFrame(animateSnowflakes);
}

function initSnowflakes() {
    resizeCanvas();
    for (let i = 0; i < 100; i++) {
        snowflakes.push(createSnowflake());
    }
    animateSnowflakes();
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', initSnowflakes);