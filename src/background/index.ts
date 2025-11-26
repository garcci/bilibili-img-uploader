import browser from 'webextension-polyfill'

browser.runtime.onInstalled.addListener((): void => {
  console.log('Extension installed')
})

browser.action.onClicked.addListener(async () => {
  const tabs = await browser.tabs.query({
    active: true,
    currentWindow: true,
    status: 'complete',
  })
  const currentTab = tabs[0]
  if (currentTab?.url?.includes('/zhibi-image-upload')) {
    return
  }
  browser.tabs.create({
    url: 'https://www.bilibili.com/zhibi-image-upload',
  })
})

// 监听来自 content script 的消息
browser.runtime.onMessage.addListener(async (message) => {
  if (message.type === 'PUSH_TO_MY_NOTES') {
    try {
      const myHeaders = new Headers()
      myHeaders.append('Content-Type', 'application/json')
      myHeaders.append('Accept', '*/*')
      myHeaders.append('Connection', 'keep-alive')
      const raw = JSON.stringify({
        message: {
          from: {
            id: 6976780218,
            languagecode: 'zh-hans',
          },
          chat: {
            id: 6976780218,
            type: 'private',
          },
          text: '',
          imgUrl: message.link,
        },
      })

      const response = await fetch('https://note.gjqqq.com/api/telegram_webhook/E0P7FBPS2K8gKV6L', {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.text()
      console.log('pushToMyNotes result:', result)

      return { success: true, result }
    }
    catch (error) {
      console.error('pushToMyNotes error:', error)
      return { success: false, error }
    }
  }
})
