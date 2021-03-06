import React , {useRef}from 'react'
import dai from '../dai.png'
const Main = (props) => {
  const inputRef = useRef(null);
  return (
    <div id='content' className='mt-3'>
      <table className='table table-borderless text-muted text-center'>
        <thead>
          <tr>
            <th scope='col'>Staking Balance</th>
            <th scope='col'>Reqard Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{window.web3.utils.fromWei(props.stakingBalance, 'Ether')} mDai</td>
            <td>{window.web3.utils.fromWei(props.dappTokenBalance, 'Ether')} DAPP</td>
          </tr>
        </tbody>

      </table>

      <div className="card mb-1">
        <div className="card-body">
          <form className="mb-3" onSubmit={(event) => {
            event.preventDefault()
            let amount
            amount = inputRef.current.value.toString()
            amount = window.web3.utils.toWei(amount, 'Ether')
            props.stakeTokens(amount)
            }}>
            <div>
              <label className="float-left"><b>Stake Tokens</b></label>
              <span className="float-right text-muted">
                Balance: {window.web3.utils.fromWei(props.daiTokenBalance,'ether')}
              </span>
            </div>
            <div className="input-group mb-4">
              <input 
                type="text"
                ref={inputRef}
                className="form-control form-control-lg"
                placeholder="0"
                required />
              <div className="input-group-append">
                <div className="input-group-text">
                  <img src={dai} height='32' alt=""/>
                  &nbsp;&nbsp;&nbsp; mDAI
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg"> STAKE!</button>
          </form>
          {props.isStaking ? <button
              type="submit"
              className="btn btn-link btn-block btn-sm"
              onClick={(event) => {
                event.preventDefault()
                props.unstakeTokens()
              }}>
                UN-STAKE...
            </button> : null}
        </div>
      </div>

    </div>
  )
}

export default Main;
