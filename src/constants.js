// src/constants.js

export const HelloRobinhoodAddress = "0x12ED323e61545c956d6db94eC09d53CE55866806"; // your deployed contract

export const HelloRobinhoodABI = [
  {
    "inputs": [],
    "name": "getMessages",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "user", "type": "address" },
          { "internalType": "string", "name": "text", "type": "string" }
        ],
        "internalType": "struct HelloRobinhood.Message[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "messages",
    "outputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "string", "name": "text", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "_text", "type": "string" }],
    "name": "updateMessage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
