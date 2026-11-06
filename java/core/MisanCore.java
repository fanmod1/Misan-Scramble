// Copyright (c) 2026 fanmod
// First-party code: MIT (see LICENSE). Third-party notices: THIRD_PARTY_NOTICES.txt.
/** MisanScramble v1.4. See THIRD_PARTY_NOTICES.txt for pic-scramble MIT and Gilbert BSD notices.

 * Standalone Java 8+ / Android core. Public API: process(mode,input,cover,key,output,progress).


 */

import java.io.*;

import java.io.ByteArrayOutputStream;

import java.lang.reflect.*;

import java.nio.*;

import java.nio.charset.*;

import java.nio.charset.StandardCharsets;

import java.nio.file.*;

import java.security.*;

import java.util.*;

import java.util.Arrays;

import java.util.List;

import java.util.function.DoubleConsumer;

import java.util.zip.*;

import javax.crypto.*;

import javax.crypto.spec.*;

public class MisanCore {

static final int MAX=48000000;



static byte[] ascii(String s){return s.getBytes(StandardCharsets.UTF_8);}



static byte[] cat(byte[]... chunks){int n=0;for(byte[] a:chunks)n+=a.length;byte[] out=new byte[n];int i=0;for(byte[] a:chunks){System.arraycopy(a,0,out,i,a.length);i+=a.length;}return out;}



static byte[] hmac(byte[] key,byte[] data)throws Exception{Mac m=Mac.getInstance("HmacSHA256");m.init(new SecretKeySpec(key.length==0?new byte[]{0}:key,"HmacSHA256"));return m.doFinal(data);}



private static byte[] formatId(){int[] id={67,111,110,116,111,117,114,70,105,108,108,45,118,49,49,0};byte[] out=new byte[id.length];for(int i=0;i<id.length;i++)out[i]=(byte)id[i];return out;}
static byte[] derive(String password,byte[] salt)throws Exception{byte[] p=ascii(password);if(p.length>16384)throw new IllegalArgumentException("Password exceeds 16384 UTF-8 bytes");Mac m=Mac.getInstance("HmacSHA256");m.init(new SecretKeySpec(p.length==0?new byte[]{0}:p,"HmacSHA256"));byte[] u=m.doFinal(cat(formatId(),salt,new byte[]{0,0,0,1})),result=u.clone();for(int i=1;i<300000;i++){u=m.doFinal(u);for(int j=0;j<32;j++)result[j]^=u[j];}return result;}



static int color(int r,int g,int b){return 0xff000000|(r<<16)|(g<<8)|b;}



static int channel(int v,int c){return(v>>(16-c*8))&255;}



static int clamp(double v){return Math.max(0,Math.min(255,(int)Math.floor(v+.5)));}



static int orientation(byte[] d){try{if(d.length<4||(d[0]&255)!=255||(d[1]&255)!=216)return 1;int p=2;while(p+4<d.length){if((d[p++]&255)!=255)break;int marker=d[p++]&255;if(marker==218||marker==217)break;int len=((d[p]&255)<<8)|(d[p+1]&255);if(len<2||p+len>d.length)break;if(marker==225&&len>=16&&d[p+2]=='E'&&d[p+3]=='x'&&d[p+4]=='i'&&d[p+5]=='f'){int base=p+8;ByteOrder order=d[base]=='I'?ByteOrder.LITTLE_ENDIAN:ByteOrder.BIG_ENDIAN;ByteBuffer b=ByteBuffer.wrap(d).order(order);int ifd=base+b.getInt(base+4),count=b.getShort(ifd)&65535;for(int i=0;i<count;i++){int e=ifd+2+12*i;if((b.getShort(e)&65535)==274)return b.getShort(e+8)&65535;}}p+=len;}}catch(RuntimeException ignored){}return 1;}



static Image orient(Image im,int o){if(o<2||o>8)return im;int w=im.getWidth(),h=im.getHeight();Image out=new Image(o>=5?h:w,o>=5?w:h,Image.TYPE_INT_ARGB);for(int y=0;y<h;y++)for(int x=0;x<w;x++){int ox=x,oy=y;switch(o){case 2:ox=w-1-x;break;case 3:ox=w-1-x;oy=h-1-y;break;case 4:oy=h-1-y;break;case 5:ox=y;oy=x;break;case 6:ox=h-1-y;oy=x;break;case 7:ox=h-1-y;oy=w-1-x;break;case 8:ox=y;oy=w-1-x;}out.setRGB(ox,oy,im.getRGB(x,y));}return out;}



static final int VMIN=1088;



static final double[][] PATS=patterns7();



static double[] pattern(int n){double[] a=new double[n*n];for(int y=0;y<n;y++)for(int x=0;x<n;x++)a[y*n+x]=Math.sqrt(2)/n*(Math.cos((2*x+1)*Math.PI/(2*n))-Math.cos((2*y+1)*Math.PI/(2*n)));return a;}



static byte[] be(int n){return ByteBuffer.allocate(4).putInt(n).array();}



static long crc(byte[] d){CRC32 c=new CRC32();c.update(d);return c.getValue();}



static String hex(byte[] b){StringBuilder s=new StringBuilder();for(byte v:b)s.append(String.format(Locale.ROOT,"%02x",v&255));return s.toString();}



static byte[] unhex(String s){byte[] b=new byte[s.length()/2];for(int i=0;i<b.length;i++)b[i]=(byte)Integer.parseInt(s.substring(i*2,i*2+2),16);return b;}



static class Stream{byte[] key,domain,buf=new byte[0];int pos=0,counter=0;Stream(byte[] k,byte[] d){key=k;domain=d;}int below(int n)throws Exception{long limit=0x100000000L/n*n;for(;;){if(pos>=buf.length){buf=hmac(key,cat(domain,be(counter++)));pos=0;}long v=ByteBuffer.wrap(buf,pos,4).getInt()&0xffffffffL;pos+=4;if(v<limit)return(int)(v%n);}}}



static int[] shuffle(int[] values,byte[] key,byte[] domain)throws Exception{int[] out=values.clone();Stream r=new Stream(key,domain);for(int i=out.length-1;i>0;i--){int j=r.below(i+1),v=out[i];out[i]=out[j];out[j]=v;}return out;}



static int[] range(int n){int[] a=new int[n];for(int i=0;i<n;i++)a[i]=i;return a;}



static class Im {

 int w,h; int[] a;

 Im(int w,int h){this.w=w;this.h=h;if(w<1||h<1||(long)w*h>MAX)throw new IllegalArgumentException("Image exceeds 48 MP");a=new int[w*h];}

 Im(Image b){w=b.width;h=b.height;a=b.argb.clone();}

 Image image(){return new Image(w,h,a);}

}



static double[] sample(Im im,double x,double y){x=Math.max(0,Math.min(im.w-1,x));y=Math.max(0,Math.min(im.h-1,y));int x0=(int)x,y0=(int)y,x1=Math.min(im.w-1,x0+1),y1=Math.min(im.h-1,y0+1);double fx=x-x0,fy=y-y0;double[] out=new double[3];int[] v={im.a[y0*im.w+x0],im.a[y0*im.w+x1],im.a[y1*im.w+x0],im.a[y1*im.w+x1]};double[] wt={(1-fx)*(1-fy),fx*(1-fy),(1-fx)*fy,fx*fy};for(int c=0;c<3;c++)for(int i=0;i<4;i++)out[c]+=channel(v[i],c)*wt[i];return out;}



static Im resize(Im in,int w,int h){Im out=new Im(w,h);LinearAxis xm=new LinearAxis(in.w,w),ym=new LinearAxis(in.h,h);for(int y=0;y<h;y++)for(int x=0;x<w;x++){int[] ids={ym.a[y]*in.w+xm.a[x],ym.a[y]*in.w+xm.b[x],ym.b[y]*in.w+xm.a[x],ym.b[y]*in.w+xm.b[x]};int rgb=0,fx=xm.f[x],fy=ym.f[y];for(int c=0;c<3;c++){long top=(long)channel(in.a[ids[0]],c)*(16384-fx)+(long)channel(in.a[ids[1]],c)*fx,bottom=(long)channel(in.a[ids[2]],c)*(16384-fx)+(long)channel(in.a[ids[3]],c)*fx;rgb|=(int)((top*(16384-fy)+bottom*fy+134217728)/268435456)<<(16-c*8);}out.a[y*w+x]=0xff000000|rgb;}return out;}



static Im flat(Im in){Im out=new Im(in.w,in.h);for(int i=0;i<in.a.length;i++){double a=(in.a[i]>>>24)/255.;out.a[i]=color(clamp(channel(in.a[i],0)*a+255*(1-a)),clamp(channel(in.a[i],1)*a+255*(1-a)),clamp(channel(in.a[i],2)*a+255*(1-a)));}return out;}



static int[] norm(int w,int h){return norm(w,h,false,14);}



static int gcd(int a,int b){while(b!=0){int t=a%b;a=b;b=t;}return a;}



static int[][] pilots(int w,int h){return pilots(w,h,false,14);}



static double[][] means(Im in){double[][] out=new double[16][3];int[][] p=pilots(in.w,in.h);for(int i=0;i<16;i++)for(int y=0;y<8;y++)for(int x=0;x<8;x++)for(int c=0;c<3;c++)out[i][c]+=channel(in.a[(p[i][1]*8+y)*in.w+p[i][0]*8+x],c)/64.;return out;}



static class Loc{List<int[]> list=new ArrayList<>();int stride=997;boolean old;Loc(int w,int h){this(w,h,false);}

 Loc(int w,int h,boolean old){this(w,h,old,old?12:14);}

 Loc(int w,int h,boolean old,int revision){this.old=old;Set<Integer> skip=new HashSet<>();for(int[] p:pilots(w,h,old,revision))for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++)skip.add((p[1]+y)*(w/8)+p[0]+x);for(int y=0;y<h/8;y++)for(int x=0;x<w/8;x++)if((x<(int)((old?.12:revision==13?.06:.031)*w/8)||x>=(int)Math.ceil((old?.88:revision==13?.94:.969)*w/8))&&!skip.contains(y*(w/8)+x))list.add(new int[]{x*8,y*8});while(gcd(stride,list.size())!=1)stride+=2;}}



static double coeff(Im im,double x,double y,int n,double[] pattern,double sx,double sy){double sum=0;for(int dy=0;dy<n;dy++)for(int dx=0;dx<n;dx++){double[] p=sample(im,(x+dx+.5)*sx-.5,(y+dy+.5)*sy-.5);sum+=(.299*p[0]+.587*p[1]+.114*p[2])*pattern[dy*n+dx];}return sum;}



static byte[] canonical(Map<String,Object> m){StringBuilder s=new StringBuilder("{");for(String k:new TreeSet<>(m.keySet())){if(s.length()>1)s.append(',');s.append('"').append(k).append("\":");Object v=m.get(k);if(v instanceof String)s.append('"').append(v).append('"');else s.append(v);}return ascii(s.append('}').toString());}



static int num(Map<String,Object> m,String k){return((Number)m.get(k)).intValue();}



static String str(Map<String,Object> m,String k){return(String)m.get(k);}



static class Header{Map<String,Object> m;Im small;Header(Map<String,Object> m,Im s){this.m=m;small=s;}}



static double floatSample(float[] a,int w,int h,double x,double y){x=Math.max(0,Math.min(w-1,x));y=Math.max(0,Math.min(h-1,y));int x0=(int)x,y0=(int)y,x1=Math.min(w-1,x0+1),y1=Math.min(h-1,y0+1);double fx=x-x0,fy=y-y0;return(a[y0*w+x0]*(1-fx)+a[y0*w+x1]*fx)*(1-fy)+(a[y1*w+x0]*(1-fx)+a[y1*w+x1]*fx)*fy;}



static byte[] packMeta(Map<String,Object> m){byte[] cv=num(m,"d")>=13?GeometryMask.pack(Base64.getDecoder().decode(str(m,"mask")),num(m,"c"),num(m,"r"),num(m,"d")>=14):compressMap(Base64.getDecoder().decode(str(m,"mask"))),sm=Base64.getDecoder().decode(str(m,"sm"));boolean crop=(boolean)m.get("t");int cn=num(m,"d")>=14?3*num(m,"z"):48;ByteBuffer b=ByteBuffer.allocate(62+cn+cv.length+sm.length+(crop?12:0));b.putShort((short)num(m,"iw")).putShort((short)num(m,"ih"));b.put((byte)(((boolean)m.get("a")?1:0)+((boolean)m.get("p")?2:0)+(crop?4:0)+((boolean)m.get("u")?8:0)));for(String k:new String[]{"w","h","ow","oh"})b.putShort((short)num(m,k));for(String k:new String[]{"c","r","b","d","z"})b.put((byte)num(m,k));b.put(unhex(str(m,"s"))).putInt((int)((Number)m.get("crc")).longValue()).put(num(m,"d")>=14?Arrays.copyOfRange(Base64.getDecoder().decode(str(m,"cal")),36,36+cn):Base64.getDecoder().decode(str(m,"cal"))).putInt(num(m,"k")).putShort((short)cv.length).putShort((short)sm.length).put(cv).put(sm);if(crop){for(String k:new String[]{"fw","fh","x","y"})b.putShort((short)num(m,k));b.put(unhex(str(m,"bg")));}b.put(unhex(str(m,"tag")));return b.array();}



static Map<String,Object> unpackMeta(byte[] data){if(data.length<62)throw new IllegalArgumentException("CFT2 length");ByteBuffer b=ByteBuffer.wrap(data);int iw=b.getShort()&65535,ih=b.getShort()&65535;int flags=b.get()&255;boolean crop=(flags&4)!=0,sparse=(flags&8)!=0;Map<String,Object> m=new TreeMap<>();m.put("iw",(long)iw);m.put("ih",(long)ih);m.put("a",(flags&1)!=0);m.put("p",(flags&2)!=0);m.put("t",crop);m.put("u",sparse);for(String k:new String[]{"w","h","ow","oh"})m.put(k,(long)(b.getShort()&65535));for(String k:new String[]{"c","r","b","d","z"})m.put(k,(long)(b.get()&255));byte[] salt=new byte[16],cal=new byte[48],tag=new byte[16];b.get(salt);m.put("s",hex(salt));m.put("crc",b.getInt()&0xffffffffL);int cn=num(m,"d")>=14?3*num(m,"z"):48;if(cn<0||cn>48||data.length<62+cn)throw new IllegalArgumentException("CFT2 calibration length");if(num(m,"d")>=14){Arrays.fill(cal,(byte)128);for(int i=0;i<12;i++)for(int c=0;c<3;c++)cal[i*3+c]=(byte)Math.floor(i*255/11.+.5);b.get(cal,36,cn);}else b.get(cal);m.put("k",b.getInt()&0xffffffffL);int cl=b.getShort()&65535,sl=b.getShort()&65535;if(flags>15||data.length!=62+cn+cl+sl+(crop?12:0)||sparse!=(sl>0))throw new IllegalArgumentException("CFT2 length");byte[] cv=new byte[cl],sm=new byte[sl];b.get(cv).get(sm);byte[] mask=num(m,"d")>=13?GeometryMask.unpack(cv,num(m,"c"),num(m,"r")):inflateMap(cv,(num(m,"c")*num(m,"r")+7)/8);if(crop){for(String k:new String[]{"fw","fh","x","y"})m.put(k,(long)(b.getShort()&65535));byte[] bg=new byte[4];b.get(bg);m.put("bg",hex(bg));}b.get(tag);m.put("cal",Base64.getEncoder().encodeToString(cal));m.put("mask",Base64.getEncoder().encodeToString(mask));m.put("sm",Base64.getEncoder().encodeToString(sm));m.put("tag",hex(tag));for(String k:new String[]{"w","h","ow","oh","c","r","iw","ih"})if(num(m,k)<1)throw new IllegalArgumentException("Invalid dimensions");int total=((num(m,"w")+15)/16)*((num(m,"h")+15)/16);if((long)num(m,"w")*num(m,"h")>MAX||(long)num(m,"ow")*num(m,"oh")>MAX||num(m,"c")>255||num(m,"r")>255||(num(m,"b")!=1&&num(m,"b")!=3&&!(num(m,"d")>=15&&(num(m,"b")==5||num(m,"b")==7)))||(num(m,"d")!=11&&num(m,"d")!=12&&num(m,"d")!=13&&num(m,"d")!=14&&num(m,"d")!=15)||num(m,"z")>4||num(m,"k")<0||num(m,"k")>total)throw new IllegalArgumentException("Invalid parameters");if(crop||num(m,"w")!=power2(iw)||num(m,"h")!=power2(ih))throw new IllegalArgumentException("Padded frame mismatch");if(crop&&(num(m,"fw")<1||num(m,"fh")<1||(long)num(m,"fw")*num(m,"fh")>MAX||num(m,"x")+num(m,"w")>num(m,"fw")||num(m,"y")+num(m,"h")>num(m,"fh")))throw new IllegalArgumentException("Invalid restored frame");return m;}



static byte[] rgba(Im im){byte[] out=new byte[im.a.length*4];for(int i=0;i<im.a.length;i++){for(int c=0;c<3;c++)out[i*4+c]=(byte)channel(im.a[i],c);out[i*4+3]=(byte)(im.a[i]>>>24);}return out;}



/** Gilbert traversal adapted from pic-scramble; MIT notice included. */

 static class Curve{int width,pos;int[] a;Curve(int w,int h){width=w;a=new int[w*h];if(w>=h)gen(0,0,w,0,0,h);else gen(0,0,0,h,w,0);}void gen(int x,int y,int ax,int ay,int bx,int by){int w=Math.abs(ax+ay),h=Math.abs(bx+by),dax=Integer.signum(ax),day=Integer.signum(ay),dbx=Integer.signum(bx),dby=Integer.signum(by);if(h==1){for(int i=0;i<w;i++)a[pos++]=(y+day*i)*width+x+dax*i;return;}if(w==1){for(int i=0;i<h;i++)a[pos++]=(y+dby*i)*width+x+dbx*i;return;}int ax2=Math.floorDiv(ax,2),ay2=Math.floorDiv(ay,2),bx2=Math.floorDiv(bx,2),by2=Math.floorDiv(by,2),w2=Math.abs(ax2+ay2),h2=Math.abs(bx2+by2);if(2*w>3*h){if(w2%2!=0&&w>2){ax2+=dax;ay2+=day;}gen(x,y,ax2,ay2,bx,by);gen(x+ax2,y+ay2,ax-ax2,ay-ay2,bx,by);}else{if(h2%2!=0&&h>2){bx2+=dbx;by2+=dby;}gen(x,y,bx2,by2,ax2,ay2);gen(x+bx2,y+by2,ax,ay,bx-bx2,by-by2);gen(x+ax-dax+bx2-dbx,y+ay-day+by2-dby,-bx2,-by2,-(ax-ax2),-(ay-ay2));}}}



static double[] differences(Im im,Loc loc){int n=loc.list.size();double[] out=new double[n*6];for(int k=0;k<6;k++)for(int i=0;i<n;i++){int[] p=loc.list.get((i*loc.stride)%n);out[k*n+i]=coeff(im,p[0],p[1],8,PATS[k],1,1);}if(loc.old)return out;int mix=n+1;while(gcd(mix,out.length)!=1)mix++;double[] ordered=new double[out.length];for(int i=0;i<out.length;i++)ordered[i]=out[(int)((long)i*mix%out.length)];return ordered;}



static int[] readBits(double[] diff,int count,int mode){int[] bits=new int[count];for(int i=0;i<count;i++)bits[i]=(mode==0?diff[i]+diff[diff.length-1-i]:mode==1?diff[i]:diff[diff.length-1-i])>0?1:0;return bits;}



