// @corecode_begin getProtectedData
if( gcal === undefined ){ var gcal = {}; }

!function(gcal){
"use strict";

    function xhrWithAuth( method, url, interactive, oData, callback ){
        var access_token  = null,
            retry         = true,
            deferred      = Q.defer(),
            batchBoundary = 'batch_foobarbaz';

        callback = callback || function(){};

        getToken();

        function getToken() {
            chrome.identity.getAuthToken({ interactive: interactive }, function(token) {
                if (chrome.runtime.lastError) {
                    callback(chrome.runtime.lastError);
                    deferred.reject(chrome.runtime.lastError); 
                    return;
                }

                access_token = token;
                requestStart();
            });
        };

        function requestStart() {
            var xhr   = new XMLHttpRequest(),
                sData = '';

            xhr.open(method, url);
            xhr.onload = requestComplete;
            xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);

            if( oData && oData.length ){//Considerig it a batch request
                xhr.setRequestHeader("Content-Type", "multipart/mixed; boundary=" + batchBoundary);
                sData = buildBatchRequest( oData );
                xhr.setRequestHeader("Content-Length", sData.length);
                xhr.send( sData );
            }else if( typeof(oData) == 'string' ){

            }else if( oData ){//
                xhr.setRequestHeader("Content-Type", "application/json;");//charset=UTF-8
                xhr.send( JSON.stringify(oData) );
            }else{
                xhr.send();
            }
        };

        function requestComplete() {
            if (this.status == 401 && retry) {
                retry = false;
                chrome.identity.removeCachedAuthToken({ token: access_token }, getToken);
            } else {
                callback(null, this.status, this.response);
                deferred.resolve( { status:this.status, response:this.response } );
            }
        };
        
        return deferred.promise;
    };
    
    /**
     * params:
     *   oRequest: object with properties
     *      headers: array of header objects
     *      method: xhr method
     *      url:  the url
     **/
    function xhrWithAuth2( oRequest, interactive ){
        var access_token  = null,
            retry         = true,
            deferred      = Q.defer(),
            xhr           = null;

        getToken();

        function getToken() {
            chrome.identity.getAuthToken({ interactive: interactive }, function(token) {
                if (chrome.runtime.lastError) {
                    deferred.reject(chrome.runtime.lastError); 
                    return;
                }

                access_token = token;
                requestStart();
            });
        };

        function requestStart() {
            xhr = new XMLHttpRequest();

            xhr.open( oRequest.method, oRequest.url );
            xhr.onload = requestComplete;
            xhr.setRequestHeader( 'Authorization', 'Bearer ' + access_token );
            
            for( var i=0,a=oRequest.headers,l=a.length,itm=null; i<l; i++ ){
                itm = a[i];
                xhr.setRequestHeader( itm.header, itm.value );
            }
            xhr.send( oRequest.body );
        };

        function requestComplete() {
            if (this.status == 401 && retry) {
                retry = false;
                chrome.identity.removeCachedAuthToken({ token: access_token }, getToken);
            } else {
                deferred.resolve( { status:this.status, response:this.response, xhr:xhr } );
            }
        };
        
        return deferred.promise;
    };
    
    gcal.GoogleAPIRequest = function(){
        this.sBatchBoundary = 'batch_foobarbaz';
        this.sGoogleAPIsURL = 'https://www.googleapis.com/';
    };
    
    gcal.GoogleAPIRequest.prototype = {
        buildBatchRequest:function( aRequests ){
            var oData = {
                url:'',
                headers:[],
                method:'GET',
                body:''
            };

            function headerToString( aoHeaderObjs ){
                var sHeaders = '';
                for( var i=0,l=aoHeaderObjs.length,itm=null; i<l; i++ ){
                    itm = aoHeaderObjs[i];
                    sHeaders += itm.header + ': ' + itm.value + '\n';
                }
                return sHeaders;
            };

            oData.method = 'POST';
            oData.url    = this.sGoogleAPIsURL + 'batch';
            oData.headers.push( { header:"Content-Type", value:"multipart/mixed; boundary=" + this.sBatchBoundary} ) ;
            oData.body = [];
            //1. Build batch request
            //2. Parse batch request and resolve promisses.
            //{header:'Content-Length', value:body.length}
            //{header:'Content-ID', value:CryptoJS.MD5(sURL + body).toString() }
            for( var i=0,l=aRequests.length,itm=null,sBody=''; i<l; i++ ){
                itm = aRequests[i];
                sBody = '';
                itm.id = CryptoJS.MD5(itm.url + itm.body).toString();
                //Batch headers
                sBody += headerToString([
                    {
                        header:"Content-Type",
                        value:"application/http"
                    },
                    {
                        header:'Content-ID',
                        value:itm.id
                    }
                ]);

                sBody += '\r\n';

                //Items query
                sBody += itm.method + ' ' + itm.url;
                
                //Items headers
                if( itm.body ){
                    itm.headers.push({
                        header:"Content-Length",
                        value:itm.body.length
                    });
                }
                if( itm.headers && itm.headers.length ){
                    sBody += '\r\n';
                    sBody += headerToString( itm.headers );
                }

                if( itm.body ){
                    sBody += '\r\n';
                    sBody += itm.body;
                }

                oData.body.push(sBody);
            }
            oData.body = '--' + this.sBatchBoundary + '\r\n' + oData.body.join('\r\n\r\n--' + this.sBatchBoundary + '\r\n') + '\r\n\r\n--' + this.sBatchBoundary + '--';
            //oData.headers.push( { header:"Content-Length", value:oData.body.length } ); //Browser won't let you set content length header.
            
            return oData;
        },
        parseResponse:function( aResolved, oIdMap ){
            var oResolvedIds = {};
            for( var i=0,l=aResolved.length,itm=null; i<l; i++ ){
                itm = aResolved[i];
                if( itm.state == 'fulfilled' && itm.value && itm.value.status == 200 ){
                    var boundary   = itm.value.xhr.getResponseHeader('content-type').split('=')[1].trim(),
                        aResponses = itm.value.response.split( new RegExp('--' + boundary + '[-]{0,2}[\s]*') ).filter( function(v){ return v.trim() ? true : false; } );

                    for( var j=0,jl=aResponses.length,headers1='',headers2='',response='',id='',contentType='',status='',statusCode=0; j<jl; j++ ){
                        response    = aResponses[j].trim().split('\r\n\r\n');
                        headers1    = response[0];
                        headers2    = response[1];
                        id          = headers1.substring( headers1.indexOf('Content-ID') ).split('response-')[1].trim();//headers1.substring( headers1.indexOf('Content-ID'), headers1.indexOf('\n', headers1.indexOf('Content-ID')) ).split('response-')[1].trim();
                        contentType = headers2.substring( headers2.indexOf('Content-Type'), headers2.indexOf('\n', headers2.indexOf('Content-Type')) ).trim();
                        status      = headers2.substring( headers2.indexOf('HTTP/1.1'), headers2.indexOf('\n', headers2.indexOf('HTTP/1.1')) ).replace('HTTP/1.1 ','');
                        statusCode  = parseInt(status);
                        response    = response[2] ? response[2].trim() : '';
                        if( statusCode >= 200 && statusCode < 300 ){
                            if( response && contentType.indexOf('json') != -1 ){
                                response = JSON.parse(response);
                            }
                            if( oIdMap[id] ){
                                oIdMap[id].deferred.resolve( response );
                                oResolvedIds[id] = true;
                            }
                        }else{
                            if( oIdMap[id] ){
                                oIdMap[id].deferred.reject( {response:response, statusCode:statusCode, status:status } );
                                oResolvedIds[id] = true;
                            }
                        }
                    }

                }
            }
            for( var j=0,a=Object.keys(oIdMap),jl=a.length,itm=null; j<jl; j++ ){
                if( !oResolvedIds[a[j]] ){
                    oIdMap[a[j]].deferred.reject({error:'Batch request issue', value:aResolved});
                }
            }
            return aResolved;
        },
        execute:function( aAll ){
            if( aAll.length == 1 ){
                return gcal.xhrWithAuth2(aAll[0], true ).then(
                    function( resolved ){
                        if( resolved.status == 200 || resolved.status == 204 ){//|| resolved.status == 204
                            var rtn = '';
                            if(resolved.response){
                                rtn = JSON.parse(resolved.response)
                            }
                            aAll[0].deferred.resolve(rtn);
                            return rtn;
                        }
                        debugger;
                        resolved.response = JSON.parse(resolved.response);
                        aAll[0].deferred.resolve(resolved);
                        return resolved;
                    },
                    function( error ){
                        debugger;
                        aAll[0].deferred.reject({ error:error });
                        return error;
                    }
                ).done();
            }else if( aAll.length > 1 ){
                var aPromises = [],
                    oIdMap    = {},
                    me        = this;

                for( var i=0,MAX_REQUESTS=50,l=Math.ceil(aAll.length/MAX_REQUESTS),oData={}; i<l; i++ ){
                    oData = this.buildBatchRequest(aAll.slice(i*MAX_REQUESTS,i*MAX_REQUESTS+MAX_REQUESTS));
                    aPromises.push( gcal.xhrWithAuth2(oData, true) );
                }
                for( var i=0,l=aAll.length,itm=null; i<l; i++ ){
                    itm = aAll[i];
                    oIdMap[itm.id] = itm;
                }

                return Q.allSettled(aPromises).then(
                    function(aResolved){
                        me.parseResponse(aResolved,oIdMap);
                    },
                    function( error ){
                        debugger;
                        return error;
                    }
                ).done();
            }
        },
    };

    gcal.encodeParams = function( obj ){
        var query = [];
        for( var prop in obj ){
            if( obj.hasOwnProperty(prop) ){
                query.push( encodeURIComponent(prop) + "=" + encodeURIComponent(obj[prop]) );
            }
        }
        return query.join('&');
    }

    gcal.xhrWithAuth  = xhrWithAuth;
    gcal.xhrWithAuth2 = xhrWithAuth2;
}(gcal); 
