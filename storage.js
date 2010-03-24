/*
Copyright (c) 2009 The Wojo Group

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
(function(){
	var window = this;
	if( !window.localStorage && navigator.cookieEnabled ){		
		var expiresAt = 30*24*60*60,
			maxCookieSize = 4000,
			prefix = "storageData_",
			nameValueDelim = "::",
			itemDelim = "++",
		
		createCookie = function(name,value,expire) {
			var date = new Date();
			date.setTime(date.getTime() + expire);
			var expires = "; expires=" + date.toGMTString();
			document.cookie = name+"="+value+expires+"; path=/";
		},
		readCookie = function(name) {
			var nameEQ = name + "=", ca = document.cookie.split(';');
			for(var i=0,iLen=ca.length;i<iLen;i++) {
				var c = ca[i];
				while (c.charAt(0)==' ') c = c.substring(1,c.length);
				if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
			}
			return null;
		},
		eraseCookie = function(name) {createCookie(name,"",-1);},
		getAllCookieData = function(){
			var data="",x=0;
			while(readCookie(prefix+x) !== null)
				data+=readCookie(prefix+x++);
			return data == "" ? [] : data.split('++');
		},
		dataStringToCookies = function(data) {
			var cookiesUsed = Math.ceil(data.length/maxCookieSize),
				x=0;
			while(x<cookiesUsed || readCookie(prefix+x) !== null){
				if( x<cookiesUsed )
					createCookie(prefix+x, data.substr(x*maxCookieSize, ((x+1)*maxCookieSize>data.length ? data.length-x*maxCookieSize : maxCookieSize )), expiresAt);     
				else 
					eraseCookie(prefix+x);
				x++;
			}
		},
		

		localStorage = window["localStorage"] = {
			"length":0,
			"setItem":function( key , value ){
				var data=getAllCookieData(),x=0,xlen=data.length,exists=false;
				for(x=0;x<xlen;x++){
					var item = data[x].split(nameValueDelim);
					if( item[0] == key ){
						item[1] = value;
						exists=true;
						data[x] = item.join(nameValueDelim);
						x=xlen;
					}
				}
				if( !exists ){
					data.push(key + nameValueDelim + value.replace(/::/g,": :").replace(/\+\+/g, "+ +") );
					this.keys.push(key);
					this["length"]++;
				}

				dataStringToCookies( data.join(itemDelim) );
			},
			"getItem":function( key ){
				var data=getAllCookieData(),x=0,xlen=data.length,exists=false;
				for(x=0;x<xlen;x++){
					var item = data[x].split(nameValueDelim);
					if( item[0] == key && !!item[1])
						return item[1];
				}
				return null;
			},
			"removeItem":function( key ){
				var data=getAllCookieData(),x=0,xlen=data.length,exists=false,tempData=[];
				for(x=0;x<xlen;x++){
					var item = data[x].split(nameValueDelim);
					if( item[0] != key )
						tempData.push(data[x]);
					else 
						exists=true;
				}
				if( !exists )
					return;

				dataStringToCookies( tempData.join(itemDelim) );
				setKeysAndLength();
			},
			
			"clear":function(){
				var x=0;
				while(readCookie(prefix+x) !== null)
					eraseCookie(prefix+x++);
				this.keys = [];
				this["length"] = 0;
			}, 
			
			"key":function( key ){
				return key<this["length"] ? this.keys[key] : null;
			},
			
			keys: []

		},
		
		setKeysAndLength = function(){
			localStorage.keys = getAllCookieData();
			var x=0;
			while( localStorage.keys[x] )
				localStorage.keys[x] = localStorage.keys[x++].split("::")[0];

			localStorage["length"] = localStorage.keys.length;
		};
		
		setKeysAndLength();

	} 
})();