static Header header(Im in)throws Exception{for(int revision:new int[]{14,13,12}){boolean old=revision<13;int[] n=norm(in.w,in.h,old,revision);for(int[] d:new int[][]{{0,0},{-8,0},{8,0},{0,-8},{0,8},{-8,-8},{8,8},{-8,8},{8,-8}}){if(Math.min(n[0]+d[0],n[1]+d[1])<8)continue;Im small=resize(in,n[0]+d[0],n[1]+d[1]);Loc loc=new Loc(small.w,small.h,old,revision);double[] diff=differences(small,loc);for(int mode=0;mode<3;mode++){byte[] prefix;try{prefix=ECC.decode(readBits(diff,189,mode));}catch(IllegalArgumentException e){continue;}if(old&&(Arrays.equals(Arrays.copyOf(prefix,4),ascii("CFR4"))||Arrays.equals(Arrays.copyOf(prefix,4),ascii("CFR5"))||Arrays.equals(Arrays.copyOf(prefix,4),ascii("CFR6"))||Arrays.equals(Arrays.copyOf(prefix,4),ascii("CFR7"))||Arrays.equals(Arrays.copyOf(prefix,4),ascii("CFR9"))||Arrays.equals(Arrays.copyOf(prefix,4),ascii("CFT1"))))throw new InvalidFormat();if(!Arrays.equals(Arrays.copyOf(prefix,4),ascii("CFT2")))continue;ByteBuffer b=ByteBuffer.wrap(prefix);int len=b.getShort(4)&65535,count=(int)Math.ceil((len+10)*8/36.)*63;long checksum=b.getInt(6)&0xffffffffL;if(len<62||len>1536||count>diff.length)continue;try{byte[] blob=ECC.decode(readBits(diff,count,mode)),data=Arrays.copyOfRange(blob,10,10+len);if(crc(data)==checksum){Map<String,Object> meta=unpackMeta(data);if((num(meta,"d")<13)==old&&(old||num(meta,"d")==revision||revision==14&&num(meta,"d")>=15))return new Header(meta,small);}}catch(IllegalArgumentException e){}}}}throw new IllegalArgumentException("CFT2 parameters missing or compression exceeds recovery limit");}



static void writeHeader(Im out,Map<String,Object> meta)throws Exception{byte[] data=packMeta(meta);int[] bits=ECC.encode(cat(ascii("CFT2"),ByteBuffer.allocate(2).putShort((short)data.length).array(),be((int)crc(data)),data)),n=norm(out.w,out.h);Loc loc=new Loc(n[0],n[1]);int count=loc.list.size(),capacity=count*6;if(bits.length>capacity)throw new IllegalArgumentException("Repeated header capacity");for(int attempt=0;attempt<8;attempt++){Im small=resize(out,n[0],n[1]);float[] delta=new float[small.w*small.h];for(int side=0;side<(bits.length*2<=capacity?2:1);side++)for(int i=0;i<bits.length;i++){int mix=count+1;while(gcd(mix,capacity)!=1)mix++;int j=(int)((long)(side==0?i:capacity-1-i)*mix%capacity),k=j/count;int[] p=loc.list.get(((j%count)*loc.stride)%count);double diff=coeff(small,p[0],p[1],8,PATS[k],1,1),target=(bits[i]==1?1:-1)*Math.max(320*Math.max(1,Math.min(2,1088./Math.min(out.w,out.h))),Math.abs(diff));for(int y=0;y<8;y++)for(int x=0;x<8;x++)delta[(p[1]+y)*small.w+p[0]+x]+=(float)((target-diff)*PATS[k][y*8+x]/2);}for(int y=0;y<out.h;y++)for(int x=0;x<out.w;x++){if(x>out.w*.032&&x<out.w*.968)continue;int p=y*out.w+x,v=out.a[p];double d=floatSample(delta,small.w,small.h,(x+.5)*small.w/out.w-.5,(y+.5)*small.h/out.h-.5);out.a[p]=color(clamp(channel(v,0)+d),clamp(channel(v,1)+d),clamp(channel(v,2)+d));}try{if(Arrays.equals(canonical(header(out).m),canonical(meta))&&attempt>=1)return;}catch(IllegalArgumentException e){}}throw new IllegalArgumentException("Cannot reliably save parameters in cover");}



static Map<String,Object> layout(Im cover,int w,int h,boolean alpha){int div=gcd(cover.w,cover.h),aw=cover.w/div,ah=cover.h/div,c=cover.w>=cover.h?24:Math.max(4,(int)Math.floor(24.*cover.w/cover.h+.5)),r=cover.h>=cover.w?24:Math.max(4,(int)Math.floor(24.*cover.h/cover.w+.5)),pw=Math.min(cover.w,1024),ph=Math.max(1,(int)Math.floor(cover.h*pw/(double)cover.w+.5));Im prev=resize(cover,pw,ph);double[] gray=new double[pw*ph],edge=new double[gray.length];for(int i=0;i<gray.length;i++)gray[i]=.299*channel(prev.a[i],0)+.587*channel(prev.a[i],1)+.114*channel(prev.a[i],2);for(int y=0;y<ph;y++)for(int x=0;x<pw;x++){int l=Math.max(0,x-1),rr=Math.min(pw-1,x+1),t=Math.max(0,y-1),b=Math.min(ph-1,y+1);double gx=-gray[t*pw+l]+gray[t*pw+rr]-2*gray[y*pw+l]+2*gray[y*pw+rr]-gray[b*pw+l]+gray[b*pw+rr],gy=-gray[t*pw+l]-2*gray[t*pw+x]-gray[t*pw+rr]+gray[b*pw+l]+2*gray[b*pw+x]+gray[b*pw+rr];edge[y*pw+x]=(Math.abs(gx)+Math.abs(gy))/8;}byte[] mask=new byte[(c*r+7)/8];List<int[]> cells=new ArrayList<>();for(int row=0;row<r;row++)for(int col=0;col<c;col++){if((col+1)/(double)c<=.125||col/(double)c>=.875)continue;double sum=0;int strong=0,n=0;for(int y=row*ph/r;y<Math.max(row*ph/r+1,(int)Math.ceil((row+1)*ph/(double)r));y++)for(int x=col*pw/c;x<Math.max(col*pw/c+1,(int)Math.ceil((col+1)*pw/(double)c));x++){double v=edge[y*pw+x];sum+=v;n++;if(v>48)strong++;}if(strong/(double)n<.04&&sum/n<18){int i=row*c+col;mask[i/8]|=1<<(7-i%8);cells.add(new int[]{row,col});}}if(cells.isEmpty())throw new IllegalArgumentException("Cover has no low-contour regions");int need=w*h*(alpha?2:1),k=(int)Math.ceil(Math.max(Math.sqrt(need*1./(cells.size()/(double)(c*r))/(Math.max(cover.w,cover.h)/(double)Math.min(cover.w,cover.h))),VMIN));for(;;k++){int ow=cover.w>=cover.h?(int)Math.floor(k*(double)cover.w/cover.h+.5):k,oh=cover.h>cover.w?(int)Math.floor(k*(double)cover.h/cover.w+.5):k,nx=ow/8,ny=oh/8;if((long)ow*oh>MAX)throw new IllegalArgumentException("Cover capacity exceeds 48 MP");long capacity=0;for(int[] p:cells)capacity+=Math.max(0,Math.min((p[1]+1)*nx/c,7*ow/64)-Math.max(p[1]*nx/c,(ow+63)/64))*((p[0]+1)*ny/r-p[0]*ny/r);if(capacity*64>=need){Map<String,Object> m=new TreeMap<>();String[] names={"w","h","ow","oh","c","r","b","d","z"};int[] values={w,h,ow,oh,c,r,1,2,8};for(int i=0;i<names.length;i++)m.put(names[i],(long)values[i]);m.put("a",alpha);m.put("mask",Base64.getEncoder().encodeToString(mask));return m;}}}



static int[] plan(int w,int h,byte[] key)throws Exception{int n=w*h;int[] C=new Curve(w,h).a,groups=range((n+255)/256),out=new int[n];Stream rng=new Stream(key,ascii("flow\0"));int phase=rng.below(n),direction=rng.below(2)==1?-1:1;for(int i=groups.length-1;i>0;i--){int j=rng.below(i+1),v=groups[i];groups[i]=groups[j];groups[j]=v;}int pos=0;for(int group:groups){int start=group*256,len=Math.min(256,n-start),offset=rng.below(len),step=rng.below(2)==1?-1:1;for(int i=0;i<len;i++){int rank=Math.floorMod(phase+direction*(start+Math.floorMod(offset+step*i,len)),n);out[pos++]=C[rank];}}return out;}



static byte[] preparePilots(Im out){int[] shape=norm(out.w,out.h);double[][] obs=means(resize(out,shape[0],shape[1]));double[] lo={255,255,255},hi={0,0,0},base={0,0,0};for(double[] row:obs)for(int c=0;c<3;c++){lo[c]=Math.min(lo[c],row[c]);hi[c]=Math.max(hi[c],row[c]);base[c]+=row[c]/16;}boolean paint=false;for(int c=0;c<3;c++){base[c]=Math.max(48,Math.min(207,clamp(base[c])));paint|=hi[c]-lo[c]<48;}if(paint){int i=0;for(int[] p:pilots(shape[0],shape[1])){int[] rgb=new int[3];for(int c=0;c<3;c++)rgb[c]=hi[c]-lo[c]<48?(int)base[c]+new int[]{-36,-12,12,36}[i%4]:clamp(obs[i][c]);int x0=Math.max(0,(int)Math.floor((p[0]*8-2)*out.w/(double)shape[0])),x1=Math.min(out.w,(int)Math.ceil((p[0]*8+10)*out.w/(double)shape[0])),y0=Math.max(0,(int)Math.floor((p[1]*8-2)*out.h/(double)shape[1])),y1=Math.min(out.h,(int)Math.ceil((p[1]*8+10)*out.h/(double)shape[1]));for(int y=y0;y<y1;y++)Arrays.fill(out.a,y*out.w+x0,y*out.w+x1,color(rgb[0],rgb[1],rgb[2]));i++;}}byte[] cal=new byte[48];obs=means(resize(out,shape[0],shape[1]));for(int i=0;i<16;i++)for(int c=0;c<3;c++)cal[i*3+c]=(byte)clamp(obs[i][c]);return cal;}



static Im restore(Im in,Map<String,Object> m,int[] order,int[] dest,double[][] colour){int w=num(m,"w"),h=num(m,"h"),nx=num(m,"ow")/8,sc=(w+7)/8;double sx=in.w/(double)num(m,"ow"),sy=in.h/(double)num(m,"oh");Im out=new Im(w,h);Arrays.fill(out.a,0xff000000);for(int i=0;i<dest.length;i++){int dst=dest[i],src=order[i%order.length],ox=src%sc*8,oy=src/sc*8,tx=dst%nx*8,ty=dst/nx*8;for(int y=0;y<Math.min(8,h-oy);y++)for(int x=0;x<Math.min(8,w-ox);x++){double[] rgb=sample(in,(tx+x+.5)*sx-.5,(ty+y+.5)*sy-.5);int p=(oy+y)*w+ox+x;if(i<order.length)out.a[p]=color(clamp(rgb[0]*colour[0][0]+colour[1][0]),clamp(rgb[1]*colour[0][1]+colour[1][1]),clamp(rgb[2]*colour[0][2]+colour[1][2]));else{double a=0;for(int c=0;c<3;c++)a+=(rgb[c]*colour[0][c]+colour[1][c])/3;out.a[p]=(out.a[p]&0xffffff)|(clamp(a)<<24);}}}return out;}



static class InvalidFormat extends Exception{}



static class PixelDest{int[] tiles,order;int nx,ow;PixelDest(Map<String,Object>m,byte[]key,boolean[]mask)throws Exception{ow=num(m,"ow");nx=ow/16;RectanglePacking.Result r=RectanglePacking.plan(m,key,mask);tiles=r.tiles;order=r.order;}int at(int i){int tile=tiles[i/256],local=i%256;return(tile/nx*16+local/16)*ow+tile%nx*16+local%16;}}



static double luminance(Im im,int x,int y){int v=im.a[Math.max(0,Math.min(im.h-1,y))*im.w+Math.max(0,Math.min(im.w-1,x))];return .299*channel(v,0)+.587*channel(v,1)+.114*channel(v,2);}



static double coverEdge(Im base,int x,int y){double tl=luminance(base,x-1,y-1),tc=luminance(base,x,y-1),tr=luminance(base,x+1,y-1),ml=luminance(base,x-1,y),mr=luminance(base,x+1,y),bl=luminance(base,x-1,y+1),bc=luminance(base,x,y+1),br=luminance(base,x+1,y+1);return(Math.abs(-tl+tr-2*ml+2*mr-bl+br)+Math.abs(-tl-2*tc-tr+bl+2*bc+br))/8;}



static void guards(Im out,Im base,byte[] state){int left=(out.w+511)/512*16,right=31*out.w/512*16;int[][] offsets={{0,-1},{0,1},{-1,0},{1,0},{-1,-1},{-1,1},{1,-1},{1,1}};for(int step=1;step<=3;step++)for(int y=0;y<out.h;y++)for(int x=left;x<right;x++){int p=y*out.w+x;if(state[p]!=0||channel(base.a[p],0)<250)continue;int parent=-1;for(int[] d:offsets){int xx=x+d[1],yy=y+d[0];if(xx<0||yy<0||xx>=out.w||yy>=out.h)continue;int q=yy*out.w+xx;if(state[q]>0&&state[q]<=step){parent=q;break;}}if(parent>=0&&coverEdge(base,x,y)<18){out.a[p]=out.a[parent];state[p]=(byte)(step+1);}}}



static class Axis{int[] index;double[] weight;Axis(int original,int received){index=new int[original*4];weight=new double[original*4];long den=2L*original;for(int i=0;i<original;i++){long t=(2L*i+1)*received-original,base=Math.floorDiv(t,den),rem=t-base*den;double f=((rem*1024+original)/den)/1024.,g=1-f,ff=f*f,gg=g*g;double[] values={-.75*f*gg,1.25*ff*f-2.25*ff+1,1.25*gg*g-2.25*gg+1,-.75*ff*g};int[] q=new int[4];int sum=0;for(int j=0;j<4;j++){q[j]=(int)Math.floor(values[j]*16384+.5);sum+=q[j];}q[1]+=16384-sum;for(int j=0;j<4;j++){index[i*4+j]=(int)Math.max(0,Math.min(received-1,base+j-1));weight[i*4+j]=q[j]/16384.;}}}}



static Map<String,Object> baseLayout(Im cover,int w,int h,boolean alpha,int guide){int div=gcd(cover.w,cover.h),aw=cover.w/div,ah=cover.h/div,c=cover.w>=cover.h?guide:Math.max(4,(int)Math.floor(guide*(double)cover.w/cover.h+.5)),r=cover.h>=cover.w?guide:Math.max(4,(int)Math.floor(guide*(double)cover.h/cover.w+.5)),pw=Math.min(cover.w,1024),ph=Math.max(1,(int)Math.floor(cover.h*pw/(double)cover.w+.5));Im prev=resize(cover,pw,ph);double[] gray=new double[pw*ph],edge=new double[gray.length];for(int i=0;i<gray.length;i++)gray[i]=.299*channel(prev.a[i],0)+.587*channel(prev.a[i],1)+.114*channel(prev.a[i],2);for(int y=0;y<ph;y++)for(int x=0;x<pw;x++){int l=Math.max(0,x-1),rr=Math.min(pw-1,x+1),t=Math.max(0,y-1),b=Math.min(ph-1,y+1);double gx=-gray[t*pw+l]+gray[t*pw+rr]-2*gray[y*pw+l]+2*gray[y*pw+rr]-gray[b*pw+l]+gray[b*pw+rr],gy=-gray[t*pw+l]-2*gray[t*pw+x]-gray[t*pw+rr]+gray[b*pw+l]+2*gray[b*pw+x]+gray[b*pw+rr];edge[y*pw+x]=(Math.abs(gx)+Math.abs(gy))/8;}byte[] mask=new byte[(c*r+7)/8];List<int[]> cells=new ArrayList<>();for(int row=0;row<r;row++)for(int col=0;col<c;col++){if((col+1)/(double)c<=.125||col/(double)c>=.875)continue;double sum=0;int strong=0,n=0;for(int y=row*ph/r;y<Math.max(row*ph/r+1,(int)Math.ceil((row+1)*ph/(double)r));y++)for(int x=col*pw/c;x<Math.max(col*pw/c+1,(int)Math.ceil((col+1)*pw/(double)c));x++){double v=edge[y*pw+x];sum+=v;n++;if(v>48)strong++;}if(strong/(double)n<.04&&sum/n<18){int i=row*c+col;mask[i/8]|=1<<(7-i%8);cells.add(new int[]{row,col});}}if(cells.isEmpty())throw new IllegalArgumentException("Cover has no low-contour regions");int need=w*h*(alpha?2:1),k=(int)Math.ceil(Math.max(Math.sqrt(need*1./(cells.size()/(double)(c*r))/(Math.max(cover.w,cover.h)/(double)Math.min(cover.w,cover.h))),VMIN));for(;;k++){int ow=cover.w>=cover.h?(int)Math.floor(k*(double)cover.w/cover.h+.5):k,oh=cover.h>cover.w?(int)Math.floor(k*(double)cover.h/cover.w+.5):k,nx=ow/8,ny=oh/8;if((long)ow*oh>MAX)throw new IllegalArgumentException("Cover capacity exceeds 48 MP");long capacity=0;for(int[] p:cells)capacity+=Math.max(0,Math.min((p[1]+1)*nx/c,7*ow/64)-Math.max(p[1]*nx/c,(ow+63)/64))*((p[0]+1)*ny/r-p[0]*ny/r);if(capacity*64>=need){Map<String,Object> m=new TreeMap<>();String[] names={"w","h","ow","oh","c","r","b","d","z"};int[] values={w,h,ow,oh,c,r,1,3,0};for(int i=0;i<names.length;i++)m.put(names[i],(long)values[i]);m.put("a",alpha);m.put("mask",Base64.getEncoder().encodeToString(mask));return m;}}}



static List<int[]> sourcePalette(Im in){Map<Integer,Integer> counts=new HashMap<>();for(int y=0;y<in.h;y++)for(int x=0;x<in.w;x++){int p=y*in.w+x,v=in.a[p],rgb=v&0xffffff;if((v>>>24)!=255||rgb!=(in.a[y*in.w+Math.max(0,x-1)]&0xffffff)||rgb!=(in.a[y*in.w+Math.min(in.w-1,x+1)]&0xffffff)||rgb!=(in.a[Math.max(0,y-1)*in.w+x]&0xffffff)||rgb!=(in.a[Math.min(in.h-1,y+1)*in.w+x]&0xffffff))continue;counts.put(rgb,counts.getOrDefault(rgb,0)+1);}int threshold=Math.max(64,(in.w*in.h+63)/64);List<int[]> pairs=new ArrayList<>();for(Map.Entry<Integer,Integer> e:counts.entrySet())if(e.getValue()>=threshold)pairs.add(new int[]{e.getKey(),e.getValue()});pairs.sort((a,b)->a[1]!=b[1]?Integer.compare(b[1],a[1]):Integer.compare(a[0],b[0]));List<int[]> out=new ArrayList<>();for(int i=0;i<Math.min(4,pairs.size());i++){int v=pairs.get(i)[0];boolean ambiguous=false;for(Map.Entry<Integer,Integer> e:counts.entrySet()){int other=e.getKey();if(other!=v&&e.getValue()>=4&&Math.max(Math.abs((v>>16)-(other>>16)),Math.max(Math.abs(((v>>8)&255)-((other>>8)&255)),Math.abs((v&255)-(other&255))))<=24){ambiguous=true;break;}}if(!ambiguous)out.add(new int[]{v>>16,(v>>8)&255,v&255});}return out;}



static Im expandSource(Im work,Map<String,Object> m){if(!(boolean)m.get("t"))return work;Im out=new Im(num(m,"fw"),num(m,"fh"));byte[] bg=unhex(str(m,"bg"));int v=((bg[3]&255)<<24)|((bg[0]&255)<<16)|((bg[1]&255)<<8)|(bg[2]&255);Arrays.fill(out.a,v);for(int y=0;y<work.h;y++)System.arraycopy(work.a,y*work.w,out.a,(y+num(m,"y"))*out.w+num(m,"x"),work.w);return out;}



