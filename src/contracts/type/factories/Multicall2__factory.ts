/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { Multicall2, Multicall2Interface } from "../Multicall2";

const _abi = [
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "target",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "callData",
            type: "bytes",
          },
        ],
        internalType: "struct Multicall2.Call[]",
        name: "calls",
        type: "tuple[]",
      },
    ],
    name: "aggregate",
    outputs: [
      {
        internalType: "uint256",
        name: "blockNumber",
        type: "uint256",
      },
      {
        internalType: "bytes[]",
        name: "returnData",
        type: "bytes[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "requireSuccess",
        type: "bool",
      },
      {
        components: [
          {
            internalType: "address",
            name: "target",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "callData",
            type: "bytes",
          },
        ],
        internalType: "struct Multicall2.Call[]",
        name: "calls",
        type: "tuple[]",
      },
    ],
    name: "tryAggregate",
    outputs: [
      {
        components: [
          {
            internalType: "bool",
            name: "success",
            type: "bool",
          },
          {
            internalType: "bytes",
            name: "returnData",
            type: "bytes",
          },
        ],
        internalType: "struct Multicall2.Result[]",
        name: "returnData",
        type: "tuple[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506106f1806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063252dba421461003b578063bce38bd714610065575b600080fd5b61004e61004936600461044f565b610085565b60405161005c9291906105ff565b60405180910390f35b61007861007336600461048a565b6101c3565b60405161005c9190610524565b8051439060609067ffffffffffffffff811180156100a257600080fd5b506040519080825280602002602001820160405280156100d657816020015b60608152602001906001900390816100c15790505b50905060005b83518110156101bd576000808583815181106100f457fe5b6020026020010151600001516001600160a01b031686848151811061011557fe5b60200260200101516020015160405161012e9190610508565b6000604051808303816000865af19150503d806000811461016b576040519150601f19603f3d011682016040523d82523d6000602084013e610170565b606091505b50915091508161019b5760405162461bcd60e51b8152600401610192906105ca565b60405180910390fd5b808484815181106101a857fe5b602090810291909101015250506001016100dc565b50915091565b6060815167ffffffffffffffff811180156101dd57600080fd5b5060405190808252806020026020018201604052801561021757816020015b610204610318565b8152602001906001900390816101fc5790505b50905060005b82518110156103115760008084838151811061023557fe5b6020026020010151600001516001600160a01b031685848151811061025657fe5b60200260200101516020015160405161026f9190610508565b6000604051808303816000865af19150503d80600081146102ac576040519150601f19603f3d011682016040523d82523d6000602084013e6102b1565b606091505b509150915085156102d957816102d95760405162461bcd60e51b815260040161019290610589565b60405180604001604052808315158152602001828152508484815181106102fc57fe5b6020908102919091010152505060010161021d565b5092915050565b60408051808201909152600081526060602082015290565b600082601f830112610340578081fd5b8135602067ffffffffffffffff8083111561035757fe5b6103648283850201610667565b83815282810190868401865b8681101561044157813589016040601f198181848f03011215610391578a8bfd5b81518281018181108a821117156103a457fe5b8352838a01356001600160a01b03811681146103be578c8dfd5b815283830135898111156103d0578c8dfd5b8085019450508d603f8501126103e4578b8cfd5b89840135898111156103f257fe5b6104028b84601f84011601610667565b92508083528e84828701011115610417578c8dfd5b808486018c85013782018a018c9052808a0191909152865250509285019290850190600101610370565b509098975050505050505050565b600060208284031215610460578081fd5b813567ffffffffffffffff811115610476578182fd5b61048284828501610330565b949350505050565b6000806040838503121561049c578081fd5b823580151581146104ab578182fd5b9150602083013567ffffffffffffffff8111156104c6578182fd5b6104d285828601610330565b9150509250929050565b600081518084526104f481602086016020860161068b565b601f01601f19169290920160200192915050565b6000825161051a81846020870161068b565b9190910192915050565b60208082528251828201819052600091906040908185019080840286018301878501865b8381101561044157888303603f190185528151805115158452870151878401879052610576878501826104dc565b9588019593505090860190600101610548565b60208082526021908201527f4d756c746963616c6c32206167677265676174653a2063616c6c206661696c656040820152601960fa1b606082015260800190565b6020808252818101527f4d756c746963616c6c206167677265676174653a2063616c6c206661696c6564604082015260600190565b600060408201848352602060408185015281855180845260608601915060608382028701019350828701855b8281101561065957605f198887030184526106478683516104dc565b9550928401929084019060010161062b565b509398975050505050505050565b60405181810167ffffffffffffffff8111828210171561068357fe5b604052919050565b60005b838110156106a657818101518382015260200161068e565b838111156106b5576000848401525b5050505056fea2646970667358221220151b7a4e1851a954fe78a0664dbfe9018f9ffd521dc10276b063e76bdb7110d864736f6c63430007060033";

export class Multicall2__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<Multicall2> {
    return super.deploy(overrides || {}) as Promise<Multicall2>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): Multicall2 {
    return super.attach(address) as Multicall2;
  }
  connect(signer: Signer): Multicall2__factory {
    return super.connect(signer) as Multicall2__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): Multicall2Interface {
    return new utils.Interface(_abi) as Multicall2Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Multicall2 {
    return new Contract(address, _abi, signerOrProvider) as Multicall2;
  }
}
