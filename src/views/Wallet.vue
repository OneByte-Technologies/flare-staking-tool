<template>
    <div
        :class="[
            'wallet_view',
            {
                'extra-column': isRightNavVisible,
            },
        ]"
        ref="wallet_view"
    >
        <UpdateKeystoreModal v-if="isManageWarning"></UpdateKeystoreModal>
        <transition name="fade" mode="out-in">
            <sidebar class="panel sidenav"></sidebar>
        </transition>
        <div
            :class="[
                'wallet_main',
                {
                    'right-gutter': !isRightNavVisible,
                },
            ]"
        >
            <top-info class="wallet_top"></top-info>
            <transition name="page_fade" mode="out-in">
                <keep-alive
                    :exclude="['cross_chain', 'activity', 'advanced', 'earn', 'manage', 'studio']"
                >
                    <router-view id="wallet_router" :key="$route.path"></router-view>
                </keep-alive>
            </transition>
        </div>
        <transition name="slide_right" mode="out-in">
            <main-panel
                v-if="isRightNavVisible"
                key="main-panel"
                class="panel"
                :onClose="toggleRightNav"
            ></main-panel>
        </transition>
        <div v-if="!isRightNavVisible" class="right-nav-toggle" @click="toggleRightNav">
            <fa icon="angle-left" size="lg"></fa>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import TopInfo from '@/components/wallet/TopInfo.vue'
import Sidebar from '@/components/wallet/Sidebar.vue'
import MainPanel from '@/components/SidePanels/MainPanel.vue'
import UpdateKeystoreModal from '@/components/modals/UpdateKeystore/UpdateKeystoreModal.vue'

const TIMEOUT_DURATION = 60 * 7 // in seconds
const TIMEOUT_DUR_MS = TIMEOUT_DURATION * 1000

@Component({
    components: {
        Sidebar,
        MainPanel,
        TopInfo,
        UpdateKeystoreModal,
    },
})
export default class Wallet extends Vue {
    intervalId: ReturnType<typeof setTimeout> | null = null
    logoutTimestamp = Date.now() + TIMEOUT_DUR_MS
    isLogOut = false
    isRightNavVisible = true

    // Set the logout timestamp to now + TIMEOUT_DUR_MS
    resetTimer() {
        // console.log('reset timer')
        this.logoutTimestamp = Date.now() + TIMEOUT_DUR_MS
        // console.log('logoutTimestamp logoutTimestamp', this.logoutTimestamp)
    }

    checkLogout() {
        let now = Date.now()

        // Logout if current time is passed the logout timestamp
        if (now >= this.logoutTimestamp && !this.isLogOut) {
            this.isLogOut = true
            this.$store.dispatch('timeoutLogout')
        }
    }

    created() {
        this.resetTimer()
        this.intervalId = setInterval(() => {
            this.checkLogout()
        }, 1000)
        this.$store.dispatch('updateIsRegistered')
    }

    unload(event: BeforeUnloadEvent) {
        // user has no wallet saved
        if (!localStorage.getItem('w') && this.hasVolatileWallets && this.isLogOut) {
            event.preventDefault()
            this.isLogOut = false
            event.returnValue = ''
            this.$router.push('/wallet/keys')
            this.resetTimer()
        }
    }

    mounted() {
        let view = this.$refs.wallet_view as HTMLDivElement

        // @ts-ignore
        // this.$posthog.capture('UserLoggedIn')

        view.addEventListener('mousemove', this.resetTimer)
        view.addEventListener('mousedown', this.resetTimer)

        window.addEventListener('beforeunload', this.unload)
    }

    beforeDestroy() {
        let view = this.$refs.wallet_view as HTMLDivElement
        // Remove Event Listeners
        view.removeEventListener('mousemove', this.resetTimer)
        view.removeEventListener('mousedown', this.resetTimer)
        window.removeEventListener('beforeunload', this.unload)
    }

    destroyed() {
        clearInterval(this.intervalId!)
    }

    toggleRightNav() {
        this.isRightNavVisible = !this.isRightNavVisible
    }

    get isManageWarning(): boolean {
        if (this.$store.state.warnUpdateKeyfile) {
            return true
        }
        return false
    }

    get hasVolatileWallets() {
        return this.$store.state.volatileWallets.length > 0
    }
}
</script>

<style lang="scss" scoped>
@use '../main';

.wallet_view {
    padding-bottom: 0;
    display: grid;
    grid-template-columns: 200px 1fr;
    column-gap: 15px;
    height: 100%;
    min-height: 100vh;
    background-color: var(--bg-wallet);
    &.extra-column {
        grid-template-columns: 200px 1fr 300px;
    }
}

.sidenav {
    background-color: var(--bg-wallet-light);
}

.panel {
    overflow: auto;
    height: 100%;
    min-height: 100vh;
}

.wallet_main {
    height: 100%;
    display: grid;
    grid-template-rows: max-content 1fr;
    grid-gap: 15px;
    padding-top: 8px;
    &.right-gutter {
        padding-right: 12px;
    }
}

#wallet_router {
    padding: 22px 20px;
    background-color: var(--bg-wallet-light);
    border-radius: 4px;
}

.page_fade-enter-active,
.page_fade-leave-active {
    transition: all 0.2s;
}
.page_fade-enter, .page_fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
    transform: translateY(30px);
}

.right-nav-toggle {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    right: -1px;
    width: 32px;
    height: 32px;
    border-radius: 50% 0 0 50%;
    top: 40%;
    transform: translateY(-40%);
    background-color: var(--bg-wallet-light);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

/* Dark theme styles */
.theme--dark .right-nav-toggle {
    box-shadow: none;
    border: 1px solid gray;
}

@include main.mobile-device {
    .right-nav-toggle {
        display: none;
    }

    .wallet_view {
        display: block;
        column-gap: 9px;
    }
    .wallet_main {
        grid-gap: 9px;
        padding-top: 0;
        &.right-gutter {
            padding-right: 8px;
        }
    }

    .wallet_sidebar {
        display: none;
    }
}

@include main.medium-device {
    .wallet_view {
        grid-template-columns: 180px 1fr !important;
        column-gap: 9px;
        &.extra-column {
            grid-template-columns: 200px 1fr 240px !important;
        }
    }

    .wallet_main {
        grid-gap: 9px;
        &.right-gutter {
            padding-right: 8px;
        }
    }

    #wallet_router {
        padding: 12px 18px;
    }
}
</style>
