// Function to store nodeId and timestamp in local storage
function storeNodeIdInLocalStorage(nodeId: string): void {
    const existingData: { nodeId: string; timestamp: number }[] = JSON.parse(
        localStorage.getItem('pendingDelegators') || '[]'
    )
    const timestamp: number = Date.now()
    existingData.push({ nodeId, timestamp })
    localStorage.setItem('pendingDelegators', JSON.stringify(existingData))
}

// Function to retrieve pending delegators (2 minutes old or newer) and remove old entries
function getPendingDelegators(): string[] {
    const currentTime: number = Date.now()
    let storedData: { nodeId: string; timestamp: number }[] = []
    const localStorageData = localStorage.getItem('pendingDelegators')
    if (localStorageData) {
        storedData = JSON.parse(localStorageData)
    }

    // Remove old entries
    storedData = storedData.filter((delegator) => {
        return currentTime - delegator.timestamp <= 60000 // 60000 milliseconds = 1 minute
    })

    // Update the local storage data with the filtered entries
    localStorage.setItem('pendingDelegators', JSON.stringify(storedData))

    // Extract the nodeIds and return them
    return storedData.map((delegator) => delegator.nodeId)
}

export { storeNodeIdInLocalStorage, getPendingDelegators }
