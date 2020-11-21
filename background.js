'use strict';

const open = () => chrome.storage.local.get({
  width: 900,
  height: 700,
  left: screen.availLeft + Math.round((screen.availWidth - 900) / 2),
  top: screen.availTop + Math.round((screen.availHeight - 700) / 2)
}, prefs => {
  chrome.windows.create({
    url: chrome.extension.getURL('data/window/index.html'),
    width: prefs.width,
    height: prefs.height,
    left: prefs.left,
    top: prefs.top,
    type: 'popup'
  });
});

chrome.browserAction.onClicked.addListener(() => chrome.tabs.executeScript({
  file: 'data/inject.js',
  runAt: 'document_start'
}, () => {
  const lastError = chrome.runtime.lastError;
  if (lastError) {
    open();
  }
}));

chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request.method === 'download') {
    chrome.tabs.captureVisibleTab({
      format: 'png',
      quality: 1
    }, href => {
      const a = document.createElement('a');
      a.href = href;
      a.download = sender.tab.title + '.png';
      a.click();
      response();
    });
    return true;
  }
});

{
  const startup = () => {
    chrome.contextMenus.create({
      id: 'open-editor',
      title: 'Open Editor',
      contexts: ['browser_action']
    });
  };
  chrome.runtime.onStartup.addListener(startup);
  chrome.runtime.onInstalled.addListener(startup);
}
chrome.contextMenus.onClicked.addListener(info => {
  if (info.menuItemId === 'open-editor') {
    open();
  }
});

/* FAQs & Feedback */
{
  const {management, runtime: {onInstalled, setUninstallURL, getManifest}, storage, tabs} = chrome;
  if (navigator.webdriver !== true) {
    const page = getManifest().homepage_url;
    const {name, version} = getManifest();
    onInstalled.addListener(({reason, previousVersion}) => {
      management.getSelf(({installType}) => installType === 'normal' && storage.local.get({
        'faqs': true,
        'last-update': 0
      }, prefs => {
        if (reason === 'install' || (prefs.faqs && reason === 'update')) {
          const doUpdate = (Date.now() - prefs['last-update']) / 1000 / 60 / 60 / 24 > 45;
          if (doUpdate && previousVersion !== version) {
            tabs.create({
              url: page + '?version=' + version + (previousVersion ? '&p=' + previousVersion : '') + '&type=' + reason,
              active: reason === 'install'
            });
            storage.local.set({'last-update': Date.now()});
          }
        }
      }));
    });
    setUninstallURL(page + '?rd=feedback&name=' + encodeURIComponent(name) + '&version=' + version);
  }
}

