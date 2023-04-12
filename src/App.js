import React, { useState, useEffect } from "react";
import Web3 from "web3";
import IoTSwitch from "./contracts/IoTSwitch.json";

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState("");
  const [ioTSwitch, setIoTSwitch] = useState(null);
  const [receiverAddress, setReceiverAddress] = useState("");
  const [switchState, setSwitchState] = useState(false);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.enable();
          setWeb3(new Web3(window.ethereum));
        } catch (error) {
          console.error(error);
        }
      } else if (window.web3) {
        setWeb3(new Web3(window.web3.currentProvider));
      } else {
        console.error("No Web3 provider detected");
      }
    };

    initWeb3();
  }, []);

  useEffect(() => {
    const loadAccount = async () => {
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
    };

    if (web3) {
      loadAccount();
    }
  }, [web3]);

  useEffect(() => {
    const loadContract = async () => {
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = IoTSwitch.networks[networkId];
      const instance = new web3.eth.Contract(
        IoTSwitch.abi,
        deployedNetwork && deployedNetwork.address
      );
      setIoTSwitch(instance);
    };

    if (web3) {
      loadContract();
    }
  }, [web3]);

  const handleToggleOn = async () => {
    try {
      const encryptedState = await ioTSwitch.methods
        .encrypt(true)
        .call({ from: account });
      await ioTSwitch.methods
        .toggleSwitch(receiverAddress, encryptedState)
        .send({ from: account });
      setSwitchState(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleOff = async () => {
    try {
      const encryptedState = await ioTSwitch.methods
        .encrypt(false)
        .call({ from: account });
      await ioTSwitch.methods
        .toggleSwitch(receiverAddress, encryptedState)
        .send({ from: account });
      setSwitchState(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>IoT Switch</h1>
      {ioTSwitch && (
        <div>
          <label>Receiver Address:</label>
          <input
            type="text"
            value={receiverAddress}
            onChange={(event) => setReceiverAddress(event.target.value)}
          />
          <br />
          <label>Switch State:</label>
          <div>
            <button onClick={handleToggleOn}>ON</button>
            <button onClick={handleToggleOff}>OFF</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;