static Im medianRGB(Im in,int r){Im out=new Im(in.w,in.h);System.arraycopy(in.a,0,out.a,0,in.a.length);int[] hist=new int[256];int rank=((2*r+1)*(2*r+1))/2+1;for(int c=0;c<3;c++)for(int y=0;y<in.h;y++){Arrays.fill(hist,0);for(int dy=-r;dy<=r;dy++){int row=Math.max(0,Math.min(in.h-1,y+dy))*in.w;for(int dx=-r;dx<=r;dx++)hist[channel(in.a[row+Math.max(0,Math.min(in.w-1,dx))],c)]++;}int med=0,below=0;while(below+hist[med]<rank)below+=hist[med++];for(int x=0;x<in.w;x++){int p=y*in.w+x,shift=16-c*8;out.a[p]=(out.a[p]&~(255<<shift))|(med<<shift);if(x==in.w-1)break;int left=Math.max(0,x-r),right=Math.min(in.w-1,x+r+1);for(int dy=-r;dy<=r;dy++){int row=Math.max(0,Math.min(in.h-1,y+dy))*in.w,a=channel(in.a[row+left],c),b=channel(in.a[row+right],c);hist[a]--;hist[b]++;if(a<med)below--;if(b<med)below++;}while(below>=rank){med--;below-=hist[med];}while(below+hist[med]<rank)below+=hist[med++];}}return out;}



static Im repairPixels(Im in,List<int[]> pal){Im guide=medianRGB(in,1),target=medianRGB(in,2),out=new Im(in.w,in.h);System.arraycopy(in.a,0,out.a,0,in.a.length);for(int y=0;y<in.h;y++)for(int x=0;x<in.w;x++){int p=y*in.w+x,v=in.a[p],t=target.a[p];boolean valid=true;for(int c=0;c<3;c++)if(Math.abs(channel(v,c)-channel(t,c))>64)valid=false;if(!valid)continue;for(int c=0;c<3&&valid;c++){int lo=255,hi=0;for(int dy=-1;dy<=1;dy++)for(int dx=-1;dx<=1;dx++){int a=channel(guide.a[Math.max(0,Math.min(in.h-1,y+dy))*in.w+Math.max(0,Math.min(in.w-1,x+dx))],c);lo=Math.min(lo,a);hi=Math.max(hi,a);}if(hi-lo>24)valid=false;}if(!valid)continue;int signalR=channel(v,0)-channel(t,0),signalG=channel(v,1)-channel(t,1),signalB=channel(v,2)-channel(t,2),norm=signalR*signalR+signalG*signalG+signalB*signalB;boolean supported=false;if(norm>=4)for(int[] dir:new int[][]{{0,1},{1,0},{1,1},{1,-1}}){int votes=0;for(int distance:new int[]{-2,-1,1,2}){int q=in.a[Math.max(0,Math.min(in.h-1,y+dir[0]*distance))*in.w+Math.max(0,Math.min(in.w-1,x+dir[1]*distance))],dot=signalR*(channel(q,0)-channel(t,0))+signalG*(channel(q,1)-channel(t,1))+signalB*(channel(q,2)-channel(t,2));if(dot>0&&dot*4>=norm)votes++;}if(votes>=(Math.max(Math.abs(signalR),Math.max(Math.abs(signalG),Math.abs(signalB)))<=12?2:3)){supported=true;break;}}if(supported)continue;int[] chosen=null;int best=Integer.MAX_VALUE;for(int[] col:pal){int dr=channel(t,0)-col[0],dg=channel(t,1)-col[1],db=channel(t,2)-col[2],distance=dr*dr+dg*dg+db*db;if(Math.max(Math.abs(dr),Math.max(Math.abs(dg),Math.abs(db)))<=12&&distance<best){chosen=col;best=distance;}}out.a[p]=(v&0xff000000)|(chosen==null?t&0xffffff:(chosen[0]<<16)|(chosen[1]<<8)|chosen[2]);}return out;}



static byte[] preparePilots(Im out,List<int[]> pal){int[] n=norm(out.w,out.h);int[][] pos=pilots(n[0],n[1]);byte[] cal=new byte[48];for(int i=0;i<16;i++){int[] target=i<12?new int[]{clamp(i*255/11.),clamp(i*255/11.),clamp(i*255/11.)}:i<12+pal.size()?pal.get(i-12):new int[]{128,128,128};for(int c=0;c<3;c++)cal[i*3+c]=(byte)target[c];int x=pos[i][0],y=pos[i][1],x0=Math.max(0,(int)Math.floor((x*8-4)*out.w/(double)n[0])),x1=Math.min(out.w,(int)Math.ceil((x*8+12)*out.w/(double)n[0])),y0=Math.max(0,(int)Math.floor((y*8-4)*out.h/(double)n[1])),y1=Math.min(out.h,(int)Math.ceil((y*8+12)*out.h/(double)n[1]));for(int yy=y0;yy<y1;yy++)for(int xx=x0;xx<x1;xx++)out.a[yy*out.w+xx]=color(target[0],target[1],target[2]);}return cal;}



static int[][] colorTable(Header hd){byte[] expected=Base64.getDecoder().decode(str(hd.m,"cal"));double[][] obs=means(hd.small,num(hd.m,"d")<13,num(hd.m,"d"));int[][] table=new int[256][3];for(int v=0;v<256;v++)Arrays.fill(table[v],v);for(int c=0;c<3;c++){if(num(hd.m,"d")>=14){List<Integer>ids=new ArrayList<>();List<Double>slopes=new ArrayList<>();for(int i=0;i<12;i++)if(obs[i][c]>2&&obs[i][c]<253)ids.add(i);for(int i:ids)for(int j:ids)if(j>i&&(expected[j*3+c]&255)-(expected[i*3+c]&255)>=32)slopes.add((obs[j][c]-obs[i][c])/((expected[j*3+c]&255)-(expected[i*3+c]&255)));if(slopes.size()>=3){double a=calMedian(slopes);List<Double>offset=new ArrayList<>();for(int i:ids)offset.add(obs[i][c]-a*(expected[i*3+c]&255));double b=calMedian(offset);List<Double>residual=new ArrayList<>();for(int i:ids)residual.add(Math.abs(obs[i][c]-a*(expected[i*3+c]&255)-b));double res=calMedian(residual);if(a>.5&&a<1.5&&res<=3){List<Double>shift=new ArrayList<>();for(int v=0;v<256;v++)shift.add(Math.abs((v-b)/a-v));if(calMedian(shift)<1.5)continue;}}}double[] diff=new double[12];for(int i=0;i<12;i++)diff[i]=Math.abs(obs[i][c]-(expected[i*3+c]&255));Arrays.sort(diff);if((diff[5]+diff[6])/2<1.5)continue;double[] xs=new double[12],ys=new double[12];int count=0;for(int i=0;i<12;i++){double xx=Math.max(obs[i][c],count>0?xs[count-1]:0);if(count>0&&xx-xs[count-1]<.25)ys[count-1]=expected[i*3+c]&255;else{xs[count]=xx;ys[count++]=expected[i*3+c]&255;}}for(int v=0;v<256;v++){double value;if(v<=xs[0])value=ys[0];else if(v>=xs[count-1])value=ys[count-1];else{int j=1;while(xs[j]<v)j++;value=ys[j-1]+(ys[j]-ys[j-1])*(v-xs[j-1])/(xs[j]-xs[j-1]);}table[v][c]=clamp(value);}}return table;}



static Map<String,Object> layout(Im cover,int w,int h,boolean alpha,boolean cropped){for(int guide:new int[]{24,22,20,18,16}){Map<String,Object> m=baseLayout(cover,w,h,alpha,guide);int length=98+(num(m,"c")*num(m,"r")+7)/8+(cropped?12:0);int[] shape=norm(num(m,"ow"),num(m,"oh"));Loc loc=new Loc(shape[0],shape[1]);if((int)Math.ceil((length+10)*8/36.)*63*2<=loc.list.size()*4)return m;}throw new IllegalArgumentException("Parameter capacity");}



static class LinearAxis{int[] a,b,f;LinearAxis(int original,int output){a=new int[output];b=new int[output];f=new int[output];long den=2L*output;for(int i=0;i<output;i++){long t=(2L*i+1)*original-output,base=Math.floorDiv(t,den),rem=t-base*den;a[i]=(int)Math.max(0,Math.min(original-1,base));b[i]=(int)Math.max(0,Math.min(original-1,base+1));f[i]=(int)((rem*16384+output)/den);}}}



static Map<String,Object> baseLayout(Im cover,int w,int h,boolean alpha,int guide,int count){int div=gcd(cover.w,cover.h),aw=cover.w/div,ah=cover.h/div,c=cover.w>=cover.h?guide:Math.max(4,(int)Math.floor(guide*(double)cover.w/cover.h+.5)),r=cover.h>=cover.w?guide:Math.max(4,(int)Math.floor(guide*(double)cover.h/cover.w+.5)),pw=Math.min(cover.w,1024),ph=Math.max(1,(int)Math.floor(cover.h*pw/(double)cover.w+.5));Im prev=resize(cover,pw,ph);boolean[]reserved=Stroke.reservation(prev);double[] gray=new double[pw*ph],edge=new double[gray.length];for(int i=0;i<gray.length;i++)gray[i]=.299*channel(prev.a[i],0)+.587*channel(prev.a[i],1)+.114*channel(prev.a[i],2);for(int y=0;y<ph;y++)for(int x=0;x<pw;x++){int l=Math.max(0,x-1),rr=Math.min(pw-1,x+1),t=Math.max(0,y-1),b=Math.min(ph-1,y+1);double gx=-gray[t*pw+l]+gray[t*pw+rr]-2*gray[y*pw+l]+2*gray[y*pw+rr]-gray[b*pw+l]+gray[b*pw+rr],gy=-gray[t*pw+l]-2*gray[t*pw+x]-gray[t*pw+rr]+gray[b*pw+l]+2*gray[b*pw+x]+gray[b*pw+rr];edge[y*pw+x]=reserved[y*pw+x]?1024:0;}if(guide==0)return nativeLayout(edge,pw,ph,cover.w,cover.h,w,h,alpha,count);byte[] mask=new byte[(c*r+7)/8];List<int[]> cells=new ArrayList<>();for(int row=0;row<r;row++)for(int col=0;col<c;col++){if((col+1)/(double)c<=.03125||col/(double)c>=.96875)continue;double sum=0;int strong=0,n=0;for(int y=Math.max(0,row*ph/r-1);y<Math.min(ph,(int)Math.ceil((row+1)*ph/(double)r)+1);y++)for(int x=Math.max(0,col*pw/c-1);x<Math.min(pw,(int)Math.ceil((col+1)*pw/(double)c)+1);x++){double v=edge[y*pw+x];sum+=v;n++;if(v>48)strong++;}if(sum==0&&!Sketch.hit(col*(double)cover.w/c,row*(double)cover.h/r,(col+1)*(double)cover.w/c,(row+1)*(double)cover.h/r,cover.w,cover.h)){int i=row*c+col;mask[i/8]|=1<<(7-i%8);cells.add(new int[]{row,col});}}if(cells.isEmpty())throw new IllegalArgumentException("Cover has no low-contour regions");int need=count*256*(alpha?2:1),k=(int)Math.ceil(Math.max(Math.sqrt(need*1./(cells.size()/(double)(c*r))/(Math.max(cover.w,cover.h)/(double)Math.min(cover.w,cover.h))),VMIN));for(;;k++){int ow=cover.w>=cover.h?(int)Math.floor(k*(double)cover.w/cover.h+.5):k,oh=cover.h>cover.w?(int)Math.floor(k*(double)cover.h/cover.w+.5):k,nx=ow/16,ny=oh/16;if((long)ow*oh>MAX)throw new IllegalArgumentException("Cover capacity exceeds 48 MP");long capacity=0;for(int[] p:cells)capacity+=Math.max(0,Math.min((p[1]+1)*nx/c,31*ow/512)-Math.max(p[1]*nx/c,(ow+511)/512))*((p[0]+1)*ny/r-p[0]*ny/r);if(capacity*256>=need){Map<String,Object> m=new TreeMap<>();String[] names={"w","h","ow","oh","c","r","b","d","z"};int[] values={w,h,ow,oh,c,r,1,15,0};for(int i=0;i<names.length;i++)m.put(names[i],(long)values[i]);m.put("a",alpha);m.put("mask",Base64.getEncoder().encodeToString(mask));return m;}}}



static int[] plan(int w,int h,byte[] key,boolean[] mask)throws Exception{int n=0;for(boolean v:mask)if(v)n++;int[] out=new int[n];n=0;for(int t=0;t<mask.length;t++)if(mask[t])out[n++]=t;return shuffle(out,key,ascii("blocks\0"));}



static Map<String,Object> layout(Im cover,int w,int h,boolean alpha,boolean cropped,SourceMap src){for(boolean sparse:src.blob.length>0?new boolean[]{true,false}:new boolean[]{false}){int count=sparse?src.k:((w+15)/16)*((h+15)/16);byte[] sm=sparse?src.blob:new byte[0];for(int guide:new int[]{48,40,32,24,20,16}){Map<String,Object> m=baseLayout(cover,w,h,alpha,guide,count);int length=106+compressMap(Base64.getDecoder().decode(str(m,"mask"))).length+sm.length+(cropped?12:0);int[] shape=norm(num(m,"ow"),num(m,"oh"));Loc loc=new Loc(shape[0],shape[1]);if((int)Math.ceil((length+10)*8/36.)*63*2<=loc.list.size()*6&&length<=512){m.put("k",(long)count);m.put("u",sparse);m.put("sm",Base64.getEncoder().encodeToString(sm));return m;}}}throw new IllegalArgumentException("Parameter capacity");}



static byte[] compressMap(byte[] data){Deflater d=new Deflater(9);d.setInput(data);d.finish();ByteArrayOutputStream b=new ByteArrayOutputStream();byte[] buf=new byte[1024];while(!d.finished()){int n=d.deflate(buf);b.write(buf,0,n);}d.end();return b.toByteArray();}



static byte[] inflateMap(byte[] data,int size){Inflater d=new Inflater();d.setInput(data);byte[] out=new byte[size+1];int pos=0;try{while(!d.finished()&&pos<out.length){int n=d.inflate(out,pos,out.length-pos);if(n==0)break;pos+=n;}if(pos!=size||!d.finished()||d.getRemaining()!=0)throw new IllegalArgumentException("Invalid compressed map");return Arrays.copyOf(out,size);}catch(DataFormatException e){throw new IllegalArgumentException("Invalid compressed map",e);}finally{d.end();}}



static byte[] mapCipher(byte[] data,byte[] key)throws Exception{byte[] out=data.clone();for(int p=0;p<out.length;p+=32){byte[] b=hmac(key,cat(ascii("source-map\0"),be(p/32)));for(int j=0;j<Math.min(32,out.length-p);j++)out[p+j]^=b[j];}return out;}



static class SourceMap{boolean[] mask;byte[] blob=new byte[0];int bg=0xff000000,k;SourceMap(Im in){int nx=(in.w+15)/16,ny=(in.h+15)/16,count=nx*ny;mask=new boolean[count];Arrays.fill(mask,true);int[] values=new int[count];boolean[] same=new boolean[count];Map<Integer,Integer> counts=new HashMap<>();for(int t=0;t<count;t++){int x=t%nx*16,y=t/nx*16,v=in.a[y*in.w+x];boolean ok=true;for(int yy=y;yy<Math.min(y+16,in.h)&&ok;yy++)for(int xx=x;xx<Math.min(x+16,in.w);xx++)if(in.a[yy*in.w+xx]!=v){ok=false;break;}if(ok){same[t]=true;values[t]=v;counts.put(v,counts.getOrDefault(v,0)+1);}}int best=-1;long order=Long.MAX_VALUE;for(Map.Entry<Integer,Integer> e:counts.entrySet()){int v=e.getKey();long rank=((v&0xffffffL)<<8)|(v>>>24);if(e.getValue()>best||(e.getValue()==best&&rank<order)){bg=v;best=e.getValue();order=rank;}}k=count;if(best<0)return;k=0;for(int t=0;t<count;t++){mask[t]=!same[t]||values[t]!=bg;if(mask[t])k++;}if(k*4>count*3){Arrays.fill(mask,true);k=count;return;}byte[] bits=new byte[(count+7)/8+4];for(int t=0;t<count;t++)if(mask[t])bits[t/8]|=1<<(7-t%8);int p=bits.length-4;bits[p]=(byte)channel(bg,0);bits[p+1]=(byte)channel(bg,1);bits[p+2]=(byte)channel(bg,2);bits[p+3]=(byte)(bg>>>24);blob=compressMap(bits);}}



static double[][] patterns7(){int[][][] pairs={{{0,1},{1,0}},{{0,2},{2,0}},{{1,2},{2,1}},{{0,3},{3,0}},{{1,1},{2,2}},{{1,3},{3,1}}};double[][] out=new double[6][64];for(int k=0;k<6;k++)for(int y=0;y<8;y++)for(int x=0;x<8;x++){int[] a=pairs[k][0],b=pairs[k][1];out[k][y*8+x]=basis7(a[0],y)*basis7(a[1],x)-basis7(b[0],y)*basis7(b[1],x);}return out;}



static double basis7(int u,int x){return u==0?Math.sqrt(1/8.):.5*Math.cos((2*x+1)*u*Math.PI/16);}



static int[] plan(int w,int h,byte[] key,boolean[] mask,PixelDest d)throws Exception{return CurveTransport9.plan(w,h,key,mask,d);}



static Map<String,Object> layout(Im cover,int w,int h,boolean alpha,boolean cropped,SourceMap9 src){for(boolean sparse:src.blob.length>0?new boolean[]{true,false}:new boolean[]{false}){int count=sparse?src.k:((w+15)/16)*((h+15)/16);byte[] sm=sparse?src.blob:new byte[0];for(int guide:new int[]{48,40,32,24,20,16}){Map<String,Object> m=baseLayout(cover,w,h,alpha,guide,count);int length=106+compressMap(Base64.getDecoder().decode(str(m,"mask"))).length+sm.length+(cropped?12:0);int[] shape=norm(num(m,"ow"),num(m,"oh"));Loc loc=new Loc(shape[0],shape[1]);if((int)Math.ceil((length+10)*8/36.)*63*2<=loc.list.size()*6&&length<=512){m.put("k",(long)count);m.put("u",sparse);m.put("sm",Base64.getEncoder().encodeToString(sm));return m;}}}throw new IllegalArgumentException("Parameter capacity");}



static class SourceMap9{boolean[] mask;byte[] blob=new byte[0];int bg=0xff000000,k;SourceMap9(Im in){int nx=(in.w+15)/16,ny=(in.h+15)/16,count=nx*ny;mask=new boolean[count];Arrays.fill(mask,true);int[] values=new int[count];boolean[] same=new boolean[count];Map<Integer,Integer> counts=new HashMap<>();for(int t=0;t<count;t++){int x=t%nx*16,y=t/nx*16,v=in.a[y*in.w+x];boolean ok=true;for(int yy=y;yy<Math.min(y+16,in.h)&&ok;yy++)for(int xx=x;xx<Math.min(x+16,in.w);xx++)if(in.a[yy*in.w+xx]!=v){ok=false;break;}if(ok){same[t]=true;values[t]=v;counts.put(v,counts.getOrDefault(v,0)+1);}}int best=-1;long order=Long.MAX_VALUE;for(Map.Entry<Integer,Integer> e:counts.entrySet()){int v=e.getKey();long rank=((v&0xffffffL)<<8)|(v>>>24);if(e.getValue()>best||(e.getValue()==best&&rank<order)){bg=v;best=e.getValue();order=rank;}}k=count;if(best<0)return;k=0;for(int t=0;t<count;t++){mask[t]=!same[t]||values[t]!=bg;if(mask[t])k++;}if(k*4>count*3){Arrays.fill(mask,true);k=count;return;}byte[] bits=new byte[(count+7)/8+4];for(int t=0;t<count;t++)if(mask[t])bits[t/8]|=1<<(7-t%8);int p=bits.length-4;bits[p]=(byte)channel(bg,0);bits[p+1]=(byte)channel(bg,1);bits[p+2]=(byte)channel(bg,2);bits[p+3]=(byte)(bg>>>24);blob=compressMap(bits);}}



static Map<String,Object> layout(Im cover,int w,int h,boolean alpha,boolean cropped,SourceMap10 src){for(boolean sparse:src.blob.length>0?new boolean[]{true,false}:new boolean[]{false}){int count=sparse?src.k:((w+15)/16)*((h+15)/16);byte[] sm=sparse?src.blob:new byte[0];for(int guide:new int[]{48,40,32,24,20,16}){Map<String,Object> m=baseLayout(cover,w,h,alpha,guide,count);int length=106+compressMap(Base64.getDecoder().decode(str(m,"mask"))).length+sm.length+(cropped?12:0);int[] shape=norm(num(m,"ow"),num(m,"oh"));Loc loc=new Loc(shape[0],shape[1]);if((int)Math.ceil((length+10)*8/36.)*63*2<=loc.list.size()*6&&length<=512){m.put("k",(long)count);m.put("u",sparse);m.put("sm",Base64.getEncoder().encodeToString(sm));return m;}}}throw new IllegalArgumentException("Parameter capacity");}



