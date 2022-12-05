import { ChainId } from "@biconomy/core-types";
import SocialLogin from "@biconomy/web3-auth";
import SmartAccount from "@biconomy/smart-account";
import { useState, useCallback, useEffect } from "react"
import { ethers } from "ethers";

const Login = () => {
  const [provider, setProvider] = useState<any>()
  const [account, setAccount] = useState<any>()
  const [smartAccount, setSmartAccount ] = useState<SmartAccount | null>(null);
  const [scwAddress, setSwcAddress] = useState("");
  const [scwLoading, setScwLoading] = useState(false);
  const [socialLoginSDK, setSocialLoginSDK] = useState<SocialLogin | null>(null);

  const connectWeb3 = useCallback(async () => {
      if(typeof window === "undefined") return;

      console.log("socialLoginSDK", socialLoginSDK);

      if(socialLoginSDK?.provider) {
        const web3Provider = new ethers.providers.Web3Provider(
          socialLoginSDK.provider
        )
        setProvider(web3Provider)
        const accounts = await web3Provider.listAccounts()
        console.log(accounts[0])
        setAccount(accounts[0])
        return
      }
    
      if(socialLoginSDK) {
        socialLoginSDK.showWallet()
        return socialLoginSDK
      }

      const sdk = new SocialLogin()
      await sdk.init(ethers.utils.hexValue(80001))
      setSocialLoginSDK(sdk)
      sdk.showConnectModal()
      sdk.showWallet()
      return socialLoginSDK
    },
    [socialLoginSDK],
  )


  useEffect(() => {
    console.log("hidewallet")
    if(socialLoginSDK && socialLoginSDK?.provider) {
      socialLoginSDK.hideWallet()
    }
  }, [account, socialLoginSDK])

  useEffect(() => {
    const interval = setInterval(async () => {
      if(account) {
        clearInterval(interval)
      }
      if(socialLoginSDK?.provider && !account) {
        connectWeb3()
      }
    }, 1000)
    return () => {
      clearInterval(interval)
    }
  }, [account, connectWeb3, socialLoginSDK])

  const disconnect = async () => {
    if(!socialLoginSDK || !socialLoginSDK.web3auth) {
      console.log("Web3Modal not initialized")
      return;
    }
    await socialLoginSDK.logout()
    socialLoginSDK.hideWallet()
    setAccount(undefined)
    setProvider(undefined)
    setSwcAddress("")
  }

  useEffect(() => {
    async function setupSmartAccount() {
      setSwcAddress("");
      setScwLoading(true);
      const smartAccount = new SmartAccount(provider, {
        activeNetworkId: ChainId.POLYGON_MUMBAI,
        supportedNetworksIds: [ChainId.POLYGON_MUMBAI],
      });
      await smartAccount.init();
      const context = smartAccount.getSmartAccountContext();
      setSwcAddress(context.baseWallet.getAddress());
      setSmartAccount(smartAccount);
      setScwLoading(false);
    }
    if (!!provider && !!account) {
      setupSmartAccount();
      console.log("Provider...", provider);
    }
  }, [account, provider]);

  return (
    <div className="container">
      <main style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <h1>Biconomy SDK Web3Auth</h1>
        <button onClick={!account ? connectWeb3 : disconnect}
        style={{ padding: "15px 20px", background: "gray", border: "none", color: "white" }}>
          {!account ? "Connect Wallet" : "Disconnect Wallet"}
        </button>

        {account && (
          <div>
            <h2>EOA Address</h2>
            <p>{account}</p>
          </div>
        )}

        {scwLoading && <h2>Loading Smart Account...</h2>}

        {scwAddress && (
          <div>
            <h2>Smart Account Address</h2>
            <p>{scwAddress}</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default Login;