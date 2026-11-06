// Copyright (c) 2026 fanmod
// First-party code: MIT (see LICENSE). Third-party notices: THIRD_PARTY_NOTICES.txt.
/* MisanScramble v1.4. One standalone API file; no network or backend.

 * process(mode,input,cover,key,output,progress) -> Promise<Result>.

 * pic-scramble MIT, Gilbert BSD-2-Clause, pako MIT/Zlib, UPNG MIT.

 * Full notices are included in THIRD_PARTY_NOTICES.txt. CFT2/15 wire format retained.

 */

(function(host){'use strict';

const scriptURL=typeof document!=='undefined'&&document.currentScript?document.currentScript.src:null;

const __cf={};





(function(){let exports={},module={exports};

/*! pako 2.1.0 https://github.com/nodeca/pako @license (MIT AND Zlib) */

!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).pako={})}(this,(function(t){"use strict";function e(t){let e=t.length;for(;--e>=0;)t[e]=0}const a=256,i=286,n=30,s=15,r=new Uint8Array([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0]),o=new Uint8Array([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13]),l=new Uint8Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7]),h=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),d=new Array(576);e(d);const _=new Array(60);e(_);const f=new Array(512);e(f);const c=new Array(256);e(c);const u=new Array(29);e(u);const w=new Array(n);function m(t,e,a,i,n){this.static_tree=t,this.extra_bits=e,this.extra_base=a,this.elems=i,this.max_length=n,this.has_stree=t&&t.length}let b,g,p;function k(t,e){this.dyn_tree=t,this.max_code=0,this.stat_desc=e}e(w);const v=t=>t<256?f[t]:f[256+(t>>>7)],y=(t,e)=>{t.pending_buf[t.pending++]=255&e,t.pending_buf[t.pending++]=e>>>8&255},x=(t,e,a)=>{t.bi_valid>16-a?(t.bi_buf|=e<<t.bi_valid&65535,y(t,t.bi_buf),t.bi_buf=e>>16-t.bi_valid,t.bi_valid+=a-16):(t.bi_buf|=e<<t.bi_valid&65535,t.bi_valid+=a)},z=(t,e,a)=>{x(t,a[2*e],a[2*e+1])},A=(t,e)=>{let a=0;do{a|=1&t,t>>>=1,a<<=1}while(--e>0);return a>>>1},E=(t,e,a)=>{const i=new Array(16);let n,r,o=0;for(n=1;n<=s;n++)o=o+a[n-1]<<1,i[n]=o;for(r=0;r<=e;r++){let e=t[2*r+1];0!==e&&(t[2*r]=A(i[e]++,e))}},R=t=>{let e;for(e=0;e<i;e++)t.dyn_ltree[2*e]=0;for(e=0;e<n;e++)t.dyn_dtree[2*e]=0;for(e=0;e<19;e++)t.bl_tree[2*e]=0;t.dyn_ltree[512]=1,t.opt_len=t.static_len=0,t.sym_next=t.matches=0},Z=t=>{t.bi_valid>8?y(t,t.bi_buf):t.bi_valid>0&&(t.pending_buf[t.pending++]=t.bi_buf),t.bi_buf=0,t.bi_valid=0},U=(t,e,a,i)=>{const n=2*e,s=2*a;return t[n]<t[s]||t[n]===t[s]&&i[e]<=i[a]},S=(t,e,a)=>{const i=t.heap[a];let n=a<<1;for(;n<=t.heap_len&&(n<t.heap_len&&U(e,t.heap[n+1],t.heap[n],t.depth)&&n++,!U(e,i,t.heap[n],t.depth));)t.heap[a]=t.heap[n],a=n,n<<=1;t.heap[a]=i},D=(t,e,i)=>{let n,s,l,h,d=0;if(0!==t.sym_next)do{n=255&t.pending_buf[t.sym_buf+d++],n+=(255&t.pending_buf[t.sym_buf+d++])<<8,s=t.pending_buf[t.sym_buf+d++],0===n?z(t,s,e):(l=c[s],z(t,l+a+1,e),h=r[l],0!==h&&(s-=u[l],x(t,s,h)),n--,l=v(n),z(t,l,i),h=o[l],0!==h&&(n-=w[l],x(t,n,h)))}while(d<t.sym_next);z(t,256,e)},T=(t,e)=>{const a=e.dyn_tree,i=e.stat_desc.static_tree,n=e.stat_desc.has_stree,r=e.stat_desc.elems;let o,l,h,d=-1;for(t.heap_len=0,t.heap_max=573,o=0;o<r;o++)0!==a[2*o]?(t.heap[++t.heap_len]=d=o,t.depth[o]=0):a[2*o+1]=0;for(;t.heap_len<2;)h=t.heap[++t.heap_len]=d<2?++d:0,a[2*h]=1,t.depth[h]=0,t.opt_len--,n&&(t.static_len-=i[2*h+1]);for(e.max_code=d,o=t.heap_len>>1;o>=1;o--)S(t,a,o);h=r;do{o=t.heap[1],t.heap[1]=t.heap[t.heap_len--],S(t,a,1),l=t.heap[1],t.heap[--t.heap_max]=o,t.heap[--t.heap_max]=l,a[2*h]=a[2*o]+a[2*l],t.depth[h]=(t.depth[o]>=t.depth[l]?t.depth[o]:t.depth[l])+1,a[2*o+1]=a[2*l+1]=h,t.heap[1]=h++,S(t,a,1)}while(t.heap_len>=2);t.heap[--t.heap_max]=t.heap[1],((t,e)=>{const a=e.dyn_tree,i=e.max_code,n=e.stat_desc.static_tree,r=e.stat_desc.has_stree,o=e.stat_desc.extra_bits,l=e.stat_desc.extra_base,h=e.stat_desc.max_length;let d,_,f,c,u,w,m=0;for(c=0;c<=s;c++)t.bl_count[c]=0;for(a[2*t.heap[t.heap_max]+1]=0,d=t.heap_max+1;d<573;d++)_=t.heap[d],c=a[2*a[2*_+1]+1]+1,c>h&&(c=h,m++),a[2*_+1]=c,_>i||(t.bl_count[c]++,u=0,_>=l&&(u=o[_-l]),w=a[2*_],t.opt_len+=w*(c+u),r&&(t.static_len+=w*(n[2*_+1]+u)));if(0!==m){do{for(c=h-1;0===t.bl_count[c];)c--;t.bl_count[c]--,t.bl_count[c+1]+=2,t.bl_count[h]--,m-=2}while(m>0);for(c=h;0!==c;c--)for(_=t.bl_count[c];0!==_;)f=t.heap[--d],f>i||(a[2*f+1]!==c&&(t.opt_len+=(c-a[2*f+1])*a[2*f],a[2*f+1]=c),_--)}})(t,e),E(a,d,t.bl_count)},O=(t,e,a)=>{let i,n,s=-1,r=e[1],o=0,l=7,h=4;for(0===r&&(l=138,h=3),e[2*(a+1)+1]=65535,i=0;i<=a;i++)n=r,r=e[2*(i+1)+1],++o<l&&n===r||(o<h?t.bl_tree[2*n]+=o:0!==n?(n!==s&&t.bl_tree[2*n]++,t.bl_tree[32]++):o<=10?t.bl_tree[34]++:t.bl_tree[36]++,o=0,s=n,0===r?(l=138,h=3):n===r?(l=6,h=3):(l=7,h=4))},I=(t,e,a)=>{let i,n,s=-1,r=e[1],o=0,l=7,h=4;for(0===r&&(l=138,h=3),i=0;i<=a;i++)if(n=r,r=e[2*(i+1)+1],!(++o<l&&n===r)){if(o<h)do{z(t,n,t.bl_tree)}while(0!=--o);else 0!==n?(n!==s&&(z(t,n,t.bl_tree),o--),z(t,16,t.bl_tree),x(t,o-3,2)):o<=10?(z(t,17,t.bl_tree),x(t,o-3,3)):(z(t,18,t.bl_tree),x(t,o-11,7));o=0,s=n,0===r?(l=138,h=3):n===r?(l=6,h=3):(l=7,h=4)}};let F=!1;const L=(t,e,a,i)=>{x(t,0+(i?1:0),3),Z(t),y(t,a),y(t,~a),a&&t.pending_buf.set(t.window.subarray(e,e+a),t.pending),t.pending+=a};var N=(t,e,i,n)=>{let s,r,o=0;t.level>0?(2===t.strm.data_type&&(t.strm.data_type=(t=>{let e,i=4093624447;for(e=0;e<=31;e++,i>>>=1)if(1&i&&0!==t.dyn_ltree[2*e])return 0;if(0!==t.dyn_ltree[18]||0!==t.dyn_ltree[20]||0!==t.dyn_ltree[26])return 1;for(e=32;e<a;e++)if(0!==t.dyn_ltree[2*e])return 1;return 0})(t)),T(t,t.l_desc),T(t,t.d_desc),o=(t=>{let e;for(O(t,t.dyn_ltree,t.l_desc.max_code),O(t,t.dyn_dtree,t.d_desc.max_code),T(t,t.bl_desc),e=18;e>=3&&0===t.bl_tree[2*h[e]+1];e--);return t.opt_len+=3*(e+1)+5+5+4,e})(t),s=t.opt_len+3+7>>>3,r=t.static_len+3+7>>>3,r<=s&&(s=r)):s=r=i+5,i+4<=s&&-1!==e?L(t,e,i,n):4===t.strategy||r===s?(x(t,2+(n?1:0),3),D(t,d,_)):(x(t,4+(n?1:0),3),((t,e,a,i)=>{let n;for(x(t,e-257,5),x(t,a-1,5),x(t,i-4,4),n=0;n<i;n++)x(t,t.bl_tree[2*h[n]+1],3);I(t,t.dyn_ltree,e-1),I(t,t.dyn_dtree,a-1)})(t,t.l_desc.max_code+1,t.d_desc.max_code+1,o+1),D(t,t.dyn_ltree,t.dyn_dtree)),R(t),n&&Z(t)},B={_tr_init:t=>{F||((()=>{let t,e,a,h,k;const v=new Array(16);for(a=0,h=0;h<28;h++)for(u[h]=a,t=0;t<1<<r[h];t++)c[a++]=h;for(c[a-1]=h,k=0,h=0;h<16;h++)for(w[h]=k,t=0;t<1<<o[h];t++)f[k++]=h;for(k>>=7;h<n;h++)for(w[h]=k<<7,t=0;t<1<<o[h]-7;t++)f[256+k++]=h;for(e=0;e<=s;e++)v[e]=0;for(t=0;t<=143;)d[2*t+1]=8,t++,v[8]++;for(;t<=255;)d[2*t+1]=9,t++,v[9]++;for(;t<=279;)d[2*t+1]=7,t++,v[7]++;for(;t<=287;)d[2*t+1]=8,t++,v[8]++;for(E(d,287,v),t=0;t<n;t++)_[2*t+1]=5,_[2*t]=A(t,5);b=new m(d,r,257,i,s),g=new m(_,o,0,n,s),p=new m(new Array(0),l,0,19,7)})(),F=!0),t.l_desc=new k(t.dyn_ltree,b),t.d_desc=new k(t.dyn_dtree,g),t.bl_desc=new k(t.bl_tree,p),t.bi_buf=0,t.bi_valid=0,R(t)},_tr_stored_block:L,_tr_flush_block:N,_tr_tally:(t,e,i)=>(t.pending_buf[t.sym_buf+t.sym_next++]=e,t.pending_buf[t.sym_buf+t.sym_next++]=e>>8,t.pending_buf[t.sym_buf+t.sym_next++]=i,0===e?t.dyn_ltree[2*i]++:(t.matches++,e--,t.dyn_ltree[2*(c[i]+a+1)]++,t.dyn_dtree[2*v(e)]++),t.sym_next===t.sym_end),_tr_align:t=>{x(t,2,3),z(t,256,d),(t=>{16===t.bi_valid?(y(t,t.bi_buf),t.bi_buf=0,t.bi_valid=0):t.bi_valid>=8&&(t.pending_buf[t.pending++]=255&t.bi_buf,t.bi_buf>>=8,t.bi_valid-=8)})(t)}};var C=(t,e,a,i)=>{let n=65535&t|0,s=t>>>16&65535|0,r=0;for(;0!==a;){r=a>2e3?2e3:a,a-=r;do{n=n+e[i++]|0,s=s+n|0}while(--r);n%=65521,s%=65521}return n|s<<16|0};const M=new Uint32Array((()=>{let t,e=[];for(var a=0;a<256;a++){t=a;for(var i=0;i<8;i++)t=1&t?3988292384^t>>>1:t>>>1;e[a]=t}return e})());var H=(t,e,a,i)=>{const n=M,s=i+a;t^=-1;for(let a=i;a<s;a++)t=t>>>8^n[255&(t^e[a])];return-1^t},j={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"},K={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_MEM_ERROR:-4,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8};const{_tr_init:P,_tr_stored_block:Y,_tr_flush_block:G,_tr_tally:X,_tr_align:W}=B,{Z_NO_FLUSH:q,Z_PARTIAL_FLUSH:J,Z_FULL_FLUSH:Q,Z_FINISH:V,Z_BLOCK:$,Z_OK:tt,Z_STREAM_END:et,Z_STREAM_ERROR:at,Z_DATA_ERROR:it,Z_BUF_ERROR:nt,Z_DEFAULT_COMPRESSION:st,Z_FILTERED:rt,Z_HUFFMAN_ONLY:ot,Z_RLE:lt,Z_FIXED:ht,Z_DEFAULT_STRATEGY:dt,Z_UNKNOWN:_t,Z_DEFLATED:ft}=K,ct=258,ut=262,wt=42,mt=113,bt=666,gt=(t,e)=>(t.msg=j[e],e),pt=t=>2*t-(t>4?9:0),kt=t=>{let e=t.length;for(;--e>=0;)t[e]=0},vt=t=>{let e,a,i,n=t.w_size;e=t.hash_size,i=e;do{a=t.head[--i],t.head[i]=a>=n?a-n:0}while(--e);e=n,i=e;do{a=t.prev[--i],t.prev[i]=a>=n?a-n:0}while(--e)};let yt=(t,e,a)=>(e<<t.hash_shift^a)&t.hash_mask;const xt=t=>{const e=t.state;let a=e.pending;a>t.avail_out&&(a=t.avail_out),0!==a&&(t.output.set(e.pending_buf.subarray(e.pending_out,e.pending_out+a),t.next_out),t.next_out+=a,e.pending_out+=a,t.total_out+=a,t.avail_out-=a,e.pending-=a,0===e.pending&&(e.pending_out=0))},zt=(t,e)=>{G(t,t.block_start>=0?t.block_start:-1,t.strstart-t.block_start,e),t.block_start=t.strstart,xt(t.strm)},At=(t,e)=>{t.pending_buf[t.pending++]=e},Et=(t,e)=>{t.pending_buf[t.pending++]=e>>>8&255,t.pending_buf[t.pending++]=255&e},Rt=(t,e,a,i)=>{let n=t.avail_in;return n>i&&(n=i),0===n?0:(t.avail_in-=n,e.set(t.input.subarray(t.next_in,t.next_in+n),a),1===t.state.wrap?t.adler=C(t.adler,e,n,a):2===t.state.wrap&&(t.adler=H(t.adler,e,n,a)),t.next_in+=n,t.total_in+=n,n)},Zt=(t,e)=>{let a,i,n=t.max_chain_length,s=t.strstart,r=t.prev_length,o=t.nice_match;const l=t.strstart>t.w_size-ut?t.strstart-(t.w_size-ut):0,h=t.window,d=t.w_mask,_=t.prev,f=t.strstart+ct;let c=h[s+r-1],u=h[s+r];t.prev_length>=t.good_match&&(n>>=2),o>t.lookahead&&(o=t.lookahead);do{if(a=e,h[a+r]===u&&h[a+r-1]===c&&h[a]===h[s]&&h[++a]===h[s+1]){s+=2,a++;do{}while(h[++s]===h[++a]&&h[++s]===h[++a]&&h[++s]===h[++a]&&h[++s]===h[++a]&&h[++s]===h[++a]&&h[++s]===h[++a]&&h[++s]===h[++a]&&h[++s]===h[++a]&&s<f);if(i=ct-(f-s),s=f-ct,i>r){if(t.match_start=e,r=i,i>=o)break;c=h[s+r-1],u=h[s+r]}}}while((e=_[e&d])>l&&0!=--n);return r<=t.lookahead?r:t.lookahead},Ut=t=>{const e=t.w_size;let a,i,n;do{if(i=t.window_size-t.lookahead-t.strstart,t.strstart>=e+(e-ut)&&(t.window.set(t.window.subarray(e,e+e-i),0),t.match_start-=e,t.strstart-=e,t.block_start-=e,t.insert>t.strstart&&(t.insert=t.strstart),vt(t),i+=e),0===t.strm.avail_in)break;if(a=Rt(t.strm,t.window,t.strstart+t.lookahead,i),t.lookahead+=a,t.lookahead+t.insert>=3)for(n=t.strstart-t.insert,t.ins_h=t.window[n],t.ins_h=yt(t,t.ins_h,t.window[n+1]);t.insert&&(t.ins_h=yt(t,t.ins_h,t.window[n+3-1]),t.prev[n&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=n,n++,t.insert--,!(t.lookahead+t.insert<3)););}while(t.lookahead<ut&&0!==t.strm.avail_in)},St=(t,e)=>{let a,i,n,s=t.pending_buf_size-5>t.w_size?t.w_size:t.pending_buf_size-5,r=0,o=t.strm.avail_in;do{if(a=65535,n=t.bi_valid+42>>3,t.strm.avail_out<n)break;if(n=t.strm.avail_out-n,i=t.strstart-t.block_start,a>i+t.strm.avail_in&&(a=i+t.strm.avail_in),a>n&&(a=n),a<s&&(0===a&&e!==V||e===q||a!==i+t.strm.avail_in))break;r=e===V&&a===i+t.strm.avail_in?1:0,Y(t,0,0,r),t.pending_buf[t.pending-4]=a,t.pending_buf[t.pending-3]=a>>8,t.pending_buf[t.pending-2]=~a,t.pending_buf[t.pending-1]=~a>>8,xt(t.strm),i&&(i>a&&(i=a),t.strm.output.set(t.window.subarray(t.block_start,t.block_start+i),t.strm.next_out),t.strm.next_out+=i,t.strm.avail_out-=i,t.strm.total_out+=i,t.block_start+=i,a-=i),a&&(Rt(t.strm,t.strm.output,t.strm.next_out,a),t.strm.next_out+=a,t.strm.avail_out-=a,t.strm.total_out+=a)}while(0===r);return o-=t.strm.avail_in,o&&(o>=t.w_size?(t.matches=2,t.window.set(t.strm.input.subarray(t.strm.next_in-t.w_size,t.strm.next_in),0),t.strstart=t.w_size,t.insert=t.strstart):(t.window_size-t.strstart<=o&&(t.strstart-=t.w_size,t.window.set(t.window.subarray(t.w_size,t.w_size+t.strstart),0),t.matches<2&&t.matches++,t.insert>t.strstart&&(t.insert=t.strstart)),t.window.set(t.strm.input.subarray(t.strm.next_in-o,t.strm.next_in),t.strstart),t.strstart+=o,t.insert+=o>t.w_size-t.insert?t.w_size-t.insert:o),t.block_start=t.strstart),t.high_water<t.strstart&&(t.high_water=t.strstart),r?4:e!==q&&e!==V&&0===t.strm.avail_in&&t.strstart===t.block_start?2:(n=t.window_size-t.strstart,t.strm.avail_in>n&&t.block_start>=t.w_size&&(t.block_start-=t.w_size,t.strstart-=t.w_size,t.window.set(t.window.subarray(t.w_size,t.w_size+t.strstart),0),t.matches<2&&t.matches++,n+=t.w_size,t.insert>t.strstart&&(t.insert=t.strstart)),n>t.strm.avail_in&&(n=t.strm.avail_in),n&&(Rt(t.strm,t.window,t.strstart,n),t.strstart+=n,t.insert+=n>t.w_size-t.insert?t.w_size-t.insert:n),t.high_water<t.strstart&&(t.high_water=t.strstart),n=t.bi_valid+42>>3,n=t.pending_buf_size-n>65535?65535:t.pending_buf_size-n,s=n>t.w_size?t.w_size:n,i=t.strstart-t.block_start,(i>=s||(i||e===V)&&e!==q&&0===t.strm.avail_in&&i<=n)&&(a=i>n?n:i,r=e===V&&0===t.strm.avail_in&&a===i?1:0,Y(t,t.block_start,a,r),t.block_start+=a,xt(t.strm)),r?3:1)},Dt=(t,e)=>{let a,i;for(;;){if(t.lookahead<ut){if(Ut(t),t.lookahead<ut&&e===q)return 1;if(0===t.lookahead)break}if(a=0,t.lookahead>=3&&(t.ins_h=yt(t,t.ins_h,t.window[t.strstart+3-1]),a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),0!==a&&t.strstart-a<=t.w_size-ut&&(t.match_length=Zt(t,a)),t.match_length>=3)if(i=X(t,t.strstart-t.match_start,t.match_length-3),t.lookahead-=t.match_length,t.match_length<=t.max_lazy_match&&t.lookahead>=3){t.match_length--;do{t.strstart++,t.ins_h=yt(t,t.ins_h,t.window[t.strstart+3-1]),a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart}while(0!=--t.match_length);t.strstart++}else t.strstart+=t.match_length,t.match_length=0,t.ins_h=t.window[t.strstart],t.ins_h=yt(t,t.ins_h,t.window[t.strstart+1]);else i=X(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++;if(i&&(zt(t,!1),0===t.strm.avail_out))return 1}return t.insert=t.strstart<2?t.strstart:2,e===V?(zt(t,!0),0===t.strm.avail_out?3:4):t.sym_next&&(zt(t,!1),0===t.strm.avail_out)?1:2},Tt=(t,e)=>{let a,i,n;for(;;){if(t.lookahead<ut){if(Ut(t),t.lookahead<ut&&e===q)return 1;if(0===t.lookahead)break}if(a=0,t.lookahead>=3&&(t.ins_h=yt(t,t.ins_h,t.window[t.strstart+3-1]),a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),t.prev_length=t.match_length,t.prev_match=t.match_start,t.match_length=2,0!==a&&t.prev_length<t.max_lazy_match&&t.strstart-a<=t.w_size-ut&&(t.match_length=Zt(t,a),t.match_length<=5&&(t.strategy===rt||3===t.match_length&&t.strstart-t.match_start>4096)&&(t.match_length=2)),t.prev_length>=3&&t.match_length<=t.prev_length){n=t.strstart+t.lookahead-3,i=X(t,t.strstart-1-t.prev_match,t.prev_length-3),t.lookahead-=t.prev_length-1,t.prev_length-=2;do{++t.strstart<=n&&(t.ins_h=yt(t,t.ins_h,t.window[t.strstart+3-1]),a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart)}while(0!=--t.prev_length);if(t.match_available=0,t.match_length=2,t.strstart++,i&&(zt(t,!1),0===t.strm.avail_out))return 1}else if(t.match_available){if(i=X(t,0,t.window[t.strstart-1]),i&&zt(t,!1),t.strstart++,t.lookahead--,0===t.strm.avail_out)return 1}else t.match_available=1,t.strstart++,t.lookahead--}return t.match_available&&(i=X(t,0,t.window[t.strstart-1]),t.match_available=0),t.insert=t.strstart<2?t.strstart:2,e===V?(zt(t,!0),0===t.strm.avail_out?3:4):t.sym_next&&(zt(t,!1),0===t.strm.avail_out)?1:2};function Ot(t,e,a,i,n){this.good_length=t,this.max_lazy=e,this.nice_length=a,this.max_chain=i,this.func=n}const It=[new Ot(0,0,0,0,St),new Ot(4,4,8,4,Dt),new Ot(4,5,16,8,Dt),new Ot(4,6,32,32,Dt),new Ot(4,4,16,16,Tt),new Ot(8,16,32,32,Tt),new Ot(8,16,128,128,Tt),new Ot(8,32,128,256,Tt),new Ot(32,128,258,1024,Tt),new Ot(32,258,258,4096,Tt)];function Ft(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=ft,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new Uint16Array(1146),this.dyn_dtree=new Uint16Array(122),this.bl_tree=new Uint16Array(78),kt(this.dyn_ltree),kt(this.dyn_dtree),kt(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new Uint16Array(16),this.heap=new Uint16Array(573),kt(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new Uint16Array(573),kt(this.depth),this.sym_buf=0,this.lit_bufsize=0,this.sym_next=0,this.sym_end=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}const Lt=t=>{if(!t)return 1;const e=t.state;return!e||e.strm!==t||e.status!==wt&&57!==e.status&&69!==e.status&&73!==e.status&&91!==e.status&&103!==e.status&&e.status!==mt&&e.status!==bt?1:0},Nt=t=>{if(Lt(t))return gt(t,at);t.total_in=t.total_out=0,t.data_type=_t;const e=t.state;return e.pending=0,e.pending_out=0,e.wrap<0&&(e.wrap=-e.wrap),e.status=2===e.wrap?57:e.wrap?wt:mt,t.adler=2===e.wrap?0:1,e.last_flush=-2,P(e),tt},Bt=t=>{const e=Nt(t);var a;return e===tt&&((a=t.state).window_size=2*a.w_size,kt(a.head),a.max_lazy_match=It[a.level].max_lazy,a.good_match=It[a.level].good_length,a.nice_match=It[a.level].nice_length,a.max_chain_length=It[a.level].max_chain,a.strstart=0,a.block_start=0,a.lookahead=0,a.insert=0,a.match_length=a.prev_length=2,a.match_available=0,a.ins_h=0),e},Ct=(t,e,a,i,n,s)=>{if(!t)return at;let r=1;if(e===st&&(e=6),i<0?(r=0,i=-i):i>15&&(r=2,i-=16),n<1||n>9||a!==ft||i<8||i>15||e<0||e>9||s<0||s>ht||8===i&&1!==r)return gt(t,at);8===i&&(i=9);const o=new Ft;return t.state=o,o.strm=t,o.status=wt,o.wrap=r,o.gzhead=null,o.w_bits=i,o.w_size=1<<o.w_bits,o.w_mask=o.w_size-1,o.hash_bits=n+7,o.hash_size=1<<o.hash_bits,o.hash_mask=o.hash_size-1,o.hash_shift=~~((o.hash_bits+3-1)/3),o.window=new Uint8Array(2*o.w_size),o.head=new Uint16Array(o.hash_size),o.prev=new Uint16Array(o.w_size),o.lit_bufsize=1<<n+6,o.pending_buf_size=4*o.lit_bufsize,o.pending_buf=new Uint8Array(o.pending_buf_size),o.sym_buf=o.lit_bufsize,o.sym_end=3*(o.lit_bufsize-1),o.level=e,o.strategy=s,o.method=a,Bt(t)};var Mt={deflateInit:(t,e)=>Ct(t,e,ft,15,8,dt),deflateInit2:Ct,deflateReset:Bt,deflateResetKeep:Nt,deflateSetHeader:(t,e)=>Lt(t)||2!==t.state.wrap?at:(t.state.gzhead=e,tt),deflate:(t,e)=>{if(Lt(t)||e>$||e<0)return t?gt(t,at):at;const a=t.state;if(!t.output||0!==t.avail_in&&!t.input||a.status===bt&&e!==V)return gt(t,0===t.avail_out?nt:at);const i=a.last_flush;if(a.last_flush=e,0!==a.pending){if(xt(t),0===t.avail_out)return a.last_flush=-1,tt}else if(0===t.avail_in&&pt(e)<=pt(i)&&e!==V)return gt(t,nt);if(a.status===bt&&0!==t.avail_in)return gt(t,nt);if(a.status===wt&&0===a.wrap&&(a.status=mt),a.status===wt){let e=ft+(a.w_bits-8<<4)<<8,i=-1;if(i=a.strategy>=ot||a.level<2?0:a.level<6?1:6===a.level?2:3,e|=i<<6,0!==a.strstart&&(e|=32),e+=31-e%31,Et(a,e),0!==a.strstart&&(Et(a,t.adler>>>16),Et(a,65535&t.adler)),t.adler=1,a.status=mt,xt(t),0!==a.pending)return a.last_flush=-1,tt}if(57===a.status)if(t.adler=0,At(a,31),At(a,139),At(a,8),a.gzhead)At(a,(a.gzhead.text?1:0)+(a.gzhead.hcrc?2:0)+(a.gzhead.extra?4:0)+(a.gzhead.name?8:0)+(a.gzhead.comment?16:0)),At(a,255&a.gzhead.time),At(a,a.gzhead.time>>8&255),At(a,a.gzhead.time>>16&255),At(a,a.gzhead.time>>24&255),At(a,9===a.level?2:a.strategy>=ot||a.level<2?4:0),At(a,255&a.gzhead.os),a.gzhead.extra&&a.gzhead.extra.length&&(At(a,255&a.gzhead.extra.length),At(a,a.gzhead.extra.length>>8&255)),a.gzhead.hcrc&&(t.adler=H(t.adler,a.pending_buf,a.pending,0)),a.gzindex=0,a.status=69;else if(At(a,0),At(a,0),At(a,0),At(a,0),At(a,0),At(a,9===a.level?2:a.strategy>=ot||a.level<2?4:0),At(a,3),a.status=mt,xt(t),0!==a.pending)return a.last_flush=-1,tt;if(69===a.status){if(a.gzhead.extra){let e=a.pending,i=(65535&a.gzhead.extra.length)-a.gzindex;for(;a.pending+i>a.pending_buf_size;){let n=a.pending_buf_size-a.pending;if(a.pending_buf.set(a.gzhead.extra.subarray(a.gzindex,a.gzindex+n),a.pending),a.pending=a.pending_buf_size,a.gzhead.hcrc&&a.pending>e&&(t.adler=H(t.adler,a.pending_buf,a.pending-e,e)),a.gzindex+=n,xt(t),0!==a.pending)return a.last_flush=-1,tt;e=0,i-=n}let n=new Uint8Array(a.gzhead.extra);a.pending_buf.set(n.subarray(a.gzindex,a.gzindex+i),a.pending),a.pending+=i,a.gzhead.hcrc&&a.pending>e&&(t.adler=H(t.adler,a.pending_buf,a.pending-e,e)),a.gzindex=0}a.status=73}if(73===a.status){if(a.gzhead.name){let e,i=a.pending;do{if(a.pending===a.pending_buf_size){if(a.gzhead.hcrc&&a.pending>i&&(t.adler=H(t.adler,a.pending_buf,a.pending-i,i)),xt(t),0!==a.pending)return a.last_flush=-1,tt;i=0}e=a.gzindex<a.gzhead.name.length?255&a.gzhead.name.charCodeAt(a.gzindex++):0,At(a,e)}while(0!==e);a.gzhead.hcrc&&a.pending>i&&(t.adler=H(t.adler,a.pending_buf,a.pending-i,i)),a.gzindex=0}a.status=91}if(91===a.status){if(a.gzhead.comment){let e,i=a.pending;do{if(a.pending===a.pending_buf_size){if(a.gzhead.hcrc&&a.pending>i&&(t.adler=H(t.adler,a.pending_buf,a.pending-i,i)),xt(t),0!==a.pending)return a.last_flush=-1,tt;i=0}e=a.gzindex<a.gzhead.comment.length?255&a.gzhead.comment.charCodeAt(a.gzindex++):0,At(a,e)}while(0!==e);a.gzhead.hcrc&&a.pending>i&&(t.adler=H(t.adler,a.pending_buf,a.pending-i,i))}a.status=103}if(103===a.status){if(a.gzhead.hcrc){if(a.pending+2>a.pending_buf_size&&(xt(t),0!==a.pending))return a.last_flush=-1,tt;At(a,255&t.adler),At(a,t.adler>>8&255),t.adler=0}if(a.status=mt,xt(t),0!==a.pending)return a.last_flush=-1,tt}if(0!==t.avail_in||0!==a.lookahead||e!==q&&a.status!==bt){let i=0===a.level?St(a,e):a.strategy===ot?((t,e)=>{let a;for(;;){if(0===t.lookahead&&(Ut(t),0===t.lookahead)){if(e===q)return 1;break}if(t.match_length=0,a=X(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++,a&&(zt(t,!1),0===t.strm.avail_out))return 1}return t.insert=0,e===V?(zt(t,!0),0===t.strm.avail_out?3:4):t.sym_next&&(zt(t,!1),0===t.strm.avail_out)?1:2})(a,e):a.strategy===lt?((t,e)=>{let a,i,n,s;const r=t.window;for(;;){if(t.lookahead<=ct){if(Ut(t),t.lookahead<=ct&&e===q)return 1;if(0===t.lookahead)break}if(t.match_length=0,t.lookahead>=3&&t.strstart>0&&(n=t.strstart-1,i=r[n],i===r[++n]&&i===r[++n]&&i===r[++n])){s=t.strstart+ct;do{}while(i===r[++n]&&i===r[++n]&&i===r[++n]&&i===r[++n]&&i===r[++n]&&i===r[++n]&&i===r[++n]&&i===r[++n]&&n<s);t.match_length=ct-(s-n),t.match_length>t.lookahead&&(t.match_length=t.lookahead)}if(t.match_length>=3?(a=X(t,1,t.match_length-3),t.lookahead-=t.match_length,t.strstart+=t.match_length,t.match_length=0):(a=X(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++),a&&(zt(t,!1),0===t.strm.avail_out))return 1}return t.insert=0,e===V?(zt(t,!0),0===t.strm.avail_out?3:4):t.sym_next&&(zt(t,!1),0===t.strm.avail_out)?1:2})(a,e):It[a.level].func(a,e);if(3!==i&&4!==i||(a.status=bt),1===i||3===i)return 0===t.avail_out&&(a.last_flush=-1),tt;if(2===i&&(e===J?W(a):e!==$&&(Y(a,0,0,!1),e===Q&&(kt(a.head),0===a.lookahead&&(a.strstart=0,a.block_start=0,a.insert=0))),xt(t),0===t.avail_out))return a.last_flush=-1,tt}return e!==V?tt:a.wrap<=0?et:(2===a.wrap?(At(a,255&t.adler),At(a,t.adler>>8&255),At(a,t.adler>>16&255),At(a,t.adler>>24&255),At(a,255&t.total_in),At(a,t.total_in>>8&255),At(a,t.total_in>>16&255),At(a,t.total_in>>24&255)):(Et(a,t.adler>>>16),Et(a,65535&t.adler)),xt(t),a.wrap>0&&(a.wrap=-a.wrap),0!==a.pending?tt:et)},deflateEnd:t=>{if(Lt(t))return at;const e=t.state.status;return t.state=null,e===mt?gt(t,it):tt},deflateSetDictionary:(t,e)=>{let a=e.length;if(Lt(t))return at;const i=t.state,n=i.wrap;if(2===n||1===n&&i.status!==wt||i.lookahead)return at;if(1===n&&(t.adler=C(t.adler,e,a,0)),i.wrap=0,a>=i.w_size){0===n&&(kt(i.head),i.strstart=0,i.block_start=0,i.insert=0);let t=new Uint8Array(i.w_size);t.set(e.subarray(a-i.w_size,a),0),e=t,a=i.w_size}const s=t.avail_in,r=t.next_in,o=t.input;for(t.avail_in=a,t.next_in=0,t.input=e,Ut(i);i.lookahead>=3;){let t=i.strstart,e=i.lookahead-2;do{i.ins_h=yt(i,i.ins_h,i.window[t+3-1]),i.prev[t&i.w_mask]=i.head[i.ins_h],i.head[i.ins_h]=t,t++}while(--e);i.strstart=t,i.lookahead=2,Ut(i)}return i.strstart+=i.lookahead,i.block_start=i.strstart,i.insert=i.lookahead,i.lookahead=0,i.match_length=i.prev_length=2,i.match_available=0,t.next_in=r,t.input=o,t.avail_in=s,i.wrap=n,tt},deflateInfo:"pako deflate (from Nodeca project)"};const Ht=(t,e)=>Object.prototype.hasOwnProperty.call(t,e);var jt=function(t){const e=Array.prototype.slice.call(arguments,1);for(;e.length;){const a=e.shift();if(a){if("object"!=typeof a)throw new TypeError(a+"must be non-object");for(const e in a)Ht(a,e)&&(t[e]=a[e])}}return t},Kt=t=>{let e=0;for(let a=0,i=t.length;a<i;a++)e+=t[a].length;const a=new Uint8Array(e);for(let e=0,i=0,n=t.length;e<n;e++){let n=t[e];a.set(n,i),i+=n.length}return a};let Pt=!0;try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(t){Pt=!1}const Yt=new Uint8Array(256);for(let t=0;t<256;t++)Yt[t]=t>=252?6:t>=248?5:t>=240?4:t>=224?3:t>=192?2:1;Yt[254]=Yt[254]=1;var Gt=t=>{if("function"==typeof TextEncoder&&TextEncoder.prototype.encode)return(new TextEncoder).encode(t);let e,a,i,n,s,r=t.length,o=0;for(n=0;n<r;n++)a=t.charCodeAt(n),55296==(64512&a)&&n+1<r&&(i=t.charCodeAt(n+1),56320==(64512&i)&&(a=65536+(a-55296<<10)+(i-56320),n++)),o+=a<128?1:a<2048?2:a<65536?3:4;for(e=new Uint8Array(o),s=0,n=0;s<o;n++)a=t.charCodeAt(n),55296==(64512&a)&&n+1<r&&(i=t.charCodeAt(n+1),56320==(64512&i)&&(a=65536+(a-55296<<10)+(i-56320),n++)),a<128?e[s++]=a:a<2048?(e[s++]=192|a>>>6,e[s++]=128|63&a):a<65536?(e[s++]=224|a>>>12,e[s++]=128|a>>>6&63,e[s++]=128|63&a):(e[s++]=240|a>>>18,e[s++]=128|a>>>12&63,e[s++]=128|a>>>6&63,e[s++]=128|63&a);return e},Xt=(t,e)=>{const a=e||t.length;if("function"==typeof TextDecoder&&TextDecoder.prototype.decode)return(new TextDecoder).decode(t.subarray(0,e));let i,n;const s=new Array(2*a);for(n=0,i=0;i<a;){let e=t[i++];if(e<128){s[n++]=e;continue}let r=Yt[e];if(r>4)s[n++]=65533,i+=r-1;else{for(e&=2===r?31:3===r?15:7;r>1&&i<a;)e=e<<6|63&t[i++],r--;r>1?s[n++]=65533:e<65536?s[n++]=e:(e-=65536,s[n++]=55296|e>>10&1023,s[n++]=56320|1023&e)}}return((t,e)=>{if(e<65534&&t.subarray&&Pt)return String.fromCharCode.apply(null,t.length===e?t:t.subarray(0,e));let a="";for(let i=0;i<e;i++)a+=String.fromCharCode(t[i]);return a})(s,n)},Wt=(t,e)=>{(e=e||t.length)>t.length&&(e=t.length);let a=e-1;for(;a>=0&&128==(192&t[a]);)a--;return a<0||0===a?e:a+Yt[t[a]]>e?a:e};var qt=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0};const Jt=Object.prototype.toString,{Z_NO_FLUSH:Qt,Z_SYNC_FLUSH:Vt,Z_FULL_FLUSH:$t,Z_FINISH:te,Z_OK:ee,Z_STREAM_END:ae,Z_DEFAULT_COMPRESSION:ie,Z_DEFAULT_STRATEGY:ne,Z_DEFLATED:se}=K;function re(t){this.options=jt({level:ie,method:se,chunkSize:16384,windowBits:15,memLevel:8,strategy:ne},t||{});let e=this.options;e.raw&&e.windowBits>0?e.windowBits=-e.windowBits:e.gzip&&e.windowBits>0&&e.windowBits<16&&(e.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new qt,this.strm.avail_out=0;let a=Mt.deflateInit2(this.strm,e.level,e.method,e.windowBits,e.memLevel,e.strategy);if(a!==ee)throw new Error(j[a]);if(e.header&&Mt.deflateSetHeader(this.strm,e.header),e.dictionary){let t;if(t="string"==typeof e.dictionary?Gt(e.dictionary):"[object ArrayBuffer]"===Jt.call(e.dictionary)?new Uint8Array(e.dictionary):e.dictionary,a=Mt.deflateSetDictionary(this.strm,t),a!==ee)throw new Error(j[a]);this._dict_set=!0}}function oe(t,e){const a=new re(e);if(a.push(t,!0),a.err)throw a.msg||j[a.err];return a.result}re.prototype.push=function(t,e){const a=this.strm,i=this.options.chunkSize;let n,s;if(this.ended)return!1;for(s=e===~~e?e:!0===e?te:Qt,"string"==typeof t?a.input=Gt(t):"[object ArrayBuffer]"===Jt.call(t)?a.input=new Uint8Array(t):a.input=t,a.next_in=0,a.avail_in=a.input.length;;)if(0===a.avail_out&&(a.output=new Uint8Array(i),a.next_out=0,a.avail_out=i),(s===Vt||s===$t)&&a.avail_out<=6)this.onData(a.output.subarray(0,a.next_out)),a.avail_out=0;else{if(n=Mt.deflate(a,s),n===ae)return a.next_out>0&&this.onData(a.output.subarray(0,a.next_out)),n=Mt.deflateEnd(this.strm),this.onEnd(n),this.ended=!0,n===ee;if(0!==a.avail_out){if(s>0&&a.next_out>0)this.onData(a.output.subarray(0,a.next_out)),a.avail_out=0;else if(0===a.avail_in)break}else this.onData(a.output)}return!0},re.prototype.onData=function(t){this.chunks.push(t)},re.prototype.onEnd=function(t){t===ee&&(this.result=Kt(this.chunks)),this.chunks=[],this.err=t,this.msg=this.strm.msg};var le={Deflate:re,deflate:oe,deflateRaw:function(t,e){return(e=e||{}).raw=!0,oe(t,e)},gzip:function(t,e){return(e=e||{}).gzip=!0,oe(t,e)},constants:K};const he=16209;var de=function(t,e){let a,i,n,s,r,o,l,h,d,_,f,c,u,w,m,b,g,p,k,v,y,x,z,A;const E=t.state;a=t.next_in,z=t.input,i=a+(t.avail_in-5),n=t.next_out,A=t.output,s=n-(e-t.avail_out),r=n+(t.avail_out-257),o=E.dmax,l=E.wsize,h=E.whave,d=E.wnext,_=E.window,f=E.hold,c=E.bits,u=E.lencode,w=E.distcode,m=(1<<E.lenbits)-1,b=(1<<E.distbits)-1;t:do{c<15&&(f+=z[a++]<<c,c+=8,f+=z[a++]<<c,c+=8),g=u[f&m];e:for(;;){if(p=g>>>24,f>>>=p,c-=p,p=g>>>16&255,0===p)A[n++]=65535&g;else{if(!(16&p)){if(0==(64&p)){g=u[(65535&g)+(f&(1<<p)-1)];continue e}if(32&p){E.mode=16191;break t}t.msg="invalid literal/length code",E.mode=he;break t}k=65535&g,p&=15,p&&(c<p&&(f+=z[a++]<<c,c+=8),k+=f&(1<<p)-1,f>>>=p,c-=p),c<15&&(f+=z[a++]<<c,c+=8,f+=z[a++]<<c,c+=8),g=w[f&b];a:for(;;){if(p=g>>>24,f>>>=p,c-=p,p=g>>>16&255,!(16&p)){if(0==(64&p)){g=w[(65535&g)+(f&(1<<p)-1)];continue a}t.msg="invalid distance code",E.mode=he;break t}if(v=65535&g,p&=15,c<p&&(f+=z[a++]<<c,c+=8,c<p&&(f+=z[a++]<<c,c+=8)),v+=f&(1<<p)-1,v>o){t.msg="invalid distance too far back",E.mode=he;break t}if(f>>>=p,c-=p,p=n-s,v>p){if(p=v-p,p>h&&E.sane){t.msg="invalid distance too far back",E.mode=he;break t}if(y=0,x=_,0===d){if(y+=l-p,p<k){k-=p;do{A[n++]=_[y++]}while(--p);y=n-v,x=A}}else if(d<p){if(y+=l+d-p,p-=d,p<k){k-=p;do{A[n++]=_[y++]}while(--p);if(y=0,d<k){p=d,k-=p;do{A[n++]=_[y++]}while(--p);y=n-v,x=A}}}else if(y+=d-p,p<k){k-=p;do{A[n++]=_[y++]}while(--p);y=n-v,x=A}for(;k>2;)A[n++]=x[y++],A[n++]=x[y++],A[n++]=x[y++],k-=3;k&&(A[n++]=x[y++],k>1&&(A[n++]=x[y++]))}else{y=n-v;do{A[n++]=A[y++],A[n++]=A[y++],A[n++]=A[y++],k-=3}while(k>2);k&&(A[n++]=A[y++],k>1&&(A[n++]=A[y++]))}break}}break}}while(a<i&&n<r);k=c>>3,a-=k,c-=k<<3,f&=(1<<c)-1,t.next_in=a,t.next_out=n,t.avail_in=a<i?i-a+5:5-(a-i),t.avail_out=n<r?r-n+257:257-(n-r),E.hold=f,E.bits=c};const _e=15,fe=new Uint16Array([3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0]),ce=new Uint8Array([16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78]),ue=new Uint16Array([1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0]),we=new Uint8Array([16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64]);var me=(t,e,a,i,n,s,r,o)=>{const l=o.bits;let h,d,_,f,c,u,w=0,m=0,b=0,g=0,p=0,k=0,v=0,y=0,x=0,z=0,A=null;const E=new Uint16Array(16),R=new Uint16Array(16);let Z,U,S,D=null;for(w=0;w<=_e;w++)E[w]=0;for(m=0;m<i;m++)E[e[a+m]]++;for(p=l,g=_e;g>=1&&0===E[g];g--);if(p>g&&(p=g),0===g)return n[s++]=20971520,n[s++]=20971520,o.bits=1,0;for(b=1;b<g&&0===E[b];b++);for(p<b&&(p=b),y=1,w=1;w<=_e;w++)if(y<<=1,y-=E[w],y<0)return-1;if(y>0&&(0===t||1!==g))return-1;for(R[1]=0,w=1;w<_e;w++)R[w+1]=R[w]+E[w];for(m=0;m<i;m++)0!==e[a+m]&&(r[R[e[a+m]]++]=m);if(0===t?(A=D=r,u=20):1===t?(A=fe,D=ce,u=257):(A=ue,D=we,u=0),z=0,m=0,w=b,c=s,k=p,v=0,_=-1,x=1<<p,f=x-1,1===t&&x>852||2===t&&x>592)return 1;for(;;){Z=w-v,r[m]+1<u?(U=0,S=r[m]):r[m]>=u?(U=D[r[m]-u],S=A[r[m]-u]):(U=96,S=0),h=1<<w-v,d=1<<k,b=d;do{d-=h,n[c+(z>>v)+d]=Z<<24|U<<16|S|0}while(0!==d);for(h=1<<w-1;z&h;)h>>=1;if(0!==h?(z&=h-1,z+=h):z=0,m++,0==--E[w]){if(w===g)break;w=e[a+r[m]]}if(w>p&&(z&f)!==_){for(0===v&&(v=p),c+=b,k=w-v,y=1<<k;k+v<g&&(y-=E[k+v],!(y<=0));)k++,y<<=1;if(x+=1<<k,1===t&&x>852||2===t&&x>592)return 1;_=z&f,n[_]=p<<24|k<<16|c-s|0}}return 0!==z&&(n[c+z]=w-v<<24|64<<16|0),o.bits=p,0};const{Z_FINISH:be,Z_BLOCK:ge,Z_TREES:pe,Z_OK:ke,Z_STREAM_END:ve,Z_NEED_DICT:ye,Z_STREAM_ERROR:xe,Z_DATA_ERROR:ze,Z_MEM_ERROR:Ae,Z_BUF_ERROR:Ee,Z_DEFLATED:Re}=K,Ze=16180,Ue=16190,Se=16191,De=16192,Te=16194,Oe=16199,Ie=16200,Fe=16206,Le=16209,Ne=t=>(t>>>24&255)+(t>>>8&65280)+((65280&t)<<8)+((255&t)<<24);function Be(){this.strm=null,this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new Uint16Array(320),this.work=new Uint16Array(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}const Ce=t=>{if(!t)return 1;const e=t.state;return!e||e.strm!==t||e.mode<Ze||e.mode>16211?1:0},Me=t=>{if(Ce(t))return xe;const e=t.state;return t.total_in=t.total_out=e.total=0,t.msg="",e.wrap&&(t.adler=1&e.wrap),e.mode=Ze,e.last=0,e.havedict=0,e.flags=-1,e.dmax=32768,e.head=null,e.hold=0,e.bits=0,e.lencode=e.lendyn=new Int32Array(852),e.distcode=e.distdyn=new Int32Array(592),e.sane=1,e.back=-1,ke},He=t=>{if(Ce(t))return xe;const e=t.state;return e.wsize=0,e.whave=0,e.wnext=0,Me(t)},je=(t,e)=>{let a;if(Ce(t))return xe;const i=t.state;return e<0?(a=0,e=-e):(a=5+(e>>4),e<48&&(e&=15)),e&&(e<8||e>15)?xe:(null!==i.window&&i.wbits!==e&&(i.window=null),i.wrap=a,i.wbits=e,He(t))},Ke=(t,e)=>{if(!t)return xe;const a=new Be;t.state=a,a.strm=t,a.window=null,a.mode=Ze;const i=je(t,e);return i!==ke&&(t.state=null),i};let Pe,Ye,Ge=!0;const Xe=t=>{if(Ge){Pe=new Int32Array(512),Ye=new Int32Array(32);let e=0;for(;e<144;)t.lens[e++]=8;for(;e<256;)t.lens[e++]=9;for(;e<280;)t.lens[e++]=7;for(;e<288;)t.lens[e++]=8;for(me(1,t.lens,0,288,Pe,0,t.work,{bits:9}),e=0;e<32;)t.lens[e++]=5;me(2,t.lens,0,32,Ye,0,t.work,{bits:5}),Ge=!1}t.lencode=Pe,t.lenbits=9,t.distcode=Ye,t.distbits=5},We=(t,e,a,i)=>{let n;const s=t.state;return null===s.window&&(s.wsize=1<<s.wbits,s.wnext=0,s.whave=0,s.window=new Uint8Array(s.wsize)),i>=s.wsize?(s.window.set(e.subarray(a-s.wsize,a),0),s.wnext=0,s.whave=s.wsize):(n=s.wsize-s.wnext,n>i&&(n=i),s.window.set(e.subarray(a-i,a-i+n),s.wnext),(i-=n)?(s.window.set(e.subarray(a-i,a),0),s.wnext=i,s.whave=s.wsize):(s.wnext+=n,s.wnext===s.wsize&&(s.wnext=0),s.whave<s.wsize&&(s.whave+=n))),0};var qe={inflateReset:He,inflateReset2:je,inflateResetKeep:Me,inflateInit:t=>Ke(t,15),inflateInit2:Ke,inflate:(t,e)=>{let a,i,n,s,r,o,l,h,d,_,f,c,u,w,m,b,g,p,k,v,y,x,z=0;const A=new Uint8Array(4);let E,R;const Z=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]);if(Ce(t)||!t.output||!t.input&&0!==t.avail_in)return xe;a=t.state,a.mode===Se&&(a.mode=De),r=t.next_out,n=t.output,l=t.avail_out,s=t.next_in,i=t.input,o=t.avail_in,h=a.hold,d=a.bits,_=o,f=l,x=ke;t:for(;;)switch(a.mode){case Ze:if(0===a.wrap){a.mode=De;break}for(;d<16;){if(0===o)break t;o--,h+=i[s++]<<d,d+=8}if(2&a.wrap&&35615===h){0===a.wbits&&(a.wbits=15),a.check=0,A[0]=255&h,A[1]=h>>>8&255,a.check=H(a.check,A,2,0),h=0,d=0,a.mode=16181;break}if(a.head&&(a.head.done=!1),!(1&a.wrap)||(((255&h)<<8)+(h>>8))%31){t.msg="incorrect header check",a.mode=Le;break}if((15&h)!==Re){t.msg="unknown compression method",a.mode=Le;break}if(h>>>=4,d-=4,y=8+(15&h),0===a.wbits&&(a.wbits=y),y>15||y>a.wbits){t.msg="invalid window size",a.mode=Le;break}a.dmax=1<<a.wbits,a.flags=0,t.adler=a.check=1,a.mode=512&h?16189:Se,h=0,d=0;break;case 16181:for(;d<16;){if(0===o)break t;o--,h+=i[s++]<<d,d+=8}if(a.flags=h,(255&a.flags)!==Re){t.msg="unknown compression method",a.mode=Le;break}if(57344&a.flags){t.msg="unknown header flags set",a.mode=Le;break}a.head&&(a.head.text=h>>8&1),512&a.flags&&4&a.wrap&&(A[0]=255&h,A[1]=h>>>8&255,a.check=H(a.check,A,2,0)),h=0,d=0,a.mode=16182;case 16182:for(;d<32;){if(0===o)break t;o--,h+=i[s++]<<d,d+=8}a.head&&(a.head.time=h),512&a.flags&&4&a.wrap&&(A[0]=255&h,A[1]=h>>>8&255,A[2]=h>>>16&255,A[3]=h>>>24&255,a.check=H(a.check,A,4,0)),h=0,d=0,a.mode=16183;case 16183:for(;d<16;){if(0===o)break t;o--,h+=i[s++]<<d,d+=8}a.head&&(a.head.xflags=255&h,a.head.os=h>>8),512&a.flags&&4&a.wrap&&(A[0]=255&h,A[1]=h>>>8&255,a.check=H(a.check,A,2,0)),h=0,d=0,a.mode=16184;case 16184:if(1024&a.flags){for(;d<16;){if(0===o)break t;o--,h+=i[s++]<<d,d+=8}a.length=h,a.head&&(a.head.extra_len=h),512&a.flags&&4&a.wrap&&(A[0]=255&h,A[1]=h>>>8&255,a.check=H(a.check,A,2,0)),h=0,d=0}else a.head&&(a.head.extra=null);a.mode=16185;case 16185:if(1024&a.flags&&(c=a.length,c>o&&(c=o),c&&(a.head&&(y=a.head.extra_len-a.length,a.head.extra||(a.head.extra=new Uint8Array(a.head.extra_len)),a.head.extra.set(i.subarray(s,s+c),y)),512&a.flags&&4&a.wrap&&(a.check=H(a.check,i,c,s)),o-=c,s+=c,a.length-=c),a.length))break t;a.length=0,a.mode=16186;case 16186:if(2048&a.flags){if(0===o)break t;c=0;do{y=i[s+c++],a.head&&y&&a.length<65536&&(a.head.name+=String.fromCharCode(y))}while(y&&c<o);if(512&a.flags&&4&a.wrap&&(a.check=H(a.check,i,c,s)),o-=c,s+=c,y)break t}else a.head&&(a.head.name=null);a.length=0,a.mode=16187;case 16187:if(4096&a.flags){if(0===o)break t;c=0;do{y=i[s+c++],a.head&&y&&a.length<65536&&(a.head.comment+=String.fromCharCode(y))}while(y&&c<o);if(512&a.flags&&4&a.wrap&&(a.check=H(a.check,i,c,s)),o-=c,s+=c,y)break t}else a.head&&(a.head.comment=null);a.mode=16188;case 16188:if(512&a.flags){for(;d<16;){if(0===o)break t;o--,h+=i[s++]<<d,d+=8}if(4&a.wrap&&h!==(65535&a.check)){t.msg="header crc mismatch",a.mode=Le;break}h=0,d=0}a.head&&(a.head.hcrc=a.flags>>9&1,a.head.done=!0),t.adler=a.check=0,a.mode=Se;break;case 16189:for(;d<32;){if(0===o)break t;o--,h+=i[s++]<<d,d+=8}t.adler=a.check=Ne(h),h=0,d=0,a.mode=Ue;case Ue:if(0===a.havedict)return t.next_out=r,t.avail_out=l,t.next_in=s,t.avail_in=o,a.hold=h,a.bits=d,ye;t.adler=a.check=1,a.mode=Se;case Se:if(e===ge||e===pe)break t;case De:if(a.last){h>>>=7&d,d-=7&d,a.mode=Fe;break}for(;d<3;){if(0===o)break t;o--,h+=i[s++]<<d,d+=8}switch(a.last=1&h,h>>>=1,d-=1,3&h){case 0:a.mode=16193;break;case 1:if(Xe(a),a.mode=Oe,e===pe){h>>>=2,d-=2;break t}break;case 2:a.mode=16196;break;case 3:t.msg="invalid block type",a.mode=Le}h>>>=2,d-=2;break;case 16193:for(h>>>=7&d,d-=7&d;d<32;){if(0===o)break t;o--,h+=i[s++]<<d,d+=8}if((65535&h)!=(h>>>16^65535)){t.msg="invalid stored block lengths",a.mode=Le;break}if(a.length=65535&h,h=0,d=0,a.mode=Te,e===pe)break t;case Te:a.mode=16195;case 16195:if(c=a.length,c){if(c>o&&(c=o),c>l&&(c=l),0===c)break t;n.set(i.subarray(s,s+c),r),o-=c,s+=c,l-=c,r+=c,a.length-=c;break}a.mode=Se;break;case 16196:for(;d<14;){if(0===o)break t;o--,h+=i[s++]<<d,d+=8}if(a.nlen=257+(31&h),h>>>=5,d-=5,a.ndist=1+(31&h),h>>>=5,d-=5,a.ncode=4+(15&h),h>>>=4,d-=4,a.nlen>286||a.ndist>30){t.msg="too many length or distance symbols",a.mode=Le;break}a.have=0,a.mode=16197;case 16197:for(;a.have<a.ncode;){for(;d<3;){if(0===o)break t;o--,h+=i[s++]<<d,d+=8}a.lens[Z[a.have++]]=7&h,h>>>=3,d-=3}for(;a.have<19;)a.lens[Z[a.have++]]=0;if(a.lencode=a.lendyn,a.lenbits=7,E={bits:a.lenbits},x=me(0,a.lens,0,19,a.lencode,0,a.work,E),a.lenbits=E.bits,x){t.msg="invalid code lengths set",a.mode=Le;break}a.have=0,a.mode=16198;case 16198:for(;a.have<a.nlen+a.ndist;){for(;z=a.lencode[h&(1<<a.lenbits)-1],m=z>>>24,b=z>>>16&255,g=65535&z,!(m<=d);){if(0===o)break t;o--,h+=i[s++]<<d,d+=8}if(g<16)h>>>=m,d-=m,a.lens[a.have++]=g;else{if(16===g){for(R=m+2;d<R;){if(0===o)break t;o--,h+=i[s++]<<d,d+=8}if(h>>>=m,d-=m,0===a.have){t.msg="invalid bit length repeat",a.mode=Le;break}y=a.lens[a.have-1],c=3+(3&h),h>>>=2,d-=2}else if(17===g){for(R=m+3;d<R;){if(0===o)break t;o--,h+=i[s++]<<d,d+=8}h>>>=m,d-=m,y=0,c=3+(7&h),h>>>=3,d-=3}else{for(R=m+7;d<R;){if(0===o)break t;o--,h+=i[s++]<<d,d+=8}h>>>=m,d-=m,y=0,c=11+(127&h),h>>>=7,d-=7}if(a.have+c>a.nlen+a.ndist){t.msg="invalid bit length repeat",a.mode=Le;break}for(;c--;)a.lens[a.have++]=y}}if(a.mode===Le)break;if(0===a.lens[256]){t.msg="invalid code -- missing end-of-block",a.mode=Le;break}if(a.lenbits=9,E={bits:a.lenbits},x=me(1,a.lens,0,a.nlen,a.lencode,0,a.work,E),a.lenbits=E.bits,x){t.msg="invalid literal/lengths set",a.mode=Le;break}if(a.distbits=6,a.distcode=a.distdyn,E={bits:a.distbits},x=me(2,a.lens,a.nlen,a.ndist,a.distcode,0,a.work,E),a.distbits=E.bits,x){t.msg="invalid distances set",a.mode=Le;break}if(a.mode=Oe,e===pe)break t;case Oe:a.mode=Ie;case Ie:if(o>=6&&l>=258){t.next_out=r,t.avail_out=l,t.next_in=s,t.avail_in=o,a.hold=h,a.bits=d,de(t,f),r=t.next_out,n=t.output,l=t.avail_out,s=t.next_in,i=t.input,o=t.avail_in,h=a.hold,d=a.bits,a.mode===Se&&(a.back=-1);break}for(a.back=0;z=a.lencode[h&(1<<a.lenbits)-1],m=z>>>24,b=z>>>16&255,g=65535&z,!(m<=d);){if(0===o)break t;o--,h+=i[s++]<<d,d+=8}if(b&&0==(240&b)){for(p=m,k=b,v=g;z=a.lencode[v+((h&(1<<p+k)-1)>>p)],m=z>>>24,b=z>>>16&255,g=65535&z,!(p+m<=d);){if(0===o)break t;o--,h+=i[s++]<<d,d+=8}h>>>=p,d-=p,a.back+=p}if(h>>>=m,d-=m,a.back+=m,a.length=g,0===b){a.mode=16205;break}if(32&b){a.back=-1,a.mode=Se;break}if(64&b){t.msg="invalid literal/length code",a.mode=Le;break}a.extra=15&b,a.mode=16201;case 16201:if(a.extra){for(R=a.extra;d<R;){if(0===o)break t;o--,h+=i[s++]<<d,d+=8}a.length+=h&(1<<a.extra)-1,h>>>=a.extra,d-=a.extra,a.back+=a.extra}a.was=a.length,a.mode=16202;case 16202:for(;z=a.distcode[h&(1<<a.distbits)-1],m=z>>>24,b=z>>>16&255,g=65535&z,!(m<=d);){if(0===o)break t;o--,h+=i[s++]<<d,d+=8}if(0==(240&b)){for(p=m,k=b,v=g;z=a.distcode[v+((h&(1<<p+k)-1)>>p)],m=z>>>24,b=z>>>16&255,g=65535&z,!(p+m<=d);){if(0===o)break t;o--,h+=i[s++]<<d,d+=8}h>>>=p,d-=p,a.back+=p}if(h>>>=m,d-=m,a.back+=m,64&b){t.msg="invalid distance code",a.mode=Le;break}a.offset=g,a.extra=15&b,a.mode=16203;case 16203:if(a.extra){for(R=a.extra;d<R;){if(0===o)break t;o--,h+=i[s++]<<d,d+=8}a.offset+=h&(1<<a.extra)-1,h>>>=a.extra,d-=a.extra,a.back+=a.extra}if(a.offset>a.dmax){t.msg="invalid distance too far back",a.mode=Le;break}a.mode=16204;case 16204:if(0===l)break t;if(c=f-l,a.offset>c){if(c=a.offset-c,c>a.whave&&a.sane){t.msg="invalid distance too far back",a.mode=Le;break}c>a.wnext?(c-=a.wnext,u=a.wsize-c):u=a.wnext-c,c>a.length&&(c=a.length),w=a.window}else w=n,u=r-a.offset,c=a.length;c>l&&(c=l),l-=c,a.length-=c;do{n[r++]=w[u++]}while(--c);0===a.length&&(a.mode=Ie);break;case 16205:if(0===l)break t;n[r++]=a.length,l--,a.mode=Ie;break;case Fe:if(a.wrap){for(;d<32;){if(0===o)break t;o--,h|=i[s++]<<d,d+=8}if(f-=l,t.total_out+=f,a.total+=f,4&a.wrap&&f&&(t.adler=a.check=a.flags?H(a.check,n,f,r-f):C(a.check,n,f,r-f)),f=l,4&a.wrap&&(a.flags?h:Ne(h))!==a.check){t.msg="incorrect data check",a.mode=Le;break}h=0,d=0}a.mode=16207;case 16207:if(a.wrap&&a.flags){for(;d<32;){if(0===o)break t;o--,h+=i[s++]<<d,d+=8}if(4&a.wrap&&h!==(4294967295&a.total)){t.msg="incorrect length check",a.mode=Le;break}h=0,d=0}a.mode=16208;case 16208:x=ve;break t;case Le:x=ze;break t;case 16210:return Ae;default:return xe}return t.next_out=r,t.avail_out=l,t.next_in=s,t.avail_in=o,a.hold=h,a.bits=d,(a.wsize||f!==t.avail_out&&a.mode<Le&&(a.mode<Fe||e!==be))&&We(t,t.output,t.next_out,f-t.avail_out),_-=t.avail_in,f-=t.avail_out,t.total_in+=_,t.total_out+=f,a.total+=f,4&a.wrap&&f&&(t.adler=a.check=a.flags?H(a.check,n,f,t.next_out-f):C(a.check,n,f,t.next_out-f)),t.data_type=a.bits+(a.last?64:0)+(a.mode===Se?128:0)+(a.mode===Oe||a.mode===Te?256:0),(0===_&&0===f||e===be)&&x===ke&&(x=Ee),x},inflateEnd:t=>{if(Ce(t))return xe;let e=t.state;return e.window&&(e.window=null),t.state=null,ke},inflateGetHeader:(t,e)=>{if(Ce(t))return xe;const a=t.state;return 0==(2&a.wrap)?xe:(a.head=e,e.done=!1,ke)},inflateSetDictionary:(t,e)=>{const a=e.length;let i,n,s;return Ce(t)?xe:(i=t.state,0!==i.wrap&&i.mode!==Ue?xe:i.mode===Ue&&(n=1,n=C(n,e,a,0),n!==i.check)?ze:(s=We(t,e,a,a),s?(i.mode=16210,Ae):(i.havedict=1,ke)))},inflateInfo:"pako inflate (from Nodeca project)"};var Je=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1};const Qe=Object.prototype.toString,{Z_NO_FLUSH:Ve,Z_FINISH:$e,Z_OK:ta,Z_STREAM_END:ea,Z_NEED_DICT:aa,Z_STREAM_ERROR:ia,Z_DATA_ERROR:na,Z_MEM_ERROR:sa}=K;function ra(t){this.options=jt({chunkSize:65536,windowBits:15,to:""},t||{});const e=this.options;e.raw&&e.windowBits>=0&&e.windowBits<16&&(e.windowBits=-e.windowBits,0===e.windowBits&&(e.windowBits=-15)),!(e.windowBits>=0&&e.windowBits<16)||t&&t.windowBits||(e.windowBits+=32),e.windowBits>15&&e.windowBits<48&&0==(15&e.windowBits)&&(e.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new qt,this.strm.avail_out=0;let a=qe.inflateInit2(this.strm,e.windowBits);if(a!==ta)throw new Error(j[a]);if(this.header=new Je,qe.inflateGetHeader(this.strm,this.header),e.dictionary&&("string"==typeof e.dictionary?e.dictionary=Gt(e.dictionary):"[object ArrayBuffer]"===Qe.call(e.dictionary)&&(e.dictionary=new Uint8Array(e.dictionary)),e.raw&&(a=qe.inflateSetDictionary(this.strm,e.dictionary),a!==ta)))throw new Error(j[a])}function oa(t,e){const a=new ra(e);if(a.push(t),a.err)throw a.msg||j[a.err];return a.result}ra.prototype.push=function(t,e){const a=this.strm,i=this.options.chunkSize,n=this.options.dictionary;let s,r,o;if(this.ended)return!1;for(r=e===~~e?e:!0===e?$e:Ve,"[object ArrayBuffer]"===Qe.call(t)?a.input=new Uint8Array(t):a.input=t,a.next_in=0,a.avail_in=a.input.length;;){for(0===a.avail_out&&(a.output=new Uint8Array(i),a.next_out=0,a.avail_out=i),s=qe.inflate(a,r),s===aa&&n&&(s=qe.inflateSetDictionary(a,n),s===ta?s=qe.inflate(a,r):s===na&&(s=aa));a.avail_in>0&&s===ea&&a.state.wrap>0&&0!==t[a.next_in];)qe.inflateReset(a),s=qe.inflate(a,r);switch(s){case ia:case na:case aa:case sa:return this.onEnd(s),this.ended=!0,!1}if(o=a.avail_out,a.next_out&&(0===a.avail_out||s===ea))if("string"===this.options.to){let t=Wt(a.output,a.next_out),e=a.next_out-t,n=Xt(a.output,t);a.next_out=e,a.avail_out=i-e,e&&a.output.set(a.output.subarray(t,t+e),0),this.onData(n)}else this.onData(a.output.length===a.next_out?a.output:a.output.subarray(0,a.next_out));if(s!==ta||0!==o){if(s===ea)return s=qe.inflateEnd(this.strm),this.onEnd(s),this.ended=!0,!0;if(0===a.avail_in)break}}return!0},ra.prototype.onData=function(t){this.chunks.push(t)},ra.prototype.onEnd=function(t){t===ta&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=Kt(this.chunks)),this.chunks=[],this.err=t,this.msg=this.strm.msg};var la={Inflate:ra,inflate:oa,inflateRaw:function(t,e){return(e=e||{}).raw=!0,oa(t,e)},ungzip:oa,constants:K};const{Deflate:ha,deflate:da,deflateRaw:_a,gzip:fa}=le,{Inflate:ca,inflate:ua,inflateRaw:wa,ungzip:ma}=la;var ba=ha,ga=da,pa=_a,ka=fa,va=ca,ya=ua,xa=wa,za=ma,Aa=K,Ea={Deflate:ba,deflate:ga,deflateRaw:pa,gzip:ka,Inflate:va,inflate:ya,inflateRaw:xa,ungzip:za,constants:Aa};t.Deflate=ba,t.Inflate=va,t.constants=Aa,t.default=Ea,t.deflate=ga,t.deflateRaw=pa,t.gzip=ka,t.inflate=ya,t.inflateRaw=xa,t.ungzip=za,Object.defineProperty(t,"__esModule",{value:!0})}));



__cf.pako=module.exports;})();

