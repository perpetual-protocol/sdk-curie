/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  ClearingHouseConfig,
  ClearingHouseConfigInterface,
} from "../ClearingHouseConfig";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        indexed: true,
        internalType: "bool",
        name: "isProvider",
        type: "bool",
      },
    ],
    name: "BackstopLiquidityProviderChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint24",
        name: "liquidationPenaltyRatio",
        type: "uint24",
      },
    ],
    name: "LiquidationPenaltyRatioChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint24",
        name: "rate",
        type: "uint24",
      },
    ],
    name: "MaxFundingRateChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "maxMarketsPerAccount",
        type: "uint8",
      },
    ],
    name: "MaxMarketsPerAccountChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint24",
        name: "partialCloseRatio",
        type: "uint24",
      },
    ],
    name: "PartialCloseRatioChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "cap",
        type: "uint256",
      },
    ],
    name: "SettlementTokenBalanceCapChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "twapInterval",
        type: "uint256",
      },
    ],
    name: "TwapIntervalChanged",
    type: "event",
  },
  {
    inputs: [],
    name: "candidate",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getImRatio",
    outputs: [
      {
        internalType: "uint24",
        name: "",
        type: "uint24",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getLiquidationPenaltyRatio",
    outputs: [
      {
        internalType: "uint24",
        name: "",
        type: "uint24",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getMaxFundingRate",
    outputs: [
      {
        internalType: "uint24",
        name: "",
        type: "uint24",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getMaxMarketsPerAccount",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getMmRatio",
    outputs: [
      {
        internalType: "uint24",
        name: "",
        type: "uint24",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPartialCloseRatio",
    outputs: [
      {
        internalType: "uint24",
        name: "",
        type: "uint24",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getSettlementTokenBalanceCap",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTwapInterval",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "isBackstopLiquidityProvider",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "bool",
        name: "isProvider",
        type: "bool",
      },
    ],
    name: "setBackstopLiquidityProvider",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint24",
        name: "liquidationPenaltyRatioArg",
        type: "uint24",
      },
    ],
    name: "setLiquidationPenaltyRatio",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint24",
        name: "rate",
        type: "uint24",
      },
    ],
    name: "setMaxFundingRate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "maxMarketsPerAccountArg",
        type: "uint8",
      },
    ],
    name: "setMaxMarketsPerAccount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "setOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint24",
        name: "partialCloseRatioArg",
        type: "uint24",
      },
    ],
    name: "setPartialCloseRatio",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "cap",
        type: "uint256",
      },
    ],
    name: "setSettlementTokenBalanceCap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "twapIntervalArg",
        type: "uint32",
      },
    ],
    name: "setTwapInterval",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "updateOwner",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506110e8806100206000396000f3fe608060405234801561001057600080fd5b50600436106101425760003560e01c80637bce35ae116100b857806390cf78e41161007c57806390cf78e4146102dd578063a2495a961461030b578063a854940214610345578063bc5920ba1461034d578063c846961e14610355578063fedf924b1461037257610142565b80637bce35ae1461026f5780638129fc1c1461029157806385eacc77146102995780638af3a60d146102b35780638da5cb5b146102d557610142565b8063543ce73a1161010a578063543ce73a146101f35780636c8381f8146102135780636e1d2dd214610237578063715018a61461023f57806373f6250114610247578063742833361461026757610142565b8063050a0ba31461014757806313af40351461016b5780631d27050f146101915780632c47ccba146101b45780633e742e3b146101d2575b600080fd5b6101696004803603602081101561015d57600080fd5b503562ffffff1661037a565b005b6101696004803603602081101561018157600080fd5b50356001600160a01b0316610477565b610169600480360360208110156101a757600080fd5b503563ffffffff166105d2565b6101bc6106cb565b6040805160ff9092168252519081900360200190f35b6101da6106d4565b6040805163ffffffff9092168252519081900360200190f35b6101fb6106e7565b6040805162ffffff9092168252519081900360200190f35b61021b6106f7565b604080516001600160a01b039092168252519081900360200190f35b6101fb610706565b610169610718565b6101696004803603602081101561025d57600080fd5b503560ff166107b9565b6101fb61085e565b6101696004803603602081101561028557600080fd5b503562ffffff16610870565b6101696109b2565b6102a1610acf565b60408051918252519081900360200190f35b610169600480360360208110156102c957600080fd5b503562ffffff16610ad5565b61021b610b8a565b610169600480360360408110156102f357600080fd5b506001600160a01b0381351690602001351515610b99565b6103316004803603602081101561032157600080fd5b50356001600160a01b0316610c4a565b604080519115158252519081900360200190f35b6101fb610c68565b610169610c7b565b6101696004803603602081101561036b57600080fd5b5035610d67565b6101fb610dff565b80620f42408162ffffff1611156103c1576040805162461bcd60e51b81526020600482015260066024820152654348435f524f60d01b604482015290519081900360640190fd5b6103c9610e11565b6001600160a01b03166103da610b8a565b6001600160a01b03161461041e576040805162461bcd60e51b8152602060048201526006602482015265534f5f434e4f60d01b604482015290519081900360640190fd5b6067805462ffffff8416600160381b810262ffffff60381b199092169190911790915560408051918252517ff95b3e2798060899824a0bebdd89ff5df3d51c51c5d30f5184bd30d7a6b017089181900360200190a15050565b61047f610e11565b6001600160a01b0316610490610b8a565b6001600160a01b0316146104d4576040805162461bcd60e51b8152602060048201526006602482015265534f5f434e4f60d01b604482015290519081900360640190fd5b6001600160a01b038116610518576040805162461bcd60e51b81526020600482015260066024820152650534f5f4e57360d41b604482015290519081900360640190fd5b6033546001600160a01b0382811691161415610564576040805162461bcd60e51b8152602060048201526006602482015265534f5f53414f60d01b604482015290519081900360640190fd5b6034546001600160a01b03828116911614156105b0576040805162461bcd60e51b8152602060048201526006602482015265534f5f53414360d01b604482015290519081900360640190fd5b603480546001600160a01b0319166001600160a01b0392909216919091179055565b6105da610e11565b6001600160a01b03166105eb610b8a565b6001600160a01b03161461062f576040805162461bcd60e51b8152602060048201526006602482015265534f5f434e4f60d01b604482015290519081900360640190fd5b63ffffffff8116610671576040805162461bcd60e51b81526020600482015260076024820152664348435f49544960c81b604482015290519081900360640190fd5b6067805463ffffffff8316600160801b810263ffffffff60801b199092169190911790915560408051918252517f0bd5e02c0d6277fdf7c7c72fae10042c4c832b26ea94623a04b79a50a35a217e9181900360200190a150565b60675460ff1690565b606754600160801b900463ffffffff1690565b606754610100900462ffffff1690565b6034546001600160a01b031690565b606754600160681b900462ffffff1690565b610720610e11565b6001600160a01b0316610731610b8a565b6001600160a01b031614610775576040805162461bcd60e51b8152602060048201526006602482015265534f5f434e4f60d01b604482015290519081900360640190fd5b6033546040516000916001600160a01b031690600080516020611093833981519152908390a3603380546001600160a01b0319908116909155603480549091169055565b6107c1610e11565b6001600160a01b03166107d2610b8a565b6001600160a01b031614610816576040805162461bcd60e51b8152602060048201526006602482015265534f5f434e4f60d01b604482015290519081900360640190fd5b6067805460ff831660ff19909116811790915560408051918252517fa7b4760b38e2a630f3073fcd5119972cbf81bd50e3761f86534a69661caf81109181900360200190a150565b606754600160501b900462ffffff1690565b80620f42408162ffffff1611156108b7576040805162461bcd60e51b81526020600482015260066024820152654348435f524f60d01b604482015290519081900360640190fd5b6108bf610e11565b6001600160a01b03166108d0610b8a565b6001600160a01b031614610914576040805162461bcd60e51b8152602060048201526006602482015265534f5f434e4f60d01b604482015290519081900360640190fd5b60008262ffffff1611610959576040805162461bcd60e51b815260206004820152600860248201526721a421afa4a821a960c11b604482015290519081900360640190fd5b6067805462ffffff8416600160501b810262ffffff60501b199092169190911790915560408051918252517f4757c16c46bedf5171cc1e2c53c99225da1bff2c0a5cb51b0f852909dbae1ebd9181900360200190a15050565b600054610100900460ff16806109cb57506109cb610e15565b806109d9575060005460ff16155b610a145760405162461bcd60e51b815260040180806020018281038252602e815260200180611065602e913960400191505060405180910390fd5b600054610100900460ff16158015610a3f576000805460ff1961ff0019909116610100171660011790555b610a47610e26565b6067805460ff60ff199091161763ffffff001916630186a0001766ffffff00000000191665f424000000001762ffffff60381b1916610c35603b1b1762ffffff60501b1916613d0960541b1762ffffff60681b1916610c35606d1b1763ffffffff60801b191660e160821b17905560006068558015610acc576000805461ff00191690555b50565b60685490565b610add610e11565b6001600160a01b0316610aee610b8a565b6001600160a01b031614610b32576040805162461bcd60e51b8152602060048201526006602482015265534f5f434e4f60d01b604482015290519081900360640190fd5b6067805462ffffff8316600160681b810262ffffff60681b199092169190911790915560408051918252517f0bcb070f78e3c4fec82334dff77e5369a878886b8be26c9f98daa534a8cf67789181900360200190a150565b6033546001600160a01b031690565b610ba1610e11565b6001600160a01b0316610bb2610b8a565b6001600160a01b031614610bf6576040805162461bcd60e51b8152602060048201526006602482015265534f5f434e4f60d01b604482015290519081900360640190fd5b6001600160a01b038216600081815260696020526040808220805460ff191685151590811790915590519092917fea46bd0a90ba772a1dbffd4f585e1418c095cb5f70177a38f6eeadf26046e8a991a35050565b6001600160a01b031660009081526069602052604090205460ff1690565b606754640100000000900462ffffff1690565b6034546001600160a01b0316610cc0576040805162461bcd60e51b81526020600482015260056024820152640534f5f43360dc1b604482015290519081900360640190fd5b610cc8610e11565b6034546001600160a01b03908116911614610d13576040805162461bcd60e51b8152602060048201526006602482015265534f5f434e4360d01b604482015290519081900360640190fd5b6034546033546040516001600160a01b03928316929091169060008051602061109383398151915290600090a360348054603380546001600160a01b03199081166001600160a01b03841617909155169055565b610d6f610e11565b6001600160a01b0316610d80610b8a565b6001600160a01b031614610dc4576040805162461bcd60e51b8152602060048201526006602482015265534f5f434e4f60d01b604482015290519081900360640190fd5b60688190556040805182815290517fc6564be86420b541b7946583fdb54d45535a59a04e3b3525b536ccc547b4cd8f9181900360200190a150565b606754600160381b900462ffffff1690565b3390565b6000610e2030610f15565b15905090565b600054610100900460ff1680610e3f5750610e3f610e15565b80610e4d575060005460ff16155b610e885760405162461bcd60e51b815260040180806020018281038252602e815260200180611065602e913960400191505060405180910390fd5b600054610100900460ff16158015610eb3576000805460ff1961ff0019909116610100171660011790555b610ebb610f1b565b6000610ec5610e11565b603380546001600160a01b0319166001600160a01b03831690811790915560405191925090600090600080516020611093833981519152908290a3508015610acc576000805461ff001916905550565b3b151590565b600054610100900460ff1680610f345750610f34610e15565b80610f42575060005460ff16155b610f7d5760405162461bcd60e51b815260040180806020018281038252602e815260200180611065602e913960400191505060405180910390fd5b600054610100900460ff16158015610fa8576000805460ff1961ff0019909116610100171660011790555b610fb0610fc4565b8015610acc576000805461ff001916905550565b600054610100900460ff1680610fdd5750610fdd610e15565b80610feb575060005460ff16155b6110265760405162461bcd60e51b815260040180806020018281038252602e815260200180611065602e913960400191505060405180910390fd5b600054610100900460ff16158015610fb0576000805460ff1961ff0019909116610100171660011790558015610acc576000805461ff00191690555056fe496e697469616c697a61626c653a20636f6e747261637420697320616c726561647920696e697469616c697a65648be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0a26469706673582212209a039e5dbfb2e031f1d0ce87688fceeaa60f6c822d10a5c2eb28331fc6a6be9b64736f6c63430007060033";

export class ClearingHouseConfig__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ClearingHouseConfig> {
    return super.deploy(overrides || {}) as Promise<ClearingHouseConfig>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): ClearingHouseConfig {
    return super.attach(address) as ClearingHouseConfig;
  }
  connect(signer: Signer): ClearingHouseConfig__factory {
    return super.connect(signer) as ClearingHouseConfig__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ClearingHouseConfigInterface {
    return new utils.Interface(_abi) as ClearingHouseConfigInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ClearingHouseConfig {
    return new Contract(address, _abi, signerOrProvider) as ClearingHouseConfig;
  }
}