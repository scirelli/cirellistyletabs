// Called when the url of a tab changes.
function checkForValidUrl(tabId, changeInfo, tab) {
    if( tab.url.indexOf('scirelli.com') > -1 || tab.url.indexOf('cirelli.org') > -1 ){
        chrome.pageAction.setPopup({
            tabId:tabId,
            popup:'tabs_popup.html'
        });
        chrome.pageAction.show(tabId);
    }
};

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForValidUrl);

chrome.runtime.onMessage.addListener(function( oResponse, sender, sendResponse){
    console.log('Scraped: ');
    console.log(oResponse);

    return true;
});