static class SourceMap10{boolean[] mask;byte[] blob=new byte[0];int bg=0xff000000,k;SourceMap10(Im in){int nx=(in.w+15)/16,ny=(in.h+15)/16,count=nx*ny;mask=new boolean[count];Arrays.fill(mask,true);int[] values=new int[count];boolean[] same=new boolean[count];Map<Integer,Integer> counts=new HashMap<>();for(int t=0;t<count;t++){int x=t%nx*16,y=t/nx*16,v=in.a[y*in.w+x];boolean ok=true;for(int yy=y;yy<Math.min(y+16,in.h)&&ok;yy++)for(int xx=x;xx<Math.min(x+16,in.w);xx++)if(in.a[yy*in.w+xx]!=v){ok=false;break;}if(ok){same[t]=true;values[t]=v;counts.put(v,counts.getOrDefault(v,0)+1);}}int best=-1;long order=Long.MAX_VALUE;for(Map.Entry<Integer,Integer> e:counts.entrySet()){int v=e.getKey();long rank=((v&0xffffffL)<<8)|(v>>>24);if(e.getValue()>best||(e.getValue()==best&&rank<order)){bg=v;best=e.getValue();order=rank;}}k=count;if(best<0)return;k=0;for(int t=0;t<count;t++){mask[t]=!same[t]||values[t]!=bg;if(mask[t])k++;}if(k*4>count*3){Arrays.fill(mask,true);k=count;return;}byte[] bits=new byte[(count+7)/8+4];for(int t=0;t<count;t++)if(mask[t])bits[t/8]|=1<<(7-t%8);int p=bits.length-4;bits[p]=(byte)channel(bg,0);bits[p+1]=(byte)channel(bg,1);bits[p+2]=(byte)channel(bg,2);bits[p+3]=(byte)(bg>>>24);blob=compressMap(bits);}}



static Image tomatoTransform(Image input,boolean inverse){Im in=new Im(input);if((long)in.w*in.h>MAX)throw new IllegalArgumentException("Image too large");int[]path=new Curve(in.w,in.h).a;int n=path.length,offset=(int)Math.floor((Math.sqrt(5)-1)/2*n+.5);Im out=new Im(in.w,in.h);for(int i=0;i<n;i++){int a=path[i],b=path[(i+offset)%n];if(inverse)out.a[a]=in.a[b];else out.a[b]=in.a[a];}return out.image();}



static Image extractPayload(Image received,String password)throws Exception{Im in=new Im(received);Header hd;try{hd=header(in);}catch(InvalidFormat e){throw new IllegalArgumentException("Unsupported image format");}Map<String,Object> m=hd.m;String tag=(String)m.remove("tag");byte[] key=derive(password,unhex(str(m,"s")));if(!MessageDigest.isEqual(unhex(tag),Arrays.copyOf(hmac(key,canonical(m)),16)))throw new IllegalArgumentException("Incorrect password");int ow=num(m,"ow"),oh=num(m,"oh"),w=num(m,"w"),h=num(m,"h"),n=num(m,"k")*256,need=n*((boolean)m.get("a")?2:1),sc=(w+15)/16;if(Math.abs((in.w/(double)ow)/(in.h/(double)oh)-1)>.02)throw new IllegalArgumentException("Changed aspect ratio");SourceMap11 sm=openMap11(m,key);PixelDest d=new PixelDest(m,key,sm.mask);int[] order=d.order;Im out=new Im(w,h);Arrays.fill(out.a,sm.bg);boolean[] active=new boolean[w*h];boolean direct=in.w==ow&&in.h==oh;Axis xm=direct?null:new Axis(ow,in.w),ym=direct?null:new Axis(oh,in.h);for(int i=0;i<need;i++){int tile=order[(i/256)%order.length],local=i%256,xs=tile%sc*16+local%16,ys=tile/sc*16+local/16;if(xs>=w||ys>=h)continue;int pos=d.at(i),x=pos%ow,y=pos/ow;double[] v=new double[3];if(direct)for(int c=0;c<3;c++)v[c]=channel(in.a[y*in.w+x],c);else for(int dy=0;dy<4;dy++)for(int dx=0;dx<4;dx++){int pixel=in.a[ym.index[y*4+dy]*in.w+xm.index[x*4+dx]];double wt=ym.weight[y*4+dy]*xm.weight[x*4+dx];for(int c=0;c<3;c++)v[c]+=channel(pixel,c)*wt;}int p=ys*w+xs;active[p]=true;if(i<n)out.a[p]=(out.a[p]&0xff000000)|(clamp(v[0])<<16)|(clamp(v[1])<<8)|clamp(v[2]);else out.a[p]=(out.a[p]&0xffffff)|(clamp((v[0]+v[1]+v[2])/3)<<24);}long expected=((Number)m.get("crc")).longValue();Im full=expandSource(out,m);boolean damaged=crc(rgba(full))!=expected;if(damaged){int[][] table=colorTable(hd);for(int i=0;i<out.a.length;i++){int v=out.a[i],a=(boolean)m.get("a")?clamp((table[v>>>24][0]+table[v>>>24][1]+table[v>>>24][2])/3.):255;out.a[i]=(a<<24)|(table[channel(v,0)][0]<<16)|(table[channel(v,1)][1]<<8)|table[channel(v,2)][2];}if((num(m,"b")&2)!=0)for(int i=0;i<out.a.length;i++){int v=out.a[i],r=channel(v,0),g=channel(v,1),b=channel(v,2),middle=r+g+b-Math.min(r,Math.min(g,b))-Math.max(r,Math.max(g,b));out.a[i]=(v&0xff000000)|(middle*65793);}byte[] cal=Base64.getDecoder().decode(str(m,"cal"));List<int[]> pal=new ArrayList<>();for(int i=0;i<num(m,"z");i++)pal.add(new int[]{cal[36+i*3]&255,cal[37+i*3]&255,cal[38+i*3]&255});for(int i=0;i<active.length;i++)if(!active[i])out.a[i]=sm.bg;full=expandSource(out,m);}return full.image();}



static int[] norm(int w,int h,boolean old){return norm(w,h,old,old?12:14);}



static int[] norm(int w,int h,boolean old,int revision){double s=(old?640:revision==13?832:1088)/(double)Math.min(w,h);int x=Math.max(8,(int)Math.floor(w*s/8+.5)*8),y=Math.max(8,(int)Math.floor(h*s/8+.5)*8);if((long)x*y>MAX)throw new IllegalArgumentException("Extreme aspect ratio");return new int[]{x,y};}



static int[][] pilots(int w,int h,boolean old){return pilots(w,h,old,old?12:14);}



static int[][] pilots(int w,int h,boolean old,int revision){int[][] p=new int[16][2];for(int i=0;i<16;i++){p[i][0]=Math.max(2,(int)((old?(i%2==0?.055:.945):(revision==13?(i%2==0?.03:.97):(i%2==0?.014:.986)))*w/8));p[i][1]=Math.min(h/8-3,Math.max(2,(int)((i+1)*h/17./8)));}return p;}



static double[][] means(Im in,boolean old,int revision){double[][] out=new double[16][3];int[][] p=pilots(in.w,in.h,old,revision);for(int i=0;i<16;i++)for(int y=0;y<8;y++)for(int x=0;x<8;x++)for(int c=0;c<3;c++)out[i][c]+=channel(in.a[(p[i][1]*8+y)*in.w+p[i][0]*8+x],c)/64.;return out;}



static double calMedian(List<Double>a){Collections.sort(a);int n=a.size();return n%2==1?a.get(n/2):(a.get(n/2-1)+a.get(n/2))/2;}



static Map<String,Object> nativeLayout(double[] edge,int pw,int ph,int cw,int ch,int w,int h,boolean alpha,int count){int pitch=pw+1;double[]sum=new double[(ph+1)*pitch];int[]strong=new int[sum.length];for(int y=0;y<ph;y++)for(int x=0;x<pw;x++){int p=(y+1)*pitch+x+1;double v=edge[y*pw+x];sum[p]=v+sum[p-1]+sum[p-pitch]-sum[p-pitch-1];strong[p]=(v>48?1:0)+strong[p-1]+strong[p-pitch]-strong[p-pitch-1];}int need=count*(alpha?2:1),lower=Math.max(640,(int)Math.sqrt(need*256.*Math.min(cw,ch)/Math.max(cw,ch)));for(int k=(lower+15)/16*16;k<65536;k+=16){int ow=cw>=ch?(int)Math.floor(k*(double)cw/ch+.5):k,oh=ch>cw?(int)Math.floor(k*(double)ch/cw+.5):k,nx=ow/16,ny=oh/16;if(Math.max(nx,ny)>255||(long)ow*oh>MAX)throw new IllegalArgumentException("Native contour grid exceeds capacity");byte[]mask=new byte[(nx*ny+7)/8];int n=0;for(int y=0;y<ny;y++)for(int x=(ow+511)/512;x<31*ow/512;x++){int x0=Math.max(0,(int)((long)x*16*pw/ow)-1),x1=Math.min(pw,(int)Math.ceil((x+1)*16.*pw/ow)+1),y0=Math.max(0,(int)((long)y*16*ph/oh)-1),y1=Math.min(ph,(int)Math.ceil((y+1)*16.*ph/oh)+1),area=(x1-x0)*(y1-y0),high=strong[y1*pitch+x1]-strong[y0*pitch+x1]-strong[y1*pitch+x0]+strong[y0*pitch+x0];double total=sum[y1*pitch+x1]-sum[y0*pitch+x1]-sum[y1*pitch+x0]+sum[y0*pitch+x0];if(total==0&&!Sketch.hit(x*16,y*16,(x+1)*16,(y+1)*16,ow,oh)){int i=y*nx+x;mask[i/8]|=1<<(7-i%8);n++;}}if(n>=need){Map<String,Object>m=new TreeMap<>();String[]names={"w","h","ow","oh","c","r","b","d","z"};int[]values={w,h,ow,oh,nx,ny,1,15,0};for(int i=0;i<names.length;i++)m.put(names[i],(long)values[i]);m.put("a",alpha);m.put("mask",Base64.getEncoder().encodeToString(mask));return m;}}throw new IllegalArgumentException("Contour capacity");}



static Map<String,Object> layout(Im cover,int w,int h,boolean alpha,boolean cropped,SourceMap11 src,int iw,int ih,int z){for(boolean sparse:src.blob.length>0?new boolean[]{true,false}:new boolean[]{false})for(int guide:new int[]{0,128,112,96,80,64,48,40,32,24,20,16}){int count=sparse?src.k:countTrue(paddingMask(w,h,iw,ih));byte[]sm=sparse?src.blob:new byte[0];Map<String,Object>m;try{m=baseLayout(cover,w,h,alpha,guide,count);}catch(IllegalArgumentException e){continue;}int length=62+3*z+GeometryMask.pack(Base64.getDecoder().decode(str(m,"mask")),num(m,"c"),num(m,"r"),num(m,"d")>=14).length+sm.length+(cropped?12:0);int[]shape=norm(num(m,"ow"),num(m,"oh"));Loc loc=new Loc(shape[0],shape[1]);if((int)Math.ceil((length+10)*8/36.)*63<=loc.list.size()*6&&length<=1536){m.put("iw",(long)iw);m.put("ih",(long)ih);m.put("k",(long)count);m.put("u",sparse);m.put("sm",Base64.getEncoder().encodeToString(sm));return m;}}throw new IllegalArgumentException("Parameter capacity");}



static Image encryptPayload(Image source,Image cover,String password,int iw,int ih,List<int[]> pal)throws Exception{Im original=new Im(source);if(Math.max(original.w,original.h)>65535)throw new IllegalArgumentException("Image dimension exceeds 65535");boolean monochrome=true;for(int v:original.a)if(channel(v,0)!=channel(v,1)||channel(v,1)!=channel(v,2)){monochrome=false;break;}long expected=crc(rgba(original));Map<String,Object> frame=new TreeMap<>();frame.put("t",false);Im in=original,cv=flat(new Im(cover));boolean alpha=false;for(int v:in.a)if((v>>>24)!=255){alpha=true;break;}SourceMap11 sm=new SourceMap11(in);if(Arrays.equals(sm.mask,paddingMask(in.w,in.h,iw,ih)))sm.blob=new byte[0];int sketchCount=0;for(boolean active:sm.mask)if(active)sketchCount++;cv=Sketch.prepare(cv,sketchCount*(alpha?2:1));Map<String,Object> m=layout(cv,in.w,in.h,alpha,false,sm,iw,ih,pal.size());m.putAll(frame);m.put("z",(long)pal.size());m.put("b",(monochrome?3L:1L)|(pal.size()>0&&sm.k*256L<iw*(double)ih*.65?4L:0L));byte[] salt=new byte[16];new SecureRandom().nextBytes(salt);byte[] key=derive(password,salt);if(!(boolean)m.get("u"))sm.mask=paddingMask(in.w,in.h,iw,ih);m.put("sm",Base64.getEncoder().encodeToString(mapCipher(Base64.getDecoder().decode(str(m,"sm")),key)));int n=num(m,"k")*256,need=n*(alpha?2:1),sc=(in.w+15)/16;PixelDest d=new PixelDest(m,key,sm.mask);int[] order=d.order;Im base=resize(cv,num(m,"ow"),num(m,"oh")),out=new Im(base.w,base.h);System.arraycopy(base.a,0,out.a,0,base.a.length);byte[] state=new byte[out.a.length];for(int i=0;i<need;i++){int tile=order[(i/256)%order.length],local=i%256,sx=Math.min(in.w-1,tile%sc*16+local%16),sy=Math.min(in.h-1,tile/sc*16+local/16),v=in.a[sy*in.w+sx],p=d.at(i);out.a[p]=i<n?0xff000000|(v&0xffffff):color(v>>>24,v>>>24,v>>>24);state[p]=1;}guards(out,base,state);Sketch.paint(out,base,state);m.put("p",!password.isEmpty());m.put("s",hex(salt));m.put("crc",expected);m.put("cal",Base64.getEncoder().encodeToString(preparePilots(out,pal)));m.put("tag",hex(Arrays.copyOf(hmac(key,canonical(m)),16)));writeHeader(out,m);Frame.draw(out);return out.image();}



static class SourceMap11{boolean[] mask;byte[] blob=new byte[0];int bg=0xff000000,k;SourceMap11(Im in){int nx=(in.w+15)/16,ny=(in.h+15)/16,count=nx*ny;mask=new boolean[count];Arrays.fill(mask,true);int[] values=new int[count];boolean[] same=new boolean[count];Map<Integer,Integer> counts=new HashMap<>();for(int t=0;t<count;t++){int x=t%nx*16,y=t/nx*16,v=in.a[y*in.w+x];boolean ok=true;for(int yy=y;yy<Math.min(y+16,in.h)&&ok;yy++)for(int xx=x;xx<Math.min(x+16,in.w);xx++)if(in.a[yy*in.w+xx]!=v){ok=false;break;}if(ok){same[t]=true;values[t]=v;counts.put(v,counts.getOrDefault(v,0)+1);}}int best=-1;long order=Long.MAX_VALUE;for(Map.Entry<Integer,Integer> e:counts.entrySet()){int v=e.getKey();long rank=((v&0xffffffL)<<8)|(v>>>24);if(e.getValue()>best||(e.getValue()==best&&rank<order)){bg=v;best=e.getValue();order=rank;}}k=count;if(best<0)return;k=0;for(int t=0;t<count;t++){mask[t]=!same[t]||values[t]!=bg;if(mask[t])k++;}if(k*4>count*3){Arrays.fill(mask,true);k=count;return;}byte[] bits=new byte[(count+7)/8+4];for(int t=0;t<count;t++)if(mask[t])bits[t/8]|=1<<(7-t%8);int p=bits.length-4;bits[p]=(byte)channel(bg,0);bits[p+1]=(byte)channel(bg,1);bits[p+2]=(byte)channel(bg,2);bits[p+3]=(byte)(bg>>>24);blob=compressMap(bits);}}



static SourceMap11 openMap11(Map<String,Object> m,byte[] key)throws Exception{int count=((num(m,"w")+15)/16)*((num(m,"h")+15)/16);SourceMap11 out=new SourceMap11(new Im(1,1));out.mask=new boolean[count];out.k=num(m,"k");out.bg=0xff000000;if(!(boolean)m.get("u")){out.mask=paddingMask(num(m,"w"),num(m,"h"),num(m,"iw"),num(m,"ih"));out.bg=0xffffffff;if(countTrue(out.mask)!=out.k)throw new IllegalArgumentException("Padded source count");return out;}byte[] raw=inflateMap(mapCipher(Base64.getDecoder().decode(str(m,"sm")),key),(count+7)/8+4);int n=0;for(int t=0;t<count;t++){out.mask[t]=(raw[t/8]&(1<<(7-t%8)))!=0;if(out.mask[t])n++;}if(n!=out.k)throw new IllegalArgumentException("Invalid source count");int p=raw.length-4;out.bg=((raw[p+3]&255)<<24)|((raw[p]&255)<<16)|((raw[p+1]&255)<<8)|(raw[p+2]&255);return out;}



static int power2(int n){if(n<1||n>32768)throw new IllegalArgumentException("Input dimension outside padded limit");int p=16;while(p<n)p*=2;return p;}



static int phase(int n){int unit=Math.min(1024,n);return(int)(Math.floor((Math.sqrt(5)-1)/2*n/unit+.5)*unit%n);}



static int countTrue(boolean[] a){int n=0;for(boolean v:a)if(v)n++;return n;}



static boolean[] paddingMask(int w,int h,int iw,int ih){int sc=w/16,sr=h/16;int[]path=new Curve(sc,sr).a;int off=phase(w*h)/256;boolean[] mask=new boolean[path.length];for(int i=0;i<path.length;i++){int s=path[i];mask[path[(i+off)%path.length]]=s%sc<(iw+15)/16&&s/sc<(ih+15)/16;}return mask;}



static Image tomatoTransform(Image image,boolean inverse,int iw,int ih){Im source=new Im(image);int w=source.w,h=source.h;if(!inverse){w=power2(source.w);h=power2(source.h);if((long)w*h>MAX)throw new IllegalArgumentException("Padded image exceeds 48 MP");Im pad=new Im(w,h);Arrays.fill(pad.a,0xffffffff);int ew=(source.w+15)/16*16,eh=(source.h+15)/16*16;for(int y=0;y<eh;y++)for(int x=0;x<ew;x++)pad.a[y*w+x]=source.a[Math.min(y,source.h-1)*source.w+Math.min(x,source.w-1)];source=pad;}int[]path=new Curve(w,h).a;int off=phase(path.length);Im out=new Im(w,h);for(int i=0;i<path.length;i++){int a=path[i],b=path[(i+off)%path.length];if(inverse)out.a[a]=source.a[b];else out.a[b]=source.a[a];}if(!inverse)return out.image();Im cropped=new Im(iw,ih);for(int y=0;y<ih;y++)System.arraycopy(out.a,y*w,cropped.a,y*iw,iw);return cropped.image();}



static Image encode(Image source,Image cover,String password)throws Exception{return MisanCore.encryptPayload(tomatoTransform(source,false,source.getWidth(),source.getHeight()),cover,password,source.getWidth(),source.getHeight(),sourcePalette(new Im(source)));}



static Image decode(Image image,String password)throws Exception{Image before=image;image=Frame.locate(image);boolean registered=image!=before;Header hd;try{hd=MisanCore.header(new Im(image));}catch(MisanCore.InvalidFormat e){throw new IllegalArgumentException("Unsupported image format");}Image payload=extractPayload(image,password);boolean damaged=crc(rgba(new Im(payload)))!=((Number)hd.m.get("crc")).longValue();Im result=new Im(tomatoTransform(payload,true,num(hd.m,"iw"),num(hd.m,"ih")));if(damaged){result=Sampling.restore(new Im(image),hd,password,result,registered);byte[]cal=Base64.getDecoder().decode(str(hd.m,"cal"));List<int[]>pal=new ArrayList<>();for(int i=0;i<num(hd.m,"z");i++)pal.add(new int[]{cal[36+i*3]&255,cal[37+i*3]&255,cal[38+i*3]&255});if((num(hd.m,"b")&4)!=0||num(hd.m,"z")>0&&num(hd.m,"k")*256L<num(hd.m,"iw")*(double)num(hd.m,"ih")*.65)result=repairPixels(result,pal);}return result.image();}



