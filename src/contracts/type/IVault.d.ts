/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import { TypedEventFilter, TypedEvent, TypedListener } from "./commons";

interface IVaultInterface extends ethers.utils.Interface {
  functions: {
    "decimals()": FunctionFragment;
    "deposit(address,uint256)": FunctionFragment;
    "getAccountBalance()": FunctionFragment;
    "getBalance(address)": FunctionFragment;
    "getClearingHouse()": FunctionFragment;
    "getClearingHouseConfig()": FunctionFragment;
    "getExchange()": FunctionFragment;
    "getFreeCollateral(address)": FunctionFragment;
    "getFreeCollateralByRatio(address,uint24)": FunctionFragment;
    "getInsuranceFund()": FunctionFragment;
    "getSettlementToken()": FunctionFragment;
    "getTotalDebt()": FunctionFragment;
    "withdraw(address,uint256)": FunctionFragment;
  };

  encodeFunctionData(functionFragment: "decimals", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "deposit",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getAccountBalance",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "getBalance", values: [string]): string;
  encodeFunctionData(
    functionFragment: "getClearingHouse",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getClearingHouseConfig",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getExchange",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getFreeCollateral",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "getFreeCollateralByRatio",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getInsuranceFund",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getSettlementToken",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getTotalDebt",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [string, BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "decimals", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getAccountBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getBalance", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getClearingHouse",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getClearingHouseConfig",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getExchange",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getFreeCollateral",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getFreeCollateralByRatio",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getInsuranceFund",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getSettlementToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTotalDebt",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;

  events: {
    "Deposited(address,address,uint256)": EventFragment;
    "Withdrawn(address,address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Deposited"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Withdrawn"): EventFragment;
}

export class IVault extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: IVaultInterface;

  functions: {
    decimals(overrides?: CallOverrides): Promise<[number]>;

    deposit(
      token: string,
      amountX10_D: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    getAccountBalance(overrides?: CallOverrides): Promise<[string]>;

    getBalance(
      account: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getClearingHouse(overrides?: CallOverrides): Promise<[string]>;

    getClearingHouseConfig(overrides?: CallOverrides): Promise<[string]>;

    getExchange(overrides?: CallOverrides): Promise<[string]>;

    getFreeCollateral(
      trader: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getFreeCollateralByRatio(
      trader: string,
      ratio: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getInsuranceFund(overrides?: CallOverrides): Promise<[string]>;

    getSettlementToken(overrides?: CallOverrides): Promise<[string]>;

    getTotalDebt(overrides?: CallOverrides): Promise<[BigNumber]>;

    withdraw(
      token: string,
      amountX10_D: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  decimals(overrides?: CallOverrides): Promise<number>;

  deposit(
    token: string,
    amountX10_D: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  getAccountBalance(overrides?: CallOverrides): Promise<string>;

  getBalance(account: string, overrides?: CallOverrides): Promise<BigNumber>;

  getClearingHouse(overrides?: CallOverrides): Promise<string>;

  getClearingHouseConfig(overrides?: CallOverrides): Promise<string>;

  getExchange(overrides?: CallOverrides): Promise<string>;

  getFreeCollateral(
    trader: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getFreeCollateralByRatio(
    trader: string,
    ratio: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getInsuranceFund(overrides?: CallOverrides): Promise<string>;

  getSettlementToken(overrides?: CallOverrides): Promise<string>;

  getTotalDebt(overrides?: CallOverrides): Promise<BigNumber>;

  withdraw(
    token: string,
    amountX10_D: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    decimals(overrides?: CallOverrides): Promise<number>;

    deposit(
      token: string,
      amountX10_D: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    getAccountBalance(overrides?: CallOverrides): Promise<string>;

    getBalance(account: string, overrides?: CallOverrides): Promise<BigNumber>;

    getClearingHouse(overrides?: CallOverrides): Promise<string>;

    getClearingHouseConfig(overrides?: CallOverrides): Promise<string>;

    getExchange(overrides?: CallOverrides): Promise<string>;

    getFreeCollateral(
      trader: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getFreeCollateralByRatio(
      trader: string,
      ratio: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getInsuranceFund(overrides?: CallOverrides): Promise<string>;

    getSettlementToken(overrides?: CallOverrides): Promise<string>;

    getTotalDebt(overrides?: CallOverrides): Promise<BigNumber>;

    withdraw(
      token: string,
      amountX10_D: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    Deposited(
      collateralToken?: string | null,
      trader?: string | null,
      amount?: null
    ): TypedEventFilter<
      [string, string, BigNumber],
      { collateralToken: string; trader: string; amount: BigNumber }
    >;

    Withdrawn(
      collateralToken?: string | null,
      trader?: string | null,
      amount?: null
    ): TypedEventFilter<
      [string, string, BigNumber],
      { collateralToken: string; trader: string; amount: BigNumber }
    >;
  };

  estimateGas: {
    decimals(overrides?: CallOverrides): Promise<BigNumber>;

    deposit(
      token: string,
      amountX10_D: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    getAccountBalance(overrides?: CallOverrides): Promise<BigNumber>;

    getBalance(account: string, overrides?: CallOverrides): Promise<BigNumber>;

    getClearingHouse(overrides?: CallOverrides): Promise<BigNumber>;

    getClearingHouseConfig(overrides?: CallOverrides): Promise<BigNumber>;

    getExchange(overrides?: CallOverrides): Promise<BigNumber>;

    getFreeCollateral(
      trader: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getFreeCollateralByRatio(
      trader: string,
      ratio: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getInsuranceFund(overrides?: CallOverrides): Promise<BigNumber>;

    getSettlementToken(overrides?: CallOverrides): Promise<BigNumber>;

    getTotalDebt(overrides?: CallOverrides): Promise<BigNumber>;

    withdraw(
      token: string,
      amountX10_D: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    decimals(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    deposit(
      token: string,
      amountX10_D: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    getAccountBalance(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getBalance(
      account: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getClearingHouse(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getClearingHouseConfig(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getExchange(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getFreeCollateral(
      trader: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getFreeCollateralByRatio(
      trader: string,
      ratio: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getInsuranceFund(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getSettlementToken(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getTotalDebt(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    withdraw(
      token: string,
      amountX10_D: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}