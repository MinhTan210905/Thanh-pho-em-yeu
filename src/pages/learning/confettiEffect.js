import confetti from "canvas-confetti";

// Play a pop/burst sound for confetti
export function playVictorySound(type = 1) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    function playTone(time, freq, typeStr, dur, vol = 0.5) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = typeStr;
      
      osc.frequency.setValueAtTime(freq, time);
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(vol, time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + dur);
    }
    
    function playPop(time, freq, dur) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(40, time + dur);
      
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.8, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + dur);
    }

    const t = ctx.currentTime;
    
    if (type === 1) {
      // Standard burst: crisp pops
      playPop(t, 1200, 0.15);
      playPop(t + 0.08, 1500, 0.15);
      playPop(t + 0.15, 900, 0.2);
      playPop(t + 0.2, 1800, 0.25);
      playPop(t + 0.3, 2000, 0.2);
    } else if (type === 2) {
      // Magic shimmer with more impact
      playTone(t, 880, 'sine', 0.2, 0.4);
      playTone(t + 0.1, 1108, 'sine', 0.2, 0.4);
      playTone(t + 0.2, 1318, 'sine', 0.4, 0.5);
      playTone(t + 0.35, 1760, 'sine', 0.6, 0.6);
      playTone(t + 0.45, 2217, 'sine', 0.8, 0.6); // Extra high sparkle
    } else {
      // Grand fanfare with deep impact
      playTone(t, 523, 'triangle', 0.2, 0.6); // C5
      playTone(t + 0.15, 659, 'triangle', 0.2, 0.6); // E5
      playTone(t + 0.3, 783, 'triangle', 0.2, 0.6); // G5
      playTone(t + 0.45, 1046, 'sawtooth', 0.6, 0.8); // C6 with more buzz
      // Add a booming bass note
      playTone(t, 130, 'square', 0.8, 0.5); 
    }

  } catch (e) {
    console.warn("AudioContext init failed", e);
  }
}

// Fire a celebration confetti burst
export function fireConfetti(type = 1) {
  playVictorySound(type);
  
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 3000 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  if (type === 1) {
    // Standard burst: Many particles from bottom corners, ribbon-like
    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 60 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'],
        shapes: ['square', 'circle']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'],
        shapes: ['square', 'circle']
      });
    }, 200);
  } else if (type === 2) {
    // Magic Star burst + lots of particles
    confetti({
      ...defaults,
      particleCount: 200,
      spread: 160,
      startVelocity: 60,
      origin: { y: 0.6 },
      colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA6C', '#FDFFB8'],
      shapes: ['star']
    });
    // Secondary burst of tiny sparkles
    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: 150,
        spread: 360,
        startVelocity: 30,
        origin: { y: 0.6 },
        colors: ['#ffffff', '#FFE400'],
        shapes: ['circle'],
        scalar: 0.5
      });
    }, 150);
  } else {
    // Ribbon blast: massive explosion from bottom center
    confetti({
      ...defaults,
      particleCount: 250,
      spread: 120,
      startVelocity: 80,
      origin: { y: 1 },
      colors: ['#0ea5e9', '#38bdf8', '#fbbf24', '#f59e0b', '#ef4444', '#10b981'],
      shapes: ['square'] // Squares look like ribbons when they spin
    });
    // Follow up cascades
    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: 200,
        spread: 140,
        startVelocity: 60,
        origin: { y: 0.8 },
        colors: ['#22c55e', '#a855f7', '#ec4899', '#f43f5e'],
        shapes: ['circle']
      });
    }, 250);
    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: 150,
        spread: 180,
        startVelocity: 50,
        origin: { y: 0.6 },
        colors: ['#ffffff', '#fcd34d'],
        shapes: ['star'],
        scalar: 1.2
      });
    }, 450);
  }
}