/** BCH(63,36,t=5) and three interleaved binary Golay(23,12) words. */

static class ECC {

 static int[] ex=new int[126],lg=new int[64],errors=new int[2048];

 static{int v=1;for(int i=0;i<63;i++){ex[i]=v;lg[v]=i;v<<=1;if((v&64)!=0)v^=0x43;}for(int i=63;i<126;i++)ex[i]=ex[i-63];for(int i=0;i<23;i++){add(1<<i);for(int j=i+1;j<23;j++){add((1<<i)|(1<<j));for(int k=j+1;k<23;k++)add((1<<i)|(1<<j)|(1<<k));}}}

 static int mul(int a,int b){return a==0||b==0?0:ex[(lg[a]+lg[b])%63];}

 static int div(int a,int b){return a==0?0:ex[(lg[a]-lg[b]+63)%63];}

 static int rem(int w){for(int i=22;i>=11;i--)if((w&(1<<i))!=0)w^=0xae3<<(i-11);return w;}

 static void add(int e){errors[rem(e)]=e;}

 static long bword(long m){long raw=m<<27,r=raw;for(int i=62;i>=27;i--)if((r&(1L<<i))!=0)r^=0x86e8113L<<(i-27);return raw|r;}

 static int eval(long w,int root){int s=0;for(int p=0;p<63;p++)if((w&(1L<<p))!=0)s^=ex[(root*p)%63];return s;}

 static long bdecode(long w){int[] s=new int[10];boolean zero=true;for(int i=0;i<10;i++){s[i]=eval(w,i+1);if(s[i]!=0)zero=false;}if(zero)return w>>>27;int[] c=new int[11],b=new int[11];c[0]=b[0]=1;int length=0,m=1,last=1;for(int n=0;n<10;n++){int d=s[n];for(int j=1;j<=length;j++)d^=mul(c[j],s[n-j]);if(d==0){m++;continue;}int[] saved=c.clone();int factor=div(d,last);for(int j=0;j<11-m;j++)c[j+m]^=mul(factor,b[j]);if(2*length<=n){length=n+1-length;b=saved;last=d;m=1;}else m++;}int count=0;for(int p=0;p<63;p++){int test=c[0];for(int j=1;j<=length;j++)test^=mul(c[j],ex[Math.floorMod(-p*j,63)]);if(test==0){w^=1L<<p;count++;}}if(count!=length||length>5)throw new IllegalArgumentException("BCH correction limit");for(int i=1;i<=10;i++)if(eval(w,i)!=0)throw new IllegalArgumentException("Invalid BCH word");return w>>>27;}

 static int[] encode(byte[] data){int count=(data.length*8+35)/36;int[] bits=new int[count*63];for(int n=0;n<count;n++){long m=0;for(int j=0;j<36;j++){int i=n*36+j;m=(m<<1)|(i<data.length*8?((data[i/8]>>(7-i%8))&1):0);}long w=bword(m);for(int j=0;j<63;j++)bits[n*63+j]=(int)((w>>>(62-j))&1);}return bits;}

 static byte[] decode(int[] bits){if(bits.length%63!=0)throw new IllegalArgumentException("BCH length");byte[] out=new byte[(bits.length/63*36)/8];int p=0;for(int n=0;n<bits.length;n+=63){long w=0;for(int i=0;i<63;i++)w=(w<<1)|bits[n+i];long m=bdecode(w);for(int i=35;i>=0;i--,p++)if(p<out.length*8)out[p/8]|=((m>>>i)&1)<<(7-p%8);}return out;}

 static int[] golay(long m){int[] words=new int[3],bits=new int[69];for(int c=0;c<3;c++){int raw=(int)((m>>>(24-12*c))&4095)<<11;words[c]=raw|rem(raw);}for(int i=0;i<23;i++)for(int c=0;c<3;c++)bits[3*i+c]=(words[c]>>>(22-i))&1;return bits;}

 static long ungolay(int[] bits){long m=0;for(int c=0;c<3;c++){int w=0;for(int i=0;i<23;i++)w=(w<<1)|bits[3*i+c];m=(m<<12)|((w^errors[rem(w)])>>>11);}return m;}

}



static class BoundaryMask{

 static byte[]encode(byte[]raw,int w,int h){ByteArrayOutputStream out=new ByteArrayOutputStream();int[]prev=new int[0],older=new int[0];for(int y=0;y<h;y++){int[]tmp=new int[w];int n=0,last=0;for(int x=0;x<w;x++){int i=y*w+x,v=(raw[i/8]>>(7-i%8))&1;if(v!=last){tmp[n++]=x;last=v;}}int[]edges=Arrays.copyOf(tmp,n);out.write(n);for(int i=0;i<n;i++){int pred=prev.length==n&&older.length==n?2*prev[i]-older[i]:prev.length==n?prev[i]:i>0?edges[i-1]+1:0,d=edges[i]-pred,v=d>=0?2*d:-2*d-1;while(v>=128){out.write((v&127)|128);v>>=7;}out.write(v);}older=prev;prev=edges;}return out.toByteArray();}

 static byte[]decode(byte[]data,int w,int h){int p=0;int[]prev=new int[0],older=new int[0];byte[]raw=new byte[(w*h+7)/8];for(int y=0;y<h;y++){if(p>=data.length)throw new IllegalArgumentException("Truncated transitions");int n=data[p++]&255;if(n>w)throw new IllegalArgumentException("Transition count");int[]edges=new int[n];for(int i=0;i<n;i++){int v=0,shift=0;boolean done=false;for(int k=0;k<3;k++){if(p>=data.length)throw new IllegalArgumentException("Truncated transition");int b=data[p++]&255;v|=(b&127)<<shift;shift+=7;if(b<128){done=true;break;}}if(!done)throw new IllegalArgumentException("Varint");int pred=prev.length==n&&older.length==n?2*prev[i]-older[i]:prev.length==n?prev[i]:i>0?edges[i-1]+1:0,x=pred+(v%2==1?-v/2-1:v/2);if(x<0||x>=w||(i>0&&x<=edges[i-1]))throw new IllegalArgumentException("Transition position");edges[i]=x;}for(int i=0;i<n;i+=2)for(int x=edges[i];x<(i+1<n?edges[i+1]:w);x++){int at=y*w+x;raw[at/8]|=1<<(7-at%8);}older=prev;prev=edges;}if(p!=data.length||!Arrays.equals(encode(raw,w,h),data))throw new IllegalArgumentException("Noncanonical transitions");return raw;}

 static byte[]unpack(byte[]data,int w,int h){try{Inflater inf=new Inflater();inf.setInput(data);ByteArrayOutputStream out=new ByteArrayOutputStream();byte[]buf=new byte[1024];while(!inf.finished()){int n=inf.inflate(buf);if(n==0)throw new IllegalArgumentException("Truncated deflate");out.write(buf,0,n);if(out.size()>h*(1+3*w))throw new IllegalArgumentException("Transition bound");}if(inf.getRemaining()!=0)throw new IllegalArgumentException("Trailing deflate");inf.end();return decode(out.toByteArray(),w,h);}catch(DataFormatException e){throw new IllegalArgumentException("Invalid transitions",e);}}

}



/** Causal geometry mask coding; image colors are not transformed by this codec. */

static class GeometryMask {

 static final long HALF=1L<<31,Q=1L<<30,FULL=1L<<32;

 static final int[][] CTX={{-1,0},{-2,0},{-2,-1},{-1,-1},{0,-1},{1,-1},{2,-1},{-1,-2},{0,-2}};

 static void dimensions(int w,int h){if(w<1||h<1||w>255||h>255)throw new IllegalArgumentException("Invalid mask dimensions");}

 static final class Bits {ByteArrayOutputStream out=new ByteArrayOutputStream();int value,used,pending;void put(int bit){value|=bit<<(7-used);if(++used==8){out.write(value);value=used=0;}}void emit(int bit){put(bit);while(pending>0){put(1-bit);pending--;}}byte[] finish(){if(used>0)out.write(value);return out.toByteArray();}}

 static byte[] encode(byte[] raw,int w,int h){dimensions(w,h);int stride=w+4;byte[] p=new byte[(h+2)*stride];for(int y=0;y<h;y++)for(int x=0;x<w;x++){int i=y*w+x;p[(y+2)*stride+x+2]=(byte)((raw[i/8]>>(7-i%8))&1);}int[] c0=new int[512],c1=new int[512];Arrays.fill(c0,1);Arrays.fill(c1,1);long lo=0,hi=FULL-1;Bits bits=new Bits();for(int y=0;y<h;y++)for(int x=0;x<w;x++){int at=(y+2)*stride+x+2,index=0;for(int[]d:CTX)index=index*2+p[at+d[1]*stride+d[0]];int v=p[at];long cut=lo+(hi-lo+1)*c0[index]/(c0[index]+c1[index]);if(v==1)lo=cut;else hi=cut-1;for(;;){if(hi<HALF)bits.emit(0);else if(lo>=HALF){bits.emit(1);lo-=HALF;hi-=HALF;}else if(lo>=Q&&hi<3*Q){bits.pending++;lo-=Q;hi-=Q;}else break;lo*=2;hi=hi*2+1;}if(v==1)c1[index]++;else c0[index]++;if(c0[index]+c1[index]>=16384){c0[index]=(c0[index]+1)/2;c1[index]=(c1[index]+1)/2;}}bits.pending++;bits.emit(lo<Q?0:1);for(int i=0;i<32;i++)bits.put(0);return bits.finish();}

 static final class Reader {byte[] b;int pos;Reader(byte[]b){this.b=b;}int get(){if(pos>=b.length*8)throw new IllegalArgumentException("Truncated arithmetic mask");int v=(b[pos/8]>>(7-pos%8))&1;pos++;return v;}}

 static byte[] decode(byte[] data,int w,int h){dimensions(w,h);int stride=w+4;byte[]p=new byte[(h+2)*stride];int[]c0=new int[512],c1=new int[512];Arrays.fill(c0,1);Arrays.fill(c1,1);long lo=0,hi=FULL-1,code=0;Reader bits=new Reader(data);for(int i=0;i<32;i++)code=code*2+bits.get();for(int y=0;y<h;y++)for(int x=0;x<w;x++){int at=(y+2)*stride+x+2,index=0;for(int[]d:CTX)index=index*2+p[at+d[1]*stride+d[0]];long cut=lo+(hi-lo+1)*c0[index]/(c0[index]+c1[index]);int v=code>=cut?1:0;p[at]=(byte)v;if(v==1)lo=cut;else hi=cut-1;for(;;){if(hi<HALF){}else if(lo>=HALF){code-=HALF;lo-=HALF;hi-=HALF;}else if(lo>=Q&&hi<3*Q){code-=Q;lo-=Q;hi-=Q;}else break;lo*=2;hi=hi*2+1;code=code*2+bits.get();}if(v==1)c1[index]++;else c0[index]++;if(c0[index]+c1[index]>=16384){c0[index]=(c0[index]+1)/2;c1[index]=(c1[index]+1)/2;}}byte[]raw=new byte[(w*h+7)/8];for(int y=0;y<h;y++)for(int x=0;x<w;x++){int i=y*w+x;raw[i/8]|=p[(y+2)*stride+x+2]<<(7-i%8);}if(!Arrays.equals(encode(raw,w,h),data))throw new IllegalArgumentException("Noncanonical arithmetic mask");return raw;}

 static byte[] pack(byte[]raw,int w,int h){return pack(raw,w,h,false);}

 static byte[] pack(byte[]raw,int w,int h,boolean enhanced){byte[]a=encode(raw,w,h),b=MisanCore.compressMap(raw),body=a.length<b.length?a:b,out=new byte[body.length+1];out[0]=(byte)(a.length<b.length?1:0);System.arraycopy(body,0,out,1,body.length);if(enhanced){byte[]c=MisanCore.compressMap(BoundaryMask.encode(raw,w,h));if(c.length+1<out.length){out=new byte[c.length+1];out[0]=2;System.arraycopy(c,0,out,1,c.length);}}return out;}

 static byte[] unpack(byte[]data,int w,int h){dimensions(w,h);if(data.length==0)throw new IllegalArgumentException("Empty mask");byte[]body=Arrays.copyOfRange(data,1,data.length);if(data[0]==0)return MisanCore.inflateMap(body,(w*h+7)/8);if(data[0]==1)return decode(body,w,h);if(data[0]==2)return BoundaryMask.unpack(body,w,h);throw new IllegalArgumentException("Invalid mask mode");}

}



/** Packs already-scrambled payload rectangles; does not transform their pixels. */

static class RectanglePacking {

 final int nx,ny,sc,sr;final boolean[] free;final int[] ii,si;final MisanCore.Stream rng;

 final Map<String,Candidates> cache=new HashMap<>();final List<Integer> source=new ArrayList<>(),dest=new ArrayList<>();

 static final class Candidates{int[] a;int start,stride=997,cursor;Candidates(int[] a,int start){this.a=a;this.start=start;while(a.length>0&&MisanCore.gcd(stride,a.length)!=1)stride+=2;}}

 static final class Result{int[] order,tiles;Result(List<Integer>s,List<Integer>d){order=s.stream().mapToInt(Integer::intValue).toArray();tiles=d.stream().mapToInt(Integer::intValue).toArray();}}

 RectanglePacking(Map<String,Object> m,byte[] key,boolean[] mask)throws Exception{

  int ow=MisanCore.num(m,"ow"),oh=MisanCore.num(m,"oh"),c=MisanCore.num(m,"c"),r=MisanCore.num(m,"r");nx=ow/16;ny=oh/16;sc=(MisanCore.num(m,"w")+15)/16;sr=(MisanCore.num(m,"h")+15)/16;free=new boolean[nx*ny];ii=new int[(nx+1)*(ny+1)];si=new int[(sc+1)*(sr+1)];byte[] cm=Base64.getDecoder().decode(MisanCore.str(m,"mask"));rng=new MisanCore.Stream(key,MisanCore.ascii("payload-rectangles\0"));

  for(int y=0;y<ny;y++)for(int x=0;x<nx;x++){int mx=Math.min(c-1,((x+1)*c-1)/nx),my=Math.min(r-1,((y+1)*r-1)/ny),p=my*c+mx;boolean v=x>=(MisanCore.num(m,"d")>=14?(ow+511)/512:MisanCore.num(m,"d")>=13?(ow+255)/256:((ow+63)/64+1)/2)&&x<(MisanCore.num(m,"d")>=14?31*ow/512:MisanCore.num(m,"d")>=13?15*ow/256:(7*ow/64)/2)&&(cm[p/8]&(1<<(7-p%8)))!=0;free[y*nx+x]=v;ii[(y+1)*(nx+1)+x+1]=(v?1:0)+ii[y*(nx+1)+x+1]+ii[(y+1)*(nx+1)+x]-ii[y*(nx+1)+x];}

  for(int y=0;y<sr;y++)for(int x=0;x<sc;x++)si[(y+1)*(sc+1)+x+1]=(mask[y*sc+x]?1:0)+si[y*(sc+1)+x+1]+si[(y+1)*(sc+1)+x]-si[y*(sc+1)+x];

 }

 int locate(int w,int h)throws Exception{

  String shape=w+","+h;Candidates s=cache.get(shape);if(s==null){int[] temp=new int[nx*ny];int n=0;for(int y=0;y<=ny-h;y++)for(int x=0;x<=nx-w;x++){int sum=ii[(y+h)*(nx+1)+x+w]-ii[y*(nx+1)+x+w]-ii[(y+h)*(nx+1)+x]+ii[y*(nx+1)+x];if(sum==w*h)temp[n++]=y*nx+x;}s=new Candidates(Arrays.copyOf(temp,n),n>0?rng.below(n):0);cache.put(shape,s);}

  while(s.cursor<s.a.length){int tile=s.a[(int)((s.start+(long)s.cursor*s.stride)%s.a.length)];s.cursor++;int x=tile%nx,y=tile/nx;boolean ok=true;for(int v=0;v<h&&ok;v++)for(int u=0;u<w;u++)if(!free[(y+v)*nx+x+u]){ok=false;break;}if(ok)return tile;}return-1;

 }

 void place(int x,int y,int w,int h)throws Exception{

  int count=si[(y+h)*(sc+1)+x+w]-si[y*(sc+1)+x+w]-si[(y+h)*(sc+1)+x]+si[y*(sc+1)+x];if(count==0)return;int t=count==w*h?locate(w,h):-1;if(t>=0){int dx=t%nx,dy=t/nx;for(int v=0;v<h;v++)for(int u=0;u<w;u++){int p=(dy+v)*nx+dx+u;free[p]=false;source.add((y+v)*sc+x+u);dest.add(p);}return;}if(w==1&&h==1)throw new IllegalArgumentException("Contour packing capacity exhausted");if(w>=h&&w>1){int cut=w/2;place(x,y,cut,h);place(x+cut,y,w-cut,h);}else{int cut=h/2;place(x,y,w,cut);place(x,y+cut,w,h-cut);}

 }

 static Result plan(Map<String,Object>m,byte[]key,boolean[]mask)throws Exception{

  RectanglePacking p=new RectanglePacking(m,key,mask);int maximum=MisanCore.num(m,"d")>=15?1:MisanCore.num(m,"d")>=14?64:8;List<int[]>regions=new ArrayList<>();for(int y=0;y<p.sr;y+=maximum)for(int x=0;x<p.sc;x+=maximum)regions.add(new int[]{x,y,Math.min(maximum,p.sc-x),Math.min(maximum,p.sr-y)});for(int i=regions.size()-1;i>0;i--)Collections.swap(regions,i,p.rng.below(i+1));for(int[]a:regions)p.place(a[0],a[1],a[2],a[3]);if(p.source.size()!=MisanCore.num(m,"k"))throw new IllegalArgumentException("Incomplete payload mapping");if((boolean)m.get("a")){int[]all=new MisanCore.Curve(p.nx,p.ny).a,remaining=new int[all.length];int n=0;for(int t:all)if(p.free[t])remaining[n++]=t;if(n<p.source.size())throw new IllegalArgumentException("Insufficient alpha capacity");int start=p.rng.below(n-p.source.size()+1);for(int i=0;i<p.source.size();i++)p.dest.add(remaining[start+i]);}return new Result(p.source,p.dest);

 }

}



