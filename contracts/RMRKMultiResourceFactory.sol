// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.16;

import "@rmrk-team/evm-contracts/contracts/implementations/RMRKMultiResourceImpl.sol";

contract RMRKMultiResourceFactory {
    address[] public multiResourceCollections;

    event NewRMRKMultiResourceContract(
        address indexed multiResourceContract,
        address indexed deployer
    );

    function getCollections() external view returns (address[] memory) {
        return multiResourceCollections;
    }

    function deployRMRKMultiResource(
        string memory name,
        string memory symbol,
        uint256 maxSupply,
        uint256 pricePerMint, //in WEI
        string memory collectionMetadata
    ) public {
        RMRKMultiResourceImpl multiResourceContract = new RMRKMultiResourceImpl(
            name,
            symbol,
            maxSupply,
            pricePerMint,
            collectionMetadata,
            collectionMetadata, // token URI
            msg.sender, // royalty reciever
            0 // royalty basis points
        );
        multiResourceCollections.push(address(multiResourceContract));
        multiResourceContract.transferOwnership(msg.sender);
        emit NewRMRKMultiResourceContract(
            address(multiResourceContract),
            msg.sender
        );
    }
}
