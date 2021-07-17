import React, { useState, useEffect, useCallback } from "react";
import Web3 from "web3";

import Daitoken from "../abis/DaiToken.json";
import DappToken from "../abis/DappToken.json";
import TokenFarm from "../abis/TokenFarm.json";

import Main from "./Main";
import Navbar from "./Navbar";
import "./App.css";

const App = props => {
  const [state, setState] = useState({
    account: "0x0",
    daiToken: {}, //dont save 
    dappToken: {}, // sont ssave 
    tokenFarm: {}, // dont save
    daiTokenBalance: "0",
    dappTokenBalance: "0",
    stakingBalance: "0",
  });
  const fetchDataFromBlockChain = useCallback(async () => {
    await loadWeb3();
    console.log("WEB3 LOADED!!");
    await loadBlockchainData();
  }, []);

  useEffect(() => {
    fetchDataFromBlockChain();
  }, []);

  const [loading, setLoading] = useState(true);
  const [isStaking, setIsStaking] = useState(false);

  const loadBlockchainData = async () => {
    const web3 = window.web3;

    const accounts = await web3.eth.getAccounts();
    let data = {};
    console.log({ accounts });
    data = { ...data, account: accounts[0] };
    const networkId = await web3.eth.net.getId();
    console.log({ networkId });

    // load DaiToken
    const daiTokenData = Daitoken.networks[networkId];
    //  useDai(Dairoke)
    if (daiTokenData) {
      const daiToken = new web3.eth.Contract(
        Daitoken.abi,
        daiTokenData.address
      );
      data = { ...data, daiToken };
      let daiTokenBalance = await daiToken.methods
        .balanceOf(data.account)
        .call();
      console.log({ daiTokenBalance });
      data = { ...data, daiTokenBalance: daiTokenBalance.toString() };
    } else {
      window.alert("DaiToken COntract not deployed to the detected network.");
    }

    // Load DappToken
    const dappTokenData = DappToken.networks[networkId];

    if (dappTokenData) {
      const dappToken = new web3.eth.Contract(
        Daitoken.abi,
        dappTokenData.address
      );
      data = { ...data, dappToken };
      let dappTokenBalance = await dappToken.methods
        .balanceOf(data.account)
        .call();
      console.log({ dappTokenBalance });
      data = { ...data, dappTokenBalance: dappTokenBalance.toString() };
    } else {
      window.alert("DaiToken COntract not deployed to the detected network.");
    }

    // Load TokenFarm
    const tokeFarmData = TokenFarm.networks[networkId];

    if (tokeFarmData) {
      const tokenFarm = new web3.eth.Contract(
        TokenFarm.abi,
        tokeFarmData.address
      );
      data = { ...data, tokenFarm };
      let stakingBalance = await tokenFarm.methods
        .stakingBalance(data.account)
        .call();
      let staking = await tokenFarm.methods.isStaking(data.account).call();
      setIsStaking(staking);
      console.log({ stakingBalance });
      data = { ...data, stakingBalance: stakingBalance.toString() };
    } else {
      window.alert("DaiToken COntract not deployed to the detected network.");
    }
    setState(data);
    setLoading(false);
  };
  
  const reloadAccountInfo = async () => await loadBlockchainData();

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.on("accountsChanged", reloadAccountInfo);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should condsider trying MetaMask!"
      );
    }
  };

  // Stake TOKENS
  const stakeTokens = amount => {
    console.log(`STAKING TOKENS ${amount}!!!`);
    setLoading(true);
    state.daiToken.methods
      .approve(state.tokenFarm._address, amount)
      .send({ from: state.account })
      .on("transactionHash", hash => {
        state.tokenFarm.methods
          .stakeTokens(amount)
          .send({ from: state.account })
          .on("receipt", async hash => {
            
            let newStakingBalance = await state.tokenFarm.methods.stakingBalance(state.account).call()
            let daiTokenBalace = await state.daiToken.methods.balanceOf(state.account).call()
            console.log({newStakingBalance, daiTokenBalace})
            setState(prev_state => ({
              ...prev_state,
              daiTokenBalance: `${daiTokenBalace}`,
              stakingBalance: `${newStakingBalance}`,
            }));
            setLoading(false);
            setIsStaking(true);
          });
      })
      .on("error", e => {
        window.alert(
          `Transaction didn't proceed with error ${JSON.stringify(e)}`
        );
        setLoading(false);
      });
  };

  // Unstake Tokens
  const unstakeTokens =  () => {
    setLoading(true);
    state.tokenFarm.methods
      .unstakeTokens()
      .send({ from: state.account })
      .on("receipt", async hash => {

        let newDaiBalance = await state.daiToken.methods.balanceOf(state.account).call() // add signals for withdrawl or adding so that this call becomes redundant
        let newStakingBalance = await state.tokenFarm.methods.stakingBalance(state.account).call() // add signals for withdrawl or adding so that this call becomes redundant
        console.log({newDaiBalance,newStakingBalance})
        setState(prev_state => ({
          ...prev_state,
          daiTokenBalance: newDaiBalance.toString(),
          stakingBalance: newStakingBalance.toString(),
        }));
        let staking= await state.tokenFarm.methods.isStaking(state.account).call();
        console.log(state)
        setIsStaking(staking);
        setLoading(false);
      })
      .on("error",(e,receipt) => { console.log(e); console.log(receipt); setLoading(false) });
  };

  return (
    <div>
      <Navbar account={state.account} />
      <div className="container-fluid mt-5">
        <div className="row">
          <main
            role="main"
            className="col-lg-12 ml-auto mr-auto"
            style={{ maxWidth: "600px" }}
          >
            <div className="content mr-auto ml-auto">
              {loading ? (
                <div className="mt-3">
                  <p id="loader" className="text-center">
                    loadiing...
                  </p>
                </div>
              ) : (
                <Main
                  daiTokenBalance={state.daiTokenBalance}
                  dappTokenBalance={state.dappTokenBalance}
                  stakingBalance={state.stakingBalance}
                  stakeTokens={stakeTokens}
                  unstakeTokens={unstakeTokens}
                  isStaking={isStaking}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