const pako=__cf.pako;

const module=undefined,require=undefined;





;(function(){

var UPNG = {};



// Make available for import by `require()`

var pako;

__cf.UPNG = UPNG;

pako = __cf.pako;

function log() { if (typeof process=="undefined" || process.env.NODE_ENV=="development") console.log.apply(console, arguments);  }

(function(UPNG, pako){



	



	



UPNG.toRGBA8 = function(out)

{

	var w = out.width, h = out.height;

	if(out.tabs.acTL==null) return [UPNG.toRGBA8.decodeImage(out.data, w, h, out).buffer];

	

	var frms = [];

	if(out.frames[0].data==null) out.frames[0].data = out.data;

	

	var img, empty = new Uint8Array(w*h*4);

	for(var i=0; i<out.frames.length; i++)

	{

		var frm = out.frames[i];

		var fx=frm.rect.x, fy=frm.rect.y, fw = frm.rect.width, fh = frm.rect.height;

		var fdata = UPNG.toRGBA8.decodeImage(frm.data, fw,fh, out);

		

		if(i==0) img = fdata;

		else if(frm.blend  ==0) UPNG._copyTile(fdata, fw, fh, img, w, h, fx, fy, 0);

		else if(frm.blend  ==1) UPNG._copyTile(fdata, fw, fh, img, w, h, fx, fy, 1);

		

		frms.push(img.buffer);  img = img.slice(0);

		

		if     (frm.dispose==0) {}

		else if(frm.dispose==1) UPNG._copyTile(empty, fw, fh, img, w, h, fx, fy, 0);

		else if(frm.dispose==2) {

			var pi = i-1;

			while(out.frames[pi].dispose==2) pi--;

			img = new Uint8Array(frms[pi]).slice(0);

		}

	}

	return frms;

}

UPNG.toRGBA8.decodeImage = function(data, w, h, out)

{

	var area = w*h, bpp = UPNG.decode._getBPP(out);

	var bpl = Math.ceil(w*bpp/8);	// bytes per line



	var bf = new Uint8Array(area*4), bf32 = new Uint32Array(bf.buffer);

	var ctype = out.ctype, depth = out.depth;

	var rs = UPNG._bin.readUshort;

	

	//console.log(ctype, depth);



	if     (ctype==6) { // RGB + alpha

		var qarea = area<<2;

		if(depth== 8) for(var i=0; i<qarea;i++) {  bf[i] = data[i];  /*if((i&3)==3 && data[i]!=0) bf[i]=255;*/ }

		if(depth==16) for(var i=0; i<qarea;i++) {  bf[i] = data[i<<1];  }

	}

	else if(ctype==2) {	// RGB

		var ts=out.tabs["tRNS"], tr=-1, tg=-1, tb=-1;

		if(ts) {  tr=ts[0];  tg=ts[1];  tb=ts[2];  }

		if(depth== 8) for(var i=0; i<area; i++) {  var qi=i<<2, ti=i*3;  bf[qi] = data[ti];  bf[qi+1] = data[ti+1];  bf[qi+2] = data[ti+2];  bf[qi+3] = 255;

			if(tr!=-1 && data[ti]   ==tr && data[ti+1]   ==tg && data[ti+2]   ==tb) bf[qi+3] = 0;  }

		if(depth==16) for(var i=0; i<area; i++) {  var qi=i<<2, ti=i*6;  bf[qi] = data[ti];  bf[qi+1] = data[ti+2];  bf[qi+2] = data[ti+4];  bf[qi+3] = 255;

			if(tr!=-1 && rs(data,ti)==tr && rs(data,ti+2)==tg && rs(data,ti+4)==tb) bf[qi+3] = 0;  }

	}

	else if(ctype==3) {	// palette

		var p=out.tabs["PLTE"], ap=out.tabs["tRNS"], tl=ap?ap.length:0;

		//console.log(p, ap);

		if(depth==1) for(var y=0; y<h; y++) {  var s0 = y*bpl, t0 = y*w;

			for(var i=0; i<w; i++) { var qi=(t0+i)<<2, j=((data[s0+(i>>3)]>>(7-((i&7)<<0)))& 1), cj=3*j;  bf[qi]=p[cj];  bf[qi+1]=p[cj+1];  bf[qi+2]=p[cj+2];  bf[qi+3]=(j<tl)?ap[j]:255;  }

		}

		if(depth==2) for(var y=0; y<h; y++) {  var s0 = y*bpl, t0 = y*w;

			for(var i=0; i<w; i++) { var qi=(t0+i)<<2, j=((data[s0+(i>>2)]>>(6-((i&3)<<1)))& 3), cj=3*j;  bf[qi]=p[cj];  bf[qi+1]=p[cj+1];  bf[qi+2]=p[cj+2];  bf[qi+3]=(j<tl)?ap[j]:255;  }

		}

		if(depth==4) for(var y=0; y<h; y++) {  var s0 = y*bpl, t0 = y*w;

			for(var i=0; i<w; i++) { var qi=(t0+i)<<2, j=((data[s0+(i>>1)]>>(4-((i&1)<<2)))&15), cj=3*j;  bf[qi]=p[cj];  bf[qi+1]=p[cj+1];  bf[qi+2]=p[cj+2];  bf[qi+3]=(j<tl)?ap[j]:255;  }

		}

		if(depth==8) for(var i=0; i<area; i++ ) {  var qi=i<<2, j=data[i]                      , cj=3*j;  bf[qi]=p[cj];  bf[qi+1]=p[cj+1];  bf[qi+2]=p[cj+2];  bf[qi+3]=(j<tl)?ap[j]:255;  }

	}

	else if(ctype==4) {	// gray + alpha

		if(depth== 8)  for(var i=0; i<area; i++) {  var qi=i<<2, di=i<<1, gr=data[di];  bf[qi]=gr;  bf[qi+1]=gr;  bf[qi+2]=gr;  bf[qi+3]=data[di+1];  }

		if(depth==16)  for(var i=0; i<area; i++) {  var qi=i<<2, di=i<<2, gr=data[di];  bf[qi]=gr;  bf[qi+1]=gr;  bf[qi+2]=gr;  bf[qi+3]=data[di+2];  }

	}

	else if(ctype==0) {	// gray

		var tr = out.tabs["tRNS"] ? out.tabs["tRNS"] : -1;

		if(depth== 1) for(var i=0; i<area; i++) {  var gr=255*((data[i>>3]>>(7 -((i&7)   )))& 1), al=(gr==tr*255)?0:255;  bf32[i]=(al<<24)|(gr<<16)|(gr<<8)|gr;  }

		if(depth== 2) for(var i=0; i<area; i++) {  var gr= 85*((data[i>>2]>>(6 -((i&3)<<1)))& 3), al=(gr==tr* 85)?0:255;  bf32[i]=(al<<24)|(gr<<16)|(gr<<8)|gr;  }

		if(depth== 4) for(var i=0; i<area; i++) {  var gr= 17*((data[i>>1]>>(4 -((i&1)<<2)))&15), al=(gr==tr* 17)?0:255;  bf32[i]=(al<<24)|(gr<<16)|(gr<<8)|gr;  }

		if(depth== 8) for(var i=0; i<area; i++) {  var gr=data[i  ] , al=(gr           ==tr)?0:255;  bf32[i]=(al<<24)|(gr<<16)|(gr<<8)|gr;  }

		if(depth==16) for(var i=0; i<area; i++) {  var gr=data[i<<1], al=(rs(data,i<<1)==tr)?0:255;  bf32[i]=(al<<24)|(gr<<16)|(gr<<8)|gr;  }

	}

	return bf;

}







UPNG.decode = function(buff)

{

	var data = new Uint8Array(buff), offset = 8, bin = UPNG._bin, rUs = bin.readUshort, rUi = bin.readUint;

	var out = {tabs:{}, frames:[]};

	var dd = new Uint8Array(data.length), doff = 0;	 // put all IDAT data into it

	var fd, foff = 0;	// frames

	

	var mgck = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

	for(var i=0; i<8; i++) if(data[i]!=mgck[i]) throw "The input is not a PNG file!";



	while(offset<data.length)

	{

		var len  = bin.readUint(data, offset);  offset += 4;

		var type = bin.readASCII(data, offset, 4);  offset += 4;

		//log(type,len);

		

		if     (type=="IHDR")  {  UPNG.decode._IHDR(data, offset, out);  }

		else if(type=="IDAT") {

			for(var i=0; i<len; i++) dd[doff+i] = data[offset+i];

			doff += len;

		}

		else if(type=="acTL")  {

			out.tabs[type] = {  num_frames:rUi(data, offset), num_plays:rUi(data, offset+4)  };

			fd = new Uint8Array(data.length);

		}

		else if(type=="fcTL")  {

			if(foff!=0) {  var fr = out.frames[out.frames.length-1];

				fr.data = UPNG.decode._decompress(out, fd.slice(0,foff), fr.rect.width, fr.rect.height);  foff=0;

			}

			var rct = {x:rUi(data, offset+12),y:rUi(data, offset+16),width:rUi(data, offset+4),height:rUi(data, offset+8)};

			var del = rUs(data, offset+22);  del = rUs(data, offset+20) / (del==0?100:del);

			var frm = {rect:rct, delay:Math.round(del*1000), dispose:data[offset+24], blend:data[offset+25]};

			//console.log(frm);

			out.frames.push(frm);

		}

		else if(type=="fdAT") {

			for(var i=0; i<len-4; i++) fd[foff+i] = data[offset+i+4];

			foff += len-4;

		}

		else if(type=="pHYs") {

			out.tabs[type] = [bin.readUint(data, offset), bin.readUint(data, offset+4), data[offset+8]];

		}

		else if(type=="cHRM") {

			out.tabs[type] = [];

			for(var i=0; i<8; i++) out.tabs[type].push(bin.readUint(data, offset+i*4));

		}

		else if(type=="tEXt") {

			if(out.tabs[type]==null) out.tabs[type] = {};

			var nz = bin.nextZero(data, offset);

			var keyw = bin.readASCII(data, offset, nz-offset);

			var text = bin.readASCII(data, nz+1, offset+len-nz-1);

			out.tabs[type][keyw] = text;

		}

		else if(type=="iTXt") {

			if(out.tabs[type]==null) out.tabs[type] = {};

			var nz = 0, off = offset;

			nz = bin.nextZero(data, off);

			var keyw = bin.readASCII(data, off, nz-off);  off = nz + 1;

			var cflag = data[off], cmeth = data[off+1];  off+=2;

			nz = bin.nextZero(data, off);

			var ltag = bin.readASCII(data, off, nz-off);  off = nz + 1;

			nz = bin.nextZero(data, off);

			var tkeyw = bin.readUTF8(data, off, nz-off);  off = nz + 1;

			var text  = bin.readUTF8(data, off, len-(off-offset));

			out.tabs[type][keyw] = text;

		}

		else if(type=="PLTE") {

			out.tabs[type] = bin.readBytes(data, offset, len);

		}

		else if(type=="hIST") {

			var pl = out.tabs["PLTE"].length/3;

			out.tabs[type] = [];  for(var i=0; i<pl; i++) out.tabs[type].push(rUs(data, offset+i*2));

		}

		else if(type=="tRNS") {

			if     (out.ctype==3) out.tabs[type] = bin.readBytes(data, offset, len);

			else if(out.ctype==0) out.tabs[type] = rUs(data, offset);

			else if(out.ctype==2) out.tabs[type] = [ rUs(data,offset),rUs(data,offset+2),rUs(data,offset+4) ];

			//else console.log("tRNS for unsupported color type",out.ctype, len);

		}

		else if(type=="gAMA") out.tabs[type] = bin.readUint(data, offset)/100000;

		else if(type=="sRGB") out.tabs[type] = data[offset];

		else if(type=="bKGD")

		{

			if     (out.ctype==0 || out.ctype==4) out.tabs[type] = [rUs(data, offset)];

			else if(out.ctype==2 || out.ctype==6) out.tabs[type] = [rUs(data, offset), rUs(data, offset+2), rUs(data, offset+4)];

			else if(out.ctype==3) out.tabs[type] = data[offset];

		}

		else if(type=="IEND") {

			if(foff!=0) {  var fr = out.frames[out.frames.length-1];

				fr.data = UPNG.decode._decompress(out, fd.slice(0,foff), fr.rect.width, fr.rect.height);  foff=0;

			}	

			out.data = UPNG.decode._decompress(out, dd, out.width, out.height);  break;

		}

		//else {  log("unknown chunk type", type, len);  }

		offset += len;

		var crc = bin.readUint(data, offset);  offset += 4;

	}

	delete out.compress;  delete out.interlace;  delete out.filter;

	return out;

}



UPNG.decode._decompress = function(out, dd, w, h) {

	if(out.compress ==0) dd = UPNG.decode._inflate(dd);



	if     (out.interlace==0) dd = UPNG.decode._filterZero(dd, out, 0, w, h);

	else if(out.interlace==1) dd = UPNG.decode._readInterlace(dd, out);

	return dd;

}



UPNG.decode._inflate = function(data) {  return pako["inflate"](data);  }



UPNG.decode._readInterlace = function(data, out)

{

	var w = out.width, h = out.height;

	var bpp = UPNG.decode._getBPP(out), cbpp = bpp>>3, bpl = Math.ceil(w*bpp/8);

	var img = new Uint8Array( h * bpl );

	var di = 0;



	var starting_row  = [ 0, 0, 4, 0, 2, 0, 1 ];

	var starting_col  = [ 0, 4, 0, 2, 0, 1, 0 ];

	var row_increment = [ 8, 8, 8, 4, 4, 2, 2 ];

	var col_increment = [ 8, 8, 4, 4, 2, 2, 1 ];



	var pass=0;

	while(pass<7)

	{

		var ri = row_increment[pass], ci = col_increment[pass];

		var sw = 0, sh = 0;

		var cr = starting_row[pass];  while(cr<h) {  cr+=ri;  sh++;  }

		var cc = starting_col[pass];  while(cc<w) {  cc+=ci;  sw++;  }

		var bpll = Math.ceil(sw*bpp/8);

		UPNG.decode._filterZero(data, out, di, sw, sh);



		var y=0, row = starting_row[pass];

		while(row<h)

		{

			var col = starting_col[pass];

			var cdi = (di+y*bpll)<<3;



			while(col<w)

			{

				if(bpp==1) {

					var val = data[cdi>>3];  val = (val>>(7-(cdi&7)))&1;

					img[row*bpl + (col>>3)] |= (val << (7-((col&3)<<0)));

				}

				if(bpp==2) {

					var val = data[cdi>>3];  val = (val>>(6-(cdi&7)))&3;

					img[row*bpl + (col>>2)] |= (val << (6-((col&3)<<1)));

				}

				if(bpp==4) {

					var val = data[cdi>>3];  val = (val>>(4-(cdi&7)))&15;

					img[row*bpl + (col>>1)] |= (val << (4-((col&1)<<2)));

				}

				if(bpp>=8) {

					var ii = row*bpl+col*cbpp;

					for(var j=0; j<cbpp; j++) img[ii+j] = data[(cdi>>3)+j];

				}

				cdi+=bpp;  col+=ci;

			}

			y++;  row += ri;

		}

		if(sw*sh!=0) di += sh * (1 + bpll);

		pass = pass + 1;

	}

	return img;

}



UPNG.decode._getBPP = function(out) {

	var noc = [1,null,3,1,2,null,4][out.ctype];

	return noc * out.depth;

}



UPNG.decode._filterZero = function(data, out, off, w, h)

{

	var bpp = UPNG.decode._getBPP(out), bpl = Math.ceil(w*bpp/8), paeth = UPNG.decode._paeth;

	bpp = Math.ceil(bpp/8);



	for(var y=0; y<h; y++)  {

		var i = off+y*bpl, di = i+y+1;

		var type = data[di-1];



		if     (type==0) for(var x=  0; x<bpl; x++) data[i+x] = data[di+x];

		else if(type==1) {

			for(var x=  0; x<bpp; x++) data[i+x] = data[di+x];

			for(var x=bpp; x<bpl; x++) data[i+x] = (data[di+x] + data[i+x-bpp])&255;

		}

		else if(y==0) {

			for(var x=  0; x<bpp; x++) data[i+x] = data[di+x];

			if(type==2) for(var x=bpp; x<bpl; x++) data[i+x] = (data[di+x])&255;

			if(type==3) for(var x=bpp; x<bpl; x++) data[i+x] = (data[di+x] + (data[i+x-bpp]>>1) )&255;

			if(type==4) for(var x=bpp; x<bpl; x++) data[i+x] = (data[di+x] + paeth(data[i+x-bpp], 0, 0) )&255;

		}

		else {

			if(type==2) { for(var x=  0; x<bpl; x++) data[i+x] = (data[di+x] + data[i+x-bpl])&255;  }



			if(type==3) { for(var x=  0; x<bpp; x++) data[i+x] = (data[di+x] + (data[i+x-bpl]>>1))&255;

			              for(var x=bpp; x<bpl; x++) data[i+x] = (data[di+x] + ((data[i+x-bpl]+data[i+x-bpp])>>1) )&255;  }



			if(type==4) { for(var x=  0; x<bpp; x++) data[i+x] = (data[di+x] + paeth(0, data[i+x-bpl], 0))&255;

						  for(var x=bpp; x<bpl; x++) data[i+x] = (data[di+x] + paeth(data[i+x-bpp], data[i+x-bpl], data[i+x-bpp-bpl]) )&255;  }

		}

	}

	return data;

}



UPNG.decode._paeth = function(a,b,c)

{

	var p = a+b-c, pa = Math.abs(p-a), pb = Math.abs(p-b), pc = Math.abs(p-c);

	if (pa <= pb && pa <= pc)  return a;

	else if (pb <= pc)  return b;

	return c;

}



UPNG.decode._IHDR = function(data, offset, out)

{

	var bin = UPNG._bin;

	out.width  = bin.readUint(data, offset);  offset += 4;

	out.height = bin.readUint(data, offset);  offset += 4;

	out.depth     = data[offset];  offset++;

	out.ctype     = data[offset];  offset++;

	out.compress  = data[offset];  offset++;

	out.filter    = data[offset];  offset++;

	out.interlace = data[offset];  offset++;

}



UPNG._bin = {

	nextZero   : function(data,p)  {  while(data[p]!=0) p++;  return p;  },

	readUshort : function(buff,p)  {  return (buff[p]<< 8) | buff[p+1];  },

	writeUshort: function(buff,p,n){  buff[p] = (n>>8)&255;  buff[p+1] = n&255;  },

	readUint   : function(buff,p)  {  return (buff[p]*(256*256*256)) + ((buff[p+1]<<16) | (buff[p+2]<< 8) | buff[p+3]);  },

	writeUint  : function(buff,p,n){  buff[p]=(n>>24)&255;  buff[p+1]=(n>>16)&255;  buff[p+2]=(n>>8)&255;  buff[p+3]=n&255;  },

	readASCII  : function(buff,p,l){  var s = "";  for(var i=0; i<l; i++) s += String.fromCharCode(buff[p+i]);  return s;    },

	writeASCII : function(data,p,s){  for(var i=0; i<s.length; i++) data[p+i] = s.charCodeAt(i);  },

	readBytes  : function(buff,p,l){  var arr = [];   for(var i=0; i<l; i++) arr.push(buff[p+i]);   return arr;  },

	pad : function(n) { return n.length < 2 ? "0" + n : n; },

	readUTF8 : function(buff, p, l) {

		var s = "", ns;

		for(var i=0; i<l; i++) s += "%" + UPNG._bin.pad(buff[p+i].toString(16));

		try {  ns = decodeURIComponent(s); }

		catch(e) {  return UPNG._bin.readASCII(buff, p, l);  }

		return  ns;

	}

}

UPNG._copyTile = function(sb, sw, sh, tb, tw, th, xoff, yoff, mode)

{

	var w = Math.min(sw,tw), h = Math.min(sh,th);

	var si=0, ti=0;

	for(var y=0; y<h; y++)

		for(var x=0; x<w; x++)

		{

			if(xoff>=0 && yoff>=0) {  si = (y*sw+x)<<2;  ti = (( yoff+y)*tw+xoff+x)<<2;  }

			else                   {  si = ((-yoff+y)*sw-xoff+x)<<2;  ti = (y*tw+x)<<2;  }

			

			if     (mode==0) {  tb[ti] = sb[si];  tb[ti+1] = sb[si+1];  tb[ti+2] = sb[si+2];  tb[ti+3] = sb[si+3];  }

			else if(mode==1) {

				var fa = sb[si+3]*(1/255), fr=sb[si]*fa, fg=sb[si+1]*fa, fb=sb[si+2]*fa; 

				var ba = tb[ti+3]*(1/255), br=tb[ti]*ba, bg=tb[ti+1]*ba, bb=tb[ti+2]*ba; 

				

				var ifa=1-fa, oa = fa+ba*ifa, ioa = (oa==0?0:1/oa);

				tb[ti+3] = 255*oa;  

				tb[ti+0] = (fr+br*ifa)*ioa;  

				tb[ti+1] = (fg+bg*ifa)*ioa;   

				tb[ti+2] = (fb+bb*ifa)*ioa;  

			}

			else if(mode==2){	// copy only differences, otherwise zero

				var fa = sb[si+3], fr=sb[si], fg=sb[si+1], fb=sb[si+2]; 

				var ba = tb[ti+3], br=tb[ti], bg=tb[ti+1], bb=tb[ti+2]; 

				if(fa==ba && fr==br && fg==bg && fb==bb) {  tb[ti]=0;  tb[ti+1]=0;  tb[ti+2]=0;  tb[ti+3]=0;  }

				else {  tb[ti]=fr;  tb[ti+1]=fg;  tb[ti+2]=fb;  tb[ti+3]=fa;  }

			}

			else if(mode==3){	// check if can be blended

				var fa = sb[si+3], fr=sb[si], fg=sb[si+1], fb=sb[si+2]; 

				var ba = tb[ti+3], br=tb[ti], bg=tb[ti+1], bb=tb[ti+2]; 

				if(fa==ba && fr==br && fg==bg && fb==bb) continue;

				//if(fa!=255 && ba!=0) return false;

				if(fa<220 && ba>20) return false;

			}

		}

	return true;

}







UPNG.encode = function(bufs, w, h, ps, dels, forbidPlte)

{

	if(ps==null) ps=0;

	if(forbidPlte==null) forbidPlte = false;

	var data = new Uint8Array(bufs[0].byteLength*bufs.length+100);

	var wr=[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

	for(var i=0; i<8; i++) data[i]=wr[i];

	var offset = 8,  bin = UPNG._bin, crc = UPNG.crc.crc, wUi = bin.writeUint, wUs = bin.writeUshort, wAs = bin.writeASCII;



	var nimg = UPNG.encode.compressPNG(bufs, w, h, ps, forbidPlte);



	wUi(data,offset, 13);     offset+=4;

	wAs(data,offset,"IHDR");  offset+=4;

	wUi(data,offset,w);  offset+=4;

	wUi(data,offset,h);  offset+=4;

	data[offset] = nimg.depth;  offset++;  // depth

	data[offset] = nimg.ctype;  offset++;  // ctype

	data[offset] = 0;  offset++;  // compress

	data[offset] = 0;  offset++;  // filter

	data[offset] = 0;  offset++;  // interlace

	wUi(data,offset,crc(data,offset-17,17));  offset+=4; // crc



	// 9 bytes to say, that it is sRGB

	wUi(data,offset, 1);      offset+=4;

	wAs(data,offset,"sRGB");  offset+=4;

	data[offset] = 1;  offset++;

	wUi(data,offset,crc(data,offset-5,5));  offset+=4; // crc



	var anim = bufs.length>1;

	if(anim) {

		wUi(data,offset, 8);      offset+=4;

		wAs(data,offset,"acTL");  offset+=4;

		wUi(data,offset, bufs.length);      offset+=4;

		wUi(data,offset, 0);      offset+=4;

		wUi(data,offset,crc(data,offset-12,12));  offset+=4; // crc

	}



	if(nimg.ctype==3) {

		var dl = nimg.plte.length;

		wUi(data,offset, dl*3);  offset+=4;

		wAs(data,offset,"PLTE");  offset+=4;

		for(var i=0; i<dl; i++){

			var ti=i*3, c=nimg.plte[i], r=(c)&255, g=(c>>8)&255, b=(c>>16)&255;

			data[offset+ti+0]=r;  data[offset+ti+1]=g;  data[offset+ti+2]=b;

		}

		offset+=dl*3;

		wUi(data,offset,crc(data,offset-dl*3-4,dl*3+4));  offset+=4; // crc



		if(nimg.gotAlpha) {

			wUi(data,offset, dl);  offset+=4;

			wAs(data,offset,"tRNS");  offset+=4;

			for(var i=0; i<dl; i++)  data[offset+i]=(nimg.plte[i]>>24)&255;

			offset+=dl;

			wUi(data,offset,crc(data,offset-dl-4,dl+4));  offset+=4; // crc

		}

	}

	

	var fi = 0;

	for(var j=0; j<nimg.frames.length; j++)

	{

		var fr = nimg.frames[j];

		if(anim) {

			wUi(data,offset, 26);     offset+=4;

			wAs(data,offset,"fcTL");  offset+=4;

			wUi(data, offset, fi++);   offset+=4;

			wUi(data, offset, fr.rect.width );   offset+=4;

			wUi(data, offset, fr.rect.height);   offset+=4;

			wUi(data, offset, fr.rect.x);   offset+=4;

			wUi(data, offset, fr.rect.y);   offset+=4;

			wUs(data, offset, dels[j]);   offset+=2;

			wUs(data, offset,  1000);   offset+=2;

			data[offset] = fr.dispose;  offset++;	// dispose

			data[offset] = fr.blend  ;  offset++;	// blend

			wUi(data,offset,crc(data,offset-30,30));  offset+=4; // crc

		}

				

		var imgd = fr.cimg, dl = imgd.length;

		wUi(data,offset, dl+(j==0?0:4));     offset+=4;

		var ioff = offset;

		wAs(data,offset,(j==0)?"IDAT":"fdAT");  offset+=4;

		if(j!=0) {  wUi(data, offset, fi++);  offset+=4;  }

		for(var i=0; i<dl; i++) data[offset+i] = imgd[i];

		offset += dl;

		wUi(data,offset,crc(data,ioff,offset-ioff));  offset+=4; // crc

	}



	wUi(data,offset, 0);     offset+=4;

	wAs(data,offset,"IEND");  offset+=4;

	wUi(data,offset,crc(data,offset-4,4));  offset+=4; // crc



	return data.buffer.slice(0,offset);

}



UPNG.encode.compressPNG = function(bufs, w, h, ps, forbidPlte)

{

	var out = UPNG.encode.compress(bufs, w, h, ps, false, forbidPlte);

	for(var i=0; i<bufs.length; i++) {

		var frm = out.frames[i], nw=frm.rect.width, nh=frm.rect.height, bpl=frm.bpl, bpp=frm.bpp;

		var fdata = new Uint8Array(nh*bpl+nh);

		frm.cimg = UPNG.encode._filterZero(frm.img,nh,bpp,bpl,fdata);

	}	

	return out;

}



UPNG.encode.compress = function(bufs, w, h, ps, forGIF, forbidPlte)

{

	if(forbidPlte==null) forbidPlte = false;

	

	var ctype = 6, depth = 8, bpp = 4, alphaAnd=255

	

	for(var j=0; j<bufs.length; j++)  {  // when not quantized, other frames can contain colors, that are not in an initial frame

		var img = new Uint8Array(bufs[j]), ilen = img.length;

		for(var i=0; i<ilen; i+=4) alphaAnd &= img[i+3];

	}

	var gotAlpha = (alphaAnd)!=255;

	

	var cmap={}, plte=[];  if(bufs.length!=0) {  cmap[0]=0;  plte.push(0);  if(ps!=0) ps--;  } 

	

	

	if(ps!=0) {

		var qres = UPNG.quantize(bufs, ps, forGIF);  bufs = qres.bufs;

		for(var i=0; i<qres.plte.length; i++) {  var c=qres.plte[i].est.rgba;  if(cmap[c]==null) {  cmap[c]=plte.length;  plte.push(c);  }     }

	}

	else {

		// what if ps==0, but there are <=256 colors?  we still need to detect, if the palette could be used

		for(var j=0; j<bufs.length; j++)  {  // when not quantized, other frames can contain colors, that are not in an initial frame

			var img32 = new Uint32Array(bufs[j]), ilen = img32.length;

			for(var i=0; i<ilen; i++) {

				var c = img32[i];

				if((i<w || (c!=img32[i-1] && c!=img32[i-w])) && cmap[c]==null) {  cmap[c]=plte.length;  plte.push(c);  if(plte.length>=300) break;  }

			}

		}

	}

	

	var brute = gotAlpha ? forGIF : false;		// brute : frames can only be copied, not "blended"

	var cc=plte.length;  //console.log(cc);

	if(cc<=256 && forbidPlte==false) {

		if(cc<= 2) depth=1;  else if(cc<= 4) depth=2;  else if(cc<=16) depth=4;  else depth=8;

		if(forGIF) depth=8;

		gotAlpha = true;

	}

	

	

	var frms = [];

	for(var j=0; j<bufs.length; j++)

	{

		var cimg = new Uint8Array(bufs[j]), cimg32 = new Uint32Array(cimg.buffer);

		

		var nx=0, ny=0, nw=w, nh=h, blend=0;

		if(j!=0 && !brute) {

			var tlim = (forGIF || j==1 || frms[frms.length-2].dispose==2)?1:2, tstp = 0, tarea = 1e9;

			for(var it=0; it<tlim; it++)

			{

				var pimg = new Uint8Array(bufs[j-1-it]), p32 = new Uint32Array(bufs[j-1-it]);

				var mix=w,miy=h,max=-1,may=-1;

				for(var y=0; y<h; y++) for(var x=0; x<w; x++) {

					var i = y*w+x;

					if(cimg32[i]!=p32[i]) {

						if(x<mix) mix=x;  if(x>max) max=x;

						if(y<miy) miy=y;  if(y>may) may=y;

					}

				}

				var sarea = (max==-1) ? 1 : (max-mix+1)*(may-miy+1);

				if(sarea<tarea) {

					tarea = sarea;  tstp = it;  

					if(max==-1) {  nx=ny=0;  nw=nh=1;  }

					else {  nx = mix; ny = miy; nw = max-mix+1; nh = may-miy+1;  }

				}

			}

			

			var pimg = new Uint8Array(bufs[j-1-tstp]);

			if(tstp==1) frms[frms.length-1].dispose = 2;

			

			var nimg = new Uint8Array(nw*nh*4), nimg32 = new Uint32Array(nimg.buffer);

			UPNG.   _copyTile(pimg,w,h, nimg,nw,nh, -nx,-ny, 0);

			if(UPNG._copyTile(cimg,w,h, nimg,nw,nh, -nx,-ny, 3)) {

				UPNG._copyTile(cimg,w,h, nimg,nw,nh, -nx,-ny, 2);  blend = 1;

			}

			else {

				UPNG._copyTile(cimg,w,h, nimg,nw,nh, -nx,-ny, 0);  blend = 0;

			}

			cimg = nimg;  cimg32 = new Uint32Array(cimg.buffer);

		}

		var bpl = 4*nw;

		if(cc<=256 && forbidPlte==false) {

			bpl = Math.ceil(depth*nw/8);

			var nimg = new Uint8Array(bpl*nh);

			for(var y=0; y<nh; y++) {  var i=y*bpl, ii=y*nw;

				if     (depth==8) for(var x=0; x<nw; x++) nimg[i+(x)   ]   =  (cmap[cimg32[ii+x]]             );

				else if(depth==4) for(var x=0; x<nw; x++) nimg[i+(x>>1)]  |=  (cmap[cimg32[ii+x]]<<(4-(x&1)*4));

				else if(depth==2) for(var x=0; x<nw; x++) nimg[i+(x>>2)]  |=  (cmap[cimg32[ii+x]]<<(6-(x&3)*2));

				else if(depth==1) for(var x=0; x<nw; x++) nimg[i+(x>>3)]  |=  (cmap[cimg32[ii+x]]<<(7-(x&7)*1));

			}

			cimg=nimg;  ctype=3;  bpp=1;

		}

		else if(gotAlpha==false && bufs.length==1) {	// some next "reduced" frames may contain alpha for blending

			var nimg = new Uint8Array(nw*nh*3), area=nw*nh;

			for(var i=0; i<area; i++) { var ti=i*3, qi=i*4;  nimg[ti]=cimg[qi];  nimg[ti+1]=cimg[qi+1];  nimg[ti+2]=cimg[qi+2];  }

			cimg=nimg;  ctype=2;  bpp=3;  bpl=3*nw;

		}

		frms.push({rect:{x:nx,y:ny,width:nw,height:nh}, img:cimg, bpl:bpl, bpp:bpp, blend:blend, dispose:brute?1:0});

	}

	return {ctype:ctype, depth:depth, plte:plte, gotAlpha:gotAlpha, frames:frms  };

}



UPNG.encode._filterZero = function(img,h,bpp,bpl,data)

{

	var fls = [];

	for(var t=0; t<5; t++) {  if(h*bpl>500000 && (t==2 || t==3 || t==4)) continue;

		for(var y=0; y<h; y++) UPNG.encode._filterLine(data, img, y, bpl, bpp, t);

		fls.push(pako["deflate"](data));  if(bpp==1) break;

	}

	var ti, tsize=1e9;

	for(var i=0; i<fls.length; i++) if(fls[i].length<tsize) {  ti=i;  tsize=fls[i].length;  }

	return fls[ti];

}

UPNG.encode._filterLine = function(data, img, y, bpl, bpp, type)

{

	var i = y*bpl, di = i+y, paeth = UPNG.decode._paeth

	data[di]=type;  di++;



	if(type==0) for(var x=0; x<bpl; x++) data[di+x] = img[i+x];

	else if(type==1) {

		for(var x=  0; x<bpp; x++) data[di+x] =  img[i+x];

		for(var x=bpp; x<bpl; x++) data[di+x] = (img[i+x]-img[i+x-bpp]+256)&255;

	}

	else if(y==0) {

		for(var x=  0; x<bpp; x++) data[di+x] = img[i+x];



		if(type==2) for(var x=bpp; x<bpl; x++) data[di+x] = img[i+x];

		if(type==3) for(var x=bpp; x<bpl; x++) data[di+x] = (img[i+x] - (img[i+x-bpp]>>1) +256)&255;

		if(type==4) for(var x=bpp; x<bpl; x++) data[di+x] = (img[i+x] - paeth(img[i+x-bpp], 0, 0) +256)&255;

	}

	else {

		if(type==2) { for(var x=  0; x<bpl; x++) data[di+x] = (img[i+x]+256 - img[i+x-bpl])&255;  }

		if(type==3) { for(var x=  0; x<bpp; x++) data[di+x] = (img[i+x]+256 - (img[i+x-bpl]>>1))&255;

					  for(var x=bpp; x<bpl; x++) data[di+x] = (img[i+x]+256 - ((img[i+x-bpl]+img[i+x-bpp])>>1))&255;  }

		if(type==4) { for(var x=  0; x<bpp; x++) data[di+x] = (img[i+x]+256 - paeth(0, img[i+x-bpl], 0))&255;

					  for(var x=bpp; x<bpl; x++) data[di+x] = (img[i+x]+256 - paeth(img[i+x-bpp], img[i+x-bpl], img[i+x-bpp-bpl]))&255;  }

	}

}



UPNG.crc = {

	table : ( function() {

	   var tab = new Uint32Array(256);

	   for (var n=0; n<256; n++) {

			var c = n;

			for (var k=0; k<8; k++) {

				if (c & 1)  c = 0xedb88320 ^ (c >>> 1);

				else        c = c >>> 1;

			}

			tab[n] = c;  }

		return tab;  })(),

	update : function(c, buf, off, len) {

		for (var i=0; i<len; i++)  c = UPNG.crc.table[(c ^ buf[off+i]) & 0xff] ^ (c >>> 8);

		return c;

	},

	crc : function(b,o,l)  {  return UPNG.crc.update(0xffffffff,b,o,l) ^ 0xffffffff;  }

}





UPNG.quantize = function(bufs, ps, roundAlpha)

{	

	var imgs = [], totl = 0;

	for(var i=0; i<bufs.length; i++) {  imgs.push(UPNG.encode.alphaMul(new Uint8Array(bufs[i]), roundAlpha));  totl+=bufs[i].byteLength;  }

	

	var nimg = new Uint8Array(totl), nimg32 = new Uint32Array(nimg.buffer), noff=0;

	for(var i=0; i<imgs.length; i++) {

		var img = imgs[i], il = img.length;

		for(var j=0; j<il; j++) nimg[noff+j] = img[j];

		noff += il;

	}

	

	var root = {i0:0, i1:nimg.length, bst:null, est:null, tdst:0, left:null, right:null };  // basic statistic, extra statistic

	root.bst = UPNG.quantize.stats(  nimg,root.i0, root.i1  );  root.est = UPNG.quantize.estats( root.bst );

	var leafs = [root];

	

	while(leafs.length<ps)

	{

		var maxL = 0, mi=0;

		for(var i=0; i<leafs.length; i++) if(leafs[i].est.L > maxL) {  maxL=leafs[i].est.L;  mi=i;  }

		if(maxL<1e-3) break;

		var node = leafs[mi];

		

		var s0 = UPNG.quantize.splitPixels(nimg,nimg32, node.i0, node.i1, node.est.e, node.est.eMq255);

		

		var ln = {i0:node.i0, i1:s0, bst:null, est:null, tdst:0, left:null, right:null };  ln.bst = UPNG.quantize.stats( nimg, ln.i0, ln.i1 );  

		ln.est = UPNG.quantize.estats( ln.bst );

		var rn = {i0:s0, i1:node.i1, bst:null, est:null, tdst:0, left:null, right:null };  rn.bst = {R:[], m:[], N:node.bst.N-ln.bst.N};

		for(var i=0; i<16; i++) rn.bst.R[i] = node.bst.R[i]-ln.bst.R[i];

		for(var i=0; i< 4; i++) rn.bst.m[i] = node.bst.m[i]-ln.bst.m[i];

		rn.est = UPNG.quantize.estats( rn.bst );

		

		node.left = ln;  node.right = rn;

		leafs[mi]=ln;  leafs.push(rn);

	}

	leafs.sort(function(a,b) {  return b.bst.N-a.bst.N;  });

	

	for(var ii=0; ii<imgs.length; ii++) {

		var planeDst = UPNG.quantize.planeDst;

		var sb = new Uint8Array(imgs[ii].buffer), tb = new Uint32Array(imgs[ii].buffer), len = sb.length;

		

		var stack = [], si=0;

		for(var i=0; i<len; i+=4) {

			var r=sb[i]*(1/255), g=sb[i+1]*(1/255), b=sb[i+2]*(1/255), a=sb[i+3]*(1/255);

			

			//  exact, but too slow :(

			//var nd = UPNG.quantize.getNearest(root, r, g, b, a);

			var nd = root;

			while(nd.left) nd = (planeDst(nd.est,r,g,b,a)<=0) ? nd.left : nd.right;

			

			tb[i>>2] = nd.est.rgba;

		}

		imgs[ii]=tb.buffer;

	}

	return {  bufs:imgs, plte:leafs  };

}

UPNG.quantize.getNearest = function(nd, r,g,b,a)

{

	if(nd.left==null) {  nd.tdst = UPNG.quantize.dist(nd.est.q,r,g,b,a);  return nd;  }

	var planeDst = UPNG.quantize.planeDst(nd.est,r,g,b,a);

	

	var node0 = nd.left, node1 = nd.right;

	if(planeDst>0) {  node0=nd.right;  node1=nd.left;  }

	

	var ln = UPNG.quantize.getNearest(node0, r,g,b,a);

	if(ln.tdst<=planeDst*planeDst) return ln;

	var rn = UPNG.quantize.getNearest(node1, r,g,b,a);

	return rn.tdst<ln.tdst ? rn : ln;

}

UPNG.quantize.planeDst = function(est, r,g,b,a) {  var e = est.e;  return e[0]*r + e[1]*g + e[2]*b + e[3]*a - est.eMq;  }

UPNG.quantize.dist     = function(q,   r,g,b,a) {  var d0=r-q[0], d1=g-q[1], d2=b-q[2], d3=a-q[3];  return d0*d0+d1*d1+d2*d2+d3*d3;  }



UPNG.quantize.splitPixels = function(nimg, nimg32, i0, i1, e, eMq)

{

	var vecDot = UPNG.quantize.vecDot;

	i1-=4;

	var shfs = 0;

	while(i0<i1)

	{

		while(vecDot(nimg, i0, e)<=eMq) i0+=4;

		while(vecDot(nimg, i1, e)> eMq) i1-=4;

		if(i0>=i1) break;

		

		var t = nimg32[i0>>2];  nimg32[i0>>2] = nimg32[i1>>2];  nimg32[i1>>2]=t;

		

		i0+=4;  i1-=4;

	}

	while(vecDot(nimg, i0, e)>eMq) i0-=4;

	return i0+4;

}

UPNG.quantize.vecDot = function(nimg, i, e)

{

	return nimg[i]*e[0] + nimg[i+1]*e[1] + nimg[i+2]*e[2] + nimg[i+3]*e[3];

}

UPNG.quantize.stats = function(nimg, i0, i1){

	var R = [0,0,0,0,  0,0,0,0,  0,0,0,0,  0,0,0,0];

	var m = [0,0,0,0];

	var N = (i1-i0)>>2;

	for(var i=i0; i<i1; i+=4)

	{

		var r = nimg[i]*(1/255), g = nimg[i+1]*(1/255), b = nimg[i+2]*(1/255), a = nimg[i+3]*(1/255);

		//var r = nimg[i], g = nimg[i+1], b = nimg[i+2], a = nimg[i+3];

		m[0]+=r;  m[1]+=g;  m[2]+=b;  m[3]+=a;

		

		R[ 0] += r*r;  R[ 1] += r*g;  R[ 2] += r*b;  R[ 3] += r*a;  

		               R[ 5] += g*g;  R[ 6] += g*b;  R[ 7] += g*a; 

		                              R[10] += b*b;  R[11] += b*a;  

		                                             R[15] += a*a;  

	}

	R[4]=R[1];  R[8]=R[2];  R[12]=R[3];  R[9]=R[6];  R[13]=R[7];  R[14]=R[11];

	

	return {R:R, m:m, N:N};

}

UPNG.quantize.estats = function(stats){

	var R = stats.R, m = stats.m, N = stats.N;

	

	var m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3], iN = (N==0 ? 0 : 1/N);

	var Rj = [

		R[ 0] - m0*m0*iN,  R[ 1] - m0*m1*iN,  R[ 2] - m0*m2*iN,  R[ 3] - m0*m3*iN,  

		R[ 4] - m1*m0*iN,  R[ 5] - m1*m1*iN,  R[ 6] - m1*m2*iN,  R[ 7] - m1*m3*iN,

		R[ 8] - m2*m0*iN,  R[ 9] - m2*m1*iN,  R[10] - m2*m2*iN,  R[11] - m2*m3*iN,  

		R[12] - m3*m0*iN,  R[13] - m3*m1*iN,  R[14] - m3*m2*iN,  R[15] - m3*m3*iN 

	];

	

	var A = Rj, M = UPNG.M4;

	var b = [0.5,0.5,0.5,0.5], mi = 0, tmi = 0;

	

	if(N!=0)

	for(var i=0; i<10; i++) {

		b = M.multVec(A, b);  tmi = Math.sqrt(M.dot(b,b));  b = M.sml(1/tmi,  b);

		if(Math.abs(tmi-mi)<1e-9) break;  mi = tmi;

	}	

	//b = [0,0,1,0];  mi=N;

	var q = [m0*iN, m1*iN, m2*iN, m3*iN];

	var eMq255 = M.dot(M.sml(255,q),b);

	

	var ia = (q[3]<0.001) ? 0 : 1/q[3];

	

	return {  Cov:Rj, q:q, e:b, L:mi,  eMq255:eMq255, eMq : M.dot(b,q),

				rgba: (((Math.round(255*q[3])<<24) | (Math.round(255*q[2]*ia)<<16) |  (Math.round(255*q[1]*ia)<<8) | (Math.round(255*q[0]*ia)<<0))>>>0)  };

}

UPNG.M4 = {

	multVec : function(m,v) {

			return [

				m[ 0]*v[0] + m[ 1]*v[1] + m[ 2]*v[2] + m[ 3]*v[3],

				m[ 4]*v[0] + m[ 5]*v[1] + m[ 6]*v[2] + m[ 7]*v[3],

				m[ 8]*v[0] + m[ 9]*v[1] + m[10]*v[2] + m[11]*v[3],

				m[12]*v[0] + m[13]*v[1] + m[14]*v[2] + m[15]*v[3]

			];

	},

	dot : function(x,y) {  return  x[0]*y[0]+x[1]*y[1]+x[2]*y[2]+x[3]*y[3];  },

	sml : function(a,y) {  return [a*y[0],a*y[1],a*y[2],a*y[3]];  }

}



UPNG.encode.alphaMul = function(img, roundA) {

	var nimg = new Uint8Array(img.length), area = img.length>>2; 

	for(var i=0; i<area; i++) {

		var qi=i<<2, ia=img[qi+3];   

		if(roundA) ia = ((ia<128))?0:255;

		var a = ia*(1/255);

		nimg[qi+0] = img[qi+0]*a;  nimg[qi+1] = img[qi+1]*a;  nimg[qi+2] = img[qi+2]*a;  nimg[qi+3] = ia;

	}

	return nimg;

}



	

	

	

	

	





})(UPNG, pako);

})();







