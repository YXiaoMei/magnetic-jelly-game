(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d", { alpha: false });
  const hud = document.getElementById("hud");
  const startScreen = document.getElementById("startScreen");
  const startButton = document.getElementById("startButton");
  const customModeButton = document.getElementById("customModeButton");
  const startProgress = document.getElementById("startProgress");
  const startLevelButton = document.getElementById("startLevelButton");
  const startSettingsButton = document.getElementById("startSettingsButton");
  const settingsDialog = document.getElementById("settingsDialog");
  const closeSettings = document.getElementById("closeSettings");
  const settingsSoundToggle = document.getElementById("settingsSoundToggle");
  const settingsVibrationToggle = document.getElementById("settingsVibrationToggle");
  const hintsToggle = document.getElementById("hintsToggle");
  const reducedMotionToggle = document.getElementById("reducedMotionToggle");
  const developerPassword = document.getElementById("developerPassword");
  const developerModeButton = document.getElementById("developerModeButton");
  const developerBadge = document.getElementById("developerBadge");
  const developerMessage = document.getElementById("developerMessage");
  const resetProgressButton = document.getElementById("resetProgressButton");
  const menuButton = document.getElementById("menuButton");
  const polarityButton = document.getElementById("polarityButton");
  const gameMenu = document.getElementById("gameMenu");
  const closeMenu = document.getElementById("closeMenu");
  const resumeButton = document.getElementById("resumeButton");
  const restartButton = document.getElementById("restartButton");
  const menuLevelButton = document.getElementById("menuLevelButton");
  const homeButton = document.getElementById("homeButton");
  const customMenuButton = document.getElementById("customMenuButton");
  const soundToggle = document.getElementById("soundToggle");
  const vibrationToggle = document.getElementById("vibrationToggle");
  const levelNumber = document.getElementById("levelNumber");
  const levelSelectButton = document.getElementById("levelSelectButton");
  const levelSelector = document.getElementById("levelSelector");
  const levelGrid = document.getElementById("levelGrid");
  const closeLevelSelector = document.getElementById("closeLevelSelector");
  const progressTrack = document.getElementById("progressTrack");
  const progressFill = document.getElementById("progressFill");
  const gallery = document.getElementById("gallery");
  const badgeGrid = document.getElementById("badgeGrid");
  const galleryButton = document.getElementById("galleryButton");
  const closeGallery = document.getElementById("closeGallery");
  const resultScreen = document.getElementById("resultScreen");
  const resultIcon = document.getElementById("resultIcon");
  const resultTitle = document.getElementById("resultTitle");
  const resultMessage = document.getElementById("resultMessage");
  const nextLevelButton = document.getElementById("nextLevelButton");
  const resultRestartButton = document.getElementById("resultRestartButton");
  const resultLevelButton = document.getElementById("resultLevelButton");
  const customEditor = document.getElementById("customEditor");
  const customCanvas = document.getElementById("customCanvas");
  const customCtx = customCanvas.getContext("2d");
  const closeCustomEditor = document.getElementById("closeCustomEditor");
  const playCustomLevel = document.getElementById("playCustomLevel");
  const customToolbox = document.getElementById("customToolbox");
  const customEditorHint = document.getElementById("customEditorHint");
  const customObjectCount = document.getElementById("customObjectCount");
  const undoCustomEdit = document.getElementById("undoCustomEdit");
  const clearCustomEdit = document.getElementById("clearCustomEdit");
  const customTemplate = document.getElementById("customTemplate");
  const customPolarityToggle = document.getElementById("customPolarityToggle");
  const customDualToggle = document.getElementById("customDualToggle");
  const customMotionToggle = document.getElementById("customMotionToggle");

  const TAU = Math.PI * 2;
  const WIND_BREATH_SPEED = 0.00085;
  const COLORS = ["#7b67eb", "#55d5cf", "#f48abd", "#ffbd69"];
  const LEVEL_ICONS = ["●", "♥", "◆", "✦", "☁", "✿", "☾", "★", "♬", "▲", "●", "♥", "◆", "✦", "☁", "✿", "☾", "★", "♬", "▲", "◒", "≈", "↗", "✧", "✺", "◎", "↔", "↕", "⊙", "◉", "⟳", "◌", "⇆", "≋", "⊕", "±", "↯", "◇", "∞", "✹"];
  const SAVE_KEY = "magnetic-jelly-save-v1";
  const CUSTOM_SAVE_KEY = "magnetic-jelly-custom-v1";

  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    levelIndex: 0,
    level: null,
    beads: [],
    targets: [],
    effects: [],
    ripples: [],
    magnet: { x: 0, y: 0, active: false, pulse: 0, polarity: 1 },
    pointer: { x: 0, y: 0, down: false },
    status: "playing",
    statusAt: 0,
    failurePoint: null,
    resultShown: false,
    startAt: 0,
    lastAt: 0,
    levelCaptureCount: 0,
    cameraShake: 0,
    completed: new Set(),
    bestUnlocked: 0,
    audio: null,
    tutorialAlpha: 1,
    mechanismHint: null,
    started: false,
    uiPaused: true,
    soundEnabled: true,
    vibrationEnabled: true,
    hintsEnabled: true,
    reducedMotion: false,
    developerMode: false,
    customMode: false,
    customLevel: null,
    editorReturn: "home",
    shownHints: new Set()
  };
  const editor = {
    tool: "target",
    color: 0,
    draft: null,
    history: [],
    width: 0,
    height: 0,
    dpr: 1
  };
  let activeDialog = null;
  let dialogReturnFocus = null;
  let animationFrame = null;

  const patterns = [
    [[0, -2], [0, -1], [0, 0], [0, 1], [0, 2]],
    [[-1, -1], [1, -1], [-2, 0], [2, 0], [-1, 1], [1, 1], [0, 2]],
    [[0, -2], [-1, -1], [1, -1], [-2, 0], [2, 0], [-1, 1], [1, 1], [0, 2]],
    [[0, -2], [0, -1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [0, 1], [0, 2]],
    [[-2, 0], [-1, -1], [0, -1], [1, -1], [2, 0], [1, 1], [0, 1], [-1, 1]],
    [[-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [-1, 0], [0, 0], [1, 0], [0, 1]],
    [[-2, -1], [-1, -2], [0, -2], [-1, -1], [-1, 0], [0, 1], [1, 2]],
    [[0, -2], [-1, -1], [1, -1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-1, 1], [1, 1], [0, 2]],
    [[-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [-2, 0], [0, 0], [2, 0], [-2, 1], [-1, 1], [0, 1], [1, 1], [2, 1]],
    [[0, -2], [-1, -1], [0, -1], [1, -1], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-1, 1], [0, 1], [1, 1], [0, 2]]
  ];

  function loadSave() {
    try {
      const save = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
      state.completed = new Set(Array.isArray(save.completed) ? save.completed : []);
      const maxIndex = levels.length - 1;
      state.bestUnlocked = Math.min(maxIndex, Math.max(0, save.bestUnlocked || 0));
      if (state.bestUnlocked === 19 && state.completed.has(19)) state.bestUnlocked = 20;
      if (state.completed.has(24)) state.bestUnlocked = Math.max(state.bestUnlocked, 25);
      const savedLevel = Number.isInteger(save.currentLevel) ? save.currentLevel : state.bestUnlocked;
      state.levelIndex = Math.min(maxIndex, Math.max(0, savedLevel));
      state.soundEnabled = save.soundEnabled !== false;
      state.vibrationEnabled = save.vibrationEnabled !== false;
      state.hintsEnabled = save.hintsEnabled !== false;
      state.reducedMotion = save.reducedMotion === true;
      state.developerMode = save.developerMode === true;
    } catch {
      state.completed = new Set();
    }
  }

  function saveProgress() {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      completed: [...state.completed],
      bestUnlocked: state.bestUnlocked,
      currentLevel: state.levelIndex,
      soundEnabled: state.soundEnabled,
      vibrationEnabled: state.vibrationEnabled,
      hintsEnabled: state.hintsEnabled,
      reducedMotion: state.reducedMotion,
      developerMode: state.developerMode
    }));
  }

  function seeded(seed) {
    let value = seed * 99991;
    return () => {
      value = (value * 1664525 + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function makeLevels() {
    const firstChapter = Array.from({ length: 20 }, (_, index) => {
      const rand = seeded(index + 1);
      const pattern = patterns[index % patterns.length];
      const columns = index < 5 ? 1 : Math.min(3, 1 + Math.floor(index / 7));
      const targets = pattern.map(([px, py], targetIndex) => ({
        x: 0.5 + px * 0.075,
        y: 0.27 + py * 0.048,
        color: (targetIndex + index) % columns
      }));
      const hazards = [];
      const rotators = [];
      const gates = [];

      if (index >= 5) {
        hazards.push({
          x: index % 2 ? 0.2 : 0.8,
          y: 0.5,
          radius: 0.075 + rand() * 0.018,
          phase: rand() * TAU,
          moving: index >= 12
        });
      }
      if (index >= 7) {
        rotators.push({
          x: 0.5,
          y: 0.55 + rand() * 0.08,
          length: 0.24 + rand() * 0.08,
          speed: (index % 2 ? 1 : -1) * (0.45 + rand() * 0.35),
          angle: rand() * TAU
        });
      }
      if (index >= 10) {
        gates.push({
          x: 0.5,
          y: 0.68,
          gap: Math.max(0.15, 0.28 - index * 0.005),
          direction: index % 2 ? 1 : -1
        });
      }
      if (index >= 15) {
        hazards.push({
          x: index % 2 ? 0.78 : 0.22,
          y: 0.7,
          radius: 0.06,
          phase: rand() * TAU,
          moving: true
        });
      }

      return {
        title: `果冻图案 ${index + 1}`,
        targets,
        hazards,
        rotators,
        gates,
        bumpers: [],
        windFields: [],
        splitters: [],
        beadCount: targets.length,
        colorCount: columns,
        icon: LEVEL_ICONS[index]
      };
    });

    const arcTargets = (count, colors = 1, y = 0.29, spread = 0.29) =>
      Array.from({ length: count }, (_, index) => {
        const progress = count === 1 ? 0.5 : index / (count - 1);
        const angle = Math.PI * (0.12 + progress * 0.76);
        return {
          x: 0.5 + Math.cos(angle) * spread,
          y: y - Math.sin(angle) * 0.085,
          color: index % colors
        };
      });

    const partyTargets = [
      [-2, -1], [-1, -2], [0, -2], [1, -2], [2, -1],
      [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0],
      [-1, 1], [1, 1]
    ].map(([x, y], index) => ({
      x: 0.5 + x * 0.072,
      y: 0.27 + y * 0.047,
      color: index % 3
    }));

    const secondChapter = [
      {
        title: "弹弹乐",
        targets: arcTargets(7, 1),
        bumpers: [{ x: 0.5, y: 0.57, radius: 0.085, strength: 2.5 }],
        windFields: [],
        splitters: [],
        hazards: [],
        rotators: [],
        gates: [],
        beadCount: 7,
        colorCount: 1
      },
      {
        title: "顺风走",
        targets: arcTargets(8, 2),
        bumpers: [],
        windFields: [{ x: 0.04, y: 0.38, width: 0.92, height: 0.34, angle: -Math.PI / 2, force: 0.22, phase: 0 }],
        splitters: [],
        hazards: [],
        rotators: [],
        gates: [],
        beadCount: 8,
        colorCount: 2
      },
      {
        title: "风中反弹",
        targets: arcTargets(9, 2),
        bumpers: [
          { x: 0.3, y: 0.56, radius: 0.067, strength: 2.25 },
          { x: 0.7, y: 0.49, radius: 0.067, strength: 2.25 }
        ],
        windFields: [{ x: 0.04, y: 0.36, width: 0.92, height: 0.38, angle: -Math.PI / 2 + 0.25, force: 0.19, phase: 1.2 }],
        splitters: [],
        hazards: [],
        rotators: [],
        gates: [],
        beadCount: 9,
        colorCount: 2
      },
      {
        title: "一变三",
        targets: arcTargets(9, 3, 0.29, 0.3),
        bumpers: [],
        windFields: [],
        splitters: [{ x: 0.5, y: 0.54, radius: 0.082, pieces: 3 }],
        hazards: [],
        rotators: [],
        gates: [],
        beadCount: 3,
        spawnColors: [0, 1, 2],
        splitCount: 3,
        colorCount: 3
      },
      {
        title: "果冻派对",
        targets: partyTargets,
        bumpers: [
          { x: 0.25, y: 0.58, radius: 0.06, strength: 2.2 },
          { x: 0.75, y: 0.58, radius: 0.06, strength: 2.2 }
        ],
        windFields: [{ x: 0.04, y: 0.36, width: 0.92, height: 0.39, angle: -Math.PI / 2, force: 0.17, phase: 0.7 }],
        splitters: [{ x: 0.5, y: 0.62, radius: 0.075, pieces: 2 }],
        hazards: [{ x: 0.5, y: 0.47, radius: 0.052, phase: 0, moving: false }],
        rotators: [],
        gates: [],
        beadCount: 6,
        spawnColors: [0, 1, 2, 0, 1, 2],
        splitCount: 2,
        colorCount: 3,
        chapterFinale: true
      }
    ].map((level, offset) => ({
      ...level,
      icon: LEVEL_ICONS[20 + offset]
    }));

    const ringTargets = (count, colors = 2, radiusX = 0.34, radiusY = 0.12, centerY = 0.5, offset = 0) =>
      Array.from({ length: count }, (_, index) => {
        const angle = offset + index / count * TAU;
        return {
          x: 0.5 + Math.cos(angle) * radiusX,
          y: centerY + Math.sin(angle) * radiusY,
          color: index % colors,
          baseX: 0.5 + Math.cos(angle) * radiusX,
          baseY: centerY + Math.sin(angle) * radiusY
        };
      });
    const sideTargets = (count, colors = 2, vertical = true) =>
      Array.from({ length: count }, (_, index) => {
        const side = index % 2;
        const row = Math.floor(index / 2);
        const rows = Math.ceil(count / 2);
        return vertical
          ? { x: side ? 0.86 : 0.14, y: 0.28 + row / Math.max(1, rows - 1) * 0.44, color: index % colors }
          : { x: 0.18 + row / Math.max(1, rows - 1) * 0.64, y: side ? 0.78 : 0.2, color: index % colors };
      });
    const defaults = {
      hazards: [], rotators: [], gates: [], bumpers: [], windFields: [], splitters: [], portals: []
    };
    const thirdChapter = [
      { title: "圆心引力", targets: ringTargets(8), playfield: { type: "circle", cx: 0.5, cy: 0.5, radius: 0.39 }, magnetConstraint: { type: "circle", cx: 0.5, cy: 0.5, radius: 0.18 }, spawnZones: [{ type: "circle", cx: 0.5, cy: 0.5, radius: 0.1 }], hint: "circle" },
      { title: "四面来珠", targets: sideTargets(8, 2, true), magnetConstraint: { type: "free", minX: 0.27, maxX: 0.73, minY: 0.3, maxY: 0.72 }, spawnZones: [{ type: "circle", cx: 0.5, cy: 0.5, radius: 0.12 }], hint: "sides" },
      { title: "左右穿梭", targets: sideTargets(10, 2, true), targetMotion: { type: "pingpong", axis: "y", range: 0.055, speed: 0.85 }, magnetConstraint: { type: "horizontal", y: 0.52, minX: 0.22, maxX: 0.78 }, spawnZones: [{ type: "rect", x: 0.4, y: 0.72, width: 0.2, height: 0.1 }], hint: "horizontal" },
      { title: "上下倒置", targets: sideTargets(8, 2, false), magnetConstraint: { type: "vertical", x: 0.5, minY: 0.28, maxY: 0.76 }, spawnZones: [{ type: "circle", cx: 0.5, cy: 0.5, radius: 0.13 }], hint: "vertical" },
      { title: "环轨磁心", targets: ringTargets(10, 2, 0.35, 0.11), playfield: { type: "circle", cx: 0.5, cy: 0.5, radius: 0.4 }, magnetConstraint: { type: "ring", cx: 0.5, cy: 0.5, radiusX: 0.22, radiusY: 0.08 }, spawnZones: [{ type: "circle", cx: 0.5, cy: 0.5, radius: 0.09 }], hint: "ring" },
      { title: "旋转星环", targets: ringTargets(9, 3, 0.31, 0.1), targetMotion: { type: "orbit", cx: 0.5, cy: 0.5, speed: 0.24 }, magnetConstraint: { type: "circle", cx: 0.5, cy: 0.5, radius: 0.23 }, spawnZones: [{ type: "circle", cx: 0.5, cy: 0.5, radius: 0.06 }], hint: "movingTargets" },
      { title: "双环逆流", targets: ringTargets(10, 2, 0.32, 0.1).map((target, index) => ({ ...target, motionDirection: index % 2 ? -1 : 1 })), targetMotion: { type: "orbit", cx: 0.5, cy: 0.5, speed: 0.28 }, playfield: { type: "circle", cx: 0.5, cy: 0.5, radius: 0.4 }, magnetConstraint: { type: "circle", cx: 0.5, cy: 0.5, radius: 0.2 }, spawnZones: [{ type: "circle", cx: 0.5, cy: 0.5, radius: 0.08 }] },
      { title: "往返门阵", targets: sideTargets(10, 2, true), targetMotion: { type: "pingpong", axis: "y", range: 0.08, speed: 1.2 }, magnetConstraint: { type: "free", minX: 0.25, maxX: 0.75, minY: 0.28, maxY: 0.74 }, spawnZones: [{ type: "circle", cx: 0.5, cy: 0.55, radius: 0.1 }] },
      { title: "横轨逆风", targets: sideTargets(8, 2, true), targetMotion: { type: "pingpong", axis: "y", range: 0.055, speed: 0.85 }, magnetConstraint: { type: "horizontal", y: 0.58, minX: 0.16, maxX: 0.84 }, spawnZones: [{ type: "rect", x: 0.4, y: 0.72, width: 0.2, height: 0.08 }], windFields: [{ x: 0.08, y: 0.3, width: 0.84, height: 0.38, angle: 0, force: 0.18, phase: 0 }] },
      { title: "圆形迷宫", targets: ringTargets(10, 2), playfield: { type: "circle", cx: 0.5, cy: 0.5, radius: 0.4 }, magnetConstraint: { type: "circle", cx: 0.5, cy: 0.5, radius: 0.21 }, spawnZones: [{ type: "circle", cx: 0.5, cy: 0.5, radius: 0.09 }], bumpers: [{ x: 0.38, y: 0.5, radius: 0.055, strength: 2.2 }, { x: 0.62, y: 0.5, radius: 0.055, strength: 2.2 }], rotators: [{ x: 0.5, y: 0.5, length: 0.23, speed: 0.65, angle: 0 }] },
      { title: "磁极初试", targets: ringTargets(8, 2), magnetConstraint: { type: "circle", cx: 0.5, cy: 0.5, radius: 0.2 }, spawnZones: [{ type: "circle", cx: 0.5, cy: 0.5, radius: 0.08 }], polarity: true, hint: "polarity" },
      { title: "排斥弯道", targets: sideTargets(8, 2, true), magnetConstraint: { type: "free", minX: 0.2, maxX: 0.8, minY: 0.28, maxY: 0.76 }, spawnZones: [{ type: "circle", cx: 0.5, cy: 0.72, radius: 0.08 }], polarity: true, hazards: [{ x: 0.5, y: 0.5, radius: 0.09, phase: 0, moving: false }] },
      { title: "镜像双星", targets: ringTargets(10, 2), magnetConstraint: { type: "circle", cx: 0.5, cy: 0.5, radius: 0.22 }, spawnZones: [{ type: "circle", cx: 0.5, cy: 0.5, radius: 0.08 }], dualMagnet: true, hint: "dual" },
      { title: "空间跃迁", targets: sideTargets(8, 2, true), magnetConstraint: { type: "free", minX: 0.22, maxX: 0.78, minY: 0.3, maxY: 0.75 }, spawnZones: [{ type: "circle", cx: 0.5, cy: 0.72, radius: 0.08 }], portals: [{ x: 0.3, y: 0.6, pair: 1, color: 0 }, { x: 0.7, y: 0.38, pair: 0, color: 1 }], hint: "portal" },
      { title: "空间磁场", targets: ringTargets(12, 3), playfield: { type: "circle", cx: 0.5, cy: 0.5, radius: 0.41 }, magnetConstraint: { type: "ring", cx: 0.5, cy: 0.5, radiusX: 0.2, radiusY: 0.12 }, spawnZones: [{ type: "ring", cx: 0.5, cy: 0.5, radiusX: 0.09, radiusY: 0.045 }], targetMotion: { type: "orbit", cx: 0.5, cy: 0.5, speed: 0.18 }, polarity: true, dualMagnet: true, portals: [{ x: 0.27, y: 0.5, pair: 1, color: 0 }, { x: 0.73, y: 0.5, pair: 0, color: 1 }], hazards: [{ x: 0.5, y: 0.5, radius: 0.055, phase: 0, moving: false }], chapterFinale: true }
    ].map((level, offset) => ({
      ...defaults,
      ...level,
      stillSpawn: true,
      beadCount: level.targets.length,
      colorCount: Math.max(...level.targets.map((target) => target.color)) + 1,
      icon: LEVEL_ICONS[25 + offset]
    }));

    return [...firstChapter, ...secondChapter, ...thirdChapter];
  }

  const levels = makeLevels();

  function emptyCustomDraft() {
    return {
      template: "classic",
      polarity: false,
      dualMagnet: false,
      targetMotion: false,
      targets: [],
      hazards: [],
      bumpers: [],
      rotators: [],
      windFields: [],
      gates: [],
      portals: []
    };
  }

  function cloneCustomDraft(draft) {
    return JSON.parse(JSON.stringify(draft));
  }

  function loadCustomDraft() {
    try {
      const saved = JSON.parse(localStorage.getItem(CUSTOM_SAVE_KEY) || "null");
      editor.draft = saved && Array.isArray(saved.targets) ? {
        ...emptyCustomDraft(),
        ...saved
      } : emptyCustomDraft();
    } catch {
      editor.draft = emptyCustomDraft();
    }
  }

  function saveCustomDraft() {
    localStorage.setItem(CUSTOM_SAVE_KEY, JSON.stringify(editor.draft));
  }

  function customObstacleCount() {
    return editor.draft.hazards.length
      + editor.draft.bumpers.length
      + editor.draft.rotators.length
      + editor.draft.windFields.length
      + editor.draft.gates.length
      + editor.draft.portals.length;
  }

  function customTemplateConfig(template) {
    const configs = {
      classic: {},
      circle: {
        playfield: { type: "circle", cx: 0.5, cy: 0.5, radius: 0.4 },
        magnetConstraint: { type: "circle", cx: 0.5, cy: 0.5, radius: 0.2 },
        spawnZones: [{ type: "circle", cx: 0.5, cy: 0.5, radius: 0.09 }]
      },
      horizontal: {
        magnetConstraint: { type: "horizontal", y: 0.54, minX: 0.15, maxX: 0.85 },
        spawnZones: [{ type: "rect", x: 0.4, y: 0.72, width: 0.2, height: 0.08 }]
      },
      inverted: {
        magnetConstraint: { type: "vertical", x: 0.5, minY: 0.22, maxY: 0.78 },
        spawnZones: [{ type: "circle", cx: 0.5, cy: 0.42, radius: 0.1 }]
      },
      cross: {
        magnetConstraint: { type: "cross", x: 0.5, y: 0.5, minX: 0.25, maxX: 0.75, minY: 0.28, maxY: 0.74 },
        spawnZones: [{ type: "circle", cx: 0.5, cy: 0.5, radius: 0.1 }]
      }
    };
    return configs[template] || configs.classic;
  }

  function buildCustomLevel() {
    const draft = cloneCustomDraft(editor.draft);
    const template = customTemplateConfig(draft.template);
    return {
      title: "我的自定义关卡",
      icon: "✎",
      targets: draft.targets,
      hazards: draft.hazards,
      bumpers: draft.bumpers,
      rotators: draft.rotators,
      windFields: draft.windFields,
      gates: draft.gates,
      portals: draft.portals,
      splitters: [],
      beadCount: draft.targets.length,
      colorCount: Math.max(1, new Set(draft.targets.map((target) => target.color)).size),
      polarity: draft.polarity,
      dualMagnet: draft.dualMagnet,
      targetMotion: draft.targetMotion ? { type: "orbit", cx: 0.5, cy: 0.5, speed: 0.2 } : null,
      ...template,
      custom: true
    };
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    state.dpr = Math.min(2, window.devicePixelRatio || 1);
    state.width = rect.width;
    state.height = rect.height;
    canvas.width = Math.round(rect.width * state.dpr);
    canvas.height = Math.round(rect.height * state.dpr);
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    if (state.level) resetLevel(false);
    if (customEditor.classList.contains("open")) resizeCustomCanvas();
    requestRender();
  }

  function toWorldX(normalized) {
    return normalized * state.width;
  }

  function toWorldY(normalized) {
    return normalized * state.height;
  }

  function levelConfig(level) {
    return {
      playfield: level.playfield || { type: "rect", x: 0.035, y: 0.12, width: 0.93, height: 0.76 },
      magnetConstraint: level.magnetConstraint || { type: "free", minX: 0.08, maxX: 0.92, minY: 0.38, maxY: 0.9 },
      spawnZones: level.spawnZones || [{ type: "circle", cx: 0.5, cy: 0.78, radius: 0.12 }],
      portals: level.portals || []
    };
  }

  function constrainMagnet(x, y) {
    const constraint = levelConfig(state.level).magnetConstraint;
    if (constraint.type === "horizontal") {
      return { x: Math.max(toWorldX(constraint.minX), Math.min(toWorldX(constraint.maxX), x)), y: toWorldY(constraint.y) };
    }
    if (constraint.type === "vertical") {
      return { x: toWorldX(constraint.x), y: Math.max(toWorldY(constraint.minY), Math.min(toWorldY(constraint.maxY), y)) };
    }
    if (constraint.type === "circle") {
      const cx = toWorldX(constraint.cx);
      const cy = toWorldY(constraint.cy);
      const radius = constraint.radius * Math.min(state.width, state.height);
      const dx = x - cx;
      const dy = y - cy;
      const distance = Math.hypot(dx, dy);
      return distance <= radius ? { x, y } : { x: cx + dx / distance * radius, y: cy + dy / distance * radius };
    }
    if (constraint.type === "ring") {
      const cx = toWorldX(constraint.cx);
      const cy = toWorldY(constraint.cy);
      const rx = toWorldX(constraint.radiusX);
      const ry = toWorldY(constraint.radiusY);
      const angle = Math.atan2((y - cy) / Math.max(1, ry), (x - cx) / Math.max(1, rx));
      return { x: cx + Math.cos(angle) * rx, y: cy + Math.sin(angle) * ry };
    }
    if (constraint.type === "cross") {
      const cx = toWorldX(constraint.x);
      const cy = toWorldY(constraint.y);
      if (Math.abs(x - cx) < Math.abs(y - cy)) {
        return { x: cx, y: Math.max(toWorldY(constraint.minY), Math.min(toWorldY(constraint.maxY), y)) };
      }
      return { x: Math.max(toWorldX(constraint.minX), Math.min(toWorldX(constraint.maxX), x)), y: cy };
    }
    return {
      x: Math.max(toWorldX(constraint.minX), Math.min(toWorldX(constraint.maxX), x)),
      y: Math.max(toWorldY(constraint.minY), Math.min(toWorldY(constraint.maxY), y))
    };
  }

  function spawnPoint(zone, index, total, rand) {
    if (zone.type === "rect") {
      return { x: toWorldX(zone.x + rand() * zone.width), y: toWorldY(zone.y + rand() * zone.height) };
    }
    if (zone.type === "ring") {
      const angle = index / Math.max(1, total) * TAU + rand() * 0.2;
      return { x: toWorldX(zone.cx + Math.cos(angle) * zone.radiusX), y: toWorldY(zone.cy + Math.sin(angle) * zone.radiusY) };
    }
    if (zone.type === "points" && zone.points?.length) {
      const point = zone.points[index % zone.points.length];
      return { x: toWorldX(point.x), y: toWorldY(point.y) };
    }
    const angle = index / Math.max(1, total) * TAU + rand() * 0.4;
    const radius = (zone.radius || 0.1) * state.width * Math.sqrt(rand());
    return {
      x: toWorldX(zone.cx) + Math.cos(angle) * radius,
      y: toWorldY(zone.cy) + Math.sin(angle) * radius * 0.65
    };
  }

  function resetLevel(animate = true) {
    const level = state.customMode ? state.customLevel : levels[state.levelIndex];
    const rand = seeded(state.customMode ? 909 : state.levelIndex + 41);
    const beadColors = level.spawnColors ? [...level.spawnColors] : level.targets.map((target) => target.color);
    for (let index = beadColors.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(rand() * (index + 1));
      [beadColors[index], beadColors[swapIndex]] = [beadColors[swapIndex], beadColors[index]];
    }
    state.level = level;
    state.status = "playing";
    state.statusAt = 0;
    state.failurePoint = null;
    state.resultShown = false;
    state.startAt = performance.now();
    state.levelCaptureCount = 0;
    state.tutorialAlpha = state.hintsEnabled && !state.customMode && state.levelIndex === 0 ? 1 : 0;
    const legacyHint = !state.customMode && [20, 21, 23].includes(state.levelIndex)
      ? (state.levelIndex === 20 ? "bumper" : state.levelIndex === 21 ? "wind" : "splitter")
      : null;
    const hintType = level.hint || legacyHint;
    state.mechanismHint = state.hintsEnabled && hintType && !state.shownHints.has(hintType) ? { type: hintType, alpha: 1 } : null;
    if (state.hintsEnabled && hintType) state.shownHints.add(hintType);
    state.targets = level.targets.map((target, index) => ({
      ...target,
      x: toWorldX(target.x),
      y: toWorldY(target.y),
      baseX: toWorldX(target.baseX ?? target.x),
      baseY: toWorldY(target.baseY ?? target.y),
      radius: Math.max(12, state.width * 0.038),
      filled: false,
      fillScale: 0,
      index
    }));
    state.beads = Array.from({ length: level.beadCount }, (_, index) => {
      const zones = levelConfig(level).spawnZones;
      const point = spawnPoint(zones[index % zones.length], index, level.beadCount, rand);
      return {
        x: point.x,
        y: point.y,
        vx: level.stillSpawn ? 0 : (rand() - 0.5) * 0.5,
        vy: level.stillSpawn ? 0 : (rand() - 0.5) * 0.5,
        radius: Math.max(7, state.width * 0.018),
        color: beadColors[index],
        captured: false,
        hasSplit: false,
        splitCount: level.splitCount || 1,
        lastBumpAt: 0,
        lastPortalAt: 0,
        trail: []
      };
    });
    const startConstraint = levelConfig(level).magnetConstraint;
    const start = constrainMagnet(
      toWorldX(startConstraint.startX ?? startConstraint.cx ?? startConstraint.x ?? 0.5),
      toWorldY(startConstraint.startY ?? startConstraint.cy ?? startConstraint.y ?? 0.87)
    );
    state.magnet.x = start.x;
    state.magnet.y = start.y;
    state.magnet.active = false;
    state.magnet.polarity = 1;
    state.effects = [];
    state.ripples = animate ? [{ x: state.width / 2, y: state.height * 0.45, radius: 10, alpha: 0.22, speed: 2.4 }] : [];
    state.cameraShake = 0;
    levelNumber.textContent = state.customMode ? "自定" : String(state.levelIndex + 1);
    progressFill.style.width = "0%";
    progressTrack.setAttribute("aria-valuenow", "0");
    setElementAvailable(polarityButton, Boolean(level.polarity && state.started));
    polarityButton.classList.remove("repulse");
    polarityButton.querySelector("strong").textContent = "吸";
    requestRender();
  }

  function initAudio() {
    if (state.audio) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) state.audio = new AudioContext();
  }

  function tone(frequency, duration = 0.08, volume = 0.035, type = "sine", delay = 0) {
    if (!state.audio || !state.soundEnabled) return;
    const now = state.audio.currentTime + delay;
    const oscillator = state.audio.createOscillator();
    const gain = state.audio.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.12, now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(gain).connect(state.audio.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  function marimbaNote(frequency, delay = 0, strong = false, volumeScale = 1) {
    if (!state.audio || !state.soundEnabled) return;
    const now = state.audio.currentTime + delay;
    const duration = strong ? 0.28 : 0.2;
    const bodyVolume = (strong ? 0.055 : 0.04) * volumeScale;

    const body = state.audio.createOscillator();
    const bodyGain = state.audio.createGain();
    body.type = "sine";
    body.frequency.setValueAtTime(frequency * 1.03, now);
    body.frequency.exponentialRampToValueAtTime(frequency * 0.98, now + duration);
    bodyGain.gain.setValueAtTime(0.001, now);
    bodyGain.gain.exponentialRampToValueAtTime(bodyVolume, now + 0.004);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    body.connect(bodyGain).connect(state.audio.destination);
    body.start(now);
    body.stop(now + duration + 0.01);

    const knock = state.audio.createOscillator();
    const knockGain = state.audio.createGain();
    const filter = state.audio.createBiquadFilter();
    knock.type = "triangle";
    knock.frequency.setValueAtTime(frequency * 3, now);
    filter.type = "lowpass";
    filter.frequency.value = 2400;
    knockGain.gain.setValueAtTime(0.012 * volumeScale, now);
    knockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    knock.connect(filter).connect(knockGain).connect(state.audio.destination);
    knock.start(now);
    knock.stop(now + 0.08);
  }

  function capturePitch(position, total) {
    const progress = total <= 1 ? 1 : position / (total - 1);
    return 261.63 * Math.pow(392 / 261.63, progress);
  }

  function playFinishSound() {
    marimbaNote(392, 0, true);
    marimbaNote(523.25, 0.09, true);
    marimbaNote(659.25, 0.18, true);
    marimbaNote(783.99, 0.28, true);
  }

  function vibrate(pattern) {
    if (state.vibrationEnabled && navigator.vibrate) navigator.vibrate(pattern);
  }

  function pointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  canvas.addEventListener("pointerdown", (event) => {
    if (!state.started || state.uiPaused || gallery.classList.contains("open") || levelSelector.classList.contains("open") || state.status !== "playing") return;
    initAudio();
    canvas.setPointerCapture(event.pointerId);
    const point = pointerPosition(event);
    state.pointer = { ...point, down: true };
    state.magnet.active = true;
    const constrained = constrainMagnet(point.x, point.y);
    state.magnet.x = constrained.x;
    state.magnet.y = constrained.y;
    state.tutorialAlpha = 0;
    marimbaNote(261.63, 0, false, 0.55);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!state.pointer.down || state.status !== "playing") return;
    const point = pointerPosition(event);
    state.pointer.x = point.x;
    state.pointer.y = point.y;
    const constrained = constrainMagnet(point.x, point.y);
    state.magnet.x += (constrained.x - state.magnet.x) * 0.72;
    state.magnet.y += (constrained.y - state.magnet.y) * 0.72;
  });

  function releasePointer() {
    state.pointer.down = false;
    state.magnet.active = false;
  }

  canvas.addEventListener("pointerup", releasePointer);
  canvas.addEventListener("pointercancel", releasePointer);

  function setElementAvailable(element, available) {
    element.inert = !available;
    element.setAttribute("aria-hidden", String(!available));
  }

  function focusableElements(container) {
    return [...container.querySelectorAll("button:not(:disabled), [href], input:not(:disabled), [tabindex]:not([tabindex='-1'])")]
      .filter((element) => !element.inert && element.getClientRects().length > 0);
  }

  function openDialog(dialog, initialFocus, returnFocus = document.activeElement) {
    if (activeDialog && activeDialog !== dialog) closeDialog(activeDialog, false, false);
    releasePointer();
    activeDialog = dialog;
    dialogReturnFocus = returnFocus instanceof HTMLElement ? returnFocus : null;
    dialog.inert = false;
    dialog.classList.add("open");
    dialog.setAttribute("aria-hidden", "false");
    state.uiPaused = true;
    syncAnimation();
    requestAnimationFrame(() => initialFocus?.focus());
  }

  function closeDialog(dialog, resume = true, restoreFocus = true) {
    dialog.classList.remove("open");
    dialog.setAttribute("aria-hidden", "true");
    dialog.inert = true;
    if (activeDialog === dialog) activeDialog = null;
    if (resume && state.started) state.uiPaused = false;
    syncAnimation();
    if (restoreFocus && dialogReturnFocus?.isConnected && !dialogReturnFocus.closest("[inert]")) {
      dialogReturnFocus.focus();
    }
    dialogReturnFocus = null;
  }

  function resizeCustomCanvas() {
    const rect = customCanvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    editor.dpr = Math.min(2, window.devicePixelRatio || 1);
    editor.width = rect.width;
    editor.height = rect.height;
    customCanvas.width = Math.round(rect.width * editor.dpr);
    customCanvas.height = Math.round(rect.height * editor.dpr);
    customCtx.setTransform(editor.dpr, 0, 0, editor.dpr, 0, 0);
    drawCustomEditor();
  }

  function drawEditorCircle(x, y, radius, fill, stroke = "rgba(255,255,255,.78)") {
    customCtx.beginPath();
    customCtx.arc(x, y, radius, 0, TAU);
    customCtx.fillStyle = fill;
    customCtx.fill();
    customCtx.strokeStyle = stroke;
    customCtx.lineWidth = 2;
    customCtx.stroke();
  }

  function drawCustomEditor() {
    if (!editor.width || !editor.height || !editor.draft) return;
    const width = editor.width;
    const height = editor.height;
    const gradient = customCtx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#f4fffe");
    gradient.addColorStop(1, "#d7f5f2");
    customCtx.fillStyle = gradient;
    customCtx.fillRect(0, 0, width, height);

    const template = customTemplateConfig(editor.draft.template);
    if (template.playfield?.type === "circle") {
      customCtx.fillStyle = "rgba(255,255,255,.2)";
      customCtx.strokeStyle = "rgba(255,255,255,.75)";
      customCtx.lineWidth = 2;
      customCtx.beginPath();
      customCtx.arc(template.playfield.cx * width, template.playfield.cy * height, template.playfield.radius * Math.min(width, height), 0, TAU);
      customCtx.fill();
      customCtx.stroke();
    }
    if (editor.draft.template === "cross") {
      customCtx.strokeStyle = "rgba(123,103,235,.25)";
      customCtx.setLineDash([5, 6]);
      customCtx.beginPath();
      customCtx.moveTo(width * 0.28, height * 0.5);
      customCtx.lineTo(width * 0.72, height * 0.5);
      customCtx.moveTo(width * 0.5, height * 0.3);
      customCtx.lineTo(width * 0.5, height * 0.72);
      customCtx.stroke();
      customCtx.setLineDash([]);
    }

    customCtx.save();
    customCtx.setLineDash([5, 7]);
    customCtx.strokeStyle = "rgba(112,89,217,.22)";
    customCtx.lineWidth = 1.5;
    customCtx.beginPath();
    customCtx.moveTo(18, height * 0.76);
    customCtx.lineTo(width - 18, height * 0.76);
    customCtx.stroke();
    customCtx.setLineDash([]);
    customCtx.fillStyle = "rgba(82,116,122,.55)";
    customCtx.font = "700 10px system-ui";
    customCtx.textAlign = "right";
    customCtx.fillText("珠子出生区", width - 20, height * 0.76 + 16);
    customCtx.restore();

    for (const field of editor.draft.windFields) {
      const x = field.x * width;
      const y = field.y * height;
      const fieldWidth = field.width * width;
      const fieldHeight = field.height * height;
      customCtx.fillStyle = "rgba(88,205,213,.12)";
      customCtx.strokeStyle = "rgba(69,181,194,.42)";
      customCtx.setLineDash([5, 5]);
      customCtx.beginPath();
      customCtx.roundRect(x, y, fieldWidth, fieldHeight, 18);
      customCtx.fill();
      customCtx.stroke();
      customCtx.setLineDash([]);
      customCtx.fillStyle = "#55bfc9";
      customCtx.font = "700 24px system-ui";
      customCtx.textAlign = "center";
      customCtx.fillText("↑", x + fieldWidth / 2, y + fieldHeight / 2 + 8);
    }

    for (const gate of editor.draft.gates) {
      const y = gate.y * height;
      const left = width * (0.5 - gate.gap / 2);
      const right = width * (0.5 + gate.gap / 2);
      customCtx.strokeStyle = "#7563d6";
      customCtx.lineWidth = 8;
      customCtx.lineCap = "round";
      customCtx.beginPath();
      customCtx.moveTo(18, y);
      customCtx.lineTo(left, y);
      customCtx.moveTo(right, y);
      customCtx.lineTo(width - 18, y);
      customCtx.stroke();
    }

    for (const rotator of editor.draft.rotators) {
      const x = rotator.x * width;
      const y = rotator.y * height;
      const half = rotator.length * width / 2;
      customCtx.strokeStyle = "#8069df";
      customCtx.lineWidth = 9;
      customCtx.lineCap = "round";
      customCtx.beginPath();
      customCtx.moveTo(x - half, y);
      customCtx.lineTo(x + half, y);
      customCtx.stroke();
      drawEditorCircle(x, y, 8, "#fff", "#8069df");
    }

    for (const bumper of editor.draft.bumpers) {
      drawEditorCircle(bumper.x * width, bumper.y * height, bumper.radius * width, "#6dd8d2");
      customCtx.fillStyle = "#fff";
      customCtx.font = "700 18px system-ui";
      customCtx.textAlign = "center";
      customCtx.fillText("↗", bumper.x * width, bumper.y * height + 6);
    }

    for (const hazard of editor.draft.hazards) {
      drawEditorCircle(hazard.x * width, hazard.y * height, hazard.radius * width, "#ef6f9b");
      customCtx.fillStyle = "#fff";
      customCtx.font = "800 17px system-ui";
      customCtx.textAlign = "center";
      customCtx.fillText("!", hazard.x * width, hazard.y * height + 6);
    }

    for (let index = 0; index < editor.draft.portals.length; index++) {
      const portal = editor.draft.portals[index];
      const x = portal.x * width;
      const y = portal.y * height;
      customCtx.strokeStyle = index % 2 ? "#55d5cf" : "#8b74ed";
      customCtx.lineWidth = 5;
      customCtx.beginPath();
      customCtx.arc(x, y, width * 0.05, 0, TAU);
      customCtx.stroke();
      customCtx.fillStyle = customCtx.strokeStyle;
      customCtx.font = "700 11px system-ui";
      customCtx.textAlign = "center";
      customCtx.fillText(String(Math.floor(index / 2) + 1), x, y + 4);
    }

    for (const target of editor.draft.targets) {
      const x = target.x * width;
      const y = target.y * height;
      drawEditorCircle(x, y, Math.max(12, width * 0.038), "rgba(255,255,255,.64)", COLORS[target.color]);
      drawEditorCircle(x, y, Math.max(5, width * 0.014), COLORS[target.color], COLORS[target.color]);
    }
  }

  function updateCustomEditorMeta(message = "") {
    const targets = editor.draft.targets.length;
    const obstacles = customObstacleCount();
    customObjectCount.textContent = `${targets} 个果冻墙 · ${obstacles} 个障碍`;
    undoCustomEdit.disabled = editor.history.length === 0;
    customEditorHint.textContent = message || (targets ? "点击画面继续摆放，选择橡皮擦可删除" : "先摆放至少一个果冻墙");
    customEditorHint.classList.remove("hidden");
    clearTimeout(updateCustomEditorMeta.timer);
    updateCustomEditorMeta.timer = setTimeout(() => {
      if (editor.draft.targets.length || customObstacleCount()) customEditorHint.classList.add("hidden");
    }, 1800);
  }

  function syncCustomOptions() {
    customTemplate.value = editor.draft.template || "classic";
    customPolarityToggle.setAttribute("aria-pressed", String(Boolean(editor.draft.polarity)));
    customDualToggle.setAttribute("aria-pressed", String(Boolean(editor.draft.dualMagnet)));
    customMotionToggle.setAttribute("aria-pressed", String(Boolean(editor.draft.targetMotion)));
  }

  function commitCustomEdit(mutator) {
    editor.history.push(cloneCustomDraft(editor.draft));
    editor.history = editor.history.slice(-30);
    mutator();
    saveCustomDraft();
    drawCustomEditor();
    updateCustomEditorMeta();
  }

  function editorPoint(event) {
    const rect = customCanvas.getBoundingClientRect();
    return {
      x: Math.max(0.05, Math.min(0.95, (event.clientX - rect.left) / rect.width)),
      y: Math.max(0.08, Math.min(0.88, (event.clientY - rect.top) / rect.height))
    };
  }

  function eraseNearestCustomObject(point) {
    const candidates = [];
    const addCandidates = (type, objects, position) => {
      objects.forEach((object, index) => {
        const objectPoint = position(object);
        candidates.push({
          type,
          index,
          distance: Math.hypot((objectPoint.x - point.x) * editor.width, (objectPoint.y - point.y) * editor.height)
        });
      });
    };
    addCandidates("targets", editor.draft.targets, (item) => item);
    addCandidates("hazards", editor.draft.hazards, (item) => item);
    addCandidates("bumpers", editor.draft.bumpers, (item) => item);
    addCandidates("rotators", editor.draft.rotators, (item) => item);
    addCandidates("windFields", editor.draft.windFields, (item) => ({ x: item.x + item.width / 2, y: item.y + item.height / 2 }));
    addCandidates("gates", editor.draft.gates, (item) => ({ x: 0.5, y: item.y }));
    addCandidates("portals", editor.draft.portals, (item) => item);
    candidates.sort((a, b) => a.distance - b.distance);
    if (!candidates.length || candidates[0].distance > 58) {
      updateCustomEditorMeta("这里没有可删除的对象");
      return;
    }
    commitCustomEdit(() => {
      const candidate = candidates[0];
      if (candidate.type === "portals") {
        const pairStart = candidate.index - candidate.index % 2;
        editor.draft.portals.splice(pairStart, Math.min(2, editor.draft.portals.length - pairStart));
        editor.draft.portals.forEach((portal, index) => {
          portal.pair = index % 2 ? index - 1 : index + 1;
          portal.color = index % 2;
        });
      } else {
        editor.draft[candidate.type].splice(candidate.index, 1);
      }
    });
  }

  function placeCustomObject(point) {
    if (editor.tool === "erase") {
      eraseNearestCustomObject(point);
      return;
    }
    if (editor.tool === "target" && editor.draft.targets.length >= 30) {
      updateCustomEditorMeta("果冻墙最多摆放 30 个");
      return;
    }
    if (editor.tool !== "target" && customObstacleCount() >= 16) {
      updateCustomEditorMeta("障碍物最多摆放 16 个");
      return;
    }
    commitCustomEdit(() => {
      if (editor.tool === "target") {
        editor.draft.targets.push({ x: point.x, y: Math.min(0.72, point.y), color: editor.color });
      } else if (editor.tool === "hazard") {
        editor.draft.hazards.push({ x: point.x, y: point.y, radius: 0.06, phase: 0, moving: false });
      } else if (editor.tool === "bumper") {
        editor.draft.bumpers.push({ x: point.x, y: point.y, radius: 0.07, strength: 2.3 });
      } else if (editor.tool === "rotator") {
        editor.draft.rotators.push({ x: point.x, y: point.y, length: 0.27, speed: 0.65, angle: 0 });
      } else if (editor.tool === "wind") {
        editor.draft.windFields.push({
          x: Math.max(0.04, Math.min(0.52, point.x - 0.22)),
          y: Math.max(0.16, Math.min(0.64, point.y - 0.12)),
          width: 0.44,
          height: 0.24,
          angle: -Math.PI / 2,
          force: 0.2,
          phase: 0
        });
      } else if (editor.tool === "gate") {
        editor.draft.gates.push({ x: 0.5, y: point.y, gap: 0.22, direction: 1 });
      } else if (editor.tool === "portal") {
        const index = editor.draft.portals.length;
        editor.draft.portals.push({ x: point.x, y: point.y, pair: index % 2 ? index - 1 : index + 1, color: index % 2 });
      }
    });
    marimbaNote(349.23 + editor.draft.targets.length * 8, 0, false, 0.38);
  }

  function openCustomEditorMode(returnTo = state.started ? "game" : "home") {
    if (activeDialog) closeDialog(activeDialog, false, false);
    releasePointer();
    state.editorReturn = returnTo;
    state.uiPaused = true;
    setElementAvailable(hud, false);
    startScreen.inert = true;
    customEditor.inert = false;
    customEditor.classList.add("open");
    customEditor.setAttribute("aria-hidden", "false");
    editor.history = [];
    syncCustomOptions();
    updateCustomEditorMeta();
    syncAnimation();
    requestAnimationFrame(() => {
      resizeCustomCanvas();
      playCustomLevel.focus();
    });
  }

  function closeCustomEditorMode() {
    customEditor.classList.remove("open");
    customEditor.setAttribute("aria-hidden", "true");
    customEditor.inert = true;
    if (state.editorReturn === "game" && state.started) {
      setElementAvailable(hud, true);
      state.uiPaused = false;
      menuButton.focus();
      syncAnimation();
    } else {
      state.customMode = false;
      refreshStartScreen();
      setStarted(false);
      startScreen.inert = false;
      customModeButton.focus();
    }
  }

  function setStarted(started) {
    state.started = started;
    state.uiPaused = !started;
    startScreen.classList.toggle("hidden", started);
    startScreen.inert = started;
    setElementAvailable(hud, started);
    setElementAvailable(polarityButton, Boolean(started && state.level?.polarity));
    if (started) {
      initAudio();
      if (state.audio?.state === "suspended") state.audio.resume();
    }
    syncAnimation();
  }

  polarityButton.addEventListener("click", () => {
    if (!state.level?.polarity) return;
    state.magnet.polarity *= -1;
    const repulse = state.magnet.polarity < 0;
    polarityButton.classList.toggle("repulse", repulse);
    polarityButton.setAttribute("aria-pressed", String(repulse));
    polarityButton.querySelector("strong").textContent = repulse ? "斥" : "吸";
    vibrate(repulse ? [8, 18, 8] : 10);
    marimbaNote(repulse ? 293.66 : 440, 0, false, 0.65);
  });

  function openMenu() {
    openDialog(gameMenu, resumeButton, menuButton);
  }

  function hideMenu(resume = true) {
    closeDialog(gameMenu, resume);
  }

  function updateSettingButtons() {
    const syncToggle = (button, enabled) => {
      button.querySelector(".toggle").classList.toggle("on", enabled);
      button.setAttribute("aria-pressed", String(enabled));
    };
    syncToggle(soundToggle, state.soundEnabled);
    syncToggle(vibrationToggle, state.vibrationEnabled);
    syncToggle(settingsSoundToggle, state.soundEnabled);
    syncToggle(settingsVibrationToggle, state.vibrationEnabled);
    syncToggle(hintsToggle, state.hintsEnabled);
    syncToggle(reducedMotionToggle, state.reducedMotion);
    document.body.classList.toggle("reduced-motion", state.reducedMotion);
    developerBadge.textContent = state.developerMode ? "已开启" : "未开启";
    developerBadge.classList.toggle("on", state.developerMode);
    developerModeButton.textContent = state.developerMode ? "关闭" : "开启";
    developerPassword.disabled = state.developerMode;
    developerPassword.placeholder = state.developerMode ? "已验证" : "输入密码";
  }

  function refreshStartScreen() {
    const completedCount = state.completed.size;
    startProgress.textContent = `已完成 ${completedCount} / ${levels.length}`;
    startButton.textContent = completedCount > 0 ? `继续第 ${state.levelIndex + 1} 关` : "开始游戏";
  }

  startButton.addEventListener("click", () => {
    state.customMode = false;
    setStarted(true);
    resetLevel();
  });

  customModeButton.addEventListener("click", () => openCustomEditorMode("home"));

  function openSettings() {
    developerPassword.value = "";
    developerMessage.textContent = "";
    developerMessage.classList.remove("success");
    updateSettingButtons();
    openDialog(settingsDialog, state.developerMode ? developerModeButton : developerPassword, startSettingsButton);
  }

  function hideSettings() {
    closeDialog(settingsDialog, false);
  }

  startSettingsButton.addEventListener("click", openSettings);
  closeSettings.addEventListener("click", hideSettings);
  settingsDialog.addEventListener("click", (event) => {
    if (event.target === settingsDialog) hideSettings();
  });

  startLevelButton.addEventListener("click", () => {
    startScreen.classList.add("hidden");
    startScreen.inert = true;
    renderLevelSelector();
    openDialog(levelSelector, levelGrid.querySelector(".current:not(:disabled)") || closeLevelSelector, startLevelButton);
  });

  menuButton.addEventListener("click", openMenu);
  closeMenu.addEventListener("click", () => hideMenu(true));
  gameMenu.addEventListener("click", (event) => {
    if (event.target === gameMenu) hideMenu(true);
  });
  resumeButton.addEventListener("click", () => hideMenu(true));

  restartButton.addEventListener("click", () => {
    hideMenu(true);
    resetLevel();
  });

  menuLevelButton.addEventListener("click", () => {
    closeDialog(gameMenu, false, false);
    renderLevelSelector();
    openDialog(levelSelector, levelGrid.querySelector(".current:not(:disabled)") || closeLevelSelector, menuButton);
  });

  homeButton.addEventListener("click", () => {
    hideMenu(false);
    state.customMode = false;
    refreshStartScreen();
    setStarted(false);
  });

  customMenuButton.addEventListener("click", () => openCustomEditorMode("game"));

  soundToggle.addEventListener("click", () => {
    state.soundEnabled = !state.soundEnabled;
    updateSettingButtons();
    saveProgress();
    if (state.soundEnabled) {
      initAudio();
      marimbaNote(440, 0, false, 0.75);
    }
  });

  settingsSoundToggle.addEventListener("click", () => {
    state.soundEnabled = !state.soundEnabled;
    updateSettingButtons();
    saveProgress();
    if (state.soundEnabled) {
      initAudio();
      marimbaNote(440, 0, false, 0.75);
    }
  });

  vibrationToggle.addEventListener("click", () => {
    state.vibrationEnabled = !state.vibrationEnabled;
    updateSettingButtons();
    saveProgress();
    if (state.vibrationEnabled) vibrate(12);
  });

  settingsVibrationToggle.addEventListener("click", () => {
    state.vibrationEnabled = !state.vibrationEnabled;
    updateSettingButtons();
    saveProgress();
    if (state.vibrationEnabled) vibrate(12);
  });

  hintsToggle.addEventListener("click", () => {
    state.hintsEnabled = !state.hintsEnabled;
    if (!state.hintsEnabled) {
      state.tutorialAlpha = 0;
      state.mechanismHint = null;
    } else {
      state.shownHints.clear();
    }
    updateSettingButtons();
    saveProgress();
  });

  reducedMotionToggle.addEventListener("click", () => {
    state.reducedMotion = !state.reducedMotion;
    if (state.reducedMotion) state.cameraShake = 0;
    updateSettingButtons();
    saveProgress();
    requestRender();
  });

  function setDeveloperMessage(message, success = false) {
    developerMessage.textContent = message;
    developerMessage.classList.toggle("success", success);
  }

  function toggleDeveloperMode() {
    if (state.developerMode) {
      state.developerMode = false;
      state.levelIndex = Math.min(state.levelIndex, state.bestUnlocked);
      setDeveloperMessage("开发者模式已关闭，关卡恢复正常锁定。", true);
    } else if (developerPassword.value === "6004") {
      state.developerMode = true;
      developerPassword.value = "";
      setDeveloperMessage("开发者模式已开启，全部关卡可直接选择。", true);
    } else {
      developerPassword.select();
      setDeveloperMessage("密码错误，请重新输入。");
      vibrate([18, 30, 18]);
      return;
    }
    updateSettingButtons();
    refreshStartScreen();
    renderLevelSelector();
    saveProgress();
  }

  developerModeButton.addEventListener("click", toggleDeveloperMode);
  developerPassword.addEventListener("keydown", (event) => {
    if (event.key === "Enter") toggleDeveloperMode();
  });

  resetProgressButton.addEventListener("click", () => {
    if (!window.confirm("确定要清空所有通关记录并从第 1 关重新开始吗？")) return;
    state.completed.clear();
    state.bestUnlocked = 0;
    state.levelIndex = 0;
    state.shownHints.clear();
    refreshStartScreen();
    renderLevelSelector();
    renderGallery();
    saveProgress();
    setDeveloperMessage("游戏进度已重置。", true);
  });

  levelSelectButton.addEventListener("click", () => {
    hideGallery();
    renderLevelSelector();
    openDialog(levelSelector, levelGrid.querySelector(".current:not(:disabled)") || closeLevelSelector, levelSelectButton);
  });

  closeLevelSelector.addEventListener("click", hideLevelSelector);
  levelSelector.addEventListener("click", (event) => {
    if (event.target === levelSelector) hideLevelSelector();
  });

  galleryButton.addEventListener("click", () => {
    closeDialog(gameMenu, false, false);
    renderGallery();
    openDialog(gallery, closeGallery, menuButton);
  });

  closeGallery.addEventListener("click", hideGallery);
  gallery.addEventListener("click", (event) => {
    if (event.target === gallery) hideGallery();
  });

  function hideGallery() {
    if (!gallery.classList.contains("open")) return;
    closeDialog(gallery, true);
  }

  function hideLevelSelector() {
    if (!levelSelector.classList.contains("open")) return;
    closeDialog(levelSelector, true, false);
    if (!state.started) {
      startScreen.classList.remove("hidden");
      startScreen.inert = false;
      startLevelButton.focus();
    } else {
      levelSelectButton.focus();
    }
  }

  function renderLevelSelector() {
    levelGrid.innerHTML = levels.map((level, index) => {
      const unlocked = state.developerMode || index <= state.bestUnlocked || state.completed.has(index);
      const classes = [
        "level-choice",
        index === state.levelIndex ? "current" : "",
        state.completed.has(index) ? "completed" : ""
      ].filter(Boolean).join(" ");
      return `<button class="${classes}" data-level="${index}" ${unlocked ? "" : "disabled"} aria-label="${unlocked ? `进入第 ${index + 1} 关` : `第 ${index + 1} 关未解锁`}">${unlocked ? index + 1 : "·"}</button>`;
    }).join("");
  }

  levelGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".level-choice:not(:disabled)");
    if (!button) return;
    state.customMode = false;
    state.levelIndex = Number(button.dataset.level);
    saveProgress();
    hideLevelSelector();
    setStarted(true);
    resetLevel();
  });

  function renderGallery() {
    badgeGrid.innerHTML = levels.map((level, index) => {
      const unlocked = state.completed.has(index);
      const hue = (index * 31 + 245) % 360;
      return `<div class="badge ${unlocked ? "unlocked" : ""}" style="--badge-bg:linear-gradient(145deg,hsl(${hue} 86% 76%),hsl(${hue + 35} 72% 57%))">
        <span>${unlocked ? level.icon : "?"}</span><small>${index + 1}</small>
      </div>`;
    }).join("");
  }

  function showResultScreen() {
    if (state.resultShown) return;
    state.resultShown = true;
    if (state.customMode) {
      resultIcon.textContent = "✎";
      resultTitle.textContent = "自定义挑战完成";
      resultMessage.textContent = "你的机关组合可以顺利通关。继续调整布局，或者再挑战一次。";
      nextLevelButton.textContent = "返回编辑";
      resultRestartButton.textContent = "再玩一次";
      resultLevelButton.textContent = "返回首页";
      openDialog(resultScreen, nextLevelButton, levelSelectButton);
      return;
    }
    const finalLevel = state.levelIndex === levels.length - 1;
    resultIcon.textContent = state.level.icon;
    resultTitle.textContent = state.developerMode
      ? `第 ${state.levelIndex + 1} 关调试完成`
      : finalLevel ? "全部图案完成" : `第 ${state.levelIndex + 1} 关完成`;
    resultMessage.textContent = state.developerMode
      ? "开发者模式不会写入徽章、通关记录或正常解锁进度。"
      : finalLevel
        ? `${levels.length} 枚果冻徽章都已点亮。三章磁力旅程已经完整通关。`
        : "新的果冻徽章已经收进徽章墙，下一幅图案也已解锁。";
    nextLevelButton.textContent = finalLevel ? "返回首页" : "下一关";
    resultRestartButton.textContent = "再玩一次";
    resultLevelButton.textContent = "选择关卡";
    openDialog(resultScreen, nextLevelButton, levelSelectButton);
  }

  nextLevelButton.addEventListener("click", () => {
    if (state.customMode) {
      closeDialog(resultScreen, false, false);
      openCustomEditorMode("home");
      return;
    }
    const finalLevel = state.levelIndex === levels.length - 1;
    closeDialog(resultScreen, false, false);
    if (finalLevel) {
      refreshStartScreen();
      setStarted(false);
      startButton.focus();
      return;
    }
    state.levelIndex += 1;
    saveProgress();
    state.uiPaused = false;
    resetLevel();
    syncAnimation();
  });

  resultRestartButton.addEventListener("click", () => {
    closeDialog(resultScreen, false, false);
    state.uiPaused = false;
    resetLevel();
    syncAnimation();
  });

  resultLevelButton.addEventListener("click", () => {
    closeDialog(resultScreen, false, false);
    if (state.customMode) {
      state.customMode = false;
      refreshStartScreen();
      setStarted(false);
      startButton.focus();
      return;
    }
    renderLevelSelector();
    openDialog(levelSelector, levelGrid.querySelector(".current:not(:disabled)") || closeLevelSelector, levelSelectButton);
  });

  document.addEventListener("keydown", (event) => {
    if (customEditor.classList.contains("open") && event.key === "Escape") {
      event.preventDefault();
      closeCustomEditorMode();
      return;
    }
    if (!activeDialog) return;
    if (event.key === "Escape") {
      if (activeDialog === resultScreen) return;
      event.preventDefault();
      if (activeDialog === gameMenu) hideMenu(true);
      else if (activeDialog === levelSelector) hideLevelSelector();
      else if (activeDialog === gallery) hideGallery();
      else if (activeDialog === settingsDialog) hideSettings();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = focusableElements(activeDialog);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  customToolbox.addEventListener("click", (event) => {
    const button = event.target.closest(".editor-tool");
    if (!button) return;
    editor.tool = button.dataset.tool;
    editor.color = Number(button.dataset.color || 0);
    customToolbox.querySelectorAll(".editor-tool").forEach((tool) => tool.classList.toggle("active", tool === button));
    customEditorHint.textContent = editor.tool === "erase" ? "点击画面中的对象进行删除" : `已选择：${button.textContent.trim()}`;
    customEditorHint.classList.remove("hidden");
  });

  customTemplate.addEventListener("change", () => {
    commitCustomEdit(() => {
      editor.draft.template = customTemplate.value;
    });
    updateCustomEditorMeta(`已切换到${customTemplate.options[customTemplate.selectedIndex].text}场型`);
  });

  function toggleCustomOption(button, key) {
    commitCustomEdit(() => {
      editor.draft[key] = !editor.draft[key];
    });
    syncCustomOptions();
  }

  customPolarityToggle.addEventListener("click", () => toggleCustomOption(customPolarityToggle, "polarity"));
  customDualToggle.addEventListener("click", () => toggleCustomOption(customDualToggle, "dualMagnet"));
  customMotionToggle.addEventListener("click", () => toggleCustomOption(customMotionToggle, "targetMotion"));

  customCanvas.addEventListener("pointerdown", (event) => {
    if (!customEditor.classList.contains("open")) return;
    initAudio();
    placeCustomObject(editorPoint(event));
  });

  undoCustomEdit.addEventListener("click", () => {
    const previous = editor.history.pop();
    if (!previous) return;
    editor.draft = previous;
    saveCustomDraft();
    syncCustomOptions();
    drawCustomEditor();
    updateCustomEditorMeta("已撤销上一步");
  });

  clearCustomEdit.addEventListener("click", () => {
    if (!editor.draft.targets.length && !customObstacleCount()) return;
    commitCustomEdit(() => {
      editor.draft = emptyCustomDraft();
    });
    syncCustomOptions();
    updateCustomEditorMeta("画布已清空，可点击撤销恢复");
  });

  closeCustomEditor.addEventListener("click", closeCustomEditorMode);

  playCustomLevel.addEventListener("click", () => {
    if (!editor.draft.targets.length) {
      updateCustomEditorMeta("至少需要摆放一个果冻墙才能试玩");
      customToolbox.querySelector("[data-tool='target']")?.focus();
      return;
    }
    if (editor.draft.portals.length % 2) {
      updateCustomEditorMeta("传送门需要成对摆放");
      customToolbox.querySelector("[data-tool='portal']")?.focus();
      return;
    }
    state.customLevel = buildCustomLevel();
    state.customMode = true;
    customEditor.classList.remove("open");
    customEditor.setAttribute("aria-hidden", "true");
    customEditor.inert = true;
    state.uiPaused = false;
    setStarted(true);
    resetLevel();
    syncAnimation();
  });

  function nearestOpenTarget(bead) {
    let best = null;
    let bestDistance = Infinity;
    for (const target of state.targets) {
      if (target.filled || target.color !== bead.color) continue;
      const dx = target.x - bead.x;
      const dy = target.y - bead.y;
      const distance = Math.hypot(dx, dy);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = target;
      }
    }
    return { target: best, distance: bestDistance };
  }

  function segmentDistance(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSquared = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSquared));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }

  function failLevel(x, y) {
    if (state.status !== "playing") return;
    state.status = "failed";
    state.statusAt = performance.now();
    state.failurePoint = { x, y };
    state.cameraShake = 10;
    state.magnet.active = false;
    state.pointer.down = false;
    vibrate([20, 30, 35]);
    tone(180, 0.15, 0.05, "triangle");
    for (let index = 0; index < 26; index++) {
      const angle = Math.random() * TAU;
      const speed = 1.5 + Math.random() * 5;
      state.effects.push({
        type: "shard",
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: COLORS[index % COLORS.length],
        size: 3 + Math.random() * 5
      });
    }
  }

  function captureBead(bead, target) {
    bead.captured = true;
    target.filled = true;
    target.fillScale = 0.1;
    state.ripples.push({ x: target.x, y: target.y, radius: target.radius, alpha: 0.55, speed: 2.2 });
    for (let index = 0; index < 7; index++) {
      const angle = Math.random() * TAU;
      state.effects.push({
        type: "spark",
        x: target.x,
        y: target.y,
        vx: Math.cos(angle) * (1 + Math.random() * 2),
        vy: Math.sin(angle) * (1 + Math.random() * 2),
        life: 1,
        color: COLORS[target.color],
        size: 2 + Math.random() * 3
      });
    }
    const filled = state.targets.filter((item) => item.filled).length;
    const progress = (filled / state.targets.length) * 100;
    progressFill.style.width = `${progress}%`;
    progressTrack.setAttribute("aria-valuenow", String(Math.round(progress)));
    const pitch = capturePitch(state.levelCaptureCount, state.targets.length);
    state.levelCaptureCount += 1;
    if (filled === state.targets.length) {
      playFinishSound();
    } else {
      marimbaNote(pitch);
    }
    vibrate(8);
    if (filled === state.targets.length) winLevel();
  }

  function winLevel() {
    state.status = "won";
    state.statusAt = performance.now();
    state.resultShown = false;
    state.magnet.active = false;
    state.pointer.down = false;
    if (!state.customMode && !state.developerMode) {
      state.completed.add(state.levelIndex);
      state.bestUnlocked = Math.max(state.bestUnlocked, Math.min(levels.length - 1, state.levelIndex + 1));
      saveProgress();
    }
    vibrate([15, 35, 25]);
    for (const target of state.targets) {
      state.ripples.push({ x: target.x, y: target.y, radius: 6, alpha: 0.45, speed: 3.5 });
    }
  }

  function update(delta, now) {
    const dt = Math.min(2, delta / 16.67);
    state.magnet.pulse += delta * 0.005;
    state.cameraShake *= 0.88;

    if (!state.started || state.uiPaused) {
      updateEffects(dt);
      return;
    }

    if (state.status === "failed" && now - state.statusAt >= 850) {
      resetLevel();
      return;
    }
    if (state.status === "won" && now - state.statusAt >= 900) {
      showResultScreen();
      return;
    }

    for (const target of state.targets) {
      target.fillScale += (target.filled ? 1 - target.fillScale : 0) * 0.2 * dt;
      const motion = state.level.targetMotion;
      if (motion?.type === "orbit") {
        const cx = toWorldX(motion.cx);
        const cy = toWorldY(motion.cy);
        const angle = motion.speed * now / 1000 * (target.motionDirection || 1);
        const dx = target.baseX - cx;
        const dy = target.baseY - cy;
        target.x = cx + dx * Math.cos(angle) - dy * Math.sin(angle);
        target.y = cy + dx * Math.sin(angle) + dy * Math.cos(angle);
      } else if (motion?.type === "pingpong") {
        const offset = Math.sin(now * 0.001 * motion.speed + target.index * 0.7) * (motion.range || 0.06);
        target.x = target.baseX + (motion.axis === "x" ? toWorldX(offset) : 0);
        target.y = target.baseY + (motion.axis === "y" ? toWorldY(offset) : 0);
      }
    }

    for (const rotator of state.level.rotators) {
      rotator.angle += rotator.speed * delta / 1000;
    }
    for (const splitter of state.level.splitters) {
      splitter.pulse = Math.max(0, (splitter.pulse || 0) - 0.06 * dt);
    }

    if (state.status === "playing") updateBeads(dt, now);
    updateEffects(dt);
  }

  function updateBeads(dt, now) {
    const margin = 12;
    const magnetRadius = state.width * 0.58;
    const hazardPositions = state.level.hazards.map((hazard) => ({
      ...hazard,
      wx: toWorldX(hazard.x + (hazard.moving ? Math.sin(now * 0.0015 + hazard.phase) * 0.12 : 0)),
      wy: toWorldY(hazard.y),
      wr: hazard.radius * state.width
    }));

    for (let index = 0; index < state.beads.length; index++) {
      const bead = state.beads[index];
      if (bead.captured) continue;

      if (state.magnet.active) {
        const magnets = [{ x: state.magnet.x, y: state.magnet.y }];
        if (state.level.dualMagnet) {
          magnets.push({ x: state.width - state.magnet.x, y: state.height - state.magnet.y });
        }
        for (const magnet of magnets) {
          const dx = magnet.x - bead.x;
          const dy = magnet.y - bead.y;
          const distance = Math.max(20, Math.hypot(dx, dy));
          if (distance < magnetRadius) {
            const force = (1 - distance / magnetRadius) * 0.78 * state.magnet.polarity;
            bead.vx += dx / distance * force * dt;
            bead.vy += dy / distance * force * dt;
          }
        }
      }

      for (const field of state.level.windFields) {
        const left = toWorldX(field.x);
        const top = toWorldY(field.y);
        const right = left + toWorldX(field.width);
        const bottom = top + toWorldY(field.height);
        if (bead.x >= left && bead.x <= right && bead.y >= top && bead.y <= bottom) {
          const breath = 0.35 + 0.65 * (Math.sin(now * WIND_BREATH_SPEED + field.phase) + 1) / 2;
          bead.vx += Math.cos(field.angle) * field.force * breath * dt;
          bead.vy += Math.sin(field.angle) * field.force * breath * dt;
        }
      }

      for (const other of state.beads) {
        if (other === bead || other.captured) continue;
        const dx = bead.x - other.x;
        const dy = bead.y - other.y;
        const distance = Math.hypot(dx, dy);
        const minDistance = bead.radius + other.radius + 1;
        if (distance > 0 && distance < minDistance) {
          const push = (minDistance - distance) * 0.035;
          bead.vx += dx / distance * push;
          bead.vy += dy / distance * push;
        }
      }

      for (const bumper of state.level.bumpers) {
        const bx = toWorldX(bumper.x);
        const by = toWorldY(bumper.y);
        const radius = bumper.radius * state.width;
        const dx = bead.x - bx;
        const dy = bead.y - by;
        const distance = Math.hypot(dx, dy);
        if (distance < radius + bead.radius && now - bead.lastBumpAt > 180) {
          const nx = dx / Math.max(1, distance);
          const ny = dy / Math.max(1, distance);
          const incoming = bead.vx * nx + bead.vy * ny;
          bead.x = bx + nx * (radius + bead.radius + 1);
          bead.y = by + ny * (radius + bead.radius + 1);
          bead.vx -= 2 * Math.min(0, incoming) * nx;
          bead.vy -= 2 * Math.min(0, incoming) * ny;
          bead.vx += nx * bumper.strength;
          bead.vy += ny * bumper.strength;
          bead.lastBumpAt = now;
          bumper.pulse = 1;
          state.ripples.push({ x: bx, y: by, radius, alpha: 0.3, speed: 2.8 });
          marimbaNote(392 + Math.random() * 48, 0, false, 0.75);
          vibrate(6);
        }
      }

      for (const rotator of state.level.rotators) {
        const cx = toWorldX(rotator.x);
        const cy = toWorldY(rotator.y);
        const half = rotator.length * state.width / 2;
        const x1 = cx - Math.cos(rotator.angle) * half;
        const y1 = cy - Math.sin(rotator.angle) * half;
        const x2 = cx + Math.cos(rotator.angle) * half;
        const y2 = cy + Math.sin(rotator.angle) * half;
        if (segmentDistance(bead.x, bead.y, x1, y1, x2, y2) < bead.radius + 5) {
          const normal = rotator.angle + Math.PI / 2;
          const side = Math.sign(Math.cos(normal) * (bead.x - cx) + Math.sin(normal) * (bead.y - cy)) || 1;
          bead.vx += Math.cos(normal) * side * 0.7;
          bead.vy += Math.sin(normal) * side * 0.7;
        }
      }

      for (const gate of state.level.gates) {
        const gy = toWorldY(gate.y);
        const leftEdge = toWorldX(0.5 - gate.gap / 2);
        const rightEdge = toWorldX(0.5 + gate.gap / 2);
        if (Math.abs(bead.y - gy) < bead.radius + 4 && (bead.x < leftEdge || bead.x > rightEdge)) {
          bead.vy += bead.y > gy ? 0.8 : -0.8;
          bead.vx *= 0.94;
        }
      }

      for (let portalIndex = 0; portalIndex < levelConfig(state.level).portals.length; portalIndex++) {
        const portal = levelConfig(state.level).portals[portalIndex];
        const px = toWorldX(portal.x);
        const py = toWorldY(portal.y);
        if (now - bead.lastPortalAt > 400 && Math.hypot(bead.x - px, bead.y - py) < state.width * 0.055 + bead.radius) {
          const exit = levelConfig(state.level).portals[portal.pair];
          if (exit) {
            const speed = Math.min(5, Math.max(1.2, Math.hypot(bead.vx, bead.vy)));
            const angle = Math.atan2(bead.vy, bead.vx);
            bead.x = toWorldX(exit.x) + Math.cos(angle) * state.width * 0.075;
            bead.y = toWorldY(exit.y) + Math.sin(angle) * state.width * 0.075;
            bead.vx = Math.cos(angle) * speed;
            bead.vy = Math.sin(angle) * speed;
            bead.lastPortalAt = now;
            state.ripples.push({ x: bead.x, y: bead.y, radius: 10, alpha: 0.5, speed: 3.8 });
            marimbaNote(587.33, 0, false, 0.75);
            break;
          }
        }
      }

      let didSplit = false;
      for (const splitter of state.level.splitters) {
        const sx = toWorldX(splitter.x);
        const sy = toWorldY(splitter.y);
        const radius = splitter.radius * state.width;
        if (!bead.hasSplit && bead.splitCount > 1 && Math.hypot(bead.x - sx, bead.y - sy) < radius + bead.radius * 0.5) {
          splitBead(bead, splitter, sx, sy);
          didSplit = true;
          break;
        }
      }
      if (didSplit) continue;

      bead.vx *= Math.pow(0.965, dt);
      bead.vy *= Math.pow(0.965, dt);
      bead.x += bead.vx * dt;
      bead.y += bead.vy * dt;

      const playfield = levelConfig(state.level).playfield;
      if (playfield.type === "circle") {
        const cx = toWorldX(playfield.cx);
        const cy = toWorldY(playfield.cy);
        const radius = playfield.radius * Math.min(state.width, state.height) - bead.radius;
        const dx = bead.x - cx;
        const dy = bead.y - cy;
        const distance = Math.hypot(dx, dy);
        if (distance > radius) {
          const nx = dx / distance;
          const ny = dy / distance;
          bead.x = cx + nx * radius;
          bead.y = cy + ny * radius;
          const velocity = bead.vx * nx + bead.vy * ny;
          bead.vx -= 1.6 * velocity * nx;
          bead.vy -= 1.6 * velocity * ny;
        }
      } else {
        const left = toWorldX(playfield.x ?? 0.035) + bead.radius;
        const right = toWorldX((playfield.x ?? 0.035) + (playfield.width ?? 0.93)) - bead.radius;
        const top = toWorldY(playfield.y ?? 0.12) + bead.radius;
        const bottom = toWorldY((playfield.y ?? 0.12) + (playfield.height ?? 0.76)) - bead.radius;
        if (bead.x < left || bead.x > right) {
          bead.x = Math.max(left, Math.min(right, bead.x));
          bead.vx *= -0.6;
        }
        if (bead.y < top || bead.y > bottom) {
          bead.y = Math.max(top, Math.min(bottom, bead.y));
          bead.vy *= -0.6;
        }
      }

      if (state.magnet.active && Math.hypot(bead.vx, bead.vy) > 1.2) {
        bead.trail.unshift({ x: bead.x, y: bead.y });
        bead.trail.length = Math.min(5, bead.trail.length);
      } else if (bead.trail.length) {
        bead.trail.pop();
      }

      const nearest = nearestOpenTarget(bead);
      if (nearest.target && nearest.distance < state.width * 0.15) {
        const dx = nearest.target.x - bead.x;
        const dy = nearest.target.y - bead.y;
        const force = (1 - nearest.distance / (state.width * 0.15)) * 0.45;
        bead.vx += dx / Math.max(1, nearest.distance) * force * dt;
        bead.vy += dy / Math.max(1, nearest.distance) * force * dt;
        if (nearest.distance < nearest.target.radius * 0.62) {
          captureBead(bead, nearest.target);
          continue;
        }
      }

      for (const hazard of hazardPositions) {
        if (Math.hypot(bead.x - hazard.wx, bead.y - hazard.wy) < hazard.wr + bead.radius * 0.45) {
          failLevel(bead.x, bead.y);
          return;
        }
      }
    }

    for (const bumper of state.level.bumpers) {
      bumper.pulse = Math.max(0, (bumper.pulse || 0) - 0.08 * dt);
    }
  }

  function splitBead(bead, splitter, x, y) {
    bead.captured = true;
    const pieces = bead.splitCount;
    const childRadius = Math.max(5.5, bead.radius * 0.78);
    for (let index = 0; index < pieces; index++) {
      const angle = -Math.PI / 2 + (index - (pieces - 1) / 2) * 0.62;
      state.beads.push({
        x: bead.x + Math.cos(angle) * childRadius,
        y: bead.y + Math.sin(angle) * childRadius,
        vx: bead.vx * 0.45 + Math.cos(angle) * 2.4,
        vy: bead.vy * 0.45 + Math.sin(angle) * 2.4,
        radius: childRadius,
        color: bead.color,
        captured: false,
        hasSplit: true,
        splitCount: 1,
        lastBumpAt: 0,
        trail: []
      });
    }
    splitter.pulse = 1;
    state.cameraShake = 3;
    state.ripples.push({ x, y, radius: splitter.radius * state.width, alpha: 0.55, speed: 4.2 });
    for (let index = 0; index < 15; index++) {
      const angle = Math.random() * TAU;
      state.effects.push({
        type: "spark",
        x,
        y,
        vx: Math.cos(angle) * (1.5 + Math.random() * 3),
        vy: Math.sin(angle) * (1.5 + Math.random() * 3),
        life: 1,
        color: COLORS[bead.color],
        size: 2 + Math.random() * 4
      });
    }
    marimbaNote(523.25, 0, true, 0.8);
    marimbaNote(659.25, 0.08, true, 0.72);
    vibrate([8, 20, 8]);
  }

  function updateEffects(dt) {
    for (const effect of state.effects) {
      effect.x += effect.vx * dt;
      effect.y += effect.vy * dt;
      effect.vy += (effect.type === "shard" ? 0.09 : 0.025) * dt;
      effect.life -= 0.025 * dt;
    }
    state.effects = state.effects.filter((effect) => effect.life > 0);
    for (const ripple of state.ripples) {
      ripple.radius += ripple.speed * dt;
      ripple.alpha -= 0.012 * dt;
    }
    state.ripples = state.ripples.filter((ripple) => ripple.alpha > 0);
  }

  function roundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
  }

  function drawBackground(now) {
    const gradient = ctx.createLinearGradient(0, 0, 0, state.height);
    gradient.addColorStop(0, "#f5fffe");
    gradient.addColorStop(0.58, "#ddf9f6");
    gradient.addColorStop(1, "#c5ecee");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, state.width, state.height);

    ctx.globalAlpha = 0.35;
    for (let index = 0; index < 7; index++) {
      const x = state.width * (0.08 + index * 0.15);
      const y = state.height * (0.17 + Math.sin(now * 0.0004 + index) * 0.018);
      ctx.beginPath();
      ctx.arc(x, y, 2 + index % 3, 0, TAU);
      ctx.fillStyle = "#fff";
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawTarget(target, now) {
    const wobble = 1 + Math.sin(now * 0.003 + target.index) * 0.025;
    const radius = target.radius * wobble;
    ctx.save();
    ctx.translate(target.x, target.y);
    if (target.filled) ctx.scale(target.fillScale, target.fillScale);

    ctx.shadowColor = target.filled ? COLORS[target.color] : `${COLORS[target.color]}55`;
    ctx.shadowBlur = target.filled ? 14 : 9;
    ctx.fillStyle = target.filled ? COLORS[target.color] : `${COLORS[target.color]}18`;
    ctx.strokeStyle = target.filled ? "rgba(255,255,255,.75)" : `${COLORS[target.color]}99`;
    ctx.lineWidth = target.filled ? 2 : 3;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, TAU);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = target.filled ? "rgba(255,255,255,.42)" : "rgba(255,255,255,.7)";
    ctx.beginPath();
    ctx.ellipse(-radius * 0.28, -radius * 0.3, radius * 0.25, radius * 0.14, -0.5, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function drawBead(bead) {
    if (bead.captured) return;
    for (let index = bead.trail.length - 1; index >= 0; index--) {
      const point = bead.trail[index];
      ctx.globalAlpha = (1 - index / bead.trail.length) * 0.1;
      ctx.beginPath();
      ctx.arc(point.x, point.y, bead.radius * (1 - index * 0.1), 0, TAU);
      ctx.fillStyle = COLORS[bead.color];
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const gradient = ctx.createRadialGradient(
      bead.x - bead.radius * 0.35,
      bead.y - bead.radius * 0.4,
      bead.radius * 0.08,
      bead.x,
      bead.y,
      bead.radius
    );
    gradient.addColorStop(0, "#fff");
    gradient.addColorStop(0.22, COLORS[bead.color]);
    gradient.addColorStop(1, shade(COLORS[bead.color], -26));
    ctx.shadowColor = `${COLORS[bead.color]}88`;
    ctx.shadowBlur = 9;
    ctx.beginPath();
    ctx.arc(bead.x, bead.y, bead.radius, 0, TAU);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function shade(hex, amount) {
    const value = parseInt(hex.slice(1), 16);
    const r = Math.max(0, Math.min(255, (value >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((value >> 8) & 255) + amount));
    const b = Math.max(0, Math.min(255, (value & 255) + amount));
    return `rgb(${r},${g},${b})`;
  }

  function drawHazards(now) {
    for (const hazard of state.level.hazards) {
      const x = toWorldX(hazard.x + (hazard.moving ? Math.sin(now * 0.0015 + hazard.phase) * 0.12 : 0));
      const y = toWorldY(hazard.y);
      const radius = hazard.radius * state.width;
      const gradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.35, 2, x, y, radius);
      gradient.addColorStop(0, "#ffbfd7");
      gradient.addColorStop(0.65, "#f06798");
      gradient.addColorStop(1, "#bd3970");
      ctx.shadowColor = "rgba(221,57,113,.3)";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, TAU);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255,255,255,.65)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.72, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.9)";
      ctx.font = `700 ${radius * 0.65}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("×", x, y + 1);
    }
  }

  function drawWindFields(now) {
    for (const field of state.level.windFields) {
      const x = toWorldX(field.x);
      const y = toWorldY(field.y);
      const width = toWorldX(field.width);
      const height = toWorldY(field.height);
      const breath = 0.35 + 0.65 * (Math.sin(now * WIND_BREATH_SPEED + field.phase) + 1) / 2;
      ctx.save();
      roundedRect(x, y, width, height, 24);
      ctx.clip();
      const gradient = ctx.createLinearGradient(x, y + height, x, y);
      gradient.addColorStop(0, `rgba(86,214,207,${0.05 + breath * 0.08})`);
      gradient.addColorStop(1, `rgba(123,103,235,${0.06 + breath * 0.1})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, width, height);
      ctx.translate(x + width / 2, y + height / 2);
      ctx.rotate(field.angle);
      for (let row = -2; row <= 2; row++) {
        for (let column = -3; column <= 3; column++) {
          const travel = ((now * (0.035 + breath * 0.035) + column * 47 + row * 19) % (width + 70)) - width / 2;
          const py = row * Math.min(24, height / 5);
          ctx.globalAlpha = 0.18 + breath * 0.35;
          ctx.strokeStyle = row % 2 ? "#7b67eb" : "#55d5cf";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(travel - 11, py);
          ctx.lineTo(travel + 9, py);
          ctx.lineTo(travel + 3, py - 4);
          ctx.moveTo(travel + 9, py);
          ctx.lineTo(travel + 3, py + 4);
          ctx.stroke();
        }
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }

  function drawMechanisms() {
    for (const portal of levelConfig(state.level).portals) {
      const x = toWorldX(portal.x);
      const y = toWorldY(portal.y);
      const radius = state.width * 0.052;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(performance.now() * 0.0015 * (portal.color ? -1 : 1));
      ctx.strokeStyle = portal.color ? "#55d5cf" : "#8b74ed";
      ctx.lineWidth = 5;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([5, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.65, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    for (const gate of state.level.gates) {
      const y = toWorldY(gate.y);
      const leftEdge = toWorldX(0.5 - gate.gap / 2);
      const rightEdge = toWorldX(0.5 + gate.gap / 2);
      ctx.fillStyle = "rgba(112,184,186,.48)";
      roundedRect(0, y - 5, leftEdge, 10, 5);
      ctx.fill();
      roundedRect(rightEdge, y - 5, state.width - rightEdge, 10, 5);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.7)";
      ctx.fillRect(0, y - 3, leftEdge, 2);
      ctx.fillRect(rightEdge, y - 3, state.width - rightEdge, 2);
    }

    for (const rotator of state.level.rotators) {
      const cx = toWorldX(rotator.x);
      const cy = toWorldY(rotator.y);
      const length = rotator.length * state.width;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotator.angle);
      ctx.shadowColor = "rgba(76,143,151,.22)";
      ctx.shadowBlur = 8;
      roundedRect(-length / 2, -5, length, 10, 6);
      ctx.fillStyle = "rgba(108,191,191,.72)";
      ctx.fill();
      ctx.restore();
      ctx.beginPath();
      ctx.arc(cx, cy, 9, 0, TAU);
      ctx.fillStyle = "#fff";
      ctx.fill();
      ctx.strokeStyle = "#76c5c4";
      ctx.stroke();
    }

    for (const bumper of state.level.bumpers) {
      const x = toWorldX(bumper.x);
      const y = toWorldY(bumper.y);
      const radius = bumper.radius * state.width;
      const squash = 1 - (bumper.pulse || 0) * 0.16;
      const stretch = 1 + (bumper.pulse || 0) * 0.13;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(stretch, squash);
      const gradient = ctx.createRadialGradient(-radius * 0.3, -radius * 0.36, 2, 0, 0, radius);
      gradient.addColorStop(0, "#fff7c7");
      gradient.addColorStop(0.35, "#ffc96e");
      gradient.addColorStop(1, "#f28f61");
      ctx.shadowColor = "rgba(232,130,72,.3)";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, TAU);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255,255,255,.78)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.72, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.8)";
      ctx.beginPath();
      ctx.ellipse(-radius * 0.25, -radius * 0.3, radius * 0.23, radius * 0.12, -0.5, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    for (const splitter of state.level.splitters) {
      const x = toWorldX(splitter.x);
      const y = toWorldY(splitter.y);
      const radius = splitter.radius * state.width;
      const pulse = 1 + (splitter.pulse || 0) * 0.22 + Math.sin(performance.now() * 0.004) * 0.03;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(pulse, pulse);
      ctx.rotate(Math.PI / 4);
      const gradient = ctx.createLinearGradient(-radius, -radius, radius, radius);
      gradient.addColorStop(0, "#e8dcff");
      gradient.addColorStop(0.45, "#a987ff");
      gradient.addColorStop(1, "#5ddbd2");
      ctx.shadowColor = "rgba(114,83,220,.35)";
      ctx.shadowBlur = 18;
      roundedRect(-radius * 0.58, -radius * 0.58, radius * 1.16, radius * 1.16, radius * 0.2);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255,255,255,.8)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = "#fff";
      ctx.font = `700 ${radius * 0.72}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("✦", x, y + 1);
    }
  }

  function drawSingleMagnet(now, magnet, mirrored = false) {
    const activeScale = magnet.active ? 1.04 + Math.sin(magnet.pulse) * 0.02 : 1;
    ctx.save();
    ctx.translate(magnet.x, magnet.y);
    ctx.scale(activeScale, activeScale);

    if (magnet.active) {
      for (let index = 0; index < 3; index++) {
        const radius = 34 + index * 14 + (now * 0.03) % 14;
        ctx.globalAlpha = Math.max(0, 0.18 - index * 0.04);
        ctx.beginPath();
        ctx.arc(0, 0, radius, Math.PI * 1.12, Math.PI * 1.88);
        ctx.strokeStyle = state.magnet.polarity > 0 ? "#745fe4" : "#e85c91";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    ctx.shadowColor = "rgba(67,49,150,.28)";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 7;
    roundedRect(-34, -17, 68, 38, 17);
    const gradient = ctx.createLinearGradient(-34, -17, 34, 21);
    gradient.addColorStop(0, state.magnet.polarity > 0 ? "#b59cff" : "#ffafd0");
    gradient.addColorStop(1, state.magnet.polarity > 0 ? "#6a55d7" : "#d84d83");
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = "rgba(255,255,255,.55)";
    roundedRect(-22, -10, 35, 7, 4);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "700 18px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(mirrored ? "⌁" : (state.magnet.polarity > 0 ? "⌁" : "↯"), 0, 4);
    ctx.restore();
  }

  function drawMagnet(now) {
    drawSingleMagnet(now, state.magnet);
    if (state.level.dualMagnet) {
      drawSingleMagnet(now, {
        ...state.magnet,
        x: state.width - state.magnet.x,
        y: state.height - state.magnet.y
      }, true);
    }
  }

  function drawMagnetRange() {
    const constraint = levelConfig(state.level).magnetConstraint;
    const inset = 28;
    ctx.save();
    ctx.setLineDash([5, 7]);
    ctx.lineDashOffset = -state.magnet.pulse * 2;
    ctx.strokeStyle = "rgba(123,103,235,.42)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (constraint.type === "horizontal") {
      ctx.moveTo(toWorldX(constraint.minX), toWorldY(constraint.y));
      ctx.lineTo(toWorldX(constraint.maxX), toWorldY(constraint.y));
    } else if (constraint.type === "vertical") {
      ctx.moveTo(toWorldX(constraint.x), toWorldY(constraint.minY));
      ctx.lineTo(toWorldX(constraint.x), toWorldY(constraint.maxY));
    } else if (constraint.type === "circle") {
      ctx.arc(toWorldX(constraint.cx), toWorldY(constraint.cy), constraint.radius * Math.min(state.width, state.height), 0, TAU);
    } else if (constraint.type === "ring") {
      ctx.ellipse(toWorldX(constraint.cx), toWorldY(constraint.cy), toWorldX(constraint.radiusX), toWorldY(constraint.radiusY), 0, 0, TAU);
    } else if (constraint.type === "cross") {
      ctx.moveTo(toWorldX(constraint.minX), toWorldY(constraint.y));
      ctx.lineTo(toWorldX(constraint.maxX), toWorldY(constraint.y));
      ctx.moveTo(toWorldX(constraint.x), toWorldY(constraint.minY));
      ctx.lineTo(toWorldX(constraint.x), toWorldY(constraint.maxY));
    } else {
      const y = toWorldY(constraint.minY);
      ctx.moveTo(inset, y);
      ctx.lineTo(state.width - inset, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawEffects() {
    for (const ripple of state.ripples) {
      ctx.globalAlpha = ripple.alpha;
      ctx.beginPath();
      ctx.arc(ripple.x, ripple.y, ripple.radius, 0, TAU);
      ctx.strokeStyle = "#8f7be9";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    for (const effect of state.effects) {
      ctx.globalAlpha = Math.max(0, effect.life);
      ctx.save();
      ctx.translate(effect.x, effect.y);
      if (effect.type === "shard") ctx.rotate(effect.life * 5);
      ctx.fillStyle = effect.color;
      if (effect.type === "shard") {
        ctx.fillRect(-effect.size / 2, -effect.size / 2, effect.size, effect.size * 0.65);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, effect.size, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawTutorial(now) {
    if (state.tutorialAlpha <= 0) return;
    state.tutorialAlpha = Math.max(0, state.tutorialAlpha - 0.00035);
    const startX = state.width * 0.5;
    const startY = state.height * 0.72;
    const travel = (Math.sin(now * 0.002) + 1) / 2;
    const endX = state.width * (0.35 + travel * 0.3);
    const endY = state.height * (0.57 - travel * 0.08);
    ctx.globalAlpha = state.tutorialAlpha * 0.72;
    ctx.setLineDash([5, 7]);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(state.width * 0.42, state.height * 0.64, endX, endY);
    ctx.strokeStyle = "#7e6ed7";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(endX, endY, 14, 0, TAU);
    ctx.fillStyle = "rgba(255,255,255,.75)";
    ctx.fill();
    ctx.strokeStyle = "#8877df";
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawMechanismHint(now) {
    if (!state.mechanismHint || state.mechanismHint.alpha <= 0) return;
    state.mechanismHint.alpha = Math.max(0, state.mechanismHint.alpha - 0.0003);
    const pulse = (Math.sin(now * 0.004) + 1) / 2;
    let x = state.width * 0.5;
    let y = state.height * 0.57;
    let symbol = "↗";
    const symbols = {
      circle: "圆形场地",
      sides: "洞口在四周",
      horizontal: "水平轨道",
      vertical: "垂直轨道",
      ring: "环形轨道",
      movingTargets: "洞口会移动",
      polarity: "右下角切换吸斥",
      dual: "双磁铁镜像联动",
      portal: "传送门成对跃迁"
    };
    if (symbols[state.mechanismHint.type]) symbol = symbols[state.mechanismHint.type];
    if (state.mechanismHint.type === "wind") {
      y = state.height * 0.62;
      symbol = "↑";
    } else if (state.mechanismHint.type === "splitter") {
      y = state.height * 0.68;
      symbol = "●  ›  •••";
    }
    ctx.save();
    ctx.globalAlpha = state.mechanismHint.alpha * (0.55 + pulse * 0.35);
    ctx.fillStyle = "rgba(255,255,255,.86)";
    ctx.shadowColor = "rgba(73,111,130,.18)";
    ctx.shadowBlur = 12;
    const wide = symbol.length > 4;
    roundedRect(x - (wide ? 72 : 42), y + 38, wide ? 144 : 84, 34, 15);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#715fd3";
    ctx.font = wide || state.mechanismHint.type === "splitter" ? "700 13px system-ui" : "700 23px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(symbol, x, y + 55);
    ctx.restore();
  }

  function drawStatus(now) {
    if (state.status === "won") {
      const elapsed = now - state.statusAt;
      const alpha = Math.min(1, elapsed / 180) * Math.min(1, (1400 - elapsed) / 250);
      const scale = 0.5 + Math.min(1, elapsed / 350) * 0.5;
      ctx.save();
      ctx.translate(state.width / 2, state.height * 0.48);
      ctx.scale(scale, scale);
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = "rgba(255,255,255,.82)";
      ctx.shadowColor = "rgba(84,117,133,.2)";
      ctx.shadowBlur = 28;
      roundedRect(-88, -57, 176, 114, 34);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#765fdc";
      ctx.font = "700 42px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(state.level.icon, 0, -12);
      ctx.fillStyle = "#3e7179";
      ctx.font = "700 15px system-ui";
      ctx.fillText(
        state.levelIndex === levels.length - 1 ? "三章完整通关" : state.level.chapterFinale ? "章节徽章获得" : "已收进果冻墙",
        0,
        31
      );
      ctx.restore();
    } else if (state.status === "failed") {
      const elapsed = now - state.statusAt;
      const alpha = Math.min(0.22, elapsed / 350);
      ctx.fillStyle = `rgba(232,65,116,${alpha})`;
      ctx.fillRect(0, 0, state.width, state.height);
      if (state.failurePoint) {
        const pulse = 1 + Math.sin(elapsed * 0.025) * 0.08;
        ctx.save();
        ctx.translate(state.failurePoint.x, state.failurePoint.y);
        ctx.scale(pulse, pulse);
        ctx.strokeStyle = "rgba(226,63,111,.85)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, TAU);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-7, -7);
        ctx.lineTo(7, 7);
        ctx.moveTo(7, -7);
        ctx.lineTo(-7, 7);
        ctx.stroke();
        ctx.restore();
      }
      ctx.save();
      ctx.globalAlpha = Math.min(1, elapsed / 180);
      ctx.fillStyle = "rgba(255,255,255,.9)";
      roundedRect(state.width / 2 - 76, state.height * 0.46, 152, 46, 19);
      ctx.fill();
      ctx.fillStyle = "#c84972";
      ctx.font = "700 14px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("碰到危险区，重新来", state.width / 2, state.height * 0.46 + 23);
      ctx.restore();
    }
  }

  function render(now) {
    ctx.save();
    const shake = state.reducedMotion ? 0 : state.cameraShake;
    const shakeX = (Math.random() - 0.5) * shake;
    const shakeY = (Math.random() - 0.5) * shake;
    ctx.translate(shakeX, shakeY);
    drawBackground(now);

    const playfield = levelConfig(state.level).playfield;
    ctx.fillStyle = "rgba(255,255,255,.25)";
    ctx.strokeStyle = "rgba(255,255,255,.65)";
    ctx.lineWidth = 1.5;
    if (playfield.type === "circle") {
      ctx.beginPath();
      ctx.arc(toWorldX(playfield.cx), toWorldY(playfield.cy), playfield.radius * Math.min(state.width, state.height), 0, TAU);
      ctx.fill();
      ctx.stroke();
    } else {
      roundedRect(
        toWorldX(playfield.x ?? 0.035),
        toWorldY(playfield.y ?? 0.12),
        toWorldX(playfield.width ?? 0.93),
        toWorldY(playfield.height ?? 0.76),
        34
      );
      ctx.fill();
      ctx.stroke();
    }

    drawWindFields(now);
    state.targets.forEach((target) => drawTarget(target, now));
    drawMechanisms();
    drawHazards(now);
    state.beads.forEach(drawBead);
    drawMagnetRange();
    drawMagnet(now);
    drawEffects();
    drawTutorial(now);
    drawMechanismHint(now);
    drawStatus(now);
    ctx.restore();
  }

  function shouldAnimate() {
    return !document.hidden && state.started && !state.uiPaused;
  }

  function requestRender() {
    if (document.hidden || !state.width || !state.height || !state.level) return;
    if (shouldAnimate()) {
      syncAnimation();
    } else {
      render(performance.now());
    }
  }

  function syncAnimation() {
    if (shouldAnimate()) {
      if (animationFrame === null) {
        state.lastAt = 0;
        animationFrame = requestAnimationFrame(loop);
      }
      return;
    }
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    state.lastAt = 0;
  }

  function loop(now) {
    animationFrame = null;
    if (document.hidden) return;
    const delta = state.lastAt ? now - state.lastAt : 16.67;
    state.lastAt = now;
    update(delta, now);
    render(now);
    if (shouldAnimate() && animationFrame === null) animationFrame = requestAnimationFrame(loop);
  }

  loadSave();
  loadCustomDraft();
  updateSettingButtons();
  refreshStartScreen();
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      syncAnimation();
      if (state.audio?.state === "running") state.audio.suspend();
    } else {
      if (state.started && state.soundEnabled && state.audio?.state === "suspended") state.audio.resume();
      requestRender();
    }
  });
  resize();
  resetLevel(false);
  renderGallery();
  requestRender();
})();
