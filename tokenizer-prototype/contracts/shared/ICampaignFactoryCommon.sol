// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICampaignFactoryCommon {
    function getInstances() external view returns (address[] memory);
    function getInstancesForAsset(address asset) external view returns (address[] memory);
    function getInstancesForIssuer(address issuer) external view returns (address[] memory);
    function addInstancesForNewRegistry(address oldFactory, address oldNameRegistry, address newNameRegistry) external;
}
