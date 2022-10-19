// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "@rmrk-team/evm-contracts/contracts/implementations/RMRKEquippableImpl.sol";

contract RMRKEquippableFactory {
    address[] public equippableCollections;

    event NewRMRKEquippableContract(
        address indexed equippableContract,
        address indexed deployer
    );

    function getCollections() external view returns (address[] memory) {
        return equippableCollections;
    }

    function deployRMRKEquippable(
        string memory name,
        string memory symbol,
        uint256 maxSupply,
        uint256 pricePerMint, //in WEI
        string memory collectionMetadata //in WEI
    ) public {
        RMRKEquippableImpl equippableContract = new RMRKEquippableImpl(
            name,
            symbol,
            maxSupply,
            pricePerMint,
            collectionMetadata,
            collectionMetadata, // token URI
            msg.sender, // royalty reciever
            0 // royalty basis points
        );

        equippableCollections.push(address(equippableContract));
        equippableContract.transferOwnership(msg.sender);
        emit NewRMRKEquippableContract(address(equippableContract), msg.sender);
    }
}
