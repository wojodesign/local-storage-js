(function(){
	var window = this;
	if( window.localStorage){
		window["save"] = function(name, value){
			localStorage[name] = value;
		};
		window["read"] = function(name){
			return localStorage[name];
		};
		window["clear"] = function(){
			localStorage.clear();
		};
		window["remove"] = function(name){
			return localStorage.removeItem(name);
		};
	} else if( navigator.cookieEnabled ){
		var expiresAt = 30*24*60*60,
			maxCookieSize = 4000,
		createCookie = function(name,value) {
			var date = new Date();
			date.setTime(date.getTime() + expiresAt);
			var expires = "; expires=" + date.toGMTString();
			document.cookie = name+"="+value+expires+"; path=/";
		},
		readCookie = function(name) {
			var nameEQ = name + "=";
			var ca = document.cookie.split(';');
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
			while(readCookie("storageData_"+x) !== null)
				data+=readCookie("storageData_"+x++);
			return data.split('++');
		},
		dataStringToCookies = function(data) {
			var cookiesUsed = Math.ceil(data.length/maxCookieSize),
			x=0;
			while(x<cookiesUsed || readCookie("storageData_"+x) !== null){
				if( x<cookiesUsed )
					createCookie("storageData_"+x, data.substr(x*maxCookieSize, ((x+1)*maxCookieSize>data.length ? data.length-x*maxCookieSize : maxCookieSize )));     
				else 
					eraseCookie("storageData_"+x);
				x++;
			}
		};
		window["save"] = function(name,value){
			var data=getAllCookieData(),x=0,xlen=data.length,exists=false;
			for(x=0;x<xlen;x++){
				var item = data[x].split("::");
				if( item[0] == name ){
					item[1] = value;
					exists=true;
					data[x] = item.join("::");
					x=xlen;
				}
			}
			if( !exists )
				data.push(name + "::" + value.replace(/::/g,": :").replace(/\+\+/g, "+ +") );
			
			dataStringToCookies( data.join("++") );
		};
		window["read"] = function(name){
			var data=getAllCookieData(),x=0,xlen=data.length,exists=false;
			for(x=0;x<xlen;x++){
				var item = data[x].split("::");
				if( item[0] == name && !!item[1])
					return item[1];
			}
			return null;
		};
		window["clear"] = function(){
			var x=0;
			while(readCookie("storageData_"+x) !== null)
				eraseCookie("storageData_"+x++);
		};
		window["remove"] = function(name){
			var data=getAllCookieData(),x=0,xlen=data.length,exists=false,tempData=[];
			for(x=0;x<xlen;x++){
				var item = data[x].split("::");
				if( item[0] != name )
					tempData.push(data[x]);
				else 
					exists=true;
			}
			if( !exists )
				return false;
			
			dataStringToCookies( tempData.join("++") );
		};
	} else {
		try{
			console.log("No local storage supported");
		} catch(err){}
	}
})();