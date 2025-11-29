import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import "@babylonjs/gui"; 
import { AdvancedDynamicTexture, Rectangle, StackPanel, TextBlock, Button, Control } from "@babylonjs/gui/2D"; 

import { CollectiblesManager } from "./CollectiblesManager";
import { InventoryManager } from "./InventoryManager";
import { CONFIG } from "../constants/GameConfig";
// NOTE: ZamaContractManager import is REMOVED. Access via window.ZamaManager.


// --- Global CSS for the Minimalist HUD elements ---
const AGGRESSIVE_HUD_CSS = `
    #gameHUD {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 10;
        padding: 20px;
        font-family: 'Consolas', monospace;
        user-select: none;
    }
    .hud-bar {
        display: flex;
        align-items: center;
        background: none;
        padding: 0;
        margin-bottom: 8px;
    }
    .hud-label {
        color: #00FF88;
        font-size: 14px;
        font-weight: 500;
        letter-spacing: 2px;
        margin-right: 15px;
        text-shadow: 0 0 3px rgba(0, 255, 136, 0.5);
        min-width: 60px; 
    }
    .hud-value {
        color: #FFD208;
        font-size: 16px;
        font-weight: bold;
        text-shadow: 0 0 5px rgba(255, 210, 8, 0.4);
    }
    .hud-coords-value {
        color: #BADA55;
        font-size: 14px;
    }
`;

export class HUDManager {
  static scene = null;
  static characterController = null;
  static advTexture = null; 
  static _questionPopupShowing = false;
  static _profilePopupShowing = false;
  static _fheKeyPopupShowing = false;

  static creditValueElement = null;
  static coordsValueElement = null;
  
  // NOTE: ZamaManager instance is accessed via window.ZamaManager

  /**
   * Initializes the HUD system.
   */
  static initialize(scene, characterController) {
    this.scene = scene;
    this.characterController = characterController;
    
    if (!document.getElementById('aggressive-hud-style')) {
        const style = document.createElement('style');
        style.id = 'aggressive-hud-style';
        style.textContent = AGGRESSIVE_HUD_CSS;
        document.head.appendChild(style);
    }
    
    this.setupBaseHUD();

    this.advTexture = AdvancedDynamicTexture.CreateFullscreenUI("HUD_GUI_Overlay", true, scene);
    
    this.scene.onBeforeRenderObservable.add(() => this.updateHUD());
  }

  static setupBaseHUD() {
    const hud = document.createElement('div');
    hud.id = 'gameHUD';
    
    hud.innerHTML = `
        <div class="hud-bar">
            <span class="hud-label">CREDITS</span>
            <span id="hudCreditValue" class="hud-value">0</span>
        </div>
        <div class="hud-bar">
            <span class="hud-label">POS</span>
            <span id="hudCoordsValue" class="hud-coords-value">X: 0.0 Y: 0.0 Z: 0.0</span>
        </div>
    `;

    document.body.appendChild(hud);
    
    this.creditValueElement = document.getElementById('hudCreditValue');
    this.coordsValueElement = document.getElementById('hudCoordsValue');
  }

  static updateHUD() {
    if (this.characterController && this.characterController.getDisplayCapsule() && this.coordsValueElement) {
      const pos = this.characterController.getDisplayCapsule().position;
      this.coordsValueElement.textContent = `X: ${pos.x.toFixed(1)} Y: ${pos.y.toFixed(1)} Z: ${pos.z.toFixed(1)}`;
    }
  }

  static updateCreditScore(score) {
    if (this.creditValueElement) {
      this.creditValueElement.textContent = `${score}`;
    }
  }

  static showNotification(title, message) {
    const notificationContainer = document.createElement('div');
    Object.assign(notificationContainer.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'rgba(10, 10, 30, 0.95)',
        border: '2px solid #FFD208',
        padding: '20px',
        color: 'white',
        textAlign: 'center',
        opacity: '0',
        transition: 'opacity 0.3s ease',
        zIndex: '1000'
    });
    
    notificationContainer.innerHTML = `
        <h3 style="color: #00FF88; margin-bottom: 5px;">${title}</h3>
        <p style="margin: 0; font-size: 0.9rem;">${message}</p>
    `;
    document.body.appendChild(notificationContainer);

    setTimeout(() => notificationContainer.style.opacity = '1', 50);
    
