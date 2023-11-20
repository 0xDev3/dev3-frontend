import { Injectable } from '@angular/core'
import { EMPTY, from, Observable, of, throwError } from 'rxjs'
import { providers } from 'ethers'
import { ChainID } from '../../networks'
import { concatMap, map, tap, switchMap } from 'rxjs/operators'
import {
  AuthProvider,
  PreferenceStore,
} from '../../../preference/state/preference.store'
import { SignerLoginOpts, Subsigner } from '../signer-login-options'
import { switchMapTap } from '../../utils/observables'
import EthereumProvider from '@walletconnect/ethereum-provider/dist/types/EthereumProvider'

@Injectable({
  providedIn: 'root',
})
export class WalletConnectSubsignerService
  implements Subsigner<WalletConnectLoginOpts>
{
  wcProvider: WalletConnectProvider | undefined

  constructor(private preferenceStore: PreferenceStore) {}

  private get freshWalletConnectProvider(): Observable<WalletConnectProvider> {
    return from(
      import(
        /* webpackChunkName: "@walletconnect/web3-provider" */
        '@walletconnect/ethereum-provider'
      )
    ).pipe(
      switchMap((lib) => {
        return lib.EthereumProvider.init({
          projectId: '8623a856c6a82453b88d82a14c331003', // required
          chains: [1,137,80001,1313161554,5,10,42161,43114,56,1285,100,11155111,420,421613,20430],
          showQrModal: true // requires @walletconnect/modal
        })
      }),
      map((provider) => {
        this.wcProvider = provider
        return provider as WalletConnectProvider
      })
    )
  }

  login(opts: WalletConnectLoginOpts): Observable<providers.JsonRpcSigner> {
    return from(this.freshWalletConnectProvider).pipe(
      switchMapTap((p) => from(p.enable())),
      concatMap((p) =>
        p.connected && p.accounts.length > 0
          ? of(p)
          : throwError(() => 'UNABLE TO CONNECT')
      ),
      tap((p) => {
        if (opts.force) {
          this.preferenceStore.update({
            address: p.accounts[0],
            authProvider: AuthProvider.WALLET_CONNECT,
          })
        }
      }),
      map((p) => new providers.Web3Provider(p, 'any').getSigner())
    )
  }

  logout(): Observable<unknown> {
    return from(this.wcProvider ? this.wcProvider.disconnect() : EMPTY)
  }
}

interface WalletConnectLoginOpts extends SignerLoginOpts {
  wallet?: string
}

interface WalletConnectProvider {
  enable: () => Promise<string[]>
  connected: boolean
  accounts: string[]
  sendAsync: (payload: any, callback?: any) => void
  disconnect(): Promise<void>
}