static class CurveTransport9 {

static double q8(double v){return Math.floor(v*256+.5)/256;}

static int clip(int v,int n){return Math.max(0,Math.min(n-1,v));}

static int[] plan(int w,int h,byte[] key,boolean[] mask,MisanCore.PixelDest dest)throws Exception{

  int nx=(w+15)/16,n=0;for(boolean v:mask)if(v)n++;int[] path=new int[n];int p=0;for(int t:new MisanCore.Curve(nx,(h+15)/16).a)if(mask[t])path[p++]=t;if(n==0)return path;

  int phase=(int)Math.floor((Math.sqrt(5)-1)/2*n+.5);int[] s=new int[n];for(int i=0;i<n;i++)s[i]=path[(i+n-phase)%n];

  List<Integer> cuts=new ArrayList<>();cuts.add(0);for(int i=1;i<n;i++){int a=s[i-1],b=s[i],c=dest.tiles[i-1],d=dest.tiles[i];if(i-cuts.get(cuts.size()-1)>=16||Math.abs(a%nx-b%nx)+Math.abs(a/nx-b/nx)!=1||Math.abs(c%dest.nx-d%dest.nx)+Math.abs(c/dest.nx-d/dest.nx)!=1)cuts.add(i);}cuts.add(n);

  TreeMap<Integer,List<Integer>> groups=new TreeMap<>();int[] assigned=new int[cuts.size()-1];for(int i=0;i<assigned.length;i++){assigned[i]=i;groups.computeIfAbsent(cuts.get(i+1)-cuts.get(i),v->new ArrayList<>()).add(i);}

  MisanCore.Stream rng=new MisanCore.Stream(key,MisanCore.ascii("curve-fragments\0"));for(List<Integer> ids:groups.values()){List<Integer> other=new ArrayList<>(ids);for(int i=other.size()-1;i>0;i--){int j=rng.below(i+1);Collections.swap(other,i,j);}for(int i=0;i<ids.size();i++)assigned[ids.get(i)]=other.get(i);}

  int[] out=new int[n];p=0;for(int id:assigned)for(int j=cuts.get(id);j<cuts.get(id+1);j++)out[p++]=s[j];return out;

 }

static final class Plane {int w,h,ch;double[] a;Plane(int w,int h,int ch){this.w=w;this.h=h;this.ch=ch;a=new double[w*h*ch];}}

static Plane triangle(Plane c){return triangle(c,null);}

static Plane triangle(Plane c,boolean[] valid){

  int w=c.w,h=c.h,ww=w/2,hh=h/2;if(ww==0||hh==0)return null;Plane out=new Plane(ww,hh,2);double[] a=out.a;

  for(int y=0;y<hh;y++)for(int x=0;x<ww;x++)for(int k=0;k<2;k++)a[(y*ww+x)*2+k]=(c.a[(2*y*w+2*x)*2+k]+c.a[(2*y*w+2*x+1)*2+k]+c.a[((2*y+1)*w+2*x)*2+k]+c.a[((2*y+1)*w+2*x+1)*2+k])/4;

  for(int axis=0;axis<2;axis++){int n=axis==0?ww:hh,lanes=axis==0?hh:ww;if(n<2)continue;double[] cp=new double[n],v=new double[n];for(int i=0;i<n;i++){double den=(i==0||i==n-1?.875:.75)-(i>0?.125*cp[i-1]:0);cp[i]=.125/den;}for(int lane=0;lane<lanes;lane++)for(int k=0;k<2;k++){for(int i=0;i<n;i++){int p=((axis==0?lane*ww+i:i*ww+lane)*2+k);double den=(i==0||i==n-1?.875:.75)-(i>0?.125*cp[i-1]:0);v[i]=(a[p]-(i>0?.125*v[i-1]:0))/den;}for(int i=n-2;i>=0;i--)v[i]-=cp[i]*v[i+1];for(int i=0;i<n;i++)a[(axis==0?lane*ww+i:i*ww+lane)*2+k]=v[i];}}

  if(valid!=null){int n=0;for(boolean v:valid)if(v)n++;if(n<256)valid=null;}int count=0;double err=0,variation=0;for(int y=0;y<hh*2;y++)for(int x=0;x<ww*2;x++){if(valid!=null&&!valid[y*w+x])continue;count+=2;int yi=y/2,xi=x/2,yn=clip(yi+(y%2==0?-1:1),hh),xn=clip(xi+(x%2==0?-1:1),ww);for(int k=0;k<2;k++){double pred=(a[(yi*ww+xi)*2+k]*.75+a[(yi*ww+xn)*2+k]*.25)*.75+(a[(yn*ww+xi)*2+k]*.75+a[(yn*ww+xn)*2+k]*.25)*.25,obs=c.a[(y*w+x)*2+k],d=pred-obs,e=a[(yi*ww+xi)*2+k]-obs;err+=d*d;variation+=e*e;}}err/=count;variation/=count;if(err>4||!(err/Math.max(variation,1e-9)<.18||variation<1))return null;for(int i=0;i<a.length;i++)a[i]=q8(a[i]);return out;

 }

}



/** Original-coordinate physical sampling, with aligned Gilbert fragments. */

static class Sampling extends MisanCore {

 static final class Field {int w,h,ch;double offsetX,offsetY;double[] a;Field(int w,int h,int ch){this.w=w;this.h=h;this.ch=ch;a=new double[w*h*ch];}Field(int w,int h,int ch,double[] a){this.w=w;this.h=h;this.ch=ch;this.a=a;}}

 static int at(int v,int n){return Math.max(0,Math.min(n-1,v));}

 static double bound(double v,int n){return Math.max(0,Math.min(n-1,v));}

 static double[] spline(double f){return new double[]{Math.pow(1-f,3)/6,(3*f*f*f-6*f*f+4)/6,(-3*f*f*f+3*f*f+3*f+1)/6,f*f*f/6};}

 static int[] inverseMap(Map<String,Object>m){int[]path=new Curve(num(m,"w"),num(m,"h")).a,inv=new int[path.length];int off=phase(path.length);for(int i=0;i<path.length;i++)inv[path[(i+off)%path.length]]=path[i];return inv;}

 static double[] lap(double[] a,int w,int h,int ch){double[] out=new double[a.length];for(int y=0;y<h;y++)for(int x=0;x<w;x++)for(int k=0;k<ch;k++){int p=(y*w+x)*ch+k;double v=a[p];if(x>0)out[p]+=v-a[p-ch];if(x+1<w)out[p]+=v-a[p+ch];if(y>0)out[p]+=v-a[p-w*ch];if(y+1<h)out[p]+=v-a[p+w*ch];}return out;}

 static final class Fit {

  int N,S,K,w,h,ch;int[] index;double[] basis,coverage,diag,anchor,D,weights,regMap;double regular,seamFactor,seamBoost;boolean cubic;

  Fit(double[]px,double[]py,double[]weights,int used,int w,int h,int ch,double regular,boolean cubic){this.weights=weights;this.N=w*h;this.S=used;this.K=cubic?16:4;this.w=w;this.h=h;this.ch=ch;this.regular=regular;this.cubic=cubic;index=new int[S*K];basis=new double[S*K];coverage=new double[N];diag=new double[N];

   for(int j=0;j<S;j++){double x=bound(px[j],w),y=bound(py[j],h);int x0=(int)x,y0=(int)y;double fx=x-x0,fy=y-y0;if(cubic){double[]a=spline(fx),b=spline(fy);for(int dy=0;dy<4;dy++)for(int dx=0;dx<4;dx++){int k=dy*4+dx;index[j*K+k]=at(y0+dy-1,h)*w+at(x0+dx-1,w);basis[j*K+k]=b[dy]*a[dx];}}else{int[]ids={y0*w+x0,y0*w+Math.min(w-1,x0+1),Math.min(h-1,y0+1)*w+x0,Math.min(h-1,y0+1)*w+Math.min(w-1,x0+1)};double[]wt={(1-fx)*(1-fy),fx*(1-fy),(1-fx)*fy,fx*fy};for(int k=0;k<4;k++){index[j*K+k]=ids[k];basis[j*K+k]=wt[k];}}for(int k=0;k<K;k++){int p=index[j*K+k];double v=basis[j*K+k];coverage[p]+=v*weights[j];diag[p]+=v*v*weights[j];}}

  }

  double[]adj(double[]a){double[]out=new double[N*ch];for(int j=0;j<S;j++)for(int k=0;k<K;k++){int p=index[j*K+k]*ch;double wt=basis[j*K+k]*weights[j];for(int c=0;c<ch;c++)out[p+c]+=a[j*ch+c]*wt;}return out;}

  double[]op(double[]a){double[]pred=new double[S*ch];for(int j=0;j<S;j++)for(int k=0;k<K;k++){int p=index[j*K+k]*ch;double wt=basis[j*K+k];for(int c=0;c<ch;c++)pred[j*ch+c]+=a[p+c]*wt;}double[]out=adj(pred),l=lap(a,w,h,ch);if(cubic){if(regMap!=null)for(int i=0;i<l.length;i++)l[i]*=regMap[i/ch];l=lap(l,w,h,ch);}for(int p=0;p<N;p++)for(int c=0;c<ch;c++){int i=p*ch+c;out[i]+=(regMap==null?regular*l[i]:l[i])+anchor[p]*a[i];}return out;}

  Field solve(double[]values,double[]bg,boolean[]known){double[]rhsData=adj(values),initial=rhsData.clone(),count=coverage.clone();for(int p=0;p<N;p++)if(known[p]){count[p]=1;for(int c=0;c<ch;c++)initial[p*ch+c]=bg[c];}

   for(int it=0;it<48;it++){double[]next=initial.clone(),nc=count.clone();boolean missing=false,hit=false;for(int p=0;p<N;p++)if(count[p]<1e-7){missing=true;int x=p%w,y=p/w;int[]near={y>0?p-w:p,y+1<h?p+w:p,x>0?p-1:p,x+1<w?p+1:p};double sum=0;for(int q:near)sum+=count[q];if(sum>1e-7){hit=true;nc[p]=sum*.25;for(int c=0;c<ch;c++){double v=0;for(int q:near)v+=initial[q*ch+c];next[p*ch+c]=v*.25;}}}if(!missing||!hit)break;initial=next;count=nc;}

   anchor=new double[N];D=new double[N];double[]x=new double[N*ch],rhs=rhsData.clone();for(int p=0;p<N;p++){anchor[p]=(known[p]?2:0)+.0001;D[p]=diag[p]+(cubic?20:4)*regular+anchor[p];for(int c=0;c<ch;c++){double v=known[p]||count[p]<1e-7?bg[c]:initial[p*ch+c]/count[p];x[p*ch+c]=v;rhs[p*ch+c]+=anchor[p]*v;}}

   if(seamFactor>0&&cubic&&ch==1){regMap=new double[N];for(int yy=0;yy<h;yy++)for(int xx=0;xx<w;xx++){int p=yy*w+xx;double gx=(x[yy*w+Math.min(w-1,xx+1)]-x[yy*w+Math.max(0,xx-1)])/(xx==0||xx==w-1?1:2),gy=(x[Math.min(h-1,yy+1)*w+xx]-x[Math.max(0,yy-1)*w+xx])/(yy==0||yy==h-1?1:2),sx=(xx+.5)/seamFactor%16,sy=(yy+.5)/seamFactor%16,dist=Math.min(Math.min(sx,16-sx),Math.min(sy,16-sy)),band=Math.max(0,Math.min(1,1-dist/5)),g=Math.sqrt(gx*gx+gy*gy);regMap[p]=regular+band*(.2*Math.pow(Math.max(0,Math.min(1,(seamFactor-.6)/.15)),2)/(1+Math.pow(g/6,4))+seamBoost/(1+Math.pow(g/8,4)));D[p]=diag[p]+20*regMap[p]+anchor[p];}}

   double[]ax=op(x),r=new double[x.length],z=new double[x.length],p=new double[x.length],rr=new double[ch];for(int i=0;i<x.length;i++){r[i]=rhs[i]-ax[i];z[i]=r[i]/D[i/ch];p[i]=z[i];rr[i%ch]+=r[i]*z[i];}

   for(int it=0;it<12;it++){double[]ap=op(p),den=new double[ch],alpha=new double[ch],next=new double[ch];for(int i=0;i<x.length;i++)den[i%ch]+=p[i]*ap[i];for(int c=0;c<ch;c++)alpha[c]=rr[c]/Math.max(1e-20,den[c]);for(int i=0;i<x.length;i++){int c=i%ch;x[i]+=p[i]*alpha[c];r[i]-=ap[i]*alpha[c];z[i]=r[i]/D[i/ch];next[c]+=r[i]*z[i];}for(int i=0;i<x.length;i++)p[i]=z[i]+p[i]*next[i%ch]/Math.max(rr[i%ch],1e-20);rr=next;}

   return new Field(w,h,ch,x);

  }

 }

 static double[]enlarge(Field f,double factor,int w,int h,boolean cubic){double[]out=new double[w*h*f.ch];for(int y=0;y<h;y++)for(int x=0;x<w;x++){double xx=bound((x+.5)*factor-.5,f.w),yy=bound((y+.5)*factor-.5,f.h);int x0=(int)xx,y0=(int)yy;double fx=xx-x0,fy=yy-y0;double[]wx=cubic?spline(fx):new double[]{1-fx,fx},wy=cubic?spline(fy):new double[]{1-fy,fy};int offset=cubic?-1:0;for(int dy=0;dy<wy.length;dy++)for(int dx=0;dx<wx.length;dx++){int p=(at(y0+dy+offset,f.h)*f.w+at(x0+dx+offset,f.w))*f.ch;double wt=wx[dx]*wy[dy];for(int c=0;c<f.ch;c++)out[(y*w+x)*f.ch+c]+=f.a[p+c]*wt;}}return out;}

 static double blockScore(Im in){double ss=0,sb=0;int ns=0,nb=0;for(int x=8;x<in.w;x+=8)for(int y=0;y<in.h;y++){int i=y*in.w+x;double d=Math.min(10,Math.abs(luma(in.a[i])-luma(in.a[i-1])));if(x%32==0){ss+=d;ns++;}else{sb+=d;nb++;}}for(int y=8;y<in.h;y+=8)for(int x=0;x<in.w;x++){int i=y*in.w+x;double d=Math.min(10,Math.abs(luma(in.a[i])-luma(in.a[i-in.w])));if(y%32==0){ss+=d;ns++;}else{sb+=d;nb++;}}return Math.min(ns,nb)>=64&&sb/nb>.1?(ss/ns)/(sb/nb):1;}

 static double luma(int v){return(channel(v,0)*19595.+channel(v,1)*38470.+channel(v,2)*7471.)/65536;}


 // Fit the seam phase independently in both halves of each axis.
 static double[] resizePhase(Field luma,int ow,int oh){
  int w=luma.w,h=luma.h;
  double[] offsets=new double[2];
  for(int axis=0;axis<2;axis++){
   int n=axis==0?w:h,cross=axis==0?h:w;
   double period=16.*n/(axis==0?ow:oh);
   if(period<5||n<12*period)continue;
   int first=(int)Math.floor(2*period)+1,last=(int)Math.ceil(n-2*period);
   double omega=2*Math.PI/period;
   double[] estimates=new double[2];
   int half=0;
   for(;half<2;half++){
    int start=half==0?0:cross/2,end=half==0?cross/2:cross;
    double real=0,imag=0,total=0,cosSum=0,sinSum=0;
    for(int i=first;i<last;i++){
     double energy=0;
     int stride=axis==0?w:1,adjacent=axis==0?1:w,base=i*adjacent;
     for(int j=start;j<end;j++){
      int p=base+j*stride;
      energy+=Math.min(72,Math.abs(luma.a[p]-luma.a[p-adjacent]));
     }
     double cosine=Math.cos(i*omega),sine=Math.sin(i*omega);
     total+=energy; real+=energy*cosine; imag+=energy*sine;
     cosSum+=cosine; sinSum+=sine;
    }
    real-=total*cosSum/(last-first); imag-=total*sinSum/(last-first);
    if(Math.hypot(real,imag)<.07*total)break;
    estimates[half]=-Math.atan2(imag,real)/omega;
   }
   if(half==2&&Math.abs(estimates[0]-estimates[1])<=.20){
    double offset=(estimates[0]+estimates[1])/2;
    if(Math.abs(offset)>=.20&&Math.abs(offset)<=.80)offsets[axis]=offset;
   }
  }
  return offsets;
 }

 static double[] boxMean(double[] data,int w,int h,int ch,int radius){
  double[] input=data;
  int diameter=2*radius+1;
  for(int axis=0;axis<2;axis++){
   int n=axis==0?w:h,lines=axis==0?h:w,stride=(axis==0?1:w)*ch;
   double[] output=new double[data.length];
   for(int line=0;line<lines;line++)for(int c=0;c<ch;c++){
    int start=line*(axis==0?w:1)*ch+c;
    double sum=0;
    for(int k=-radius;k<=radius;k++)sum+=input[start+at(k,n)*stride];
    for(int i=0;i<n;i++){
     output[start+i*stride]=sum/diameter;
     sum+=input[start+at(i+radius+1,n)*stride]-input[start+at(i-radius,n)*stride];
    }
   }
   input=output;
  }
  return input;
 }

 static void smoothLattice(Field field,int radius,double threshold,double strength){
  int w=field.w,h=field.h,ch=field.ch;
  double[] data=field.a,squared=new double[data.length];
  for(int i=0;i<data.length;i++)squared[i]=data[i]*data[i];
  double[] mean=boxMean(data,w,h,ch,radius),variance=boxMean(squared,w,h,ch,radius);
  for(int i=0;i<data.length;i++){
   double v=Math.max(0,variance[i]-mean[i]*mean[i]),gain=v/(v+threshold*threshold);
   variance[i]=gain;
   mean[i]*=1-gain;
  }
  double[] gain=boxMean(variance,w,h,ch,radius),bias=boxMean(mean,w,h,ch,radius);
  for(int i=0;i<data.length;i++)data[i]+=strength*(gain[i]*data[i]+bias[i]-data[i]);
 }

 static double[]scatter(Field f,int step,Map<String,Object>m,SourceMap11 map,PixelDest dest,int[]inv,int rw,int rh,double[]bg,double margin,double regular,boolean cubic,boolean full,double nativeMargin,double severity,double phaseStrength){int iw=num(m,"iw"),ih=num(m,"ih"),w=num(m,"w"),h=num(m,"h"),ow=num(m,"ow"),oh=num(m,"oh"),nx=ow/16,ny=oh/16;double factor=full?1:Math.min(rw/(double)ow,rh/(double)oh)/step;int ww=Math.max(1,(int)Math.ceil(iw*factor)),hh=Math.max(1,(int)Math.ceil(ih*factor)),n=dest.order.length;int[]which=new int[nx*ny],labels=new int[nx*ny],ox=new int[n],oy=new int[n],ex=new int[n],ey=new int[n],vx=new int[n],vy=new int[n];Arrays.fill(which,-1);Arrays.fill(labels,-1);Map<String,Integer>unique=new HashMap<>();

  for(int j=0;j<n;j++){int s=dest.order[j],sx=s%(w/16)*16,sy=s/(w/16)*16,p=inv[sy*w+sx],right=inv[sy*w+sx+1],down=inv[(sy+1)*w+sx],d=dest.tiles[j],x=d%nx*16,y=d/nx*16;ox[j]=p%w;oy[j]=p/w;ex[j]=right%w-ox[j];ey[j]=right/w-oy[j];vx[j]=down%w-ox[j];vy[j]=down/w-oy[j];if(Math.abs(ex[j])+Math.abs(ey[j])!=1||Math.abs(vx[j])+Math.abs(vy[j])!=1||ex[j]*vx[j]+ey[j]*vy[j]!=0)throw new IllegalArgumentException("Unaligned fragment");String key=ex[j]+","+ey[j]+","+vx[j]+","+vy[j]+","+(ox[j]-ex[j]*x-vx[j]*y)+","+(oy[j]-ey[j]*x-vy[j]*y);if(!unique.containsKey(key))unique.put(key,unique.size());which[d]=j;labels[d]=unique.get(key);}

  int max=f.w*f.h,used=0;double[]px=new double[max],py=new double[max],values=new double[max*f.ch],weights=new double[max];double radius=rw==ow&&rh==oh?(step-1)/2.+nativeMargin:margin*step/Math.min(rw/(double)ow,rh/(double)oh);

  for(int yy=0;yy<f.h;yy++)for(int xx=0;xx<f.w;xx++){double x=(xx*step+step/2.+f.offsetX)*ow/rw-.5,y=(yy*step+step/2.+f.offsetY)*oh/rh-.5;int cx=(int)Math.floor((x+.5)/16),cy=(int)Math.floor((y+.5)/16);if(cx<0||cy<0||cx>=nx||cy>=ny)continue;int tile=cy*nx+cx,j=which[tile];if(j<0)continue;int lx=(int)Math.floor((x-radius+.5)/16),hx=(int)Math.floor((x+radius+.5)/16),ly=(int)Math.floor((y-radius+.5)/16),hy=(int)Math.floor((y+radius+.5)/16);boolean ok=true;for(int b=ly;b<=hy&&ok;b++)for(int a=lx;a<=hx;a++)if(a<0||b<0||a>=nx||b>=ny||labels[b*nx+a]!=labels[tile]){ok=false;break;}if(!ok)continue;double u=x-cx*16,v=y-cy*16,sx=ox[j]+ex[j]*u+vx[j]*v,sy=oy[j]+ey[j]*u+vy[j]*v;if(sx<-.5||sy<-.5||sx>=iw-.5||sy>=ih-.5)continue;double confidence=1;if(cubic&&(rw!=ow||rh!=oh)){double distance=Double.POSITIVE_INFINITY;for(int dy=-1;dy<=1;dy++)for(int dx=-1;dx<=1;dx++){int a=cx+dx,b=cy+dy;if(a<0||b<0||a>=nx||b>=ny||labels[b*nx+a]!=labels[tile]){double ddx=Math.max(Math.max(a*16-.5-x,0),x-(a*16+15.5)),ddy=Math.max(Math.max(b*16-.5-y,0),y-(b*16+15.5));distance=Math.min(distance,Math.sqrt(ddx*ddx+ddy*ddy));}}double softRadius=(2.5+(step-1)*.5)/Math.min(rw/(double)ow,rh/(double)oh);confidence=Math.max(.1,Math.min(1,Math.pow(distance/softRadius,2)));}weights[used]=confidence;px[used]=(sx+.5)*factor-.5;py[used]=(sy+.5)*factor-.5;for(int c=0;c<f.ch;c++)values[used*f.ch+c]=f.a[(yy*f.w+xx)*f.ch+c];used++;}

  boolean[]active=new boolean[w*h],known=new boolean[ww*hh];for(int s=0;s<inv.length;s++)active[inv[s]]=map.mask[(s/w/16)*(w/16)+s%w/16];for(int y=0;y<hh;y++)for(int x=0;x<ww;x++){int sx=at((int)Math.floor((x+.5)/factor),iw),sy=at((int)Math.floor((y+.5)/factor),ih);known[y*ww+x]=!active[sy*w+sx];}Fit fit=new Fit(px,py,weights,used,ww,hh,f.ch,regular,cubic);if(num(m,"d")>=14&&(rw!=ow||rh!=oh)&&cubic&&f.ch==1)fit.seamFactor=factor;fit.seamBoost=severity*(.06+.07*phaseStrength);
  Field field=fit.solve(values,bg,known);
  if(severity>0)smoothLattice(field,Math.max(1,(int)((f.ch==1?10:14)*factor+.5)),(f.ch==1?6:13)+2*phaseStrength,severity);
  return enlarge(field,factor,iw,ih,cubic);

 }

