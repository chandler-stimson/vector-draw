'use strict';

const open = async () => {
  const win = await chrome.windows.getCurrent();

  chrome.storage.local.get({
    width: 900,
    height: 700,
    left: win.left + Math.round((win.width - 900) / 2),
    top: win.top + Math.round((win.height - 700) / 2)
  }, prefs => {
    chrome.windows.create({
      url: '/data/window/index.html',
      width: prefs.width,
      height: prefs.height,
      left: prefs.left,
      top: prefs.top,
      type: 'popup'
    });
  });
};

chrome.action.onClicked.addListener(async tab => {
  try {
    const r = await chrome.scripting.executeScript({
      target: {
        tabId: tab.id
      },
      files: ['data/inject.js']
    });
    if (r[0].result !== true) {
      throw Error('cannot inject');
    }
  }
  catch (e) {
    console.log(e);
    open();
  }
});

chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request.method === 'download') {
    chrome.tabs.captureVisibleTab({
      format: 'png',
      quality: 1
    }, response);
    return true;
  }
});

{
  const startup = () => {
    chrome.contextMenus.create({
      id: 'open-editor',
      title: 'Open Editor',
      contexts: ['action']
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
            tabs.query({active: true, currentWindow: true}, tbs => tabs.create({
              url: page + '?version=' + version + (previousVersion ? '&p=' + previousVersion : '') + '&type=' + reason,
              active: reason === 'install',
              ...(tbs && tbs.length && {index: tbs[0].index + 1})
            }));
            storage.local.set({'last-update': Date.now()});
          }
        }
      }));
    });
    setUninstallURL(page + '?rd=feedback&name=' + encodeURIComponent(name) + '&version=' + version);
  }
}
