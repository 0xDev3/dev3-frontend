import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ContractManifest } from 'dev3-sdk/dist/core/contracts/ContractManifest'
import { network } from 'hardhat'
import { BehaviorSubject, combineLatest, delay, map, Observable, of, switchMap, tap, zip } from 'rxjs'
import { ContractExplorerService } from 'src/app/contract-explorer/contract-explorer.service'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { SessionQuery } from 'src/app/session/state/session.query'
import { ChainID, Networks } from 'src/app/shared/networks'
import { BackendHttpClient } from 'src/app/shared/services/backend/backend-http-client.service'
import { ContractManifestData, ContractManifestService } from 'src/app/shared/services/backend/contract-manifest.service'
import { ProjectService } from 'src/app/shared/services/backend/project.service'
import { ContractDeploymentService, FunctionCallRequestResponse } from 'src/app/shared/services/blockchain/contract-deployment.service'
import { IssuerService } from 'src/app/shared/services/blockchain/issuer/issuer.service'
import { SignerService } from 'src/app/shared/services/signer.service'
import { UserService } from 'src/app/shared/services/user.service'

@Component({
  selector: 'app-function-call-exec-env',
  templateUrl: './function-call-exec-env.component.html',
  styleUrls: ['./function-call-exec-env.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FunctionCallExecEnvComponent {

  issuer$ = this.issuerService.issuer$
  isWaitingForTxSub = new BehaviorSubject(false)
  isWaitingForTx$ = this.isWaitingForTxSub.asObservable()

  functionRequest$ = this.deploymentService
    .getFunctionCallRequest(this.route.snapshot.params.id)

  isInSDK = this.route.snapshot.queryParams.sdk

  contract$ = this.functionRequest$
    .pipe(switchMap(result => {
      if (result.deployed_contract_id) {
        return this.deploymentService.getContractDeploymentRequest(result.deployed_contract_id)
      } else {
        return of(null)
      }
    }))

  manifest$: Observable<ContractManifestData | null> = this.contract$.pipe(
    switchMap(functionRequest => {
      if (functionRequest?.contract_id) {
        return this.projectService.getProjectIdByChainAndAddress().pipe(
          switchMap(projectID => this.manifestService.getByID(functionRequest.contract_id, projectID.id))
        )
      } else {
        const network = Networks[this.preferenceQuery.getValue().chainID].chainID.toString()
        return this.functionRequest$.pipe(
          switchMap(res => {
            return this.contractExplorerService.getContractPreview(res.contract_address!, network).pipe(
              map(result => result.decorator)
            )
          })
        )
      }
    })
  )

  functionManifest$ = zip(this.functionRequest$, this.manifest$).pipe(
    map(result => {
      const res = result[1]?.functions.filter(func => {
        return func.solidity_name === result[0].function_name
      })
      return res
    })
  )

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
    return this.signerService.ensureAuth
  }

  closeTab() {
    window.close()
  }

  executeFunction(functionDeploymentRequest: FunctionCallRequestResponse) {
    return () => {
      return this.deploymentService.executeFunction(functionDeploymentRequest).pipe(
        tap(() => { this.isWaitingForTxSub.next(true) }),
        switchMap(result => this.sessionQuery.provider.waitForTransaction(result.hash)),
        switchMap(result => this.deploymentService.attachTxInfoToRequest(
          functionDeploymentRequest.id,
          result.transactionHash,
          this.preferenceQuery.getValue().address,
          "TRANSACTION"
        )),
        delay(1000),
        tap(() => {
          this.functionRequest$ = this.deploymentService
            .getFunctionCallRequest(this.route.snapshot.params.id)
          this.isWaitingForTxSub.next(false)
        })
      )
    }
  }


  isLoggedIn$ = this.sessionQuery.isLoggedIn$

  constructor(
    private issuerService: IssuerService,
    private route: ActivatedRoute,
    private signerService: SignerService,
    private projectService: ProjectService,
    private preferenceQuery: PreferenceQuery,
    private sessionQuery: SessionQuery,
    private userService: UserService,
    private contractExplorerService: ContractExplorerService,
    private manifestService: ContractManifestService,
    private deploymentService: ContractDeploymentService) { }

}
