import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ContractManifest } from 'dev3-sdk/dist/core/contracts/ContractManifest'
import { BehaviorSubject, combineLatest, delay, map, Observable, of, switchMap, tap, zip } from 'rxjs'
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

  isInSDK  = this.route.snapshot.queryParams.sdk

  contract$ = this.functionRequest$
    .pipe(switchMap(result => 
      { 
        if(result.deployed_contract_id) {
          return this.deploymentService.getContractDeploymentRequest(result.deployed_contract_id)
        } else {
          return of(null)
        }
      }
  ))

  manifest$: Observable<ContractManifestData | null> = this.contract$.pipe(
    switchMap(functionRequest => {
      if(functionRequest?.contract_id) {
        return this.manifestService.getByID(functionRequest.contract_id, this.projectService.projectID)
      } else {
        return of(null)
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
    private manifestService: ContractManifestService,
    private deploymentService: ContractDeploymentService) { }

}
