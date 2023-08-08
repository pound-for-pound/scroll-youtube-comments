const sendMessageToBackground = (msgObj) => chrome.runtime.sendMessage(msgObj)
sendMessageToBackground({ extensionClick: true })

// messages from background
chrome.runtime.onMessage.addListener(msg => {
  if (msg.extensionClickReceived === true && msg.stop === false)
    window.close()
})