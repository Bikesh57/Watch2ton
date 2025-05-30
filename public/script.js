document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram?.WebApp;
  const userId = tg?.initDataUnsafe?.user?.id || "user_123";

  let adsWatched = 0;
  let coins = 0;
  let cooldown = false;

let tonConnect;

  const coinDisplay = document.getElementById("coinCount");
  const watchButtons = document.querySelectorAll(".ad-button");
  const withdrawBtn = document.getElementById("withdrawBtn");
  const inviteBtn = document.getElementById("inviteBtn");
  const referralStatsBtn = document.getElementById("statsBtn");
  const copyReferralBtn = document.getElementById("copyReferralBtn");


const adButtons = document.querySelectorAll('.ad-button');

adButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    // Replace with your actual Adsterra link
    const adWindow = window.open("https://www.profitableratecpm.com/v2zuqzjp?key=6daf7222fff905ca7e6c5f88b684e86e", "_blank");

    // OPTIONAL: You can track the ad click
    console.log(`Ad ${index + 1} clicked`);

    // After ad window is opened, wait and then reward (mock fallback)
    setTimeout(() => {
      alert('Thanks for watching! You earned 1 coin.');
      let count = parseInt(document.getElementById('coinCount').textContent);
      document.getElementById('coinCount').textContent = count + 1;
    }, 10000); // Give 10 seconds for ad interaction
  });
});



  // Store original texts of buttons
  const originalButtonTexts = Array.from(watchButtons).map(btn => btn.textContent);

  function updateDisplay() {
    coinDisplay.textContent = coins;
  }

  function closePopup(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  }

  function setCooldown(seconds) {
    cooldown = true;
    let remaining = seconds;

    watchButtons.forEach(btn => {
      btn.disabled = true;
      btn.textContent = `Wait ${remaining}s...`;
    });

    const timer = setInterval(() => {
      remaining--;
      if (remaining > 0) {
        watchButtons.forEach(btn => (btn.textContent = `Wait ${remaining}s...`));
      } else {
        clearInterval(timer);
        cooldown = false;
        watchButtons.forEach((btn, i) => {
          btn.disabled = false;
          btn.textContent = originalButtonTexts[i];
        });
      }
    }, 1000);
  }

  function loadUser() {
    fetch(`/api/user/${userId}`)
      .then(res => res.json())
      .then(data => {
        coins = data.coins || 0;
        adsWatched = data.adsWatched || 0;
        updateDisplay();
      })
      .catch(err => {
        console.error("Failed to load user data:", err);
      });
  }

 function watchAd() {
  if (cooldown) return;
  if (adsWatched >= 10) {
    alert("You've reached your 10-ad daily limit.");
    return;
  }

  const overlay = document.getElementById("ad-overlay");
  const timerText = document.getElementById("ad-timer");

  // Show mock ad overlay
  overlay.style.display = "flex";

  let seconds = 5;
  timerText.textContent = `Mock Ad playing... Please wait ${seconds}`;

  const countdown = setInterval(() => {
    seconds--;
    if (seconds > 0) {
      timerText.textContent = `Mock Ad playing... Please wait ${seconds}`;
    } else {
      clearInterval(countdown);
      overlay.style.display = "none"; // hide ad overlay

      // Proceed to reward user
      setCooldown(10);
      setTimeout(() => {
        fetch("/api/watch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId })
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              coins = data.coins || coins;
              adsWatched = data.adsWatched || adsWatched;
              updateDisplay();
            } else {
              alert(data.message || "Ad failed, please try again.");
            }
          })
          .catch(err => {
            console.error("Error watching ad:", err);
            alert("Failed to watch ad. Please try again.");
          });
      }, 1000); // extra delay before rewarding
    }
  }, 1000);
}

//connect wallet
function connectWallet() {
  if (typeof TonConnect === 'undefined') {
    alert("TONConnect SDK not loaded!");
    return;
  }

  const tonConnect = new TonConnect({
    manifestUrl: 'https://your-vercel-url.vercel.app/tonconnect-manifest.json' // Replace with real URL later
  });

  tonConnect.connect()
    .then(() => {
      alert("Wallet connected!");
    })
    .catch((err) => {
      alert("Failed to connect wallet: " + err.message);
    });
}




  function withdrawTON() {
    if (coins < 100) {
      alert("You need at least 100 coins (0.01 TON) to withdraw.");
      return;
    }

    fetch("/api/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    })
      .then(res => res.json())
      .then(data => {
        if (tg && tg.showAlert) {
          tg.showAlert(data.message);
        } else {
          alert(data.message);
        }

        if (data.success) {
          coins = 0;
          updateDisplay();
        }
      })
      .catch(err => {
        console.error("Withdrawal error:", err);
        alert("Withdrawal failed. Please try again.");
      });
  }

  inviteBtn.addEventListener("click", () => {
    const referralLink = `https://t.me/Watch2ton_bot?start=${userId}`;
    if (navigator.share) {
      navigator.share({
        title: "Join Watch2TON",
        text: "Earn TON by watching ads. Join using my link!",
        url: referralLink
      }).catch(() => {
        prompt("Copy this link and share with friends:", referralLink);
      });
    } else {
      prompt("Copy this link and share with friends:", referralLink);
    }
  });

  referralStatsBtn.addEventListener("click", () => {
    fetch(`/api/referral-stats/${userId}`)
      .then(res => res.json())
      .then(data => {
        const referralStatsBox = document.getElementById("referralStatsBox");
        const referralCount = document.getElementById("referralCount");
        referralCount.textContent = data.referrals;
        referralStatsBox.style.display = "block";
      })
      .catch(() => {
        alert("Failed to load referral stats.");
      });
  });

  document.querySelectorAll("#referralBox button, #referralStatsBox button").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const parent = e.target.closest("div[id]");
      if (parent) closePopup(parent.id);
    });
  });

  // Add copy event listener
  if (copyReferralBtn) {
    copyReferralBtn.addEventListener("click", () => {
      const input = document.getElementById("referralLink");
      input.select();
      input.setSelectionRange(0, 99999);
      navigator.clipboard.writeText(input.value)
        .then(() => {
          if (tg && tg.showAlert) {
            tg.showAlert("Referral link copied!");
          } else {
            alert("Referral link copied!");
          }
        })
        .catch(() => {
          alert("Failed to copy referral link.");
        });
    });
  }

  watchButtons.forEach(btn => btn.addEventListener("click", watchAd));
  withdrawBtn.addEventListener("click", withdrawTON);

  loadUser();
});
