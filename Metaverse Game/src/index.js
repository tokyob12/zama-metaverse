import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import "@babylonjs/core/Meshes/meshBuilder";
import "@babylonjs/loaders/glTF";
import "@babylonjs/loaders";
import "@babylonjs/core/Materials/PBR/pbrMaterial";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { GLTFLoader } from "@babylonjs/loaders/glTF/2.0/glTFLoader";
import { Engine } from "@babylonjs/core/Engines/engine";
import { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";
import "@babylonjs/core/Loading/sceneLoader";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Audio/audioSceneComponent";
import "@babylonjs/gui";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";

// --- Local Managers ---
import { SceneManager } from "./managers/SceneManager";
import { SettingsUI } from "./ui/SettingsUI";
import { InventoryUI } from "./ui/InventoryUI";
import { HUDManager } from "./managers/HUDManager";
import { ZamaContractManager } from "./managers/ZamaContractManager.js";

// ---- Create Zama Manager Instance (GLOBAL) ----
const zama = new ZamaContractManager();
window.ZamaManager = zama; 

// Global engine + scene
let engine = null;
let sceneToRender = null;

const canvas = document.getElementById("renderCanvas");

// ------------------------------------------------------------
// ENGINE CREATION
// ------------------------------------------------------------
const createDefaultEngine = function () {
  return new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    disableWebGL2Support: false,
  });
};

// ------------------------------------------------------------
// RENDER LOOP STARTER
// ------------------------------------------------------------
const startRenderLoop = function (engine, canvas) {
  engine.runRenderLoop(function () {
    if (sceneToRender && sceneToRender.activeCamera) {
      sceneToRender.render();
    }
  });
};

// ------------------------------------------------------------
// CREATE MAIN BABYLON SCENE
// ------------------------------------------------------------
function CreateScene(engine, canvas, playerProfile) {

  const sceneManager = new SceneManager(engine, canvas);

    // This allows HUDManager to call window.sceneManager.spawnSecretPortal()
  window.sceneManager = sceneManager; 

  sceneManager
    .initializeScene(playerProfile)
    .then(() => {
      HUDManager.initialize(
        sceneManager.getScene(),
        sceneManager.characterController
      );

      SettingsUI.initialize(canvas, sceneManager);
    })
    .catch((error) => {
      console.error("Async Scene Initialization failed:", error);
    });

  return sceneManager.getScene();
}

// ------------------------------------------------------------
// INITIALIZE PHYSICS + ENGINE + SCENE
// ------------------------------------------------------------
async function initializeGameAndStartLoop(playerProfile) {
  // 1. Init Havok Physics
  if (typeof HavokPhysics !== "undefined") {
    globalThis.HK = await HavokPhysics();
    console.log("Havok Physics initialized.");
  } else {
    console.warn(
      "⚠ HavokPhysics not found — physics may not work in this environment."
    );
  }

  // 2. Init Engine
  try {
    window.engine = createDefaultEngine();
    engine = window.engine;
  } catch (e) {
    console.error("Engine creation failed:", e);
    throw e;
  }

  if (!engine) {
    throw new Error("Engine is null");
  }

  // 3. Init Audio
  const engineOptions = engine.getCreationOptions?.();
  if (!engineOptions || engineOptions.audioEngine !== false) {
    AbstractEngine.audioEngine = AbstractEngine.AudioEngineFactory(
      engine.getRenderingCanvas()
    );

    if (AbstractEngine.audioEngine) {
      // Start muted
      AbstractEngine.audioEngine.setGlobalVolume(0.0);

      const unmute = () => {
        AbstractEngine.audioEngine.setGlobalVolume(1.0);
        console.log("Audio Unmuted.");
        canvas.removeEventListener("click", unmute);
        canvas.removeEventListener("touchend", unmute);
      };

      canvas.addEventListener("click", unmute, { once: true });
      canvas.addEventListener("touchend", unmute, { once: true });
    }
  }

  window.scene = CreateScene(engine, canvas, playerProfile);

  startRenderLoop(engine, canvas);

  sceneToRender = window.scene;
}

// ------------------------------------------------------------
// HOMEPAGE OVERLAY + GAME START LOGIC
// ------------------------------------------------------------
const welcomeOverlay = document.getElementById("welcomeOverlay");
const startButton = document.getElementById("startButton");

if (startButton && welcomeOverlay) {
  startButton.addEventListener(
    "click",
    async () => {
      welcomeOverlay.style.opacity = 0;
      welcomeOverlay.style.transition = "opacity 0.3s ease";

      setTimeout(() => {
        welcomeOverlay.remove();
      }, 300);

      const playerProfile = await HUDManager.showProfilePrompt();

      const walletAddress = await zama.connectWallet();

      if (!walletAddress) {
        HUDManager.showNotification(
          "Wallet Required",
          "Please connect wallet to enable encrypted score saving."
        );
      }

      try {
        await initializeGameAndStartLoop(playerProfile);
      } catch (error) {
        console.error("Fatal Error: Game failed to initialize.", error);
      }
    },
    { once: true }
  );
}

// ------------------------------------------------------------
// RESIZE HANDLER
// ------------------------------------------------------------
window.addEventListener("resize", function () {
  if (engine) {
    engine.resize();
  }
});
