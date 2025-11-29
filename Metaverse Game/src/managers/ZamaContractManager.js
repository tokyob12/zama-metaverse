import { ethers } from "ethers";

import { 
  createInstance, 
  initSDK, 
  SepoliaConfig
} from "../sdk/relayer.js";

export class ZamaContractManager {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.userAddress = null;
    this.contract = null;
    this.instance = null; 

    // Your deployed contract
    this.CONTRACT_ADDRESS = ethers.getAddress("0x39871d3FFFBa66eFa5Cd0498BF13A97D7E80f41B");

    this.ABI = [
      "function submitEncryptedScore(bytes32 extScore, bytes attestation) public",
      "event ScoreSubmitted(address indexed player, bytes32 isWinnerHandle, bytes32 portalIdHandle)",
    ];
  }

  async connectWallet() {
    try {
      if (!window.ethereum) return null;

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      this.userAddress = ethers.getAddress(accounts[0]);

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }], 
        });
      } catch (e) { console.warn(e); }

      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.contract = new ethers.Contract(this.CONTRACT_ADDRESS, this.ABI, this.signer);

      console.log("Initializing Zama SDK...");
      await initSDK({
        tfheParams: window.location.origin + "/tfhe_bg.wasm",
        kmsParams: window.location.origin + "/kms_lib_bg.wasm"
      });

      this.instance = await createInstance({
        ...SepoliaConfig,
        chainId: 11155111,
        relayerUrl: "https://relayer.testnet.zama.org",
      });

      console.log("Zama SDK Ready!");
      return this.userAddress;

    } catch (err) {
      console.error("connectWallet Error:", err);
      return null;
    }
  }

  // -------------------------------------------------------
  async submitFinalScore(score) {
    if (!this.instance) return { success: false, error: "SDK not ready" };

    try {
      console.log(`Encrypting score: ${score}`);

      // 1. Encrypt locally
      const input = this.instance.createEncryptedInput(
        this.CONTRACT_ADDRESS,
        this.userAddress
      );
      
      input.add32(score); 
      const { handles, inputProof } = await input.encrypt();

      // 2. Submit to Blockchain (Real TX)
      console.log("Sending Transaction...");
      const tx = await this.contract.submitEncryptedScore(
        handles[0],
        inputProof
      );
      
      console.log(`Waiting for TX: ${tx.hash}`);
      const receipt = await tx.wait();

      console.log("Transaction Confirmed on Sepolia!");

      // ---------------------------------------------------------
      console.log("Skipping Relayer Decryption (Simulation Mode)");
      
      // We simulate the logic that the contract would have done
      const isWinner = score >= 100;
      
      // Generate a random Portal ID (0-3) locally since we can't decrypt the real one
      const mockPortalID = Math.floor(Math.random() * 4); 

      console.log(`Local Result: Winner? ${isWinner}. Portal ID: ${mockPortalID}`);

      return {
        success: true,
        isWinner: isWinner,
        portalID: mockPortalID, // Using local random ID to trigger game event
        txHash: tx.hash
      };

    } catch (err) {
      console.error("submitFinalScore Error:", err);
      return { success: false, error: err.message };
    }
  }

  isWalletConnected() {
    return !!this.userAddress;
  }
}