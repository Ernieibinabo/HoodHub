export const CONTRACT_ADDRESS =
  "0x6378a187a8e39C4dE782Ae17e5dC2e4891594eA3";

export const CONTRACT_ABI = [
  {
    inputs: [],
    name: "getMessages",
    outputs: [
      {
        components: [
          { internalType: "address", name: "user", type: "address" },
          { internalType: "string", name: "text", type: "string" }
        ],
        internalType: "struct HelloRobinhood.Message[]",
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "messages",
    outputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "string", name: "text", type: "string" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "string", name: "_text", type: "string" }],
    name: "updateMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
];
