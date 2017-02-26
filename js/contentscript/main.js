var acc = function( acc ){
"use strict";
    var oPlanes      = {},
        oInstructors = {},
        oEquipment   = {},
        ePlanes      = document.getElementById('aircraftSelect'),
        eInstructors = document.getElementById('instructorSelect'),
        eEquipment   = document.getElementById('equipmentSelect'),
        dCurCalMonth = new Date(),
        sExportCalId = 'exportCalViewAction';
   
    function buildPlaneListFromSelectBox( oSelectBoxElm, oList ){
        var aOpts = oSelectBoxElm.querySelectorAll('option');
        
        for( var i=0,l=aOpts.length,opt=null,id='',txt='',tailNumber='',callSign=''; i<l; i++ ){
            opt = aOpts[i];
            id  = opt.value;
            if( id != "0" ){
                txt = opt.text.split('-');
                if( txt.length && txt.length >= 2 ){
                    tailNumber = txt[1].trim();
                    callSign   = txt[0].trim();
                }else{
                    tailNumber = txt[0].trim();
                    callSign   = tailNumber;
                }
                oList[id] = {
                    id:opt.value,
                    name:opt.text,
                    tailNumber:tailNumber,
                    callSign:callSign
                };
            }
        }
    };

    function buildInstructorListFromSelectBox( oSelectBoxElm, oList ){
        var aOpts = oSelectBoxElm.querySelectorAll('option');
        
        for( var i=0,l=aOpts.length,opt=null,id='',txt='',name='',callSign=''; i<l; i++ ){
            opt = aOpts[i];
            id  = opt.value;
            if( id != "0" ){
                txt = opt.text.replace(/\)/g,'').split('(');
                if( txt.length && txt.length >= 3 ){
                    name       = txt[0].trim();
                    callSign   = txt[2].trim();
                    if( callSign.length <= 0 ) callSign = name;
                }else if( txt.length && txt.length >= 1 ){
                    name       = txt[0].trim();
                    callSign   = txt[0].trim();
                }else{
                    name       = 'No name';
                    callSign   = 'No callsign';
                }
                oList[id] = {
                    id:opt.value,
                    name:name,
                    callSign:callSign
                };
            }
        }
    };

    function buildEquipmentListFromSelectBox( oSelectBoxElm, oList ){
        var aOpts = oSelectBoxElm.querySelectorAll('option');
        
        for( var i=0,l=aOpts.length,opt=null,id='',txt='',name='',callSign=''; i<l; i++ ){
            opt = aOpts[i];
            id  = opt.value;
            if( id != "0" ){
                txt = opt.text.split('-');
                if( txt.length && txt.length >= 2 ){
                    name       = txt[0].trim();
                    callSign   = txt[1].trim();
                }
                oList[id] = {
                    id:opt.value,
                    name:name,
                    callSign:callSign
                };
            }
        }
    };

    function scrape(){
        var oBottomframe    = document.querySelector('frameset frame[name="bottomframe"]').contentDocument,
            oRightframe     = oBottomframe.querySelector('frameset frame[name="rightframe"]').contentDocument,
            oResourceSelect = oRightframe.querySelector('select[name="id"]'),
            oMonth          = oRightframe.querySelector('body > form > table:nth-child(4) > tbody > tr > td:nth-child(4) > font > strong'),
            oYear           = oRightframe.querySelector('body > form > table:nth-child(4) > tbody > tr > td:nth-child(8) > font > strong'),
            oCal            = oRightframe.querySelector('body > form > table:nth-child(5)'),
            oWeeks          = oRightframe.querySelectorAll('body > form > table:nth-child(5) > tbody > tr'),
            oDays           = oRightframe.querySelectorAll('body > form > table:nth-child(5) > tbody > tr > td'),
            //sMonth          = oMonth.innerText,
            sMonth          = parseInt(oRightframe.querySelector('input[name="M"]').value),
            //nYear           = parseInt(oYear.innerText),
            nYear           = parseInt(oRightframe.querySelector('input[name="Y"]').value),
            sResource       = oResourceSelect.selectedOptions[0].innerText,
            oResource       = {};

        oResource.name = sResource;
        oResource.aCal = [];

        for( var i=0,l=oDays.length,info=null,nDay=0,oDay={}; i<l; i++ ){
            info = oDays[i].querySelectorAll('a');
            nDay = info[0];
            if( nDay ){
                oDay = {
                    date:'',
                    events:[] 
                };
                nDay = parseInt(nDay.innerText);
                oDay.date = sMonth + '/' + nDay + '/' + nYear;

                for( var j=1,jl=info.length,oEvent=null,event=null; j<jl; j++ ){
                    oEvent = {};
                    event = info[j].innerText.split(' ');
                    
                    oEvent.time = event.pop();
                    oEvent.time = oEvent.time.split('-');
                    oEvent.sResource = event.join(' ');
                    oDay.events.push(oEvent);
                }
                oResource.aCal.push(oDay);
            }
        }

        //console.log(oResource);
        return oResource;
    };
    
    //Returns two dates. One is the start of the month. The other is the end.
    //this function adds "padding" for calendars that show the first and last few days of the prev and next month
    function getDateRangeForCalExport( dDate ){
        var dStart = new Date(dDate).moveToFirstDayOfMonth().clearTime(),
            dEnd   = new Date(dDate).moveToLastDayOfMonth().clearTime();

        dStart.add(-dStart.getDay()).day();
        dEnd.add(6 - dEnd.getDay()).day();
        return {
            dStart:dStart,
            dEnd:dEnd
        }
    }
    //Save as getDateRangeForCalExport but without padding
    function getDateRangeForCalExportNoPad( dDate ){
        var dStart = new Date(dDate).moveToFirstDayOfMonth().clearTime(),
            dEnd   = new Date(dDate).moveToLastDayOfMonth().clearTime();

        dEnd.add(1).day();
        return {
            dStart:dStart,
            dEnd:dEnd
        }
    }

    function scrapeNew( sAircraftId, sInstructorId, sEquipmentId, dDate ){
        var url         = 'https://www.aircraftclubs.com/functions/booking/getBookingsForCalendar.php?p=&a={{aircraft}}&i={{instructor}}&e={{equipment}}&f=a&start={{start}}&end={{end}}&_={{date}}',
            dDate       = dDate || new Date(),
            dTmp        = getDateRangeForCalExport(dDate),
            nStart      = dTmp.dStart.getTime(),
            sStart      = dTmp.dStart.toISOString(),
            nEnd        = dTmp.dEnd.getTime(),
            sEnd        = dTmp.dEnd.toISOString();

        sAircraftId   = sAircraftId   || 0;
        sInstructorId = sInstructorId || 0;
        sEquipmentId  = sEquipmentId  || 0;
        
        function makeRequest( url ){
            var xhr      = new XMLHttpRequest(),
                deferred = Q.defer();
            xhr.open('GET', url);
            xhr.onload = function makeRequestOnload(){
                if (this.status === 200) {
                    deferred.resolve({responseText:this.responseText, response:this.response, responseXML:this.responseXML, status:this.status});
                } else {
                    deferred.reject(new Error("Status code was " + this.status));
                }
            };
            xhr.onerror = function makeRequestOnerror(){
                deferred.reject(new Error("Can't XHR " + JSON.stringify(url)));
            };
            xhr.onprogress = function makeRequestOnprogress(event){
                deferred.notify(event.loaded/event.total);
            };
            xhr.send();
            return deferred.promise;
        };

        return makeRequest( url.mustache({
            aircraft:sAircraftId,
            instructor:sInstructorId,
            equipment:sEquipmentId,
            date:dDate.getTime(),
            start:Math.round(nStart/1000), //They are using php which uses seconds. JS uses ms.
            end:Math.round(nEnd/1000)
        })).then(
            function( response ){
                var deferred = Q.defer(),
                    data     = [],
                    aPlanes  = [],
                    aInst    = [];

                if( response.status == '200' ){
                    data = JSON.parse(response.responseText);
                    for( var i=0,l=data.length,itm=null,span=document.createElement('span'),booker='',bPlane=false,bInstructor=false,dStart=null,dEnd=null,bMaint=false; i<l; i++ ){
                        itm = data[i];

                        span.innerHTML = itm.title;

                        booker      = span.querySelector('.bookingPilot');
                        booker      = booker ? booker.innerText.trim() : '';
                        bMaint      = span.querySelector('.settings') ? true : false;
                        bPlane      = span.querySelector('.airplane') ? true : false;
                        bInstructor = span.querySelector('.headset')  ? true : false;
                         
                        dStart = new Date(itm.start);
                        dEnd   = new Date(itm.end);
                        
                        if( bInstructor ){
                            aInst.push({
                                dStart: dStart, // Keeping them for sorting purposes. 
                                dEnd:   dEnd,
                                start:  dStart.toISOString(),
                                end:    dEnd.toISOString(),
                                bookingID:     itm.id,
                                booker:booker,
                                bPlane:bPlane,
                                bInstructor:bInstructor,
                                bMaint:bMaint,
                                sInstructorId:sInstructorId,
                                oInstructor:oInstructors[sInstructorId],
                                sEquipmentId:sEquipmentId,
                                oEquipment:oEquipment[sEquipmentId],
                                iconLink:"https://camo.githubusercontent.com/b170700f4b5f5f92b6132cbfdcb3c86ded5297d3/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f333533323333392f3534373030382f64613536656632342d633262342d313165322d386339362d6436306634313232663534372e706e67"//"http://png-2.findicons.com/files/icons/949/token/16/headphones.png"
                            });
                        }
                        if( bPlane || bMaint ){
                            aPlanes.push({
                                dStart: dStart, // Keeping them for sorting purposes. 
                                dEnd:   dEnd,
                                start:  dStart.toISOString(),
                                end:    dEnd.toISOString(),
                                bookingID: itm.id,
                                booker:booker,
                                bPlane:bPlane,
                                bInstructor:bInstructor,
                                bMaint:bMaint,
                                sAircraftId:sAircraftId,
                                oAircraft:oPlanes[sAircraftId],
                                sEquipmentId:sEquipmentId,
                                oEquipment:oEquipment[sEquipmentId],
                                iconLink:"https://www.calcsea.org/Portals/0/Images/icons/menu-icons/plane_16.png"//"http://www.clker.com/cliparts/d/4/1/9/12085303581252277725SABROG_Boing_plane_icon.svg"//"https://cdn2.iconfinder.com/data/icons/picol-vector/32/transportation_plane-128.png"
                            });
                        }
                    }
                    aPlanes.sort(function(a,b){
                        return a.dStart.getTime() - b.dStart.getTime();
                    });
                    aInst.sort(function(a,b){
                        return a.dStart.getTime() - b.dStart.getTime();
                    });
                    deferred.resolve( { aPlanes:aPlanes, aInst:aInst, nStart:nStart, nEnd:nEnd, sStart:sStart, sEnd:sEnd } );
                }else{
                    deferred.reject( {error:{status:response.status, response:response} } );
                }
                return deferred.promise;
            }
        );
    };

    function buildLists(){
        buildPlaneListFromSelectBox( ePlanes, oPlanes );
        buildInstructorListFromSelectBox( eInstructors, oInstructors );
        buildEquipmentListFromSelectBox( eEquipment, oEquipment );
    };
    
    function amendScrape( data ){
        return data;
    };

    function startScrape(e){
        var sAircraftId   = ePlanes.value || 0,
            sInstructorId = eInstructors.value || 0,
            sEquipmentId  = eEquipment.value || 0;
        setLoading(true); 
        scrapeNew( sAircraftId, sInstructorId, sEquipmentId, dCurCalMonth ).then(
            amendScrape,
            function( reject ){
                console.log('rejected.');
                console.log(reject);
                chrome.runtime.sendMessage({success:false, data:reject}, function(response){
                    console.log(response);
                });
            }
        ).then(
            function( data ){
                var msg = {};
                if( data.error ){
                    msg = {success:false, data:data};
                }else{
                    msg = {success:true, data:data};
                }
                setLoading(true);
                chrome.runtime.sendMessage( msg, function(response){
                    setLoading(false);
                    if( response === true ){
                        alert('Events exported.');
                    }else{
                        alert('Error: Some or all of the events were not exported.');
                    }
                    console.log(response);
                });
            }
        ).done();
        e.preventDefault();
        return false;
    };

    function insertToolbarCalIcon(){
        var div = document.createElement('div');
        div.innerHTML = '<span class="glyphicons calendar" style="font-size:20px;color:#444;padding-bottom:3px"></span><br>Calendar Export';
        
        div.id = sExportCalId;
        div.classList.add('yourActionsItem');
        div.classList.add('selected');
        div.style.float = 'left';
        div.style.padding = '7px 0 0 0';
        div.addEventListener( 'click', startScrape );
        document.body.querySelector('#toolbar').appendChild(div);
        document.body.querySelector('#toolbarMain').style.minHeight = '64px';
    };

    function insertQuickLinkCalIcon(){
        var a   = document.createElement('a');

        a.href = '#';
        a.classList.add('headerQuicklink');
        a.setAttribute('data-toggle', 'tooltip');
        a.setAttribute('data-placement', 'bottom');
        a.setAttribute('title', '');
        a.setAttribute('data-original-title','Export Calendar');
        a.innerHTML = '<span class="glyphicons calendar"></span>';
        a.addEventListener( 'click', startScrape );
        a.style.color = 'red';
        document.body.querySelector('.boxHeader span').appendChild(a);
    };
    
    function setLoading( bLoading ){
        var div = document.getElementById('exportCalViewAction');

        if( bLoading ){
            div.innerHTML = '<img src="../../images/ajax_loader_large.gif" width="32" style="width:32px; height:32px; margin-top:3px;" alt="Loading...">';
            div.removeEventListener('click',startScrape);
        }else{
            div.innerHTML = '<span class="glyphicons calendar" style="font-size:20px;color:#444;padding-bottom:3px"></span><br>Calendar Export';
           div.addEventListener( 'click', startScrape );
        }
    }
    
    function getACCalDisplayedMonth(){
        return new Date(document.querySelector('span.fc-header-title h2').innerText);
    }
    
    function attachCalIconEvent(){
        document.getElementById(sExportCalId).addEventListener( 'click', startScrape );
    }
    function updateCurCalMonth(){
        dCurCalMonth = getACCalDisplayedMonth();
    }
    
    function attachClickEventForCurCalMonthUpdate( sSelector ){
        var e = document.querySelector( sSelector );
        if( e && e.addEventListener ){
            e.addEventListener('click',function(){
                updateCurCalMonth();
            });
        }else{
            setTimeout( function(){
                attachClickEventForCurCalMonthUpdate( sSelector );
            },1000);
        }
    }
    function attachNextMonth(){
        attachClickEventForCurCalMonthUpdate('.fc-button-next');
    }
    function attachPrevMonth(){
        attachClickEventForCurCalMonthUpdate('.fc-button-prev');
    }
    function attachToday(){
        attachClickEventForCurCalMonthUpdate('.fc-button-today');
    }
    //For attching events to AC clubs elements
    function attachEvents(){
        attachNextMonth();
        attachPrevMonth();
        attachToday();
    }

    function addChangeViewEvent( selector, to ){
        var element = document.querySelector(selector);
        if( element ){
            element.addEventListener('click', function(e){
                chrome.runtime.sendMessage( { setcookie:true, name:'fullcalendar_defaultView', value:to, path:'/pages/view' }, function(response){
                    window.location.reload();
                });
            });
        }
    }
    function attachAgendaWeekClickEvent(){
        addChangeViewEvent('.fc-agendaWeek-button','agendaWeek');
    }
    function attachMonthClickEvent(){
        addChangeViewEvent('.fc-month-button','month');
    }
    function attachAgendaDayClickEvent(){
        addChangeViewEvent('.fc-agendaDay-button','agendaDay');
    }

    function insertExtraViewButtons(){
        $(document.querySelector('.fc-header-right')).append(
            '<button type="button" class="fc-month-button fc-button fc-state-default fc-corner-left" style="margin-left:5px">month</button>'+
            '<button type="button" class="fc-agendaWeek-button fc-button fc-state-default">week</button>'+
            '<button type="button" class="fc-agendaDay-button fc-button fc-state-default fc-corner-right">day</button>'
        );
        attachAgendaWeekClickEvent();
        attachMonthClickEvent();
        attachAgendaDayClickEvent();

        setTimeout(function(){
            var $buttons = $('.fc-month-button,.fc-agendaWeek-button,.fc-agendaDay-button');
            if( !$buttons || $buttons.length == 0 ){
                insertExtraViewButtons();
            }
        },1000);
    }

    return {
        insertQuickLinkCalIcon:insertQuickLinkCalIcon,
        insertToolbarCalIcon:insertToolbarCalIcon,
        buildLists:buildLists,
        attachEvents:attachEvents,
        insertExtraViewButtons:insertExtraViewButtons
    };
}( acc );

//Start
acc.insertToolbarCalIcon();
acc.insertExtraViewButtons();
acc.attachEvents();
acc.buildLists();

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