 static Field shiftedTriangle(Field uv,boolean[] valid){Field best=null;double error=Double.POSITIVE_INFINITY;for(int[]p:new int[][]{{1,0},{0,1},{1,1}}){int px=p[0],py=p[1],w=uv.w+px,h=uv.h+py;CurveTransport9.Plane pad=new CurveTransport9.Plane(w,h,2);for(int y=0;y<h;y++)for(int x=0;x<w;x++)for(int k=0;k<2;k++)pad.a[(y*w+x)*2+k]=uv.a[(Math.max(0,y-py)*uv.w+Math.max(0,x-px))*2+k];boolean[]take=null;if(valid!=null){take=new boolean[w*h];for(int y=0;y<uv.h;y++)System.arraycopy(valid,y*uv.w,take,(y+py)*w+px,uv.w);}CurveTransport9.Plane f=CurveTransport9.triangle(pad,take);if(f==null)continue;double sum=0;int n=0;for(int y=2;y<f.h*2-2;y+=3)for(int x=2;x<f.w*2-2;x+=3){int yi=y/2,xi=x/2,yn=yi+(y%2==1?1:-1),xn=xi+(x%2==1?1:-1);for(int k=0;k<2;k++){double[]a=f.a;double pred=(a[(yi*f.w+xi)*2+k]*.75+a[(yi*f.w+xn)*2+k]*.25)*.75+(a[(yn*f.w+xi)*2+k]*.75+a[(yn*f.w+xn)*2+k]*.25)*.25,d=pred-pad.a[(y*w+x)*2+k];sum+=d*d;n++;}}if(sum/Math.max(1,n)<error){error=sum/Math.max(1,n);best=new Field(f.w,f.h,2,f.a);best.offsetX=-px;best.offsetY=-py;}}return best;}

 static double photoRegular(Map<String,Object>m,int rw,int rh,boolean text){if(text)return .003;if(num(m,"d")>=15&&(rw!=num(m,"ow")||rh!=num(m,"oh"))){double t=Math.max(0,Math.min(1,(Math.min(rw/(double)num(m,"ow"),rh/(double)num(m,"oh"))-.6)/.15));return .02+.30*t*t;}return num(m,"d")>=14&&(rw!=num(m,"ow")||rh!=num(m,"oh"))?.16:.02;}

 static Im restore(Im image,Header hd,String password,Im initial,boolean allowPhase)throws Exception{Map<String,Object>m=hd.m;byte[]key=derive(password,unhex(str(m,"s")));SourceMap11 map=openMap11(m,key);PixelDest dest=new PixelDest(m,key,map.mask);int[]inv=inverseMap(m);int rw=image.w,rh=image.h,iw=num(m,"iw"),ih=num(m,"ih");Field y=new Field(rw,rh,1),uv=new Field(rw,rh,2);for(int i=0;i<image.a.length;i++){int p=image.a[i];y.a[i]=(channel(p,0)*19595.+channel(p,1)*38470.+channel(p,2)*7471.)/65536;uv.a[i*2]=channel(p,2)-y.a[i];uv.a[i*2+1]=channel(p,0)-y.a[i];}CurveTransport9.Plane old=new CurveTransport9.Plane(rw,rh,2);old.a=uv.a;boolean[] valid=null;if(num(m,"d")>=14){int nx=num(m,"ow")/16,ny=num(m,"oh")/16;boolean[]allowed=new boolean[nx*ny];for(int i=0;i<dest.order.length;i++)allowed[dest.tiles[i]]=true;valid=new boolean[rw*rh];for(int yy=0;yy<rh;yy++){double oy=(yy+.5)*num(m,"oh")/rh;int iy=(int)Math.floor(oy/16);if(iy>=ny||oy%16<3||oy%16>13)continue;for(int xx=0;xx<rw;xx++){double ox=(xx+.5)*num(m,"ow")/rw;int ix=(int)Math.floor(ox/16);if(ix<nx&&ox%16>=3&&ox%16<=13&&allowed[iy*nx+ix])valid[yy*rw+xx]=true;}}}CurveTransport9.Plane nativeC=CurveTransport9.triangle(old,valid);Field nativeUV=nativeC==null?null:new Field(nativeC.w,nativeC.h,2,nativeC.a);if(nativeUV==null&&allowPhase)nativeUV=shiftedTriangle(uv,valid);boolean hasNative=nativeUV!=null;if(!hasNative&&!allowPhase&&rw==num(m,"ow")&&rh==num(m,"oh"))return initial;if(!hasNative)nativeUV=uv;int step=hasNative?2:1;double by=(channel(map.bg,0)*19595.+channel(map.bg,1)*38470.+channel(map.bg,2)*7471.)/65536;boolean text=(num(m,"b")&4)!=0||num(m,"z")>0&&num(m,"k")*256L<iw*(double)ih*.65,mono=(num(m,"b")&2)!=0;double edgeMargin=(hasNative||allowPhase)&&rw==num(m,"ow")&&rh==num(m,"oh")&&!text&&blockScore(initial)>1.35?1:0;double scale=Math.min(rw/(double)num(m,"ow"),rh/(double)num(m,"oh"));
  double[] phase=num(m,"d")>=15&&scale<.68?resizePhase(y,num(m,"ow"),num(m,"oh")):new double[2];
  double phaseStrength=Math.min(1,Math.max(Math.abs(phase[0]),Math.abs(phase[1]))/.45);
  double severity=num(m,"d")>=15&&!text?Math.min(1,Math.max(0,(.62-scale)/.15)):0;
  nativeUV.offsetX+=phase[0]; nativeUV.offsetY+=phase[1];
  y.offsetX=phase[0]; y.offsetY=phase[1];
  double regular=photoRegular(m,rw,rh,text)+severity*(.04+.05*phaseStrength);
  double[] colors=mono?new double[iw*ih*2]:scatter(nativeUV,step,m,map,dest,inv,rw,rh,new double[]{channel(map.bg,2)-by,channel(map.bg,0)-by},.5,regular,!text,false,edgeMargin,severity,phaseStrength);
  boolean direct=rw==num(m,"ow")&&rh==num(m,"oh");
  double[] yy=scatter(y,1,m,map,dest,inv,rw,rh,new double[]{by},direct?0:.35,text?.001:.01,!text&&!direct,text,edgeMargin,severity,phaseStrength);int[][]table=colorTable(hd);Im out=new Im(iw,ih);for(int i=0;i<out.a.length;i++){int alpha=initial.a[i]&0xff000000;if(mono){int v=clamp(yy[i]),g=clamp(table[v][0]*.299+table[v][1]*.587+table[v][2]*.114);out.a[i]=alpha|g*65793;}else{double r=yy[i]+colors[i*2+1],b=yy[i]+colors[i*2],g=(yy[i]-.299*r-.114*b)/.587;out.a[i]=alpha|(table[clamp(r)][0]<<16)|(table[clamp(g)][1]<<8)|table[clamp(b)][2];}}return out;}

}



/** Adaptive ink in the reserved carrier regions; never recolours data or guards. */

static class Stroke extends MisanCore {

 static int localRadius(int[]s,int w,int h,int x,int y,int radius){int n=0,sx=0,sy=0,sxx=0,syy=0,sxy=0;for(int dy=-3;dy<=3;dy++)for(int dx=-3;dx<=3;dx++){int xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=w||yy>=h||s[yy*w+xx]<128)continue;n++;sx+=dx;sy+=dy;sxx+=dx*dx;syy+=dy*dy;sxy+=dx*dy;}int cx=n*sxx-sx*sx,cy=n*syy-sy*sy,xy=n*sxy-sx*sy;int[]scores={2*cx,2*cy,cx+cy+2*xy,cx+cy-2*xy};int id=0;for(int i=1;i<4;i++)if(scores[i]>scores[id])id=i;int[][]dirs={{0,1},{1,0},{1,-1},{1,1}};int vx=dirs[id][0],vy=dirs[id][1],step=vx!=0&&vy!=0?23:16,result=radius;for(int sign:new int[]{-1,1}){int start=0;for(int k=1;k<=(2*radius+80)/16;k++){int xx=x+sign*vx*k,yy=y+sign*vy*k;if(xx<0||yy<0||xx>=w||yy>=h)break;int v=s[yy*w+xx];if(start==0&&v<16)start=k;if(start>0&&v>=128&&k-start<3)start=0;if(start>0&&v>=128){result=Math.min(result,Math.max(16,((k-start)*step-32)/2));break;}}}return result;}

 static void radiusEnvelope(int[]a,int w,int h){for(int y=0;y<h;y++)for(int x=0;x<w;x++){int p=y*w+x,v=a[p];if(x>0)v=Math.min(v,a[p-1]+16);if(y>0){v=Math.min(v,a[p-w]+16);if(x>0)v=Math.min(v,a[p-w-1]+23);if(x+1<w)v=Math.min(v,a[p-w+1]+23);}a[p]=Math.min(4095,v);}for(int y=h-1;y>=0;y--)for(int x=w-1;x>=0;x--){int p=y*w+x,v=a[p];if(x+1<w)v=Math.min(v,a[p+1]+16);if(y+1<h){v=Math.min(v,a[p+w]+16);if(x>0)v=Math.min(v,a[p+w-1]+23);if(x+1<w)v=Math.min(v,a[p+w+1]+23);}a[p]=Math.min(4095,v);}}

 static int[] distance(Im base){int w=base.w,h=base.h,radius=radius(base),B=4096,cap=4095*B+radius;int[]s=new int[w*h],d=new int[w*h];for(int p=0;p<s.length;p++)s[p]=255-channel(base.a[p],0);for(int y=0;y<h;y++)for(int x=0;x<w;x++){int p=y*w+x,r=s[p]>0?localRadius(s,w,h,x,y,radius):radius;d[p]=s[p]>0?r:4095;}radiusEnvelope(d,w,h);for(int p=0;p<d.length;p++)d[p]=(s[p]>0?((255-s[p])*16+127)/255:4095)*B+(s[p]>0?d[p]:radius);for(int y=0;y<h;y++)for(int x=0;x<w;x++){int p=y*w+x,v=d[p];if(x>0)v=Math.min(v,d[p-1]+16*B);if(y>0){v=Math.min(v,d[p-w]+16*B);if(x>0)v=Math.min(v,d[p-w-1]+23*B);if(x+1<w)v=Math.min(v,d[p-w+1]+23*B);}d[p]=Math.min(cap,v);}for(int y=h-1;y>=0;y--)for(int x=w-1;x>=0;x--){int p=y*w+x,v=d[p];if(x+1<w)v=Math.min(v,d[p+1]+16*B);if(y+1<h){v=Math.min(v,d[p+w]+16*B);if(x>0)v=Math.min(v,d[p+w-1]+23*B);if(x+1<w)v=Math.min(v,d[p+w+1]+23*B);}d[p]=Math.min(cap,v);}return d;}

 static final int[][]PALETTE={{248,240,16},{248,168,16},{248,88,24},{248,40,64},{240,24,208},{168,48,248},{48,96,248},{16,224,248},{128,240,24},{244,244,244},{12,12,12},{16,32,88},{112,16,104},{12,72,32}};

 static int radius(Im base){return Math.max(16,(Math.min(base.w,base.h)*16+81)/162);}

 static boolean[] reservation(Im base){int[]d=distance(base);int r=radius(base);boolean[]out=new boolean[d.length];for(int p=0;p<d.length;p++)out[p]=d[p]/4096<=d[p]%4096;return out;}

 static int[]accent(Im out,Im bg,byte[]state,int[]d,int radius){int step=Math.max(1,(Math.min(out.w,out.h)+127)/128);java.util.List<Integer>samples=new java.util.ArrayList<>();for(int y=0;y<out.h;y+=step)for(int x=0;x<out.w;x+=step){int p=y*out.w+x;if(d[p]/4096>=d[p]%4096+16)continue;samples.add(state[p]==0?bg.a[p]:out.a[p]);}if(samples.isEmpty())for(int y=0;y<out.h;y+=step)for(int x=0;x<out.w;x+=step)samples.add(bg.a[y*out.w+x]);long score=Long.MIN_VALUE;int[]best=PALETTE[0];for(int[]c:PALETTE){int cy=(c[0]*19595+c[1]*38470+c[2]*7471+32768)/65536;int[]hist=new int[2048];long sum=0;int near=0;for(int v:samples){int r=channel(v,0),g=channel(v,1),b=channel(v,2),by=(r*19595+g*38470+b*7471+32768)/65536,value=4*Math.abs(cy-by)+Math.abs(c[0]-c[1]-r+g)+Math.abs(2*c[2]-c[0]-c[1]-2*b+r+g)/2;hist[value]++;sum+=value;if(value<200)near++;}int rank=Math.max(1,(samples.size()+4)/5),n=0,q=0;for(;q<2048;q++){n+=hist[q];if(n>=rank)break;}int max=Math.max(c[0],Math.max(c[1],c[2])),min=Math.min(c[0],Math.min(c[1],c[2]));long value=4L*q+2*(sum/samples.size())+max-min-near*1000L/samples.size();if(value>score){score=value;best=c;}}return best;}

 static void render(Im out,Im base,byte[]state,Im bg){int[]d=distance(base);int radius=radius(base),halo=Math.min(32,Math.max(16,(Math.min(out.w,out.h)*16+600)/1200));int[]fg=accent(out,bg,state,d,radius);int lum=(fg[0]*19595+fg[1]*38470+fg[2]*7471+32768)/65536,border=lum>=128?12:244;for(int p=0;p<d.length;p++){if(state[p]!=0)continue;int rr=d[p]%4096,dd=d[p]/4096,hh=Math.min(halo,Math.max(8,rr/4));int a=(Math.max(0,Math.min(16,rr-hh+16-dd))*255+8)/16,b=(Math.max(0,Math.min(16,rr+16-dd))*255+8)/16;int[]col=new int[3];for(int c=0;c<3;c++){int ring=(channel(bg.a[p],c)*(255-b)+border*b+127)/255;col[c]=(ring*(255-a)+fg[c]*a+127)/255;}out.a[p]=color(col[0],col[1],col[2]);}}

}



/** Local contour abstraction and colour-matched empty regions; payload is untouched. */

static class Sketch extends MisanCore {

 static int lum(int v){return(channel(v,0)*19595+channel(v,1)*38470+channel(v,2)*7471+32768)/65536;}

 static int at(int[]a,int w,int h,int x,int y){return a[Math.max(0,Math.min(h-1,y))*w+Math.max(0,Math.min(w-1,x))];}

 static int[] blur(int[]a,int w,int h){int[]t=new int[a.length],o=new int[a.length],k={1,4,6,4,1};for(int y=0;y<h;y++)for(int x=0;x<w;x++){int n=8;for(int d=-2;d<=2;d++)n+=k[d+2]*at(a,w,h,x+d,y);t[y*w+x]=n/16;}for(int y=0;y<h;y++)for(int x=0;x<w;x++){int n=8;for(int d=-2;d<=2;d++)n+=k[d+2]*at(t,w,h,x,y+d);o[y*w+x]=n/16;}return o;}

 static boolean[] skeleton(boolean[] ink,int w,int h){ink=ink.clone();int[][]d={{0,-1},{1,-1},{1,0},{1,1},{0,1},{-1,1},{-1,0},{-1,-1}};for(int it=0;it<48;it++){boolean changed=false;for(int phase=0;phase<2;phase++){int[]kill=new int[ink.length];int nn=0;for(int y=0;y<h;y++)for(int x=0;x<w;x++){int p=y*w+x;if(!ink[p])continue;boolean[]n=new boolean[8];int count=0,turn=0;for(int j=0;j<8;j++){int xx=x+d[j][0],yy=y+d[j][1];n[j]=xx>=0&&yy>=0&&xx<w&&yy<h&&ink[yy*w+xx];if(n[j])count++;}for(int j=0;j<8;j++)if(!n[j]&&n[(j+1)%8])turn++;if(count>=2&&count<=6&&turn==1&&!(n[0]&&n[2]&&n[phase==0?4:6])&&!(n[phase==0?2:0]&&n[4]&&n[6]))kill[nn++]=p;}for(int j=0;j<nn;j++)ink[kill[j]]=false;if(nn>0)changed=true;}if(!changed)break;}return ink;}

 static boolean[] drawing(Im im,int strength){int w=im.w,h=im.h,n=w*h,white=0,black=0;int[]g=new int[n];for(int p=0;p<n;p++){g[p]=lum(im.a[p]);if(g[p]>=240)white++;if(g[p]<96)black++;}if(white>n*.65&&black<n*.25){boolean[]ink=new boolean[n];for(int p=0;p<n;p++)ink[p]=g[p]<144;return skeleton(ink,w,h);}g=blur(blur(g,w,h),w,h);int[]gx=new int[n],gy=new int[n],mag=new int[n],thin=new int[n],hist=new int[256];for(int y=0;y<h;y++)for(int x=0;x<w;x++){int p=y*w+x,tl=at(g,w,h,x-1,y-1),tc=at(g,w,h,x,y-1),tr=at(g,w,h,x+1,y-1),ml=at(g,w,h,x-1,y),mr=at(g,w,h,x+1,y),bl=at(g,w,h,x-1,y+1),bc=at(g,w,h,x,y+1),br=at(g,w,h,x+1,y+1);gx[p]=-tl+tr-2*ml+2*mr-bl+br;gy[p]=-tl-2*tc-tr+bl+2*bc+br;mag[p]=Math.min(255,(Math.abs(gx[p])+Math.abs(gy[p])+4)/8);}int total=0;for(int y=0;y<h;y++)for(int x=0;x<w;x++){int p=y*w+x,ax=Math.abs(gx[p]),ay=Math.abs(gy[p]),dx=ax>2*ay?1:ay>2*ax?0:1,dy=ax>2*ay?0:ay>2*ax?1:gx[p]*gy[p]>=0?1:-1;int x0=x-dx,y0=y-dy,x1=x+dx,y1=y+dy,v0=x0<0||y0<0||x0>=w||y0>=h?0:mag[y0*w+x0],v1=x1<0||y1<0||x1>=w||y1>=h?0:mag[y1*w+x1];if(mag[p]>=v0&&mag[p]>v1){thin[p]=mag[p];if(mag[p]>=6){hist[mag[p]]++;total++;}}}int high=0,sum=0;for(;high<255;high++){sum+=hist[high];if(sum>=total*new double[]{.60,.78,.90,.96}[strength])break;}high=Math.max(12,high);int low=Math.max(6,(int)(high*new double[]{.5,.65,.8,.9}[strength]));boolean[]seen=new boolean[n],ink=new boolean[n];int[]stack=new int[n],component=new int[n];for(int seed=0;seed<n;seed++){if(seen[seed]||thin[seed]<high)continue;int sp=1,cn=0;stack[0]=seed;seen[seed]=true;while(sp>0){int p=stack[--sp],x=p%w,y=p/w;component[cn++]=p;for(int dy=-1;dy<=1;dy++)for(int dx=-1;dx<=1;dx++){int xx=x+dx,yy=y+dy,j=yy*w+xx;if(xx>=0&&yy>=0&&xx<w&&yy<h&&!seen[j]&&thin[j]>=low){seen[j]=true;stack[sp++]=j;}}}if(cn>=Math.max(8+strength*8,w/48))for(int j=0;j<cn;j++)ink[component[j]]=true;}return ink;}

