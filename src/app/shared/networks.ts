import { providers } from 'ethers'
import {
  Matic as TPMatic,
  Mumbai as TPMumbai,
} from '../../../dev3-tokenizer-library/deployments'
import ReconnectingWebSocket from 'reconnecting-websocket'

export enum ChainID {
  MATIC_MAINNET = 137, // Polygon
  MUMBAI_TESTNET = 80001, // Polygon
  AURORA_MAINNET = 1313161554,
  GOERLI_TESTNET = 5,
  OPTIMISM = 10,
  ARBITRUM = 42161,
  AVALANCHE = 43114,
  BSC = 56,
  MOONRIVER = 1285,
  OASIS_EMERALD = 42262,
  CELO_MAINNET = 42220,
  GNOSIS_NETWORK = 100,
  FANTOM_NETWORK = 250,
}

export interface Network {
  chainID: ChainID
  name: string
  iconURL?: string
  shortName: string
  nativeCurrency: {
    name: string
    symbol: string
  }
  maxGasPrice: number
  rpcURLs: string[]
  wssRpcURLs?: string[]
  explorerURLs: string[]
  tokenizerConfig: TokenizerConfig
  ramp?: RampConfig
}

interface TokenizerConfig {
  apxRegistry: string
  issuerFactory: {
    basic: string
  }
  assetFactory: {
    basic: string
    transferable: string
    simple: string
  }
  cfManagerFactory: {
    basic: string
    vesting: string
  }
  queryService: string
  payoutService: string
  payoutManager: string
  nameRegistry: string
  campaignFeeManager: string
  defaultWalletApprover: string
  defaultStableCoin: string
}

interface RampConfig {
  swapAsset: string
  url?: string // needed only for testing environments
}

export const MaticNetwork: Network = {
  chainID: ChainID.MATIC_MAINNET,
  name: 'Polygon',
  shortName: 'matic',
  iconURL: 'https://cdn.iconscout.com/icon/free/png-256/polygon-token-4086725-3379855.png',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
  },
  maxGasPrice: 1500,
  rpcURLs: [
    'https://nd-159-625-174.p2pify.com/db285116493a92ba6e91417f43a942bd',
    'https://polygon-rpc.com',
  ],
  wssRpcURLs: [
    'wss://ws-nd-159-625-174.p2pify.com/db285116493a92ba6e91417f43a942bd',
    'wss://ws-matic-mainnet.chainstacklabs.com',
    'wss://polygon-mainnet.g.alchemy.com/v2/A8PZz3PJWwX_yQAW5q0JjqaNPPshI9Qg',
  ],
  explorerURLs: ['https://polygonscan.com/'],
  tokenizerConfig: {
    apxRegistry: TPMatic.apxRegistry.address,
    issuerFactory: TPMatic.issuerFactory,
    assetFactory: TPMatic.assetFactory,
    cfManagerFactory: TPMatic.cfManagerFactory,
    queryService: TPMatic.queryService,
    payoutService: TPMatic.payoutService,
    payoutManager: TPMatic.payoutManager,
    nameRegistry: TPMatic.nameRegistry.address,
    campaignFeeManager: TPMatic.campaignFeeManager.address,
    defaultWalletApprover: TPMatic.walletApproverService.address,
    defaultStableCoin: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  },
  ramp: {
    swapAsset: 'MATIC',
  },
}

export const MumbaiNetwork: Network = {
  chainID: ChainID.MUMBAI_TESTNET,
  name: 'Mumbai Testnet',
  shortName: 'mumbai',
  iconURL: 'https://cdn.iconscout.com/icon/free/png-256/polygon-token-4086725-3379855.png',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
  },
  maxGasPrice: 20,
  rpcURLs: ['https://matic-mumbai.chainstacklabs.com'],
  wssRpcURLs: [
    'wss://ws-nd-673-584-255.p2pify.com/6eba79da2c02fb3ca5985cc6e95ebd53',
    'wss://polygon-mumbai.g.alchemy.com/v2/w8tKRA88CQYBQEwGO2HlKKHtSD_qHOoU',
    'wss://ws-matic-mumbai.chainstacklabs.com',
  ],
  explorerURLs: ['https://mumbai.polygonscan.com/'],
  tokenizerConfig: {
    apxRegistry: TPMumbai.apxRegistry.address,
    issuerFactory: TPMumbai.issuerFactory,
    assetFactory: TPMumbai.assetFactory,
    cfManagerFactory: TPMumbai.cfManagerFactory,
    queryService: TPMumbai.queryService,
    payoutService: TPMumbai.payoutService,
    payoutManager: TPMumbai.payoutManager,
    nameRegistry: TPMumbai.nameRegistry.address,
    campaignFeeManager: TPMumbai.campaignFeeManager.address,
    defaultWalletApprover: TPMumbai.walletApproverService.address,
    defaultStableCoin: '0x1eDaD4f5Dac6f2B97E7F6e5D3fF5f04D666685c3',
  },
  ramp: {
    swapAsset: 'MATIC',
    url: 'https://ri-widget-staging.firebaseapp.com/',
  },
}

