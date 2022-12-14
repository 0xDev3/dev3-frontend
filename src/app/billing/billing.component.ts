import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { BehaviorSubject, catchError, map, of, switchMap, tap } from 'rxjs'
import { SessionQuery } from '../session/state/session.query'
import { DialogService } from '../shared/services/dialog.service'
import { SignerService } from '../shared/services/signer.service'
import { BillingService } from './billing.service'


@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingComponent {


  availableSubscriptions$ = this.billingService.getAllSubscriptions()
  
  paymentIntent: string = this.route.snapshot.queryParams.payment_intent

  constructor(private billingService: BillingService,
    private sessionQuery: SessionQuery,
    private route: ActivatedRoute,
    private signerService: SignerService,
    private dialogService: DialogService) { }


}
