// --- Imports ---
import { Vector3, Quaternion } from "@babylonjs/core/Maths/math.vector";
import { Scalar } from "@babylonjs/core"; 
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents"; // Explicitly import event types

import { CONFIG } from "../constants/GameConfig";

// ============================================================================
// SMOOTH FOLLOW CAMERA CONTROLLER
// ============================================================================
export class SmoothFollowCameraController {
  scene;
  camera;
  target;
  offset;
  dragSensitivity;
  isDragging = false;
  dragDeltaX = 0;
  dragDeltaZ = 0;
  pointerObserver;
  beforeRenderObserver;
  lastPointerX = 0;
  lastPointerY = 0;
  isTwoFingerPanning = false;
  lastPanPositions = null;
  canvas = null;
  
  isRotatingCharacter = false;
  characterRotationStartY = 0;
  characterRotationTargetY = 0;
  characterRotationStartTime = 0;
  characterRotationDuration = 0.5;
  shouldStartRotationOnWalk = false;

  constructor(
    scene,
    camera,
    target,
    offset = CONFIG.CAMERA.OFFSET,
    dragSensitivity = CONFIG.CAMERA.DRAG_SENSITIVITY
  ) {
    this.scene = scene;
    this.camera = camera;
    this.target = target;
    // Use clone() to prevent modifying the constant Vector3 object
    this.offset = offset.clone(); 
    this.dragSensitivity = dragSensitivity;
    
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    this.pointerObserver = this.scene.onPointerObservable.add(
      this.handlePointer
    );
    this.beforeRenderObserver = this.scene.onBeforeRenderObservable.add(
      this.updateCamera
    );
    this.canvas = this.scene.getEngine().getRenderingCanvas();
    if (this.canvas) {
      this.canvas.addEventListener("touchstart", this.handleTouchStart, {
        passive: false,
      });
      this.canvas.addEventListener("touchmove", this.handleTouchMove, {
        passive: false,
      });
      this.canvas.addEventListener("touchend", this.handleTouchEnd, {
        passive: false,
      });
      this.canvas.addEventListener("wheel", this.handleWheel, {
        passive: false,
      });
    }
  }

  handlePointer = (pointerInfo) => {
    // Use imported PointerEventTypes
    switch (pointerInfo.type) {
      case PointerEventTypes.POINTERDOWN:
        this.isDragging = true;
        this.lastPointerX = pointerInfo.event.clientX;
        this.lastPointerY = pointerInfo.event.clientY;
        this.dragDeltaX = 0;
        this.dragDeltaZ = 0;
        break;
      case PointerEventTypes.POINTERUP:
        this.isDragging = false;
        this.dragDeltaX = 0;
        this.dragDeltaZ = 0;
        this.shouldStartRotationOnWalk = true;
        break;
      case PointerEventTypes.POINTERMOVE:
        if (this.isDragging) {
          this.handlePointerMove(pointerInfo);
        }
        break;
    }
  };

  handlePointerMove(pointerInfo) {
    const deltaX =
      pointerInfo.event.movementX ||
      pointerInfo.event.clientX - this.lastPointerX;
    const deltaY =
      pointerInfo.event.movementY ||
      pointerInfo.event.clientY - this.lastPointerY;

    this.lastPointerX = pointerInfo.event.clientX;
    this.lastPointerY = pointerInfo.event.clientY;

    this.dragDeltaX = -deltaX * this.dragSensitivity;
    this.dragDeltaZ = deltaY * this.dragSensitivity;

    this.updateCameraPosition();
  }

  updateCameraPosition() {
    // Use imported Vector3
    const right = this.camera.getDirection(Vector3.Right());
    this.camera.position.addInPlace(right.scale(this.dragDeltaX));

    const up = this.camera.getDirection(Vector3.Up());
    this.camera.position.addInPlace(up.scale(this.dragDeltaZ));

    this.camera.setTarget(this.target.position);
  }

  handleWheel = (e) => {
    e.preventDefault();
    
    this.offset.z += e.deltaY * this.dragSensitivity * 0.2;
    
    // Use imported Scalar
    this.offset.z = Scalar.Clamp(
      this.offset.z,
      CONFIG.CAMERA.ZOOM_MIN,
      CONFIG.CAMERA.ZOOM_MAX
    );
  };
  
  handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      this.isTwoFingerPanning = true;
      this.lastPanPositions = [
        e.touches[0].clientX,
        e.touches[0].clientY,
        e.touches[1].clientX,
        e.touches[1].clientY,
      ];
    }
  };

  handleTouchMove = (e) => {
    if (
      !this.isTwoFingerPanning ||
      e.touches.length !== 2 ||
      !this.lastPanPositions
    ) {
      return;
    }
    e.preventDefault();
    this.handleTwoFingerPan(e);
  };

  handleTwoFingerPan(e) {
    const currentPositions = [
      e.touches[0].clientX,
      e.touches[0].clientY,
      e.touches[1].clientX,
      e.touches[1].clientY,
    ];

    const lastMidX = (this.lastPanPositions[0] + this.lastPanPositions[2]) / 2;
    const lastMidY = (this.lastPanPositions[1] + this.lastPanPositions[3]) / 2;
    const currMidX = (currentPositions[0] + currentPositions[2]) / 2;
    const currMidY = (currentPositions[1] + currentPositions[3]) / 2;

    const deltaX = currMidX - lastMidX;
    const deltaY = currMidY - lastMidY;

    // Use imported Vector3
    const right = this.camera.getDirection(Vector3.Right());
    const forward = this.camera.getDirection(Vector3.Forward());

    this.offset.addInPlace(right.scale(-deltaX * this.dragSensitivity * 4));
    this.offset.addInPlace(forward.scale(deltaY * this.dragSensitivity * 4));

    this.lastPanPositions = currentPositions;
  }

  handleTouchEnd = (e) => {
    if (e.touches.length < 2) {
      this.isTwoFingerPanning = false;
      this.lastPanPositions = null;
    }
  };

  updateCamera = () => {
    if (!this.isDragging) {
      if (!this.shouldStartRotationOnWalk) {
        this.smoothFollowTarget();
      }
    } else {
      this.updateOffsetY();
    }
    
    this.updateCharacterRotationLerp();
  };

  smoothFollowTarget() {
    if (this.isRotatingCharacter) {
      return;
    }

    // Use imported Quaternion
    const yRot = Quaternion.FromEulerAngles(
      0,
      this.target.rotation.y,
      0
    );
    
    // Use imported Vector3
    const rotatedOffset = this.offset.rotateByQuaternionToRef(
      yRot,
      Vector3.Zero()
    );

    const desiredPos = this.target.position.add(rotatedOffset);

    const normalizedOffset =
      (this.offset.z - CONFIG.CAMERA.ZOOM_MIN) /
      (CONFIG.CAMERA.ZOOM_MAX - CONFIG.CAMERA.ZOOM_MIN);
      
    // Use imported Scalar
    const dynamicSmoothing = Scalar.Lerp(0.05, 0.25, normalizedOffset);

    // Use imported Vector3
    Vector3.LerpToRef(
      this.camera.position,
      desiredPos,
      dynamicSmoothing,
      this.camera.position
    );
    
    this.camera.lockedTarget = this.target;
  }

  updateOffsetY() {
    this.offset.y = this.camera.position.y - this.target.position.y;
  }

  startCharacterRotationLerp() {
    // Use imported Vector3 and Quaternion
    const toCamera = this.camera.position
      .subtract(this.target.position)
      .normalize();
      
    const targetYaw = Math.atan2(-toCamera.x, -toCamera.z);
    
    const currentYaw = this.target.rotation.y;
    let rotationDifference = targetYaw - currentYaw;

    while (rotationDifference > Math.PI) rotationDifference -= 2 * Math.PI;
    while (rotationDifference < -Math.PI) rotationDifference += 2 * Math.PI;

    this.isRotatingCharacter = true;
    this.characterRotationStartY = currentYaw;
    this.characterRotationTargetY = currentYaw + rotationDifference;
    this.characterRotationStartTime = Date.now();
  }

  updateCharacterRotationLerp() {
    if (!this.isRotatingCharacter) return;

    const currentTime = Date.now();
    const elapsed = (currentTime - this.characterRotationStartTime) / 1000;
    const progress = Math.min(elapsed / this.characterRotationDuration, 1.0);
    
    const easedProgress = this.easeInOutCubic(progress);

    // Use imported Scalar
    const currentRotation = Scalar.Lerp(
      this.characterRotationStartY,
      this.characterRotationTargetY,
      easedProgress
    );
    
    this.target.rotation.y = currentRotation;

    if (this.target.rotationQuaternion) {
      // Use imported Quaternion
      Quaternion.FromEulerAnglesToRef(
        this.target.rotation.x,
        currentRotation,
        this.target.rotation.z,
        this.target.rotationQuaternion
      );
    }

    if (progress >= 1.0) {
      this.isRotatingCharacter = false;
    }
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  checkForWalkActivation() {
    if (this.shouldStartRotationOnWalk) {
      this.shouldStartRotationOnWalk = false;
      this.startCharacterRotationLerp();
    }
  }

  forceActivateSmoothFollow() {
    this.shouldStartRotationOnWalk = false;
    this.isRotatingCharacter = false;
    this.isDragging = false;
    this.dragDeltaX = 0;
    this.dragDeltaZ = 0;
  }

  resetCameraToDefaultOffset() {
    this.offset.copyFrom(CONFIG.CAMERA.OFFSET);
    this.forceActivateSmoothFollow();
  }

  dispose() {
    this.scene.onPointerObservable.remove(this.pointerObserver);
    this.scene.onBeforeRenderObservable.remove(this.beforeRenderObserver);
    if (this.canvas) {
      this.canvas.removeEventListener("touchstart", this.handleTouchStart);
      this.canvas.removeEventListener("touchmove", this.handleTouchMove);
      this.canvas.removeEventListener("touchend", this.handleTouchEnd);
      this.canvas.removeEventListener("wheel", this.handleWheel);
    }
  }
}