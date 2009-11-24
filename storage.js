(function(){
	var window = this;
	if( typeof localStorage != 'undefined' && typeof sessionStorage != 'undefined' ){
		window["save"] = function(name, value){
			localStorage[name] = value;
		};
		window["read"] = function(name){
			return localStorage[name];
		};
	} else if( navigator.cookieEnabled ){
		var expiresAt = 30*24*60*60,
			maxCookieSize = 4000;
		var createCookie = function(name,value) {
			var date = new Date();
			date.setTime(date.getTime() + expiresAt);
			var expires = "; expires=" + date.toGMTString();
			document.cookie = name+"="+value+expires+"; path=/";
		};
		var readCookie = function(name) {
			var nameEQ = name + "=";
			var ca = document.cookie.split(';');
			for(var i=0,iLen=ca.length;i<iLen;i++) {
				var c = ca[i];
				while (c.charAt(0)==' ') c = c.substring(1,c.length);
				if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
			}
			return null;
		};
		var eraseCookie = function(name) {createCookie(name,"",-1);};
		window["save"] = function(name,value){
			var data="",x=0,xlen,exists=false;
			while(readCookie("storageData_"+x) !== null){
				data+=readCookie("storageData_"+x++);
			}
			data = data.split('++');
			xlen=data.length;
			for(x=0;x<xlen;x++){
				var item = data[x].split("::");
				if( item[0] == name ){
					item[1] = value;
					x=xlen;
					exists=true;
				}
			}
			if( !exists )
				data.push(name + "::" + value.replace(/::/g,": :").replace(/\+\+/g, "+ +") );
			
			data = data.join("++");
			var cookiesUsed = Math.ceil(data.length/maxCookieSize);
			x=0;
			while(x<cookiesUsed || readCookie("storageData_"+x) !== null){
				if( x<cookiesUsed )
					createCookie("storageData_"+x, data.substring(x*maxCookieSize, ((x+1)*maxCookieSize>data.length ? data.length-x*maxCookieSize : maxCookieSize )));     
				else 
					eraseCookie("storageData_"+x);
				x++;
			}
		};
		window["read"] = function(name){
			var data="",x=0,xlen,exists=false;
			while(readCookie("storageData_"+x) !== null)
				data+=readCookie("storageData_"+x++);
			
			data = data.split('++');
			xlen=data.length;
			for(x=0;x<xlen;x++){
				var item = data[x].split("::");
				if( item[0] == name && !!item[1]){
					return item[1];
				}
			}
			return null;
		};
	} else {
		try{
			console.log("No local storage supported");
		} catch(err){}
	}
})();