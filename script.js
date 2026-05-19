const sealButton = document.getElementById('sealButton');
const seal = document.getElementById('seal');
const flap = document.getElementById('flap');
const landing = document.getElementById('landing');
const fireworks = document.getElementById('fireworks');
const mainView = document.getElementById('mainView');
const cartoonFrames = [
  document.getElementById('cartoon1'),
  document.getElementById('cartoon2')
].filter(Boolean);
const bgmToggle = document.getElementById('bgmToggle');
const clickSound = new Audio('click.mp3');
clickSound.preload = 'auto';
const bgm = new Audio('bgm.mp3');
bgm.loop = true;
bgm.preload = 'auto';
let activeCartoonIndex = 0;
let cartoonTimer = null;
let isBgmPlaying = false;

function playClickSound() {
  clickSound.currentTime = 0;
  clickSound.play().catch(() => {
    // Some browsers block audio until the first user gesture; clicks after that will work.
  });
}

document.addEventListener('click', event => {
  if (event.target.closest('button, a')) {
    playClickSound();
  }
});

function updateBgmButton() {
  if (!bgmToggle) {
    return;
  }

  bgmToggle.classList.toggle('is-muted', !isBgmPlaying);
  bgmToggle.setAttribute('aria-pressed', String(isBgmPlaying));
}

function playBgm() {
  bgm.play()
    .then(() => {
      isBgmPlaying = true;
      updateBgmButton();
    })
    .catch(error => {
      isBgmPlaying = false;
      updateBgmButton();
      console.error('BGM autoplay failed:', error);
    });
}

function toggleBgm() {
  if (isBgmPlaying) {
    bgm.pause();
    isBgmPlaying = false;
    updateBgmButton();
    return;
  }

  playBgm();
}

function startCartoonLoop() {
  if (cartoonFrames.length < 2) {
    return;
  }

  cartoonTimer = setInterval(() => {
    cartoonFrames[activeCartoonIndex].classList.remove('active');
    activeCartoonIndex = (activeCartoonIndex + 1) % cartoonFrames.length;
    cartoonFrames[activeCartoonIndex].classList.add('active');
  }, 1000);
}

function openLandingAnimation() {
  sealButton.disabled = true;
  fireworks.innerHTML = '';
  clearInterval(cartoonTimer);
  playBgm();
  sealButton.classList.add('seal-zoom');
  landing.classList.add('zoomed');

  setTimeout(() => {
    landing.style.opacity = '0';
    mainView.classList.add('show-main');
    document.body.classList.add('main-open');
  }, 650);
}

if (bgmToggle) {
  bgmToggle.addEventListener('click', toggleBgm);
  updateBgmButton();
}

startCartoonLoop();
sealButton.addEventListener('click', openLandingAnimation);

const countdownTarget = new Date('2026-11-21T18:00:00');
const countdownDays = document.getElementById('days');
const countdownHours = document.getElementById('hours');
const countdownMinutes = document.getElementById('minutes');
const countdownSeconds = document.getElementById('seconds');

function updateCountdown() {
  const now = new Date();
  let diff = countdownTarget - now;
  if (diff < 0) {
    diff = 0;
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  countdownDays.textContent = String(days).padStart(2, '0');
  countdownHours.textContent = String(hours).padStart(2, '0');
  countdownMinutes.textContent = String(minutes).padStart(2, '0');
  countdownSeconds.textContent = String(seconds).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

const API_URL = 'https://script.google.com/macros/s/AKfycbweTECUOsdbGDtk9ZvtX-yqmHYkEWGjyKPvGhLsqwBAvrvMb8tWkD1xBKplIbeq-NTlJg/exec';
const rsvpSubmit = document.getElementById('rsvpSubmit');
const viewBlessings = document.getElementById('viewBlessings');
const rsvpName = document.getElementById('rsvp-name');
const rsvpGuest = document.getElementById('rsvp-guest');
const rsvpMessage = document.getElementById('rsvp-message');
const blessingsPanel = document.getElementById('blessingsPanel');
const blessingsList = document.getElementById('blessingsList');
const thankYouModal = document.getElementById('thankYouModal');
const thankYouClose = document.getElementById('thankYouClose');
const thankYouOk = document.getElementById('thankYouOk');

function showMessage(text) {
  window.alert(text);
}

function showThankYouModal() {
  if (!thankYouModal) {
    showMessage('Check-in successful. Thank you for your wishes!');
    return;
  }

  thankYouModal.hidden = false;
}

function hideThankYouModal() {
  if (thankYouModal) {
    thankYouModal.hidden = true;
  }
}

if (thankYouClose) {
  thankYouClose.addEventListener('click', hideThankYouModal);
}

if (thankYouOk) {
  thankYouOk.addEventListener('click', hideThankYouModal);
}

if (thankYouModal) {
  thankYouModal.addEventListener('click', event => {
    if (event.target === thankYouModal) {
      hideThankYouModal();
    }
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getGuestCount(item) {
  return item.pax ?? item.guests ?? item.guest ?? 0;
}

function getWishMessage(item) {
  return item.wishes ?? item.message ?? item.wish ?? '';
}

function renderBlessings(list) {
  if (!blessingsPanel || !blessingsList) {
    return;
  }

  blessingsList.innerHTML = list.length
    ? list.map(item => `
      <div class="blessings-item">
        <div class="blessings-meta">
          <strong>${escapeHtml(item.name || 'Guest')}</strong>
          <span>${escapeHtml(getGuestCount(item))} pax</span>
        </div>
        <div class="blessings-message">${escapeHtml(getWishMessage(item) || 'No message')}</div>
      </div>
    `).join('')
    : '<div class="blessings-empty">No guest wishes yet.</div>';

  blessingsPanel.hidden = false;
}

if (rsvpSubmit) {
  rsvpSubmit.addEventListener('click', () => {
    const name = rsvpName.value.trim();
    const guestCount = rsvpGuest.value.trim();
    const message = rsvpMessage.value.trim();

    if (!name || !guestCount) {
      showMessage('Please enter your name and pax.');
      return;
    }

    rsvpSubmit.disabled = true;

    fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        name,
        pax: guestCount,
        guests: guestCount,
        wishes: message,
        message
      })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then(result => {
        if (result.success) {
          showThankYouModal();
          rsvpName.value = '';
          rsvpGuest.value = '';
          rsvpMessage.value = '';
        } else {
          console.error('RSVP API returned an error:', result);
          showMessage('Check-in failed. Please try again later.');
        }
      })
      .catch(error => {
        console.error('RSVP request failed:', error);
        showMessage('Check-in failed. Please check your network and try again.');
      })
      .finally(() => {
        rsvpSubmit.disabled = false;
      });
  });
}

if (viewBlessings) {
  viewBlessings.addEventListener('click', () => {
    viewBlessings.disabled = true;
    fetch(API_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          renderBlessings(data.reverse());
        } else {
          console.error('Unexpected wishes response:', data);
          showMessage('Failed to load guest wishes. Please try again later.');
        }
      })
      .catch(error => {
        console.error('Guest wishes request failed:', error);
        showMessage('Failed to load guest wishes. Please check your network and try again.');
      })
      .finally(() => {
        viewBlessings.disabled = false;
      });
  });
}
