import { ethers, upgrades } from "hardhat";
import { BigNumber } from "@ethersproject/bignumber";

async function main() {
    const [deployer,addr1] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // 1. 部署逻辑合约
    const Logic = await ethers.getContractFactory("Logic");
    const logic = await Logic.deploy();
    await logic.waitForDeployment();
    console.log("Logic deployed to:", logic.target);

    // 2. 部署 ProxyAdmin 合约
    const ProxyAdmin = await ethers.getContractFactory("ProxyAdmin");
    const proxyAdmin = await ProxyAdmin.deploy(deployer.address);
    await proxyAdmin.waitForDeployment();
    console.log("ProxyAdmin deployed to:", proxyAdmin.target);

    // 3. 部署 TransparentUpgradeableProxy 合约
    const TransparentUpgradeableProxy = await ethers.getContractFactory("TransparentUpgradeableProxy");

    const functionSignature = "initialize(string,string,address,uint256)";
    const name = "MyToken";
    const symbol = "MTK";
    const initialOwner = deployer.address; // 替换为实际地址
    const interestRate = 1; // 替换为实际的 InterestRate 值

    // 创建 Interface 实例
    const iface = new ethers.Interface([
        `function ${functionSignature}`
    ]);

    // 编码函数调用数据
    const initdata = iface.encodeFunctionData(functionSignature, [name, symbol, initialOwner, interestRate]);
    const proxy = await TransparentUpgradeableProxy.deploy(
        logic.target,     // Logic 合约地址
        proxyAdmin.target, // ProxyAdmin 合约地址
        initdata// 可选的初始化数据
    );
    await proxy.waitForDeployment();
    console.log("Proxy deployed to:", proxy.target);
    // 获取 Logic 合约的 ABI
    // @ts-ignore
    // const admin = await proxy.getAdmin();
    // console.log("ProxyAdmin address:", admin);
    // const proxyadminaddress: string = proxy.target as string;
    //
    // const proxyAdmin = await ethers.getContractAt(
    //     'ProxyAdmin',
    //     ethers.getCreateAddress({ from:proxyadminaddress, nonce: 1n }),
    // );
    // console.log(proxyAdmin.target)


    // 获取 Logic 合约的 ABI
    // @ts-ignore
    // const proxyAdminAddress = await proxy.getAdmin();
    // console.log("ProxyAdmin address:", proxyAdminAddress);

    const logicAbi = logic.interface
    //查看所有者
    const calldata = logicAbi.encodeFunctionData("getOwner");
    console.log("Calling contract via low-level call...");
    const tx = await deployer.call({
        to: proxy.target,
        data: calldata
    });
    // // 解码返回数据
    const result = logicAbi.decodeFunctionResult("getOwner", tx);
    console.log("Owner address:", result[0]);

    //铸造，查看余额
    const calldata1 = logicAbi.encodeFunctionData("mint",[deployer.address,10n*(10n**18n)]);
    console.log("Calling mint via low-level call...");
    const  tx1 = await deployer.sendTransaction({
        to: proxy.target,
        data: calldata1
    });
    await tx1.wait()

    // @ts-ignore
    const calldata2 = logicAbi.encodeFunctionData("getBalance",[deployer.address]);
    console.log("Calling getBalance via low-level call...");
    const tx2 = await deployer.call({
        to: proxy.target,
        data: calldata2
    });
    // @ts-ignore
    const result2 = logicAbi.decodeFunctionResult("getBalance", tx2);
    console.log("Owner balance", result2[0]);

    //转账后查余额
    const calldata3 = logicAbi.encodeFunctionData("transfer",[addr1.address,10n**18n]);
    console.log("Calling mint via low-level call...");
    const  tx3 = await deployer.sendTransaction({
        to: proxy.target,
        data: calldata3
    });
    await tx3.wait()

    // @ts-ignore
    const calldata4 = logicAbi.encodeFunctionData("getBalance",[deployer.address]);
    console.log("Calling getBalance via low-level call...");
    const tx4 = await deployer.call({
        to: proxy.target,
        data: calldata4
    });
    // @ts-ignore
    const result4 = logicAbi.decodeFunctionResult("getBalance", tx4);
    console.log("Owner balance", result4[0]);

    //pause transfer
    // @ts-ignore
    const calldata5 = logicAbi.encodeFunctionData("pause");
    console.log("Calling mint via low-level call...");
    const  tx5 = await deployer.sendTransaction({
        to: proxy.target,
        data: calldata5
    });
    await tx5.wait()

    try {
        const calldata6 = logicAbi.encodeFunctionData("transfer", [addr1.address, 10n ** 18n]);
        console.log("Calling pause via low-level call...");
        const tx6 = await deployer.sendTransaction({
            to: proxy.target,
            data: calldata6
        });
        await tx6.wait()
    }catch (err){
        console.log("暂停后会失败",err)
    }
    //unpause transfer
    // @ts-ignore
    const calldata7 = logicAbi.encodeFunctionData("unpause");
    console.log("Calling unpause via low-level call...");
    const  tx7 = await deployer.sendTransaction({
        to: proxy.target,
        data: calldata7
    });
    await tx7.wait()
    //transfer again
    const calldata8 = logicAbi.encodeFunctionData("transfer",[addr1.address,10n**18n]);
    console.log("Calling transfer via low-level call...");
    const  tx8 = await deployer.sendTransaction({
        to: proxy.target,
        data: calldata8
    });
    await tx8.wait()

    // @ts-ignore
    const calldata9 = logicAbi.encodeFunctionData("getBalance",[deployer.address]);
    console.log("Calling getBalance via low-level call...");
    const tx9 = await deployer.call({
        to: proxy.target,
        data: calldata9
    });
    // @ts-ignore
    const result9 = logicAbi.decodeFunctionResult("getBalance", tx9);
    console.log("Owner balance", result9[0]);

    //get  the interest init
    // @ts-ignore
    const calldata10 = logicAbi.encodeFunctionData("getInterestRate");
    console.log("Calling getInterest via low-level call...");
    const tx10 = await deployer.call({
        to: proxy.target,
        data: calldata10
    });
    // @ts-ignore
    const result10 = logicAbi.decodeFunctionResult("getInterestRate", tx10);
    console.log("Interest init ---- ", result10[0]);

    //set the interest
    // @ts-ignore
    const calldata11 = logicAbi.encodeFunctionData("setFinalInterestRate",[2]);
    console.log("Calling setInterest via low-level call...");
    const  tx11 = await deployer.sendTransaction({
        to: proxy.target,
        data: calldata11
    });
    await tx11.wait()

    //get  the interest after set
    // @ts-ignore
    const calldata12 = logicAbi.encodeFunctionData("getInterestRate");
    console.log("Calling getInterest via low-level call...");
    const tx12 = await deployer.call({
        to: proxy.target,
        data: calldata12
    });
    // @ts-ignore
    const result12 = logicAbi.decodeFunctionResult("getInterestRate", tx12);
    console.log("Interest after set -----", result12[0]);

    //派发，first to upgrade logic to V2

    const LogicV2 = await ethers.getContractFactory("LogicV2");
    const logicV2 = await LogicV2.deploy();
    await logicV2.waitForDeployment();
    console.log("LogicV2 deployed to:", logicV2.target);
    const logicAbiV2 = logicV2.interface

    try {
        const upgradeTx = await proxyAdmin.upgradeAndCall(proxy.target, logicV2.target,"0x");
        await upgradeTx.wait();
        console.log("Proxy upgraded to LogicV2");
    }catch (err){
        console.log(err)
    }
    //@ts-ignore

    const calldata13 = logicAbiV2.encodeFunctionData("getIsMintInterest",[addr1.address]);
    console.log("Calling getIsMintInterest via low-level call...");
    const tx13 = await deployer.call({
        to: proxy.target,
        data: calldata13
    });
    // @ts-ignore
    const result13 = logicAbiV2.decodeFunctionResult("getIsMintInterest", tx13);
    console.log("IsMintInterest-----", result13[0]);

    // @ts-ignore
    // try {
    //     const calldata14 = logicAbiV2.encodeFunctionData("mintInterest",[addr1.address]);
    //     console.log("Calling setInterest via low-level call...");
    //     const  tx14 = await addr1.sendTransaction({
    //         to: proxy.target,
    //         data: calldata14
    //     });
    //    const rec  = await tx14.wait()
    // }catch (err){
    //     console.log(err)
    // }
    try {
        const calldata15 = logicAbiV2.encodeFunctionData("mintInterest",[addr1.address]);
        console.log("Calling setInterest via low-level call...");
        const  tx15 = await addr1.sendTransaction({
            to: proxy.target,
            data: calldata15
        });
    }catch (err){
        console.log(err)
    }

    // @ts-ignore
    const calldata16 = logicAbiV2.encodeFunctionData("getBalance",[addr1.address]);
    console.log("Calling addr1 getBalance via low-level call...");
    const tx16 = await deployer.call({
        to: proxy.target,
        data: calldata16
    });
    // @ts-ignore
    const result16 = logicAbiV2.decodeFunctionResult("getBalance", tx16);
    console.log("addr1 balance", result16[0]);

    // 使用 BigNumber.from 来创建一个 BigNumber 对象
    const amount = BigNumber.from("2000000000000000000");

    // @ts-ignore
    const calldata17 = logicAbiV2.encodeFunctionData("burnExcessTokens",[deployer.address,10n**18n]);
    console.log("Calling burnExcessTokens via low-level call...");
    const  tx17 = await deployer.sendTransaction({
        to: proxy.target,
        data: calldata17
    });
    await tx17.wait()

    // @ts-ignore
    const calldata18 = logicAbiV2.encodeFunctionData("getBalance",[deployer.address]);
    console.log("Calling addr1 getBalance via low-level call...");
    const tx18 = await deployer.call({
        to: proxy.target,
        data: calldata18
    });
    // @ts-ignore
    const result18 = logicAbiV2.decodeFunctionResult("getBalance", tx18);
    console.log("deployer balance", result18[0]);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
