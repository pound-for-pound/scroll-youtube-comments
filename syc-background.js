let stop = true,
    commentsScrollIsEnabled = false

const enableIconPath = "icons/syc-enable.png",
      disableIconPath = "icons/syc-disable.png",
      defaultIconPath = "icons/syc-default.png",
      setIcon = (path) => chrome.action.setIcon({ path })

const enableCommentsScrollTitle = "Enable comments scroll",
      disableCommentsScrollTitle = "Disable comments scroll",
      unavailableTitle = "Unavailable on this page",
      setExtensionTitle = (title) => chrome.action.setTitle({ title })

function resetState() {
  stop = true
  setIcon(defaultIconPath)
  setExtensionTitle(unavailableTitle)
}

const sendMessageToPopup = (msgObj) => chrome.runtime.sendMessage(msgObj)

function sendMessageToContent(msgObj) {
  chrome.tabs.query(
    // condition: current active tab
    { active: true, currentWindow: true },

    // callback with tabs array param
    (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, msgObj)
      })
    }
  )
}

function onExtensionClick() {
  sendMessageToContent({ enableCommentsScroll: !commentsScrollIsEnabled })
  setIcon(commentsScrollIsEnabled ? enableIconPath : disableIconPath)
  setExtensionTitle(
    commentsScrollIsEnabled
      ? enableCommentsScrollTitle
      : disableCommentsScrollTitle
  )
  commentsScrollIsEnabled = !commentsScrollIsEnabled
}

// request content state and sync with it
sendMessageToContent({ sync: true })

// reset and sync state on tab change
chrome.tabs.onActivated.addListener(() => {
  resetState()
  sendMessageToContent({ sync: true })
})

// messages from content and popup
chrome.runtime.onMessage.addListener(msg => {
  /* content messages */
  if (msg.commentsScrollIsEnabled === true) {
    commentsScrollIsEnabled = true
    setIcon(disableIconPath)
    setExtensionTitle(disableCommentsScrollTitle)

  } else if (msg.commentsScrollIsEnabled === false) {
    commentsScrollIsEnabled = false
    setIcon(enableIconPath)
    setExtensionTitle(enableCommentsScrollTitle)
  }

  if (msg.stop === false) {
    stop = false
    setIcon(commentsScrollIsEnabled ? disableIconPath : enableIconPath)
    setExtensionTitle(
      commentsScrollIsEnabled
        ? disableCommentsScrollTitle
        : enableCommentsScrollTitle
    )

  } else if (msg.stop === true) {
    stop = true
    setIcon(defaultIconPath)
    setExtensionTitle(unavailableTitle)
  }

  /* popup messages */
  if (msg.extensionClick === true) {
    sendMessageToPopup({ extensionClickReceived: true, stop })

    if (!stop) onExtensionClick()
  }
})