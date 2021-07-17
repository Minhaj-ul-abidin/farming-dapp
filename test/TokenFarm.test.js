const { assert } = require('chai');

const DaiToken = artifacts.require("DaiToken");
const DappToken = artifacts.require("DappToken");
const TokenFarm = artifacts.require("TokenFarm");

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) {
  return web3.utils.toWei(n,'ether');
}

contract('TokenFarm',([owner,investor]) => {
  let daiToken, dappToken, tokenFarm ;
  before(async () => {
    daiToken = await DaiToken.new();
    dappToken = await DappToken.new();
    tokenFarm = await TokenFarm.new(dappToken.address , daiToken.address);

    // Trafser all dapp tokens to token farm ( 1 million)

    await dappToken.transfer(tokenFarm.address ,tokens('1000000'))

    // Send some tokens to investor
    await daiToken.transfer(investor, tokens('100'), {from: owner})
  })

  describe('Mock Dai deployement' , async () => {
    it('has a name', async ()=> {
      assert.equal(await daiToken.name(),'Mock DAI Token');
    })
  })


  describe('Mock Dapp deployement' , async () => {
    it('has a name', async ()=> {
      assert.equal(await dappToken.name(),'DApp Token');
    })
  })


  describe(' TokenFarm deployement' , async () => {
    it('has a name', async ()=> {
      assert.equal(await tokenFarm.name(),'DApp Token Farm');
    })
    //  check if balance was tranfered 
    it('contract has tokens', async () => {
      let balance = await dappToken.balanceOf(tokenFarm.address);
      assert.equal(balance.toString(), tokens('1000000'));
    })
  })

  describe('Farming Tokens' , async () => {

    it('rewards investors for staking mDai Token ', async () => {
      let result;

      // check investor balance;
      result = await daiToken.balanceOf(investor);
      assert.equal(result.toString(),tokens('100'), 'investor mDai balance is correct before staking')
      
      // stake mock dai token 
      await daiToken.approve(tokenFarm.address, tokens('100') , { from: investor });
      await tokenFarm.stakeTokens(tokens('100'),{ from: investor });

      result = await daiToken.balanceOf(investor);
      assert.equal(result.toString(),tokens('0'), 'investor mDai balance is correct after staking')

      result = await tokenFarm.stakingBalance(investor);
      assert.equal(result.toString(),tokens('100'), 'investor staking balance is correct after staking')


      result = await tokenFarm.isStaking(investor);
      assert.equal(result.toString() ,'true' ,'investor is staking');

      result = await tokenFarm.hasStaked(investor);
      assert.equal(result.toString(),'true', "investor has staked");
      
      // issue tokens
      await tokenFarm.issueTokens({ from: owner });

      // check balance after issuance
      result = await dappToken.balanceOf(investor);
      assert.equal(result.toString(),tokens('100'), 'Investore DApp token wallet balance correct after issuance');
      
      // ensure only owner can issue tokens
      await tokenFarm.issueTokens({from : investor}).should.be.rejected;


      // Unstake tokens
      await tokenFarm.unstakeTokens({from : investor});

      // check results after unstaking
      result = await daiToken.balanceOf(investor);
      assert.equal(result.toString(),tokens('100'), 'investor Moack dai balance correct after unstaking'  );

      result = await daiToken.balanceOf(tokenFarm.address);
      assert.equal(result.toString(),tokens('0'), 'Token farm Mock dai balance correct after unstaking'  );

      result = await tokenFarm.stakingBalance(investor);
      assert.equal(result.toString(),tokens('0'), 'investor staking balance correct after unstaking'  );

      result = await tokenFarm.isStaking(investor);
      assert.equal(result.toString(),'false', 'investor staking status correct after unstaking');
  
    } )

  })
})