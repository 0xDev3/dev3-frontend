import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { network } from 'hardhat'
import { BehaviorSubject, catchError, combineLatest, delay, map, Observable, of, switchMap, tap, throwError, zip } from 'rxjs'
import { ContractExplorerService } from 'src/app/contract-explorer/contract-explorer.service'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { SessionQuery } from 'src/app/session/state/session.query'
import { ChainID, Networks, toChainID } from 'src/app/shared/networks'
import { BackendHttpClient } from 'src/app/shared/services/backend/backend-http-client.service'
import { ContractManifestData, ContractManifestService } from 'src/app/shared/services/backend/contract-manifest.service'
import { ProjectService } from 'src/app/shared/services/backend/project.service'
import { ArbitraryCallRequestResponse, ContractDeploymentService, FunctionCallRequestResponse } from 'src/app/shared/services/blockchain/contract-deployment.service'
import { IssuerService } from 'src/app/shared/services/blockchain/issuer/issuer.service'
import { SignerService } from 'src/app/shared/services/signer.service'
import { UserService } from 'src/app/shared/services/user.service'
import { PreferenceStore } from 'src/app/preference/state/preference.store'

@Component({
  selector: 'app-arbitrary-call-exec-env',
  templateUrl: './arbitrary-call-exec-env.component.html',
  styleUrls: ['./arbitrary-call-exec-env.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArbitraryCallExecEnvComponent {

  issuer$ = this.issuerService.issuer$
  isWaitingForTxSub = new BehaviorSubject(false)
  isWaitingForTx$ = this.isWaitingForTxSub.asObservable()

  functionRequest$ = this.deploymentService
    .getArbitraryCallRequest(this.route.snapshot.params.id)

  isInSDK = this.route.snapshot.queryParams.sdk

  activeDescriptionIndex = -1

  network$ = this.preferenceQuery.network$
  address$ = this.preferenceQuery.address$
  authProvider$ = this.preferenceQuery.authProvider$
  balance$ = this.userService.nativeTokenBalance$

  seeMoreDetailsToggledSub = new BehaviorSubject(false)
  seeMoreDetails$ = this.seeMoreDetailsToggledSub.asObservable()

  toggleSeeMoreDetails() {
    this.seeMoreDetailsToggledSub.next(!this.seeMoreDetailsToggledSub.getValue())
  }

  login() {
    return this.functionRequest$.pipe(
      switchMap((func) => {
        return this.preferenceStore.update({
          chainID: toChainID(func.chain_id)
        })
      }),
      switchMap(() => {
        return this.signerService.ensureAuth
      })
    )
  }

  logout() {
    return this.signerService.logout()
  }

  closeTab() {
    window.close()
  }

  setActiveDescriptionIndex(index: number) {
    if(this.activeDescriptionIndex === index) { this.activeDescriptionIndex = -1; return}
    this.activeDescriptionIndex = index
  }

  executeFunction(arbitraryCallRequest: ArbitraryCallRequestResponse) {
    return () => {
      return this.deploymentService.executeArbitraryFunction(arbitraryCallRequest).pipe(
        tap(() => { this.isWaitingForTxSub.next(true) }),
        switchMap(result => this.sessionQuery.provider.waitForTransaction(result.hash)),
        switchMap(result => this.deploymentService.attachTxInfoToArbitraryRequest(
          arbitraryCallRequest.id,
          result.transactionHash,
          this.preferenceQuery.getValue().address
        )),
        delay(1000),
        tap(() => {
          this.functionRequest$ = this.deploymentService
            .getArbitraryCallRequest(this.route.snapshot.params.id)
          this.isWaitingForTxSub.next(false)
        })
      )
    }
  }

  isString(arg: any) {
    return (typeof arg === 'string' || arg instanceof String)
  }


  isLoggedIn$ = this.sessionQuery.isLoggedIn$

  constructor(
    private projectService: ProjectService,
    private issuerService: IssuerService,
    private route: ActivatedRoute,
    private signerService: SignerService,
    private preferenceQuery: PreferenceQuery,
    private preferenceStore: PreferenceStore,
    private sessionQuery: SessionQuery,
    private userService: UserService,
    private contractExplorerService: ContractExplorerService,
    private deploymentService: ContractDeploymentService) { }

}