const UPNG=__cf.UPNG;



/* MIT iris10086/pic-scramble, commit f85ba3d88860c9a63dd6017c4af6d35914d6e253. Original Gilbert functions copied verbatim; pure-array adapter below. See THIRD_PARTY_NOTICES.txt. */

(function(root){

function gilbert2d(width, height) {

    /**

     * Generalized Hilbert ('gilbert') space-filling curve for arbitrary-sized

     * 2D rectangular grids. Generates discrete 2D coordinates to fill a rectangle

     * of size (width x height).

     */

    const coordinates = [];



    if (width >= height) {

        generate2d(0, 0, width, 0, 0, height, coordinates);

    } else {

        generate2d(0, 0, 0, height, width, 0, coordinates);

    }



    return coordinates;

}



function generate2d(x, y, ax, ay, bx, by, coordinates) {

    const w = Math.abs(ax + ay);

    const h = Math.abs(bx + by);



    const dax = Math.sign(ax), day = Math.sign(ay); // unit major direction

    const dbx = Math.sign(bx), dby = Math.sign(by); // unit orthogonal direction



    if (h === 1) {

        // trivial row fill

        for (let i = 0; i < w; i++) {

            coordinates.push([x, y]);

            x += dax;

            y += day;

        }

        return;

    }



    if (w === 1) {

        // trivial column fill

        for (let i = 0; i < h; i++) {

            coordinates.push([x, y]);

            x += dbx;

            y += dby;

        }

        return;

    }



    let ax2 = Math.floor(ax / 2), ay2 = Math.floor(ay / 2);

    let bx2 = Math.floor(bx / 2), by2 = Math.floor(by / 2);



    const w2 = Math.abs(ax2 + ay2);

    const h2 = Math.abs(bx2 + by2);



    if (2 * w > 3 * h) {

        if ((w2 % 2) && (w > 2)) {

            // prefer even steps

            ax2 += dax;

            ay2 += day;

        }



        // long case: split in two parts only

        generate2d(x, y, ax2, ay2, bx, by, coordinates);

        generate2d(x + ax2, y + ay2, ax - ax2, ay - ay2, bx, by, coordinates);



    } else {

        if ((h2 % 2) && (h > 2)) {

            // prefer even steps

            bx2 += dbx;

            by2 += dby;

        }



        // standard case: one step up, one long horizontal, one step down

        generate2d(x, y, bx2, by2, ax2, ay2, coordinates);

        generate2d(x + bx2, y + by2, ax, ay, bx - bx2, by - by2, coordinates);

        generate2d(x + (ax - dax) + (bx2 - dbx), y + (ay - day) + (by2 - dby),

            -bx2, -by2, -(ax - ax2), -(ay - ay2), coordinates);

    }

}



root.TomatoCore={gilbert2d};

})(__cf);



