// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";


contract Logic is Initializable, ERC20Upgradeable, OwnableUpgradeable,PausableUpgradeable {
    uint256 public initialInterestRate; // 利率
    uint256 public interestRateChangeCount; // 利率变更次数
    mapping(address => bool) public isDisInterest;

    event InterestRateChanged(uint256 newInterestRate);
    event TokensBurned(uint256 amount);

    //合约初始化
    function initialize(string memory name, string memory symbol, address initialOwner,uint256 InterestRate) public initializer {
        __ERC20_init(name, symbol);
        __Ownable_init(msg.sender);
        _transferOwnership(initialOwner);
        initialInterestRate = InterestRate;
    }
    /**
    * ------------ 修飾器 ---------
    */
    modifier onlyOnce() {
        require(interestRateChangeCount == 0, "Interest rate can only be changed once");
        _;
    }

    /**
    * ------------ view ---------
    */
    function getInterestRate() public view returns (uint256) {
        return initialInterestRate;
    }
    function getOwner() external view returns (address) {
        return owner();
    }
    function getBalance(address addr) external view returns (uint256) {
        return balanceOf(addr);
    }
    /**
    * ------------ 修改函數 ---------
    */
    // 修改利率，设定为只能一次
    function setFinalInterestRate(uint256 _finalInterestRate) external onlyOwner onlyOnce {
        initialInterestRate = _finalInterestRate;
        interestRateChangeCount++;
        emit InterestRateChanged(_finalInterestRate);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // 销毁代币
    function burnExcessTokens(address addr,uint256 amount) external onlyOwner {
        _burn(addr, amount);
        // 销毁合约地址上的代币
        emit TokensBurned(amount);
    }
    function pause() external onlyOwner {
        _pause();
    }

    // 开启交易
    function unpause() external onlyOwner {
        _unpause();
    }

    // 覆盖 ERC20 的 transfer 方法
    function transfer(address recipient, uint256 amount) public override whenNotPaused returns (bool) {
        return super.transfer(recipient, amount);
    }

    // 覆盖 ERC20 的 transferFrom 方法
    function transferFrom(address sender, address recipient, uint256 amount) public override whenNotPaused returns (bool) {
        return super.transferFrom(sender, recipient, amount);
    }

    // 根据地址余额和利率增发,需升级后触发
//    function mintInterest(address to) external  {
//        require(isDisInterest[to] == false,"you've got the interest");
//        uint256 balance = balanceOf(to);
//        uint256 mintAmount = (balance * initialInterestRate) / 100 ; // Assuming interest rate is a percentage
//        _mint(to, mintAmount);
//    }
}