export const GoerliNetwork: Network = {
  chainID: ChainID.GOERLI_TESTNET,
  name: 'Görli Testnet',
  shortName: 'goerli',
  iconURL: 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/256/Ethereum-ETH-icon.png',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
  },
  maxGasPrice: 20,
  rpcURLs: ['https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
  explorerURLs: ['https://goerli.etherscan.io/'],
  tokenizerConfig: {
    apxRegistry: '0x95e1F87B3E5EC566CC0676DED8Ce992cE0E51Ed7',
    issuerFactory: {
      basic: '0x0361B0A1333A0BF88ce2c3a4d7192C5E8A5Efea9',
    },
    assetFactory: {
      basic: '0xE58FA32f73D0EeeaD05EFf3c769F596773D446c7',
      transferable: '0xB70E991eda75820Df751ddd90cC58a769f044c1d',
      simple: '0x0D4c488fA3339C3D68640964242252F7da3886FC',
    },
    cfManagerFactory: {
      basic: '0xa468ad0f01819D995191802A89148d268B04C750',
      vesting: '0x64F09Cc15d9359a68A75cfEB4711701160EA5178',
    },
    queryService: '0x5A22bc3a5078801CB0e8B5C61bb8361D16C8Ed73',
    payoutService: '',
    payoutManager: '',
    nameRegistry: '0x41b90C4C84f6388c29835CBA03Cd50D92fB24e8E',
    campaignFeeManager: '',
    defaultWalletApprover: '0x893152e259BdDEa9D42f935f38d7c2c88431c748',
    defaultStableCoin: '0x7A6E8B47ab83cA0374ef6D59a0B0459BCB5c0510', // custom stablecoin issued by filip
  },
}

export const AuroraNetwork: Network = {
  chainID: ChainID.AURORA_MAINNET,
  name: 'Aurora',
  shortName: 'aurora',
  iconURL: 'https://dynamic-assets.coinbase.com/04a9730129d20e0748b2319425853c788b5121350e77f68458dd421c92106e11c1ab2fa1dc92a6b697eb2b149ffee8b2ed5346914e2aa6a44e28d91296875375/asset_icons/542a05514a97115aa9eaad25e1905909e19874cc0abdbf43add5267904b19c55.png',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
  },
  maxGasPrice: 20,
  rpcURLs: ['https://mainnet.aurora.dev'],
  wssRpcURLs: ['wss://mainnet.aurora.dev'],
  explorerURLs: ['https://aurorascan.dev/'],
  tokenizerConfig: {
    apxRegistry: '',
    issuerFactory: {
      basic: '0x6da35932606866801762cBEC8698BD684d9D1699',
    },
    assetFactory: {
      basic: '',
      transferable: '',
      simple: '',
    },
    cfManagerFactory: {
      basic: '',
      vesting: '',
    },
    queryService: '0x7a21F1618bb0F5EaD292292d441e646E0DB9bf3e',
    payoutService: '0x6556Bf8Ed99161eD58753994006E7Ef9CE188ac5',
    payoutManager: '0x041e15aF5ecBc0C93F106B2F6a7F5fFa847eF9e4',
    nameRegistry: '0x1f57044153fb762dbc35168CE5e29d32E958BD52',
    campaignFeeManager: '',
    defaultWalletApprover: '0xa61AD00d16d2f40b7C3CC5339B8cBB8fD23972F5',
    defaultStableCoin: '0xb12bfca5a55806aaf64e99521918a4bf0fc40802', // custom stablecoin issued by filip
  },
}

