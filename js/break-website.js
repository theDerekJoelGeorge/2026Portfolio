// Break Website - Simple falling animation
(function() {
  const breakBtn = document.getElementById('breakWebsiteBtn');
  const overlay = document.getElementById('breakOverlay');
  const screen1 = document.getElementById('breakScreen1');
  const screen2 = document.getElementById('breakScreen2');
  const screen3 = document.getElementById('breakScreen3');
  const yesBtn = document.getElementById('breakYesBtn');
  const noBtn = document.getElementById('breakNoBtn');
  const hardBtn = document.getElementById('breakHardBtn');
  const easyBtn = document.getElementById('breakEasyBtn');
  const userChoiceSpan = document.getElementById('userChoice');
  const pongCanvas = document.getElementById('pongCanvas');
  const pongInstructions = document.getElementById('pongInstructions');
  const pongStartBtn = document.getElementById('pongStartBtn');
  const pongGameEnd = document.getElementById('pongGameEnd');
  const gameEndTitle = document.getElementById('gameEndTitle');
  const gameEndSubtitle = document.getElementById('gameEndSubtitle');
  const gameEndBtn = document.getElementById('gameEndBtn');
  
  if (!breakBtn || !overlay) return;
  
  let isBroken = false;
  let fallingElements = [];
  let pongGame = null;
  
  // Elements to apply gravity to
  const getTargetElements = () => {
    return [
      ...document.querySelectorAll('.home-hero, .home-intro, .home-subheading, .social-icons-row, .home-divider, .home-divider-caption'),
      ...document.querySelectorAll('.sidebar .logo, .sidebar .navigation, .sidebar-footer'),
      ...document.querySelectorAll('.mobile-header, .mobile-nav'),
      document.getElementById('sidebarBg')
    ].filter(Boolean);
  };
  
  const showScreen = (screenNum) => {
    screen1.classList.remove('active');
    screen2.classList.remove('active');
    screen3.classList.remove('active');
    if (screenNum === 1) screen1.classList.add('active');
    if (screenNum === 2) screen2.classList.add('active');
    if (screenNum === 3) {
      screen3.classList.add('active');
      // Show instructions, hide canvas and game end
      if (pongInstructions) pongInstructions.style.display = '';
      if (pongCanvas) pongCanvas.classList.remove('active');
      if (pongGameEnd) pongGameEnd.style.display = 'none';
    }
  };
  
  // Show game end screen with win/lose state
  const showGameEndScreen = (didWin) => {
    if (pongGameEnd) pongGameEnd.style.display = 'flex';
    
    if (didWin) {
      // Player won
      if (gameEndTitle) gameEndTitle.textContent = 'Congratulations!';
      if (gameEndSubtitle) gameEndSubtitle.textContent = 'You beat the AI';
      if (gameEndBtn) {
        gameEndBtn.textContent = 'Rebuild Website';
        gameEndBtn.classList.remove('pong-game-end__btn--retry');
      }
      createConfetti();
    } else {
      // Player lost
      if (gameEndTitle) gameEndTitle.textContent = 'Game Over';
      if (gameEndSubtitle) gameEndSubtitle.textContent = 'The AI won this round';
      if (gameEndBtn) {
        gameEndBtn.textContent = 'Try Again';
        gameEndBtn.classList.add('pong-game-end__btn--retry');
      }
    }
  };
  
  // Confetti burst animation
  const createConfetti = () => {
    const container = document.getElementById('confettiContainer');
    if (!container) return;
    
    // Clear any existing confetti
    container.innerHTML = '';
    
    const colors = ['#ffd700', '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#1dd1a1'];
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      
      // Random color
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      
      // Random size
      const size = 6 + Math.random() * 6;
      confetti.style.width = size + 'px';
      confetti.style.height = size + 'px';
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      
      // Start from center
      confetti.style.left = '50%';
      confetti.style.top = '80px';
      
      // Random burst direction (upward and outward)
      const angle = (Math.random() * 120 + 30) * (Math.PI / 180); // 30-150 degrees (upward arc)
      const velocity = 60 + Math.random() * 80;
      const spreadX = Math.cos(angle) * velocity * (Math.random() > 0.5 ? 1 : -1);
      const spreadY = -Math.sin(angle) * velocity;
      
      confetti.style.setProperty('--x', spreadX + 'px');
      confetti.style.setProperty('--y', spreadY + 'px');
      
      // Random animation timing
      const delay = Math.random() * 0.15;
      const duration = 1.5 + Math.random() * 1;
      confetti.style.animation = `confetti-burst ${duration}s ease-out ${delay}s forwards`;
      
      container.appendChild(confetti);
    }
  };
  
  
  const breakWebsite = () => {
    if (isBroken) return;
    isBroken = true;
    
    // Hide the break button
    breakBtn.style.display = 'none';
    
    // Make sidebar background transparent and hide scrollbar
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.add('site-broken');
    document.body.classList.add('site-broken');
    document.documentElement.classList.add('site-broken');
    
    // Get all elements to fall
    fallingElements = getTargetElements();
    
    // Apply gravity animation to each element with staggered delays
    fallingElements.forEach((el, index) => {
      const rotation = (Math.random() - 0.5) * 60;
      el.style.setProperty('--fall-rotation', `${rotation}deg`);
      
      setTimeout(() => {
        el.classList.add('gravity-fall');
      }, index * 80);
    });
    
    // Show overlay after elements fall
    setTimeout(() => {
      overlay.classList.add('active');
      showScreen(1);
    }, fallingElements.length * 80 + 2000);
  };
  
  const goToScreen2 = (choice) => {
    // Update the text based on user's choice
    if (userChoiceSpan) {
      userChoiceSpan.textContent = choice;
    }
    showScreen(2);
  };
  
  // Pong Game Implementation
  const startPongGame = () => {
    if (!pongCanvas) return;
    
    const ctx = pongCanvas.getContext('2d');
    const W = pongCanvas.width;
    const H = pongCanvas.height;
    
    // Game state
    let playerScore = 0;
    let aiScore = 0;
    const winScore = 3;
    let countdownValue = 3;
    let ballPaused = false;
    let ballHasBeenHit = false;
    
    // Flash feedback state
    let flashColor = null;
    let flashOpacity = 0;
    
    // Paddle properties
    const paddleW = 60;
    const paddleH = 10;
    let playerX = W / 2 - paddleW / 2;
    let aiX = W / 2 - paddleW / 2;
    const paddleSpeed = 8;
    
    // Ball properties
    let ballX = W / 2;
    let ballY = H / 2;
    let ballRadius = 8;
    let ballSpeedX = 0;
    let ballSpeedY = 0;
    
    // Input handling
    let usingKeyboard = false;
    
    // Mouse tracking on entire document (works even outside canvas)
    const handleMouseMove = (e) => {
      usingKeyboard = false; // Switch back to mouse when mouse moves
      const rect = pongCanvas.getBoundingClientRect();
      const newMouseX = e.clientX - rect.left;
      // Update paddle position directly for mouse
      playerX = newMouseX - paddleW / 2;
      playerX = Math.max(0, Math.min(W - paddleW, playerX));
    };
    
    // Touch handling for mobile
    const handleTouchMove = (e) => {
      usingKeyboard = false;
      const rect = pongCanvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      playerX = touchX - paddleW / 2;
      playerX = Math.max(0, Math.min(W - paddleW, playerX));
    };
    
    const handleTouchStart = (e) => {
      usingKeyboard = false;
      const rect = pongCanvas.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;
      playerX = touchX - paddleW / 2;
      playerX = Math.max(0, Math.min(W - paddleW, playerX));
    };
    
    // Track mouse on entire document for desktop
    document.addEventListener('mousemove', handleMouseMove);
    
    // Touch events on canvas for mobile
    pongCanvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    pongCanvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    
    // Keyboard controls for accessibility (arrow keys only)
    let keysPressed = { left: false, right: false };
    
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        keysPressed.left = true;
        usingKeyboard = true;
        e.preventDefault();
      }
      if (e.key === 'ArrowRight') {
        keysPressed.right = true;
        usingKeyboard = true;
        e.preventDefault();
      }
    };
    
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft') {
        keysPressed.left = false;
      }
      if (e.key === 'ArrowRight') {
        keysPressed.right = false;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Flash the board with a color
    const flashBoard = (color) => {
      flashColor = color;
      flashOpacity = 0.6;
    };
    
    // Reset ball position and pause for countdown
    const resetBall = (withCountdown = false) => {
      ballX = W / 2;
      ballY = H / 2;
      ballSpeedX = 0;
      ballSpeedY = 0;
      ballHasBeenHit = false; // Reset hit state for new serve
      
      if (withCountdown) {
        ballPaused = true;
        countdownValue = 3;
        
        const countdownInterval = setInterval(() => {
          countdownValue--;
          if (countdownValue <= 0) {
            clearInterval(countdownInterval);
            ballPaused = false;
            // Ball starts slow on every serve
            ballSpeedX = 2 * (Math.random() > 0.5 ? 1 : -1);
            ballSpeedY = 2 * (playerScore > aiScore ? 1 : -1);
          }
        }, 700);
      }
    };
    
    // Game loop
    let animationId;
    
    const update = () => {
      // Update player paddle with keyboard (mouse/touch handled in their event handlers)
      if (usingKeyboard) {
        if (keysPressed.left) {
          playerX -= paddleSpeed;
        }
        if (keysPressed.right) {
          playerX += paddleSpeed;
        }
        playerX = Math.max(0, Math.min(W - paddleW, playerX));
      }
      
      // Don't update ball or AI if paused
      if (ballPaused) return;
      
      // Update AI paddle (follows ball with delay - easy difficulty)
      const aiCenter = aiX + paddleW / 2;
      if (ballSpeedY < 0) { // Ball coming toward AI
        // Only move 60% of the time (makes AI miss sometimes)
        if (Math.random() > 0.4) {
          if (aiCenter < ballX - 30) aiX += paddleSpeed * 0.35;
          else if (aiCenter > ballX + 30) aiX -= paddleSpeed * 0.35;
        }
      }
      aiX = Math.max(0, Math.min(W - paddleW, aiX));
      
      // Update ball
      ballX += ballSpeedX;
      ballY += ballSpeedY;
      
      // Wall collision (left/right)
      if (ballX - ballRadius < 0 || ballX + ballRadius > W) {
        ballSpeedX = -ballSpeedX;
        ballX = Math.max(ballRadius, Math.min(W - ballRadius, ballX));
      }
      
      // Player paddle collision (bottom)
      if (ballY + ballRadius > H - paddleH - 10 && 
          ballX > playerX && ballX < playerX + paddleW &&
          ballSpeedY > 0) {
        // Speed up ball on first hit after serve
        if (!ballHasBeenHit) {
          ballHasBeenHit = true;
          ballSpeedY = -3; // Faster speed after hit
        } else {
          ballSpeedY = -ballSpeedY;
        }
        // Add angle based on where ball hits paddle
        const hitPos = (ballX - playerX) / paddleW;
        ballSpeedX = (hitPos - 0.5) * 6;
      }
      
      // AI paddle collision (top)
      if (ballY - ballRadius < paddleH + 10 && 
          ballX > aiX && ballX < aiX + paddleW &&
          ballSpeedY < 0) {
        // Speed up ball on first hit after serve
        if (!ballHasBeenHit) {
          ballHasBeenHit = true;
          ballSpeedY = 3; // Faster speed after hit
        } else {
          ballSpeedY = -ballSpeedY;
        }
        const hitPos = (ballX - aiX) / paddleW;
        ballSpeedX = (hitPos - 0.5) * 6;
      }
      
      // Score
      if (ballY > H + ballRadius) {
        // AI scores (player loses point)
        aiScore++;
        flashBoard('#e74c3c'); // Red flash
        ballPaused = true; // Pause immediately
        if (aiScore >= winScore) {
          // AI wins - show game over screen
          setTimeout(() => {
            stopPongGame();
            resetButtons();
            showGameEndScreen(false);
          }, 1200);
          return;
        }
        // Delay before resetting
        setTimeout(() => {
          resetBall(true);
        }, 800);
      } else if (ballY < -ballRadius) {
        // Player scores
        playerScore++;
        flashBoard('#27ae60'); // Green flash
        ballPaused = true; // Pause immediately
        if (playerScore >= winScore) {
          // Player wins! Show congratulations screen
          setTimeout(() => {
            stopPongGame();
            resetButtons();
            showGameEndScreen(true);
          }, 1200);
          return;
        }
        // Delay before resetting
        setTimeout(() => {
          resetBall(true);
        }, 800);
      }
    };
    
    const draw = () => {
      // Clear canvas
      ctx.fillStyle = '#d9d9d9';
      ctx.fillRect(0, 0, W, H);
      
      // Draw flash overlay if active
      if (flashOpacity > 0) {
        ctx.save();
        ctx.globalAlpha = flashOpacity;
        ctx.fillStyle = flashColor;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
        
        // Fade out the flash (slow fade for visibility)
        flashOpacity -= 0.004;
        if (flashOpacity < 0) flashOpacity = 0;
      }
      
      // Draw center line (WCAG: 3:1 contrast for non-text)
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#888';
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw AI paddle (top) - high contrast #1a1a1a on #d9d9d9 = 10.5:1
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(aiX, 10, paddleW, paddleH);
      
      // Draw player paddle (bottom) - #2d5a1e on #d9d9d9 = 5.8:1 (WCAG AA)
      ctx.fillStyle = '#2d5a1e';
      ctx.fillRect(playerX, H - paddleH - 10, paddleW, paddleH);
      
      // Draw ball - high contrast
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#1a1a1a';
      ctx.fill();
      
      // Draw scores on right side
      ctx.font = 'bold 24px monospace';
      ctx.fillStyle = '#444';
      ctx.textAlign = 'right';
      // AI score at top-right
      ctx.fillText(aiScore, W - 12, 30);
      // Player score at bottom-right
      ctx.fillText(playerScore, W - 12, H - 12);
      
      // Draw countdown if paused (with background for clarity)
      if (ballPaused && countdownValue > 0) {
        // Semi-transparent background circle
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, 40, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
        
        // Countdown number - high contrast
        ctx.font = 'bold 48px monospace';
        ctx.fillStyle = '#1a1a1a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(countdownValue, W / 2, H / 2);
        ctx.textBaseline = 'alphabetic';
      }
      
      // Update ARIA live region for screen readers
      updateAriaStatus();
    };
    
    // ARIA status for screen readers
    let lastAnnouncedScore = { player: 0, ai: 0 };
    const updateAriaStatus = () => {
      if (playerScore !== lastAnnouncedScore.player || aiScore !== lastAnnouncedScore.ai) {
        pongCanvas.setAttribute('aria-label', 
          `Pong game. Your score: ${playerScore}. AI score: ${aiScore}. First to ${winScore} wins.`);
        lastAnnouncedScore = { player: playerScore, ai: aiScore };
      }
    };
    
    const gameLoop = () => {
      update();
      draw();
      animationId = requestAnimationFrame(gameLoop);
    };
    
    const stopPongGame = () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      document.removeEventListener('mousemove', handleMouseMove);
      pongCanvas.removeEventListener('touchmove', handleTouchMove);
      pongCanvas.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
    
    pongGame = { stop: stopPongGame };
    
    // Start with countdown
    resetBall(true);
    gameLoop();
  };
  
  const fixWebsite = () => {
    // Stop pong game if running
    if (pongGame) {
      pongGame.stop();
      pongGame = null;
    }
    
    // Hide overlay
    overlay.classList.remove('active');
    screen1.classList.remove('active');
    screen2.classList.remove('active');
    screen3.classList.remove('active');
    
    // Show the break button immediately and restore sidebar background
    breakBtn.style.display = '';
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.remove('site-broken');
    document.body.classList.remove('site-broken');
    document.documentElement.classList.remove('site-broken');
    
    // Reset all elements
    fallingElements.forEach((el, index) => {
      el.classList.remove('gravity-fall');
      el.style.transform = '';
      
      setTimeout(() => {
        el.classList.add('gravity-reset');
        
        setTimeout(() => {
          el.classList.remove('gravity-reset');
        }, 600);
      }, index * 30);
    });
    
    // Mark as not broken after animations complete
    setTimeout(() => {
      isBroken = false;
    }, fallingElements.length * 30 + 600);
  };
  
  // Track which button is which
  let easyIsLeft = true; // true = easy is left button, hard is right
  let swapCount = 0;
  const screen2Subtitle = screen2?.querySelector('.break-screen__subtitle');
  const breakHint = document.getElementById('breakHint');
  const breakTaunt = document.getElementById('breakTaunt');
  const easyBtnTooltip = easyBtn?.parentElement?.querySelector('.break-btn-tooltip');
  const hardBtnTooltip = hardBtn?.parentElement?.querySelector('.break-btn-tooltip');
  
  const swapButtons = () => {
    if (!easyBtn || !hardBtn) return;
    
    // Increment swap counter
    swapCount++;
    
    // Swap the labels and tooltips
    if (easyIsLeft) {
      // Easy was clicked, swap labels
      easyBtn.textContent = 'the hard way';
      easyBtn.style.backgroundColor = '#437036';
      if (easyBtnTooltip) easyBtnTooltip.textContent = 'are you sure?';
      hardBtn.textContent = 'the easy way';
      hardBtn.style.backgroundColor = '';
      if (hardBtnTooltip) hardBtnTooltip.textContent = "well, you're boring";
    } else {
      // Hard (now showing as easy) was clicked, swap back
      hardBtn.textContent = 'the hard way';
      hardBtn.style.backgroundColor = '#437036';
      if (hardBtnTooltip) hardBtnTooltip.textContent = 'are you sure?';
      easyBtn.textContent = 'the easy way';
      easyBtn.style.backgroundColor = '';
      if (easyBtnTooltip) easyBtnTooltip.textContent = "well, you're boring";
    }
    
    // Toggle which is which
    easyIsLeft = !easyIsLeft;
    
    // Change subtitle
    if (screen2Subtitle) {
      screen2Subtitle.textContent = 'are you happy with your choice ?';
    }
    
    // Show the hint
    if (breakHint) {
      breakHint.style.display = '';
    }
    
    // Show taunt after 3 swaps
    if (swapCount >= 3 && breakTaunt) {
      breakTaunt.style.display = '';
    }
    
    // Change taunt text after 6 swaps
    if (swapCount >= 6 && breakTaunt) {
      breakTaunt.textContent = "go on then, lets see how long you spend trying to select the easy way";
    }
    
    // Change taunt text after 12 swaps
    if (swapCount >= 12 && breakTaunt) {
      breakTaunt.textContent = "okay, you're very persistent. click on it once more to get the easy way";
    }
    
    // Change taunt text after 13 swaps - no more easy way!
    if (swapCount >= 13 && breakTaunt) {
      breakTaunt.textContent = "well sike, there is no easy way out";
      // Make both buttons say "the hard way"
      if (easyBtn) easyBtn.textContent = 'the hard way';
      if (hardBtn) hardBtn.textContent = 'the hard way';
    }
  };
  
  const resetButtons = () => {
    if (easyBtn) {
      easyBtn.textContent = 'the easy way';
      easyBtn.style.backgroundColor = '';
    }
    if (easyBtnTooltip) {
      easyBtnTooltip.textContent = "well, you're boring";
    }
    if (hardBtn) {
      hardBtn.textContent = 'the hard way';
      hardBtn.style.backgroundColor = '';
    }
    if (hardBtnTooltip) {
      hardBtnTooltip.textContent = 'are you sure?';
    }
    if (screen2Subtitle) {
      screen2Subtitle.textContent = "you've got 2 choices now to fix the website";
    }
    if (breakHint) {
      breakHint.style.display = 'none';
    }
    if (breakTaunt) {
      breakTaunt.style.display = 'none';
      breakTaunt.textContent = 'come on now, we all know that there is no easy way out here';
    }
    easyIsLeft = true;
    swapCount = 0;
  };
  
  // Event listeners
  breakBtn.addEventListener('click', breakWebsite);
  
  // Yes/No buttons go to screen 2 with their choice
  yesBtn?.addEventListener('click', () => goToScreen2('yes'));
  noBtn?.addEventListener('click', () => goToScreen2('no'));
  
  // Easy button swaps the buttons
  easyBtn?.addEventListener('click', () => {
    // After 13 swaps, both buttons say "the hard way" - go to pong
    if (swapCount >= 13) {
      showScreen(3);
      return;
    }
    
    if (easyIsLeft) {
      // User clicked the actual easy button - swap!
      swapButtons();
    } else {
      // User clicked what's now showing as "the hard way" - go to pong game
      showScreen(3);
    }
  });
  
  // Hard button
  hardBtn?.addEventListener('click', () => {
    // After 13 swaps, both buttons say "the hard way" - go to pong
    if (swapCount >= 13) {
      showScreen(3);
      return;
    }
    
    if (!easyIsLeft) {
      // User clicked the actual hard button (now showing as easy) - swap!
      swapButtons();
    } else {
      // User clicked what's showing as "the hard way" - go to pong game
      showScreen(3);
    }
  });
  
  // Pong start button
  pongStartBtn?.addEventListener('click', () => {
    // Hide instructions, show canvas
    if (pongInstructions) pongInstructions.style.display = 'none';
    if (pongCanvas) pongCanvas.classList.add('active');
    // Start the game
    startPongGame();
  });
  
  // Game end button - rebuild website or try again
  gameEndBtn?.addEventListener('click', () => {
    const isRetry = gameEndBtn.classList.contains('pong-game-end__btn--retry');
    if (isRetry) {
      // Try again - hide game end, show instructions
      if (pongGameEnd) pongGameEnd.style.display = 'none';
      if (pongInstructions) pongInstructions.style.display = '';
      if (pongCanvas) pongCanvas.classList.remove('active');
    } else {
      // Rebuild website - fix everything
      if (pongGameEnd) pongGameEnd.style.display = 'none';
      fixWebsite();
    }
  });
})();
