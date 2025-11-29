export const CRATE_QUESTIONS = [
  // --- CORE FHE / ZAMA QUESTIONS (10 Questions) ---

  {
    question: "What is the primary function of Fully Homomorphic Encryption (FHE)?",
    answers: [
      "To compress large data files for faster transfer",
      "To perform computations on encrypted data without decrypting it",
      "To verify the integrity of a message's sender",
    ],
    correctIndex: 1, 
  },
  {
    question: "What is Zama's main FHE library designed for confidential computation?",
    answers: [
      "openFHE",
      "Concrete",
      "homoPy",
    ],
    correctIndex: 1, 
  },
  {
    question: "In FHE, what does 'Homomorphic' refer to?",
    answers: [
      "The ability to transfer ownership of the data",
      "The structural equivalence between computation on plaintext and computation on ciphertext",
      "The method used for generating the random encryption key",
    ],
    correctIndex: 1, 
  },
  {
    question: "The FHE Smart Contracts developed by Zama run on which specialized environment?",
    answers: [
      "Standard Ethereum Virtual Machine (EVM)",
      "Fully Homomorphic Encryption Virtual Machine (FHEVM)",
      "Solana Virtual Machine (SVM)",
    ],
    correctIndex: 1, 
  },
  {
    question: "Which cryptographic primitive forms the basis for Zama's Concrete FHE scheme?",
    answers: [
      "Elliptic Curve Cryptography (ECC)",
      "Lattice-based Cryptography",
      "Quantum Random Number Generation (QRNG)",
    ],
    correctIndex: 1, 
  },
  {
    question: "What is the primary technical challenge FHE is designed to solve in cloud computing?",
    answers: [
      "Network latency between client and server",
      "The need for the cloud provider to see private data for processing",
      "Database read/write speed",
    ],
    correctIndex: 1, 
  },
  {
    question: "When a contract uses FHE.allow(handle, address), what is it granting?",
    answers: [
      "Permission for the address to transfer the handle",
      "Permission for the address to decrypt the handle privately",
      "Permission for the address to mutate the handle's value",
    ],
    correctIndex: 1, 
  },
  {
    question: "What FHE operation does your game's Smart Contract use to check if the score is over the threshold?",
    answers: [
      "FHE.add (Homomorphic Addition)",
      "FHE.ge (Homomorphic Greater Than or Equal To)",
      "FHE.rand (Homomorphic Randomness)",
    ],
    correctIndex: 1, 
  },
  {
    question: "In the FHEVM flow, who performs the heavy computation (the 'Bootstrap' operation)?",
    answers: [
      "The player's browser during transaction submission",
      "The dedicated FHE Coprocessor/Relayer network",
      "The standard Ethereum validator nodes",
    ],
    correctIndex: 1, 
  },
  {
    question: "What does the Zama SDK use to securely prove a transaction originates from the connected user?",
    answers: [
      "A simple password hash",
      "The EIP-712 signing flow (Attestation)",
      "An anonymous VPN connection",
    ],
    correctIndex: 1, 
  },
];