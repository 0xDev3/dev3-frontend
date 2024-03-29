import { HttpClient } from "@angular/common/http"
import { Injectable } from "@angular/core"
import { combineLatest, from, Observable, of, switchMap, tap } from "rxjs"
import { PreferenceQuery } from "src/app/preference/state/preference.query"
import { SessionQuery } from "src/app/session/state/session.query"
import { environment } from "src/environments/environment"
import { BackendHttpClient } from "../backend/backend-http-client.service"
import { DialogService } from "../dialog.service"
import { ErrorService } from "../error.service"
import { SignerService } from "../signer.service"
import { GasService } from "./gas.service"

@Injectable({
  providedIn: 'root',
})
export class ContractDeploymentService {

    path = `${environment.backendURL}/api/blockchain-api/v1`
 
    constructor(private http: BackendHttpClient,
        private preferenceQuery: PreferenceQuery,
        private signerService: SignerService,
        private dialogService: DialogService,
        private sessionQuery: SessionQuery,
        private errorService: ErrorService,
        private gasService: GasService) {}

    createDeploymentRequestBase(data: ContractDeploymentParams): 
        Observable<ContractDeploymentRequestResponse> {
        return this.http
            .post<ContractDeploymentRequestResponse>(`${this.path}/deploy`, 
                data, true, true, true)
    }

    createDeploymentRequest(contractId: string, 
        alias: string,
        constructorParams: ConstructorParam[],
        screenConfig: ScreenConfig): 
        Observable<ContractDeploymentRequestResponse> {
            
        const queryValue = this.preferenceQuery.getValue()
        return this.createDeploymentRequestBase({
            alias: alias,
            contract_id: contractId,
            constructor_params: constructorParams,
            deployer_address: queryValue.address,
            initial_eth_amount: '0',
            arbitrary_data: '',
            screen_config: screenConfig,
            redirect_url: queryValue.issuer.slug ?? ''
        })
    }

    getContractDeploymentRequest(deploymentRequestID: string): 
        Observable<ContractDeploymentRequestResponse> {
        return this.http
            .get<ContractDeploymentRequestResponse>(`${this.path}/deploy/${deploymentRequestID}`, { }, true, false, true)
    }

    getContractDeploymentRequests(projectID: string, deployedOnly: boolean = false,
        contractImplements: string[] = []):
        Observable<ContractDeploymentRequests> {
        
        return this.http
            .get<ContractDeploymentRequests>(`${this.path}/deploy/by-project/${projectID}`, {
                deployedOnly: deployedOnly,
                contractImplements: contractImplements
            }, true, true, true)
    }

    importDeployedContract(alias: string, contractAddress: string, contractManifestID?: string) {
        return this.http.post<ContractDeploymentRequestResponse>(`${this.path}/import-smart-contract`, {
            alias: alias,
            contract_id: contractManifestID,
            contract_address: contractAddress
        }, false, true, true)
    }

    fetchRecommendations(contractUUID: string) {
        return this.http.get<ManifestsData>(`${this.path}/import-smart-contract/${contractUUID}/suggested-interfaces`)
    }

    addInterfacesToContractImport(contractUUID: string, interfaces: string[]) {
        console.log("INTERFACES: ", interfaces)
        console.log("PROJECTID", contractUUID)
        return this.http.patch<string>(`${this.path}/import-smart-contract/${contractUUID}/add-interfaces`, {
            interfaces: interfaces
        }, false, true, true)
    }

    deleteContractDeploymentRequestID(id: string) {
        return this.http.delete(`${this.path}/deploy/${id}`, false, true, true)
    }

    attachTxInfoToRequest(requestId: string, txHash: string, deployer: string, txType: "CONTRACT" | "TRANSACTION" = "CONTRACT") {
        
        const pathSection = txType == "CONTRACT" ? "deploy" : "function-call"
        
        return this.http
            .put<void>(`${this.path}/${pathSection}/${requestId}`, { 
                tx_hash: txHash,
                caller_address: deployer
            }, true, true)
    }
    
    attachTxInfoToArbitraryRequest(requestId: string, txHash: string, deployer: string) {
        return this.http
            .put<void>(`${this.path}/arbitrary-call/${requestId}`, { 
                tx_hash: txHash,
                caller_address: deployer
            }, true, true)
    }

    deployContract(request: ContractDeploymentRequestResponse) {
        return this.signerService.ensureNetwork$.pipe(
            switchMap((signer) =>
                of(request.deploy_tx).pipe(
                  switchMap((contract) =>
                    combineLatest([of(contract), this.gasService.overrides])
                  ),
                  switchMap(([contract, overrides]) => {
                    return signer.populateTransaction({
                        value: contract.value,
                        data: contract.data,
                        from: contract.from,
                        ...overrides
                    }) }
                  ),
                  switchMap((tx) => this.signerService.sendTransaction(tx))
                )
              ),
            this.errorService.handleError(false, true)
          )
    }

    executeFunction(request: FunctionCallRequestResponse) {
        return this.signerService.ensureNetwork$.pipe(
            switchMap((signer) => 
                of(request.function_call_tx).pipe(
                    switchMap((func) => 
                        combineLatest(([of(func), this.gasService.overrides]))
                    ),
                    switchMap(([func, overrides]) => {
                        return signer.populateTransaction({
                            value: func.value,
                            data: func.data,
                            from: func.from,
                            to: func.to,
                            ...overrides
                        })
                    }),
                    switchMap((tx) => this.signerService.sendTransaction(tx))
                )),
                this.errorService.handleError(false, true)
        )
    }

