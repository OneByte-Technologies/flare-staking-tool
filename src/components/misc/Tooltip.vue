<template>
    <div>
        <v-tooltip bottom class="custom-tooltip">
            <template v-slot:activator="{ on, attrs }">
                <button v-bind="attrs" v-on="on">
                    <slot></slot>
                </button>
            </template>
            <span>{{ text }}</span>
        </v-tooltip>
    </div>
</template>
<script>
export default {
    props: {
        text: String,
    },
}
</script>
<style scoped lang="scss">
.v-tooltip__content {
    background-color: #1f1f1f;
}
</style>
