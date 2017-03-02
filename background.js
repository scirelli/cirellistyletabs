//Fired when the extension is first installed, when the extension is updated to a new version, and when Chrome is updated to a new version.
chrome.runtime.onInstalled.addListener(function() {
    
});
chrome.runtime.onSuspend.addListener(function() {
    //save state   
});

// Called when the url of a tab changes.
// function checkForValidUrl(tabId, changeInfo, tab) {
//     if( tab.url.indexOf('scirelli.com') > -1 || tab.url.indexOf('cirelli.org') > -1 ){
//         chrome.pageAction.setPopup({
//             tabId:tabId,
//             popup:'tabs_popup.html'
//         });
//         chrome.pageAction.show(tabId);
//     }
// };

// Listen for any changes to the URL of any tab.
//chrome.tabs.onUpdated.addListener(checkForValidUrl);

//Listen to messages from content scripts
chrome.runtime.onMessage.addListener(function( oResponse, sender, sendResponse){
    console.log('Scraped: ');
    console.log(oResponse);

    return true;
});

// chrome.tabs.query({}, function callback(listOfTabs){
//     console.log(listOfTabs);
// });

// chrome.windows.getAll({populate:true}, function(allWindows){
//     console.log(allWindows);

//     chrome.tabs.query({active: true, windowType:'normal', currentWindow: true}, function(tabs) {
//         if(tabs.length){
//             chrome.tabs.sendMessage(tabs[0].id, {type:'windowList', data:allWindows}, function(response) {
//                 console.log('Steve ');
//                 console.log(response);
//                 debugger;
//                 //window.close();
//             });
//         }
//     });
// });

// chrome.tabs.onCreated
// chrome.tabs.onActivated
// chrome.tabs.onDetached
// chrome.tabs.onAttached
// chrome.tabs.onReplaced

// chrome.storage.local.get('', function(data){
//     console.log(data)
// });

/*
chrome.tabs.sendMessage(tab.id, {command: "scrape", sAircraftId:915, sInstructorId:0 }, function(response) {
    console.log(response);
    debugger;
    //window.close();
});
*/