/* Mathematical error-correction primitives: BCH(63,36,t=5) and Golay(23,12). */

(function(root){'use strict';

const exp=new Int32Array(126),log=new Int32Array(64).fill(-1);let value=1;for(let i=0;i<63;i++){exp[i]=value;log[value]=i;value<<=1;if(value&64)value^=0x43;}for(let i=63;i<126;i++)exp[i]=exp[i-63];

const mul=(a,b)=>!a||!b?0:exp[(log[a]+log[b])%63],div=(a,b)=>{if(!b)throw Error('GF division by zero');return!a?0:exp[(log[a]-log[b]+63)%63];};

function bEncodeWord(message){let raw=message<<27n,remainder=raw,gen=0x86e8113n;for(let i=62;i>=27;i--)if(remainder&(1n<<BigInt(i)))remainder^=gen<<BigInt(i-27);return raw|remainder;}

function evaluate(word,root){let sum=0;for(let degree=0;degree<63;degree++)if(word&(1n<<BigInt(degree)))sum^=exp[(root*degree)%63];return sum;}

function bDecodeWord(word){let s=Array.from({length:10},(_,i)=>evaluate(word,i+1));if(s.every(v=>!v))return{message:word>>27n,corrected:0};let c=[1,...Array(10).fill(0)],b=c.slice(),length=0,m=1,last=1;for(let n=0;n<10;n++){let d=s[n];for(let j=1;j<=length;j++)d^=mul(c[j],s[n-j]);if(!d){m++;continue;}let saved=c.slice(),factor=div(d,last);for(let j=0;j<11-m;j++)c[j+m]^=mul(factor,b[j]);if(2*length<=n){length=n+1-length;b=saved;last=d;m=1;}else m++;}let positions=[];for(let p=0;p<63;p++){let test=c[0];for(let j=1;j<=length;j++)test^=mul(c[j],exp[((-p*j)%63+63)%63]);if(!test)positions.push(p);}if(positions.length!==length||length>5)throw Error('BCH 超出纠错能力');for(let p of positions)word^=1n<<BigInt(p);if(Array.from({length:10},(_,i)=>evaluate(word,i+1)).some(Boolean))throw Error('BCH 校验失败');return{message:word>>27n,corrected:length};}

function bchEncode(data){let source='';for(let v of data)source+=v.toString(2).padStart(8,'0');source=source.padEnd(Math.ceil(source.length/36)*36,'0');let bits=[];for(let i=0;i<source.length;i+=36){let word=bEncodeWord(BigInt('0b'+source.slice(i,i+36)));for(let j=62;j>=0;j--)bits.push(Number((word>>BigInt(j))&1n));}return bits;}

function bchDecode(bits){if(bits.length%63)throw Error('Invalid BCH length');let all='',corrected=0;for(let i=0;i<bits.length;i+=63){let word=0n;for(let bit of bits.slice(i,i+63))word=(word<<1n)|BigInt(bit);let result=bDecodeWord(word);all+=result.message.toString(2).padStart(36,'0');corrected+=result.corrected;}let data=new Uint8Array(Math.floor(all.length/8));for(let i=0;i<data.length;i++)data[i]=parseInt(all.slice(i*8,i*8+8),2);return{data,corrected};}

root.MisanECC={bchEncode,bchDecode};

})(__cf);



const MisanECC=__cf.MisanECC;



(function(root){'use strict';

function encode(raw,w,h){let out=[],prev=[],older=[];for(let y=0;y<h;y++){let edges=[],last=0;for(let x=0;x<w;x++){let i=y*w+x,v=(raw[i>>3]>>(7-i%8))&1;if(v!==last){edges.push(x);last=v;}}out.push(edges.length);for(let i=0;i<edges.length;i++){let pred=prev.length===edges.length&&older.length===edges.length?2*prev[i]-older[i]:prev.length===edges.length?prev[i]:i?edges[i-1]+1:0,d=edges[i]-pred,v=d>=0?2*d:-2*d-1;while(v>=128){out.push((v&127)|128);v>>=7;}out.push(v);}older=prev;prev=edges;}return Uint8Array.from(out);}

function decode(data,w,h){let p=0,prev=[],older=[],raw=new Uint8Array(Math.ceil(w*h/8));for(let y=0;y<h;y++){if(p>=data.length)throw Error('Truncated transitions');let n=data[p++],edges=[];if(n>w)throw Error('Transition count');for(let i=0;i<n;i++){let v=0,shift=0,done=false;for(let k=0;k<3;k++){if(p>=data.length)throw Error('Truncated transition');let b=data[p++];v|=(b&127)<<shift;shift+=7;if(b<128){done=true;break;}}if(!done)throw Error('Invalid varint');let pred=prev.length===n&&older.length===n?2*prev[i]-older[i]:prev.length===n?prev[i]:i?edges[i-1]+1:0,x=pred+(v%2?-Math.floor(v/2)-1:v/2);if(x<0||x>=w||(i&&x<=edges[i-1]))throw Error('Invalid transition');edges.push(x);}for(let i=0;i<n;i+=2)for(let x=edges[i];x<(i+1<n?edges[i+1]:w);x++){let at=y*w+x;raw[at>>3]|=1<<(7-at%8);}older=prev;prev=edges;}let canonical=encode(raw,w,h);if(p!==data.length||canonical.length!==data.length||canonical.some((v,i)=>v!==data[i]))throw Error('Noncanonical transitions');return raw;}

function unpack(data,w,h){let raw=pako.inflate(data);if(raw.length>h*(1+3*w))throw Error('Transition bound');return decode(raw,w,h);}

root.BoundaryGeometry={encode,decode,unpack};if(typeof module!=='undefined')module.exports=root.BoundaryGeometry;

})(__cf);





