//pragma solidity ^0.8.0;
//import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
//
//contract RWAProxyAdmin is ProxyAdmin{
//    constructor(address initialOwner) ProxyAdmin(initialOwner) {}
//
//}
// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (proxy/transparent/ProxyAdmin.sol)

pragma solidity ^0.8.20;

import {ITransparentUpgradeableProxy} from "./TransparentUpgradeableProxy.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";


contract ProxyAdmin is Ownable {

    string public constant UPGRADE_INTERFACE_VERSION = "5.0.0";


    constructor(address initialOwner) Ownable(initialOwner) {}


    function upgradeAndCall(
        ITransparentUpgradeableProxy proxy,
        address implementation,
        bytes memory data
    ) public payable virtual onlyOwner {
        proxy.upgradeToAndCall{value: msg.value}(implementation, data);
    }
}