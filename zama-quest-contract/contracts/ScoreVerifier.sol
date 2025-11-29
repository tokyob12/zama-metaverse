// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {
    FHE,
    euint32,
    ebool,
    externalEuint32
} from "@fhevm/solidity/lib/FHE.sol";

import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract ScoreVerifier is ZamaEthereumConfig {

    uint32 public constant SCORE_THRESHOLD = 100;

    event ScoreSubmitted(
        address indexed player,
        bytes32 isWinnerHandle,
        bytes32 portalIdHandle
    );

    function submitEncryptedScore(
        externalEuint32 extScore, 
        bytes calldata attestation
    ) public {
        //Verify & Cast
        euint32 submittedScore = FHE.fromExternal(extScore, attestation);
        euint32 threshold = FHE.asEuint32(SCORE_THRESHOLD);

        //Determine Win Condition
        ebool isWinner = FHE.ge(submittedScore, threshold);

        //Generate Random Portal ID (0-3) using Bitwise AND
        euint32 randomNum = FHE.randEuint32();
        euint32 validPortalID = FHE.and(randomNum, FHE.asEuint32(3)); 

        //Conditional Logic
        euint32 finalPortalID = FHE.select(isWinner, validPortalID, FHE.asEuint32(404));

        // The SDK requires the contract to be authorized to facilitate the decryption flow
        FHE.allow(isWinner, msg.sender);
        FHE.allow(isWinner, address(this)); 
        
        FHE.allow(finalPortalID, msg.sender);
        FHE.allow(finalPortalID, address(this)); 

        emit ScoreSubmitted(
            msg.sender,
            FHE.toBytes32(isWinner),
            FHE.toBytes32(finalPortalID)
        );
    }
}