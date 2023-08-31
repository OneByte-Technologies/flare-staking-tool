import { AvaNetwork } from '@/js/AvaNetwork'

export const MainnetConfig = new AvaNetwork(
    'Mainnet',
    'https://flare-api.flare.network',
    14,
    'https://flare-explorer.flare.network',
    'https://flare-explorer.flare.network',
    true
)

export const TestnetConfig = new AvaNetwork(
    'Coston2',
    'https://coston2-api.flare.network',
    114,
    'https://coston2-explorer.flare.network',
    'https://coston2-explorer.flare.network',
    true
)
