// @ts-ignore
import {ethers} from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    // 部署逻辑合约
    const USDTToken = await ethers.getContractFactory("USDTToken");
    const usdtToken = await USDTToken.deploy("USDT Token", "USDT", 5, 1633024800, 1701168000); // 示例参数
    await usdtToken.deployed();
    console.log("USDTToken deployed to:", usdtToken.address);

    // 部署代理合约
    const Proxy = await ethers.getContractFactory("Proxy");
    const proxy = await Proxy.deploy();
    await proxy.deployed();
    console.log("Proxy deployed to:", proxy.address);

    // 设置逻辑合约地址
    await proxy.setTarget(usdtToken.address);
    console.log("Proxy target set to USDTToken address");
}


main().then(() => console.log(" ")).catch(console.error);