/* Geometry-only, causal binary arithmetic codec. Pixels are never byte-encoded. */

(function(root){'use strict';

const ctx=[[-1,0],[-2,0],[-2,-1],[-1,-1],[0,-1],[1,-1],[2,-1],[-1,-2],[0,-2]],HALF=2147483648,Q=1073741824,FULL=4294967296;

function dimensions(w,h){if(!Number.isInteger(w)||!Number.isInteger(h)||w<1||h<1||w>255||h>255)throw Error('Invalid mask dimensions');}

function encode(raw,w,h){dimensions(w,h);let p=new Uint8Array((h+2)*(w+4)),stride=w+4,c0=new Uint32Array(512).fill(1),c1=c0.slice(),lo=0,hi=FULL-1,pending=0,out=[],nb=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++)p[(y+2)*stride+x+2]=(raw[(y*w+x)>>3]>>(7-(y*w+x)%8))&1;

 function put(v){if(nb%8===0)out.push(0);out[out.length-1]|=v<<(7-nb%8);nb++;}function emit(v){put(v);while(pending>0){put(1-v);pending--;}}

 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let at=(y+2)*stride+x+2,index=0;for(let[dx,dy]of ctx)index=index*2+p[at+dy*stride+dx];let v=p[at],cut=lo+Math.floor((hi-lo+1)*c0[index]/(c0[index]+c1[index]));if(v)lo=cut;else hi=cut-1;for(;;){if(hi<HALF)emit(0);else if(lo>=HALF){emit(1);lo-=HALF;hi-=HALF;}else if(lo>=Q&&hi<3*Q){pending++;lo-=Q;hi-=Q;}else break;lo*=2;hi=hi*2+1;}if(v)c1[index]++;else c0[index]++;if(c0[index]+c1[index]>=16384){c0[index]=Math.floor((c0[index]+1)/2);c1[index]=Math.floor((c1[index]+1)/2);}}

 pending++;emit(lo<Q?0:1);for(let i=0;i<32;i++)put(0);return Uint8Array.from(out);}

function decode(data,w,h){dimensions(w,h);let p=new Uint8Array((h+2)*(w+4)),stride=w+4,c0=new Uint32Array(512).fill(1),c1=c0.slice(),lo=0,hi=FULL-1,pos=0,code=0;

 function get(){if(pos>=data.length*8)throw Error('Truncated arithmetic mask');let v=(data[pos>>3]>>(7-pos%8))&1;pos++;return v;}for(let i=0;i<32;i++)code=code*2+get();

 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let at=(y+2)*stride+x+2,index=0;for(let[dx,dy]of ctx)index=index*2+p[at+dy*stride+dx];let cut=lo+Math.floor((hi-lo+1)*c0[index]/(c0[index]+c1[index])),v=Number(code>=cut);p[at]=v;if(v)lo=cut;else hi=cut-1;for(;;){if(hi<HALF){}else if(lo>=HALF){code-=HALF;lo-=HALF;hi-=HALF;}else if(lo>=Q&&hi<3*Q){code-=Q;lo-=Q;hi-=Q;}else break;lo*=2;hi=hi*2+1;code=code*2+get();}if(v)c1[index]++;else c0[index]++;if(c0[index]+c1[index]>=16384){c0[index]=Math.floor((c0[index]+1)/2);c1[index]=Math.floor((c1[index]+1)/2);}}

 let raw=new Uint8Array(Math.ceil(w*h/8));for(let y=0;y<h;y++)for(let x=0;x<w;x++){let i=y*w+x;raw[i>>3]|=p[(y+2)*stride+x+2]<<(7-i%8);}let canonical=encode(raw,w,h);if(canonical.length!==data.length||canonical.some((v,i)=>v!==data[i]))throw Error('Noncanonical arithmetic mask');return raw;}

function pack(raw,w,h,enhanced=false){let a=encode(raw,w,h),b=pako.deflate(raw,{level:9}),body=a.length<b.length?a:b,out=new Uint8Array(body.length+1);out[0]=Number(a.length<b.length);out.set(body,1);if(enhanced){let boundary=root.BoundaryGeometry,c=pako.deflate(boundary.encode(raw,w,h),{level:9});if(c.length+1<out.length){out=new Uint8Array(c.length+1);out[0]=2;out.set(c,1);}}return out;}

function unpack(data,w,h,inflate){dimensions(w,h);if(!data.length)throw Error('Empty mask');if(data[0]===0)return inflate(data.subarray(1),Math.ceil(w*h/8));if(data[0]===1)return decode(data.subarray(1),w,h);if(data[0]===2)return(root.BoundaryGeometry).unpack(data.subarray(1),w,h);throw Error('Invalid mask mode');}

root.GeometryMask={encode,decode,pack,unpack};if(typeof module!=='undefined')module.exports=root.GeometryMask;

})(__cf);





/* Locally contrasting adaptive ink. Payload and its guard samples stay untouched. */

(function(root){'use strict';

function localRadius(s,w,h,x,y,radius){let n=0,sx=0,sy=0,sxx=0,syy=0,sxy=0;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){let xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=w||yy>=h||s[yy*w+xx]<128)continue;n++;sx+=dx;sy+=dy;sxx+=dx*dx;syy+=dy*dy;sxy+=dx*dy;}let cx=n*sxx-sx*sx,cy=n*syy-sy*sy,xy=n*sxy-sx*sy,scores=[2*cx,2*cy,cx+cy+2*xy,cx+cy-2*xy],id=0;for(let i=1;i<4;i++)if(scores[i]>scores[id])id=i;let[vx,vy]=[[0,1],[1,0],[1,-1],[1,1]][id],step=vx&&vy?23:16,result=radius;for(let sign of [-1,1]){let start=0;for(let k=1;k<=Math.floor((2*radius+80)/16);k++){let xx=x+sign*vx*k,yy=y+sign*vy*k;if(xx<0||yy<0||xx>=w||yy>=h)break;let v=s[yy*w+xx];if(!start&&v<16)start=k;if(start&&v>=128&&k-start<3)start=0;if(start&&v>=128){result=Math.min(result,Math.max(16,Math.floor(((k-start)*step-32)/2)));break;}}}return result;}

function radiusEnvelope(a,w,h){for(let y=0;y<h;y++)for(let x=0;x<w;x++){let p=y*w+x,v=a[p];if(x)v=Math.min(v,a[p-1]+16);if(y){v=Math.min(v,a[p-w]+16);if(x)v=Math.min(v,a[p-w-1]+23);if(x+1<w)v=Math.min(v,a[p-w+1]+23);}a[p]=Math.min(4095,v);}for(let y=h-1;y>=0;y--)for(let x=w-1;x>=0;x--){let p=y*w+x,v=a[p];if(x+1<w)v=Math.min(v,a[p+1]+16);if(y+1<h){v=Math.min(v,a[p+w]+16);if(x)v=Math.min(v,a[p+w-1]+23);if(x+1<w)v=Math.min(v,a[p+w+1]+23);}a[p]=Math.min(4095,v);}}

function field(base,w,h){let n=w*h,short=Math.min(w,h),radius=Math.max(16,Math.floor((short*16+81)/162)),halo=Math.min(32,Math.max(16,Math.floor((short*16+600)/1200))),s=new Uint8Array(n),d=new Int32Array(n),B=4096,cap=4095*B+radius;for(let p=0;p<n;p++)s[p]=255-base[p*4];for(let y=0;y<h;y++)for(let x=0;x<w;x++){let p=y*w+x,r=s[p]?localRadius(s,w,h,x,y,radius):radius;d[p]=s[p]?r:4095;}radiusEnvelope(d,w,h);for(let p=0;p<n;p++)d[p]=(s[p]?Math.floor(((255-s[p])*16+127)/255):4095)*B+(s[p]?d[p]:radius);for(let y=0;y<h;y++)for(let x=0;x<w;x++){let p=y*w+x,v=d[p];if(x)v=Math.min(v,d[p-1]+16*B);if(y){v=Math.min(v,d[p-w]+16*B);if(x)v=Math.min(v,d[p-w-1]+23*B);if(x+1<w)v=Math.min(v,d[p-w+1]+23*B);}d[p]=Math.min(cap,v);}for(let y=h-1;y>=0;y--)for(let x=w-1;x>=0;x--){let p=y*w+x,v=d[p];if(x+1<w)v=Math.min(v,d[p+1]+16*B);if(y+1<h){v=Math.min(v,d[p+w]+16*B);if(x)v=Math.min(v,d[p+w-1]+23*B);if(x+1<w)v=Math.min(v,d[p+w+1]+23*B);}d[p]=Math.min(cap,v);}let inner=new Uint8Array(n),outer=new Uint8Array(n);for(let p=0;p<n;p++){let r=d[p]%B,dd=Math.floor(d[p]/B),hh=Math.min(halo,Math.max(8,Math.floor(r/4)));inner[p]=Math.floor((Math.max(0,Math.min(16,r-hh+16-dd))*255+8)/16);outer[p]=Math.floor((Math.max(0,Math.min(16,r+16-dd))*255+8)/16);}return{inner,outer,info:{stroke_expansion_px:radius/16,stroke_halo_px:halo/16}};}

const palette=[[248,240,16],[248,168,16],[248,88,24],[248,40,64],[240,24,208],[168,48,248],[48,96,248],[16,224,248],[128,240,24],[244,244,244],[12,12,12],[16,32,88],[112,16,104],[12,72,32]];

function accent(out,base,state,w,h,bg,outer){let step=Math.max(1,Math.ceil(Math.min(w,h)/128)),samples=[];for(let y=0;y<h;y+=step)for(let x=0;x<w;x+=step){let p=y*w+x;if(!outer[p])continue;samples.push(state[p]?[out[p*4],out[p*4+1],out[p*4+2]]:[bg[p*3],bg[p*3+1],bg[p*3+2]]);}if(!samples.length)for(let y=0;y<h;y+=step)for(let x=0;x<w;x+=step){let p=y*w+x;samples.push([bg[p*3],bg[p*3+1],bg[p*3+2]]);}let best=palette[0],score=-Infinity;for(let c of palette){let cy=(c[0]*19595+c[1]*38470+c[2]*7471+32768)>>16,hist=new Uint32Array(2048),sum=0,near=0;for(let b of samples){let by=(b[0]*19595+b[1]*38470+b[2]*7471+32768)>>16,d=4*Math.abs(cy-by)+Math.abs(c[0]-c[1]-b[0]+b[1])+Math.floor(Math.abs(2*c[2]-c[0]-c[1]-2*b[2]+b[0]+b[1])/2);hist[d]++;sum+=d;if(d<200)near++;}let rank=Math.max(1,Math.ceil(samples.length/5)),n=0,q=0;for(;q<2048;q++){n+=hist[q];if(n>=rank)break;}let value=4*q+2*Math.floor(sum/samples.length)+Math.max(...c)-Math.min(...c)-Math.floor(near*1000/samples.length);if(value>score){score=value;best=c;}}return best;}

function reservation(base,w,h){return Uint8Array.from(field(base,w,h).outer,v=>Number(v===255));}

function render(out,base,state,w,h,bg){let f=field(base,w,h),fg=accent(out,base,state,w,h,bg,f.outer),lum=(fg[0]*19595+fg[1]*38470+fg[2]*7471+32768)>>16,border=lum>=128?12:244;for(let p=0;p<w*h;p++){if(state[p])continue;let a=f.inner[p],b=f.outer[p];for(let c=0;c<3;c++){let ring=Math.floor((bg[p*3+c]*(255-b)+border*b+127)/255);out[p*4+c]=Math.floor((ring*(255-a)+fg[c]*a+127)/255);}}return{...f.info,accent:fg};}

root.MisanStroke={render,field,reservation,accent};if(typeof module!=='undefined')module.exports=root.MisanStroke;

})(__cf);





/* Local deterministic line abstraction, topology thinning and colour gap guide. */

(function(root){'use strict';

function gray(data){let a=new Int32Array(data.length/4);for(let i=0;i<a.length;i++)a[i]=(data[i*4]*19595+data[i*4+1]*38470+data[i*4+2]*7471+32768)>>16;return a;}

function blur(a,w,h){let t=new Int32Array(a.length),o=new Int32Array(a.length),k=[1,4,6,4,1];for(let y=0;y<h;y++)for(let x=0;x<w;x++){let n=8;for(let d=-2;d<=2;d++)n+=k[d+2]*a[y*w+Math.max(0,Math.min(w-1,x+d))];t[y*w+x]=Math.floor(n/16);}for(let y=0;y<h;y++)for(let x=0;x<w;x++){let n=8;for(let d=-2;d<=2;d++)n+=k[d+2]*t[Math.max(0,Math.min(h-1,y+d))*w+x];o[y*w+x]=Math.floor(n/16);}return o;}

function skeleton(ink,w,h){ink=ink.slice();let at=(x,y)=>x<0||y<0||x>=w||y>=h?0:ink[y*w+x];for(let it=0;it<48;it++){let changed=false;for(let phase=0;phase<2;phase++){let kill=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++){let p=y*w+x;if(!ink[p])continue;let n=[at(x,y-1),at(x+1,y-1),at(x+1,y),at(x+1,y+1),at(x,y+1),at(x-1,y+1),at(x-1,y),at(x-1,y-1)],count=n.reduce((a,b)=>a+b,0),turn=0;for(let j=0;j<8;j++)if(!n[j]&&n[(j+1)%8])turn++;if(count>=2&&count<=6&&turn===1&&!(n[0]&&n[2]&&n[phase?6:4])&&!(n[phase?0:2]&&n[4]&&n[6]))kill.push(p);}for(let p of kill)ink[p]=0;if(kill.length)changed=true;}if(!changed)break;}return ink;}

function drawing(data,w,h,strength=0){let g=gray(data),white=0,black=0;for(let v of g){if(v>=240)white++;if(v<96)black++;}if(white>g.length*.65&&black<g.length*.25)return skeleton(Uint8Array.from(g,v=>Number(v<144)),w,h);g=blur(blur(g,w,h),w,h);let gx=new Int32Array(g.length),gy=new Int32Array(g.length),mag=new Uint8Array(g.length),thin=new Uint8Array(g.length),hist=new Uint32Array(256),at=(a,x,y)=>a[Math.max(0,Math.min(h-1,y))*w+Math.max(0,Math.min(w-1,x))];for(let y=0;y<h;y++)for(let x=0;x<w;x++){let p=y*w+x,tl=at(g,x-1,y-1),tc=at(g,x,y-1),tr=at(g,x+1,y-1),ml=at(g,x-1,y),mr=at(g,x+1,y),bl=at(g,x-1,y+1),bc=at(g,x,y+1),br=at(g,x+1,y+1);gx[p]=-tl+tr-2*ml+2*mr-bl+br;gy[p]=-tl-2*tc-tr+bl+2*bc+br;mag[p]=Math.min(255,Math.floor((Math.abs(gx[p])+Math.abs(gy[p])+4)/8));}let val=(x,y)=>x<0||y<0||x>=w||y>=h?0:mag[y*w+x];for(let y=0;y<h;y++)for(let x=0;x<w;x++){let p=y*w+x,ax=Math.abs(gx[p]),ay=Math.abs(gy[p]),dx=ax>2*ay?1:ay>2*ax?0:1,dy=ax>2*ay?0:ay>2*ax?1:gx[p]*gy[p]>=0?1:-1;if(mag[p]>=val(x-dx,y-dy)&&mag[p]>val(x+dx,y+dy)){thin[p]=mag[p];if(mag[p]>=6)hist[mag[p]]++;}}let total=hist.reduce((a,b)=>a+b,0),sum=0,high=0;for(;high<255;high++){sum+=hist[high];if(sum>=total*[.60,.78,.90,.96][strength])break;}high=Math.max(12,high);let low=Math.max(6,Math.floor(high*[.5,.65,.8,.9][strength])),seen=new Uint8Array(g.length),ink=new Uint8Array(g.length);for(let seed=0;seed<thin.length;seed++){if(seen[seed]||thin[seed]<high)continue;let stack=[seed],component=[];seen[seed]=1;while(stack.length){let p=stack.pop(),x=p%w,y=Math.floor(p/w);component.push(p);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){let xx=x+dx,yy=y+dy,j=yy*w+xx;if(xx>=0&&yy>=0&&xx<w&&yy<h&&!seen[j]&&thin[j]>=low){seen[j]=1;stack.push(j);}}}if(component.length>=Math.max(8+strength*8,Math.floor(w/48)))for(let p of component)ink[p]=1;}return ink;}

function fraction(ink,w,h,short){let ow=w>=h?Math.floor(short*w/h+.5):short,oh=h>w?Math.floor(short*h/w+.5):short,pitch=w+1,s=new Int32Array((w+1)*(h+1));for(let y=0;y<h;y++)for(let x=0;x<w;x++){let p=(y+1)*pitch+x+1;s[p]=ink[y*w+x]+s[p-1]+s[p-pitch]-s[p-pitch-1];}let good=0,total=0;for(let y=0;y<Math.floor(oh/16);y++)for(let x=Math.ceil(ow/256);x<Math.floor(15*ow/256);x++){let x0=Math.max(0,Math.floor(x*16*w/ow)-1),x1=Math.min(w,Math.ceil((x+1)*16*w/ow)+1),y0=Math.max(0,Math.floor(y*16*h/oh)-1),y1=Math.min(h,Math.ceil((y+1)*16*h/oh)+1);if(s[y1*pitch+x1]-s[y0*pitch+x1]-s[y1*pitch+x0]+s[y0*pitch+x0]===0)good++;total++;}return good/Math.max(1,total);}

function prepare(data,w,h,count,resize){let short=Math.max(640,Math.floor(Math.sqrt(count*256*Math.min(w,h)/Math.max(w,h)/.65))),best=null;for(let[size,strength]of [[1024,0]]){let scale=Math.min(1,size/Math.max(w,h)),cw=Math.max(8,Math.floor(w*scale+.5)),ch=Math.max(8,Math.floor(h*scale+.5)),rgb=resize(data,w,h,cw,ch,true),rgba=new Uint8ClampedArray(cw*ch*4);for(let p=0;p<cw*ch;p++){rgba.set(rgb.subarray(p*3,p*3+3),p*4);rgba[p*4+3]=255;}let ink=drawing(rgba,cw,ch,strength),ratio=fraction(ink,cw,ch,short);for(let i=0;i<ink.length;i++){let v=ink[i]?0:255;rgba.set([v,v,v,255],i*4);}if(!best||ratio>best.info.sketch_free_fraction)best={data:rgba,width:cw,height:ch,info:{sketch_level:size,sketch_strength:strength,sketch_free_fraction:ratio,sketch_ink_fraction:ink.reduce((a,b)=>a+b,0)/ink.length}};if(ratio>=.72)break;}return best;}

function boxes(w,h){let r=4*Math.max(2,Math.floor(Math.min(w,h)/320+.5))+3;return[1/32,31/32].flatMap(y=>[1/8,7/8].map(x=>[x*w,y*h,r]));}

function paint(out,base,state,w,h,resize){let gw=Math.ceil(w/8),gh=Math.ceil(h/8),guide=new Int32Array(gw*gh*3),known=new Uint8Array(gw*gh),total=0;for(let y=0;y<gh;y++)for(let x=0;x<gw;x++){let s=[0,0,0],n=0;for(let yy=y*8;yy<Math.min(h,y*8+8);yy++)for(let xx=x*8;xx<Math.min(w,x*8+8);xx++){let p=yy*w+xx;if(state[p]!==1)continue;n++;for(let c=0;c<3;c++)s[c]+=out[p*4+c];}if(n){let p=y*gw+x;known[p]=1;total++;for(let c=0;c<3;c++)guide[p*3+c]=Math.floor((s[c]+Math.floor(n/2))/n);}}if(!total)guide.fill(128);for(let it=0;total&&total<known.length&&it<gw+gh;it++){let next=known.slice(),g=guide.slice();for(let y=0;y<gh;y++)for(let x=0;x<gw;x++){let p=y*gw+x;if(known[p])continue;let s=[0,0,0],n=0;for(let[dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){let xx=x+dx,yy=y+dy,j=yy*gw+xx;if(xx<0||yy<0||xx>=gw||yy>=gh||!known[j])continue;n++;for(let c=0;c<3;c++)s[c]+=guide[j*3+c];}if(n){next[p]=1;total++;for(let c=0;c<3;c++)g[p*3+c]=Math.floor((s[c]+Math.floor(n/2))/n);}}known=next;guide=g;}for(let it=0;it<3;it++)for(let c=0;c<3;c++){let plane=Int32Array.from({length:gw*gh},(_,i)=>guide[i*3+c]),b=blur(plane,gw,gh);for(let i=0;i<b.length;i++)guide[i*3+c]=b[i];}let g4=new Uint8ClampedArray(gw*gh*4);for(let p=0;p<gw*gh;p++){g4.set(guide.subarray(p*3,p*3+3),p*4);g4[p*4+3]=255;}let bg=resize(g4,gw,gh,w,h,true),stroke=root.MisanStroke;return stroke.render(out,base,state,w,h,bg);}

root.MisanSketch={prepare,paint,boxes,drawing,skeleton};if(typeof module!=='undefined')module.exports=root.MisanSketch;

})(__cf);





/* Four circular anchors; no file metadata or external reference required. */

(function(root){'use strict';

function draw(out,w,h){let u=Math.max(2,Math.floor(Math.min(w,h)/320+.5));for(let yy of[1/32,31/32])for(let xx of[1/8,7/8]){let cx=w*xx,cy=h*yy,r=4*u;for(let y=Math.max(0,Math.floor(cy-r-1));y<Math.min(h,Math.floor(cy+r+2));y++)for(let x=Math.max(0,Math.floor(cx-r-1));x<Math.min(w,Math.floor(cx+r+2));x++){let d=(x+.5-cx)**2+(y+.5-cy)**2,v=d<=u*u?12:d<=4*u*u?255:d<=9*u*u?12:d<=16*u*u?255:-1;if(v>=0)for(let c=0;c<3;c++)out[(y*w+x)*4+c]=v;}}}

function locate(data,w,h){let gray=new Uint8Array(w*h);for(let p=0;p<gray.length;p++)gray[p]=(data[p*4]*19595+data[p*4+1]*38470+data[p*4+2]*7471+32768)>>16;let dark=(x,y)=>gray[y*w+x]<128,found=[];outer:for(let y=1;y<h-1;y++){let starts=[0],ends=[],prev=dark(0,y);for(let x=1;x<w;x++){let v=dark(x,y);if(v!==prev){ends.push(x);starts.push(x);prev=v;}}ends.push(w);for(let k=2;k<starts.length-2;k++){if(!dark(starts[k],y))continue;let rr=[];for(let j=-2;j<=2;j++)rr.push(ends[k+j]-starts[k+j]);let u=rr.reduce((a,b)=>a+b,0)/6;if(u<1||u>Math.max(w,h)/40||rr.some((v,j)=>Math.abs(v-u*(j===2?2:1))>u*.7))continue;let cx=(starts[k]+ends[k])/2,x=Math.min(w-1,Math.floor(cx));if(found.some(f=>(cx-f[0])**2+(y+.5-f[1])**2<=(2*f[2])**2))continue;let top=y,bottom=y+1;while(top>0&&dark(x,top-1))top--;while(bottom<h&&dark(x,bottom))bottom++;let up=top-1;while(up>=0&&!dark(x,up))up--;let up2=up;while(up2>=0&&dark(x,up2))up2--;let down=bottom;while(down<h&&!dark(x,down))down++;let down2=down;while(down2<h&&dark(x,down2))down2++;let vr=[up-up2,top-1-up,bottom-top,down-bottom,down2-down],v=vr.reduce((a,b)=>a+b,0)/6;if(Math.abs(v/u-1)>.35||vr.some((n,j)=>Math.abs(n-v*(j===2?2:1))>v*.7))continue;let cy=(top+bottom)/2;u=(u+v)/2;let r=3.6*u,x0=Math.max(0,Math.floor(cx-r)),x1=Math.min(w,Math.ceil(cx+r)),y0=Math.max(0,Math.floor(cy-r)),y1=Math.min(h,Math.ceil(cy+r)),sum=0,sx=0,sy=0;for(let yy=y0;yy<y1;yy++)for(let xx=x0;xx<x1;xx++){if((xx+.5-cx)**2+(yy+.5-cy)**2>r*r)continue;let wt=Math.max(0,200-gray[yy*w+xx]);sum+=wt;sx+=(xx+.5)*wt;sy+=(yy+.5)*wt;}if(!sum)continue;cx=sx/sum;cy=sy/sum;let s=[0,0,0,0],n=[0,0,0,0],ranges=[[0,.8],[1.2,1.8],[2.2,2.8],[3.2,3.7]];for(let yy=y0;yy<y1;yy++)for(let xx=x0;xx<x1;xx++){let rad=Math.hypot(xx+.5-cx,yy+.5-cy)/u;for(let j=0;j<4;j++)if(rad>=ranges[j][0]&&rad<=ranges[j][1]){s[j]+=gray[yy*w+xx];n[j]++;}}let means=s.map((a,j)=>n[j]?a/n[j]:128);if(Math.min(means[1]-means[0],means[1]-means[2],means[3]-means[2])<65)continue;found.push([cx,cy,u]);if(found.length>=64)break outer;}}

let best=null;for(let a of found)for(let b of found){let span=b[0]-a[0];if(span<128||Math.abs(b[1]-a[1])>Math.max(2,span*.004)||Math.abs(b[2]/a[2]-1)>.25)continue;for(let c of found){let tall=c[1]-a[1];if(tall<128||Math.abs(c[0]-a[0])>Math.max(2,tall*.004)||Math.abs(c[2]/a[2]-1)>.25)continue;for(let d of found){if(Math.abs(d[0]-b[0])>Math.max(2,tall*.004)||Math.abs(d[1]-c[1])>Math.max(2,span*.004)||Math.abs(d[2]/a[2]-1)>.25)continue;let ww=((b[0]+d[0])-(a[0]+c[0]))/1.5,hh=((c[1]+d[1])-(a[1]+b[1]))/1.875,left=(a[0]+c[0])/2-ww/8,top=(a[1]+b[1])/2-hh/32;if(left<-.8||top<-.8||left+ww>w+.8||top+hh>h+.8)continue;if(!best||ww*hh>best[0])best=[ww*hh,left,top,ww,hh];}}}if(!best)return{data,width:w,height:h,info:{screenshot_registered:false,markers:found.length}};let[,l,t,ww,hh]=best,x=Math.max(0,Math.floor(l+.5)),y=Math.max(0,Math.floor(t+.5)),x1=Math.min(w,Math.floor(l+ww+.5)),y1=Math.min(h,Math.floor(t+hh+.5)),out=new Uint8ClampedArray((x1-x)*(y1-y)*4);for(let yy=y;yy<y1;yy++)out.set(data.subarray((yy*w+x)*4,(yy*w+x1)*4),(yy-y)*(x1-x)*4);return{data:out,width:x1-x,height:y1-y,info:{screenshot_registered:x!==0||y!==0||x1!==w||y1!==h,markers:4,bounds:[x,y,x1,y1]}};}

root.MisanFrame={draw,locate};if(typeof module!=='undefined')module.exports=root.MisanFrame;

})(__cf);





/* Keyed contour transport only. The payload has already been tomato-scrambled. */

(function(root){'use strict';

async function plan(m,key,mask,curve,stream){

 const nx=Math.floor(m.ow/16),ny=Math.floor(m.oh/16),sc=Math.ceil(m.w/16),sr=Math.ceil(m.h/16),cm=Uint8Array.from(atob(m.mask),c=>c.charCodeAt(0)),free=new Uint8Array(nx*ny),ii=new Int32Array((nx+1)*(ny+1)),si=new Int32Array((sc+1)*(sr+1)),out=[],dest=[],rng=stream(key,'payload-rectangles'),cache=new Map();

 for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){let mx=Math.min(m.c-1,Math.floor(((x+1)*m.c-1)/nx)),my=Math.min(m.r-1,Math.floor(((y+1)*m.r-1)/ny)),i=my*m.c+mx;free[y*nx+x]=Number(x>=(m.d>=14?Math.ceil(m.ow/512):m.d>=13?Math.ceil(m.ow/256):Math.floor((Math.ceil(m.ow/64)+1)/2))&&x<(m.d>=14?Math.floor(31*m.ow/512):m.d>=13?Math.floor(15*m.ow/256):Math.floor(Math.floor(7*m.ow/64)/2))&&!!(cm[i>>3]&(1<<(7-i%8))));ii[(y+1)*(nx+1)+x+1]=free[y*nx+x]+ii[y*(nx+1)+x+1]+ii[(y+1)*(nx+1)+x]-ii[y*(nx+1)+x];}

 for(let y=0;y<sr;y++)for(let x=0;x<sc;x++)si[(y+1)*(sc+1)+x+1]=mask[y*sc+x]+si[y*(sc+1)+x+1]+si[(y+1)*(sc+1)+x]-si[y*(sc+1)+x];

 const gcd=(a,b)=>{while(b){let t=a%b;a=b;b=t;}return a;};

 async function locate(w,h){let name=w+','+h;if(!cache.has(name)){let a=[];for(let y=0;y<=ny-h;y++)for(let x=0;x<=nx-w;x++){let sum=ii[(y+h)*(nx+1)+x+w]-ii[y*(nx+1)+x+w]-ii[(y+h)*(nx+1)+x]+ii[y*(nx+1)+x];if(sum===w*h)a.push(y*nx+x);}let n=a.length,start=n?await rng(n):0,stride=997;while(n&&gcd(stride,n)!==1)stride+=2;cache.set(name,{a,start,stride,cursor:0});}let s=cache.get(name);while(s.cursor<s.a.length){let tile=s.a[(s.start+s.cursor*s.stride)%s.a.length];s.cursor++;let x=tile%nx,y=Math.floor(tile/nx),ok=true;for(let v=0;v<h&&ok;v++)for(let u=0;u<w;u++)if(!free[(y+v)*nx+x+u]){ok=false;break;}if(ok)return[x,y];}return null;}

 async function place(x,y,w,h){let count=si[(y+h)*(sc+1)+x+w]-si[y*(sc+1)+x+w]-si[(y+h)*(sc+1)+x]+si[y*(sc+1)+x];if(!count)return;let target=count===w*h?await locate(w,h):null;if(target){let[dx,dy]=target;for(let v=0;v<h;v++)for(let u=0;u<w;u++){let d=(dy+v)*nx+dx+u;free[d]=0;out.push((y+v)*sc+x+u);dest.push(d);}return;}if(w===1&&h===1)throw Error('轮廓填充容量不足');if(w>=h&&w>1){let cut=Math.floor(w/2);await place(x,y,cut,h);await place(x+cut,y,w-cut,h);}else{let cut=Math.floor(h/2);await place(x,y,w,cut);await place(x,y+cut,w,h-cut);}}

 let maximum=m.d>=15?1:m.d>=14?64:8,regions=[];for(let y=0;y<sr;y+=maximum)for(let x=0;x<sc;x+=maximum)regions.push([x,y,Math.min(maximum,sc-x),Math.min(maximum,sr-y)]);for(let i=regions.length-1;i>0;i--){let j=await rng(i+1);[regions[i],regions[j]]=[regions[j],regions[i]];}for(let args of regions)await place(...args);if(out.length!==m.k)throw Error('载荷映射不完整');if(m.a){let remaining=Array.from(curve(nx,ny)).filter(i=>free[i]);if(remaining.length<out.length)throw Error('透明层容量不足');let start=await rng(remaining.length-out.length+1);for(let t of remaining.slice(start,start+out.length))dest.push(t);}return{order:Uint32Array.from(out),tiles:Uint32Array.from(dest)};

}

root.PayloadPacking={plan};if(typeof module!=='undefined')module.exports=root.PayloadPacking;

})(__cf);





