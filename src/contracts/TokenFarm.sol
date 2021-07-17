pragma solidity ^0.5.0;
import "./DappToken.sol";
import "./DaiToken.sol";

import "@openzeppelin/contracts/ownership/Ownable.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";

contract TokenFarm is Ownable {
  using SafeMath for uint;

  string  public name = "DApp Token Farm";
  DappToken public dappToken;
  DaiToken public daiToken;
  address[] public stakers;
  mapping(address => uint) public stakingBalance;
  mapping(address => bool) public hasStaked;
  mapping(address => bool) public isStaking;



  constructor(DappToken _dappToken , DaiToken _daiToken) public {
    dappToken = _dappToken;
    daiToken = _daiToken;
  }

  // stake TOkens ( Deposits)
  function stakeTokens(uint _amount) public {
    require(_amount > 0, "tokens staked should be greater than 0");
    // Tranfer mock dai token to this contract for staking
    daiToken.transferFrom(msg.sender , address(this),_amount);

    // update staking balance
    stakingBalance[msg.sender] = stakingBalance[msg.sender].add(_amount);

    // add to stakers array for first time stakers
    if(!hasStaked[msg.sender]){
      stakers.push(msg.sender);
    }

    // update staking status
    isStaking[msg.sender] = true;
    hasStaked[msg.sender] = true;

  }


  //  unstake Tokens (Withraw  )
  function unstakeTokens() public {
    // Featch staking balance
    uint balance = stakingBalance[msg.sender];

    //  Require amount greater than 0
    require(balance > 0, "staking balance cannot be 0");

    //  Transfer Mock Dai tokens to this Contract
    daiToken.transfer(msg.sender, balance);

    // Reset Staking balance
    stakingBalance[msg.sender] = 0;

    // Update staking status
    isStaking[msg.sender] = false;
  }


  // Issuing tokens () , owner only
  function issueTokens()  public  onlyOwner {

    for (uint i=0; i<stakers.length; i++){
      address recipient = stakers[i];
      uint balance = stakingBalance[recipient];
      if (balance > 0) { 
        dappToken.transfer(recipient, balance);
      }
    }
  }

}