document.addEventListener('DOMContentLoaded', () => {
  const tg = window.Telegram?.WebApp;
  const userId = tg?.initDataUnsafe?.user?.id || "user_123";

  let adsWatched = 0;
  let coins = 0;
  let cooldown = false;

  const coinDisplay = document.getElementById("coinCount");
  const watchButtons = document.querySelectorAll(".ad-button");
  const withdrawBtn = document.getElementById("withdrawBtn");
  const inviteBtn = document.getElementById("inviteBtn");
  const referralStatsBtn = document.getElementById("statsBtn");
  const copyReferralBtn = document.getElementById("copyReferralBtn");

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

    watchButtons.forEach((btn, i) => {
      btn.disabled = true;
      btn.textContent = `Wait ${remaining}s...`;
    });

    const timer = setInterval(() => {
      remaining--;
      if (remaining > 0) {
        watchButtons.forEach((btn, i) => {
          btn.textContent = `Wait ${remaining}s...`;
        });
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

  const adUrl = "https://www.profitableratecpm.com/v2zuqzjp?key=6daf7222fff905ca7e6c5f88b684e86e";
  const adWindow = window.open(adUrl, "_blank", "width=500,height=600");

  if (!adWindow) {
    alert("Please allow popups to watch ads.");
    return;
  }

  const requiredSeconds = 5;
  let secondsOpen = 0;

  const checkAdInterval = setInterval(() => {
    if (adWindow.closed) {
      clearInterval(checkAdInterval);
      if (secondsOpen >= requiredSeconds) {
        setCooldown(10);
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
              alert(data.message || "Ad failed.");
            }
          })
          .catch(err => {
            console.error("Watch error:", err);
            alert("Failed to reward. Try again.");
          });
      } else {
        alert("Please watch the ad for at least 5 seconds to earn rewards.");
      }
    } else {
      secondsOpen++;
    }
  }, 1000);
}



  function withdrawTON() {
    if (coins < 100) {
      alert("You need at least 100 coins to withdraw.");
      return;
    }

    fetch("/api/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    })
      .then(res => res.json())
      .then(data => {
        (tg && tg.showAlert) ? tg.showAlert(data.message) : alert(data.message);
        if (data.success) {
          coins = 0;
          updateDisplay();
        }
      })
      .catch(err => {
        console.error("Withdraw error:", err);
        alert("Withdraw failed.");
      });
  }

  inviteBtn.addEventListener("click", () => {
    const referralLink = `https://t.me/Watch2ton_bot?start=${userId}`;
    if (navigator.share) {
      navigator.share({
        title: "Join Watch2TON",
        text: "Earn TON watching ads. Use my link!",
        url: referralLink
      }).catch(() => {
        prompt("Copy link:", referralLink);
      });
    } else {
      prompt("Copy link:", referralLink);
    }
  });

  referralStatsBtn.addEventListener("click", () => {
    fetch(`/api/referral-stats/${userId}?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        document.getElementById("referralCount").textContent = data.referrals?.length || 0;
        document.getElementById("referralStatsBox").style.display = "block";
      })
      .catch(() => {
        alert("Couldn't load stats.");
      });
  });

  document.querySelectorAll("#referralBox button, #referralStatsBox button").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const parent = e.target.closest("div[id]");
      if (parent) closePopup(parent.id);
    });
  });

  if (copyReferralBtn) {
    copyReferralBtn.addEventListener("click", () => {
      const input = document.getElementById("referralLink");
      input.select();
      navigator.clipboard.writeText(input.value)
        .then(() => tg?.showAlert?.("Copied!") || alert("Copied!"))
        .catch(() => alert("Copy failed."));
    });
  }

  watchButtons.forEach(btn => btn.addEventListener("click", watchAd));
  withdrawBtn.addEventListener("click", withdrawTON);
  loadUser();
});
