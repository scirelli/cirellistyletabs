var cirelli = cirelli || {};

cirelli.tabs = function( cirelli, window, $ ){
'use strict';
    const PADDING = 150,
          PADDING_UNITS = 'px',
          PADDING_TYPE = 'padding-left'; 

    var document = window.document;
    //window.innerHeight 
    padDocumentBody();
    //Get template html files
    //string = chrome.runtime.getURL(string path)
    //var shadow = document.querySelector('#nameTag').createShadowRoot();
    // shadow = document.querySelector('#nameTag').attachShadow({mode: 'open'});
    // var template = document.querySelector('#nameTagTemplate');
    // var clone = document.importNode(template.content, true);
    // shadow.appendChild(clone);
    
    getAllPositionFixedElements().forEach(function(e){
        var left = window.parseInt(window.getComputedStyle(e, null).getPropertyValue('left')) || 0;

        //e.style.left = 
    });

    return {};
    
    function padDocumentBody(){
        return padElement(document.body);
    }

    function padElement(element) {
        var paddingLeft = window.parseInt(window.getComputedStyle(element, null).getPropertyValue(PADDING_TYPE)) || 0;
        
        paddingLeft = PADDING - paddingLeft;
        if(paddingLeft < PADDING) {
            paddingLeft = PADDING;
        }

        element.style['paddingLeft'] = paddingLeft + PADDING_UNITS;

        return element;
    };

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
