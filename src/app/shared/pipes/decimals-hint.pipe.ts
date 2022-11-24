import { Injectable, Pipe, PipeTransform } from '@angular/core'
import { map, Observable, of, tap } from 'rxjs'
import { PreferenceQuery } from 'src/app/preference/state/preference.query'
import { ContractDeploymentService } from '../services/blockchain/contract-deployment.service'

@Injectable({
  providedIn: 'root',
})
@Pipe({
    name: 'decimalsHint',
})
export class DecimalsHintPipe implements PipeTransform {

  constructor(
    private preferenceQuery: PreferenceQuery,
    private contractService: ContractDeploymentService
  ) {}


  transform(value: any, arg1: string | undefined, arg2: string | undefined): Observable<string | undefined> { 

    if(!value) { return of(undefined) }
    if(!arg1 || !arg2) { return of(value) }

    const origin = this.parseQuery(arg1)

    if(origin === DecimalsOrigin.Self) {
        return this.contractService.callReadOnlyFunction(arg2, {
            function_name: 'decimals',
            caller_address: this.preferenceQuery.getValue().address,
            function_params: [],
            output_params: ['uint256']
        }).pipe(
            map(res => { return String(value / Math.pow(10, res.return_values[0])) } ),
        )
    }
    return of(value)

  }
  
  private parseQuery(query: string): DecimalsOrigin {
    const splitQuery = query.split('.')
    if(splitQuery.at(0) === '$this') {
        return DecimalsOrigin.Self
    } else if(splitQuery.at(0)?.includes('$arg')) {
        return DecimalsOrigin.ByArgument
    }
    return DecimalsOrigin.Self
  }

}

enum DecimalsOrigin {
    Self,
    ByArgument,
    ByAddress,
    Fetch
}