/* Gilbert fragments / source-plane reconstruction.

 * Gilbert traversal and phase adapted from iris10086/pic-scramble, MIT.

 * Sampling-cell adaptation and source-plane reconstruction are local changes.

 */

(function(root){'use strict';

const round=v=>Math.floor(v+.5),clamp=(v,n)=>Math.max(0,Math.min(n-1,v)),q8=v=>round(v*256)/256;

async function plan(w,h,key,mask,tiles,ow,tomato,stream){

 const nx=Math.ceil(w/16),path=tomato.gilbert2d(nx,Math.ceil(h/16)).map(([x,y])=>y*nx+x).filter(i=>mask[i]),n=path.length;

 if(!n)return new Uint32Array(0);

 const phase=round((Math.sqrt(5)-1)/2*n),s=path.slice(n-phase).concat(path.slice(0,n-phase)),dn=Math.floor(ow/16),cuts=[0];

 for(let i=1;i<n;i++){let a=s[i-1],b=s[i],c=tiles[i-1],d=tiles[i];if(i-cuts[cuts.length-1]>=16||Math.abs(a%nx-b%nx)+Math.abs(Math.floor(a/nx)-Math.floor(b/nx))!==1||Math.abs(c%dn-d%dn)+Math.abs(Math.floor(c/dn)-Math.floor(d/dn))!==1)cuts.push(i);}

 cuts.push(n);const groups=new Map(),assigned=Array.from({length:cuts.length-1},(_,i)=>i),rng=stream(key,'curve-fragments');

 for(let i=0;i<cuts.length-1;i++){let len=cuts[i+1]-cuts[i];if(!groups.has(len))groups.set(len,[]);groups.get(len).push(i);}

 for(let len of [...groups.keys()].sort((a,b)=>a-b)){let ids=groups.get(len),other=ids.slice();for(let i=other.length-1;i>0;i--){let j=await rng(i+1);[other[i],other[j]]=[other[j],other[i]];}ids.forEach((id,i)=>assigned[id]=other[i]);}

 const out=new Uint32Array(n);let pos=0;for(let g of assigned){out.set(s.slice(cuts[g],cuts[g+1]),pos);pos+=cuts[g+1]-cuts[g];}return out;

}

root.CurveTransport={plan};

})(__cf);



/* CFT2 sampling-aligned source tiles. Gilbert MIT/BSD notices included. */

(function(root){'use strict';

const MAX=48000000,VMIN=1088,Q=320,utf=new TextEncoder(),clip=v=>Math.max(0,Math.min(255,Math.floor(v+.5))),tick=()=>new Promise(r=>setTimeout(r,0));

const tomato=root.TomatoCore;

const transport=root.CurveTransport;

const geometry=root.GeometryMask;

const packing=root.PayloadPacking;

const sketch=root.MisanSketch,frame=root.MisanFrame;

class InvalidFormat extends Error{}

function concat(...parts){let out=new Uint8Array(parts.reduce((a,b)=>a+b.length,0)),p=0;for(let b of parts){out.set(b,p);p+=b.length;}return out;}

function keyBytes(password){if(typeof password!=='string')throw Error('密钥必须是字符串');let bytes=utf.encode(password);if(bytes.length>16384)throw Error('密钥超过 16384 个 UTF-8 字节');return bytes;}

async function derive(password,salt){if(!crypto?.subtle)throw Error('需要支持 Web Crypto 的现代浏览器，请通过本地文件、HTTPS 或 localhost 打开');let raw=await crypto.subtle.importKey('raw',keyBytes(password),'PBKDF2',false,['deriveBits']);let bytes=await crypto.subtle.deriveBits({name:'PBKDF2',salt:concat(new Uint8Array([67,111,110,116,111,117,114,70,105,108,108,45,118,49,49,0]),salt),iterations:300000,hash:'SHA-256'},raw,256);return crypto.subtle.importKey('raw',bytes,{name:'HMAC',hash:'SHA-256'},false,['sign']);}

const mac=async(key,data)=>new Uint8Array(await crypto.subtle.sign('HMAC',key,data));

function counterBytes(i){let b=new Uint8Array(4);new DataView(b.buffer).setUint32(0,i,false);return b;}

function stream(key,domain){let counter=0,buffer=new Uint8Array(0),offset=0;return async n=>{let bound=Math.floor(4294967296/n)*n;for(;;){if(offset>=buffer.length){buffer=await mac(key,concat((typeof domain==='string'?utf.encode(domain+'\0'):domain),counterBytes(counter++)));offset=0;}let v=new DataView(buffer.buffer,buffer.byteOffset).getUint32(offset,false);offset+=4;if(v<bound)return v%n;}};}

const crcTable=Array.from({length:256},(_,i)=>{let c=i;for(let j=0;j<8;j++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;return c>>>0;});

function crc32(data){let c=0xffffffff;for(let b of data)c=crcTable[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0;}

function canonical(meta){let ordered={};for(let name of Object.keys(meta).sort())ordered[name]=meta[name];return utf.encode(JSON.stringify(ordered));}

function hex(data){return Array.from(data,b=>b.toString(16).padStart(2,'0')).join('');}

function unhex(text){if(!/^[0-9a-f]+$/.test(text)||text.length%2)throw Error('Invalid hex');return Uint8Array.from(text.match(/../g),s=>parseInt(s,16));}

function b64(data){let text='';for(let b of data)text+=String.fromCharCode(b);return btoa(text);}

function unb64(text){return Uint8Array.from(atob(text),c=>c.charCodeAt(0));}

function normalizedShape(w,h,old=false,revision=14){let base=old?640:revision===13?832:VMIN,scale=base/Math.min(w,h);if(Math.max(w,h)/Math.min(w,h)*base*base>MAX)throw Error('图片比例过于极端');return[Math.max(8,Math.floor(w*scale/8+.5)*8),Math.max(8,Math.floor(h*scale/8+.5)*8)];}

function linearAxis(original,output){let a=new Int32Array(output),b=new Int32Array(output),f=new Int32Array(output),den=2*output;for(let i=0;i<output;i++){let t=(2*i+1)*original-output,base=Math.floor(t/den),rem=t-base*den;a[i]=Math.max(0,Math.min(original-1,base));b[i]=Math.max(0,Math.min(original-1,base+1));f[i]=Math.floor((rem*16384+output)/den);}return{a,b,f};}

function resizeRGB(data,w,h,ow,oh,flatten=false){let out=new Uint8Array(ow*oh*3),xm=linearAxis(w,ow),ym=linearAxis(h,oh),Q=16384,D=268435456;for(let y=0;y<oh;y++)for(let x=0;x<ow;x++){let fx=xm.f[x],fy=ym.f[y],ids=[(ym.a[y]*w+xm.a[x])*4,(ym.a[y]*w+xm.b[x])*4,(ym.b[y]*w+xm.a[x])*4,(ym.b[y]*w+xm.b[x])*4];for(let c=0;c<3;c++){let v=ids.map(i=>flatten?Math.floor((data[i+c]*data[i+3]+255*(255-data[i+3])+127)/255):data[i+c]),top=v[0]*(Q-fx)+v[1]*fx,bottom=v[2]*(Q-fx)+v[3]*fx;out[(y*ow+x)*3+c]=Math.floor((top*(Q-fy)+bottom*fy+D/2)/D);}}return out;}

function coverRGBA(data,w,h,ow,oh){let rgb=resizeRGB(data,w,h,ow,oh,true),out=new Uint8ClampedArray(ow*oh*4);for(let i=0;i<ow*oh;i++){out[i*4]=rgb[i*3];out[i*4+1]=rgb[i*3+1];out[i*4+2]=rgb[i*3+2];out[i*4+3]=255;}return out;}

function pilotMeans(rgb,w,h,old=false,revision=14){return pilots(w,h,old,revision).map(([x,y])=>{let sum=[0,0,0];for(let dy=0;dy<8;dy++)for(let dx=0;dx<8;dx++){let i=((y*8+dy)*w+x*8+dx)*3;for(let c=0;c<3;c++)sum[c]+=rgb[i+c];}return sum.map(v=>v/64);});}

function locations(w,h,old=false,revision=14){let excluded=new Set();for(let[x,y]of pilots(w,h,old,revision))for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)excluded.add((y+dy)*(w/8)+x+dx);let list=[];for(let y=0;y<h/8;y++)for(let x=0;x<w/8;x++)if((x<Math.floor((old?.12:revision===13?.06:.031)*w/8)||x>=Math.ceil((old?.88:revision===13?.94:.969)*w/8))&&!excluded.has(y*(w/8)+x))list.push([x,y]);let stride=997;while(gcd(stride,list.length)!==1)stride+=2;return{list,stride};}

function gcd(a,b){while(b){let t=a%b;a=b;b=t;}return a;}

function pilots(w,h,old=false,revision=14){return Array.from({length:16},(_,i)=>[Math.max(2,Math.floor((old?(i%2===0?.055:.945):(revision===13?(i%2===0?.03:.97):(i%2===0?.014:.986)))*w/8)),Math.min(h/8-3,Math.max(2,Math.floor((i+1)*h/17/8)))]);}

function curve(w,h){let out=new Uint32Array(w*h),pos=0;function gen(x,y,ax,ay,bx,by){let ww=Math.abs(ax+ay),hh=Math.abs(bx+by),dax=Math.sign(ax),day=Math.sign(ay),dbx=Math.sign(bx),dby=Math.sign(by);if(hh===1){for(let i=0;i<ww;i++)out[pos++]=(y+day*i)*w+x+dax*i;return;}if(ww===1){for(let i=0;i<hh;i++)out[pos++]=(y+dby*i)*w+x+dbx*i;return;}let ax2=Math.floor(ax/2),ay2=Math.floor(ay/2),bx2=Math.floor(bx/2),by2=Math.floor(by/2),w2=Math.abs(ax2+ay2),h2=Math.abs(bx2+by2);if(2*ww>3*hh){if(w2%2&&ww>2){ax2+=dax;ay2+=day;}gen(x,y,ax2,ay2,bx,by);gen(x+ax2,y+ay2,ax-ax2,ay-ay2,bx,by);}else{if(h2%2&&hh>2){bx2+=dbx;by2+=dby;}gen(x,y,bx2,by2,ax2,ay2);gen(x+bx2,y+by2,ax,ay,bx-bx2,by-by2);gen(x+ax-dax+bx2-dbx,y+ay-day+by2-dby,-bx2,-by2,-(ax-ax2),-(ay-ay2));}}if(w>=h)gen(0,0,w,0,0,h);else gen(0,0,0,h,w,0);return out;}

const patterns=Array.from({length:6},()=>new Float64Array(64)),pairs=[[[0,1],[1,0]],[[0,2],[2,0]],[[1,2],[2,1]],[[0,3],[3,0]],[[1,1],[2,2]],[[1,3],[3,1]]];for(let k=0;k<6;k++)for(let y=0;y<8;y++)for(let x=0;x<8;x++){let f=(u,i)=>(u===0?Math.sqrt(1/8):.5*Math.cos((2*i+1)*u*Math.PI/16)),[a,b]=pairs[k];patterns[k][y*8+x]=f(a[0],y)*f(a[1],x)-f(b[0],y)*f(b[1],x);}

function coeff(gray,w,x,y,pat){let sum=0;for(let dy=0;dy<8;dy++)for(let dx=0;dx<8;dx++)sum+=gray[(y+dy)*w+x+dx]*pat[dy*8+dx];return sum;}

function grayImage(rgb){let out=new Float64Array(rgb.length/3);for(let i=0;i<out.length;i++)out[i]=.299*rgb[i*3]+.587*rgb[i*3+1]+.114*rgb[i*3+2];return out;}

function floatSample(a,w,h,x,y){x=Math.max(0,Math.min(w-1,x));y=Math.max(0,Math.min(h-1,y));let x0=Math.floor(x),y0=Math.floor(y),x1=Math.min(w-1,x0+1),y1=Math.min(h-1,y0+1),fx=x-x0,fy=y-y0;return(a[y0*w+x0]*(1-fx)+a[y0*w+x1]*fx)*(1-fy)+(a[y1*w+x0]*(1-fx)+a[y1*w+x1]*fx)*fy;}

function differences(gray,w,loc,stride,old=false){let n=loc.length,out=new Float64Array(n*6);for(let k=0;k<6;k++)for(let i=0;i<n;i++){let[x,y]=loc[i*stride%n];out[k*n+i]=coeff(gray,w,x*8,y*8,patterns[k]);}if(old)return out;let mix=n+1;while(gcd(mix,out.length)!==1)mix++;return Float64Array.from(out,(_,i)=>out[i*mix%out.length]);}

async function readMetadata(image,w,h){for(let[old,revision]of [[false,14],[false,13],[true,12]]){let[vw,vh]=normalizedShape(w,h,old,revision);for(let[dx,dy]of [[0,0],[-8,0],[8,0],[0,-8],[0,8],[-8,-8],[8,8],[-8,8],[8,-8]]){let ww=vw+dx,hh=vh+dy;if(Math.min(ww,hh)<8)continue;let small=resizeRGB(image,w,h,ww,hh),{list,stride}=locations(ww,hh,old,revision),diff=differences(grayImage(small),ww,list,stride,old);for(let mode=0;mode<3;mode++){let bits=Array.from(diff,(v,i)=>Number((mode===0?v+diff[diff.length-1-i]:mode===1?v:diff[diff.length-1-i])>0)),prefix;try{prefix=MisanECC.bchDecode(bits.slice(0,189)).data;}catch(e){continue;}let magic=new TextDecoder().decode(prefix.slice(0,4));if(old&&['CFR4','CFR5','CFR6','CFR7','CFR9','CFT1'].includes(magic))throw new InvalidFormat();if(magic!=='CFT2')continue;let v=new DataView(prefix.buffer),length=v.getUint16(4,false),checksum=v.getUint32(6,false),count=Math.ceil((length+10)*8/36)*63;if(length<62||length>1536||count>diff.length)continue;try{let decoded=MisanECC.bchDecode(bits.slice(0,count)),data=decoded.data.slice(10,10+length);if(crc32(data)===checksum){let meta=unpackMeta(data);if((meta.d<13)===old&&(old||meta.d===revision||revision===14&&meta.d>=15))return{meta,small,vw:ww,vh:hh,corrected:decoded.corrected};}}catch(e){}}await tick();}}throw Error('无法读取 CFT2 参数，图片可能损坏或压缩超出恢复范围；请使用完整且清晰的混淆图片');}



async function writeMetadata(out,w,h,meta){let data=packMeta(meta),prefix=new Uint8Array(10),v=new DataView(prefix.buffer);prefix.set(utf.encode('CFT2'));v.setUint16(4,data.length,false);v.setUint32(6,crc32(data),false);let bits=MisanECC.bchEncode(concat(prefix,data)),[vw,vh]=normalizedShape(w,h),{list,stride}=locations(vw,vh),n=list.length,capacity=6*n;if(bits.length>capacity)throw Error('参数纠错容量不足');for(let attempt=0;attempt<8;attempt++){let gray=grayImage(resizeRGB(out,w,h,vw,vh)),delta=new Float32Array(vw*vh);for(let side=0;side<(bits.length*2<=capacity?2:1);side++)for(let i=0;i<bits.length;i++){let mix=n+1;while(gcd(mix,capacity)!==1)mix++;let j=((side===0?i:capacity-1-i)*mix)%capacity,k=Math.floor(j/n),[bx,by]=list[(j%n)*stride%n],x=bx*8,y=by*8,pat=patterns[k],d=coeff(gray,vw,x,y,pat),target=(bits[i]?1:-1)*Math.max(Q,Math.abs(d));for(let yy=0;yy<8;yy++)for(let xx=0;xx<8;xx++)delta[(y+yy)*vw+x+xx]+=(target-d)*pat[yy*8+xx]/2;}for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(x>w*.032&&x<w*.968)continue;let d=floatSample(delta,vw,vh,(x+.5)*vw/w-.5,(y+.5)*vh/h-.5),p=(y*w+x)*4;for(let c=0;c<3;c++)out[p+c]=clip(out[p+c]+d);}try{let got=(await readMetadata(out,w,h)).meta;if(JSON.stringify(got)===JSON.stringify(unpackMeta(packMeta(meta)))&&attempt>=1)return;}catch(e){}await tick();}throw Error('无法在这张表图中可靠写入参数');}

function baseLayout(cover,cw,ch,w,h,a,maxPixels=MAX,guide=24,count=0){let div=gcd(cw,ch),aw=cw/div,ah=ch/div,c=cw>=ch?guide:Math.max(4,Math.floor(guide*cw/ch+.5)),r=ch>=cw?guide:Math.max(4,Math.floor(guide*ch/cw+.5)),pw=Math.min(cw,1024),ph=Math.max(1,Math.floor(ch*pw/cw+.5)),gray=grayImage(resizeRGB(cover,cw,ch,pw,ph,true)),edge=new Float64Array(pw*ph),mask=new Uint8Array(Math.ceil(c*r/8)),valid=[],reservationRGB=resizeRGB(cover,cw,ch,pw,ph,true),reservationRGBA=new Uint8ClampedArray(pw*ph*4);for(let p=0;p<pw*ph;p++){reservationRGBA.set(reservationRGB.subarray(p*3,p*3+3),p*4);reservationRGBA[p*4+3]=255;}let reserved=(root.MisanStroke).reservation(reservationRGBA,pw,ph);for(let y=0;y<ph;y++)for(let x=0;x<pw;x++){let l=Math.max(0,x-1),rr=Math.min(pw-1,x+1),t=Math.max(0,y-1),b=Math.min(ph-1,y+1),gx=-gray[t*pw+l]+gray[t*pw+rr]-2*gray[y*pw+l]+2*gray[y*pw+rr]-gray[b*pw+l]+gray[b*pw+rr],gy=-gray[t*pw+l]-2*gray[t*pw+x]-gray[t*pw+rr]+gray[b*pw+l]+2*gray[b*pw+x]+gray[b*pw+rr];edge[y*pw+x]=reserved[y*pw+x]?1024:0;}if(guide===0)return nativeLayout(edge,pw,ph,cw,ch,w,h,a,count);for(let row=0;row<r;row++)for(let col=0;col<c;col++){if((col+1)/c<=.03125||col/c>=.96875)continue;let sum=0,strong=0,n=0;for(let y=Math.max(0,Math.floor(row*ph/r)-1);y<Math.min(ph,Math.ceil((row+1)*ph/r)+1);y++)for(let x=Math.max(0,Math.floor(col*pw/c)-1);x<Math.min(pw,Math.ceil((col+1)*pw/c)+1);x++){let v=edge[y*pw+x];sum+=v;strong+=v>48;n++;}if(sum===0&&!sketch.boxes(cw,ch).some(([cx,cy,rad])=>col/c<(cx+rad)/cw&&(col+1)/c>(cx-rad)/cw&&row/r<(cy+rad)/ch&&(row+1)/r>(cy-rad)/ch)){let i=row*c+col;mask[i>>3]|=1<<(7-i%8);valid.push([row,col]);}}if(!valid.length)throw Error('表图缺少足够的低轮廓区域');let need=count*256*(a?2:1),fraction=valid.length/(c*r),k=Math.ceil(Math.max(Math.sqrt(need/fraction/(Math.max(cw,ch)/Math.min(cw,ch))),VMIN));for(;;k++){let ow=cw>=ch?Math.floor(k*cw/ch+.5):k,oh=ch>cw?Math.floor(k*ch/cw+.5):k,nx=Math.floor(ow/16),ny=Math.floor(oh/16);if(ow*oh>maxPixels)throw Error('表图容量不足或输出超过像素上限');let capacity=0;for(let[row,col]of valid)capacity+=Math.max(0,Math.min(Math.floor((col+1)*nx/c),Math.floor(31*ow/512))-Math.max(Math.floor(col*nx/c),Math.ceil(ow/512)))*(Math.floor((row+1)*ny/r)-Math.floor(row*ny/r));if(capacity*256>=need)return{w,h,ow,oh,c,r,b:1,d:15,z:0,a,mask:b64(mask)};}}



async function plan(w,h,key,mask,d,ow){return transport.plan(w,h,key,mask,d.tiles,ow,tomato,stream);}

async function destinations(m,key){let nx=Math.floor(m.ow/16),ny=Math.floor(m.oh/16),mask=unb64(m.mask),selected=[];for(let tile of curve(nx,ny)){let x=tile%nx,y=Math.floor(tile/nx),mx=Math.min(m.c-1,Math.floor(((x+1)*m.c-1)/nx)),my=Math.min(m.r-1,Math.floor(((y+1)*m.r-1)/ny)),i=my*m.c+mx;if(x>=Math.floor((Math.ceil(m.ow/64)+1)/2)&&x<Math.floor(Math.floor(7*m.ow/64)/2)&&(mask[i>>3]&(1<<(7-i%8))))selected.push(tile);}let count=m.k*(m.a?2:1);if(selected.length<count)throw Error('填充容量无效');let rng=stream(key,'layout'),start=await rng(selected.length-count+1);return{tiles:Uint32Array.from(selected.slice(start,start+count)),reverse:false};}

const localCurve=curve(8,8);

function pointDestination(i,m,d){let local=i%256,tile=d.tiles[Math.floor(i/256)],nx=Math.floor(m.ow/16);return(Math.floor(tile/nx)*16+Math.floor(local/16))*m.ow+tile%nx*16+local%16;}

function coverEdge(base,w,h,x,y){let v=(dx,dy)=>{let p=(Math.max(0,Math.min(h-1,y+dy))*w+Math.max(0,Math.min(w-1,x+dx)))*4;return .299*base[p]+.587*base[p+1]+.114*base[p+2];},tl=v(-1,-1),tc=v(0,-1),tr=v(1,-1),ml=v(-1,0),mr=v(1,0),bl=v(-1,1),bc=v(0,1),br=v(1,1);return(Math.abs(-tl+tr-2*ml+2*mr-bl+br)+Math.abs(-tl-2*tc-tr+bl+2*bc+br))/8;}

async function guards(out,base,state,w,h,options){let left=Math.ceil(w/512)*16,right=Math.floor(31*w/512)*16,neighbors=[[0,-1],[0,1],[-1,0],[1,0],[-1,-1],[-1,1],[1,-1],[1,1]];for(let step=1;step<=3;step++)for(let y=0;y<h;y++){for(let x=left;x<right;x++){let p=y*w+x;if(state[p]||base[p*4]<250)continue;let parent=-1;for(let[dy,dx]of neighbors){let xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=w||yy>=h)continue;let j=yy*w+xx;if(state[j]>0&&state[j]<=step){parent=j;break;}}if(parent>=0&&coverEdge(base,w,h,x,y)<18){for(let c=0;c<3;c++)out[p*4+c]=out[parent*4+c];state[p]=step+1;}}if(y%128===0){options.progress?.(.72+.06*(step-1+y/h));await tick();}}}

function axisMap(original,received){let index=new Int32Array(original*4),weight=new Float64Array(original*4),den=2*original;for(let i=0;i<original;i++){let t=(2*i+1)*received-original,base=Math.floor(t/den),rem=t-base*den,f=Math.floor((rem*1024+original)/den)/1024,g=1-f,ff=f*f,gg=g*g,values=[-.75*f*gg,1.25*ff*f-2.25*ff+1,1.25*gg*g-2.25*gg+1,-.75*ff*g],q=values.map(v=>Math.floor(v*16384+.5));q[1]+=16384-q.reduce((a,b)=>a+b,0);for(let j=0;j<4;j++){index[i*4+j]=Math.max(0,Math.min(received-1,base+j-1));weight[i*4+j]=q[j]/16384;}}return{index,weight};}

async function decrypt(image,w,h,password='',options={}){keyBytes(password);let hd=await readMetadata(image,w,h);let m=hd.meta,tag=m.tag;delete m.tag;let key=await derive(password,unhex(m.s));if(tag!==hex((await mac(key,canonical(m))).slice(0,16)))throw Error('密钥不正确');if(Math.abs((w/m.ow)/(h/m.oh)-1)>.02)throw Error('图片比例已改变');let map=await openMap(m,key),placed=await packing.plan(m,key,map.mask,curve,stream),d={tiles:placed.tiles,reverse:false},order=placed.order,out=new Uint8ClampedArray(m.w*m.h*4),active=new Uint8Array(m.w*m.h),n=m.k*256,need=n*(m.a?2:1),direct=w===m.ow&&h===m.oh,xmap=direct?null:axisMap(m.ow,w),ymap=direct?null:axisMap(m.oh,h);for(let i=0;i<m.w*m.h;i++)out.set(map.bg,i*4);for(let i=0;i<need;i++){let s=sourcePoint(i,m,order);if(!s.valid)continue;let pos=pointDestination(i,m,d),x=pos%m.ow,y=Math.floor(pos/m.ow),rgb=[0,0,0];if(direct)for(let c=0;c<3;c++)rgb[c]=image[(y*w+x)*4+c];else for(let dy=0;dy<4;dy++)for(let dx=0;dx<4;dx++){let p=(ymap.index[y*4+dy]*w+xmap.index[x*4+dx])*4,wt=ymap.weight[y*4+dy]*xmap.weight[x*4+dx];for(let c=0;c<3;c++)rgb[c]+=image[p+c]*wt;}let p=s.p*4;active[s.p]=1;if(i<n)for(let c=0;c<3;c++)out[p+c]=clip(rgb[c]);else out[p+3]=clip((rgb[0]+rgb[1]+rgb[2])/3);if(i%16384===0){options.progress?.(.1+.75*i/need);await tick();}}let work=out,full=expandSource(work,m),damaged=crc32(full.data)!==m.crc;if(damaged){let table=calibration(hd.small,hd.vw,hd.vh,m);for(let i=0;i<m.w*m.h;i++){for(let c=0;c<3;c++)work[i*4+c]=table[work[i*4+c]*3+c];if(m.a){let a=work[i*4+3];work[i*4+3]=clip((table[a*3]+table[a*3+1]+table[a*3+2])/3);}}if(m.b&2)for(let p=0;p<work.length;p+=4){let r=work[p],g=work[p+1],b=work[p+2],v=r+g+b-Math.min(r,g,b)-Math.max(r,g,b);work[p]=work[p+1]=work[p+2]=v;}let cal=unb64(m.cal),pal=Array.from({length:m.z},(_,i)=>Array.from(cal.slice(36+i*3,39+i*3)));for(let i=0;i<active.length;i++)if(!active[i])work.set(map.bg,i*4);full=expandSource(work,m);}options.progress?.(1);return{data:full.data,width:full.width,height:full.height,info:{format:'CFT2',legacy:false,pixel_crc_match:crc32(full.data)===m.crc,corrected_header_bits:hd.corrected,tiles:m.k,sparse:m.u,repair_applied:damaged,uniform_border_omitted:m.t,palette:Array.from({length:m.z},(_,i)=>Array.from(unb64(m.cal).slice(36+i*3,39+i*3)))}};}

function cropSource(source,w,h){let bg=source.slice(0,4),x0=w,y0=h,x1=-1,y1=-1;for(let y=0;y<h;y++)for(let x=0;x<w;x++){let p=(y*w+x)*4;if(source[p]!==bg[0]||source[p+1]!==bg[1]||source[p+2]!==bg[2]||source[p+3]!==bg[3]){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}}if(x1<0){x0=y0=0;x1=y1=1;}else{x0=Math.max(0,x0-8);y0=Math.max(0,y0-8);x1=Math.min(w,x1+9);y1=Math.min(h,y1+9);}let ww=x1-x0,hh=y1-y0;if(ww*hh>w*h*.9)return{data:source,width:w,height:h,frame:{t:false}};let data=new Uint8ClampedArray(ww*hh*4);for(let y=0;y<hh;y++)data.set(source.subarray(((y+y0)*w+x0)*4,((y+y0)*w+x1)*4),y*ww*4);return{data,width:ww,height:hh,frame:{t:true,fw:w,fh:h,x:x0,y:y0,bg:hex(bg)}};}

function sourcePalette(source,w,h){let counts=new Map(),rgb=p=>(source[p]<<16)|(source[p+1]<<8)|source[p+2];for(let y=0;y<h;y++)for(let x=0;x<w;x++){let p=(y*w+x)*4;if(source[p+3]!==255)continue;let v=rgb(p);if(v!==rgb((y*w+Math.max(0,x-1))*4)||v!==rgb((y*w+Math.min(w-1,x+1))*4)||v!==rgb((Math.max(0,y-1)*w+x)*4)||v!==rgb((Math.min(h-1,y+1)*w+x)*4))continue;counts.set(v,(counts.get(v)||0)+1);}let threshold=Math.max(64,Math.ceil(w*h/64));return[...counts].filter(([v,n])=>n>=threshold).sort((a,b)=>b[1]-a[1]||a[0]-b[0]).slice(0,4).filter(([v])=>{for(let[other,count]of counts)if(other!==v&&count>=4&&Math.max(Math.abs((v>>16)-(other>>16)),Math.abs(((v>>8)&255)-((other>>8)&255)),Math.abs((v&255)-(other&255)))<=24)return false;return true;}).map(([v])=>[v>>16,(v>>8)&255,v&255]);}

function expandSource(work,m){if(!m.t)return{data:work,width:m.w,height:m.h};let bg=unhex(m.bg),out=new Uint8ClampedArray(m.fw*m.fh*4);for(let p=0;p<out.length;p+=4)out.set(bg,p);for(let y=0;y<m.h;y++)out.set(work.subarray(y*m.w*4,(y+1)*m.w*4),((y+m.y)*m.fw+m.x)*4);return{data:out,width:m.fw,height:m.fh};}

function medianRGB(data,w,h,r){let out=data.slice(),hist=new Uint32Array(256),rank=Math.floor((2*r+1)**2/2)+1;for(let c=0;c<3;c++)for(let y=0;y<h;y++){hist.fill(0);for(let dy=-r;dy<=r;dy++){let row=Math.max(0,Math.min(h-1,y+dy))*w;for(let dx=-r;dx<=r;dx++)hist[data[(row+Math.max(0,Math.min(w-1,dx)))*4+c]]++;}let med=0,below=0;while(below+hist[med]<rank)below+=hist[med++];for(let x=0;x<w;x++){out[(y*w+x)*4+c]=med;if(x===w-1)break;let left=Math.max(0,x-r),right=Math.min(w-1,x+r+1);for(let dy=-r;dy<=r;dy++){let row=Math.max(0,Math.min(h-1,y+dy))*w,a=data[(row+left)*4+c],b=data[(row+right)*4+c];hist[a]--;hist[b]++;if(a<med)below--;if(b<med)below++;}while(below>=rank){med--;below-=hist[med];}while(below+hist[med]<rank)below+=hist[med++];}}return out;}

async function repairPixels(data,w,h,pal,options){let guide=medianRGB(data,w,h,1),target=medianRGB(data,w,h,2),out=data.slice();for(let y=0;y<h;y++){for(let x=0;x<w;x++){let p=(y*w+x)*4;if(Math.max(Math.abs(data[p]-target[p]),Math.abs(data[p+1]-target[p+1]),Math.abs(data[p+2]-target[p+2]))>64)continue;let valid=true;for(let c=0;c<3&&valid;c++){let lo=255,hi=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){let q=(Math.max(0,Math.min(h-1,y+dy))*w+Math.max(0,Math.min(w-1,x+dx)))*4+c,v=guide[q];lo=Math.min(lo,v);hi=Math.max(hi,v);}if(hi-lo>24)valid=false;}if(!valid)continue;let dr=data[p]-target[p],dg=data[p+1]-target[p+1],db=data[p+2]-target[p+2],norm=dr*dr+dg*dg+db*db,supported=false;if(norm>=4)for(let[dy,dx]of [[0,1],[1,0],[1,1],[1,-1]]){let votes=0;for(let distance of [-2,-1,1,2]){let q=(Math.max(0,Math.min(h-1,y+dy*distance))*w+Math.max(0,Math.min(w-1,x+dx*distance)))*4,dot=dr*(data[q]-target[p])+dg*(data[q+1]-target[p+1])+db*(data[q+2]-target[p+2]);if(dot>0&&dot*4>=norm)votes++;}if(votes>=(Math.max(Math.abs(dr),Math.abs(dg),Math.abs(db))<=12?2:3)){supported=true;break;}}if(supported)continue;let chosen=null,best=Infinity;for(let col of pal){let dr=target[p]-col[0],dg=target[p+1]-col[1],db=target[p+2]-col[2],distance=dr*dr+dg*dg+db*db;if(Math.max(Math.abs(dr),Math.abs(dg),Math.abs(db))<=12&&distance<best){chosen=col;best=distance;}}for(let c=0;c<3;c++)out[p+c]=chosen?chosen[c]:target[p+c];}if(y%128===0){options.progress?.(.86+.12*y/h);await tick();}}return out;}

