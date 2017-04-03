var cirelli = cirelli || {};

cirelli.tabs = function(window){
'use strict';
    const PADDING = 300,
          PADDING_UNITS = 'px',
          PADDING_TYPE = 'padding-left'; 

    var document = window.document,
        newNode = (function() {
            var count = 0;

            return function newNode(){
                return new cirelli.TreePanelNode('Steve' + count++);
            };
        })();

    //window.innerHeight 
    padDocumentBody();
    getAllPositionFixedElements().forEach(function(e){
        var left = window.parseInt(window.getComputedStyle(e, null).getPropertyValue('left')) || 0;

        //e.style.left = 
    });
    injectHTML();
    cirelli.treePanelCreator.createTabElement()
        .forEach(function(el){
            el.addEventListener('add-tab', function(e){
                this.addTab(newNode());
            });
        });

    return;

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

    function injectHTML() {
        var section = document.createElement('section'),
            div = document.createElement('div');
        
        section.classList.add('cirelli-style-tabs-container');
        div.classList.add('cirelli-style-tabs');
        section.appendChild(div);

        document.body.appendChild(section);

        return section;
    }
};

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