export const OasisEmeraldChain: Network = {
  chainID: ChainID.OASIS_EMERALD,
  name: 'Oasis Emerald',
  shortName: 'oasis_emerald',
  iconURL: 'https://www.defined.fi/static/media/oasis.a137ca7a.png',
  nativeCurrency: {
    name: 'ROSE',
    symbol: 'ROSE',
  },
  maxGasPrice: 20,
  rpcURLs: ['https://emerald.oasis.dev'],
  wssRpcURLs: [''],
  explorerURLs: ['https://explorer.emerald.oasis.dev/'],
  tokenizerConfig: {
    apxRegistry: '',
    issuerFactory: {
      basic: '0x6da35932606866801762cBEC8698BD684d9D1699',
    },
    assetFactory: {
      basic: '',
      transferable: '',
      simple: '',
    },
    cfManagerFactory: {
      basic: '',
      vesting: '',
    },
    queryService: '0xCaf30A0B45B8E9A5f7310274f0FAec83cF307936',
    payoutService: '0x6556Bf8Ed99161eD58753994006E7Ef9CE188ac5',
    payoutManager: '0x7a21F1618bb0F5EaD292292d441e646E0DB9bf3e',
    nameRegistry: '0x1f57044153fb762dbc35168CE5e29d32E958BD52',
    campaignFeeManager: '',
    defaultWalletApprover: '0xa61AD00d16d2f40b7C3CC5339B8cBB8fD23972F5',
    defaultStableCoin: '0x3cA9dbbb1C64b5AbCb35B283441E817129c15544', // custom stablecoin issued by filip
  },
}

export const CeloChain: Network = {
  chainID: ChainID.CELO_MAINNET,
  name: 'Celo',
  shortName: 'celo',
  iconURL: 'https://styles.redditmedia.com/t5_i05sx/styles/communityIcon_86ltnuoxy9541.png?width=256&s=ccd45317381cc1a1db9b3b90f301409d11d3a379',
  nativeCurrency: {
    name: 'CELO',
    symbol: 'CELO',
  },
  maxGasPrice: 20,
  rpcURLs: ['https://icy-morning-tree.celo-mainnet.quiknode.pro/8ed0d34e8954249bcd847e85e7a721cbf7a3f464'],
  wssRpcURLs: ['wss://icy-morning-tree.celo-mainnet.quiknode.pro/8ed0d34e8954249bcd847e85e7a721cbf7a3f464'],
  explorerURLs: ['https://explorer.celo.org/'],
  tokenizerConfig: {
    apxRegistry: '',
    issuerFactory: {
      basic: '0x6da35932606866801762cBEC8698BD684d9D1699',
    },
    assetFactory: {
      basic: '',
      transferable: '',
      simple: '',
    },
    cfManagerFactory: {
      basic: '',
      vesting: '',
    },
    queryService: '0xCaf30A0B45B8E9A5f7310274f0FAec83cF307936',
    payoutService: '0x6556Bf8Ed99161eD58753994006E7Ef9CE188ac5',
    payoutManager: '0x7a21F1618bb0F5EaD292292d441e646E0DB9bf3e',
    nameRegistry: '0x1f57044153fb762dbc35168CE5e29d32E958BD52',
    campaignFeeManager: '',
    defaultWalletApprover: '0xa61AD00d16d2f40b7C3CC5339B8cBB8fD23972F5',
    defaultStableCoin: '0x73a210637f6F6B7005512677Ba6B3C96bb4AA44B', // custom stablecoin issued by filip
  },
}