    executeArbitraryFunction(request: ArbitraryCallRequestResponse) {
        return this.signerService.ensureNetwork$.pipe(
            switchMap((signer) => 
                of(request.arbitrary_call_tx).pipe(
                    switchMap((func) => 
                        combineLatest(([of(func), this.gasService.overrides]))
                    ),
                    switchMap(([func, overrides]) => {
                        return signer.populateTransaction({
                            value: func.value,
                            data: func.data,
                            from: func.from,
                            to: func.to,
                            ...overrides
                        })
                    }),
                    switchMap((tx) => this.signerService.sendTransaction(tx))
                )),
                this.errorService.handleError(false, true)
        )
    }

    getArbitraryCallRequest(id: string) {
        return this.http.get<ArbitraryCallRequestResponse>(`${this.path}/arbitrary-call/${id}`, { }, true, false, true)
    }

    callReadOnlyFunction(contractQuery: string, callData: ReadOnlyFunctionCallData) {

        if(contractQuery.startsWith('0x')) {
            return this.http.post<ReadOnlyFunctionResponse>(`${this.path}/readonly-function-call`, {
                ...callData,
                contract_address: contractQuery
            }, true, true, true)
        } else {
            return this.http.post<ReadOnlyFunctionResponse>(`${this.path}/readonly-function-call`, {
                ...callData,
                deployed_contract_id: contractQuery
            }, true, true, true)
        }
        
    }

    createWriteFunctionCallRequest(deployedContractID: string, functionCallData: FunctionCallData, screenConfig?: { before_action_message: string, after_action_message: string }) {
        return this.http.post<FunctionCallRequestResponse>(`${this.path}/function-call`, {
            ...functionCallData,
            deployed_contract_id: deployedContractID,
            screen_config: screenConfig
        }, false, true, true)
    }

    createWriteFunctionCallRequestFromAddress(deployedContractAddress: string, functionCallData: FunctionCallData) {
        return this.http.post<FunctionCallRequestResponse>(`${this.path}/function-call`, {
            ...functionCallData,
            contract_address: deployedContractAddress
        })
    }

    getFunctionCallRequest(id: string) {
        if(id.startsWith('0x')) {
            return this.http.get<FunctionCallRequestResponse>(`${this.path}/function-call/${id}`, { }, true, false, true)
        } else {
            return this.http.get<FunctionCallRequestResponse>(`${this.path}/function-call/${id}`, { }, true, false, true)
        }
    }
}

export interface ReadOnlyFunctionCallData {
    block_number?: number,
    function_name: string,
    function_params: {
        type: FunctionArgumentType,
        value: string
    }[],
    output_params: string[] | { type: string, elems: string[] }[]
    caller_address: string
}

export interface ReadOnlyFunctionResponse {
    deployed_contract_id: string,
    contract_address: string,
    block_number: number,
    output_params: any,
    timestamp: string,
    return_values: any[]
    screen_config: ScreenConfig
}

export interface FunctionCallData {
    function_name: string,
    function_params: {
        type: FunctionArgumentType,
        value: string
    }[],
    eth_amount: number,
    screen_config?: {
        before_action_message: string,
        after_action_message: string,
    }
}

export interface FunctionCallRequestResponse {
    id: string,
    status: string,
    deployed_contract_id: string,
    contract_address: string,
    function_name: string,
    function_params: {
        type: FunctionArgumentType,
        value: string
    }[],
    function_call_data: string,
    eth_amount: string,
    chain_id: string,
    redirect_url: string,
    project_id: string,
    created_at: string,
    caller_address: string,
    function_call_tx: {
        tx_hash: string,
        from: string,
        to: string,
        data: string,
        value: number,
        block_confirmations: string,
        timestamp: string
    }
    screen_config?: ScreenConfig

}

export interface ArbitraryCallRequestResponse {
    id: string,
    status: string,
    deployed_contract_id?: string,
    contract_address: string,
    function_name?: string,
    function_params: {
        type: FunctionArgumentType,
        value: string
    }[],
    arbitrary_data?: any,
    eth_amount: string,
    chain_id: string,
    redirect_url: string,
    project_id: string,
    created_at: string,
    caller_address?: string,
    arbitrary_call_tx: {
        tx_hash?: string,
        from?: string,
        to: string,
        data?: string,
        value: number,
        block_confirmations?: string,
        timestamp?: string
    }
    screen_config?: ScreenConfig
}

export interface ContractDeploymentRequests {
    requests: ContractDeploymentRequestResponse[]
}

export interface ManifestsData {
    manifests: { id: string }[]
}

export interface ContractDeploymentRequestResponse {
    id: string,
    status: string,
    alias: string,
    contract_id: string,
    contract_deployment_data: string,
    contract_tags: string[],
    contract_implements: string[],
    initial_eth_amount: string[],
    chain_id: string,
    redirect_url: string,
    project_id: string,
    created_at: string,
    arbitrary_data: string,
    screen_config: {
        before_action_message: string,
        after_action_message: string,
    },
    contract_address: string,
    deployer_address: string,
    deploy_tx: {
        tx_hash: string,
        from: string,
        to: string,
        data: string,
        value: string,
        block_confirmations: string,
        timestamp: string
    }
    constructor_params: ConstructorParam[],
    imported: boolean
}

export interface ContractDeploymentParams {
    alias: string,
    contract_id: string,
    redirect_url: string,
    constructor_params: ConstructorParam[],
    deployer_address: string,
    initial_eth_amount: string,
    arbitrary_data: string,
    screen_config: ScreenConfig
}

export interface ConstructorParam {
    type: FunctionArgumentType,
    value: string
}

interface ScreenConfig {
    before_action_message: string,
    after_action_message: string
}


export type FunctionArgumentType = 
    'address' 
    | 'bool' 
    | 'string' 
    | 'bytes'  
    | 'byte' 
    | 'uint'
    | 'int'   