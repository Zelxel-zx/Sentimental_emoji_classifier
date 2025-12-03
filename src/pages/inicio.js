// Canvas Stars - Forma de cerebro de perfil
const canvas = document.getElementById('starCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stars = [];
let particlesGlowing = false;

// Generar estrellas en forma de cerebro de perfil
function generateBrainStars() {
    stars = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) / 2.5;

    // Patrón de cerebro de perfil (vista lateral)
    const brainPoints = [
        // Frente del cerebro
        { x: 0.3, y: -0.3 }, { x: 0.4, y: -0.4 }, { x: 0.5, y: -0.45 },
        // Parte superior frontal
        { x: 0.2, y: -0.25 }, { x: 0.15, y: -0.35 },
        // Lóbulo frontal superior
        { x: 0.35, y: -0.5 }, { x: 0.45, y: -0.55 }, { x: 0.55, y: -0.5 },
        // Coronilla
        { x: 0.5, y: -0.65 }, { x: 0.6, y: -0.55 },
        // Parte posterior superior
        { x: 0.7, y: -0.4 }, { x: 0.75, y: -0.35 }, { x: 0.8, y: -0.25 },
        // Lóbulo parietal
        { x: 0.65, y: -0.2 }, { x: 0.6, y: 0 }, { x: 0.7, y: 0.1 },
        // Lóbulo temporal
        { x: 0.45, y: 0.25 }, { x: 0.5, y: 0.3 }, { x: 0.55, y: 0.25 },
        // Parte inferior/Cerebelo
        { x: 0.35, y: 0.4 }, { x: 0.3, y: 0.35 }, { x: 0.25, y: 0.3 },
        // Frente inferior
        { x: 0.15, y: 0.2 }, { x: 0.1, y: 0.1 }, { x: 0.05, y: 0 },
        // Lado izquierdo medio
        { x: 0, y: -0.1 }, { x: -0.05, y: -0.2 }, { x: -0.1, y: -0.3 },
        // Lado izquierdo superior
        { x: -0.05, y: -0.4 }, { x: 0.05, y: -0.5 }, { x: 0.15, y: -0.55 },
        // Curva posterior izquierda
        { x: 0.25, y: -0.6 }, { x: 0.35, y: -0.65 },
        // Más detalles internos
        { x: 0.2, y: -0.1 }, { x: 0.25, y: 0.05 }, { x: 0.15, y: 0.05 },
        { x: 0.4, y: 0.1 }, { x: 0.35, y: 0 }, { x: 0.3, y: -0.05 },
    ];

    brainPoints.forEach(point => {
        const x = centerX + point.x * scale;
        const y = centerY + point.y * scale;
        const radius = Math.random() * 1.5 + 1;
        const brightness = Math.random() * 0.5 + 0.5;

        stars.push({
            x: x,
            y: y,
            radius: radius,
            opacity: brightness,
            originalOpacity: brightness,
            vx: (Math.random() - 0.5) * 0.1,
            vy: (Math.random() - 0.5) * 0.1,
            twinkleSpeed: Math.random() * 0.02 + 0.01
        });
    });
}

function drawStars() {
    stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect
        ctx.strokeStyle = `rgba(219, 112, 214, ${star.opacity * 0.5})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius + 2, 0, Math.PI * 2);
        ctx.stroke();
    });
}

function animateStars() {
    // Parpadeo normal
    stars.forEach(star => {
        if (!particlesGlowing) {
            star.opacity += (Math.random() - 0.5) * star.twinkleSpeed;
            star.opacity = Math.max(star.originalOpacity * 0.3, Math.min(star.originalOpacity, star.opacity));
        }
    });
}

function intensifyGlow() {
    stars.forEach(star => {
        star.opacity = Math.min(1, star.opacity + 0.02);
    });
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    animateStars();
    drawStars();
    
    requestAnimationFrame(animate);
}

generateBrainStars();
animate();

// Manejo del botón
const startBtn = document.getElementById('startBtn');

startBtn.addEventListener('click', async () => {
    particlesGlowing = true;
    startBtn.classList.add('button-fade-out');
    
    // Intensificar el brillo de las estrellas
    let glowIntensity = 0;
    const glowInterval = setInterval(() => {
        glowIntensity += 0.05;
        intensifyGlow();
        
        if (glowIntensity >= 1) {
            clearInterval(glowInterval);
            // Después de 1 segundo, redirigir
            setTimeout(() => {
                window.location.href = './index.html';
            }, 500);
        }
    }, 30);
});

// Responsive canvas
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    generateBrainStars();
});
