
// ==========================================
// 🌷 LITTLE TOWN — MAIN GAME ENGINE
// Version 1.0
// ==========================================

const LittleTown = {
  // PLAYER DATA
  player: {
    name: "Mochi",
    coins: 100,
    level: 1,
    experience: 0,
    energy: 100,
    happiness: 100,
    flowers: 0,
    location: "Town Square"
  },

  // GAME DATA
  game: {
    day: 1,
    time: 9,
    season: "Spring",
    weather: "Sunny",
    visited: [],
    completedQuests: [],
    collectedFlowers: 0,
    lastReward: ""
  },

  // BUILDINGS
  buildings: [
    {
      name: "My House",
      emoji: "🏡",
      description: "Your very own cozy home!",
      activities: [
        { name: "Rest", emoji: "🛏️", energy: 25, happiness: 10 },
        { name: "Relax", emoji: "🧸", energy: 10, happiness: 15 }
      ]
    },
    {
      name: "Cafe",
      emoji: "☕",
      description: "A lovely little cafe with delicious treats.",
      activities: [
        { name: "Buy a cupcake", emoji: "🧁", cost: 10, happiness: 20 },
        { name: "Buy lemonade", emoji: "🍋", cost: 8, happiness: 15 },
        { name: "Meet a friend", emoji: "💬", happiness: 15 }
      ]
    },
    {
      name: "Flower Shop",
      emoji: "🌸",
      description: "The prettiest flowers in all of Little Town!",
      activities: [
        { name: "Buy a bouquet", emoji: "💐", cost: 20, flowers: 3 },
        { name: "Buy a tulip", emoji: "🌷", cost: 8, flowers: 1 },
        { name: "Look around", emoji: "🌼", happiness: 10 }
      ]
    },
    {
      name: "Park",
      emoji: "🌳",
      description: "A peaceful place to enjoy nature.",
      activities: [
        { name: "Collect flowers", emoji: "🌻", flowers: 2 },
        { name: "Take a walk", emoji: "🚶", happiness: 15, energy: -5 },
        { name: "Enjoy the sunshine", emoji: "☀️", happiness: 20 }
      ]
    }
  ],

  // QUESTS
  quests: [
    {
      id: "visit_cafe",
      title: "Cafe Explorer",
      description: "Visit the cafe for the first time.",
      reward: 25,
      completed: false
    },
    {
      id: "visit_park",
      title: "Nature Lover",
      description: "Visit the beautiful park.",
      reward: 25,
      completed: false
    },
    {
      id: "collect_flowers",
      title: "Flower Collector",
      description: "Collect 5 flowers.",
      reward: 40,
      completed: false
    },
    {
      id: "visit_home",
      title: "Home Sweet Home",
      description: "Visit your new home.",
      reward: 20,
      completed: false
    }
  ],

  // SAVE GAME
  save() {
    localStorage.setItem(
      "littleTownSave",
      JSON.stringify({
        player: this.player,
        game: this.game,
        quests: this.quests
      })
    );
    this.showToast("💾 Game saved!");
  },

  load() {
    const saved = localStorage.getItem("littleTownSave");

    if (!saved) return;

    try {
      const data = JSON.parse(saved);
      this.player = { ...this.player, ...data.player };
      this.game = { ...this.game, ...data.game };

      if (data.quests) {
        this.quests = data.quests;
      }
    } catch (error) {
      console.error("Could not load save:", error);
    }
  },

  // EXPERIENCE AND LEVELS
  addExperience(amount) {
    this.player.experience += amount;

    while (this.player.experience >= this.player.level * 100) {
      this.player.experience -= this.player.level * 100;
      this.player.level++;
      this.player.coins += 50;

      this.showToast(
        `🎉 LEVEL UP! You're now level ${this.player.level}! +50 coins!`
      );
    }

    this.updateInterface();
  },

  // COINS
  earnCoins(amount) {
    this.player.coins += amount;
    this.updateInterface();
  },

  spendCoins(amount) {
    if (this.player.coins < amount) {
      this.showToast("Not enough coins! 💰");
      return false;
    }

    this.player.coins -= amount;
    this.updateInterface();
    return true;
  },

  // BUILDING VISITS
  visitBuilding(name) {
    const building = this.buildings.find(
      item => item.name === name
    );

    if (!building) return;

    this.player.location = name;
    this.game.time = (this.game.time + 1) % 24;

    if (!this.game.visited.includes(name)) {
      this.game.visited.push(name);
    }

    this.updateInterface();
    this.checkQuests();

    this.openBuilding(building);
  },

  // BUILDING MENU
  openBuilding(building) {
    this.closeModal();

    const modal = document.createElement("div");
    modal.id = "town-modal";
    modal.className = "town-overlay";

    const content = document.createElement("div");
    content.className = "town-window";

    content.innerHTML = `
      <button class="town-close" id="close-town">✕</button>
      <div class="town-big-emoji">${building.emoji}</div>
      <h2>${building.name}</h2>
      <p>${building.description}</p>
      <div class="town-activities"></div>
    `;

    const activities = content.querySelector(".town-activities");

    building.activities.forEach((activity, index) => {
      const button = document.createElement("button");
      button.className = "town-activity";

      const cost = activity.cost
        ? ` · ${activity.cost} coins`
        : "";

      button.textContent =
        `${activity.emoji} ${activity.name}${cost}`;

      button.addEventListener("click", () => {
        this.doActivity(building, index);
      });

      activities.appendChild(button);
    });

    modal.appendChild(content);
    document.body.appendChild(modal);

    document.getElementById("close-town").onclick =
      () => this.closeModal();

    modal.addEventListener("click", event => {
      if (event.target === modal) this.closeModal();
    });
  },

  closeModal() {
    document.getElementById("town-modal")?.remove();
  },

  // ACTIVITIES
  doActivity(building, index) {
    const activity = building.activities[index];

    if (activity.cost && !this.spendCoins(activity.cost)) {
      return;
    }

    if (activity.energy > 0) {
      this.player.energy = Math.min(
        100,
        this.player.energy + activity.energy
      );
    }

    if (activity.energy < 0) {
      this.player.energy = Math.max(
        0,
        this.player.energy + activity.energy
      );
    }

    if (activity.happiness) {
      this.player.happiness = Math.min(
        100,
        this.player.happiness + activity.happiness
      );
    }

    if (activity.flowers) {
      this.player.flowers += activity.flowers;
      this.game.collectedFlowers += activity.flowers;

      this.showToast(
        `🌷 You collected ${activity.flowers} flowers!`
      );
    } else {
      this.showToast(`${activity.emoji} ${activity.name}!`);
    }

    this.game.time = (this.game.time + 1) % 24;

    this.addExperience(10);
    this.checkQuests();
    this.updateInterface();
    this.saveQuietly();
  },

  // QUEST CHECKING
  checkQuests() {
    this.quests.forEach(quest => {
      if (quest.completed) return;

      let completed = false;

      if (quest.id === "visit_cafe") {
        completed = this.game.visited.includes("Cafe");
      }

      if (quest.id === "visit_park") {
        completed = this.game.visited.includes("Park");
      }

      if (quest.id === "visit_home") {
        completed = this.game.visited.includes("My House");
      }

      if (quest.id === "collect_flowers") {
        completed = this.game.collectedFlowers >= 5;
      }

      if (completed) {
        quest.completed = true;
        this.earnCoins(quest.reward);
        this.addExperience(20);

        this.showToast(
          `🏆 Quest completed: ${quest.title}! +${quest.reward} coins!`
        );
      }
    });

    this.renderQuests();
  },

  // DAILY REWARD
  dailyReward() {
    const today = new Date().toDateString();

    if (this.game.lastReward === today) {
      this.showToast("You've already collected today's reward! 💗");
      return;
    }

    this.game.lastReward = today;
    this.earnCoins(50);
    this.addExperience(15);

    this.showToast("🎁 Daily reward! You received 50 coins!");
    this.saveQuietly();
  },

  // TIME
  advanceDay() {
    this.game.day++;
    this.game.time = 9;
    this.player.energy = 100;

    this.showToast(`🌅 Welcome to Day ${this.game.day}!`);
    this.updateInterface();
    this.saveQuietly();
  },

  // NOTIFICATIONS
  showToast(message) {
    const toast = document.createElement("div");
    toast.className = "town-toast";
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  },

  // QUEST PANEL
  renderQuests() {
    const list = document.getElementById("quest-list");
    if (!list) return;

    list.innerHTML = "";

    this.quests.forEach(quest => {
      const item = document.createElement("div");
      item.className = "quest-item";

      const title = document.createElement("strong");
      title.textContent =
        `${quest.completed ? "✅" : "⭐"} ${quest.title}`;

      const description = document.createElement("p");
      description.textContent = quest.description;

      item.append(title, description);
      list.appendChild(item);
    });
  },

  // PLAYER INTERFACE
  updateInterface() {
    const coins = document.getElementById("player-coins");
    const level = document.getElementById("player-level");
    const energy = document.getElementById("player-energy");
    const happiness = document.getElementById("player-happiness");
    const location = document.getElementById("player-location");
    const flowers = document.getElementById("player-flowers");
    const clock = document.getElementById("game-clock");
    const day = document.getElementById("game-day");

    if (coins) coins.textContent = this.player.coins;
    if (level) level.textContent = this.player.level;
    if (energy) energy.style.width = this.player.energy + "%";
    if (happiness) happiness.style.width = this.player.happiness + "%";
    if (location) location.textContent = this.player.location;
    if (flowers) flowers.textContent = this.player.flowers;
    if (clock) clock.textContent = this.formatTime();
    if (day) day.textContent = this.game.day;

    this.renderQuests();
  },

  formatTime() {
    const hour = this.game.time % 24;
    const displayHour = hour % 12 || 12;
    const suffix = hour >= 12 ? "PM" : "AM";

    return `${displayHour}:00 ${suffix}`;
  },

  saveQuietly() {
    localStorage.setItem(
      "littleTownSave",
      JSON.stringify({
        player: this.player,
        game: this.game,
        quests: this.quests
      })
    );
  },

  // START GAME
  init() {
    this.load();
    this.createInterface();
    this.updateInterface();
    this.checkQuests();

    document.querySelectorAll(".building").forEach(element => {
      element.addEventListener("click", () => {
        const name = element.innerText
          .split("\n")
          .slice(1)
          .join(" ")
          .trim();

        this.visitBuilding(name);
      });
    });

    document.getElementById("daily-reward")
      ?.addEventListener("click", () => this.dailyReward());

    document.getElementById("save-game")
      ?.addEventListener("click", () => this.save());

    document.getElementById("next-day")
      ?.addEventListener("click", () => this.advanceDay());

    document.getElementById("show-quests")
      ?.addEventListener("click", () => {
        document.getElementById("quest-panel")
          ?.classList.toggle("hidden");
      });

    console.log("🌷 Little Town successfully loaded!");
  },

  // CREATE THE HUD
  createInterface() {
    const hud = document.createElement("section");
    hud.id = "town-hud";

    hud.innerHTML = `
      <div class="hud-top">
        <div class="hud-player">
          <span class="hud-avatar">👩🏻</span>
          <div>
            <strong>${this.player.name}</strong>
            <small>Level <span id="player-level"></span></small>
          </div>
        </div>

        <div class="hud-stats">
          <span>🪙 <b id="player-coins"></b></span>
          <span>🌷 <b id="player-flowers"></b></span>
          <span>📅 Day <b id="game-day"></b></span>
          <span>🕒 <b id="game-clock"></b></span>
        </div>
      </div>

      <div class="hud-bars">
        <div>⚡ Energy <div class="stat-track"><div id="player-energy" class="stat-fill energy-fill"></div></div></div>
        <div>💗 Happiness <div class="stat-track"><div id="player-happiness" class="stat-fill happiness-fill"></div></div></div>
      </div>

      <div class="hud-location">
        📍 Currently at: <strong id="player-location"></strong>
      </div>

      <div class="hud-actions">
        <button id="daily-reward">🎁 Daily Gift</button>
        <button id="show-quests">📋 Quests</button>
        <button id="save-game">💾 Save</button>
        <button id="next-day">🌅 Next Day</button>
      </div>
    `;

    document.body.prepend(hud);

    const quests = document.createElement("aside");
    quests.id = "quest-panel";
    quests.className = "hidden";

    quests.innerHTML = `
      <h3>📋 Town Quests</h3>
      <div id="quest-list"></div>
    `;

    document.body.appendChild(quests);
  }
};

// START EVERYTHING
document.addEventListener("DOMContentLoaded", () => {
  LittleTown.init();
});