 static double fraction(boolean[]ink,int w,int h,int sh){int ow=w>=h?(int)Math.floor(sh*(double)w/h+.5):sh,oh=h>w?(int)Math.floor(sh*(double)h/w+.5):sh,pitch=w+1;int[]s=new int[(w+1)*(h+1)];for(int y=0;y<h;y++)for(int x=0;x<w;x++){int p=(y+1)*pitch+x+1;s[p]=(ink[y*w+x]?1:0)+s[p-1]+s[p-pitch]-s[p-pitch-1];}int good=0,total=0;for(int y=0;y<oh/16;y++)for(int x=(ow+255)/256;x<15*ow/256;x++){int x0=Math.max(0,x*16*w/ow-1),x1=Math.min(w,(int)Math.ceil((x+1)*16.*w/ow)+1),y0=Math.max(0,y*16*h/oh-1),y1=Math.min(h,(int)Math.ceil((y+1)*16.*h/oh)+1);if(s[y1*pitch+x1]-s[y0*pitch+x1]-s[y1*pitch+x0]+s[y0*pitch+x0]==0)good++;total++;}return good/(double)Math.max(1,total);}

 static Im prepare(Im cover,int count){int sh=Math.max(640,(int)Math.sqrt(count*256.*Math.min(cover.w,cover.h)/Math.max(cover.w,cover.h)/.65));Im best=null;double score=-1;for(int[]setting:new int[][]{{1024,0}}){int size=setting[0],strength=setting[1];double scale=Math.min(1,size/(double)Math.max(cover.w,cover.h));int w=Math.max(8,(int)Math.floor(cover.w*scale+.5)),h=Math.max(8,(int)Math.floor(cover.h*scale+.5));Im im=resize(cover,w,h);boolean[]ink=drawing(im,strength);double ratio=fraction(ink,w,h,sh);for(int p=0;p<ink.length;p++)im.a[p]=ink[p]?0xff000000:0xffffffff;if(ratio>score){score=ratio;best=im;}if(ratio>=.72)break;}return best;}

 static boolean hit(double x0,double y0,double x1,double y1,int w,int h){int u=Math.max(2,(int)Math.floor(Math.min(w,h)/320.+.5)),r=4*u+3;for(double yy:new double[]{1/32.,31/32.})for(double xx:new double[]{1/8.,7/8.}){double cx=w*xx,cy=h*yy;if(x0<cx+r&&x1>cx-r&&y0<cy+r&&y1>cy-r)return true;}return false;}

 static void paint(Im out,Im base,byte[]state){int w=out.w,h=out.h,gw=(w+7)/8,gh=(h+7)/8;int[][]g=new int[3][gw*gh];boolean[]known=new boolean[gw*gh];int total=0;for(int y=0;y<gh;y++)for(int x=0;x<gw;x++){int[]s=new int[3];int n=0;for(int yy=y*8;yy<Math.min(h,y*8+8);yy++)for(int xx=x*8;xx<Math.min(w,x*8+8);xx++){int p=yy*w+xx;if(state[p]!=1)continue;n++;for(int c=0;c<3;c++)s[c]+=channel(out.a[p],c);}if(n>0){int p=y*gw+x;known[p]=true;total++;for(int c=0;c<3;c++)g[c][p]=(s[c]+n/2)/n;}}if(total==0)for(int c=0;c<3;c++)Arrays.fill(g[c],128);for(int it=0;total>0&&total<known.length&&it<gw+gh;it++){boolean[]next=known.clone();int[][]nextg={g[0].clone(),g[1].clone(),g[2].clone()};for(int y=0;y<gh;y++)for(int x=0;x<gw;x++){int p=y*gw+x;if(known[p])continue;int[]s=new int[3];int n=0;for(int[]d:new int[][]{{1,0},{-1,0},{0,1},{0,-1}}){int xx=x+d[0],yy=y+d[1],j=yy*gw+xx;if(xx<0||yy<0||xx>=gw||yy>=gh||!known[j])continue;n++;for(int c=0;c<3;c++)s[c]+=g[c][j];}if(n>0){next[p]=true;total++;for(int c=0;c<3;c++)nextg[c][p]=(s[c]+n/2)/n;}}known=next;g=nextg;}for(int it=0;it<3;it++)for(int c=0;c<3;c++)g[c]=blur(g[c],gw,gh);Im guide=new Im(gw,gh);for(int p=0;p<guide.a.length;p++)guide.a[p]=color(g[0][p],g[1][p],g[2][p]);Im bg=resize(guide,w,h);Stroke.render(out,base,state,bg);}

}



/** Axis-aligned screenshot registration by four concentric circular anchors. */

static class Frame extends MisanCore {

 static void draw(Im out){int w=out.w,h=out.h,u=Math.max(2,(int)Math.floor(Math.min(w,h)/320.+.5));for(double yy:new double[]{1/32.,31/32.})for(double xx:new double[]{1/8.,7/8.}){double cx=w*xx,cy=h*yy;int r=4*u;for(int y=Math.max(0,(int)Math.floor(cy-r-1));y<Math.min(h,(int)Math.floor(cy+r+2));y++)for(int x=Math.max(0,(int)Math.floor(cx-r-1));x<Math.min(w,(int)Math.floor(cx+r+2));x++){double d=(x+.5-cx)*(x+.5-cx)+(y+.5-cy)*(y+.5-cy);int v=d<=u*u?12:d<=4*u*u?255:d<=9*u*u?12:d<=16*u*u?255:-1;if(v>=0)out.a[y*w+x]=color(v,v,v);}}}

 static boolean dark(int[]g,int w,int x,int y){return g[y*w+x]<128;}

 static boolean ratios(double[]r,double u){for(int j=0;j<5;j++)if(Math.abs(r[j]-u*(j==2?2:1))>u*.7)return false;return true;}

 static Image locate(Image source){Im im=new Im(source);int w=im.w,h=im.h;int[]g=new int[w*h];for(int p=0;p<g.length;p++)g[p]=Sketch.lum(im.a[p]);List<double[]>found=new ArrayList<>();outer:for(int y=1;y<h-1;y++){int[]starts=new int[w+1],ends=new int[w+1];int n=1;starts[0]=0;boolean prev=dark(g,w,0,y);for(int x=1;x<w;x++){boolean v=dark(g,w,x,y);if(v!=prev){ends[n-1]=x;starts[n++]=x;prev=v;}}ends[n-1]=w;for(int k=2;k<n-2;k++){if(!dark(g,w,starts[k],y))continue;double[]rr=new double[5];double u=0;for(int j=-2;j<=2;j++){rr[j+2]=ends[k+j]-starts[k+j];u+=rr[j+2];}u/=6;if(u<1||u>Math.max(w,h)/40.||!ratios(rr,u))continue;double cx=(starts[k]+ends[k])/2.;int x=Math.min(w-1,(int)cx);boolean near=false;for(double[]f:found)if((cx-f[0])*(cx-f[0])+(y+.5-f[1])*(y+.5-f[1])<=4*f[2]*f[2]){near=true;break;}if(near)continue;int top=y,bottom=y+1;while(top>0&&dark(g,w,x,top-1))top--;while(bottom<h&&dark(g,w,x,bottom))bottom++;int up=top-1;while(up>=0&&!dark(g,w,x,up))up--;int up2=up;while(up2>=0&&dark(g,w,x,up2))up2--;int down=bottom;while(down<h&&!dark(g,w,x,down))down++;int down2=down;while(down2<h&&dark(g,w,x,down2))down2++;double[]vr={up-up2,top-1-up,bottom-top,down-bottom,down2-down};double v=Arrays.stream(vr).sum()/6;if(Math.abs(v/u-1)>.35||!ratios(vr,v))continue;double cy=(top+bottom)/2.;u=(u+v)/2;double r=3.6*u;int x0=Math.max(0,(int)Math.floor(cx-r)),x1=Math.min(w,(int)Math.ceil(cx+r)),y0=Math.max(0,(int)Math.floor(cy-r)),y1=Math.min(h,(int)Math.ceil(cy+r));double sum=0,sx=0,sy=0;for(int yy=y0;yy<y1;yy++)for(int xx=x0;xx<x1;xx++){if((xx+.5-cx)*(xx+.5-cx)+(yy+.5-cy)*(yy+.5-cy)>r*r)continue;int wt=Math.max(0,200-g[yy*w+xx]);sum+=wt;sx+=(xx+.5)*wt;sy+=(yy+.5)*wt;}if(sum<=0)continue;cx=sx/sum;cy=sy/sum;double[]s=new double[4],cnt=new double[4];double[][]ranges={{0,.8},{1.2,1.8},{2.2,2.8},{3.2,3.7}};for(int yy=y0;yy<y1;yy++)for(int xx=x0;xx<x1;xx++){double rad=Math.hypot(xx+.5-cx,yy+.5-cy)/u;for(int j=0;j<4;j++)if(rad>=ranges[j][0]&&rad<=ranges[j][1]){s[j]+=g[yy*w+xx];cnt[j]++;}}double[]means=new double[4];for(int j=0;j<4;j++)means[j]=cnt[j]>0?s[j]/cnt[j]:128;if(Math.min(means[1]-means[0],Math.min(means[1]-means[2],means[3]-means[2]))<65)continue;found.add(new double[]{cx,cy,u});if(found.size()>=64)break outer;}}

 double[]best=null;for(double[]a:found)for(double[]b:found){double span=b[0]-a[0];if(span<128||Math.abs(b[1]-a[1])>Math.max(2,span*.004)||Math.abs(b[2]/a[2]-1)>.25)continue;for(double[]c:found){double tall=c[1]-a[1];if(tall<128||Math.abs(c[0]-a[0])>Math.max(2,tall*.004)||Math.abs(c[2]/a[2]-1)>.25)continue;for(double[]d:found){if(Math.abs(d[0]-b[0])>Math.max(2,tall*.004)||Math.abs(d[1]-c[1])>Math.max(2,span*.004)||Math.abs(d[2]/a[2]-1)>.25)continue;double ww=((b[0]+d[0])-(a[0]+c[0]))/1.5,hh=((c[1]+d[1])-(a[1]+b[1]))/1.875,left=(a[0]+c[0])/2-ww/8,top=(a[1]+b[1])/2-hh/32;if(left<-.8||top<-.8||left+ww>w+.8||top+hh>h+.8)continue;if(best==null||ww*hh>best[0])best=new double[]{ww*hh,left,top,ww,hh};}}}if(best==null)return source;int x=Math.max(0,(int)Math.floor(best[1]+.5)),y=Math.max(0,(int)Math.floor(best[2]+.5)),x1=Math.min(w,(int)Math.floor(best[1]+best[3]+.5)),y1=Math.min(h,(int)Math.floor(best[2]+best[4]+.5));if(x==0&&y==0&&x1==w&&y1==h)return source;Im out=new Im(x1-x,y1-y);for(int yy=y;yy<y1;yy++)System.arraycopy(im.a,yy*w+x,out.a,(yy-y)*out.w,out.w);try{Header hd=header(out);if(out.w>num(hd.m,"ow")||out.h>num(hd.m,"oh"))out=resize(out,num(hd.m,"ow"),num(hd.m,"oh"));return out.image();}catch(Exception e){return source;}}

}



/** Lossless adaptive row filtering; opaque images use RGB, not redundant RGBA. */

static class CompactPNG {

 static int paeth(int a,int b,int c){int p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;}

 static void chunk(DataOutputStream out,String type,byte[] data)throws IOException{byte[] t=type.getBytes(java.nio.charset.StandardCharsets.US_ASCII);CRC32 crc=new CRC32();crc.update(t);crc.update(data);out.writeInt(data.length);out.write(t);out.write(data);out.writeInt((int)crc.getValue());}

 public static byte[] encode(Image im)throws IOException{int w=im.getWidth(),h=im.getHeight();boolean opaque=true;int[] row=new int[w];for(int y=0;y<h&&opaque;y++){im.getRGB(0,y,w,1,row,0,w);for(int v:row)if((v>>>24)!=255){opaque=false;break;}}int bpp=opaque?3:4,stride=w*bpp;byte[] prev=new byte[stride],current=new byte[stride];byte[][] candidates=new byte[5][stride];ByteArrayOutputStream compressed=new ByteArrayOutputStream();Deflater deflater=new Deflater(9);try(DeflaterOutputStream z=new DeflaterOutputStream(compressed,deflater,65536)){for(int y=0;y<h;y++){im.getRGB(0,y,w,1,row,0,w);for(int x=0;x<w;x++){int v=row[x],i=x*bpp;current[i]=(byte)(v>>>16);current[i+1]=(byte)(v>>>8);current[i+2]=(byte)v;if(!opaque)current[i+3]=(byte)(v>>>24);}long best=Long.MAX_VALUE;int filter=0;for(int f=0;f<5;f++){long score=0;for(int i=0;i<stride;i++){int a=i>=bpp?current[i-bpp]&255:0,b=prev[i]&255,c=i>=bpp?prev[i-bpp]&255:0,p=f==0?0:f==1?a:f==2?b:f==3?(a+b)/2:paeth(a,b,c),v=((current[i]&255)-p)&255;candidates[f][i]=(byte)v;score+=Math.min(v,256-v);}if(score<best){best=score;filter=f;}}z.write(filter);z.write(candidates[filter]);byte[] t=prev;prev=current;current=t;}}finally{deflater.end();}ByteArrayOutputStream bytes=new ByteArrayOutputStream();try(DataOutputStream out=new DataOutputStream(bytes)){out.write(new byte[]{(byte)137,80,78,71,13,10,26,10});byte[] hdr=ByteBuffer.allocate(13).putInt(w).putInt(h).put((byte)8).put((byte)(opaque?2:6)).put(new byte[3]).array();chunk(out,"IHDR",hdr);chunk(out,"IDAT",compressed.toByteArray());chunk(out,"IEND",new byte[0]);}return bytes.toByteArray();}

}



 public static final String VERSION="v1.4";
 public static final String AUTHOR="fanmod";

 /** Portable pixels; Android and desktop use the same algorithm. */

 public static class Image {

  public static final int TYPE_INT_ARGB=2;

  public final int width,height;public final int[] argb;

  public Image(int w,int h,int[] pixels){if(w<1||h<1||(long)w*h>48000000||pixels.length!=w*h)throw new IllegalArgumentException("Image exceeds 48 MP");width=w;height=h;argb=pixels;}

  public Image(int w,int h,int type){this(w,h,new int[w*h]);}

  public int getWidth(){return width;}public int getHeight(){return height;}

  public int getRGB(int x,int y){return argb[y*width+x];}

  public void setRGB(int x,int y,int value){argb[y*width+x]=value;}

  public int[] getRGB(int x,int y,int w,int h,int[] dst,int offset,int stride){if(dst==null)dst=new int[offset+stride*h];for(int row=0;row<h;row++)System.arraycopy(argb,(y+row)*width+x,dst,offset+row*stride,w);return dst;}

  public void setRGB(int x,int y,int w,int h,int[] src,int offset,int stride){for(int row=0;row<h;row++)System.arraycopy(src,offset+row*stride,argb,(y+row)*width+x,w);}

 }

 public static class Result {

  public final byte[] data;public final int width,height;public final String mime="image/png",output;

  Result(byte[] d,int w,int h,String o){data=d;width=w;height=h;output=o;}

 }

 private static void emit(DoubleConsumer p,double n){if(p!=null)p.accept(n);}

 /** One API, six arguments. input/cover: path, encoded bytes or Image. */

 public static Result process(String mode,Object input,Object cover,String key,String output,DoubleConsumer progress)throws Exception{

  if(!"encrypt".equals(mode)&&!"decrypt".equals(mode))throw new IllegalArgumentException("mode must be encrypt or decrypt");

  if(key==null||ascii(key).length>16384)throw new IllegalArgumentException("Password exceeds 16384 UTF-8 bytes");

  emit(progress,.02);Image in=load(input);emit(progress,.08);Image result;

  if("encrypt".equals(mode)){if(cover==null)throw new IllegalArgumentException("Cover is required");Image cv=load(cover);emit(progress,.15);result=encode(in,cv,key);}else{emit(progress,.15);result=decode(in,key);}

  emit(progress,.92);byte[] bytes=CompactPNG.encode(result);

  if(output!=null){Path target=Paths.get(output);Path parent=target.toAbsolutePath().getParent();if(parent!=null)Files.createDirectories(parent);Files.write(target,bytes,StandardOpenOption.CREATE_NEW);}

  emit(progress,1);return new Result(bytes,result.width,result.height,output);

 }

 private static Image load(Object value)throws Exception{

  if(value instanceof Image)return (Image)value;

  byte[] bytes=value instanceof byte[]?(byte[])value:Files.readAllBytes(value instanceof Path?(Path)value:Paths.get((String)value));

  Image out;

  try{

   Class<?> io=Class.forName("javax.imageio.ImageIO");Object b=io.getMethod("read",InputStream.class).invoke(null,new ByteArrayInputStream(bytes));

   if(b==null)throw new IOException("Unsupported image format");Class<?> c=b.getClass();int w=(Integer)c.getMethod("getWidth").invoke(b),h=(Integer)c.getMethod("getHeight").invoke(b);

   if(w<1||h<1||(long)w*h>48000000)throw new IOException("Input exceeds 48 MP");

   int[] pixels=(int[])c.getMethod("getRGB",int.class,int.class,int.class,int.class,int[].class,int.class,int.class).invoke(b,0,0,w,h,null,0,w);out=new Image(w,h,pixels);

  }catch(ClassNotFoundException desktopAbsent){

   Class<?> factory=Class.forName("android.graphics.BitmapFactory"),optionsClass=Class.forName("android.graphics.BitmapFactory$Options");Object options=optionsClass.getConstructor().newInstance();

   // Processing uses unpremultiplied channels, preserving RGB under partial alpha.

   optionsClass.getField("inPremultiplied").setBoolean(options,false);optionsClass.getField("inScaled").setBoolean(options,false);

   Class<?> config=Class.forName("android.graphics.Bitmap$Config");optionsClass.getField("inPreferredConfig").set(options,config.getField("ARGB_8888").get(null));

   Object b=factory.getMethod("decodeByteArray",byte[].class,int.class,int.class,optionsClass).invoke(null,bytes,0,bytes.length,options);

   if(b==null)throw new IOException("Unsupported image format");Class<?> c=b.getClass();int w=(Integer)c.getMethod("getWidth").invoke(b),h=(Integer)c.getMethod("getHeight").invoke(b);

   if(w<1||h<1||(long)w*h>48000000)throw new IOException("Input exceeds 48 MP");out=new Image(w,h,new int[w*h]);

   c.getMethod("getPixels",int[].class,int.class,int.class,int.class,int.class,int.class,int.class).invoke(b,out.argb,0,w,0,0,w,h);c.getMethod("recycle").invoke(b);

  }

  return orient(out,orientation(bytes));

 }

 public static void main(String[] a){try{

  if(a.length!=5)throw new IllegalArgumentException("Usage: MisanCore encrypt|decrypt input cover|- key|- output");

  String key="-".equals(a[3])?"":a[3].startsWith("@@")?a[3].substring(1):a[3].startsWith("@")?new String(Files.readAllBytes(Paths.get(a[3].substring(1))),StandardCharsets.UTF_8):a[3];

  if(a[3].startsWith("@")&&!a[3].startsWith("@@")&&key.startsWith("\ufeff"))key=key.substring(1);

  Result r=process(a[0],a[1],"-".equals(a[2])?null:a[2],key,a[4],null);

  System.out.println(r.width+"x"+r.height+" -> "+r.output);

 }catch(Exception e){System.err.println(e.getMessage());System.exit(1);}}



}