export const BSCNetwork: Network = {
  chainID: ChainID.BSC,
  name: 'Binance Smart Chain',
  shortName: 'bsc',
  iconURL: 'https://pbs.twimg.com/profile_images/1394323505907437570/nP6b3IGJ_400x400.png',
  nativeCurrency: {
    name: 'BSC',
    symbol: 'BSC',
  },
  maxGasPrice: 20,
  rpcURLs: ['https://purple-falling-sea.bsc.quiknode.pro/f21a78dc70b5f15d92a70b1b84845e5c6c688a12'],
  wssRpcURLs: ['wss://purple-falling-sea.bsc.quiknode.pro/f21a78dc70b5f15d92a70b1b84845e5c6c688a12'],
  explorerURLs: ['https://bscscan.com/'],
  tokenizerConfig: {
    apxRegistry: '',
    issuerFactory: {
      basic: '0xCaf30A0B45B8E9A5f7310274f0FAec83cF307936',
    },
    assetFactory: {
      basic: '',
      transferable: '',
      simple: '',
    },
    cfManagerFactory: {
      basic: '',
      vesting: '',
    },
    queryService: '0x041e15aF5ecBc0C93F106B2F6a7F5fFa847eF9e4',
    payoutService: '0xa3BFC3A48Ee93290bDa5a0eF0Ed22414262c3043',
    payoutManager: '0xa61AD00d16d2f40b7C3CC5339B8cBB8fD23972F5',
    nameRegistry: '0x6Cbf0950E22ff08BA4a13FFD2443519e4cF56550',
    campaignFeeManager: '',
    defaultWalletApprover: '0x4b13e95bc24e983E3F55B11aB608508CF7D31d35',
    defaultStableCoin: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // custom stablecoin issued by filip
  },
}

export const AvalancheNetwork: Network = {
  chainID: ChainID.AVALANCHE,
  name: 'Avalanche',
  shortName: 'avalanche',
  iconURL: 'https://glacier-api.avax.network/proxy/chain-assets/main/chains/43114/token-logo.png',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
  },
  maxGasPrice: 20,
  rpcURLs: ['https://api.avax.network/ext/bc/C/rpc'],
  wssRpcURLs: [''],
  explorerURLs: ['https://snowtrace.io/'],
  tokenizerConfig: {
    apxRegistry: '',
    issuerFactory: {
      basic: '0x459464B13A89F65E01291944f72E6842ad0Cbe34',
    },
    assetFactory: {
      basic: '',
      transferable: '',
      simple: '',
    },
    cfManagerFactory: {
      basic: '',
      vesting: '',
    },
    queryService: '0x0B3038562aCb5715254734E77C5Cb4064070Ab1f',
    payoutService: '0x713D963569DC7157DE0C1D1815679c4f3A30e078',
    payoutManager: '0x71Af6221c6AdE382a872B7A7B1B8068688E16ae5',
    nameRegistry: '0xaCeC98CD043f3b84F3272Bbc55A4d7A0dC8A0175',
    campaignFeeManager: '',
    defaultWalletApprover: '0x5C5c3a6DD68953B6d77413B88329174Ce03a75Bc',
    defaultStableCoin: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // custom stablecoin issued by filip
  },
}

export const OptimismNetwork: Network = {
  chainID: ChainID.OPTIMISM,
  name: 'Optimism',
  shortName: 'optimism',
  iconURL: 'https://gateway.optimism.io/static/media/optimism.caeb9392.svg',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
  },
  maxGasPrice: 20,
  rpcURLs: ['https://weathered-white-lambo.optimism.quiknode.pro/651498cb8884a1093894a149d1d44004a45fb5a6/'],
  wssRpcURLs: ['wss://weathered-white-lambo.optimism.quiknode.pro/651498cb8884a1093894a149d1d44004a45fb5a6/'],
  explorerURLs: ['https://optimistic.etherscan.io/'],
  tokenizerConfig: {
    apxRegistry: '',
    issuerFactory: {
      basic: '0x6da35932606866801762cBEC8698BD684d9D1699',
    },
    assetFactory: {
      basic: '',
      transferable: '',
      simple: '',
    },
    cfManagerFactory: {
      basic: '',
      vesting: '',
    },
    queryService: '0xCaf30A0B45B8E9A5f7310274f0FAec83cF307936',
    payoutService: '0xa61AD00d16d2f40b7C3CC5339B8cBB8fD23972F5',
    payoutManager: '0x7a21F1618bb0F5EaD292292d441e646E0DB9bf3e',
    nameRegistry: '0x1f57044153fb762dbc35168CE5e29d32E958BD52',
    campaignFeeManager: '',
    defaultWalletApprover: '0x6556Bf8Ed99161eD58753994006E7Ef9CE188ac5',
    defaultStableCoin: '0x7f5c764cbc14f9669b88837ca1490cca17c31607', // custom stablecoin issued by filip
  },
}