    setTimeout(() => {
        notificationContainer.style.opacity = '0';
        setTimeout(() => notificationContainer.remove(), 300);
    }, 3000);
  }


  static showProfilePrompt() {
    return new Promise(resolve => {
      if (this._profilePopupShowing) return resolve(null);
      this._profilePopupShowing = true;

      const overlay = document.createElement("div");
      overlay.id = "profile-prompt-overlay";
      Object.assign(overlay.style, {
          position: "fixed", inset: "0", display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(10, 10, 30, 0.95)", zIndex: "2147483647",
          fontFamily: 'Consolas, "Courier New", monospace',
          color: 'white',
          textAlign: 'center'
      });
      
      const box = document.createElement("div");
      Object.assign(box.style, {
          padding: "40px", borderRadius: "8px", 
          background: "rgba(0, 0, 0, 0.9)", 
          border: `2px solid #00FF88`, 
          boxShadow: `0 0 15px rgba(0, 255, 136, 0.6)`, 
          width: '300px'
      });

      // --- Inner HTML for Dual Input ---
      box.innerHTML = `
          <h2 style="color: #00FF88; font-size: 2rem; text-shadow: 0 0 5px rgba(0, 255, 136, 0.6); margin-bottom: 20px;">
              PLAYER PROFILE
          </h2>
          
          <p style="margin: 10px 0 5px;">Enter the Name (Required):</p>
          <input id="playerNameInput" type="text" placeholder="Your Unique Name" value="" style="padding: 10px; width: 90%; background: #000; color: #FFD208; border: 1px solid #00FF88; margin-bottom: 5px;">
          
          <p id="nameRequiredMessage" style="color: #FF4444; font-size: 0.8rem; height: 15px; visibility: hidden; margin-bottom: 10px;">
              Please enter a Name.
          </p>

          <p style="margin: 10px 0 5px;">Discord Handle (Optional):</p>
          <input id="discordInput" type="text" value="" style="padding: 10px; width: 90%; background: #000; color: #FFD208; border: 1px solid #00FF88; margin-bottom: 25px;">

          <button id="submitNameButton" style="padding: 12px 30px; background: #00FF88; color: black; border: none; font-weight: bold;">
              START QUEST
          </button>
      `;
      overlay.appendChild(box);
      document.body.appendChild(overlay);

      // --- Logic and Promise Resolution ---
      const submitButton = document.getElementById("submitNameButton");
      const nameInput = document.getElementById("playerNameInput");
      const requiredMessage = document.getElementById("nameRequiredMessage");
      const discordInput = document.getElementById("discordInput");
      
      const handleSubmission = () => {
        const name = nameInput.value.trim();
        const discord = discordInput.value.trim() || "N/A";
        
        if (name.length === 0) {
            requiredMessage.style.visibility = 'visible';
            nameInput.style.borderColor = '#FF4444'; 
            nameInput.focus();
            return; 
        }

        overlay.remove();
        this._profilePopupShowing = false;
        
        resolve({ name, discord });
      };

      submitButton.onclick = handleSubmission;
      
      nameInput.onkeydown = (e) => { 
        if (e.key === 'Enter') handleSubmission(); 
        else {
             requiredMessage.style.visibility = 'hidden'; 
             nameInput.style.borderColor = '#00FF88'; 
        }
      };
      discordInput.onkeydown = (e) => { 
        if (e.key === 'Enter') handleSubmission(); 
      };
      
      setTimeout(() => nameInput.focus(), 100);
    });
  }

  static showQuestionPopup(question, answers, correctIndex, reward, callback) {
    if (this._questionPopupShowing) return;
    this._questionPopupShowing = true;
    
    this.characterController.pausePhysics();
    this.scene.activeCamera.detachControl(this.scene.getEngine().getRenderingCanvas());

    const overlay = new Rectangle("questionOverlay");
    overlay.background = "rgba(0, 0, 0, 0.85)";
    overlay.width = 0.6;
    overlay.height = 0.5;
    overlay.color = CONFIG.HUD.HIGHLIGHT_COLOR;
    this.advTexture.addControl(overlay);
    
    const panel = new StackPanel();
    panel.width = 0.9;
    overlay.addControl(panel);

    const questionText = new TextBlock("questionText");
    questionText.text = question;
    questionText.color = "white";
    questionText.textWrapping = true;
    questionText.fontSize = 24;
    questionText.height = "100px";
    questionText.paddingBottom = "20px";
    panel.addControl(questionText);

    answers.forEach((ans, index) => {
      const button = Button.CreateSimpleButton(`ansBtn${index}`, ans);
      button.height = "50px";
      button.width = 0.9;
      button.color = CONFIG.HUD.HIGHLIGHT_COLOR;
      button.background = "rgba(0, 0, 0, 0.6)";
      button.paddingTop = "10px";
      button.onPointerClickObservable.add(() => {
        const wasCorrect = index === correctIndex;
        this.closeQuestionPopup(overlay);
        callback(wasCorrect);
        
        this.showNotification(
          wasCorrect ? "CORRECT!" : "INCORRECT!",
          wasCorrect ? `+${reward} Credits Awarded.` : "No credits awarded."
        );
      });
      panel.addControl(button);
    });
  }

  static closeQuestionPopup(overlay) {
    overlay.dispose();
    this._questionPopupShowing = false;
    this.characterController.resumePhysics();
    this.scene.activeCamera.attachControl(this.scene.getEngine().getRenderingCanvas(), true);
  }

