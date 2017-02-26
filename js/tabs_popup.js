var client_id        = '920486903505-r6bkir5pv6td8iqh84rbu1k0gngv0s8n.apps.googleusercontent.com',
    api_key          = 'AIzaSyBnsVaei45mMVPHAlrdxr6jVKnj2nBeaYc',
    //              https://www.googleapis.com/apiName/apiVersion/resourcePath?parameters            
    sBaseCalendarURL = 'https://www.googleapis.com/calendar/v3/users/me/';

!function(){
"use strict";
    var oScrapeBtn = document.querySelector('button#scrape');

        /*
    oScrapeBtn.addEventListener('click',function(e){
        chrome.tabs.getSelected(null, function(tab) {
            chrome.tabs.sendMessage(tab.id, {command: "scrape", sAircraftId:915, sInstructorId:0 }, function(response) {
                console.log(response);
                debugger;
                //window.close();
            });
        });

        //chrome.tabs.executeScript(null,{
        //        code:'scrape();',
        //        allFrames:false,
        //        runAt:"document_start"
        //    },
        //    function( a ){
        //        debugger;
        //    }
        //);
    });
        */
}();

/** Batch Notes **
 * Limited to 50 calls in a single batch request.
 * https://www.googleapis.com/calendar/v3/batch/
 */
if( false ){
document.getElementById('run').addEventListener('click',function(){
    var calendarlist = new gcal.CalendarList(),
        calendar     = new gcal.Calendars(),
        events       = new gcal.Events();
    
    //Calendar and CalendarList
    function testCalendar(){
        calendarlist.list().then(function(aCalendarListEntry){
            console.log(aCalendarListEntry);
        }).done();

        calendarlist.execute();
        //scirelli2: guqf5l5oaq8gmnubglim85uedk@group.calendar.google.com
        calendar.get('18s4kn3fhvriai8jujb1ss2m7k@group.calendar.google.com').then(function(c){
            console.log(c);
        }).done();
        /*
        calendar.insert( new gcal.Calendar({ summary:'Test 6', description:'Does it work?' }) ).then(function(cal){
            console.log(cal);
        }).done();

        calendar.delete('ipn1dro22mgg7ojjfm1g9uirb4@group.calendar.google.com').then(function(cal){
            console.log(cal);
        }).done();
        */

        calendar.execute();

        /*
        calendarlist.list().then(function(aCalendarListEntry){
            console.log(aCalendarListEntry);
        }).done();

        calendarlist.get('18s4kn3fhvriai8jujb1ss2m7k@group.calendar.google.com').then(function(oCalenderListEntry){
            console.log(oCalenderListEntry);
        }).done();

        calendarlist.insert({
            id:'18s4kn3fhvriai8jujb1ss2m7k@group.calendar.google.com',
            defaultReminders:[
                {
                    method:'email',
                    minutes:10
                }
            ],
            notificationSettings:{
                notifications:[
                    {
                        method:'email',
                        type:'eventCreation'
                    }
                ]
            }
        }).then(
            function( obj ){
            },
            function( error ){
                debugger;
                console.error(error);
            }
        ).done();

        calendarlist.delete('0vf8d7bhs203c0rk92as26v2qk@group.calendar.google.com').then(
            function(oCalenderListEntry){
                console.log('Delete: ');
                debugger;
            },
            function(obj){
                debugger;
            }
        ).done();

        calendarlist.insert({
            id:'bgi5k124bf64bohkavm62qmu8o@group.calendar.google.com',
            defaultReminders:[
                {
                    method:'email',
                    minutes:10
                }
            ],
            notificationSettings:{
                notifications:[
                    {
                        method:'email',
                        type:'eventCreation'
                    }
                ]
            }
        }).then(
            function( obj ){
            },
            function( error ){
                debugger;
                console.error(error);
            }
        ).done();

        calendarlist.get('bgi5k124bf64bohkavm62qmu8o@group.calendar.google.com').then(function(oCalenderListEntry){
            console.log(oCalenderListEntry);
        }).done();
        */
    };
    //Events
    function testEvents(){
        //listid: 18s4kn3fhvriai8jujb1ss2m7k@group.calendar.google.com
        //eventid:5466160332369527 
        events.list('18s4kn3fhvriai8jujb1ss2m7k@group.calendar.google.com').then(
            function(evnts){
                console.log(evnts);
            },
            function( reason ){
                console.log(reason);
            }
        ).done();
        events.get('18s4kn3fhvriai8jujb1ss2m7k@group.calendar.google.com', 'ljjnf3faadocv1idboue0mii00').then(
            function(evnts){
                console.log(evnts);
            },
            function( reason ){
                console.log(reason);
            }
        ).done();

        events.insert( '18s4kn3fhvriai8jujb1ss2m7k@group.calendar.google.com', {
            description:"test " + Math.random(),
            summary:"test summary " + Math.random(),
            start: new gcal.Event.Date({
                dateTime: Date.today().setTimeToNow().set({hour:7,minute:10}).toISOString()
            }),
            end: new gcal.Event.Date({
                dateTime: Date.today().setTimeToNow().addHours(1).toISOString()
            })
        }).then(
            function(evnts){
                console.log(evnts);
            },
            function( reason ){
                console.log(reason);
            }
        ).done();

        events.execute();
    };
    //testEvents();





    //bgi5k124bf64bohkavm62qmu8o@group.calendar.google.com
    /*
    calendarlist.delete('18s4kn3fhvriai8jujb1ss2m7k@group.calendar.google.com').then(function(oCalenderListEntry){
        console.log('Delete: ');
        console.log(oCalenderListEntry);
        debugger;
    },
    function(obj){
        debugger;
    }).done();
    calendarlist.execute();
    */

    /*
    gcal.xhrWithAuth( 'GET', 'https://www.googleapis.com/calendar/v3/users/me/calendarList', true, null, function(r){
        debugger;
    });
    */
    //Hard Appointments: 'ktukt423032jk0figv9i1vp154@group.calendar.google.com'
    //Test: 'ptjt37b746po9qb6hq62qlsrv4@group.calendar.google.com'
    /*calendarlist.insert({
        id:'ptjt37b746po9qb6hq62qlsrv4@group.calendar.google.com',
        defaultReminders:[
            {
                method:'email',
                minutes:10
            }
        ],
        notificationSettings:{
            notifications:[
                {
                    method:'email',
                    type:'eventCreation'
                }
            ]
        }
    }).then(
        function( obj ){
            debugger;
        },
        function( error ){
            console.error(error);
        }
    ).done();

    calendarlist.delete('ptjt37b746po9qb6hq62qlsrv4@group.calendar.google.com').then(
        function( obj ){
            debugger;
        },
        function( error ){
            console.error(error);
        }
    ).done();
    */
});
}
