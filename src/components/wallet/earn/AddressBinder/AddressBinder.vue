<template>
    <div>
        <div class="cols">
            <form @submit.prevent="">
                <transition-group name="fade" mode="out-in">
                    <div v-show="!isConfirm" key="form" class="ins_col">
                        <div style="margin-bottom: 30px">
                            <h4>P chain address</h4>
                            <p class="desc">
                                {{ pChainAddress }}
                            </p>
                            <input
                                type="text"
                                v-model="pChainAddress"
                                style="width: 100%"
                                placeholder="P chain address"
                            />
                        </div>
                        <div style="margin: 30px 0">
                            <h4>C chain address</h4>
                            <p class="desc">{{ cChainAddressBinder }}</p>
                            <input
                                type="text"
                                v-model="cChainAddress"
                                style="width: 100%"
                                placeholder="C chain address"
                            />
                        </div>
                        <div style="margin: 30px 0">
                            <h4>Public Key</h4>
                            <p class="desc">
                                {{ publicKey }}
                            </p>
                            <input
                                type="text"
                                v-model="publickey"
                                style="width: 100%"
                                placeholder="publickey"
                            />
                        </div>
                        <v-btn @click="bindAddress" block class="button_secondary" depressed>
                            Bind address
                        </v-btn>
                    </div>
                </transition-group>
            </form>
        </div>
    </div>
</template>

<script lang="ts">
import { WalletType, WalletNameType } from '@/js/wallets/types'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class AddressBinder extends Vue {
    // ...
    pChainAddress: string = 'function to be written'
    publicKey: string = 'function to be written'
    cChainAddress: string = ''

    get activeWallet(): WalletType | null {
        return this.$store.state.activeWallet
    }

    get cChainAddressBinder() {
        let wallet = this.activeWallet
        if (!wallet) {
            this.cChainAddress = '-'
        } else {
            this.cChainAddress = wallet.getEvmChecksumAddress()
        }
        return this.cChainAddress
    }
}
</script>
<style scoped lang="scss">
@use '../../../../main';

form {
    display: grid;
    grid-template-columns: 1fr 340px;
    column-gap: 90px;
}

.ins_col {
    max-width: 490px;
    padding-bottom: 8vh;
}

.amt {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    border: 1px solid #999;
    padding: 4px 14px;
}

.bigIn {
    flex-grow: 1;
}

input {
    color: var(--primary-color);
    background-color: var(--bg-light);
    padding: 6px 14px;
}

.desc {
    font-size: 13px;
    margin-bottom: 8px !important;
    color: var(--primary-color-light);
}

h4 {
    font-weight: bold;
}

label {
    margin-top: 6px;
    color: var(--primary-color-light);
    font-size: 14px;
    margin-bottom: 3px;
}

.dates {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 15px;

    label > span {
        float: right;
        opacity: 0.4;
        cursor: pointer;

        &:hover {
            opacity: 1;
        }
    }
}

.submit_box {
    .v-btn {
        margin-top: 14px;
    }
}

.summary {
    border-left: 2px solid var(--bg-light);
    padding-left: 30px;

    > div {
        margin-bottom: 14px;

        p {
            font-size: 24px;
        }
    }

    .err {
        margin: 14px 0 !important;
        font-size: 14px;
    }
}

.success_cont {
    .check {
        font-size: 4em;
        color: var(--success);
    }

    .tx_id {
        font-size: 13px;
        color: var(--primary-color-light);
        word-break: break-all;
        margin: 14px 0 !important;
        font-weight: bold;
    }
}

.reward_in {
    transition-duration: 0.2s;

    &[type='local'] {
        .reward_addr_in {
            opacity: 0.3;
            user-select: none;
            pointer-events: none;
        }
    }
}

.reward_tabs {
    margin-bottom: 8px;
    font-size: 13px;

    button {
        color: var(--primary-color-light);

        &:hover {
            color: var(--primary-color);
        }

        &[selected] {
            color: var(--secondary-color);
        }
    }

    span {
        margin: 0px 12px;
    }
}

.amount_warning {
    color: var(--warning);
}

.tx_status {
    display: flex;
    justify-content: space-between;

    .status_icon {
        align-items: center;
        display: flex;
        font-size: 24px;
    }
}

.tx_status,
.reason_cont {
    background-color: var(--bg-light);
    padding: 4px 12px;
    margin-bottom: 6px;
}

@include main.mobile-device {
    form {
        grid-template-columns: 1fr;
    }

    .dates {
        grid-template-columns: 1fr;
    }

    .amt_in {
        width: 100%;
    }

    .summary {
        border-left: none;
        border-top: 2px solid var(--bg-light);
        padding-left: 0;
        padding-top: 30px;
    }
}
</style>
