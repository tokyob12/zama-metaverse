// src/constants/Assets.js

// --- Imports ---
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

// --- Parcel Asset Imports (Crucial for Parcel to resolve URLs) ---
import MeebitModel from "../assets/model/Meebit.glb";
import ZamaCity from "../assets/model/test3.glb";
import Zamasky from "../assets/model/sky1.hdr";
import ZamaCrateModel from "../assets/model/zamalogo.glb";
import FHEKeyModel from "../assets/model/FHE.glb"; 

export const ASSETS = {
  CHARACTERS: [
    {
      name: "Meebit",
      model: MeebitModel, 
      animations: {
        idle: "idle",
        walk: "run",
        jump: "jump",
      },
      scale: 1.3,
      mass: 1,
      height: 1.8,
      radius: 0.6,
      speed: {
        inAir: 30.0,
        onGround: 10.0,
        boostMultiplier: 8.0,
      },
      jumpHeight: 3.5,
      rotationSpeed: 0.01,
      rotationSmoothing: 0.1,
      animationBlend: 200,
      jumpDelay: 200,
    },
  ],
  ENVIRONMENTS: [
    {
      name: "FHE Quest City",
      model: ZamaCity,
      lightmap: "",
      scale: 1.5,
      lightmappedMeshes: [],
      physicsObjects: [],
      sky: {
        TEXTURE_URL: Zamasky, 
        ROTATION_Y: 0,
        BLUR: 0,
        TYPE: "SPHERE",
      },
      spawnPoint: new Vector3(0, 1, 0),
      particles: [
        {
          name: "Magic Sparkles",
          position: new Vector3(-18, 0, -8),
          updateSpeed: 0.007,
        },
        {
          name: "Magic Sparkles",
          position: new Vector3(-4, 2, 50),
          updateSpeed: 0.007,
        },
      ],

      items: [
        {
          name: "Crate",
          url: ZamaCrateModel, // Parcel-resolved path
          collectible: true,
          creditValue: 100,
          minImpulseForCollection: 0.3,
          instances: [
            {
              position: new Vector3(24, 1, 6),
              scale: 1.2,
              rotation: new Vector3(0, 0, 0),
              mass: 0.5,
            },
            {
              position: new Vector3(44, 1, -7),
              scale: 1.2,
              rotation: new Vector3(0, 0, 0),
              mass: 0.5,
            },
            {
              position: new Vector3(-0.7, 1.5, 33),
              scale: 1.2,
              rotation: new Vector3(0, 20, 0),
              mass: 0.5,
            },
            {
              position: new Vector3(0, 2, -60),
              scale: 1.2,
              rotation: new Vector3(0, 23, 0),
              mass: 0.5,
            },
            {
              position: new Vector3(-22, 1.3, -4.1),
              scale: 0.5,
              rotation: new Vector3(0, 0, 0),
              mass: 0.5,
            },
            {
              position: new Vector3(-5.26, 3.49, 1.39),
              scale: 0.5,
              rotation: new Vector3(0, 0, 0),
              mass: 0.5,
            },
            {
              position: new Vector3(8.09, 6.67, -6.61),
              scale: 0.5,
              rotation: new Vector3(0, 0, 0),
              mass: 0.5,
            },
            {
              position: new Vector3(55.93, 0.32, -2.86),
              scale: 0.5,
              rotation: new Vector3(0, 0, 0),
              mass: 0.5,
            },
            {
              position: new Vector3(60.72, 0.32, -16.23),
              scale: 0.5,
              rotation: new Vector3(0, 0, 0),
              mass: 0.5,
            },
            {
              position: new Vector3(7.86, 6.67, -39.55),
              scale: 0.5,
              rotation: new Vector3(0, 0, 0),
              mass: 0.5,
            },
          ],
        },
         {
          name: "FHE_Key", 
          url: FHEKeyModel,
          collectible: true,
          creditValue: 500,
          minImpulseForCollection: 0.5,
          mass: 0.1,
          instances: [
            {
              position: new Vector3(0, -100, 8), // <--- Hidden below the map
              scale: 1.0,
              rotation: new Vector3(0, 0, 0),
              mass: 0.1,
              targetPosition: new Vector3(0, 1, 8), // <--- VISIBLE LOCATION
            },
          ],
        },

      ],
    },
  ],
};