export const ArbitrumNetwork: Network = {
  chainID: ChainID.ARBITRUM,
  name: 'Arbitrum',
  shortName: 'arbitrum',
  iconURL: 'https://www.xdefi.io/wp-content/uploads/2022/05/logo-9.png',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
  },
  maxGasPrice: 20,
  rpcURLs: [
    'https://weathered-bitter-panorama.arbitrum-mainnet.quiknode.pro/6263c3e3ab2a9c81efd17e687344d9d5d049de68'
  ],
  wssRpcURLs: [
    'wss://weathered-bitter-panorama.arbitrum-mainnet.quiknode.pro/6263c3e3ab2a9c81efd17e687344d9d5d049de68'
  ],
  explorerURLs: ['https://optimistic.etherscan.io/'],
  tokenizerConfig: {
    apxRegistry: '',
    issuerFactory: {
      basic: '0x6da35932606866801762cBEC8698BD684d9D1699',
    },
    assetFactory: {
      basic: '',
      transferable: '',
      simple: '',
    },
    cfManagerFactory: {
      basic: '',
      vesting: '',
    },
    queryService: '0xCaf30A0B45B8E9A5f7310274f0FAec83cF307936',
    payoutService: '0xa61AD00d16d2f40b7C3CC5339B8cBB8fD23972F5',
    payoutManager: '0x7a21F1618bb0F5EaD292292d441e646E0DB9bf3e',
    nameRegistry: '0x1f57044153fb762dbc35168CE5e29d32E958BD52',
    campaignFeeManager: '',
    defaultWalletApprover: '0x6556Bf8Ed99161eD58753994006E7Ef9CE188ac5',
    defaultStableCoin: '0x7f5c764cbc14f9669b88837ca1490cca17c31607', // custom stablecoin issued by filip
  },
}

export const MoonriverNetwork: Network = {
  chainID: ChainID.MOONRIVER,
  name: 'Moonriver',
  shortName: 'moonriver',
  iconURL: 'https://dynamic-assets.coinbase.com/802dc36a9152a022f9d9159f16fa0f4ee70985496d621df163f35373e91d3634fc9697b884062cdd48070503efed726f9e545f2c27cc9eccc72777a80484893e/asset_icons/16c95ff455a193d937c96685c18a3ace93ec68fb22f7d62e761f7a3101293cfd.png',
  nativeCurrency: {
    name: 'MOVR',
    symbol: 'MOVR',
  },
  maxGasPrice: 20,
  rpcURLs: [
    'https://moonriver.public.blastapi.io'
  ],
  wssRpcURLs: [
    'wss://wss.api.moonriver.moonbeam.network'
  ],
  explorerURLs: ['https://moonriver.moonscan.io/'],
  tokenizerConfig: {
    apxRegistry: '',
    issuerFactory: {
      basic: '0x6da35932606866801762cBEC8698BD684d9D1699',
    },
    assetFactory: {
      basic: '',
      transferable: '',
      simple: '',
    },
    cfManagerFactory: {
      basic: '',
      vesting: '',
    },
    queryService: '0xCaf30A0B45B8E9A5f7310274f0FAec83cF307936',
    payoutService: '0x6556Bf8Ed99161eD58753994006E7Ef9CE188ac5',
    payoutManager: '0x7a21F1618bb0F5EaD292292d441e646E0DB9bf3e',
    nameRegistry: '0x1f57044153fb762dbc35168CE5e29d32E958BD52',
    campaignFeeManager: '',
    defaultWalletApprover: '0xa61AD00d16d2f40b7C3CC5339B8cBB8fD23972F5',
    defaultStableCoin: '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D', // custom stablecoin issued by filip
  },
}