function validate(m){for(let k of ['w','h','ow','oh','c','r','iw','ih'])if(!Number.isInteger(m[k])||m[k]<1||m[k]>65535)throw Error('CFT2 尺寸无效');if(m.w*m.h>MAX||m.ow*m.oh>MAX||m.c>255||m.r>255||!(m.d>=15?[1,3,5,7]:[1,3]).includes(m.b)||![11,12,13,14,15].includes(m.d)||m.z<0||m.z>4)throw Error('CFT2 参数无效');if(!Number.isInteger(m.k)||m.k<0||m.k>Math.ceil(m.w/16)*Math.ceil(m.h/16))throw Error('图像片数无效');if(m.t||m.w!==Math.max(16,2**Math.ceil(Math.log2(m.iw)))||m.h!==Math.max(16,2**Math.ceil(Math.log2(m.ih))))throw Error('填充画幅参数无效');if(m.t){for(let k of ['fw','fh','x','y'])if(!Number.isInteger(m[k])||m[k]<0||m[k]>65535)throw Error('原图边距参数无效');if(!m.fw||!m.fh||m.fw*m.fh>MAX||m.x+m.w>m.fw||m.y+m.h>m.fh||unhex(m.bg).length!==4)throw Error('原图边距参数无效');}}

function packMetaBody(m){let cv=m.d>=13?geometry.pack(unb64(m.mask),m.c,m.r,m.d>=14):pako.deflate(unb64(m.mask),{level:9}),sm=unb64(m.sm),cn=m.d>=14?3*m.z:48,kp=34+cn,pos=kp+8,out=new Uint8Array(pos+16+cv.length+sm.length+(m.t?12:0)),v=new DataView(out.buffer);out[0]=(m.a?1:0)+(m.p?2:0)+(m.t?4:0)+(m.u?8:0);for(let[i,k]of ['w','h','ow','oh'].entries())v.setUint16(1+2*i,m[k],false);for(let[i,k]of ['c','r','b','d','z'].entries())out[9+i]=m[k];out.set(unhex(m.s),14);v.setUint32(30,m.crc,false);out.set(m.d>=14?unb64(m.cal).slice(36,36+cn):unb64(m.cal),34);v.setUint32(kp,m.k,false);v.setUint16(kp+4,cv.length,false);v.setUint16(kp+6,sm.length,false);out.set(cv,pos);out.set(sm,pos+cv.length);let p=pos+cv.length+sm.length;if(m.t){for(let[i,k]of ['fw','fh','x','y'].entries())v.setUint16(p+2*i,m[k],false);out.set(unhex(m.bg),p+8);}out.set(unhex(m.tag),out.length-16);return out;}

function unpackMetaBody(data,iw,ih){if(data.length<58)throw Error('CFT2 参数长度无效');let v=new DataView(data.buffer,data.byteOffset),m={a:!!(data[0]&1),p:!!(data[0]&2),t:!!(data[0]&4),u:!!(data[0]&8)};for(let[i,k]of ['w','h','ow','oh'].entries())m[k]=v.getUint16(1+i*2,false);for(let[i,k]of ['c','r','b','d','z'].entries())m[k]=data[9+i];if(m.z>4)throw Error("Palette");let cn=m.d>=14?3*m.z:48,kp=34+cn,pos=kp+8;if(data.length<pos+16)throw Error("Length");let cl=v.getUint16(kp+4,false),sl=v.getUint16(kp+6,false);if(data[0]>15||data.length!==pos+16+cl+sl+(m.t?12:0)||m.u!==!!sl)throw Error('CFT2 参数长度无效');let cal=data.slice(34,82);if(m.d>=14){cal=new Uint8Array(48).fill(128);for(let i=0;i<12;i++)for(let c=0;c<3;c++)cal[i*3+c]=Math.floor(i*255/11+.5);cal.set(data.slice(34,kp),36);}Object.assign(m,{k:v.getUint32(kp,false),s:hex(data.slice(14,30)),crc:v.getUint32(30,false),cal:b64(cal),mask:b64(m.d>=13?geometry.unpack(data.slice(pos,pos+cl),m.c,m.r,inflateMap):inflateMap(data.slice(pos,pos+cl),Math.ceil(m.c*m.r/8))),sm:b64(data.slice(pos+cl,pos+cl+sl)),tag:hex(data.slice(-16))});if(m.t){let p=pos+cl+sl;for(let[i,k]of ['fw','fh','x','y'].entries())m[k]=v.getUint16(p+2*i,false);m.bg=hex(data.slice(p+8,p+12));}m.iw=iw;m.ih=ih;validate(m);return m;}

function preparePilots(out,w,h,pal){let[vw,vh]=normalizedShape(w,h),targets=Array.from({length:12},(_,i)=>Array(3).fill(Math.floor(i*255/11+.5))).concat(pal);while(targets.length<16)targets.push([128,128,128]);for(let[i,[x,y]]of pilots(vw,vh).entries()){let x0=Math.max(0,Math.floor((x*8-4)*w/vw)),x1=Math.min(w,Math.ceil((x*8+12)*w/vw)),y0=Math.max(0,Math.floor((y*8-4)*h/vh)),y1=Math.min(h,Math.ceil((y*8+12)*h/vh));for(let yy=y0;yy<y1;yy++)for(let xx=x0;xx<x1;xx++){let p=(yy*w+xx)*4;for(let c=0;c<3;c++)out[p+c]=targets[i][c];}}return Uint8Array.from(targets.flat());}

function calMedian(a){a.sort((x,y)=>x-y);let n=a.length;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2;}

function calibration(small,vw,vh,m){let expected=unb64(m.cal),obs=pilotMeans(small,vw,vh,m.d<13,m.d),table=new Uint8Array(256*3);for(let v=0;v<256;v++)for(let c=0;c<3;c++)table[v*3+c]=v;for(let c=0;c<3;c++){if(m.d>=14){let ids=[],slopes=[];for(let i=0;i<12;i++)if(obs[i][c]>2&&obs[i][c]<253)ids.push(i);for(let i of ids)for(let j of ids)if(j>i&&expected[j*3+c]-expected[i*3+c]>=32)slopes.push((obs[j][c]-obs[i][c])/(expected[j*3+c]-expected[i*3+c]));if(slopes.length>=3){let a=calMedian(slopes),b=calMedian(ids.map(i=>obs[i][c]-a*expected[i*3+c])),res=calMedian(ids.map(i=>Math.abs(obs[i][c]-a*expected[i*3+c]-b)));if(a>.5&&a<1.5&&res<=3){let shift=calMedian(Array.from({length:256},(_,v)=>Math.abs((v-b)/a-v)));if(shift<1.5)continue;}}}let deviations=Array.from({length:12},(_,i)=>Math.abs(obs[i][c]-expected[i*3+c])).sort((a,b)=>a-b);if((deviations[5]+deviations[6])/2<1.5)continue;let xs=[],ys=[];for(let i=0;i<12;i++){let xx=Math.max(obs[i][c],xs.length?xs[xs.length-1]:0);if(xs.length&&xx-xs[xs.length-1]<.25)ys[ys.length-1]=expected[i*3+c];else{xs.push(xx);ys.push(expected[i*3+c]);}}for(let v=0;v<256;v++){let value;if(v<=xs[0])value=ys[0];else if(v>=xs[xs.length-1])value=ys[ys.length-1];else{let j=1;while(xs[j]<v)j++;value=ys[j-1]+(ys[j]-ys[j-1])*(v-xs[j-1])/(xs[j]-xs[j-1]);}table[v*3+c]=clip(value);}}return table;}

function chooseLayout(cover,cw,ch,w,h,a,maxPixels=MAX,cropped=false){for(let guide of [24,22,20,18,16]){let m=baseLayout(cover,cw,ch,w,h,a,maxPixels,guide),length=98+Math.ceil(m.c*m.r/8)+(cropped?12:0),[vw,vh]=normalizedShape(m.ow,m.oh),{list}=locations(vw,vh);if(Math.ceil((length+10)*8/36)*63*2<=list.length*4)return m;}throw Error('表图参数区容量不足');}

async function encrypt(source,w,h,cover,cw,ch,password='',options={}){keyBytes(password);if(w*h>MAX||Math.min(w,h)<1||Math.max(w,h)>65535)throw Error('原图超出尺寸上限');let expected=crc32(source),monochrome=true;for(let p=0;p<source.length;p+=4)if(source[p]!==source[p+1]||source[p+1]!==source[p+2]){monochrome=false;break;}let pal=options.palette||sourcePalette(source,w,h),cropped={data:source,width:w,height:h,frame:{t:false}};source=cropped.data;w=cropped.width;h=cropped.height;let map=sourceMap(source,w,h),a=false,defaultMask=paddingMask(w,h,options.iw,options.ih);if(map.mask.every((v,i)=>v===defaultMask[i]))map.blob=new Uint8Array(0);for(let p=3;p<source.length;p+=4)if(source[p]!==255){a=true;break;}cover=coverRGBA(cover,cw,ch,cw,ch);let abstracted=sketch.prepare(cover,cw,ch,map.mask.reduce((a,b)=>a+b,0)*(a?2:1),resizeRGB);cover=abstracted.data;cw=abstracted.width;ch=abstracted.height;let m=layout(cover,cw,ch,w,h,a,options,cropped.frame.t,map.mask.reduce((a,b)=>a+b,0),map.blob,pal.length);Object.assign(m,cropped.frame,{z:pal.length,b:(monochrome?3:1)|(pal.length&&map.mask.reduce((a,b)=>a+b,0)*256<options.iw*options.ih*.65?4:0)});let salt=options.salt||crypto.getRandomValues(new Uint8Array(16));if(salt.length!==16)throw Error('salt 长度无效');let key=await derive(password,salt);if(!m.u)map.mask=paddingMask(w,h,m.iw,m.ih);m.sm=b64(await mapCipher(unb64(m.sm),key));let placed=await packing.plan(m,key,map.mask,curve,stream),d={tiles:placed.tiles,reverse:false},order=placed.order,rgb=resizeRGB(cover,cw,ch,m.ow,m.oh,true),out=new Uint8ClampedArray(m.ow*m.oh*4);for(let i=0;i<m.ow*m.oh;i++){out.set(rgb.subarray(i*3,i*3+3),i*4);out[i*4+3]=255;}let base=out.slice(),state=new Uint8Array(m.ow*m.oh),n=m.k*256,need=n*(a?2:1);for(let i=0;i<need;i++){let p=sourcePoint(i,m,order).p*4,q=pointDestination(i,m,d);for(let c=0;c<3;c++)out[q*4+c]=i<n?source[p+c]:source[p+3];state[q]=1;if(i%65536===0){options.progress?.(.1+.6*i/need);await tick();}}await guards(out,base,state,m.ow,m.oh,options);sketch.paint(out,base,state,m.ow,m.oh,resizeRGB);Object.assign(m,{p:!!password,s:hex(salt),crc:expected,cal:b64(preparePilots(out,m.ow,m.oh,pal))});m.tag=hex((await mac(key,canonical(m))).slice(0,16));await writeMetadata(out,m.ow,m.oh,m);frame.draw(out,m.ow,m.oh);options.progress?.(1);return{data:out,width:m.ow,height:m.oh,info:{...abstracted.info,format:'CFT2',tile_size:16,tiles:m.k,sparse:m.u,pixel_count:m.ow*m.oh}};}



function inflateMap(data,size){let out=pako.inflate(data);if(out.length!==size)throw Error('图像映射长度无效');return out;}

async function mapCipher(data,key){let out=new Uint8Array(data);for(let p=0;p<out.length;p+=32){let block=await mac(key,concat(utf.encode('source-map\0'),counterBytes(p/32)));for(let j=0;j<Math.min(32,out.length-p);j++)out[p+j]^=block[j];}return out;}

function sourceMap(source,w,h){let nx=Math.ceil(w/16),ny=Math.ceil(h/16),colors=new Map(),same=new Array(nx*ny).fill(null),rgba=p=>source[p]*16777216+source[p+1]*65536+source[p+2]*256+source[p+3];for(let t=0;t<nx*ny;t++){let x=t%nx*16,y=Math.floor(t/nx)*16,v=rgba((y*w+x)*4),ok=true;for(let yy=y;yy<Math.min(y+16,h)&&ok;yy++)for(let xx=x;xx<Math.min(x+16,w);xx++)if(rgba((yy*w+xx)*4)!==v){ok=false;break;}if(ok){same[t]=v;colors.set(v,(colors.get(v)||0)+1);}}let entries=[...colors].sort((a,b)=>b[1]-a[1]||a[0]-b[0]),mask=new Uint8Array(nx*ny).fill(1);if(!entries.length)return{mask,blob:new Uint8Array(0)};let bg=entries[0][0],count=0;for(let t=0;t<mask.length;t++){mask[t]=Number(same[t]!==bg);count+=mask[t];}if(count*4>mask.length*3){mask.fill(1);return{mask,blob:new Uint8Array(0)};}let bits=new Uint8Array(Math.ceil(mask.length/8)+4);for(let t=0;t<mask.length;t++)bits[t>>3]|=mask[t]<<(7-t%8);bits.set([Math.floor(bg/16777216),Math.floor(bg/65536)%256,Math.floor(bg/256)%256,bg%256],bits.length-4);return{mask,blob:pako.deflate(bits,{level:9})};}

async function openMap(m,key){let count=Math.ceil(m.w/16)*Math.ceil(m.h/16),mask=new Uint8Array(count).fill(1);if(!m.u){mask=paddingMask(m.w,m.h,m.iw,m.ih);if(mask.reduce((a,b)=>a+b,0)!==m.k)throw Error('填充容量无效');return{mask,bg:Uint8Array.of(255,255,255,255)};}let raw=inflateMap(await mapCipher(unb64(m.sm),key),Math.ceil(count/8)+4),n=0;for(let t=0;t<count;t++){mask[t]=(raw[t>>3]>>(7-t%8))&1;n+=mask[t];}if(n!==m.k)throw Error('图像映射数量无效');return{mask,bg:raw.slice(-4)};}

function nativeLayout(edge,pw,ph,cw,ch,w,h,a,count){let pitch=pw+1,sum=new Float64Array((ph+1)*pitch),strong=new Int32Array(sum.length);for(let y=0;y<ph;y++)for(let x=0;x<pw;x++){let at=(y+1)*pitch+x+1,v=edge[y*pw+x];sum[at]=v+sum[at-1]+sum[at-pitch]-sum[at-pitch-1];strong[at]=Number(v>48)+strong[at-1]+strong[at-pitch]-strong[at-pitch-1];}let need=count*(a?2:1),lower=Math.max(640,Math.floor(Math.sqrt(need*256*Math.min(cw,ch)/Math.max(cw,ch))));for(let k=Math.ceil(lower/16)*16;k<65536;k+=16){let ow=cw>=ch?Math.floor(k*cw/ch+.5):k,oh=ch>cw?Math.floor(k*ch/cw+.5):k,nx=Math.floor(ow/16),ny=Math.floor(oh/16);if(Math.max(nx,ny)>255||ow*oh>MAX)throw Error('轮廓网格超过容量');let mask=new Uint8Array(Math.ceil(nx*ny/8)),n=0;for(let y=0;y<ny;y++)for(let x=Math.ceil(ow/512);x<Math.floor(31*ow/512);x++){let x0=Math.max(0,Math.floor(x*16*pw/ow)-1),x1=Math.min(pw,Math.ceil((x+1)*16*pw/ow)+1),y0=Math.max(0,Math.floor(y*16*ph/oh)-1),y1=Math.min(ph,Math.ceil((y+1)*16*ph/oh)+1),area=(x1-x0)*(y1-y0),total=sum[y1*pitch+x1]-sum[y0*pitch+x1]-sum[y1*pitch+x0]+sum[y0*pitch+x0],high=strong[y1*pitch+x1]-strong[y0*pitch+x1]-strong[y1*pitch+x0]+strong[y0*pitch+x0];if(total===0&&!sketch.boxes(ow,oh).some(([cx,cy,rad])=>x*16<cx+rad&&(x+1)*16>cx-rad&&y*16<cy+rad&&(y+1)*16>cy-rad)){let i=y*nx+x;mask[i>>3]|=1<<(7-i%8);n++;}}if(n>=need)return{w,h,ow,oh,c:nx,r:ny,b:1,d:15,z:0,a,mask:b64(mask)};}throw Error('轮廓容量不足');}

function layout(cover,cw,ch,w,h,a,options,cropped,k,sm,z=0){for(let sparse of sm.length?[true,false]:[false])for(let guide of [0,128,112,96,80,64,48,40,32,24,20,16]){let count=sparse?k:paddingMask(w,h,options.iw,options.ih).reduce((a,b)=>a+b,0),blob=sparse?sm:new Uint8Array(0),m;try{m=baseLayout(cover,cw,ch,w,h,a,MAX,guide,count);}catch(e){continue;}let length=62+3*z+geometry.pack(unb64(m.mask),m.c,m.r,true).length+blob.length+(cropped?12:0),[vw,vh]=normalizedShape(m.ow,m.oh),{list}=locations(vw,vh);if(Math.ceil((length+10)*8/36)*63<=list.length*6&&length<=1536)return{...m,iw:options.iw,ih:options.ih,k:count,u:sparse,sm:b64(blob)};}throw Error('参数纠错容量不足，请换一张表图');}

function sourcePoint(i,m,order){let local=i%256,tile=order[Math.floor(i/256)%order.length],nx=Math.ceil(m.w/16),x=tile%nx*16+local%16,y=Math.floor(tile/nx)*16+Math.floor(local/16);return{p:Math.min(y,m.h-1)*m.w+Math.min(x,m.w-1),valid:x<m.w&&y<m.h};}

async function repairSeams(data,w,h,options){let out=data.slice();for(let axis=0;axis<2;axis++){let src=out.slice(),length=axis?h:w,lanes=axis?w:h,index=(u,v)=>(axis?u*w+v:v*w+u)*4;for(let x=16;x<length-3;x+=16){for(let y=0;y<lanes;y++){let p3=index(x-4,y),p2=index(x-3,y),q2=index(x+2,y),q3=index(x+3,y),pred=Array.from({length:4},()=>[0,0,0]),ok=true;for(let c=0;c<3;c++){if(Math.abs(src[p2+c]-src[p3+c])>12||Math.abs(src[q3+c]-src[q2+c])>12||Math.abs(src[q2+c]-src[p2+c])>48){ok=false;break;}for(let i=0;i<4;i++){pred[i][c]=Math.floor((src[p2+c]*(4-i)+src[q2+c]*(i+1)+2)/5);if(Math.abs(src[index(x-2+i,y)+c]-pred[i][c])>48)ok=false;}}if(ok)for(let i=0;i<4;i++){let p=index(x-2+i,y);for(let c=0;c<3;c++)out[p+c]=pred[i][c];}}if(x%256===0)await tick();}}return out;}



function phase(n){let unit=Math.min(1024,n);return Math.round((Math.sqrt(5)-1)/2*n/unit)*unit%n;}

function paddingMask(w,h,iw,ih){let sc=w/16,sr=h/16,path=curve(sc,sr),off=phase(w*h)/256,mask=new Uint8Array(sc*sr);for(let i=0;i<path.length;i++){let old=path[i];mask[path[(i+off)%path.length]]=Number(old%sc<Math.ceil(iw/16)&&Math.floor(old/sc)<Math.ceil(ih/16));}return mask;}

function packMeta(m){let body=packMetaBody(m),out=new Uint8Array(body.length+4),v=new DataView(out.buffer);v.setUint16(0,m.iw,false);v.setUint16(2,m.ih,false);out.set(body,4);return out;}

function unpackMeta(data){if(data.length<62)throw Error('CFT2 参数长度无效');let v=new DataView(data.buffer,data.byteOffset);return unpackMetaBody(data.slice(4),v.getUint16(0,false),v.getUint16(2,false));}

root.MisanCarrier2={encrypt,decrypt,keyBytes,crc32,repairPixels,curve,sourcePalette,phase,packMeta,unpackMeta,readMetadata,derive,unhex,openMap,calibration,resizeRGB,normalizedShape,axisMap,sourcePoint,pointDestination,mapping:(m,key,mask)=>packing.plan(m,key,mask,curve,stream),format:'CFT2'};if(typeof module!=='undefined')module.exports=root.MisanCarrier2;

})(__cf);





/* Original-plane sampling through aligned Gilbert fragments. No learned model. */

(function(root){'use strict';

const c=root.MisanCarrier2,clamp=(v,n)=>Math.max(0,Math.min(n-1,v)),round=v=>Math.floor(v+.5),q8=v=>round(v*256)/256,tick=()=>new Promise(r=>setTimeout(r,0));

function spline(f){return[(1-f)**3/6,(3*f**3-6*f*f+4)/6,(-3*f**3+3*f*f+3*f+1)/6,f**3/6];}

function inverseMap(m){let path=c.curve(m.w,m.h),off=c.phase(path.length),out=new Uint32Array(path.length);for(let i=0;i<path.length;i++)out[path[(i+off)%path.length]]=path[i];return out;}

function triangle(color,w,h,valid=null){

 const ww=Math.floor(w/2),hh=Math.floor(h/2);if(!ww||!hh)return null;let a=new Float64Array(ww*hh*2);

 for(let y=0;y<hh;y++)for(let x=0;x<ww;x++)for(let k=0;k<2;k++)a[(y*ww+x)*2+k]=(color[(y*2*w+x*2)*2+k]+color[(y*2*w+x*2+1)*2+k]+color[((y*2+1)*w+x*2)*2+k]+color[((y*2+1)*w+x*2+1)*2+k])/4;

 for(let axis=0;axis<2;axis++){let n=axis?hh:ww,lanes=axis?ww:hh;if(n<2)continue;let cp=new Float64Array(n),v=new Float64Array(n);for(let i=0;i<n;i++){let d=(i===0||i===n-1?.875:.75)-(i?.125*cp[i-1]:0);cp[i]=.125/d;}for(let lane=0;lane<lanes;lane++)for(let k=0;k<2;k++){let at=i=>(axis?i*ww+lane:lane*ww+i)*2+k;for(let i=0;i<n;i++){let d=(i===0||i===n-1?.875:.75)-(i?.125*cp[i-1]:0);v[i]=(a[at(i)]-(i?.125*v[i-1]:0))/d;}for(let i=n-2;i>=0;i--)v[i]-=cp[i]*v[i+1];for(let i=0;i<n;i++)a[at(i)]=v[i];}}

 if(valid&&valid.reduce((a,b)=>a+b,0)<256)valid=null;let error=0,variation=0,count=0;for(let y=0;y<hh*2;y++)for(let x=0;x<ww*2;x++){if(valid&&!valid[y*w+x])continue;count+=2;let yi=y>>1,xi=x>>1,yn=clamp(yi+(y%2?1:-1),hh),xn=clamp(xi+(x%2?1:-1),ww);for(let k=0;k<2;k++){let pred=(a[(yi*ww+xi)*2+k]*.75+a[(yi*ww+xn)*2+k]*.25)*.75+(a[(yn*ww+xi)*2+k]*.75+a[(yn*ww+xn)*2+k]*.25)*.25,obs=color[(y*w+x)*2+k];error+=(pred-obs)**2;variation+=(a[(yi*ww+xi)*2+k]-obs)**2;}}

 error/=count;variation/=count;if(error>4||!(error/Math.max(variation,1e-9)<.18||variation<1))return null;for(let i=0;i<a.length;i++)a[i]=q8(a[i]);return{data:a,w:ww,h:hh,ch:2};

}

function shiftedTriangle(uv,w,h,valid=null){let best=null,error=Infinity;for(let[px,py]of [[1,0],[0,1],[1,1]]){let ww=w+px,hh=h+py,pad=new Float64Array(ww*hh*2);for(let y=0;y<hh;y++)for(let x=0;x<ww;x++)for(let k=0;k<2;k++)pad[(y*ww+x)*2+k]=uv[(Math.max(0,y-py)*w+Math.max(0,x-px))*2+k];let take=null;if(valid){take=new Uint8Array(ww*hh);for(let y=0;y<h;y++)take.set(valid.subarray(y*w,(y+1)*w),(y+py)*ww+px);}let f=triangle(pad,ww,hh,take);if(!f)continue;let sum=0,n=0;for(let y=2;y<f.h*2-2;y+=3)for(let x=2;x<f.w*2-2;x+=3){let yi=y>>1,xi=x>>1,yn=yi+(y%2?1:-1),xn=xi+(x%2?1:-1);for(let k=0;k<2;k++){let a=f.data,pred=(a[(yi*f.w+xi)*2+k]*.75+a[(yi*f.w+xn)*2+k]*.25)*.75+(a[(yn*f.w+xi)*2+k]*.75+a[(yn*f.w+xn)*2+k]*.25)*.25;sum+=(pred-pad[(y*ww+x)*2+k])**2;n++;}}if(sum/Math.max(1,n)<error){error=sum/Math.max(1,n);best=f;best.offsetX=-px;best.offsetY=-py;}}return best;}

function laplace(x,w,h,ch){let out=new Float64Array(x.length);for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++)for(let k=0;k<ch;k++){let p=(y*w+xx)*ch+k,v=x[p];if(xx)out[p]+=v-x[p-ch];if(xx+1<w)out[p]+=v-x[p+ch];if(y)out[p]+=v-x[p-w*ch];if(y+1<h)out[p]+=v-x[p+w*ch];}return out;}

async function fitSamples(values,px,py,weights,w,h,ch,bg,known,regular,cubic,options){

 const N=w*h,S=px.length,K=cubic?16:4,index=new Int32Array(S*K),basis=new Float64Array(S*K),coverage=new Float64Array(N),diag=new Float64Array(N);

 for(let j=0;j<S;j++){let x=clamp(px[j],w),y=clamp(py[j],h),x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0;if(cubic){let a=spline(fx),b=spline(fy);for(let dy=0;dy<4;dy++)for(let dx=0;dx<4;dx++){let k=dy*4+dx;index[j*K+k]=clamp(y0+dy-1,h)*w+clamp(x0+dx-1,w);basis[j*K+k]=b[dy]*a[dx];}}else{let ids=[y0*w+x0,y0*w+Math.min(w-1,x0+1),Math.min(h-1,y0+1)*w+x0,Math.min(h-1,y0+1)*w+Math.min(w-1,x0+1)],wt=[(1-fx)*(1-fy),fx*(1-fy),(1-fx)*fy,fx*fy];for(let k=0;k<4;k++){index[j*K+k]=ids[k];basis[j*K+k]=wt[k];}}for(let k=0;k<K;k++){let p=index[j*K+k],v=basis[j*K+k];coverage[p]+=v*weights[j];diag[p]+=v*v*weights[j];}}

 function adj(data){let out=new Float64Array(N*ch);for(let j=0;j<S;j++)for(let k=0;k<K;k++){let p=index[j*K+k]*ch,wt=basis[j*K+k]*weights[j];for(let a=0;a<ch;a++)out[p+a]+=data[j*ch+a]*wt;}return out;}

 const rhsData=adj(values),initial=rhsData.slice(),count=coverage.slice();for(let p=0;p<N;p++)if(known[p]){count[p]=1;for(let a=0;a<ch;a++)initial[p*ch+a]=bg[a];}

 for(let it=0;it<48;it++){let hits=[],any=false;for(let p=0;p<N;p++)if(count[p]<1e-7){any=true;let x=p%w,y=Math.floor(p/w),near=[(y? p-w:p),(y+1<h?p+w:p),(x?p-1:p),(x+1<w?p+1:p)],sum=0,v=new Array(ch).fill(0);for(let q of near){sum+=count[q];for(let a=0;a<ch;a++)v[a]+=initial[q*ch+a];}if(sum>1e-7)hits.push([p,sum/4,v.map(t=>t/4)]);}if(!any||!hits.length)break;for(let[p,weight,v]of hits){count[p]=weight;for(let a=0;a<ch;a++)initial[p*ch+a]=v[a];}if(it%8===0)await tick();}

 const anchor=new Float64Array(N),D=new Float64Array(N),x=new Float64Array(N*ch),rhs=rhsData.slice();for(let p=0;p<N;p++){anchor[p]=(known[p]?2:0)+.0001;D[p]=diag[p]+(cubic?20:4)*regular+anchor[p];for(let a=0;a<ch;a++){let v=known[p]||count[p]<1e-7?bg[a]:initial[p*ch+a]/count[p];x[p*ch+a]=v;rhs[p*ch+a]+=anchor[p]*v;}}

 const regMap=options.seamFactor&&cubic&&ch===1?new Float64Array(N):null;if(regMap){let f=options.seamFactor;for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){let p=yy*w+xx,gx=(x[yy*w+Math.min(w-1,xx+1)]-x[yy*w+Math.max(0,xx-1)])/(xx===0||xx===w-1?1:2),gy=(x[Math.min(h-1,yy+1)*w+xx]-x[Math.max(0,yy-1)*w+xx])/(yy===0||yy===h-1?1:2),sx=(xx+.5)/f%16,sy=(yy+.5)/f%16,dist=Math.min(sx,16-sx,sy,16-sy),band=Math.max(0,Math.min(1,1-dist/5)),g=Math.sqrt(gx*gx+gy*gy);regMap[p]=regular+band*(.2*Math.max(0,Math.min(1,(f-.6)/.15))**2/(1+(g/6)**4)+options.seamBoost/(1+(g/8)**4));D[p]=diag[p]+20*regMap[p]+anchor[p];}}

 function operator(v){let pred=new Float64Array(S*ch);for(let j=0;j<S;j++)for(let k=0;k<K;k++){let p=index[j*K+k]*ch,wt=basis[j*K+k];for(let a=0;a<ch;a++)pred[j*ch+a]+=v[p+a]*wt;}let out=adj(pred),lp=laplace(v,w,h,ch);if(cubic){if(regMap)for(let i=0;i<lp.length;i++)lp[i]*=regMap[Math.floor(i/ch)];lp=laplace(lp,w,h,ch);}for(let p=0;p<N;p++)for(let a=0;a<ch;a++){let i=p*ch+a;out[i]+=(regMap?lp[i]:regular*lp[i])+anchor[p]*v[i];}return out;}

 let ax=operator(x),r=new Float64Array(x.length),z=new Float64Array(x.length),p=new Float64Array(x.length),rr=new Float64Array(ch);for(let i=0;i<x.length;i++){r[i]=rhs[i]-ax[i];z[i]=r[i]/D[Math.floor(i/ch)];p[i]=z[i];rr[i%ch]+=r[i]*z[i];}

 for(let it=0;it<12;it++){let ap=operator(p),den=new Float64Array(ch),alpha=new Float64Array(ch),next=new Float64Array(ch);for(let i=0;i<x.length;i++)den[i%ch]+=p[i]*ap[i];for(let a=0;a<ch;a++)alpha[a]=rr[a]/Math.max(1e-20,den[a]);for(let i=0;i<x.length;i++){let a=i%ch;x[i]+=p[i]*alpha[a];r[i]-=ap[i]*alpha[a];z[i]=r[i]/D[Math.floor(i/ch)];next[a]+=r[i]*z[i];}for(let i=0;i<x.length;i++)p[i]=z[i]+p[i]*next[i%ch]/Math.max(rr[i%ch],1e-20);rr=next;options.progress?.(.78+.06*(it+1)/12);await tick();}

 return{data:x,w,h,ch};

}

