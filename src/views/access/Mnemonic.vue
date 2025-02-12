<template>
    <div class="mnemonic_auth notranslate" translate="no">
        <div class="left">
            <header>
                <h1>{{ $t('access.mnemonic.title') }}</h1>
            </header>
            <p>Your mnemonic phrase is 24 words seperated by an empty space.</p>
            <input
                type="password"
                ref="mnemonic_in"
                placeholder="Type your mnemonic phrase"
                autocomplete="off"
                autocapitalize="off"
            />
            <div class="button_container">
                <p class="err" v-if="err">{{ err }}</p>
                <v-btn
                    class="ava_button but_primary button_primary access"
                    @click="access"
                    depressed
                    :loading="isLoading"
                >
                    {{ $t('access.mnemonic.submit') }}
                </v-btn>
                <router-link to="/access" class="link">
                    {{ $t('access.mnemonic.cancel') }}
                </router-link>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import * as bip39 from 'bip39'
import MnemonicPasswordInput from '@/components/misc/MnemonicPasswordInput.vue'

@Component({
    components: {
        MnemonicPasswordInput,
    },
})
export default class Mnemonic extends Vue {
    isLoading: boolean = false
    err: string = ''
    canSubmit = false

    $refs!: {
        mnemonic_in: HTMLInputElement
    }

    beforeDestroy() {
        this.$refs.mnemonic_in.value = ''
    }

    errCheck() {
        let phrase = this.getMnemonic()

        if (!phrase) {
            return
        }

        let words = phrase.split(' ')

        // not a valid key phrase
        if (words.length !== 24) {
            this.err = `${this.$t('access.mnemonic.error')}`
            return false
        }

        let isValid = bip39.validateMnemonic(phrase)
        if (!isValid) {
            this.err = 'Invalid mnemonic phrase. Make sure your mnemonic is all lowercase.'
            return false
        }

        return true
    }

    getWordCount() {
        const phrase = this.getMnemonic() || ''
        return phrase.trim().split(' ').length
    }

    getMnemonic() {
        const inputVal = this.$refs['mnemonic_in'].value
        console.log('Mnemonic:', inputVal.trim())
        return inputVal.trim()
    }

    async access() {
        this.err = ''
        const phrase = this.getMnemonic()

        this.isLoading = true

        if (!this.errCheck()) {
            this.isLoading = false
            return
        }

        setTimeout(async () => {
            try {
                await this.$store.dispatch('accessWallet', phrase)
                this.isLoading = false
            } catch (e) {
                this.isLoading = false
                this.err = `${this.$t('access.mnemonic.error')}`
            }
        }, 500)
    }
}
</script>
<style scoped lang="scss">
@use '../../main';

.mnemonic_auth {
    margin: 0px auto;
    width: 100%;
    background-color: var(--bg-light);
    padding: main.$container-padding;

    .left,
    .right {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
    }
}

h1 {
    font-weight: 400;
    font-size: main.$m-size;
}

label {
    text-align: left;
    color: main.$primary-color-light;
    font-size: 12px;
    margin-bottom: 20px;
}

textarea,
input[type='password'] {
    margin: 1em 0;
    max-width: 440px;
    width: 100%;
    background-color: var(--bg) !important;
    resize: none;
    padding: 1em 16px;
    font-size: 14px;
    color: var(--primary-color);
}

.phrase_disp {
    width: 100%;
    max-width: 560px;
    margin-bottom: main.$vertical-padding;
}

.err {
    font-size: 13px;
    color: var(--error);
    text-align: center;
    margin: 14px 0px !important;
}

.remember {
    margin-top: -20px;
    font-size: 0.75em;
}
.link {
    color: var(--link-secondary);
}
.key_in {
    margin: 30px auto;
    margin-bottom: 6px;
    width: 100%;
    font-size: 13px;
    background-color: main.$white;
    border-radius: 4px;
}

.but_primary {
    margin-bottom: 15px;
}

.button_container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}

@include main.mobile_device {
    .mnemonic_auth {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        padding: main.$container-padding-mobile;

        .left,
        .right {
            flex-direction: column;
            align-items: stretch;
            justify-content: center;
        }

        .left {
            order: 2;
        }

        .right {
            order: 1;
            margin-bottom: main.$vertical-padding-mobile;
        }

        > * {
            width: 100%;
        }
    }

    h1 {
        text-align: center;
        font-size: main.$m-size-mobile;
    }

    label {
        text-align: center;
        margin-bottom: 20px;
    }

    .phrase_disp {
        width: 100%;
        max-width: 560px;
        margin-bottom: main.$vertical-padding-mobile;
    }

    .err {
        font-size: 13px;
        margin: 14px 0px !important;
    }

    .remember {
        margin-top: -20px;
        font-size: 0.75em;
    }

    .key_in {
        margin: 30px auto;
        margin-bottom: 6px;
        width: 100%;
        font-size: 13px;
    }

    .but_primary {
        margin: 0px auto;
        display: block;
        margin-top: 20px;
        margin-bottom: 15px;
    }

    .button_container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
}
</style>
