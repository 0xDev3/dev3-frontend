import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { BehaviorSubject, switchMap, tap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { RequestBalanceService } from 'src/app/request-balance/request-balance.service'
import { AssetType } from 'src/app/request-send/request-send.service'
import { IssuerService } from 'src/app/shared/services/blockchain/issuer/issuer.service'
import { DialogService } from 'src/app/shared/services/dialog.service'
import { UserService } from 'src/app/shared/services/user.service'
import { Tab } from '../authorizations.component'
import { AuthorizationsService } from '../authorizations.service'

@Component({
  selector: 'app-authorization-new',
  templateUrl: './authorization-new.component.html',
  styleUrls: ['./authorization-new.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthorizationNewComponent {


  newAuthRequestForm = new FormGroup({
    walletAddress: new FormControl(),
    beforeMessage: new FormControl(),
    afterMessage: new FormControl()
  })

  constructor(private balanceService: RequestBalanceService,
    private preferenceQuery: PreferenceQuery,
    private issuerService: IssuerService,
    private authSerivice: AuthorizationsService,
    private dialogService: DialogService) { }


  submitClicked() {
    return () => {
      return this.authSerivice.generateMessagePayload().pipe(
        switchMap(result => this.authSerivice.createWalletAuthRequest(result.payload)),
        tap(_ => this.dialogService.success({ message: "Successfully created a new authorization request." }))
      )
    }
  }

}
