var cirelli = cirelli || {};

cirelli.tabs = function( cirelli, window, $ ){
'use strict';
    const PADDING = 50; 
    var document = window.document;

    return {
    };
    
    function padDocumentBody(){
        var bodyPaddingLeft = window.parseInt(window.getComputedStyle(document.body, null).getPropertyValue('padding-left'));
    }

    function getAllPositionFixedElements() {
        var positionFixedElements = [];

        document.body.traverse(function(node){
            if(node.nodeName.toLowerCase() !== 'script' && window.getComputedStyle(node, null).getPropertyValue('position') === 'fixed' ){
                positionFixedElements.push(node);
            }
        });

        return positionFixedElements;
    }
}( cirelli, window, jQuery );

/*   Not used
chrome.extension.onMessage.addListener( function(request, sender, sendResponse ){
    switch( request.command ){
    case "scrape":
        acc.scrape( request.sAircraftId, request.sInstructorId ).then(
            function( data ){
                debugger;
                if( data.error ){
                    sendResponse({success:false, data:data});
                }else{
                    sendResponse({success:true, data:data});
                }
            },
            function( reject ){
                console.log('rejected.');
                console.log(reject);
                sendResponse({success:false, data:reject});
            }
        ).done();
        break;
    default:
        sendResponse({success:false});
    }
    return true;
});
*/