export const FantomNetwork: Network = {
  chainID: ChainID.FANTOM_NETWORK,
  name: 'Fantom Opera',
  shortName: 'fantom',
  iconURL: 'https://pbs.twimg.com/profile_images/1292932673384714241/_BSnTr5s_400x400.png',
  nativeCurrency: {
    name: 'FTM',
    symbol: 'FTM',
  },
  maxGasPrice: 20,
  rpcURLs: [
    'https://rpc.ankr.com/fantom/'
  ],
  wssRpcURLs: [
    'wss://wsapi.fantom.network/'
  ],
  explorerURLs: ['https://ftmscan.com'],
  tokenizerConfig: {
    apxRegistry: '',
    issuerFactory: {
      basic: '0x6da35932606866801762cBEC8698BD684d9D1699',
    },
    assetFactory: {
      basic: '',
      transferable: '',
      simple: '',
    },
    cfManagerFactory: {
      basic: '',
      vesting: '',
    },
    queryService: '0xCaf30A0B45B8E9A5f7310274f0FAec83cF307936',
    payoutService: '0x6556Bf8Ed99161eD58753994006E7Ef9CE188ac5',
    payoutManager: '0x7a21F1618bb0F5EaD292292d441e646E0DB9bf3e',
    nameRegistry: '0x1f57044153fb762dbc35168CE5e29d32E958BD52',
    campaignFeeManager: '',
    defaultWalletApprover: '0xa61AD00d16d2f40b7C3CC5339B8cBB8fD23972F5',
    defaultStableCoin: '0x04068DA6C83AFCFA0e13ba15A6696662335D5B75', // custom stablecoin issued by filip
  },
}

export const GnosisNetwork: Network = {
  chainID: ChainID.GNOSIS_NETWORK,
  name: 'Gnosis/xDai',
  shortName: 'gnosis',
  iconURL: 'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency/256/Gnosis-icon.png',
  nativeCurrency: {
    name: 'xDai',
    symbol: 'xDai',
  },
  maxGasPrice: 20,
  rpcURLs: [
    'https://wider-flashy-telescope.xdai.quiknode.pro/3032827d979350ef930fbaf0b041ca1c5262f962/'
  ],
  wssRpcURLs: [
    'wss://wider-flashy-telescope.xdai.quiknode.pro/3032827d979350ef930fbaf0b041ca1c5262f962/'
  ],
  explorerURLs: ['https://gnosisscan.io/'],
  tokenizerConfig: {
    apxRegistry: '',
    issuerFactory: {
      basic: '0x6da35932606866801762cBEC8698BD684d9D1699',
    },
    assetFactory: {
      basic: '',
      transferable: '',
      simple: '',
    },
    cfManagerFactory: {
      basic: '',
      vesting: '',
    },
    queryService: '0xCaf30A0B45B8E9A5f7310274f0FAec83cF307936',
    payoutService: '0x6556Bf8Ed99161eD58753994006E7Ef9CE188ac5',
    payoutManager: '0x7a21F1618bb0F5EaD292292d441e646E0DB9bf3e',
    nameRegistry: '0x1f57044153fb762dbc35168CE5e29d32E958BD52',
    campaignFeeManager: '',
    defaultWalletApprover: '0xa61AD00d16d2f40b7C3CC5339B8cBB8fD23972F5',
    defaultStableCoin: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83', // custom stablecoin issued by filip
  },
}

export const Networks: { [key in ChainID]: Network } = {
  [ChainID.MATIC_MAINNET]: MaticNetwork,
  [ChainID.MUMBAI_TESTNET]: MumbaiNetwork,
  [ChainID.GOERLI_TESTNET]: GoerliNetwork,
  [ChainID.AURORA_MAINNET]: AuroraNetwork,
  [ChainID.OPTIMISM]: OptimismNetwork,
  [ChainID.ARBITRUM]: ArbitrumNetwork,
  [ChainID.AVALANCHE]: AvalancheNetwork,
  [ChainID.BSC]: BSCNetwork,
  [ChainID.MOONRIVER]: MoonriverNetwork,
  [ChainID.OASIS_EMERALD]: OasisEmeraldChain,
  [ChainID.CELO_MAINNET]: CeloChain,
  [ChainID.GNOSIS_NETWORK]: GnosisNetwork,
  [ChainID.FANTOM_NETWORK]: FantomNetwork,
}

const getEthersNetwork = (network: Network): providers.Network => ({
  name: network.shortName,
  chainId: network.chainID,
  _defaultProvider: (_providers: any) => {
    if (network.wssRpcURLs?.[0]) {
      return new providers.WebSocketProvider(
        new ReconnectingWebSocket(network.wssRpcURLs![0]) as any,
        network.chainID
      )
    }

    return new providers.StaticJsonRpcProvider(
      network.rpcURLs[0],
      network.chainID
    )
  },
})

export const EthersNetworks = Object.fromEntries(
  Object.entries(Networks).map((entry) => [
    entry[0],
    getEthersNetwork(entry[1]),
  ])
)
