import { Injectable } from '@angular/core'
import { from, map, switchMap, of, tap, concatMap, Subject } from "rxjs"
import { Subsigner } from '../signer-login-options'
import { JsonRpcSigner } from '@ethersproject/providers'
import {
    AuthProvider,
    PreferenceStore,
} from '../../../preference/state/preference.store'
import { Observable } from 'rxjs'
import { Web3Auth } from "@web3auth/modal"
import { providers, utils } from 'ethers'
import { Network, Networks } from '../../networks'

@Injectable({
  providedIn: 'root',
})
export class Web3AuthSubsignerService implements Subsigner<Web3AuthLoginOpts> {

    web3Auth: Web3Auth | undefined

    private chainChangedSub = new Subject<providers.Web3Provider>()
    chainChanged$ = this.chainChangedSub.asObservable()
    
    constructor(
      private preferenceStore: PreferenceStore,
    ) {}
    
    login(): Observable<JsonRpcSigner> {
        this.web3Auth = new Web3Auth({
            clientId: "BE2O_wXH_vln5-7jscLbHkn8nV4Uhdy9W4ylKIRxDvTG-AWjSAIUB4HcCveQmLRonAA21yW3HLwBt0CUMc8wYO8", // get it from Web3Auth Dashboard
            web3AuthNetwork: "sapphire_mainnet",
            chainConfig: {
                chainNamespace: "eip155",
                chainId: "0x1",
                rpcTarget: "https://rpc.ankr.com/eth",
                displayName: "Ethereum Mainnet",
                blockExplorer: "https://goerli.etherscan.io",
                ticker: "ETH",
                tickerName: "Ethereum",
            },
        })

        return from(this.web3Auth.initModal()).pipe(
            switchMap(() => {
              return this.switchEthereumChain()
            }),
            switchMap(() => {
                return this.web3Auth!.connect()
            }),
            switchMap((result) => {
              return of((new providers.Web3Provider(result!)))
            }),
            concatMap((provider) => {
                return this.setAddress(provider.getSigner())
            })
        )
    }

    logout(): Observable<unknown> {
        return of(this.web3Auth?.clearCache())
    }

    switchEthereumChain() {
        const chainDef = Web3AuthNetworks[this.preferenceStore.getValue().chainID]
        return from(
          this.web3Auth!.addChain({
            chainNamespace: 'eip155',
            ...chainDef
          })
        ).pipe(
          switchMap(() => {
            return from(this.web3Auth!.switchChain({
              chainId: chainDef.chainId
            })).pipe(
              switchMap(() => {
                return from(this.web3Auth!.connect()).pipe(
                  switchMap((provider) => {
                    return of(new providers.Web3Provider(provider!))
                  }),
                  tap((provider) => {
                    this.chainChangedSub.next(provider)
                  })
                )
              })
            )
          })
        )
    }

    private setAddress(signer: providers.JsonRpcSigner) {
        return from(signer.getAddress()).pipe(
          tap((address) =>
            this.preferenceStore.update({
              address: address,
              authProvider: AuthProvider.WEB3AUTH,
            })
          ),
          map(() => signer)
        )
    }

}

interface AddWeb3AuthChainParameter {
    chainId: string // A 0x-prefixed hexadecimal string
    displayName: string
    tickerName: string,
    ticker: string,
    decimals: number,
    rpcTarget: string,
    blockExplorer: string
  }

const getWeb3AuthNetwork = (network: Network): AddWeb3AuthChainParameter => ({
    chainId: utils.hexValue(network.chainID),
    displayName: network.name,
    tickerName: network.nativeCurrency.name,
    ticker: network.nativeCurrency.symbol,
    decimals: 18,
    rpcTarget: network.rpcURLs[0],
    blockExplorer: network.explorerURLs[0]
  })
  
export const Web3AuthNetworks = Object.fromEntries(
    Object.entries(Networks).map((entry) => [
        entry[0],
        getWeb3AuthNetwork(entry[1]),
    ])
)

interface Web3AuthLoginOpts {
    avoidNetworkChange?: boolean;
    force?: boolean;
}