function enlarge(field,factor,w,h,cubic){let out=new Float64Array(w*h*field.ch),{data,a,ww}=field;for(let y=0;y<h;y++)for(let x=0;x<w;x++){let xx=clamp((x+.5)*factor-.5,field.w),yy=clamp((y+.5)*factor-.5,field.h),x0=Math.floor(xx),y0=Math.floor(yy),fx=xx-x0,fy=yy-y0,wx=cubic?spline(fx):[1-fx,fx],wy=cubic?spline(fy):[1-fy,fy],offset=cubic?-1:0;for(let dy=0;dy<wy.length;dy++)for(let dx=0;dx<wx.length;dx++){let p=(clamp(y0+dy+offset,field.h)*field.w+clamp(x0+dx+offset,field.w))*field.ch;for(let a=0;a<field.ch;a++)out[(y*w+x)*field.ch+a]+=field.data[p+a]*wx[dx]*wy[dy];}}return out;}

function blockScore(initial){let a=initial.data,w=initial.width,h=initial.height,ss=0,sb=0,ns=0,nb=0,Y=i=>(a[i*4]*19595+a[i*4+1]*38470+a[i*4+2]*7471)/65536;for(let x=8;x<w;x+=8)for(let y=0;y<h;y++){let i=y*w+x,d=Math.min(10,Math.abs(Y(i)-Y(i-1)));if(x%32===0){ss+=d;ns++;}else{sb+=d;nb++;}}for(let y=8;y<h;y+=8)for(let x=0;x<w;x++){let i=y*w+x,d=Math.min(10,Math.abs(Y(i)-Y(i-w)));if(y%32===0){ss+=d;ns++;}else{sb+=d;nb++;}}return Math.min(ns,nb)>=64&&sb/nb>.1?(ss/ns)/(sb/nb):1;}


// Fit the seam phase independently in both halves of each axis.
function resizePhase(luma,w,h,ow,oh){
 const offsets=[0,0];
 for(let axis=0;axis<2;axis++){
  const n=axis?h:w, cross=axis?w:h, period=16*n/(axis?oh:ow);
  if(period<5||n<12*period)continue;
  const first=Math.floor(2*period)+1, last=Math.ceil(n-2*period);
  const omega=2*Math.PI/period, estimates=[];
  for(let half=0;half<2;half++){
   const start=half?Math.floor(cross/2):0, end=half?cross:Math.floor(cross/2);
   let real=0, imag=0, total=0, cosSum=0, sinSum=0;
   for(let i=first;i<last;i++){
    let energy=0;
    const stride=axis?1:w, adjacent=axis?w:1, base=i*adjacent;
    for(let j=start;j<end;j++){
     const p=base+j*stride;
     energy+=Math.min(72,Math.abs(luma[p]-luma[p-adjacent]));
    }
    const cosine=Math.cos(i*omega), sine=Math.sin(i*omega);
    total+=energy; real+=energy*cosine; imag+=energy*sine;
    cosSum+=cosine; sinSum+=sine;
   }
   real-=total*cosSum/(last-first); imag-=total*sinSum/(last-first);
   if(Math.hypot(real,imag)<.07*total)break;
   estimates.push(-Math.atan2(imag,real)/omega);
  }
  if(estimates.length===2&&Math.abs(estimates[0]-estimates[1])<=.20){
   const offset=(estimates[0]+estimates[1])/2;
   if(Math.abs(offset)>=.20&&Math.abs(offset)<=.80)offsets[axis]=offset;
  }
 }
 return offsets;
}

function boxMean(data,w,h,ch,radius){
 let input=data;
 const diameter=2*radius+1;
 for(let axis=0;axis<2;axis++){
  const n=axis?h:w, lines=axis?w:h, stride=(axis?w:1)*ch;
  const output=new Float64Array(data.length);
  for(let line=0;line<lines;line++)for(let c=0;c<ch;c++){
   const start=line*(axis?1:w)*ch+c;
   let sum=0;
   for(let k=-radius;k<=radius;k++)sum+=input[start+clamp(k,n)*stride];
   for(let i=0;i<n;i++){
    output[start+i*stride]=sum/diameter;
    sum+=input[start+clamp(i+radius+1,n)*stride]-input[start+clamp(i-radius,n)*stride];
   }
  }
  input=output;
 }
 return input;
}

function smoothLattice(field,radius,threshold,strength){
 const {data,w,h,ch}=field, average=a=>boxMean(a,w,h,ch,radius);
 const mean=average(data), variance=average(data.map(v=>v*v)), intercept=mean;
 for(let i=0;i<data.length;i++){
  const v=Math.max(0,variance[i]-mean[i]*mean[i]), gain=v/(v+threshold*threshold);
  variance[i]=gain;
  intercept[i]=(1-gain)*mean[i];
 }
 const gain=average(variance), bias=average(intercept);
 for(let i=0;i<data.length;i++)data[i]+=strength*(gain[i]*data[i]+bias[i]-data[i]);
}

async function scatter(plane,step,m,map,placed,inv,rw,rh,bg,margin,regular,cubic,full,options,nativeMargin=0,severity=0,phaseStrength=0){

 const nx=Math.floor(m.ow/16),ny=Math.floor(m.oh/16),factor=full?1:Math.min(rw/m.ow,rh/m.oh)/step,ww=Math.max(1,Math.ceil(m.iw*factor)),hh=Math.max(1,Math.ceil(m.ih*factor)),count=placed.order.length,which=new Int32Array(nx*ny).fill(-1),labels=new Int32Array(nx*ny).fill(-1),origX=new Int32Array(count),origY=new Int32Array(count),ex=new Int8Array(count),ey=new Int8Array(count),vx=new Int8Array(count),vy=new Int8Array(count),unique=new Map();

 for(let j=0;j<count;j++){let s=placed.order[j],sx=s%(m.w/16)*16,sy=Math.floor(s/(m.w/16))*16,p=inv[sy*m.w+sx],right=inv[sy*m.w+sx+1],down=inv[(sy+1)*m.w+sx],d=placed.tiles[j],x=d%nx*16,y=Math.floor(d/nx)*16;origX[j]=p%m.w;origY[j]=Math.floor(p/m.w);ex[j]=right%m.w-origX[j];ey[j]=Math.floor(right/m.w)-origY[j];vx[j]=down%m.w-origX[j];vy[j]=Math.floor(down/m.w)-origY[j];if(Math.abs(ex[j])+Math.abs(ey[j])!==1||Math.abs(vx[j])+Math.abs(vy[j])!==1||ex[j]*vx[j]+ey[j]*vy[j]!==0)throw Error('采样分组无效');let name=[ex[j],ey[j],vx[j],vy[j],origX[j]-ex[j]*x-vx[j]*y,origY[j]-ey[j]*x-vy[j]*y].join(',');if(!unique.has(name))unique.set(name,unique.size);which[d]=j;labels[d]=unique.get(name);}

 const max=plane.w*plane.h,px=new Float64Array(max),py=new Float64Array(max),values=new Float64Array(max*plane.ch),weights=new Float64Array(max),radius=rw===m.ow&&rh===m.oh?(step-1)/2+nativeMargin:margin*step/Math.min(rw/m.ow,rh/m.oh);let used=0;

 for(let yy=0;yy<plane.h;yy++)for(let xx=0;xx<plane.w;xx++){let x=(xx*step+step/2+(plane.offsetX||0))*m.ow/rw-.5,y=(yy*step+step/2+(plane.offsetY||0))*m.oh/rh-.5,cx=Math.floor((x+.5)/16),cy=Math.floor((y+.5)/16);if(cx<0||cy<0||cx>=nx||cy>=ny)continue;let tile=cy*nx+cx,j=which[tile];if(j<0)continue;let lx=Math.floor((x-radius+.5)/16),hx=Math.floor((x+radius+.5)/16),ly=Math.floor((y-radius+.5)/16),hy=Math.floor((y+radius+.5)/16),ok=true;for(let b=ly;b<=hy&&ok;b++)for(let a=lx;a<=hx;a++)if(a<0||b<0||a>=nx||b>=ny||labels[b*nx+a]!==labels[tile]){ok=false;break;}if(!ok)continue;let u=x-cx*16,v=y-cy*16,sx=origX[j]+ex[j]*u+vx[j]*v,sy=origY[j]+ey[j]*u+vy[j]*v;if(sx<-.5||sy<-.5||sx>=m.iw-.5||sy>=m.ih-.5)continue;let confidence=1;if(cubic&&(rw!==m.ow||rh!==m.oh)){let distance=Infinity;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){let a=cx+dx,b=cy+dy;if(a<0||b<0||a>=nx||b>=ny||labels[b*nx+a]!==labels[tile]){let ddx=Math.max(a*16-.5-x,0,x-(a*16+15.5)),ddy=Math.max(b*16-.5-y,0,y-(b*16+15.5));distance=Math.min(distance,Math.sqrt(ddx*ddx+ddy*ddy));}}let softRadius=(2.5+(step-1)*.5)/Math.min(rw/m.ow,rh/m.oh);confidence=Math.max(.1,Math.min(1,(distance/softRadius)**2));}weights[used]=confidence;px[used]=(sx+.5)*factor-.5;py[used]=(sy+.5)*factor-.5;for(let a=0;a<plane.ch;a++)values[used*plane.ch+a]=plane.data[(yy*plane.w+xx)*plane.ch+a];used++;}

 const active=new Uint8Array(m.w*m.h);for(let s=0;s<inv.length;s++)active[inv[s]]=map.mask[Math.floor(Math.floor(s/m.w)/16)*(m.w/16)+Math.floor(s%m.w/16)];let known=new Uint8Array(ww*hh);for(let y=0;y<hh;y++)for(let x=0;x<ww;x++){let sx=clamp(Math.floor((x+.5)/factor),m.iw),sy=clamp(Math.floor((y+.5)/factor),m.ih);known[y*ww+x]=1-active[sy*m.w+sx];}

 const field=await fitSamples(values.subarray(0,used*plane.ch),px.subarray(0,used),py.subarray(0,used),weights.subarray(0,used),ww,hh,plane.ch,bg,known,regular,cubic,{...options,seamBoost:severity*(.06+.07*phaseStrength),seamFactor:m.d>=14&&(rw!==m.ow||rh!==m.oh)&&cubic&&plane.ch===1?factor:0});
 if(severity)smoothLattice(field,Math.max(1,round((plane.ch===1?10:14)*factor)),(plane.ch===1?6:13)+2*phaseStrength,severity);
 return enlarge(field,factor,m.iw,m.ih,cubic);

}

function photoRegular(m,rw,rh,text){if(text)return .003;if(m.d>=15&&(rw!==m.ow||rh!==m.oh)){let t=Math.max(0,Math.min(1,(Math.min(rw/m.ow,rh/m.oh)-.6)/.15));return .02+.30*t*t;}return m.d>=14&&(rw!==m.ow||rh!==m.oh)?.16:.02;}

async function restore(image,rw,rh,m,password,initial,options={}){

 const key=await c.derive(password,c.unhex(m.s)),map=await c.openMap(m,key),placed=await c.mapping(m,key,map.mask),inv=inverseMap(m),y=new Float64Array(rw*rh),uv=new Float64Array(rw*rh*2);for(let i=0;i<y.length;i++){y[i]=(image[i*4]*19595+image[i*4+1]*38470+image[i*4+2]*7471)/65536;uv[i*2]=image[i*4+2]-y[i];uv[i*2+1]=image[i*4]-y[i];}let valid=null;if(m.d>=14){let nx=Math.floor(m.ow/16),ny=Math.floor(m.oh/16),allowed=new Uint8Array(nx*ny);for(let i=0;i<placed.order.length;i++)allowed[placed.tiles[i]]=1;valid=new Uint8Array(rw*rh);for(let y=0;y<rh;y++){let yy=(y+.5)*m.oh/rh,iy=Math.floor(yy/16);if(iy>=ny||yy%16<3||yy%16>13)continue;for(let x=0;x<rw;x++){let xx=(x+.5)*m.ow/rw,ix=Math.floor(xx/16);if(ix<nx&&xx%16>=3&&xx%16<=13&&allowed[iy*nx+ix])valid[y*rw+x]=1;}}}let native=triangle(uv,rw,rh,valid);if(!native&&options.screenshot_registered)native=shiftedTriangle(uv,rw,rh,valid);if(!native&&!options.screenshot_registered&&rw===m.ow&&rh===m.oh)return initial;let step=native?2:1,by=(map.bg[0]*19595+map.bg[1]*38470+map.bg[2]*7471)/65536,bc=[map.bg[2]-by,map.bg[0]-by],text=!!(m.b&4||m.z&&m.k*256<m.iw*m.ih*.65),edgeMargin=(native||options.screenshot_registered)&&rw===m.ow&&rh===m.oh&&!text&&blockScore(initial)>1.35?1:0,colors;

 const scale=Math.min(rw/m.ow,rh/m.oh);
 const phase=m.d>=15&&scale<.68?resizePhase(y,rw,rh,m.ow,m.oh):[0,0];
 const phaseStrength=Math.min(1,Math.max(Math.abs(phase[0]),Math.abs(phase[1]))/.45);
 const severity=m.d>=15&&!text?Math.min(1,Math.max(0,(.62-scale)/.15)):0;
 if(m.b&2)colors=new Float64Array(m.iw*m.ih*2);
 else{
  const plane=native||{data:uv,w:rw,h:rh,ch:2};
  plane.offsetX=(plane.offsetX||0)+phase[0]; plane.offsetY=(plane.offsetY||0)+phase[1];
  const regular=photoRegular(m,rw,rh,text)+severity*(.04+.05*phaseStrength);
  colors=await scatter(plane,step,m,map,placed,inv,rw,rh,bc,.5,regular,!text,false,options,edgeMargin,severity,phaseStrength);
 }

 let yy=await scatter({data:y,w:rw,h:rh,ch:1,offsetX:phase[0],offsetY:phase[1]},1,m,map,placed,inv,rw,rh,[by],rw===m.ow&&rh===m.oh?0:.35,text?.001:.01,!text&&(rw!==m.ow||rh!==m.oh),text,options,edgeMargin,severity,phaseStrength),[vw,vh]=c.normalizedShape(rw,rh),table=options.calibrationHeader?c.calibration(options.calibrationHeader.small,options.calibrationHeader.vw,options.calibrationHeader.vh,m):c.calibration(c.resizeRGB(image,rw,rh,vw,vh),vw,vh,m),out=initial.data.slice();for(let i=0;i<yy.length;i++){if(m.b&2){let v=clamp(round(yy[i]),256),mono=round(table[v*3]*.299+table[v*3+1]*.587+table[v*3+2]*.114);out[i*4]=out[i*4+1]=out[i*4+2]=mono;}else{let r=yy[i]+colors[i*2+1],b=yy[i]+colors[i*2],g=(yy[i]-.299*r-.114*b)/.587;out[i*4]=table[clamp(round(r),256)*3];out[i*4+1]=table[clamp(round(g),256)*3+1];out[i*4+2]=table[clamp(round(b),256)*3+2];}}return{data:out,width:m.iw,height:m.ih};

}

root.MisanSampling={restore};if(typeof module!=='undefined')module.exports=root.MisanSampling;

})(__cf);





/* Gilbert payload with sampling-aligned phase; key-controlled contour layer. */

(function(root){'use strict';

const c=root.MisanCarrier2;

const sampling=()=>root.MisanSampling;

function tomatoTransform(data,w,h,inverse=false,iw=w,ih=h){if(!Number.isInteger(w)||!Number.isInteger(h)||w<1||h<1||data.length!==w*h*4)throw Error('图片尺寸无效');let source=data,pw=w,ph=h;if(!inverse){pw=Math.max(16,2**Math.ceil(Math.log2(w)));ph=Math.max(16,2**Math.ceil(Math.log2(h)));if(pw>65535||ph>65535||pw*ph>48000000)throw Error('工作画幅超过48MP上限');source=new Uint8ClampedArray(pw*ph*4).fill(255);let ew=Math.ceil(w/16)*16,eh=Math.ceil(h/16)*16;for(let y=0;y<eh;y++)for(let x=0;x<ew;x++){let a=(Math.min(h-1,y)*w+Math.min(w-1,x))*4,b=(y*pw+x)*4;for(let k=0;k<4;k++)source[b+k]=data[a+k];}}let path=c.curve(pw,ph),n=path.length,off=c.phase(n),out=new Uint8ClampedArray(n*4);for(let i=0;i<n;i++){let a=path[i]*4,b=path[(i+off)%n]*4;if(inverse){for(let k=0;k<4;k++)out[a+k]=source[b+k];}else for(let k=0;k<4;k++)out[b+k]=source[a+k];}if(inverse){let cropped=new Uint8ClampedArray(iw*ih*4);for(let y=0;y<ih;y++)cropped.set(out.subarray(y*pw*4,(y*pw+iw)*4),y*iw*4);return{data:cropped,width:iw,height:ih};}return{data:out,width:pw,height:ph};}

async function encrypt(data,w,h,cover,cw,ch,password='',options={}){c.keyBytes(password);let pal=c.sourcePalette(data,w,h),payload=tomatoTransform(data,w,h);return c.encrypt(payload.data,payload.width,payload.height,cover,cw,ch,password,{...options,iw:w,ih:h,palette:pal});}

async function decrypt(data,w,h,password='',options={}){let framing=root.MisanFrame,reg=framing.locate(data,w,h);if(reg.info.screenshot_registered){try{let registeredHeader=await c.readMetadata(reg.data,reg.width,reg.height);if(reg.width>registeredHeader.meta.ow||reg.height>registeredHeader.meta.oh){let rgb=c.resizeRGB(reg.data,reg.width,reg.height,registeredHeader.meta.ow,registeredHeader.meta.oh,true),rgba=new Uint8ClampedArray(registeredHeader.meta.ow*registeredHeader.meta.oh*4);for(let p=0;p<rgba.length/4;p++){rgba.set(rgb.subarray(p*3,p*3+3),p*4);rgba[p*4+3]=255;}reg.data=rgba;reg.width=registeredHeader.meta.ow;reg.height=registeredHeader.meta.oh;reg.info.screenshot_downsampled=true;}data=reg.data;w=reg.width;h=reg.height;}catch(e){reg.info={screenshot_registered:false};}}let r=await c.decrypt(data,w,h,password,options);if(r.info.legacy)return r;let hd=await c.readMetadata(data,w,h),m=hd.meta,out=tomatoTransform(r.data,r.width,r.height,true,m.iw,m.ih);if(r.info.repair_applied){out=await sampling().restore(data,w,h,m,password,out,{...options,calibrationHeader:hd,screenshot_registered:reg.info.screenshot_registered});if(m.b&4||m.z&&m.k*256<m.iw*m.ih*.65)out.data=await c.repairPixels(out.data,out.width,out.height,r.info.palette||[],options);}return{...out,info:{...r.info,...reg.info}};}

root.MisanScramble={encrypt,decrypt,tomatoTransform,extractPayload:c.decrypt,keyBytes:c.keyBytes,crc32:c.crc32,format:'CFT2'};if(typeof module!=='undefined')module.exports=root.MisanScramble;

})(__cf);





const MisanScramble=__cf.MisanScramble;



(function(root){

'use strict';

const signature=new Uint8Array([137,80,78,71,13,10,26,10]);

function concat(parts){let out=new Uint8Array(parts.reduce((a,b)=>a+b.length,0)),offset=0;for(let p of parts){out.set(p,offset);offset+=p.length;}return out;}

function chunk(type,data){let body=concat([new TextEncoder().encode(type),data]),out=new Uint8Array(data.length+12),v=new DataView(out.buffer);v.setUint32(0,data.length,false);out.set(body,4);v.setUint32(out.length-4,MisanScramble.crc32(body),false);return out;}

function decode(bytes,maxPixels=48000000){if(!signature.every((v,i)=>bytes[i]===v))return null;if(bytes.length<33)throw Error('PNG 文件不完整');let v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),w=v.getUint32(16,false),h=v.getUint32(20,false);if(!w||!h||w*h>maxPixels)throw Error('PNG 图片超过当前像素上限');let buffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),im=UPNG.decode(buffer),data=new Uint8ClampedArray(UPNG.toRGBA8(im)[0]);return{data,width:im.width,height:im.height};}

function paeth(a,b,c){let p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;}

function encode(data,w,h){let opaque=true;for(let i=3;i<data.length;i+=4)if(data[i]!==255){opaque=false;break;}let channels=opaque?3:4,stride=w*channels,raw=new Uint8Array((stride+1)*h),prev=new Uint8Array(stride),current=new Uint8Array(stride),candidates=Array.from({length:5},()=>new Uint8Array(stride));for(let y=0;y<h;y++){for(let x=0;x<w;x++){let p=(y*w+x)*4,q=x*channels;current[q]=data[p];current[q+1]=data[p+1];current[q+2]=data[p+2];if(!opaque)current[q+3]=data[p+3];}let best=Infinity,filter=0;for(let f=0;f<5;f++){let score=0,buffer=candidates[f];for(let i=0;i<stride;i++){let a=i>=channels?current[i-channels]:0,b=prev[i],c=i>=channels?prev[i-channels]:0,p=f===0?0:f===1?a:f===2?b:f===3?Math.floor((a+b)/2):paeth(a,b,c),v=(current[i]-p)&255;buffer[i]=v;score+=Math.min(v,256-v);}if(score<best){best=score;filter=f;}}let q=y*(stride+1);raw[q]=filter;raw.set(candidates[filter],q+1);[prev,current]=[current,prev];}let ihdr=new Uint8Array(13),dv=new DataView(ihdr.buffer);dv.setUint32(0,w,false);dv.setUint32(4,h,false);ihdr[8]=8;ihdr[9]=opaque?2:6;return concat([signature,chunk('IHDR',ihdr),chunk('IDAT',pako.deflate(raw,{level:9})),chunk('IEND',new Uint8Array(0))]);}



root.MisanPNG={decode,encode};

})(__cf);







async function pixels(input){

 if(input&&Number.isInteger(input.width)&&Number.isInteger(input.height)&&input.data){

  if(input.width<1||input.height<1||input.width*input.height>48000000||input.data.length!==input.width*input.height*4)throw Error('图片尺寸无效');

  return {data:new Uint8ClampedArray(input.data),width:input.width,height:input.height};

 }

 let bytes;

 if(input instanceof ArrayBuffer)bytes=new Uint8Array(input);

 else if(ArrayBuffer.isView(input))bytes=new Uint8Array(input.buffer,input.byteOffset,input.byteLength);

 else if(typeof Blob!=='undefined'&&input instanceof Blob)bytes=new Uint8Array(await input.arrayBuffer());

 else throw Error('请选择图片');

 let png=__cf.MisanPNG.decode(bytes);if(png)return png;

 const blob=new Blob([bytes]);let im;

 if(typeof createImageBitmap==='function'){

  try{im=await createImageBitmap(blob,{imageOrientation:'from-image',premultiplyAlpha:'none'});}catch(e){}

 }

 if(!im&&typeof document!=='undefined'){

  const url=URL.createObjectURL(blob);try{im=await new Promise((ok,bad)=>{let img=new Image();img.onload=()=>ok(img);img.onerror=()=>bad(Error('无法读取此图片格式'));img.src=url;});}finally{URL.revokeObjectURL(url);}

 }

 if(!im)throw Error('此环境无法读取该图片格式');

 const w=im.width||im.naturalWidth,h=im.height||im.naturalHeight;

 if(w<1||h<1||w*h>48000000){if(im.close)im.close();throw Error('图片超过48MP上限');}

 const canvas=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(w,h):Object.assign(document.createElement('canvas'),{width:w,height:h});

 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,0,0);const data=ctx.getImageData(0,0,w,h).data;if(im.close)im.close();return {data,width:w,height:h};

}

async function localProcess(mode,input,cover=null,key='',output=null,progress=null){

 if(!['encrypt','decrypt'].includes(mode))throw Error('操作必须是 encrypt 或 decrypt');

 MisanScramble.keyBytes(key);

 const emit=typeof progress==='function'?progress:()=>{};emit(.02);

 const a=await pixels(input);emit(.08);let r;

 if(mode==='encrypt'){

  if(!cover)throw Error('请选择表图');const b=await pixels(cover);emit(.15);

  r=await MisanScramble.encrypt(a.data,a.width,a.height,b.data,b.width,b.height,key,{progress:p=>emit(.15+.75*Math.max(0,Math.min(1,p)))});

 }else{emit(.15);r=await MisanScramble.decrypt(a.data,a.width,a.height,key,{progress:p=>emit(.15+.75*Math.max(0,Math.min(1,p)))});}

 emit(.92);const data=__cf.MisanPNG.encode(r.data,r.width,r.height);emit(1);

 return {data,width:r.width,height:r.height,mime:'image/png',output};

}

/** The same six arguments as Python, Java and PHP. Encoded images or RGBA objects in; PNG bytes out. */

async function process(mode,input,cover=null,key='',output=null,progress=null){

 if(scriptURL&&typeof Worker!=='undefined'){

  let worker;

  try{worker=new Worker(scriptURL);}catch(e){return localProcess(mode,input,cover,key,output,progress);}

  return new Promise((resolve,reject)=>{

   let started=false;

   worker.onmessage=e=>{let m=e.data;if(m.type==='ready'){started=true;worker.postMessage({mode,input,cover,key,output});}else if(m.type==='progress'){if(typeof progress==='function')progress(m.value);}else if(m.type==='result'){worker.terminate();resolve(m.value);}else if(m.type==='error'){worker.terminate();reject(Error(m.message));}};

   worker.onerror=e=>{worker.terminate();if(!started){e.preventDefault();localProcess(mode,input,cover,key,output,progress).then(resolve,reject);}else reject(Error('处理失败，请重试'));};

  });

 }

 return localProcess(mode,input,cover,key,output,progress);

}

const api={version:'v1.4',author:'fanmod',process};

host.MisanScramble=api;

if(typeof exports==='object'&&typeof globalThis.module!=='undefined')globalThis.module.exports=api;

if(typeof document==='undefined'&&typeof importScripts==='function'){

 host.onmessage=async e=>{try{const m=e.data;const value=await localProcess(m.mode,m.input,m.cover,m.key,m.output,n=>host.postMessage({type:'progress',value:n}));host.postMessage({type:'result',value},[value.data.buffer]);}catch(err){host.postMessage({type:'error',message:err.message});}};

 host.postMessage({type:'ready'});

}

})(globalThis);



if(typeof module!=="undefined"&&module.exports)module.exports=globalThis.MisanScramble;

