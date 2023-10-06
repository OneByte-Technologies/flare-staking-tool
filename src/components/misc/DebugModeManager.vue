<template>
    <div></div>
</template>
<script>
export default {
    mounted() {
        // Function to enable debug mode and store the timestamp in local storage
        const enableDebugMode = () => {
            const debugData = {
                enabled: true,
                timestamp: Date.now(),
            }
            localStorage.setItem('debugData', JSON.stringify(debugData))
        }

        // Function to check if debug mode is enabled and still within the 24-hour window
        const isDebugModeEnabled = () => {
            const debugData = localStorage.getItem('debugData')
            if (debugData) {
                const parsedDebugData = JSON.parse(debugData)
                const currentTime = Date.now()
                const timeDifference = currentTime - parsedDebugData.timestamp

                // Check if debug mode is enabled and within 24 hours (86400000 milliseconds)
                if (parsedDebugData.enabled && timeDifference <= 86400000) {
                    return true
                }

                // If debug mode has expired, disable it
                localStorage.removeItem('debugData')
            }
            return false
        }

        // Check if the "debug" query parameter is present in the URL
        const urlParams = new URLSearchParams(window.location.search)
        const debugParam = urlParams.get('debug')

        if (debugParam === 'true') {
            enableDebugMode() // Explicitly enable debug mode
        }

        // If the "debug" query parameter is "true" or if debug mode is explicitly enabled, enable debug mode
        if (debugParam === 'true' || isDebugModeEnabled()) {
            console.log('Debug mode is enabled')
        } else {
            // Debug mode is not enabled, override console.log to do nothing
            console.log = function () {}
            console.log('Debug mode is disabled')
        }
    },
}
</script>
