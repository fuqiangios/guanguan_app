/*! https://mths.be/punycode v1.4.1 by @mathias */
var t=/[^\x20-\x7E]/,e=/[\x2E\u3002\uFF0E\uFF61]/g,r={overflow:"Overflow: input needs wider integers to process","not-basic":"Illegal input >= 0x80 (not a basic code point)","invalid-input":"Invalid input"},n=Math.floor,o=String.fromCharCode;function a(t){throw new RangeError(r[t])}function h(t,e){return t+22+75*(26>t)-((0!=e)<<5)}function s(t,e,r){var o=0;for(t=r?n(t/700):t>>1,t+=n(t/e);t>455;o+=36)t=n(t/35);return n(o+36*t/(t+38))}function u(r){return function(t,r){var n=t.split("@"),o="";n.length>1&&(o=n[0]+"@",t=n[1]);var a=function(t,e){for(var r=t.length,n=[];r--;)n[r]=e(t[r]);return n}((t=t.replace(e,".")).split("."),r).join(".");return o+a}(r,(function(e){return t.test(e)?"xn--"+function(t){var e,r,u,i,l,p,c,f,m,v,g,y,d,b,j,O=[];for(y=(t=function(t){for(var e,r,n=[],o=0,a=t.length;a>o;)55296>(e=t.charCodeAt(o++))||e>56319||o>=a?n.push(e):56320==(64512&(r=t.charCodeAt(o++)))?n.push(((1023&e)<<10)+(1023&r)+65536):(n.push(e),o--);return n}(t)).length,e=128,r=0,l=72,p=0;y>p;++p)128>(g=t[p])&&O.push(o(g));for(u=i=O.length,i&&O.push("-");y>u;){for(c=2147483647,p=0;y>p;++p)(g=t[p])>=e&&c>g&&(c=g);for(c-e>n((2147483647-r)/(d=u+1))&&a("overflow"),r+=(c-e)*d,e=c,p=0;y>p;++p)if(e>(g=t[p])&&++r>2147483647&&a("overflow"),g==e){for(f=r,m=36;(v=m>l?l+26>m?m-l:26:1)<=f;m+=36)O.push(o(h(v+(j=f-v)%(b=36-v),0))),f=n(j/b);O.push(o(h(f,0))),l=s(r,d,u==i),r=0,++u}++r,++e}return O.join("")}(e):e}))}function i(t){return null===t}function l(t){return"string"==typeof t}function p(t){return"object"==typeof t&&null!==t}function c(t,e){return Object.prototype.hasOwnProperty.call(t,e)}var f=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)};function m(t){switch(typeof t){case"string":return t;case"boolean":return t?"true":"false";case"number":return isFinite(t)?t:"";default:return""}}function v(t,e){if(t.map)return t.map(e);for(var r=[],n=0;t.length>n;n++)r.push(e(t[n],n));return r}var g=Object.keys||function(t){var e=[];for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&e.push(r);return e};function y(t,e,r,n){r=r||"=";var o={};if("string"!=typeof t||0===t.length)return o;var a=/\+/g;t=t.split(e=e||"&");var h=1e3;n&&"number"==typeof n.maxKeys&&(h=n.maxKeys);var s=t.length;h>0&&s>h&&(s=h);for(var u=0;s>u;++u){var i,l,p,m,v=t[u].replace(a,"%20"),g=v.indexOf(r);0>g?(i=v,l=""):(i=v.substr(0,g),l=v.substr(g+1)),p=decodeURIComponent(i),m=decodeURIComponent(l),c(o,p)?f(o[p])?o[p].push(m):o[p]=[o[p],m]:o[p]=m}return o}var d={parse:F,resolve:function(t,e){return F(t,!1,!0).resolve(e)},resolveObject:function(t,e){return t?F(t,!1,!0).resolveObject(e):e},format:function(t){l(t)&&(t=$({},t));return z(t)},Url:b};function b(){this.protocol=null,this.slashes=null,this.auth=null,this.host=null,this.port=null,this.hostname=null,this.hash=null,this.search=null,this.query=null,this.pathname=null,this.path=null,this.href=null}var j=/^([a-z0-9.+-]+:)/i,O=/:[0-9]*$/,x=/^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,q=["{","}","|","\\","^","`"].concat(["<",">",'"',"`"," ","\r","\n","\t"]),C=["'"].concat(q),w=["%","/","?",";","#"].concat(C),A=["/","?","#"],I=/^[+a-z0-9A-Z_-]{0,63}$/,R=/^([+a-z0-9A-Z_-]{0,63})(.*)$/,U={javascript:!0,"javascript:":!0},k={javascript:!0,"javascript:":!0},E={http:!0,https:!0,ftp:!0,gopher:!0,file:!0,"http:":!0,"https:":!0,"ftp:":!0,"gopher:":!0,"file:":!0};function F(t,e,r){if(t&&p(t)&&t instanceof b)return t;var n=new b;return n.parse(t,e,r),n}function $(t,e,r,n){if(!l(e))throw new TypeError("Parameter 'url' must be a string, not "+typeof e);var o=e.indexOf("?"),a=-1!==o&&o<e.indexOf("#")?"?":"#",h=e.split(a);h[0]=h[0].replace(/\\/g,"/");var s=e=h.join(a);if(s=s.trim(),!n&&1===e.split("#").length){var i=x.exec(s);if(i)return t.path=s,t.href=s,t.pathname=i[1],i[2]?(t.search=i[2],t.query=r?y(t.search.substr(1)):t.search.substr(1)):r&&(t.search="",t.query={}),t}var p,c,f,m=j.exec(s);if(m){var v=(m=m[0]).toLowerCase();t.protocol=v,s=s.substr(m.length)}if(n||m||s.match(/^\/\/[^@\/]+@[^@\/]+/)){var g="//"===s.substr(0,2);!g||m&&k[m]||(s=s.substr(2),t.slashes=!0)}if(!k[m]&&(g||m&&!E[m])){var d,b,O=-1;for(p=0;A.length>p;p++)-1===(c=s.indexOf(A[p]))||-1!==O&&c>=O||(O=c);for(-1!==(b=-1===O?s.lastIndexOf("@"):s.lastIndexOf("@",O))&&(d=s.slice(0,b),s=s.slice(b+1),t.auth=decodeURIComponent(d)),O=-1,p=0;w.length>p;p++)-1===(c=s.indexOf(w[p]))||-1!==O&&c>=O||(O=c);-1===O&&(O=s.length),t.host=s.slice(0,O),s=s.slice(O),P(t),t.hostname=t.hostname||"";var q="["===t.hostname[0]&&"]"===t.hostname[t.hostname.length-1];if(!q){var F=t.hostname.split(/\./);for(p=0,f=F.length;f>p;p++){var $=F[p];if($&&!$.match(I)){for(var K="",L=0,S=$.length;S>L;L++)$.charCodeAt(L)>127?K+="x":K+=$[L];if(!K.match(I)){var Z=F.slice(0,p),_=F.slice(p+1),H=$.match(R);H&&(Z.push(H[1]),_.unshift(H[2])),_.length&&(s="/"+_.join(".")+s),t.hostname=Z.join(".");break}}}}t.hostname=t.hostname.length>255?"":t.hostname.toLowerCase(),q||(t.hostname=u(t.hostname)),t.host=(t.hostname||"")+(t.port?":"+t.port:""),t.href+=t.host,q&&(t.hostname=t.hostname.substr(1,t.hostname.length-2),"/"!==s[0]&&(s="/"+s))}if(!U[v])for(p=0,f=C.length;f>p;p++){var M=C[p];if(-1!==s.indexOf(M)){var T=encodeURIComponent(M);T===M&&(T=escape(M)),s=s.split(M).join(T)}}var B=s.indexOf("#");-1!==B&&(t.hash=s.substr(B),s=s.slice(0,B));var D=s.indexOf("?");(-1!==D?(t.search=s.substr(D),t.query=s.substr(D+1),r&&(t.query=y(t.query)),s=s.slice(0,D)):r&&(t.search="",t.query={}),s&&(t.pathname=s),E[v]&&t.hostname&&!t.pathname&&(t.pathname="/"),t.pathname||t.search)&&(t.path=(t.pathname||"")+(t.search||""));return t.href=z(t),t}function z(t){var e=t.auth||"";e&&(e=(e=encodeURIComponent(e)).replace(/%3A/i,":"),e+="@");var r,n,o,a,h=t.protocol||"",s=t.pathname||"",u=t.hash||"",i=!1,l="";t.host?i=e+t.host:t.hostname&&(i=e+(-1===t.hostname.indexOf(":")?t.hostname:"["+this.hostname+"]"),t.port&&(i+=":"+t.port)),t.query&&p(t.query)&&Object.keys(t.query).length&&(n=n||"&",o=o||"=",null===(r=t.query)&&(r=void 0),l="object"==typeof r?v(g(r),(function(t){var e=encodeURIComponent(m(t))+o;return f(r[t])?v(r[t],(function(t){return e+encodeURIComponent(m(t))})).join(n):e+encodeURIComponent(m(r[t]))})).join(n):a?encodeURIComponent(m(a))+o+encodeURIComponent(m(r)):"");var c=t.search||l&&"?"+l||"";return h&&":"!==h.substr(-1)&&(h+=":"),t.slashes||(!h||E[h])&&!1!==i?(i="//"+(i||""),s&&"/"!==s.charAt(0)&&(s="/"+s)):i||(i=""),u&&"#"!==u.charAt(0)&&(u="#"+u),c&&"?"!==c.charAt(0)&&(c="?"+c),h+i+(s=s.replace(/[?#]/g,(function(t){return encodeURIComponent(t)})))+(c=c.replace("#","%23"))+u}function P(t){var e=t.host,r=O.exec(e);r&&(":"!==(r=r[0])&&(t.port=r.substr(1)),e=e.substr(0,e.length-r.length)),e&&(t.hostname=e)}b.prototype.parse=function(t,e,r){return $(this,t,e,r)},b.prototype.format=function(){return z(this)},b.prototype.resolve=function(t){return this.resolveObject(F(t,!1,!0)).format()},b.prototype.resolveObject=function(t){if(l(t)){var e=new b;e.parse(t,!1,!0),t=e}for(var r,n=new b,o=Object.keys(this),a=0;o.length>a;a++){var h=o[a];n[h]=this[h]}if(n.hash=t.hash,""===t.href)return n.href=n.format(),n;if(t.slashes&&!t.protocol){for(var s=Object.keys(t),u=0;s.length>u;u++){var p=s[u];"protocol"!==p&&(n[p]=t[p])}return E[n.protocol]&&n.hostname&&!n.pathname&&(n.path=n.pathname="/"),n.href=n.format(),n}if(t.protocol&&t.protocol!==n.protocol){if(!E[t.protocol]){for(var c=Object.keys(t),f=0;c.length>f;f++){var m=c[f];n[m]=t[m]}return n.href=n.format(),n}if(n.protocol=t.protocol,t.host||k[t.protocol])n.pathname=t.pathname;else{for(r=(t.pathname||"").split("/");r.length&&!(t.host=r.shift()););t.host||(t.host=""),t.hostname||(t.hostname=""),""!==r[0]&&r.unshift(""),2>r.length&&r.unshift(""),n.pathname=r.join("/")}if(n.search=t.search,n.query=t.query,n.host=t.host||"",n.auth=t.auth,n.hostname=t.hostname||t.host,n.port=t.port,n.pathname||n.search)n.path=(n.pathname||"")+(n.search||"");return n.slashes=n.slashes||t.slashes,n.href=n.format(),n}var v,g=n.pathname&&"/"===n.pathname.charAt(0),y=t.host||t.pathname&&"/"===t.pathname.charAt(0),d=y||g||n.host&&t.pathname,j=d,O=n.pathname&&n.pathname.split("/")||[],x=n.protocol&&!E[n.protocol];if(r=t.pathname&&t.pathname.split("/")||[],x&&(n.hostname="",n.port=null,n.host&&(""===O[0]?O[0]=n.host:O.unshift(n.host)),n.host="",t.protocol&&(t.hostname=null,t.port=null,t.host&&(""===r[0]?r[0]=t.host:r.unshift(t.host)),t.host=null),d=d&&(""===r[0]||""===O[0])),y)n.host=t.host||""===t.host?t.host:n.host,n.hostname=t.hostname||""===t.hostname?t.hostname:n.hostname,n.search=t.search,n.query=t.query,O=r;else if(r.length)O||(O=[]),O.pop(),O=O.concat(r),n.search=t.search,n.query=t.query;else if(null!=t.search)return x&&(n.hostname=n.host=O.shift(),(v=!(!n.host||0>=n.host.indexOf("@"))&&n.host.split("@"))&&(n.auth=v.shift(),n.host=n.hostname=v.shift())),n.search=t.search,n.query=t.query,i(n.pathname)&&i(n.search)||(n.path=(n.pathname?n.pathname:"")+(n.search?n.search:"")),n.href=n.format(),n;if(!O.length)return n.pathname=null,n.path=n.search?"/"+n.search:null,n.href=n.format(),n;for(var q=O.slice(-1)[0],C=(n.host||t.host||O.length>1)&&("."===q||".."===q)||""===q,w=0,A=O.length;A>=0;A--)"."===(q=O[A])?O.splice(A,1):".."===q?(O.splice(A,1),w++):w&&(O.splice(A,1),w--);if(!d&&!j)for(;w--;w)O.unshift("..");!d||""===O[0]||O[0]&&"/"===O[0].charAt(0)||O.unshift(""),C&&"/"!==O.join("/").substr(-1)&&O.push("");var I=""===O[0]||O[0]&&"/"===O[0].charAt(0);return x&&(n.hostname=n.host=I?"":O.length?O.shift():"",(v=!(!n.host||0>=n.host.indexOf("@"))&&n.host.split("@"))&&(n.auth=v.shift(),n.host=n.hostname=v.shift())),(d=d||n.host&&O.length)&&!I&&O.unshift(""),O.length?n.pathname=O.join("/"):(n.pathname=null,n.path=null),i(n.pathname)&&i(n.search)||(n.path=(n.pathname?n.pathname:"")+(n.search?n.search:"")),n.auth=t.auth||n.auth,n.slashes=n.slashes||t.slashes,n.href=n.format(),n},b.prototype.parseHost=function(){return P(this)};export default d;
