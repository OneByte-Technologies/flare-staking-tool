import { Module } from 'vuex'
import { RootState } from '@/store/types'
import { EarnState } from '@/store/modules/earn/types'
import { listStakingForAddresses } from '@/js/Glacier/listStakingForAddresses'

const ledger_module: Module<EarnState, RootState> = {
    namespaced: true,
    state: {
        stakingTxs: [],
    },
    mutations: {},
    actions: {
        async refreshRewards({ state, rootState }) {
            // const addrs = rootState.activeWallet?.getAllAddressesP() ?? []
            // state.stakingTxs = await listStakingForAddresses(addrs)
        },
        async rewardCheck({ state, rootState }) {
            const pAddrArr = rootState.activeWallet?.getAllAddressesP() ?? []
            console.log('P address Array', pAddrArr)
            const p = rootState.activeWallet?.getPlatformRewardAddress()
            console.log('P///////', p)
        },
    },
}

export default ledger_module
