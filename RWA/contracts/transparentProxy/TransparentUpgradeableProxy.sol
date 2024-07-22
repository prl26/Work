//pragma solidity ^0.8.0;
//import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
//
//contract RWAProxy is TransparentUpgradeableProxy{
//    constructor(address _logic,address admin_,bytes memory _data) TransparentUpgradeableProxy(_logic, admin_, _data){
//
//    }
//}
// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (proxy/transparent/TransparentUpgradeableProxy.sol)

pragma solidity ^0.8.20;

import {ERC1967Utils} from "../ERC1967/ERC1967Utils.sol";
import {ERC1967Proxy} from "../ERC1967/ERC1967Proxy.sol";
import {IERC1967} from "@openzeppelin/contracts/interfaces/IERC1967.sol";
import {ProxyAdmin} from "./ProxyAdmin.sol";

interface ITransparentUpgradeableProxy is IERC1967 {
    function upgradeToAndCall(address, bytes calldata) external payable;
}

contract TransparentUpgradeableProxy is ERC1967Proxy {

    address private immutable _admin;

    error ProxyDeniedAdminAccess();

    constructor(address _logic, address initialOwner, bytes memory _data) payable ERC1967Proxy(_logic, _data) {
        _admin = initialOwner;
        // Set the storage value and emit an event for ERC-1967 compatibility
        ERC1967Utils.changeAdmin(_proxyAdmin());
    }

    function _proxyAdmin() internal view virtual returns (address) {
        return _admin;
    }
    function _fallback() internal virtual override {
        if (msg.sender == _proxyAdmin()) {
            if (msg.sig != ITransparentUpgradeableProxy.upgradeToAndCall.selector) {
                revert ProxyDeniedAdminAccess();
            } else {
                _dispatchUpgradeToAndCall();
            }
        } else {
            super._fallback();
        }
    }

    function _dispatchUpgradeToAndCall() private {
        (address newImplementation, bytes memory data) = abi.decode(msg.data[4:], (address, bytes));
        ERC1967Utils.upgradeToAndCall(newImplementation, data);
    }
}