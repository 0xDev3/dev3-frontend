// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IAssetTransferableFactory.sol";
import "../deployers/IAssetTransferableDeployer.sol";
import "../shared/Structs.sol";
import "../shared/IAssetCommon.sol";
import "../registry/INameRegistry.sol";

contract AssetTransferableFactory is IAssetTransferableFactory {

    string constant public FLAVOR = "AssetTransferableV1";
    string constant public VERSION = "1.0.30";
    
    address public deployer;
    address[] public instances;
    bool public initialized;
    mapping (address => address[]) instancesPerIssuer;

    event AssetTransferableCreated(address indexed creator, address asset, uint256 timestamp);

    constructor(address _deployer, address _oldFactory) {
        deployer = _deployer;
        if (_oldFactory != address(0)) { _addInstances(IAssetTransferableFactory(_oldFactory).getInstances()); }
    }

    function create(Structs.AssetTransferableFactoryParams memory params) public override returns (address) {
        INameRegistry nameRegistry = INameRegistry(params.nameRegistry);
        require(
            nameRegistry.getAsset(params.mappedName) == address(0),
            "AssetTransferableFactory: asset with this name already exists"
        );
        address asset = IAssetTransferableDeployer(deployer).create(FLAVOR, VERSION, params);
        _addInstance(asset);
        nameRegistry.mapAsset(params.mappedName, asset);
        emit AssetTransferableCreated(params.creator, asset, block.timestamp);
        return asset;
    }

    function getInstances() external override view returns (address[] memory) { return instances; }
    
    function getInstancesForIssuer(address issuer) external override view returns (address[] memory) { 
        return instancesPerIssuer[issuer];
    }

    function addInstancesForNewRegistry(
        address oldFactory,
        address oldNameRegistry,
        address newNameRegistry
    ) external override {
        require(!initialized, "AssetTransferableFactory: Already initialized");
        address[] memory _instances = IAssetTransferableFactory(oldFactory).getInstances();
        for (uint256 i = 0; i < _instances.length; i++) {
            address instance = _instances[i];
            _addInstance(instance);
            string memory oldName = INameRegistry(oldNameRegistry).getAssetName(instance);
            if (bytes(oldName).length > 0) { INameRegistry(newNameRegistry).mapAsset(oldName, instance); }
        }
        initialized = true;
    }

    /////////// HELPERS ///////////

    function _addInstances(address[] memory _instances) private {
        for (uint256 i = 0; i < _instances.length; i++) { _addInstance(_instances[i]); }
    }

    function _addInstance(address _instance) private {
        instances.push(_instance);
        instancesPerIssuer[IAssetCommon(_instance).commonState().issuer].push(_instance);
    }

}