// In src/managers/HUDManager.js

/**
   * Shows the final success pop-up when the FHE Key is obtained.
   * Handles the Zama FHE interaction and subsequent Scene updates.
   */
  static showFHEKeySuccessPopup(credits) {
    // Prevent multiple popups
    if (this._fheKeyPopupShowing) return;
    this._fheKeyPopupShowing = true;
    
    this.characterController.pausePhysics();
    this.scene.activeCamera.detachControl(this.scene.getEngine().getRenderingCanvas());

    const zamaManager = window.ZamaManager;
    const isWalletReady = zamaManager && zamaManager.isWalletConnected();
    
    const overlay = document.createElement("div");
    overlay.id = "fhe-key-success-overlay";
    Object.assign(overlay.style, {
        position: "fixed", inset: "0", display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(10, 10, 30, 0.95)", zIndex: "2147483647", opacity: "0", transition: "opacity 0.5s ease-out",
        fontFamily: 'Consolas, "Courier New", monospace', color: 'white'
    });

    const box = document.createElement("div");
    Object.assign(box.style, {
        padding: "40px", borderRadius: "8px", 
        background: "rgba(0, 0, 0, 0.9)", 
        border: `2px solid #00FF88`, 
        boxShadow: `0 0 15px rgba(0, 255, 136, 0.6)`, 
        width: '400px',
        textAlign: 'center'
    });
    
    // Dynamic Button Styles based on wallet state
    const buttonText = isWalletReady ? "SIGN TX & REVEAL SECRET" : "CONTINUE (Wallet Not Connected)";
    const buttonColor = isWalletReady ? "#FFD208" : "#555555";
    const buttonCursor = isWalletReady ? "pointer" : "default";

    box.innerHTML = `
        <h1 style="color: ${CONFIG.HUD.HIGHLIGHT_COLOR}; font-size: 2.2rem; margin-bottom: 15px; text-shadow: 0 0 10px ${CONFIG.HUD.HIGHLIGHT_COLOR};">
            FHE KEY ACQUIRED
        </h1>

        <p style="font-size: 1rem; margin-bottom: 20px; color: #cccccc;">
            Your score has met the threshold. You may now submit it to the 
            <strong style="color:#00FF88">Confidential EVM</strong>.
        </p>

        <div style="background: rgba(0,255,136,0.1); border: 1px solid #00FF88; padding: 10px; margin-bottom: 20px;">
            <div style="font-size: 0.9rem; color: #00FF88;">ENCRYPTED SCORE</div>
            <div style="font-size: 1.8rem; font-weight: bold; color: #FFD208;">${credits}</div>
        </div>

        ${!isWalletReady ? 
            `<p style="color: #ff4444; font-size: 0.9rem; margin-bottom: 15px;">
                ⚠️ Wallet disconnected. You cannot generate the Phantom Portal.
            </p>` : ''
        }

        <button id="fhe-key-continue" style="
            padding: 15px 30px; font-size: 1.1rem; font-weight: bold; border: none; width: 100%;
            background: ${buttonColor}; color: black; border-radius: 4px; cursor: ${buttonCursor};
            transition: background 0.3s;
        ">
            ${buttonText}
        </button>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // Animate Fade In
    setTimeout(() => { overlay.style.opacity = "1"; }, 50);

    const closePopup = () => {
        overlay.style.opacity = "0";
        setTimeout(() => {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            this._fheKeyPopupShowing = false;
            this.characterController.resumePhysics();
            this.scene.activeCamera.attachControl(this.scene.getEngine().getRenderingCanvas(), true);
        }, 500); 
    };

    const continueBtn = document.getElementById("fhe-key-continue");
    if (continueBtn) {
        continueBtn.addEventListener("click", async () => { 
            
            if (!isWalletReady) {
                closePopup();
                return;
            }

            try {
                // Update UI to "Loading"
                continueBtn.disabled = true;
                continueBtn.textContent = "ENCRYPTING & VERIFYING...";
                continueBtn.style.backgroundColor = "#AAAAAA";
                continueBtn.style.cursor = "wait";

                const finalScore = CollectiblesManager.getTotalCredits();
                
                // --- CALL ZAMA MANAGER ---
                // This encrypts score -> sends to chain -> waits for receipts -> decrypts result
                const submissionResult = await window.ZamaManager.submitFinalScore(finalScore); 
                
                // Check Transaction Result
                if (submissionResult && submissionResult.success) {
                    
                    if (submissionResult.isWinner) {
                        // --- WINNER SCENARIO ---
                        // 1. Notify User
                        HUDManager.showNotification(
                            "ACCESS GRANTED", 
                            `FHE Verified. Secret Portal ID #${submissionResult.portalID} Decrypted.`
                        );

                        // Spawn The Phantom Portal (Scene Logic)
                        if (window.sceneManager) {
                             window.sceneManager.spawnSecretPortal(submissionResult.portalID);
                        } else {
                             console.error("SceneManager not found in window object.");
                        }

                    } else {
                        // --- LOSER SCENARIO ---
                        HUDManager.showNotification("ACCESS DENIED", "Score verified on-chain, but did not meet the threshold.");
                    }

                    // Success (win or lose) -> Close popup
                    closePopup();

                } else {
                    // --- ZAMA/NETWORK ERROR ---
                    throw new Error(submissionResult.error || "Unknown error during submission.");
                }

            } catch (error) {
                // --- ERROR HANDLING ---
                console.error("FHE Submission Error:", error);
                
                HUDManager.showNotification("TRANSACTION FAILED", "Check console for details.");
                
                // Reset button to allow retry
                continueBtn.disabled = false;
                continueBtn.textContent = "RETRY SUBMISSION";
                continueBtn.style.backgroundColor = "#FF4444"; // Red for error
                continueBtn.style.cursor = "pointer";
            }
        });
    }
  }
  /**
   * Shows a large, persistent popup when entering the portal.
   * @param {number} portalNum - The portal number (1-4).
   */
  static showPortalEntryPopup(portalNum) {
    if (this.characterController) this.characterController.pausePhysics();
    if (this.scene && this.scene.activeCamera) {
        this.scene.activeCamera.detachControl(this.scene.getEngine().getRenderingCanvas());
    }

    const overlay = document.createElement("div");
    overlay.id = "portal-entry-overlay";
    Object.assign(overlay.style, {
        position: "fixed", inset: "0", display: "flex", 
        alignItems: "center", justifyContent: "center",
        background: "rgba(0, 10, 20, 0.95)", // Darker Blue tint
        zIndex: "2147483647", opacity: "0", transition: "opacity 0.5s ease",
        fontFamily: 'Consolas, "Courier New", monospace', color: 'white',
        backdropFilter: "blur(5px)"
    });

    const box = document.createElement("div");
    Object.assign(box.style, {
        padding: "60px 40px", 
        borderRadius: "12px", 
        background: "linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,20,40,0.95) 100%)", 
        border: `4px solid #00FFFF`, // Cyan Border
        boxShadow: `0 0 30px rgba(0, 255, 255, 0.4), inset 0 0 20px rgba(0, 255, 255, 0.1)`, 
        width: '600px', // Much wider
        textAlign: 'center',
        position: 'relative'
    });

    box.innerHTML = `
        <div style="color: #00FFFF; font-size: 1.2rem; letter-spacing: 4px; margin-bottom: 10px;">
            SYSTEM NOTIFICATION
        </div>
        
        <h1 style="color: white; font-size: 3.5rem; margin: 0 0 30px 0; text-shadow: 0 0 15px #00FFFF;">
            PORTAL ACTIVATED
        </h1>

        <div style="border-top: 2px solid #333; border-bottom: 2px solid #333; padding: 30px 0; margin-bottom: 30px;">
            <p style="font-size: 1.5rem; color: #cccccc; margin-bottom: 10px;">
                You granted the access to
            </p>
            <div style="font-size: 5rem; font-weight: bold; color: #FFD208; text-shadow: 0 0 20px rgba(255, 210, 8, 0.6);">
                PORTAL NUMBER ${portalNum}
            </div>
        </div>

        <button id="portal-close-btn" style="
            padding: 18px 50px; font-size: 1.5rem; font-weight: bold; border: none; 
            background: #00FFFF; color: black; border-radius: 4px; cursor: pointer;
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.5); transition: all 0.2s;
        ">
            ENTER DIMENSION
        </button>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // Animate In
    requestAnimationFrame(() => { overlay.style.opacity = "1"; });

    const closeBtn = document.getElementById("portal-close-btn");
    closeBtn.onclick = () => {
        // Animate Out
        overlay.style.opacity = "0";
        setTimeout(() => {
            overlay.remove();
            
            // Resume Game
            if (this.characterController) this.characterController.resumePhysics();
            if (this.scene && this.scene.activeCamera) {
                this.scene.activeCamera.attachControl(this.scene.getEngine().getRenderingCanvas(), true);
            }
        }, 500);
    };
  }

}