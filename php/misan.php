<?php
// Copyright (c) 2026 fanmod
// First-party code: MIT (see LICENSE). Third-party notices: THIRD_PARTY_NOTICES.txt.

/** MisanScramble v1.4 — PHP 8+, GD, zlib, EXIF. See THIRD_PARTY_NOTICES.txt. */

declare(strict_types=1);

namespace {

const PM_MAX=48000000;

function pm_clip(float $v):int {return max(0,min(255,(int)floor($v+.5)));}

function pm_paeth(int $a,int $b,int $c):int {$p=$a+$b-$c;$pa=abs($p-$a);$pb=abs($p-$b);$pc=abs($p-$c);return $pa<=$pb&&$pa<=$pc?$a:($pb<=$pc?$b:$c);}

function pm_png_alpha(string $bytes,int $w,int $h):?string {

    if(substr($bytes,0,8)!="\x89PNG\r\n\x1a\n")return null;

    $p=8;$idat='';$pal='';$trns='';$depth=0;$type=0;$interlace=0;

    while($p+12<=strlen($bytes)){$len=unpack('N',substr($bytes,$p,4))[1];$kind=substr($bytes,$p+4,4);if($len>strlen($bytes)-$p-12)throw new RuntimeException('Truncated PNG');$data=substr($bytes,$p+8,$len);if($kind==='IHDR'){$depth=ord($data[8]);$type=ord($data[9]);$interlace=ord($data[12]);}elseif($kind==='IDAT')$idat.=$data;elseif($kind==='PLTE')$pal=$data;elseif($kind==='tRNS')$trns=$data;$p+=12+$len;}

    if(!in_array($type,[3,4,6],true))return null;

    if(!in_array($depth,[1,2,4,8,16],true)||$interlace>1)throw new RuntimeException('Unsupported PNG layout');

    $channels=[0=>1,2=>3,3=>1,4=>2,6=>4][$type];$bpp=max(1,(int)ceil($channels*$depth/8));$raw=gzuncompress($idat,$w*$h*$channels*2+($w+$h)*16+1024);if($raw===false)throw new RuntimeException('PNG inflate failed');

    $alpha=str_repeat("\xff",$w*$h);$offset=0;$passes=$interlace?[[0,0,8,8],[4,0,8,8],[0,4,4,8],[2,0,4,4],[0,2,2,4],[1,0,2,2],[0,1,1,2]]:[[0,0,1,1]];

    foreach($passes as [$sx,$sy,$dx,$dy]){$pw=max(0,(int)ceil(($w-$sx)/$dx));$ph=max(0,(int)ceil(($h-$sy)/$dy));if(!$pw||!$ph)continue;$stride=(int)ceil($pw*$channels*$depth/8);$prev=str_repeat("\0",$stride);

        for($y=0;$y<$ph;$y++){if($offset+$stride+1>strlen($raw))throw new RuntimeException('Incomplete PNG scanline');$filter=ord($raw[$offset++]);$row=substr($raw,$offset,$stride);$offset+=$stride;

            for($j=0;$j<$stride;$j++){$a=$j>=$bpp?ord($row[$j-$bpp]):0;$b=ord($prev[$j]);$c=$j>=$bpp?ord($prev[$j-$bpp]):0;$v=match($filter){0=>0,1=>$a,2=>$b,3=>intdiv($a+$b,2),4=>pm_paeth($a,$b,$c),default=>throw new RuntimeException('Invalid PNG filter')};$row[$j]=chr((ord($row[$j])+$v)&255);}

            for($x=0;$x<$pw;$x++){if($type===3){$bit=$x*$depth;$index=(ord($row[intdiv($bit,8)])>>(8-$depth-$bit%8))&((1<<$depth)-1);$value=$index<strlen($trns)?ord($trns[$index]):255;}else{$component=$x*$channels+$channels-1;$value=$depth===16?(int)floor(unpack('n',substr($row,$component*2,2))[1]/257+.5):ord($row[$component]);}$alpha[($sy+$y*$dy)*$w+$sx+$x*$dx]=chr($value);}$prev=$row;

        }

    }return $alpha;

}

function pm_load(string $path):array {

    if(!extension_loaded('gd')||PHP_INT_SIZE<8)throw new RuntimeException('Requires 64-bit PHP and GD');$bytes=file_get_contents($path);if($bytes===false)throw new RuntimeException('Cannot read input');$info=getimagesizefromstring($bytes);if(!$info||$info[0]*$info[1]>PM_MAX)throw new RuntimeException('Unsupported format or input exceeds 48 MP');$im=imagecreatefromstring($bytes);if(!$im)throw new RuntimeException('GD cannot decode this format');if(!imageistruecolor($im))imagepalettetotruecolor($im);imagealphablending($im,false);imagesavealpha($im,true);$alpha=pm_png_alpha($bytes,imagesx($im),imagesy($im));

    if($info[2]===IMAGETYPE_JPEG&&function_exists('exif_read_data')){$exif=@exif_read_data($path);$o=(int)($exif['Orientation']??1);if(in_array($o,[2,5,7],true))imageflip($im,IMG_FLIP_HORIZONTAL);if($o===4)imageflip($im,IMG_FLIP_VERTICAL);if($o===3)$im=imagerotate($im,180,0);if(in_array($o,[5,8],true))$im=imagerotate($im,90,0);if(in_array($o,[6,7],true))$im=imagerotate($im,-90,0);}

    return[$im,$alpha];

}

function pm_alpha(GdImage $im,?string $alpha,int $x,int $y):int {return $alpha!==null?ord($alpha[$y*imagesx($im)+$x]):pm_clip(255-((imagecolorat($im,$x,$y)>>24)&127)*255/127);}

function pm_chunk(string $type,string $data):string {return pack('N',strlen($data)).$type.$data.pack('N',crc32($type.$data));}

function pm_save(array $image,string $path):void {if(file_exists($path))throw new RuntimeException('Output exists; choose a different filename');$dir=dirname($path);if(!is_dir($dir)&&!mkdir($dir,0775,true))throw new RuntimeException('Cannot create output directory');[$im,$alpha]=$image;if($alpha===null){if(!imagepng($im,$path,9,PNG_ALL_FILTERS))throw new RuntimeException('PNG output failed');return;}$w=imagesx($im);$h=imagesy($im);$raw='';for($y=0;$y<$h;$y++){$raw.="\0";for($x=0;$x<$w;$x++){$v=imagecolorat($im,$x,$y);$raw.=chr(($v>>16)&255).chr(($v>>8)&255).chr($v&255).$alpha[$y*$w+$x];}}$png="\x89PNG\r\n\x1a\n".pm_chunk('IHDR',pack('NNCCCCC',$w,$h,8,6,0,0,0)).pm_chunk('IDAT',gzcompress($raw,6)).pm_chunk('IEND','');if(file_put_contents($path,$png)===false)throw new RuntimeException('PNG output failed');}



/** Binary BCH(63,36,t=5) and interleaved Golay(23,12). Requires 64-bit PHP. */

final class CFR_ECC {

 static array $ex=[],$lg=[],$errors=[];

 static function init():void {if(self::$ex)return;$v=1;for($i=0;$i<63;$i++){self::$ex[$i]=$v;self::$lg[$v]=$i;$v<<=1;if($v&64)$v^=0x43;}for($i=63;$i<126;$i++)self::$ex[$i]=self::$ex[$i-63];self::$errors=array_fill(0,2048,0);for($i=0;$i<23;$i++){self::add(1<<$i);for($j=$i+1;$j<23;$j++){self::add((1<<$i)|(1<<$j));for($k=$j+1;$k<23;$k++)self::add((1<<$i)|(1<<$j)|(1<<$k));}}}

 static function mul(int $a,int $b):int{return !$a||!$b?0:self::$ex[(self::$lg[$a]+self::$lg[$b])%63];}

 static function div(int $a,int $b):int{return !$a?0:self::$ex[(self::$lg[$a]-self::$lg[$b]+63)%63];}

 static function rem(int $w):int{for($i=22;$i>=11;$i--)if($w&(1<<$i))$w^=0xae3<<($i-11);return $w;}

 static function add(int $e):void{self::$errors[self::rem($e)]=$e;}

 static function word(int $m):int{$raw=$m<<27;$r=$raw;for($i=62;$i>=27;$i--)if($r&(1<<$i))$r^=0x86e8113<<($i-27);return $raw|$r;}

 static function evalWord(int $w,int $root):int{$s=0;for($p=0;$p<63;$p++)if($w&(1<<$p))$s^=self::$ex[($root*$p)%63];return $s;}

 static function unword(int $w):int{self::init();$s=[];for($i=1;$i<=10;$i++)$s[]=self::evalWord($w,$i);if(!array_filter($s))return $w>>27;$c=$b=array_fill(0,11,0);$c[0]=$b[0]=1;$len=0;$m=1;$last=1;for($n=0;$n<10;$n++){$d=$s[$n];for($j=1;$j<=$len;$j++)$d^=self::mul($c[$j],$s[$n-$j]);if(!$d){$m++;continue;}$saved=$c;$f=self::div($d,$last);for($j=0;$j<11-$m;$j++)$c[$j+$m]^=self::mul($f,$b[$j]);if(2*$len<=$n){$len=$n+1-$len;$b=$saved;$last=$d;$m=1;}else $m++;}$count=0;for($p=0;$p<63;$p++){$test=$c[0];for($j=1;$j<=$len;$j++)$test^=self::mul($c[$j],self::$ex[(6300-$p*$j)%63]);if(!$test){$w^=1<<$p;$count++;}}if($count!==$len||$len>5)throw new RuntimeException('BCH correction limit');for($i=1;$i<=10;$i++)if(self::evalWord($w,$i))throw new RuntimeException('Invalid BCH word');return $w>>27;}

 static function encode(string $data):array{$out=[];$count=(int)ceil(strlen($data)*8/36);for($n=0;$n<$count;$n++){$m=0;for($j=0;$j<36;$j++){$i=$n*36+$j;$m=($m<<1)|($i<strlen($data)*8?((ord($data[intdiv($i,8)])>>(7-$i%8))&1):0);}$w=self::word($m);for($j=62;$j>=0;$j--)$out[]=($w>>$j)&1;}return $out;}

 static function decode(array $bits):string{if(count($bits)%63)throw new RuntimeException('Invalid BCH length');$out='';$v=0;$p=0;for($n=0;$n<count($bits);$n+=63){$w=0;for($i=0;$i<63;$i++)$w=($w<<1)|$bits[$n+$i];$m=self::unword($w);for($i=35;$i>=0;$i--){$v=($v<<1)|(($m>>$i)&1);if(++$p%8===0){$out.=chr($v);$v=0;}}}return $out;}

 static function golay(int $m):array{$words=[];$bits=[];for($c=0;$c<3;$c++){$raw=(($m>>(24-12*$c))&4095)<<11;$words[]=$raw|self::rem($raw);}for($i=0;$i<23;$i++)for($c=0;$c<3;$c++)$bits[]=($words[$c]>>(22-$i))&1;return $bits;}

 static function ungolay(array $bits):int{self::init();$m=0;for($c=0;$c<3;$c++){$w=0;for($i=0;$i<23;$i++)$w=($w<<1)|$bits[3*$i+$c];$m=($m<<12)|(($w^self::$errors[self::rem($w)])>>11);}return $m;}

}



final class BoundaryMask{

 static function encode(string $raw,int $w,int $h):string{$out='';$prev=$older=[];for($y=0;$y<$h;$y++){$edges=[];$last=0;for($x=0;$x<$w;$x++){$i=$y*$w+$x;$v=(ord($raw[intdiv($i,8)])>>(7-$i%8))&1;if($v!==$last){$edges[]=$x;$last=$v;}}$n=count($edges);$out.=chr($n);for($i=0;$i<$n;$i++){$pred=count($prev)===$n&&count($older)===$n?2*$prev[$i]-$older[$i]:(count($prev)===$n?$prev[$i]:($i?$edges[$i-1]+1:0));$d=$edges[$i]-$pred;$v=$d>=0?2*$d:-2*$d-1;while($v>=128){$out.=chr(($v&127)|128);$v>>=7;}$out.=chr($v);}$older=$prev;$prev=$edges;}return $out;}

 static function decode(string $data,int $w,int $h):string{$p=0;$prev=$older=[];$raw=str_repeat("\0",intdiv($w*$h+7,8));for($y=0;$y<$h;$y++){if($p>=strlen($data))throw new RuntimeException('Truncated transitions');$n=ord($data[$p++]);if($n>$w)throw new RuntimeException('Transition count');$edges=[];for($i=0;$i<$n;$i++){$v=$shift=0;$done=false;for($k=0;$k<3;$k++){if($p>=strlen($data))throw new RuntimeException('Truncated transition');$b=ord($data[$p++]);$v|=($b&127)<<$shift;$shift+=7;if($b<128){$done=true;break;}}if(!$done)throw new RuntimeException('Varint');$pred=count($prev)===$n&&count($older)===$n?2*$prev[$i]-$older[$i]:(count($prev)===$n?$prev[$i]:($i?$edges[$i-1]+1:0));$x=$pred+($v%2?-intdiv($v,2)-1:intdiv($v,2));if($x<0||$x>=$w||($i&&$x<=$edges[$i-1]))throw new RuntimeException('Transition position');$edges[]=$x;}for($i=0;$i<$n;$i+=2)for($x=$edges[$i];$x<($i+1<$n?$edges[$i+1]:$w);$x++){$at=$y*$w+$x;$b=intdiv($at,8);$raw[$b]=chr(ord($raw[$b])|(1<<(7-$at%8)));}$older=$prev;$prev=$edges;}if($p!==strlen($data)||self::encode($raw,$w,$h)!==$data)throw new RuntimeException('Noncanonical transitions');return $raw;}

 static function unpack(string $data,int $w,int $h):string{$raw=@gzuncompress($data,$h*(1+3*$w)+1);if($raw===false||strlen($raw)>$h*(1+3*$w))throw new RuntimeException('Transition bound');return self::decode($raw,$w,$h);}

}



/* Geometry-only arithmetic codec, requires a 64-bit PHP runtime. */



final class GeometryMask {

 private const CTX=[[-1,0],[-2,0],[-2,-1],[-1,-1],[0,-1],[1,-1],[2,-1],[-1,-2],[0,-2]];

 private const HALF=2147483648,Q=1073741824,FULL=4294967296;

 private static function dimensions(int $w,int $h):void{if(PHP_INT_SIZE<8||$w<1||$h<1||$w>255||$h>255)throw new RuntimeException('Invalid mask dimensions or 32-bit runtime');}

 static function encode(string $raw,int $w,int $h):string{self::dimensions($w,$h);$stride=$w+4;$p=str_repeat("\0",($h+2)*$stride);for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++){$i=$y*$w+$x;$p[($y+2)*$stride+$x+2]=chr((ord($raw[intdiv($i,8)])>>(7-$i%8))&1);}$c0=$c1=array_fill(0,512,1);$lo=0;$hi=self::FULL-1;$pending=0;$out='';$nb=0;

 $put=function(int $v)use(&$out,&$nb):void{if($nb%8===0)$out.="\0";$at=strlen($out)-1;$out[$at]=chr(ord($out[$at])|($v<<(7-$nb%8)));$nb++;};$emit=function(int $v)use($put,&$pending):void{$put($v);while($pending>0){$put(1-$v);$pending--;}};

 for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++){$at=($y+2)*$stride+$x+2;$index=0;foreach(self::CTX as[$dx,$dy])$index=$index*2+ord($p[$at+$dy*$stride+$dx]);$v=ord($p[$at]);$cut=$lo+intdiv(($hi-$lo+1)*$c0[$index],$c0[$index]+$c1[$index]);if($v)$lo=$cut;else $hi=$cut-1;for(;;){if($hi<self::HALF)$emit(0);elseif($lo>=self::HALF){$emit(1);$lo-=self::HALF;$hi-=self::HALF;}elseif($lo>=self::Q&&$hi<3*self::Q){$pending++;$lo-=self::Q;$hi-=self::Q;}else break;$lo*=2;$hi=$hi*2+1;}if($v)$c1[$index]++;else $c0[$index]++;if($c0[$index]+$c1[$index]>=16384){$c0[$index]=intdiv($c0[$index]+1,2);$c1[$index]=intdiv($c1[$index]+1,2);}}$pending++;$emit($lo<self::Q?0:1);for($i=0;$i<32;$i++)$put(0);return $out;}

 static function decode(string $data,int $w,int $h):string{self::dimensions($w,$h);$stride=$w+4;$p=str_repeat("\0",($h+2)*$stride);$c0=$c1=array_fill(0,512,1);$lo=0;$hi=self::FULL-1;$pos=0;$code=0;$get=function()use($data,&$pos):int{if($pos>=strlen($data)*8)throw new RuntimeException('Truncated arithmetic mask');$v=(ord($data[intdiv($pos,8)])>>(7-$pos%8))&1;$pos++;return $v;};for($i=0;$i<32;$i++)$code=$code*2+$get();for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++){$at=($y+2)*$stride+$x+2;$index=0;foreach(self::CTX as[$dx,$dy])$index=$index*2+ord($p[$at+$dy*$stride+$dx]);$cut=$lo+intdiv(($hi-$lo+1)*$c0[$index],$c0[$index]+$c1[$index]);$v=(int)($code>=$cut);$p[$at]=chr($v);if($v)$lo=$cut;else $hi=$cut-1;for(;;){if($hi<self::HALF){}elseif($lo>=self::HALF){$code-=self::HALF;$lo-=self::HALF;$hi-=self::HALF;}elseif($lo>=self::Q&&$hi<3*self::Q){$code-=self::Q;$lo-=self::Q;$hi-=self::Q;}else break;$lo*=2;$hi=$hi*2+1;$code=$code*2+$get();}if($v)$c1[$index]++;else $c0[$index]++;if($c0[$index]+$c1[$index]>=16384){$c0[$index]=intdiv($c0[$index]+1,2);$c1[$index]=intdiv($c1[$index]+1,2);}}$raw=str_repeat("\0",intdiv($w*$h+7,8));for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++){$i=$y*$w+$x;$at=intdiv($i,8);$raw[$at]=chr(ord($raw[$at])|(ord($p[($y+2)*$stride+$x+2])<<(7-$i%8)));}if(self::encode($raw,$w,$h)!==$data)throw new RuntimeException('Noncanonical arithmetic mask');return $raw;}

 static function pack(string $raw,int $w,int $h,bool $enhanced=false):string{$a=self::encode($raw,$w,$h);$b=gzcompress($raw,9);$best=strlen($a)<strlen($b)?"\1".$a:"\0".$b;if($enhanced){$c="\2".gzcompress(BoundaryMask::encode($raw,$w,$h),9);if(strlen($c)<strlen($best))$best=$c;}return $best;}

 static function unpack(string $data,int $w,int $h):string{self::dimensions($w,$h);if($data==='')throw new RuntimeException('Empty mask');if($data[0]==="\1")return self::decode(substr($data,1),$w,$h);if($data[0]==="\2")return BoundaryMask::unpack(substr($data,1),$w,$h);if($data[0]!=="\0")throw new RuntimeException('Invalid mask mode');$size=intdiv($w*$h+7,8);$raw=@gzuncompress(substr($data,1),$size+1);if($raw===false||strlen($raw)!==$size)throw new RuntimeException('Invalid compressed mask');return $raw;}

}



/* Gilbert fragments, derived from pic-scramble MIT / Gilbert BSD-2-Clause.

 * Sampling-cell adaptation and source-plane reconstruction are local changes.

 * SplFixedArray keeps numeric working buffers below ordinary PHP array costs.

 */

function cf9_q8(float $v):float{return floor($v*256+.5)/256;}



final class CF9Plane{

 public int $w,$h,$ch;public SplFixedArray $a;

 function __construct(int $w,int $h,int $ch){$this->w=$w;$this->h=$h;$this->ch=$ch;$this->a=new SplFixedArray($w*$h*$ch);}

}

function cf9_triangle(CF9Plane $c,?string $valid=null):?CF9Plane{

 $w=$c->w;$h=$c->h;$ww=intdiv($w,2);$hh=intdiv($h,2);if(!$ww||!$hh)return null;$out=new CF9Plane($ww,$hh,2);$a=$out->a;

 for($y=0;$y<$hh;$y++)for($x=0;$x<$ww;$x++)for($k=0;$k<2;$k++)$a[($y*$ww+$x)*2+$k]=($c->a[(2*$y*$w+2*$x)*2+$k]+$c->a[(2*$y*$w+2*$x+1)*2+$k]+$c->a[((2*$y+1)*$w+2*$x)*2+$k]+$c->a[((2*$y+1)*$w+2*$x+1)*2+$k])/4;

 for($axis=0;$axis<2;$axis++){$n=$axis?$hh:$ww;$lanes=$axis?$ww:$hh;if($n<2)continue;$cp=[];for($i=0;$i<$n;$i++){$den=($i===0||$i===$n-1?.875:.75)-($i?.125*$cp[$i-1]:0);$cp[$i]=.125/$den;}

  for($lane=0;$lane<$lanes;$lane++)for($k=0;$k<2;$k++){$v=[];for($i=0;$i<$n;$i++){$p=($axis?$i*$ww+$lane:$lane*$ww+$i)*2+$k;$den=($i===0||$i===$n-1?.875:.75)-($i?.125*$cp[$i-1]:0);$v[$i]=($a[$p]-($i?.125*$v[$i-1]:0))/$den;}for($i=$n-2;$i>=0;$i--)$v[$i]-=$cp[$i]*$v[$i+1];for($i=0;$i<$n;$i++)$a[($axis?$i*$ww+$lane:$lane*$ww+$i)*2+$k]=$v[$i];}

 }

 if($valid!==null&&substr_count($valid,"\1")<256)$valid=null;$count=0;$err=0.;$variation=0.;for($y=0;$y<$hh*2;$y++)for($x=0;$x<$ww*2;$x++){if($valid!==null&&$valid[$y*$w+$x]==="\0")continue;$count+=2;$yi=intdiv($y,2);$xi=intdiv($x,2);$yn=max(0,min($hh-1,$yi+($y%2?1:-1)));$xn=max(0,min($ww-1,$xi+($x%2?1:-1)));for($k=0;$k<2;$k++){$pred=($a[($yi*$ww+$xi)*2+$k]*.75+$a[($yi*$ww+$xn)*2+$k]*.25)*.75+($a[($yn*$ww+$xi)*2+$k]*.75+$a[($yn*$ww+$xn)*2+$k]*.25)*.25;$obs=$c->a[($y*$w+$x)*2+$k];$d=$pred-$obs;$e=$a[($yi*$ww+$xi)*2+$k]-$obs;$err+=$d*$d;$variation+=$e*$e;}}

 $err/=$count;$variation/=$count;if($err>4||!($err/max($variation,1e-9)<.18||$variation<1))return null;for($i=0;$i<$a->count();$i++)$a[$i]=cf9_q8($a[$i]);return $out;

}





/* Transports already-scrambled pixels in intact rectangles where possible. */

final class CFTPacking{

 public int $nx,$ny,$sc,$sr;public array $free=[],$ii=[],$si=[],$cache=[],$source=[],$dest=[];private Closure $rng;

 function __construct(array $m,string $key,string $mask){$ow=$m['ow'];$this->nx=intdiv($ow,16);$this->ny=intdiv($m['oh'],16);$this->sc=(int)ceil($m['w']/16);$this->sr=(int)ceil($m['h']/16);$nx=$this->nx;$ny=$this->ny;$sc=$this->sc;$sr=$this->sr;$cm=base64_decode($m['mask']);$this->free=array_fill(0,$nx*$ny,false);$this->ii=array_fill(0,($nx+1)*($ny+1),0);$this->si=array_fill(0,($sc+1)*($sr+1),0);$this->rng=cf_stream($key,"payload-rectangles\0");

  for($y=0;$y<$ny;$y++)for($x=0;$x<$nx;$x++){$mx=min($m['c']-1,intdiv(($x+1)*$m['c']-1,$nx));$my=min($m['r']-1,intdiv(($y+1)*$m['r']-1,$ny));$p=$my*$m['c']+$mx;$v=$x>=($m['d']>=14?(int)ceil($ow/512):($m['d']>=13?(int)ceil($ow/256):intdiv((int)ceil($ow/64)+1,2)))&&$x<($m['d']>=14?intdiv(31*$ow,512):($m['d']>=13?intdiv(15*$ow,256):intdiv(intdiv(7*$ow,64),2)))&&(bool)(ord($cm[intdiv($p,8)])&(1<<(7-$p%8)));$this->free[$y*$nx+$x]=$v;$this->ii[($y+1)*($nx+1)+$x+1]=(int)$v+$this->ii[$y*($nx+1)+$x+1]+$this->ii[($y+1)*($nx+1)+$x]-$this->ii[$y*($nx+1)+$x];}

  for($y=0;$y<$sr;$y++)for($x=0;$x<$sc;$x++){$p=$y*$sc+$x;$v=(int)(bool)(ord($mask[intdiv($p,8)])&(1<<(7-$p%8)));$this->si[($y+1)*($sc+1)+$x+1]=$v+$this->si[$y*($sc+1)+$x+1]+$this->si[($y+1)*($sc+1)+$x]-$this->si[$y*($sc+1)+$x];}

 }

 function locate(int $w,int $h):int{$name=$w.','.$h;$nx=$this->nx;$ny=$this->ny;if(!isset($this->cache[$name])){$a=[];for($y=0;$y<=$ny-$h;$y++)for($x=0;$x<=$nx-$w;$x++){$sum=$this->ii[($y+$h)*($nx+1)+$x+$w]-$this->ii[$y*($nx+1)+$x+$w]-$this->ii[($y+$h)*($nx+1)+$x]+$this->ii[$y*($nx+1)+$x];if($sum===$w*$h)$a[]=$y*$nx+$x;}$n=count($a);$start=$n?($this->rng)($n):0;$stride=997;while($n&&cf_gcd($stride,$n)!==1)$stride+=2;$this->cache[$name]=['a'=>$a,'start'=>$start,'stride'=>$stride,'cursor'=>0];}$s=&$this->cache[$name];$n=count($s['a']);while($s['cursor']<$n){$tile=$s['a'][($s['start']+$s['cursor']*$s['stride'])%$n];$s['cursor']++;$x=$tile%$nx;$y=intdiv($tile,$nx);$ok=true;for($v=0;$v<$h&&$ok;$v++)for($u=0;$u<$w;$u++)if(!$this->free[($y+$v)*$nx+$x+$u]){$ok=false;break;}if($ok)return $tile;}return-1;}

 function place(int $x,int $y,int $w,int $h):void{$sc=$this->sc;$count=$this->si[($y+$h)*($sc+1)+$x+$w]-$this->si[$y*($sc+1)+$x+$w]-$this->si[($y+$h)*($sc+1)+$x]+$this->si[$y*($sc+1)+$x];if(!$count)return;$t=$count===$w*$h?$this->locate($w,$h):-1;if($t>=0){$dx=$t%$this->nx;$dy=intdiv($t,$this->nx);for($v=0;$v<$h;$v++)for($u=0;$u<$w;$u++){$p=($dy+$v)*$this->nx+$dx+$u;$this->free[$p]=false;$this->source[]=($y+$v)*$sc+$x+$u;$this->dest[]=$p;}return;}if($w===1&&$h===1)throw new RuntimeException('Contour packing capacity exhausted');if($w>=$h&&$w>1){$cut=intdiv($w,2);$this->place($x,$y,$cut,$h);$this->place($x+$cut,$y,$w-$cut,$h);}else{$cut=intdiv($h,2);$this->place($x,$y,$w,$cut);$this->place($x,$y+$cut,$w,$h-$cut);}}

 static function plan(array $m,string $key,string $mask):array{$p=new self($m,$key,$mask);$maximum=$m['d']>=15?1:($m['d']>=14?64:8);$regions=[];for($y=0;$y<$p->sr;$y+=$maximum)for($x=0;$x<$p->sc;$x+=$maximum)$regions[]=[$x,$y,min($maximum,$p->sc-$x),min($maximum,$p->sr-$y)];for($i=count($regions)-1;$i>0;$i--){$j=($p->rng)($i+1);[$regions[$i],$regions[$j]]=[$regions[$j],$regions[$i]];}foreach($regions as $a)$p->place(...$a);if(count($p->source)!==$m['k'])throw new RuntimeException('Incomplete payload mapping');if($m['a']){$curve=cf_curve($p->nx,$p->ny);$remaining=[];for($i=0;$i<$p->nx*$p->ny;$i++){$t=cf_uget($curve,$i);if($p->free[$t])$remaining[]=$t;}if(count($remaining)<count($p->source))throw new RuntimeException('Insufficient alpha capacity');$start=($p->rng)(count($remaining)-count($p->source)+1);$p->dest=array_merge($p->dest,array_slice($remaining,$start,count($p->source)));}$order='';foreach($p->source as $t)$order.=pack('V',$t);return[$order,$p->dest];}

}



function cf_stream(...$args){return \CFT2\cf_stream(...$args);}

function cf_curve(...$args){return \CFT2\cf_curve(...$args);}

function cf_gcd(...$args){return \CFT2\cf_gcd(...$args);}

function cf_uget(...$args){return \CFT2\cf_uget(...$args);}

}

namespace CFT2 {

use CF9Plane;

use CFR_ECC;

use CFTPacking;

use Closure;

use GdImage;

use GeometryMask;

use RuntimeException;

use SplFixedArray;

use Throwable;





/* Deterministic classical abstraction, no network or AI. */

function sk_lum(int $v):int{return intdiv((($v>>16)&255)*19595+(($v>>8)&255)*38470+($v&255)*7471+32768,65536);}

function sk_at(array $a,int $w,int $h,int $x,int $y):int{return $a[max(0,min($h-1,$y))*$w+max(0,min($w-1,$x))];}

function sk_blur(array $a,int $w,int $h):array{$t=[];$o=[];$k=[1,4,6,4,1];for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++){$n=8;for($d=-2;$d<=2;$d++)$n+=$k[$d+2]*sk_at($a,$w,$h,$x+$d,$y);$t[]=intdiv($n,16);}for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++){$n=8;for($d=-2;$d<=2;$d++)$n+=$k[$d+2]*sk_at($t,$w,$h,$x,$y+$d);$o[]=intdiv($n,16);}return $o;}

function sk_skeleton(string $ink,int $w,int $h):string{$d=[[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]];for($it=0;$it<48;$it++){$changed=false;for($phase=0;$phase<2;$phase++){$kill=[];for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++){$p=$y*$w+$x;if($ink[$p]==="\0")continue;$n=[];$count=$turn=0;for($j=0;$j<8;$j++){$xx=$x+$d[$j][0];$yy=$y+$d[$j][1];$v=$xx>=0&&$yy>=0&&$xx<$w&&$yy<$h&&$ink[$yy*$w+$xx]!=="\0";$n[]=$v;if($v)$count++;}for($j=0;$j<8;$j++)if(!$n[$j]&&$n[($j+1)%8])$turn++;if($count>=2&&$count<=6&&$turn===1&&!($n[0]&&$n[2]&&$n[$phase===0?4:6])&&!($n[$phase===0?2:0]&&$n[4]&&$n[6]))$kill[]=$p;}foreach($kill as $p)$ink[$p]="\0";if(count($kill))$changed=true;}if(!$changed)break;}return $ink;}

function sk_drawing(GdImage $im,int $strength):string{$w=imagesx($im);$h=imagesy($im);$n=$w*$h;$g=[];$white=$black=0;for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++){$v=sk_lum(imagecolorat($im,$x,$y));$g[]=$v;if($v>=240)$white++;if($v<96)$black++;}if($white>$n*.65&&$black<$n*.25){$ink='';foreach($g as $v)$ink.=$v<144?"\1":"\0";return sk_skeleton($ink,$w,$h);}$g=sk_blur(sk_blur($g,$w,$h),$w,$h);$gx=$gy=$mag=[];for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++){$tl=sk_at($g,$w,$h,$x-1,$y-1);$tc=sk_at($g,$w,$h,$x,$y-1);$tr=sk_at($g,$w,$h,$x+1,$y-1);$ml=sk_at($g,$w,$h,$x-1,$y);$mr=sk_at($g,$w,$h,$x+1,$y);$bl=sk_at($g,$w,$h,$x-1,$y+1);$bc=sk_at($g,$w,$h,$x,$y+1);$br=sk_at($g,$w,$h,$x+1,$y+1);$a=-$tl+$tr-2*$ml+2*$mr-$bl+$br;$b=-$tl-2*$tc-$tr+$bl+2*$bc+$br;$gx[]=$a;$gy[]=$b;$mag[]=min(255,intdiv(abs($a)+abs($b)+4,8));}$thin=str_repeat("\0",$n);$hist=array_fill(0,256,0);$total=0;for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++){$p=$y*$w+$x;$ax=abs($gx[$p]);$ay=abs($gy[$p]);$dx=$ax>2*$ay?1:($ay>2*$ax?0:1);$dy=$ax>2*$ay?0:($ay>2*$ax?1:($gx[$p]*$gy[$p]>=0?1:-1));$x0=$x-$dx;$y0=$y-$dy;$x1=$x+$dx;$y1=$y+$dy;$v0=$x0<0||$y0<0||$x0>=$w||$y0>=$h?0:$mag[$y0*$w+$x0];$v1=$x1<0||$y1<0||$x1>=$w||$y1>=$h?0:$mag[$y1*$w+$x1];if($mag[$p]>=$v0&&$mag[$p]>$v1){$thin[$p]=chr($mag[$p]);if($mag[$p]>=6){$hist[$mag[$p]]++;$total++;}}}unset($g,$gx,$gy,$mag);$sum=0;for($high=0;$high<255;$high++){$sum+=$hist[$high];if($sum>=$total*[.60,.78,.90,.96][$strength])break;}$high=max(12,$high);$low=max(6,(int)($high*[.5,.65,.8,.9][$strength]));$seen=$ink=str_repeat("\0",$n);for($seed=0;$seed<$n;$seed++){if($seen[$seed]!=="\0"||ord($thin[$seed])<$high)continue;$todo=[$seed];$component=[];$seen[$seed]="\1";while(count($todo)){$p=array_pop($todo);$x=$p%$w;$y=intdiv($p,$w);$component[]=$p;for($dy=-1;$dy<=1;$dy++)for($dx=-1;$dx<=1;$dx++){$xx=$x+$dx;$yy=$y+$dy;$j=$yy*$w+$xx;if($xx>=0&&$yy>=0&&$xx<$w&&$yy<$h&&$seen[$j]==="\0"&&ord($thin[$j])>=$low){$seen[$j]="\1";$todo[]=$j;}}}if(count($component)>=max(8+$strength*8,intdiv($w,48)))foreach($component as $p)$ink[$p]="\1";}return $ink;}

function sk_fraction(string $ink,int $w,int $h,int $sh):float{$ow=$w>=$h?(int)floor($sh*$w/$h+.5):$sh;$oh=$h>$w?(int)floor($sh*$h/$w+.5):$sh;$pitch=$w+1;$s=array_fill(0,($w+1)*($h+1),0);for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++){$p=($y+1)*$pitch+$x+1;$s[$p]=ord($ink[$y*$w+$x])+$s[$p-1]+$s[$p-$pitch]-$s[$p-$pitch-1];}$good=$total=0;for($y=0;$y<intdiv($oh,16);$y++)for($x=(int)ceil($ow/256);$x<intdiv(15*$ow,256);$x++){$x0=max(0,intdiv($x*16*$w,$ow)-1);$x1=min($w,(int)ceil(($x+1)*16*$w/$ow)+1);$y0=max(0,intdiv($y*16*$h,$oh)-1);$y1=min($h,(int)ceil(($y+1)*16*$h/$oh)+1);if($s[$y1*$pitch+$x1]-$s[$y0*$pitch+$x1]-$s[$y1*$pitch+$x0]+$s[$y0*$pitch+$x0]===0)$good++;$total++;}return $good/max(1,$total);}

function sk_prepare(GdImage $cover,int $count):GdImage{$w=imagesx($cover);$h=imagesy($cover);$sh=max(640,(int)sqrt($count*256*min($w,$h)/max($w,$h)/.65));$best=null;$score=-1.;foreach([[1024,0]]as [$size,$strength]){$scale=min(1,$size/max($w,$h));$cw=max(8,(int)floor($w*$scale+.5));$ch=max(8,(int)floor($h*$scale+.5));$im=cf_resize($cover,$cw,$ch);$ink=sk_drawing($im,$strength);$ratio=sk_fraction($ink,$cw,$ch,$sh);for($y=0;$y<$ch;$y++)for($x=0;$x<$cw;$x++)imagesetpixel($im,$x,$y,$ink[$y*$cw+$x]==="\0"?0xffffff:0);if($ratio>$score){$best=$im;$score=$ratio;}if($ratio>=.72)break;}return $best;}

function sk_hit(float $x0,float $y0,float $x1,float $y1,int $w,int $h):bool{$r=4*max(2,(int)floor(min($w,$h)/320+.5))+3;foreach([1/32,31/32]as $yy)foreach([1/8,7/8]as $xx){$cx=$w*$xx;$cy=$h*$yy;if($x0<$cx+$r&&$x1>$cx-$r&&$y0<$cy+$r&&$y1>$cy-$r)return true;}return false;}

function sk_paint(GdImage $out,GdImage $base,string $state):void{$w=imagesx($out);$h=imagesy($out);$gw=intdiv($w+7,8);$gh=intdiv($h+7,8);$g=array_fill(0,$gw*$gh,[0,0,0]);$known=str_repeat("\0",$gw*$gh);$total=0;for($y=0;$y<$gh;$y++)for($x=0;$x<$gw;$x++){$s=[0,0,0];$n=0;for($yy=$y*8;$yy<min($h,$y*8+8);$yy++)for($xx=$x*8;$xx<min($w,$x*8+8);$xx++){if($state[$yy*$w+$xx]!=="\1")continue;$n++;$v=imagecolorat($out,$xx,$yy);$s[0]+=($v>>16)&255;$s[1]+=($v>>8)&255;$s[2]+=$v&255;}if($n){$p=$y*$gw+$x;$known[$p]="\1";$total++;for($c=0;$c<3;$c++)$g[$p][$c]=intdiv($s[$c]+intdiv($n,2),$n);}}if(!$total)$g=array_fill(0,$gw*$gh,[128,128,128]);for($it=0;$total&&$total<strlen($known)&&$it<$gw+$gh;$it++){$next=$known;$nextg=$g;for($y=0;$y<$gh;$y++)for($x=0;$x<$gw;$x++){$p=$y*$gw+$x;if($known[$p]!=="\0")continue;$s=[0,0,0];$n=0;foreach([[1,0],[-1,0],[0,1],[0,-1]]as [$dx,$dy]){$xx=$x+$dx;$yy=$y+$dy;$j=$yy*$gw+$xx;if($xx<0||$yy<0||$xx>=$gw||$yy>=$gh||$known[$j]==="\0")continue;$n++;for($c=0;$c<3;$c++)$s[$c]+=$g[$j][$c];}if($n){$next[$p]="\1";$total++;for($c=0;$c<3;$c++)$nextg[$p][$c]=intdiv($s[$c]+intdiv($n,2),$n);}}$known=$next;$g=$nextg;}for($it=0;$it<3;$it++)for($c=0;$c<3;$c++){$a=[];foreach($g as $v)$a[]=$v[$c];$a=sk_blur($a,$gw,$gh);foreach($a as $p=>$v)$g[$p][$c]=$v;}$guide=cf_new($gw,$gh);for($y=0;$y<$gh;$y++)for($x=0;$x<$gw;$x++)imagesetpixel($guide,$x,$y,cf_color($g[$y*$gw+$x]));$bg=cf_resize($guide,$w,$h);stroke_render($out,$base,$state,$bg);}





function stroke_get(string &$d,int $p):int{$p*=3;return ord($d[$p])|(ord($d[$p+1])<<8)|(ord($d[$p+2])<<16);}

function stroke_set(string &$d,int $p,int $v):void{$p*=3;$d[$p]=chr($v&255);$d[$p+1]=chr(($v>>8)&255);$d[$p+2]=chr($v>>16);}

function stroke_local(string &$s,int $w,int $h,int $x,int $y,int $radius):int{$n=$sx=$sy=$sxx=$syy=$sxy=0;for($dy=-3;$dy<=3;$dy++)for($dx=-3;$dx<=3;$dx++){$xx=$x+$dx;$yy=$y+$dy;if($xx<0||$yy<0||$xx>=$w||$yy>=$h||ord($s[$yy*$w+$xx])<128)continue;$n++;$sx+=$dx;$sy+=$dy;$sxx+=$dx*$dx;$syy+=$dy*$dy;$sxy+=$dx*$dy;}$cx=$n*$sxx-$sx*$sx;$cy=$n*$syy-$sy*$sy;$xy=$n*$sxy-$sx*$sy;$scores=[2*$cx,2*$cy,$cx+$cy+2*$xy,$cx+$cy-2*$xy];$id=0;for($i=1;$i<4;$i++)if($scores[$i]>$scores[$id])$id=$i;[$vx,$vy]=[[0,1],[1,0],[1,-1],[1,1]][$id];$step=$vx&&$vy?23:16;$result=$radius;foreach([-1,1]as $sign){$start=0;for($k=1;$k<=intdiv(2*$radius+80,16);$k++){$xx=$x+$sign*$vx*$k;$yy=$y+$sign*$vy*$k;if($xx<0||$yy<0||$xx>=$w||$yy>=$h)break;$v=ord($s[$yy*$w+$xx]);if(!$start&&$v<16)$start=$k;if($start&&$v>=128&&$k-$start<3)$start=0;if($start&&$v>=128){$result=min($result,max(16,intdiv(($k-$start)*$step-32,2)));break;}}}return $result;}

function stroke_radius_envelope(string &$d,int $w,int $h):void{for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++){$p=$y*$w+$x;$v=stroke_get($d,$p);if($x)$v=min($v,stroke_get($d,$p-1)+16);if($y){$v=min($v,stroke_get($d,$p-$w)+16);if($x)$v=min($v,stroke_get($d,$p-$w-1)+23);if($x+1<$w)$v=min($v,stroke_get($d,$p-$w+1)+23);}stroke_set($d,$p,min(4095,$v));}for($y=$h-1;$y>=0;$y--)for($x=$w-1;$x>=0;$x--){$p=$y*$w+$x;$v=stroke_get($d,$p);if($x+1<$w)$v=min($v,stroke_get($d,$p+1)+16);if($y+1<$h){$v=min($v,stroke_get($d,$p+$w)+16);if($x)$v=min($v,stroke_get($d,$p+$w-1)+23);if($x+1<$w)$v=min($v,stroke_get($d,$p+$w+1)+23);}stroke_set($d,$p,min(4095,$v));}}

function stroke_metrics(GdImage $base):array{$w=imagesx($base);$h=imagesy($base);$n=$w*$h;$radius=max(16,intdiv(min($w,$h)*16+81,162));$halo=min(32,max(16,intdiv(min($w,$h)*16+600,1200)));$s=str_repeat("\0",$n);for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++)$s[$y*$w+$x]=chr(255-((imagecolorat($base,$x,$y)>>16)&255));$B=4096;$cap=4095*$B+$radius;$d=str_repeat("\0",$n*3);for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++){$p=$y*$w+$x;$v=ord($s[$p]);$r=$v?stroke_local($s,$w,$h,$x,$y,$radius):$radius;stroke_set($d,$p,$v?$r:4095);}stroke_radius_envelope($d,$w,$h);for($p=0;$p<$n;$p++){$v=ord($s[$p]);stroke_set($d,$p,($v?intdiv((255-$v)*16+127,255):4095)*$B+($v?stroke_get($d,$p):$radius));}unset($s);for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++){$p=$y*$w+$x;$v=stroke_get($d,$p);if($x)$v=min($v,stroke_get($d,$p-1)+16*$B);if($y){$v=min($v,stroke_get($d,$p-$w)+16*$B);if($x)$v=min($v,stroke_get($d,$p-$w-1)+23*$B);if($x+1<$w)$v=min($v,stroke_get($d,$p-$w+1)+23*$B);}stroke_set($d,$p,min($cap,$v));}for($y=$h-1;$y>=0;$y--)for($x=$w-1;$x>=0;$x--){$p=$y*$w+$x;$v=stroke_get($d,$p);if($x+1<$w)$v=min($v,stroke_get($d,$p+1)+16*$B);if($y+1<$h){$v=min($v,stroke_get($d,$p+$w)+16*$B);if($x)$v=min($v,stroke_get($d,$p+$w-1)+23*$B);if($x+1<$w)$v=min($v,stroke_get($d,$p+$w+1)+23*$B);}stroke_set($d,$p,min($cap,$v));}return[$d,$radius,$halo];}

function stroke_reservation(GdImage $base):string{[$d,$radius]=stroke_metrics($base);$n=imagesx($base)*imagesy($base);$out=str_repeat("\0",$n);for($p=0;$p<$n;$p++)if(intdiv(stroke_get($d,$p),4096)<=stroke_get($d,$p)%4096)$out[$p]="\1";return $out;}

function stroke_accent(GdImage $out,GdImage $bg,string $state,string &$d,int $radius):array{$w=imagesx($out);$h=imagesy($out);$step=max(1,intdiv(min($w,$h)+127,128));$samples=[];for($y=0;$y<$h;$y+=$step)for($x=0;$x<$w;$x+=$step){$p=$y*$w+$x;if(intdiv(stroke_get($d,$p),4096)>=stroke_get($d,$p)%4096+16)continue;$samples[]=cf_rgb(imagecolorat($state[$p]==="\0"?$bg:$out,$x,$y));}if(!$samples)for($y=0;$y<$h;$y+=$step)for($x=0;$x<$w;$x+=$step)$samples[]=cf_rgb(imagecolorat($bg,$x,$y));$palette=[[248,240,16],[248,168,16],[248,88,24],[248,40,64],[240,24,208],[168,48,248],[48,96,248],[16,224,248],[128,240,24],[244,244,244],[12,12,12],[16,32,88],[112,16,104],[12,72,32]];$score=PHP_INT_MIN;$best=$palette[0];$ns=count($samples);foreach($palette as $c){$cy=intdiv($c[0]*19595+$c[1]*38470+$c[2]*7471+32768,65536);$hist=array_fill(0,2048,0);$sum=$near=0;foreach($samples as $b){$by=intdiv($b[0]*19595+$b[1]*38470+$b[2]*7471+32768,65536);$v=4*abs($cy-$by)+abs($c[0]-$c[1]-$b[0]+$b[1])+intdiv(abs(2*$c[2]-$c[0]-$c[1]-2*$b[2]+$b[0]+$b[1]),2);$hist[$v]++;$sum+=$v;if($v<200)$near++;}$rank=max(1,intdiv($ns+4,5));$n=0;for($q=0;$q<2048;$q++){$n+=$hist[$q];if($n>=$rank)break;}$value=4*$q+2*intdiv($sum,$ns)+max($c)-min($c)-intdiv($near*1000,$ns);if($value>$score){$score=$value;$best=$c;}}return $best;}

function stroke_render(GdImage $out,GdImage $base,string $state,GdImage $bg):void{[$d,$radius,$halo]=stroke_metrics($base);$fg=stroke_accent($out,$bg,$state,$d,$radius);$lum=intdiv($fg[0]*19595+$fg[1]*38470+$fg[2]*7471+32768,65536);$border=$lum>=128?12:244;$w=imagesx($out);$h=imagesy($out);for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++){$p=$y*$w+$x;if($state[$p]!=="\0")continue;$key=stroke_get($d,$p);$v=intdiv($key,4096);$r=$key%4096;$hh=min($halo,max(8,intdiv($r,4)));$a=intdiv(max(0,min(16,$r-$hh+16-$v))*255+8,16);$b=intdiv(max(0,min(16,$r+16-$v))*255+8,16);$col=cf_rgb(imagecolorat($bg,$x,$y));for($c=0;$c<3;$c++){$ring=intdiv($col[$c]*(255-$b)+$border*$b+127,255);$col[$c]=intdiv($ring*(255-$a)+$fg[$c]*$a+127,255);}imagesetpixel($out,$x,$y,cf_color($col));}}





function fr_draw(GdImage $out):void{$w=imagesx($out);$h=imagesy($out);$u=max(2,(int)floor(min($w,$h)/320+.5));foreach([1/32,31/32]as $yy)foreach([1/8,7/8]as $xx){$cx=$w*$xx;$cy=$h*$yy;$r=4*$u;for($y=max(0,(int)floor($cy-$r-1));$y<min($h,(int)floor($cy+$r+2));$y++)for($x=max(0,(int)floor($cx-$r-1));$x<min($w,(int)floor($cx+$r+2));$x++){$d=($x+.5-$cx)**2+($y+.5-$cy)**2;$v=$d<=$u*$u?12:($d<=4*$u*$u?255:($d<=9*$u*$u?12:($d<=16*$u*$u?255:-1)));if($v>=0)imagesetpixel($out,$x,$y,$v*65793);}}}

function fr_dark(string $g,int $w,int $x,int $y):bool{return ord($g[$y*$w+$x])<128;}

function fr_ratios(array $rr,float $u):bool{for($j=0;$j<5;$j++)if(abs($rr[$j]-$u*($j===2?2:1))>$u*.7)return false;return true;}

function fr_locate(array $received):array{$im=$received[0];$w=imagesx($im);$h=imagesy($im);$g=str_repeat("\0",$w*$h);for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++)$g[$y*$w+$x]=chr(sk_lum(imagecolorat($im,$x,$y)));$found=[];for($y=1;$y<$h-1&&count($found)<64;$y++){$starts=[0];$ends=[];$prev=fr_dark($g,$w,0,$y);for($x=1;$x<$w;$x++){$v=fr_dark($g,$w,$x,$y);if($v!==$prev){$ends[]=$x;$starts[]=$x;$prev=$v;}}$ends[]=$w;for($k=2;$k<count($starts)-2;$k++){if(!fr_dark($g,$w,$starts[$k],$y))continue;$rr=[];for($j=-2;$j<=2;$j++)$rr[]=$ends[$k+$j]-$starts[$k+$j];$u=array_sum($rr)/6;if($u<1||$u>max($w,$h)/40||!fr_ratios($rr,$u))continue;$cx=($starts[$k]+$ends[$k])/2;$x=min($w-1,(int)$cx);$near=false;foreach($found as $f)if(($cx-$f[0])**2+($y+.5-$f[1])**2<=(2*$f[2])**2){$near=true;break;}if($near)continue;$top=$y;$bottom=$y+1;while($top>0&&fr_dark($g,$w,$x,$top-1))$top--;while($bottom<$h&&fr_dark($g,$w,$x,$bottom))$bottom++;$up=$top-1;while($up>=0&&!fr_dark($g,$w,$x,$up))$up--;$up2=$up;while($up2>=0&&fr_dark($g,$w,$x,$up2))$up2--;$down=$bottom;while($down<$h&&!fr_dark($g,$w,$x,$down))$down++;$down2=$down;while($down2<$h&&fr_dark($g,$w,$x,$down2))$down2++;$vr=[$up-$up2,$top-1-$up,$bottom-$top,$down-$bottom,$down2-$down];$v=array_sum($vr)/6;if(abs($v/$u-1)>.35||!fr_ratios($vr,$v))continue;$cy=($top+$bottom)/2;$u=($u+$v)/2;$r=3.6*$u;$x0=max(0,(int)floor($cx-$r));$x1=min($w,(int)ceil($cx+$r));$y0=max(0,(int)floor($cy-$r));$y1=min($h,(int)ceil($cy+$r));$sum=$sx=$sy=0.;for($yy=$y0;$yy<$y1;$yy++)for($xx=$x0;$xx<$x1;$xx++){if(($xx+.5-$cx)**2+($yy+.5-$cy)**2>$r*$r)continue;$wt=max(0,200-ord($g[$yy*$w+$xx]));$sum+=$wt;$sx+=($xx+.5)*$wt;$sy+=($yy+.5)*$wt;}if(!$sum)continue;$cx=$sx/$sum;$cy=$sy/$sum;$s=$n=[0,0,0,0];$ranges=[[0,.8],[1.2,1.8],[2.2,2.8],[3.2,3.7]];for($yy=$y0;$yy<$y1;$yy++)for($xx=$x0;$xx<$x1;$xx++){$rad=hypot($xx+.5-$cx,$yy+.5-$cy)/$u;for($j=0;$j<4;$j++)if($rad>=$ranges[$j][0]&&$rad<=$ranges[$j][1]){$s[$j]+=ord($g[$yy*$w+$xx]);$n[$j]++;}}$means=[];for($j=0;$j<4;$j++)$means[]=$n[$j]?$s[$j]/$n[$j]:128;if(min($means[1]-$means[0],$means[1]-$means[2],$means[3]-$means[2])<65)continue;$found[]=[$cx,$cy,$u];if(count($found)>=64)break;}}

$best=null;foreach($found as $a)foreach($found as $b){$span=$b[0]-$a[0];if($span<128||abs($b[1]-$a[1])>max(2,$span*.004)||abs($b[2]/$a[2]-1)>.25)continue;foreach($found as $c){$tall=$c[1]-$a[1];if($tall<128||abs($c[0]-$a[0])>max(2,$tall*.004)||abs($c[2]/$a[2]-1)>.25)continue;foreach($found as $d){if(abs($d[0]-$b[0])>max(2,$tall*.004)||abs($d[1]-$c[1])>max(2,$span*.004)||abs($d[2]/$a[2]-1)>.25)continue;$ww=(($b[0]+$d[0])-($a[0]+$c[0]))/1.5;$hh=(($c[1]+$d[1])-($a[1]+$b[1]))/1.875;$left=($a[0]+$c[0])/2-$ww/8;$top=($a[1]+$b[1])/2-$hh/32;if($left<-.8||$top<-.8||$left+$ww>$w+.8||$top+$hh>$h+.8)continue;if($best===null||$ww*$hh>$best[0])$best=[$ww*$hh,$left,$top,$ww,$hh];}}}if($best===null)return $received;$x=max(0,(int)floor($best[1]+.5));$y=max(0,(int)floor($best[2]+.5));$x1=min($w,(int)floor($best[1]+$best[3]+.5));$y1=min($h,(int)floor($best[2]+$best[4]+.5));if($x===0&&$y===0&&$x1===$w&&$y1===$h)return $received;$out=cf_new($x1-$x,$y1-$y);imagecopy($out,$im,0,0,$x,$y,$x1-$x,$y1-$y);try{[$meta,$_]=cf_header($out);if(imagesx($out)>$meta['ow']||imagesy($out)>$meta['oh'])$out=cf_resize($out,$meta['ow'],$meta['oh']);return[$out,null];}catch(Throwable){return $received;}}





/** Exact shortcut for the full padded Gilbert mapping, including orientation. */

final class CF11Geometry {

 static array $cache=[];

 static function frames(int $w,int $h):array{

  $name=$w.','.$h;if(isset(self::$cache[$name]))return self::$cache[$name];$out=[];

  $gen=function(int $x,int $y,int $ax,int $ay,int $bx,int $by)use(&$gen,&$out):void{$w=abs($ax+$ay);$h=abs($bx+$by);$dax=$ax<=>0;$day=$ay<=>0;$dbx=$bx<=>0;$dby=$by<=>0;if($w===16&&$h===16){$out[]=[$x,$y,$dax,$day,$dbx,$dby];return;}$ax2=(int)floor($ax/2);$ay2=(int)floor($ay/2);$bx2=(int)floor($bx/2);$by2=(int)floor($by/2);$w2=abs($ax2+$ay2);$h2=abs($bx2+$by2);if(2*$w>3*$h){if($w2%2&&$w>2){$ax2+=$dax;$ay2+=$day;}$gen($x,$y,$ax2,$ay2,$bx,$by);$gen($x+$ax2,$y+$ay2,$ax-$ax2,$ay-$ay2,$bx,$by);}else{if($h2%2&&$h>2){$bx2+=$dbx;$by2+=$dby;}$gen($x,$y,$bx2,$by2,$ax2,$ay2);$gen($x+$bx2,$y+$by2,$ax,$ay,$bx-$bx2,$by-$by2);$gen($x+$ax-$dax+$bx2-$dbx,$y+$ay-$day+$by2-$dby,-$bx2,-$by2,-($ax-$ax2),-($ay-$ay2));}};

  if($w>=$h)$gen(0,0,$w,0,0,$h);else $gen(0,0,0,$h,$w,0);return self::$cache[$name]=$out;

 }

 static function inverse(int $w,int $h):array{$frames=self::frames($w,$h);$n=count($frames);$offset=intdiv(cf_phase($w*$h),256);$map=[];for($i=0;$i<$n;$i++){$o=$frames[$i];$s=$frames[($i+$offset)%$n];$a=$o[2]*$s[2]+$o[4]*$s[4];$b=$o[2]*$s[3]+$o[4]*$s[5];$c=$o[3]*$s[2]+$o[5]*$s[4];$d=$o[3]*$s[3]+$o[5]*$s[5];$sx=intdiv($s[0],16)*16;$sy=intdiv($s[1],16)*16;$x=$o[0]+$a*($sx-$s[0])+$b*($sy-$s[1]);$y=$o[1]+$c*($sx-$s[0])+$d*($sy-$s[1]);$map[intdiv($sy,16)*intdiv($w,16)+intdiv($sx,16)]=[$x,$y,$a,$c,$b,$d];}ksort($map);return $map;}

 static function transform(array $source,bool $inverse=false,int $iw=0,int $ih=0):array{

  [$in,$alpha]=$source;$w=imagesx($in);$h=imagesy($in);

  if(!$inverse){$pw=cf_power2($w);$ph=cf_power2($h);if($pw*$ph>48000000)throw new RuntimeException('Padded image exceeds 48 MP');$pad=cf_new($pw,$ph);imagefill($pad,0,0,0xffffff);$pa=str_repeat(chr(255),$pw*$ph);$transparent=false;$ew=(int)ceil($w/16)*16;$eh=(int)ceil($h/16)*16;for($y=0;$y<$eh;$y++)for($x=0;$x<$ew;$x++){$sx=min($w-1,$x);$sy=min($h-1,$y);imagesetpixel($pad,$x,$y,imagecolorat($in,$sx,$sy)&0xffffff);$a=pm_alpha($in,$alpha,$sx,$sy);$pa[$y*$pw+$x]=chr($a);if($a!==255)$transparent=true;}$in=$pad;$alpha=$transparent?$pa:null;$w=$pw;$h=$ph;}

  $out=cf_new($w,$h);$oa=$alpha===null?null:str_repeat("\0",$w*$h);$frames=self::frames($w,$h);$n=count($frames);$offset=intdiv(cf_phase($w*$h),256);

  for($i=0;$i<$n;$i++){$from=$frames[$i];$to=$frames[($i+$offset)%$n];if($inverse)[$from,$to]=[$to,$from];$sx=intdiv($from[0],16)*16;$sy=intdiv($from[1],16)*16;$dx=intdiv($to[0],16)*16;$dy=intdiv($to[1],16)*16;$a=$to[2]*$from[2]+$to[4]*$from[4];$b=$to[2]*$from[3]+$to[4]*$from[5];$c=$to[3]*$from[2]+$to[5]*$from[4];$d=$to[3]*$from[3]+$to[5]*$from[5];

   if($a===1&&$d===1)imagecopy($out,$in,$dx,$dy,$sx,$sy,16,16);else{$tile=cf_new(16,16);imagecopy($tile,$in,0,0,$sx,$sy,16,16);if($a===0){$tile=imagerotate($tile,90,0);if($b<0)imageflip($tile,IMG_FLIP_HORIZONTAL);if($c>0)imageflip($tile,IMG_FLIP_VERTICAL);}else{if($a<0)imageflip($tile,IMG_FLIP_HORIZONTAL);if($d<0)imageflip($tile,IMG_FLIP_VERTICAL);}imagecopy($out,$tile,$dx,$dy,0,0,16,16);}

   if($oa!==null){$ox=($a<0||$b<0)?15:0;$oy=($c<0||$d<0)?15:0;for($v=0;$v<16;$v++)for($u=0;$u<16;$u++)$oa[($dy+$c*$u+$d*$v+$oy)*$w+$dx+$a*$u+$b*$v+$ox]=$alpha[($sy+$v)*$w+$sx+$u];}

  }

  if(!$inverse)return[$out,$oa];$crop=cf_new($iw,$ih);imagecopy($crop,$out,0,0,0,0,$iw,$ih);$ca=null;if($oa!==null){$ca='';for($y=0;$y<$ih;$y++)$ca.=substr($oa,$y*$w,$iw);}return[$crop,$ca];

 }

}



class CFInvalidFormat extends RuntimeException{}

function cf_mac(string $k,string $d):string{return hash_hmac('sha256',$d,$k,true);}

function cf_stream(string $key,string $domain):Closure{$counter=0;$buf='';$pos=0;return function(int $n)use($key,$domain,&$counter,&$buf,&$pos):int{$limit=intdiv(4294967296,$n)*$n;while(true){if($pos>=strlen($buf)){$buf=cf_mac($key,$domain.pack('N',$counter++));$pos=0;}$v=unpack('N',substr($buf,$pos,4))[1];$pos+=4;if($v<$limit)return $v%$n;}};}

function cf_rgb(int $v):array{return[($v>>16)&255,($v>>8)&255,$v&255];}

function cf_color(array $c):int{return($c[0]<<16)|($c[1]<<8)|$c[2];}

function cf_new(int $w,int $h):GdImage{if(min($w,$h)<1||$w*$h>48000000)throw new RuntimeException('Image exceeds 48 MP');return imagecreatetruecolor($w,$h);}



function cf_linear_axis(int $original,int $output):array{$a=[];$b=[];$f=[];$den=2*$output;for($i=0;$i<$output;$i++){$t=(2*$i+1)*$original-$output;$base=(int)floor($t/$den);$rem=$t-$base*$den;$a[]=max(0,min($original-1,$base));$b[]=max(0,min($original-1,$base+1));$f[]=intdiv($rem*16384+$output,$den);}return[$a,$b,$f];}

function cf_resize(GdImage $im,int $w,int $h):GdImage{$out=cf_new($w,$h);[$xa,$xb,$xf]=cf_linear_axis(imagesx($im),$w);[$ya,$yb,$yf]=cf_linear_axis(imagesy($im),$h);for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++){$vs=[imagecolorat($im,$xa[$x],$ya[$y]),imagecolorat($im,$xb[$x],$ya[$y]),imagecolorat($im,$xa[$x],$yb[$y]),imagecolorat($im,$xb[$x],$yb[$y])];$rgb=0;$fx=$xf[$x];$fy=$yf[$y];foreach([16,8,0]as $shift){$top=(($vs[0]>>$shift)&255)*(16384-$fx)+(($vs[1]>>$shift)&255)*$fx;$bottom=(($vs[2]>>$shift)&255)*(16384-$fx)+(($vs[3]>>$shift)&255)*$fx;$rgb|=intdiv($top*(16384-$fy)+$bottom*$fy+134217728,268435456)<<$shift;}imagesetpixel($out,$x,$y,$rgb);}return $out;}

function cf_flat(array $image):GdImage{[$im,$alpha]=$image;$w=imagesx($im);$h=imagesy($im);$out=cf_new($w,$h);for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++){$a=pm_alpha($im,$alpha,$x,$y)/255;$rgb=cf_rgb(imagecolorat($im,$x,$y));imagesetpixel($out,$x,$y,cf_color(array_map(fn($v)=>pm_clip($v*$a+255*(1-$a)),$rgb)));}return $out;}

function cf_gcd(int $a,int $b):int{while($b){$t=$a%$b;$a=$b;$b=$t;}return $a;}

function cf_norm(int $w,int $h,bool $old=false,int $revision=14):array{$s=($old?640:($revision===13?832:1088))/min($w,$h);$a=max(8,(int)floor($w*$s/8+.5)*8);$b=max(8,(int)floor($h*$s/8+.5)*8);if($a*$b>48000000)throw new RuntimeException('Extreme aspect ratio');return[$a,$b];}

function cf_pilots(int $w,int $h,bool $old=false,int $revision=14):array{$a=[];for($i=0;$i<16;$i++)$a[]=[max(2,(int)(($old?($i%2===0?.055:.945):($revision===13?($i%2===0?.03:.97):($i%2===0?.014:.986)))*$w/8)),min(intdiv($h,8)-3,max(2,(int)(($i+1)*$h/17/8)))];return $a;}

function cf_means(GdImage $im,bool $old=false,int $revision=14):array{$a=[];foreach(cf_pilots(imagesx($im),imagesy($im),$old,$revision)as[$x,$y]){$sum=[0.,0.,0.];for($dy=0;$dy<8;$dy++)for($dx=0;$dx<8;$dx++){$v=cf_rgb(imagecolorat($im,$x*8+$dx,$y*8+$dy));for($c=0;$c<3;$c++)$sum[$c]+=$v[$c]/64;}$a[]=$sum;}return $a;}

function cf_locations(int $w,int $h,bool $old=false,int $revision=14):array{$skip=[];foreach(cf_pilots($w,$h,$old,$revision)as[$x,$y])for($dy=-1;$dy<=1;$dy++)for($dx=-1;$dx<=1;$dx++)$skip[($y+$dy)*intdiv($w,8)+$x+$dx]=true;$loc=[];for($y=0;$y<intdiv($h,8);$y++)for($x=0;$x<intdiv($w,8);$x++)if(($x<(int)(($old?.12:($revision===13?.06:.031))*$w/8)||$x>=(int)ceil(($old?.88:($revision===13?.94:.969))*$w/8))&&!isset($skip[$y*intdiv($w,8)+$x]))$loc[]=[$x*8,$y*8];$stride=997;while(cf_gcd($stride,count($loc))!==1)$stride+=2;return[$loc,$stride];}

function cf_canonical(array $meta):string{ksort($meta,SORT_STRING);return json_encode($meta,JSON_UNESCAPED_SLASHES|JSON_THROW_ON_ERROR);}

function cf_float_sample(string $a,int $w,int $h,float $x,float $y):float{$x=max(0,min($w-1,$x));$y=max(0,min($h-1,$y));$x0=(int)$x;$y0=(int)$y;$x1=min($w-1,$x0+1);$y1=min($h-1,$y0+1);$fx=$x-$x0;$fy=$y-$y0;$v=[];foreach([$y0*$w+$x0,$y0*$w+$x1,$y1*$w+$x0,$y1*$w+$x1]as $p)$v[]=unpack('g',$a,$p*4)[1];return($v[0]*(1-$fx)+$v[1]*$fx)*(1-$fy)+($v[2]*(1-$fx)+$v[3]*$fx)*$fy;}

function cf_crc_image(array $image):int{[$im,$alpha]=$image;$ctx=hash_init('crc32b');$w=imagesx($im);$h=imagesy($im);for($y=0;$y<$h;$y++){$row='';for($x=0;$x<$w;$x++)$row.=pack('CCCC',...array_merge(cf_rgb(imagecolorat($im,$x,$y)),[pm_alpha($im,$alpha,$x,$y)]));hash_update($ctx,$row);}return (int)hexdec(hash_final($ctx));}

function cf_inflate_map(string $data,int $size):string{$out=gzuncompress($data,$size+1);if($out===false||strlen($out)!==$size)throw new RuntimeException('Invalid compressed map');return $out;}

function cf_map_cipher(string $data,string $key):string{$out=$data;for($p=0;$p<strlen($out);$p+=32){$b=cf_mac($key,"source-map\0".pack('N',intdiv($p,32)));for($j=0;$j<min(32,strlen($out)-$p);$j++)$out[$p+$j]=chr(ord($out[$p+$j])^ord($b[$j]));}return $out;}

function cf_source_map(array $image):array{[$im,$alpha]=$image;$w=imagesx($im);$h=imagesy($im);$nx=(int)ceil($w/16);$ny=(int)ceil($h/16);$count=$nx*$ny;$values=[];$colors=[];for($t=0;$t<$count;$t++){$x=$t%$nx*16;$y=intdiv($t,$nx)*16;$v=((imagecolorat($im,$x,$y)&0xffffff)<<8)|pm_alpha($im,$alpha,$x,$y);$same=true;for($yy=$y;$yy<min($y+16,$h)&&$same;$yy++)for($xx=$x;$xx<min($x+16,$w);$xx++)if((((imagecolorat($im,$xx,$yy)&0xffffff)<<8)|pm_alpha($im,$alpha,$xx,$yy))!==$v){$same=false;break;}$values[]=$same?$v:-1;if($same)$colors[$v]=($colors[$v]??0)+1;}$bg=255;$best=-1;foreach($colors as $v=>$n)if($n>$best||($n===$best&&$v<$bg)){$bg=$v;$best=$n;}$mask=str_repeat("\0",(int)ceil($count/8));$k=0;foreach($values as $t=>$v)if($best<0||$v!==$bg){$mask[intdiv($t,8)]=chr(ord($mask[intdiv($t,8)])|(1<<(7-$t%8)));$k++;}$blob='';if($k*4<=$count*3)$blob=gzcompress($mask.pack('N',$bg),9);else{$mask=str_repeat("\xff",(int)ceil($count/8));$k=$count;}return compact('mask','k','blob','bg');}

function cf_open_map(array $m,string $key):array{$count=(int)ceil($m['w']/16)*(int)ceil($m['h']/16);if(!$m['u']){$mask=cf_padding_mask($m['w'],$m['h'],$m['iw'],$m['ih']);if(cf_bitcount($mask)!==$m['k'])throw new RuntimeException('Padded source count');return['mask'=>$mask,'bg'=>4294967295];}$raw=cf_inflate_map(cf_map_cipher(base64_decode($m['sm']),$key),(int)ceil($count/8)+4);$mask=substr($raw,0,-4);$k=0;for($t=0;$t<$count;$t++)if(ord($mask[intdiv($t,8)])&(1<<(7-$t%8)))$k++;if($k!==$m['k'])throw new RuntimeException('Invalid source count');return['mask'=>$mask,'bg'=>unpack('N',substr($raw,-4))[1]];}





function cf_derive(string $password,string $salt):string{if(strlen($password)>16384||!preg_match('//u',$password))throw new RuntimeException('Key must be UTF-8, at most 16384 bytes');return hash_pbkdf2('sha256',$password,pack('C*',67,111,110,116,111,117,114,70,105,108,108,45,118,49,49,0).$salt,300000,32,true);}

function cf_patterns():array{static $cache=null;if($cache!==null)return $cache;$pairs=[[[0,1],[1,0]],[[0,2],[2,0]],[[1,2],[2,1]],[[0,3],[3,0]],[[1,1],[2,2]],[[1,3],[3,1]]];$basis=fn($u,$x)=>$u===0?sqrt(1/8):.5*cos((2*$x+1)*$u*M_PI/16);$cache=[];foreach($pairs as[$a,$b]){$p=[];for($y=0;$y<8;$y++)for($x=0;$x<8;$x++)$p[]=$basis($a[0],$y)*$basis($a[1],$x)-$basis($b[0],$y)*$basis($b[1],$x);$cache[]=$p;}return $cache;}

function cf_coeff_k(GdImage $im,int $x,int $y,array $pat):float{$sum=0.;for($dy=0;$dy<8;$dy++)for($dx=0;$dx<8;$dx++){[$r,$g,$b]=cf_rgb(imagecolorat($im,$x+$dx,$y+$dy));$sum+=(.299*$r+.587*$g+.114*$b)*$pat[$dy*8+$dx];}return $sum;}

function cf_bits(array $diff,int $count,int $mode):array{$n=count($diff);$out=[];for($i=0;$i<$count;$i++)$out[]=(int)(($mode===0?$diff[$i]+$diff[$n-1-$i]:($mode===1?$diff[$i]:$diff[$n-1-$i]))>0);return $out;}

function cf_header(GdImage $image):array{foreach([14,13,12]as $revision){$old=$revision<13;[$vw,$vh]=cf_norm(imagesx($image),imagesy($image),$old,$revision);$patterns=cf_patterns();foreach([[0,0],[-8,0],[8,0],[0,-8],[0,8],[-8,-8],[8,8],[-8,8],[8,-8]]as[$dx,$dy]){$w=$vw+$dx;$h=$vh+$dy;if(min($w,$h)<8)continue;$small=cf_resize($image,$w,$h);[$loc,$stride]=cf_locations($w,$h,$old,$revision);$n=count($loc);$diff=[];foreach($patterns as $pat)for($i=0;$i<$n;$i++){[$x,$y]=$loc[$i*$stride%$n];$diff[]=cf_coeff_k($small,$x,$y,$pat);}$diff=$old?$diff:cf_interleave($diff,$n);foreach([0,1,2]as $mode){try{$prefix=CFR_ECC::decode(cf_bits($diff,189,$mode));}catch(RuntimeException){continue;}if($old&&in_array(substr($prefix,0,4),['CFR4','CFR5','CFR6','CFR7','CFR9','CFT1'],true))throw new CFInvalidFormat();if(substr($prefix,0,4)!=='CFT2')continue;$head=unpack('nlength/Ncrc',substr($prefix,4,6));$count=(int)ceil(($head['length']+10)*8/36)*63;if($head['length']<62||$head['length']>1536||$count>count($diff))continue;try{$blob=CFR_ECC::decode(cf_bits($diff,$count,$mode));}catch(RuntimeException){continue;}$data=substr($blob,10,$head['length']);if(crc32($data)===$head['crc']){$meta=cf_unpack_meta($data);if(($meta['d']<13)===$old&&($old||$meta['d']===$revision||$revision===14&&$meta['d']>=15))return[$meta,$small];}}}}throw new RuntimeException('CFT2 parameters missing or compression exceeds recovery limit');}

function cf_write_header(GdImage $out,array $m):void{$data=cf_pack_meta($m);$bits=CFR_ECC::encode('CFT2'.pack('nN',strlen($data),crc32($data)).$data);[$vw,$vh]=cf_norm(imagesx($out),imagesy($out));[$loc,$stride]=cf_locations($vw,$vh);$n=count($loc);$capacity=$n*6;if(count($bits)>$capacity)throw new RuntimeException('Repeated header capacity');$patterns=cf_patterns();$w=imagesx($out);$h=imagesy($out);for($attempt=0;$attempt<8;$attempt++){$small=cf_resize($out,$vw,$vh);$delta=str_repeat("\0",$vw*$vh*4);foreach(count($bits)*2<=$capacity?[0,1]:[0]as $side)foreach($bits as $i=>$bit){$mix=$n+1;while(cf_gcd($mix,$capacity)!==1)$mix++;$j=(($side===0?$i:$capacity-1-$i)*$mix)%$capacity;$k=intdiv($j,$n);[$x,$y]=$loc[($j%$n)*$stride%$n];$pat=$patterns[$k];$diff=cf_coeff_k($small,$x,$y,$pat);$target=($bit?1:-1)*max(320*max(1,min(2,1088/min($w,$h))),abs($diff));for($dy=0;$dy<8;$dy++)for($dx=0;$dx<8;$dx++){$p=(($y+$dy)*$vw+$x+$dx)*4;$f=pack('g',unpack('g',$delta,$p)[1]+($target-$diff)*$pat[$dy*8+$dx]/2);for($b=0;$b<4;$b++)$delta[$p+$b]=$f[$b];}}for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++){if($x>$w*.032&&$x<$w*.968)continue;$d=cf_float_sample($delta,$vw,$vh,($x+.5)*$vw/$w-.5,($y+.5)*$vh/$h-.5);$rgb=cf_rgb(imagecolorat($out,$x,$y));imagesetpixel($out,$x,$y,cf_color(array_map(fn($v)=>pm_clip($v+$d),$rgb)));}try{[$check,$_]=cf_header($out);if(cf_canonical($check)===cf_canonical($m)&&$attempt>=1)return;}catch(RuntimeException){}}throw new RuntimeException('Cannot reliably save parameters in cover');}

function cf_base_layout(GdImage $cover,int $w,int $h,bool $alpha,int $guide,int $count):array{$cw=imagesx($cover);$ch=imagesy($cover);$div=cf_gcd($cw,$ch);$aw=intdiv($cw,$div);$ah=intdiv($ch,$div);$c=$cw>=$ch?$guide:max(4,(int)floor($guide*$cw/$ch+.5));$r=$ch>=$cw?$guide:max(4,(int)floor($guide*$ch/$cw+.5));$pw=min($cw,1024);$ph=max(1,(int)floor($ch*$pw/$cw+.5));$prev=cf_resize($cover,$pw,$ph);$reserved=stroke_reservation($prev);$gray=[];for($y=0;$y<$ph;$y++)for($x=0;$x<$pw;$x++){[$rr,$gg,$bb]=cf_rgb(imagecolorat($prev,$x,$y));$gray[]=.299*$rr+.587*$gg+.114*$bb;}$edge=[];for($y=0;$y<$ph;$y++)for($x=0;$x<$pw;$x++){$l=max(0,$x-1);$rr=min($pw-1,$x+1);$t=max(0,$y-1);$b=min($ph-1,$y+1);$gx=-$gray[$t*$pw+$l]+$gray[$t*$pw+$rr]-2*$gray[$y*$pw+$l]+2*$gray[$y*$pw+$rr]-$gray[$b*$pw+$l]+$gray[$b*$pw+$rr];$gy=-$gray[$t*$pw+$l]-2*$gray[$t*$pw+$x]-$gray[$t*$pw+$rr]+$gray[$b*$pw+$l]+2*$gray[$b*$pw+$x]+$gray[$b*$pw+$rr];$edge[]=ord($reserved[$y*$pw+$x])?1024.:0.;}unset($gray);if($guide===0)return cf_native_layout($edge,$pw,$ph,$cw,$ch,$w,$h,$alpha,$count);$mask=str_repeat("\0",(int)ceil($c*$r/8));$cells=[];for($row=0;$row<$r;$row++)for($col=0;$col<$c;$col++){if(($col+1)/$c<=.03125||$col/$c>=.96875)continue;$sum=0.;$strong=0;$n=0;for($y=max(0,(int)floor($row*$ph/$r)-1);$y<min($ph,(int)ceil(($row+1)*$ph/$r)+1);$y++)for($x=max(0,(int)floor($col*$pw/$c)-1);$x<min($pw,(int)ceil(($col+1)*$pw/$c)+1);$x++){$v=$edge[$y*$pw+$x];$sum+=$v;$strong+=(int)($v>48);$n++;}if($sum==0&&!sk_hit($col*$cw/$c,$row*$ch/$r,($col+1)*$cw/$c,($row+1)*$ch/$r,$cw,$ch)){$i=$row*$c+$col;$mask[intdiv($i,8)]=chr(ord($mask[intdiv($i,8)])|(1<<(7-$i%8)));$cells[]=[$row,$col];}}if(!count($cells))throw new RuntimeException('Cover has no low-contour regions');$need=$count*256*($alpha?2:1);$fraction=count($cells)/($c*$r);$k=(int)ceil(max(sqrt($need/$fraction/(max($cw,$ch)/min($cw,$ch))),1088));for(;;$k++){$ow=$cw>=$ch?(int)floor($k*$cw/$ch+.5):$k;$oh=$ch>$cw?(int)floor($k*$ch/$cw+.5):$k;$nx=intdiv($ow,16);$ny=intdiv($oh,16);if($ow*$oh>48000000)throw new RuntimeException('Cover capacity exceeds 48 MP');$capacity=0;foreach($cells as[$row,$col])$capacity+=max(0,min(intdiv(($col+1)*$nx,$c),intdiv(31*$ow,512))-max(intdiv($col*$nx,$c),(int)ceil($ow/512)))*(intdiv(($row+1)*$ny,$r)-intdiv($row*$ny,$r));if($capacity*256>=$need)return compact('w','h','ow','oh','c','r')+['b'=>1,'d'=>15,'z'=>0,'a'=>$alpha,'mask'=>base64_encode($mask)];}}



function cf_uget(string $s,int $i):int{return unpack('V',$s,$i*4)[1];}

function cf_uset(string &$s,int $i,int $v):void{$a=pack('V',$v);$i*=4;for($j=0;$j<4;$j++)$s[$i+$j]=$a[$j];}

/** Packed Gilbert traversal, adapted from pic-scramble (MIT); see licenses. */

function cf_curve(int $w,int $h):string{$out=str_repeat("\0",$w*$h*4);$i=0;if($w>=$h)cf_generate(0,0,$w,0,0,$h,$w,$out,$i);else cf_generate(0,0,0,$h,$w,0,$w,$out,$i);return $out;}

function cf_generate(int $x,int $y,int $ax,int $ay,int $bx,int $by,int $width,string &$out,int &$idx):void{$w=abs($ax+$ay);$h=abs($bx+$by);$dax=$ax<=>0;$day=$ay<=>0;$dbx=$bx<=>0;$dby=$by<=>0;if($h===1){for($i=0;$i<$w;$i++)cf_uset($out,$idx++,($y+$day*$i)*$width+$x+$dax*$i);return;}if($w===1){for($i=0;$i<$h;$i++)cf_uset($out,$idx++,($y+$dby*$i)*$width+$x+$dbx*$i);return;}$ax2=(int)floor($ax/2);$ay2=(int)floor($ay/2);$bx2=(int)floor($bx/2);$by2=(int)floor($by/2);$w2=abs($ax2+$ay2);$h2=abs($bx2+$by2);if(2*$w>3*$h){if($w2%2&&$w>2){$ax2+=$dax;$ay2+=$day;}cf_generate($x,$y,$ax2,$ay2,$bx,$by,$width,$out,$idx);cf_generate($x+$ax2,$y+$ay2,$ax-$ax2,$ay-$ay2,$bx,$by,$width,$out,$idx);}else{if($h2%2&&$h>2){$bx2+=$dbx;$by2+=$dby;}cf_generate($x,$y,$bx2,$by2,$ax2,$ay2,$width,$out,$idx);cf_generate($x+$bx2,$y+$by2,$ax,$ay,$bx-$bx2,$by-$by2,$width,$out,$idx);cf_generate($x+$ax-$dax+$bx2-$dbx,$y+$ay-$day+$by2-$dby,-$bx2,-$by2,-($ax-$ax2),-($ay-$ay2),$width,$out,$idx);}}





function cf_at(int $i,array $tiles,bool $reverse,int $ow):int{$tile=$tiles[intdiv($i,256)];$local=$i%256;$nx=intdiv($ow,16);return(intdiv($tile,$nx)*16+intdiv($local,16))*$ow+$tile%$nx*16+$local%16;}

function cf_lum(GdImage $im,int $x,int $y):float{$v=imagecolorat($im,max(0,min(imagesx($im)-1,$x)),max(0,min(imagesy($im)-1,$y)));return .299*(($v>>16)&255)+.587*(($v>>8)&255)+.114*($v&255);}

function cf_cover_edge(GdImage $im,int $x,int $y):float{$tl=cf_lum($im,$x-1,$y-1);$tc=cf_lum($im,$x,$y-1);$tr=cf_lum($im,$x+1,$y-1);$ml=cf_lum($im,$x-1,$y);$mr=cf_lum($im,$x+1,$y);$bl=cf_lum($im,$x-1,$y+1);$bc=cf_lum($im,$x,$y+1);$br=cf_lum($im,$x+1,$y+1);return(abs(-$tl+$tr-2*$ml+2*$mr-$bl+$br)+abs(-$tl-2*$tc-$tr+$bl+2*$bc+$br))/8;}

function cf_guards(GdImage $out,GdImage $base,string &$state):void{$w=imagesx($out);$h=imagesy($out);$left=(int)ceil($w/512)*16;$right=intdiv(31*$w,512)*16;$offsets=[[0,-1],[0,1],[-1,0],[1,0],[-1,-1],[-1,1],[1,-1],[1,1]];for($step=1;$step<=3;$step++)for($y=0;$y<$h;$y++)for($x=$left;$x<$right;$x++){$p=$y*$w+$x;if($state[$p]!=="\0"||((imagecolorat($base,$x,$y)>>16)&255)<250)continue;$parent=-1;foreach($offsets as[$dy,$dx]){$xx=$x+$dx;$yy=$y+$dy;if($xx<0||$yy<0||$xx>=$w||$yy>=$h)continue;$q=$yy*$w+$xx;$s=ord($state[$q]);if($s>0&&$s<=$step){$parent=$q;break;}}if($parent>=0&&cf_cover_edge($base,$x,$y)<18){imagesetpixel($out,$x,$y,imagecolorat($out,$parent%$w,intdiv($parent,$w)));$state[$p]=chr($step+1);}}}

function cf_axis(int $original,int $received):array{$idx=[];$weight=[];$den=2*$original;for($i=0;$i<$original;$i++){$t=(2*$i+1)*$received-$original;$base=(int)floor($t/$den);$rem=$t-$base*$den;$f=intdiv($rem*1024+$original,$den)/1024;$g=1-$f;$ff=$f*$f;$gg=$g*$g;$values=[-.75*$f*$gg,1.25*$ff*$f-2.25*$ff+1,1.25*$gg*$g-2.25*$gg+1,-.75*$ff*$g];$q=array_map(fn($v)=>(int)floor($v*16384+.5),$values);$q[1]+=16384-array_sum($q);$ii=[];for($j=0;$j<4;$j++)$ii[]=max(0,min($received-1,$base+$j-1));$idx[]=$ii;$weight[]=array_map(fn($v)=>$v/16384,$q);}return[$idx,$weight];}

function cf_extract_payload(array $received,string $password=''):array{[$im,$_alpha]=$received;[$m,$small]=cf_header($im);$tag=$m['tag'];unset($m['tag']);$key=cf_derive($password,hex2bin($m['s']));if(!hash_equals($tag,bin2hex(substr(cf_mac($key,cf_canonical($m)),0,16))))throw new RuntimeException('Incorrect password');$iw=imagesx($im);$ih=imagesy($im);if(abs(($iw/$m['ow'])/($ih/$m['oh'])-1)>.02)throw new RuntimeException('Changed aspect ratio');$w=$m['w'];$h=$m['h'];$n=$m['k']*256;$need=$n*($m['a']?2:1);$sm=cf_open_map($m,$key);[$order,$tiles]=CFTPacking::plan($m,$key,$sm['mask']);$reverse=false;$out=cf_new($w,$h);imagefilledrectangle($out,0,0,$w-1,$h-1,$sm['bg']>>8);$alpha=$m['a']?str_repeat(chr($sm['bg']&255),$w*$h):null;$active=str_repeat("\0",$w*$h);$direct=$iw===$m['ow']&&$ih===$m['oh'];if(!$direct){[$xi,$xw]=cf_axis($m['ow'],$iw);[$yi,$yw]=cf_axis($m['oh'],$ih);$rgb='';for($y=0;$y<$ih;$y++)for($x=0;$x<$iw;$x++){$v=imagecolorat($im,$x,$y);$rgb.=chr(($v>>16)&255).chr(($v>>8)&255).chr($v&255);}}$sc=(int)ceil($w/16);for($i=0;$i<$need;$i++){$tile=cf_uget($order,intdiv($i,256)%$m['k']);$local=$i%256;$xs=$tile%$sc*16+$local%16;$ys=intdiv($tile,$sc)*16+intdiv($local,16);if($xs>=$w||$ys>=$h)continue;$dst=cf_at($i,$tiles,$reverse,$m['ow']);$x=$dst%$m['ow'];$y=intdiv($dst,$m['ow']);if($direct)$vals=cf_rgb(imagecolorat($im,$x,$y));else{$vals=[0.,0.,0.];for($dy=0;$dy<4;$dy++)for($dx=0;$dx<4;$dx++){$p=($yi[$y][$dy]*$iw+$xi[$x][$dx])*3;$wt=$yw[$y][$dy]*$xw[$x][$dx];for($c=0;$c<3;$c++)$vals[$c]+=ord($rgb[$p+$c])*$wt;}}$p=$ys*$w+$xs;$active[$p]="\1";if($i<$n)imagesetpixel($out,$xs,$ys,cf_color(array_map('pm_clip',$vals)));else $alpha[$p]=chr(pm_clip(array_sum($vals)/3));}$work=[$out,$alpha];$full=cf_expand_source($work,$m);$damaged=cf_crc_image($full)!==$m['crc'];if($damaged){$table=cf_calibration($small,$m);for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++){$v=cf_rgb(imagecolorat($out,$x,$y));for($c=0;$c<3;$c++)$v[$c]=$table[$v[$c]][$c];if($m['b']&2){$middle=array_sum($v)-min($v)-max($v);$v=[$middle,$middle,$middle];}imagesetpixel($out,$x,$y,cf_color($v));if($alpha!==null){$aa=ord($alpha[$y*$w+$x]);$alpha[$y*$w+$x]=chr(pm_clip(array_sum($table[$aa])/3));}}$cal=base64_decode($m['cal']);$pal=[];for($i=0;$i<$m['z'];$i++)$pal[]=[ord($cal[36+$i*3]),ord($cal[37+$i*3]),ord($cal[38+$i*3])];$work=[$out,$alpha];for($p=0;$p<$w*$h;$p++)if($active[$p]==="\0"){imagesetpixel($work[0],$p%$w,intdiv($p,$w),$sm['bg']>>8);if($work[1]!==null)$work[1][$p]=chr($sm['bg']&255);}$full=cf_expand_source($work,$m);}return $full;}



function cf_source_palette(array $source):array{[$im,$alpha]=$source;$w=imagesx($im);$h=imagesy($im);$counts=[];for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++){if(pm_alpha($im,$alpha,$x,$y)!==255)continue;$v=imagecolorat($im,$x,$y)&0xffffff;if($v!==(imagecolorat($im,max(0,$x-1),$y)&0xffffff)||$v!==(imagecolorat($im,min($w-1,$x+1),$y)&0xffffff)||$v!==(imagecolorat($im,$x,max(0,$y-1))&0xffffff)||$v!==(imagecolorat($im,$x,min($h-1,$y+1))&0xffffff))continue;$counts[$v]=($counts[$v]??0)+1;}$threshold=max(64,(int)ceil($w*$h/64));$pairs=[];foreach($counts as $v=>$count)if($count>=$threshold)$pairs[]=[$v,$count];usort($pairs,fn($a,$b)=>$b[1]<=>$a[1]?:$a[0]<=>$b[0]);$out=[];foreach(array_slice($pairs,0,4)as[$v,$count]){$ambiguous=false;foreach($counts as $other=>$n)if($other!==$v&&$n>=4&&max(abs(($v>>16)-($other>>16)),abs((($v>>8)&255)-(($other>>8)&255)),abs(($v&255)-($other&255)))<=24){$ambiguous=true;break;}if(!$ambiguous)$out[]=cf_rgb($v);}return $out;}

function cf_expand_source(array $work,array $m):array{if(!$m['t'])return $work;[$im,$alpha]=$work;$bg=hex2bin($m['bg']);$out=cf_new($m['fw'],$m['fh']);imagefilledrectangle($out,0,0,$m['fw']-1,$m['fh']-1,(ord($bg[0])<<16)|(ord($bg[1])<<8)|ord($bg[2]));imagecopy($out,$im,$m['x'],$m['y'],0,0,$m['w'],$m['h']);$a=str_repeat($bg[3],$m['fw']*$m['fh']);for($y=0;$y<$m['h'];$y++)for($x=0;$x<$m['w'];$x++)$a[($y+$m['y'])*$m['fw']+$x+$m['x']]=chr(pm_alpha($im,$alpha,$x,$y));return[$out,$a];}

function cf_median_rgb(string $data,int $w,int $h,int $r):string{$out=$data;$rank=intdiv((2*$r+1)**2,2)+1;for($c=0;$c<3;$c++)for($y=0;$y<$h;$y++){$hist=array_fill(0,256,0);for($dy=-$r;$dy<=$r;$dy++){$row=max(0,min($h-1,$y+$dy))*$w;for($dx=-$r;$dx<=$r;$dx++)$hist[ord($data[($row+max(0,min($w-1,$dx)))*3+$c])]++;}$med=0;$below=0;while($below+$hist[$med]<$rank)$below+=$hist[$med++];for($x=0;$x<$w;$x++){$out[($y*$w+$x)*3+$c]=chr($med);if($x===$w-1)break;$left=max(0,$x-$r);$right=min($w-1,$x+$r+1);for($dy=-$r;$dy<=$r;$dy++){$row=max(0,min($h-1,$y+$dy))*$w;$a=ord($data[($row+$left)*3+$c]);$b=ord($data[($row+$right)*3+$c]);$hist[$a]--;$hist[$b]++;if($a<$med)$below--;if($b<$med)$below++;}while($below>=$rank){$med--;$below-=$hist[$med];}while($below+$hist[$med]<$rank)$below+=$hist[$med++];}}return $out;}

function cf_repair_pixels(array $image,array $pal):array{[$im,$alpha]=$image;$w=imagesx($im);$h=imagesy($im);$data='';for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++){$v=imagecolorat($im,$x,$y);$data.=chr(($v>>16)&255).chr(($v>>8)&255).chr($v&255);}$guide=cf_median_rgb($data,$w,$h,1);$target=cf_median_rgb($data,$w,$h,2);for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++){$p=($y*$w+$x)*3;$valid=true;for($c=0;$c<3;$c++)if(abs(ord($data[$p+$c])-ord($target[$p+$c]))>64)$valid=false;if(!$valid)continue;for($c=0;$c<3&&$valid;$c++){$lo=255;$hi=0;for($dy=-1;$dy<=1;$dy++)for($dx=-1;$dx<=1;$dx++){$q=(max(0,min($h-1,$y+$dy))*$w+max(0,min($w-1,$x+$dx)))*3+$c;$v=ord($guide[$q]);$lo=min($lo,$v);$hi=max($hi,$v);}if($hi-$lo>24)$valid=false;}if(!$valid)continue;$dr=ord($data[$p])-ord($target[$p]);$dg=ord($data[$p+1])-ord($target[$p+1]);$db=ord($data[$p+2])-ord($target[$p+2]);$norm=$dr*$dr+$dg*$dg+$db*$db;$supported=false;if($norm>=4)foreach([[0,1],[1,0],[1,1],[1,-1]]as[$dy,$dx]){$votes=0;foreach([-2,-1,1,2]as $distance){$q=(max(0,min($h-1,$y+$dy*$distance))*$w+max(0,min($w-1,$x+$dx*$distance)))*3;$dot=$dr*(ord($data[$q])-ord($target[$p]))+$dg*(ord($data[$q+1])-ord($target[$p+1]))+$db*(ord($data[$q+2])-ord($target[$p+2]));if($dot>0&&$dot*4>=$norm)$votes++;}if($votes>=(max(abs($dr),abs($dg),abs($db))<=12?2:3)){$supported=true;break;}}if($supported)continue;$value=[ord($target[$p]),ord($target[$p+1]),ord($target[$p+2])];$chosen=$value;$best=PHP_INT_MAX;foreach($pal as $col){$dr=$value[0]-$col[0];$dg=$value[1]-$col[1];$db=$value[2]-$col[2];$distance=$dr*$dr+$dg*$dg+$db*$db;if(max(abs($dr),abs($dg),abs($db))<=12&&$distance<$best){$chosen=$col;$best=$distance;}}imagesetpixel($im,$x,$y,cf_color($chosen));}return[$im,$alpha];}

function cf_pack_meta_body(array $m):string{$cv=$m['d']>=13?GeometryMask::pack(base64_decode($m['mask']),$m['c'],$m['r'],$m['d']>=14):gzcompress(base64_decode($m['mask']),9);$sm=base64_decode($m['sm']);$extra=$m['t']?pack('nnnn',$m['fw'],$m['fh'],$m['x'],$m['y']).hex2bin($m['bg']):'';return pack('CnnnnCCCCC',($m['a']?1:0)+($m['p']?2:0)+($m['t']?4:0)+($m['u']?8:0),$m['w'],$m['h'],$m['ow'],$m['oh'],$m['c'],$m['r'],$m['b'],$m['d'],$m['z']).hex2bin($m['s']).pack('N',$m['crc']).($m['d']>=14?substr(base64_decode($m['cal']),36,3*$m['z']):base64_decode($m['cal'])).pack('Nnn',$m['k'],strlen($cv),strlen($sm)).$cv.$sm.$extra.hex2bin($m['tag']);}

function cf_unpack_meta_body(string $data,int $iw,int $ih):array{if(strlen($data)<58)throw new RuntimeException('Invalid CFT2 header');$m=unpack('Cflags/nw/nh/now/noh/Cc/Cr/Cb/Cd/Cz',substr($data,0,14));if($m['z']>4)throw new RuntimeException('Invalid calibration');$cn=$m['d']>=14?3*$m['z']:48;$kp=34+$cn;$pos=$kp+8;if(strlen($data)<$pos+16)throw new RuntimeException('CFT2 length');$sizes=unpack('Nk/ncl/nsl',substr($data,$kp,8));$m['t']=(bool)($m['flags']&4);$m['u']=(bool)($m['flags']&8);$cl=$sizes['cl'];$sl=$sizes['sl'];if($m['flags']>15||strlen($data)!==$pos+16+$cl+$sl+($m['t']?12:0)||$m['u']!==(bool)$sl)throw new RuntimeException('Invalid CFT2 header length');$m['a']=(bool)($m['flags']&1);$m['p']=(bool)($m['flags']&2);unset($m['flags']);$mask=$m['d']>=13?GeometryMask::unpack(substr($data,$pos,$cl),$m['c'],$m['r']):cf_inflate_map(substr($data,$pos,$cl),(int)ceil($m['c']*$m['r']/8));$cal=substr($data,34,48);if($m['d']>=14){$cal='';for($i=0;$i<12;$i++)$cal.=str_repeat(chr((int)floor($i*255/11+.5)),3);$cal.=substr($data,34,$cn).str_repeat(chr(128),12-$cn);}$m+=['k'=>$sizes['k'],'s'=>bin2hex(substr($data,14,16)),'crc'=>unpack('N',$data,30)[1],'cal'=>base64_encode($cal),'mask'=>base64_encode($mask),'sm'=>base64_encode(substr($data,$pos+$cl,$sl)),'tag'=>bin2hex(substr($data,-16))];if($m['t']){$pos=$pos+$cl+$sl;$m+=unpack('nfw/nfh/nx/ny',substr($data,$pos,8));$m['bg']=bin2hex(substr($data,$pos+8,4));}$m+=['iw'=>$iw,'ih'=>$ih];cf_validate($m);return $m;}

function cf_validate(array $m):void{$count=(int)ceil($m['w']/16)*(int)ceil($m['h']/16);if(min($m['w'],$m['h'],$m['ow'],$m['oh'],$m['c'],$m['r'],$m['iw'],$m['ih'])<1||max($m['w'],$m['h'],$m['ow'],$m['oh'])>65535||$m['w']*$m['h']>48000000||$m['ow']*$m['oh']>48000000||$m['c']>255||$m['r']>255||!in_array($m['b'],$m['d']>=15?[1,3,5,7]:[1,3],true)||!in_array($m['d'],[11,12,13,14,15],true)||$m['z']<0||$m['z']>4||$m['k']<0||$m['k']>$count)throw new RuntimeException('Invalid CFT2 parameters');if($m['t']||$m['w']!==cf_power2($m['iw'])||$m['h']!==cf_power2($m['ih']))throw new RuntimeException('Padded frame mismatch');if($m['t']&&(min($m['fw'],$m['fh'])<1||max($m['fw'],$m['fh'])>65535||$m['fw']*$m['fh']>48000000||min($m['x'],$m['y'])<0||$m['x']+$m['w']>$m['fw']||$m['y']+$m['h']>$m['fh']||strlen(hex2bin($m['bg']))!==4))throw new RuntimeException('Invalid restored frame');}

function cf_prepare_pilots(GdImage $out,array $pal):string{$w=imagesx($out);$h=imagesy($out);[$vw,$vh]=cf_norm($w,$h);$targets=[];for($i=0;$i<12;$i++)$targets[]=array_fill(0,3,pm_clip($i*255/11));$targets=array_merge($targets,$pal);while(count($targets)<16)$targets[]=[128,128,128];$cal='';foreach(cf_pilots($vw,$vh)as $i=>[$x,$y]){$target=$targets[$i];$x0=max(0,(int)floor(($x*8-4)*$w/$vw));$x1=min($w,(int)ceil(($x*8+12)*$w/$vw));$y0=max(0,(int)floor(($y*8-4)*$h/$vh));$y1=min($h,(int)ceil(($y*8+12)*$h/$vh));imagefilledrectangle($out,$x0,$y0,$x1-1,$y1-1,cf_color($target));$cal.=chr($target[0]).chr($target[1]).chr($target[2]);}return $cal;}

function cf_cal_median(array $a):float{sort($a,SORT_NUMERIC);$n=count($a);return $n%2?$a[intdiv($n,2)]:($a[intdiv($n,2)-1]+$a[intdiv($n,2)])/2;}

function cf_calibration(GdImage $small,array $m):array{$obs=cf_means($small,$m['d']<13,$m['d']);$expected=base64_decode($m['cal']);$table=[];for($v=0;$v<256;$v++)$table[]=[$v,$v,$v];for($c=0;$c<3;$c++){if($m['d']>=14){$ids=$slopes=[];for($i=0;$i<12;$i++)if($obs[$i][$c]>2&&$obs[$i][$c]<253)$ids[]=$i;foreach($ids as $i)foreach($ids as $j)if($j>$i&&ord($expected[$j*3+$c])-ord($expected[$i*3+$c])>=32)$slopes[]=($obs[$j][$c]-$obs[$i][$c])/(ord($expected[$j*3+$c])-ord($expected[$i*3+$c]));if(count($slopes)>=3){$a=cf_cal_median($slopes);$offset=[];foreach($ids as $i)$offset[]=$obs[$i][$c]-$a*ord($expected[$i*3+$c]);$b=cf_cal_median($offset);$residual=[];foreach($ids as $i)$residual[]=abs($obs[$i][$c]-$a*ord($expected[$i*3+$c])-$b);$res=cf_cal_median($residual);if($a>.5&&$a<1.5&&$res<=3){$shift=[];for($v=0;$v<256;$v++)$shift[]=abs(($v-$b)/$a-$v);if(cf_cal_median($shift)<1.5)continue;}}}$diff=[];for($i=0;$i<12;$i++)$diff[]=abs($obs[$i][$c]-ord($expected[$i*3+$c]));sort($diff,SORT_NUMERIC);if(($diff[5]+$diff[6])/2<1.5)continue;$xs=[];$ys=[];for($i=0;$i<12;$i++){$xx=max($obs[$i][$c],count($xs)?$xs[count($xs)-1]:0);if(count($xs)&&$xx-$xs[count($xs)-1]<.25)$ys[count($ys)-1]=ord($expected[$i*3+$c]);else{$xs[]=$xx;$ys[]=ord($expected[$i*3+$c]);}}$last=count($xs)-1;for($v=0;$v<256;$v++){if($v<=$xs[0])$value=$ys[0];elseif($v>=$xs[$last])$value=$ys[$last];else{$j=1;while($xs[$j]<$v)$j++;$value=$ys[$j-1]+($ys[$j]-$ys[$j-1])*($v-$xs[$j-1])/($xs[$j]-$xs[$j-1]);}$table[$v][$c]=pm_clip($value);}}return $table;}

function cf_interleave(array $diff,int $n):array{$mix=$n+1;$length=count($diff);while(cf_gcd($mix,$length)!==1)$mix++;$out=[];for($i=0;$i<$length;$i++)$out[]=$diff[$i*$mix%$length];return $out;}

function cf_native_layout(array $edge,int $pw,int $ph,int $cw,int $ch,int $w,int $h,bool $alpha,int $count):array{$pitch=$pw+1;$sum=new SplFixedArray(($ph+1)*$pitch);$strong=new SplFixedArray($sum->count());for($i=0;$i<$sum->count();$i++){$sum[$i]=0.;$strong[$i]=0;}for($y=0;$y<$ph;$y++)for($x=0;$x<$pw;$x++){$p=($y+1)*$pitch+$x+1;$v=$edge[$y*$pw+$x];$sum[$p]=$v+$sum[$p-1]+$sum[$p-$pitch]-$sum[$p-$pitch-1];$strong[$p]=(int)($v>48)+$strong[$p-1]+$strong[$p-$pitch]-$strong[$p-$pitch-1];}$need=$count*($alpha?2:1);$lower=max(640,(int)sqrt($need*256*min($cw,$ch)/max($cw,$ch)));for($k=intdiv($lower+15,16)*16;$k<65536;$k+=16){$ow=$cw>=$ch?(int)floor($k*$cw/$ch+.5):$k;$oh=$ch>$cw?(int)floor($k*$ch/$cw+.5):$k;$nx=intdiv($ow,16);$ny=intdiv($oh,16);if(max($nx,$ny)>255||$ow*$oh>48000000)throw new RuntimeException('Native contour grid exceeds capacity');$mask=str_repeat("\0",intdiv($nx*$ny+7,8));$n=0;for($y=0;$y<$ny;$y++)for($x=(int)ceil($ow/512);$x<intdiv(31*$ow,512);$x++){$x0=max(0,intdiv($x*16*$pw,$ow)-1);$x1=min($pw,(int)ceil(($x+1)*16*$pw/$ow)+1);$y0=max(0,intdiv($y*16*$ph,$oh)-1);$y1=min($ph,(int)ceil(($y+1)*16*$ph/$oh)+1);$area=($x1-$x0)*($y1-$y0);$total=$sum[$y1*$pitch+$x1]-$sum[$y0*$pitch+$x1]-$sum[$y1*$pitch+$x0]+$sum[$y0*$pitch+$x0];$high=$strong[$y1*$pitch+$x1]-$strong[$y0*$pitch+$x1]-$strong[$y1*$pitch+$x0]+$strong[$y0*$pitch+$x0];if($total==0&&!sk_hit($x*16,$y*16,($x+1)*16,($y+1)*16,$ow,$oh)){$i=$y*$nx+$x;$b=intdiv($i,8);$mask[$b]=chr(ord($mask[$b])|(1<<(7-$i%8)));$n++;}}if($n>=$need)return compact('w','h','ow','oh')+['c'=>$nx,'r'=>$ny,'b'=>1,'d'=>15,'z'=>0,'a'=>$alpha,'mask'=>base64_encode($mask)];}throw new RuntimeException('Contour capacity');}

function cf_layout(GdImage $cover,int $w,int $h,bool $alpha,bool $cropped,array $sourceMap,int $iw,int $ih,int $z=0):array{foreach($sourceMap['blob']!==''?[true,false]:[false]as $sparse)foreach([0,128,112,96,80,64,48,40,32,24,20,16]as $guide){$count=$sparse?$sourceMap['k']:cf_bitcount(cf_padding_mask($w,$h,$iw,$ih));$blob=$sparse?$sourceMap['blob']:'';try{$m=cf_base_layout($cover,$w,$h,$alpha,$guide,$count);}catch(RuntimeException){continue;}$length=62+3*$z+strlen(GeometryMask::pack(base64_decode($m['mask']),$m['c'],$m['r'],$m['d']>=14))+strlen($blob)+($cropped?12:0);[$vw,$vh]=cf_norm($m['ow'],$m['oh']);[$loc,$_]=cf_locations($vw,$vh);if((int)ceil(($length+10)*8/36)*63<=count($loc)*6&&$length<=1536)return $m+['iw'=>$iw,'ih'=>$ih,'k'=>$count,'u'=>$sparse,'sm'=>base64_encode($blob)];}throw new RuntimeException('Parameter capacity');}



function cf_embed_payload(array $source,array $cover,string $password,int $iw,int $ih,array $pal):array{if(max(imagesx($source[0]),imagesy($source[0]))>65535)throw new RuntimeException('Image dimension exceeds 65535');$monochrome=true;for($yy=0;$yy<imagesy($source[0])&&$monochrome;$yy++)for($xx=0;$xx<imagesx($source[0]);$xx++){$v=imagecolorat($source[0],$xx,$yy);if((($v>>16)&255)!==(($v>>8)&255)||(($v>>8)&255)!==($v&255)){$monochrome=false;break;}}$expected=cf_crc_image($source);$frame=['t'=>false];[$in,$alphaBytes]=$source;$w=imagesx($in);$h=imagesy($in);$alpha=false;for($y=0;$y<$h&&!$alpha;$y++)for($x=0;$x<$w;$x++)if(pm_alpha($in,$alphaBytes,$x,$y)!==255){$alpha=true;break;}$cv=cf_flat($cover);$sm=cf_source_map($source);if($sm['mask']===cf_padding_mask($w,$h,$iw,$ih))$sm['blob']='';$cv=sk_prepare($cv,cf_bitcount($sm['mask'])*($alpha?2:1));$m=cf_layout($cv,$w,$h,$alpha,$frame['t'],$sm,$iw,$ih,count($pal))+$frame;$m['z']=count($pal);$m['b']=($monochrome?3:1)|($pal&&$sm['k']*256<$iw*$ih*.65?4:0);$salt=random_bytes(16);$key=cf_derive($password,$salt);if(!$m['u'])$sm['mask']=cf_padding_mask($w,$h,$iw,$ih);$m['sm']=base64_encode(cf_map_cipher(base64_decode($m['sm']),$key));[$order,$tiles]=CFTPacking::plan($m,$key,$sm['mask']);$reverse=false;$base=cf_resize($cv,$m['ow'],$m['oh']);$out=cf_new($m['ow'],$m['oh']);imagecopy($out,$base,0,0,0,0,$m['ow'],$m['oh']);$state=str_repeat("\0",$m['ow']*$m['oh']);$n=$m['k']*256;$need=$n*($alpha?2:1);$sc=(int)ceil($w/16);for($i=0;$i<$need;$i++){$tile=cf_uget($order,intdiv($i,256)%$m['k']);$local=$i%256;$x=min($w-1,$tile%$sc*16+$local%16);$y=min($h-1,intdiv($tile,$sc)*16+intdiv($local,16));$v=$i<$n?imagecolorat($in,$x,$y)&0xffffff:pm_alpha($in,$alphaBytes,$x,$y)*65793;$d=cf_at($i,$tiles,$reverse,$m['ow']);imagesetpixel($out,$d%$m['ow'],intdiv($d,$m['ow']),$v);$state[$d]="\1";}cf_guards($out,$base,$state);sk_paint($out,$base,$state);$m+=['p'=>$password!=='','s'=>bin2hex($salt),'crc'=>$expected,'cal'=>base64_encode(cf_prepare_pilots($out,$pal))];$m['tag']=bin2hex(substr(cf_mac($key,cf_canonical($m)),0,16));cf_write_header($out,$m);fr_draw($out);return[$out,null];}





function cf_power2(int $n):int{if($n<1||$n>32768)throw new RuntimeException('Input outside padded dimension limit');$p=16;while($p<$n)$p*=2;return $p;}

function cf_phase(int $n):int{$u=min(1024,$n);return(int)(floor((sqrt(5)-1)/2*$n/$u+.5)*$u)%$n;}

function cf_bitcount(string $s):int{$n=0;for($i=0;$i<strlen($s);$i++)$n+=substr_count(decbin(ord($s[$i])),'1');return $n;}

function cf_padding_mask(int $w,int $h,int $iw,int $ih):string{$sc=intdiv($w,16);$sr=intdiv($h,16);$p=cf_curve($sc,$sr);$n=$sc*$sr;$offset=intdiv(cf_phase($w*$h),256);$mask=str_repeat("\0",(int)ceil($n/8));for($i=0;$i<$n;$i++){$v=cf_uget($p,$i);if($v%$sc<(int)ceil($iw/16)&&intdiv($v,$sc)<(int)ceil($ih/16)){$d=cf_uget($p,($i+$offset)%$n);$mask[intdiv($d,8)]=chr(ord($mask[intdiv($d,8)])|(1<<(7-$d%8)));}}return $mask;}

function cf_pack_meta(array $m):string{return pack('nn',$m['iw'],$m['ih']).cf_pack_meta_body($m);}

function cf_unpack_meta(string $s):array{if(strlen($s)<62)throw new RuntimeException('CFT2 header length');$size=unpack('niw/nih',$s);return cf_unpack_meta_body(substr($s,4),$size['iw'],$size['ih']);}



function cf11_zeros(int $n):SplFixedArray{$a=new SplFixedArray($n);for($i=0;$i<$n;$i++)$a[$i]=0.;return $a;}

function cf11_bound(float $v,int $n):float{return max(0.,min($n-1.,$v));}

function cf11_spline(float $f):array{return[(1-$f)**3/6,(3*$f**3-6*$f*$f+4)/6,(-3*$f**3+3*$f*$f+3*$f+1)/6,$f**3/6];}

function cf11_lap(SplFixedArray $a,int $w,int $h):SplFixedArray{$out=cf11_zeros($w*$h);for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++){$p=$y*$w+$x;$v=$a[$p];$sum=0.;if($x)$sum+=$v-$a[$p-1];if($x+1<$w)$sum+=$v-$a[$p+1];if($y)$sum+=$v-$a[$p-$w];if($y+1<$h)$sum+=$v-$a[$p+$w];$out[$p]=$sum;}return $out;}

function cf11_cg(SplFixedArray $initial,SplFixedArray $rhs,SplFixedArray $diagonal,callable $operator):SplFixedArray{$N=$initial->count();$x=clone $initial;$ax=$operator($x);$r=new SplFixedArray($N);$z=new SplFixedArray($N);$p=new SplFixedArray($N);$rr=0.;for($i=0;$i<$N;$i++){$r[$i]=$rhs[$i]-$ax[$i];$z[$i]=$r[$i]/$diagonal[$i];$p[$i]=$z[$i];$rr+=$r[$i]*$z[$i];}unset($ax);for($it=0;$it<12;$it++){$ap=$operator($p);$den=0.;for($i=0;$i<$N;$i++)$den+=$p[$i]*$ap[$i];$alpha=$rr/max(1e-20,$den);$next=0.;for($i=0;$i<$N;$i++){$x[$i]+=$p[$i]*$alpha;$r[$i]-=$ap[$i]*$alpha;$z[$i]=$r[$i]/$diagonal[$i];$next+=$r[$i]*$z[$i];}$beta=$next/max($rr,1e-20);for($i=0;$i<$N;$i++)$p[$i]=$z[$i]+$p[$i]*$beta;$rr=$next;unset($ap);}return $x;}

final class CF11Fit {

 public int $N,$S,$K,$w,$h;public string $index='';public SplFixedArray $basis,$coverage,$diag,$anchor,$confidenceWeights;public float $regular,$seamFactor=0.,$seamBoost=0.;public ?SplFixedArray $regMap=null;public bool $cubic;

 function __construct(SplFixedArray $px,SplFixedArray $py,SplFixedArray $confidenceWeights,int $used,int $w,int $h,float $regular,bool $cubic){$this->confidenceWeights=$confidenceWeights;$this->N=$w*$h;$this->S=$used;$this->K=$cubic?16:4;$this->w=$w;$this->h=$h;$this->regular=$regular;$this->cubic=$cubic;$this->basis=new SplFixedArray($used*$this->K);$this->coverage=cf11_zeros($this->N);$this->diag=cf11_zeros($this->N);$K=$this->K;

  for($j=0;$j<$used;$j++){$x=cf11_bound($px[$j],$w);$y=cf11_bound($py[$j],$h);$x0=(int)$x;$y0=(int)$y;$fx=$x-$x0;$fy=$y-$y0;if($cubic){$a=cf11_spline($fx);$b=cf11_spline($fy);for($dy=0;$dy<4;$dy++)for($dx=0;$dx<4;$dx++){$k=$dy*4+$dx;$p=max(0,min($h-1,$y0+$dy-1))*$w+max(0,min($w-1,$x0+$dx-1));$v=$b[$dy]*$a[$dx];$this->index.=pack('V',$p);$this->basis[$j*$K+$k]=$v;$this->coverage[$p]+=$v*$confidenceWeights[$j];$this->diag[$p]+=$v*$v*$confidenceWeights[$j];}}else{$ids=[$y0*$w+$x0,$y0*$w+min($w-1,$x0+1),min($h-1,$y0+1)*$w+$x0,min($h-1,$y0+1)*$w+min($w-1,$x0+1)];$weights=[(1-$fx)*(1-$fy),$fx*(1-$fy),(1-$fx)*$fy,$fx*$fy];for($k=0;$k<4;$k++){$p=$ids[$k];$v=$weights[$k];$this->index.=pack('V',$p);$this->basis[$j*$K+$k]=$v;$this->coverage[$p]+=$v*$confidenceWeights[$j];$this->diag[$p]+=$v*$v*$confidenceWeights[$j];}}}

 }

 function adj(SplFixedArray $a,int $channel=0,int $stride=1):SplFixedArray{$out=cf11_zeros($this->N);$K=$this->K;for($j=0;$j<$this->S;$j++){$value=$a[$j*$stride+$channel]*$this->confidenceWeights[$j];for($k=0;$k<$K;$k++){$i=$j*$K+$k;$p=unpack('V',$this->index,$i*4)[1];$out[$p]+=$value*$this->basis[$i];}}return $out;}

 function op(SplFixedArray $a):SplFixedArray{$pred=cf11_zeros($this->S);$K=$this->K;for($j=0;$j<$this->S;$j++){$sum=0.;for($k=0;$k<$K;$k++){$i=$j*$K+$k;$p=unpack('V',$this->index,$i*4)[1];$sum+=$a[$p]*$this->basis[$i];}$pred[$j]=$sum;}$out=$this->adj($pred);unset($pred);$lp=cf11_lap($a,$this->w,$this->h);if($this->cubic){if($this->regMap!==null)for($p=0;$p<$this->N;$p++)$lp[$p]*=$this->regMap[$p];$lp=cf11_lap($lp,$this->w,$this->h);}for($p=0;$p<$this->N;$p++)$out[$p]+=($this->regMap===null?$this->regular*$lp[$p]:$lp[$p])+$this->anchor[$p]*$a[$p];return $out;}

 function solve(SplFixedArray $values,int $ch,array $bg,string $known):CF9Plane{$N=$this->N;$w=$this->w;$h=$this->h;$result=new CF9Plane($w,$h,$ch);$this->anchor=new SplFixedArray($N);$D=new SplFixedArray($N);for($p=0;$p<$N;$p++){$this->anchor[$p]=($known[$p]==="\1"?2:0)+.0001;$D[$p]=$this->diag[$p]+($this->cubic?20:4)*$this->regular+$this->anchor[$p];}

  for($channel=0;$channel<$ch;$channel++){$rhsData=$this->adj($values,$channel,$ch);$initial=clone $rhsData;$count=clone $this->coverage;for($p=0;$p<$N;$p++)if($known[$p]==="\1"){$count[$p]=1.;$initial[$p]=(float)$bg[$channel];}

   for($it=0;$it<48;$it++){$next=clone $initial;$nc=clone $count;$missing=false;$hit=false;for($p=0;$p<$N;$p++)if($count[$p]<1e-7){$missing=true;$x=$p%$w;$y=intdiv($p,$w);$near=[$y?$p-$w:$p,$y+1<$h?$p+$w:$p,$x?$p-1:$p,$x+1<$w?$p+1:$p];$sum=0.;$v=0.;foreach($near as $q){$sum+=$count[$q];$v+=$initial[$q];}if($sum>1e-7){$hit=true;$nc[$p]=$sum*.25;$next[$p]=$v*.25;}}if(!$missing||!$hit)break;$initial=$next;$count=$nc;}unset($next,$nc);

   $rhs=clone $rhsData;for($p=0;$p<$N;$p++){$v=$known[$p]==="\1"||$count[$p]<1e-7?(float)$bg[$channel]:$initial[$p]/$count[$p];$initial[$p]=$v;$rhs[$p]+=$this->anchor[$p]*$v;}unset($count,$rhsData);if($this->seamFactor>0&&$this->cubic&&$ch===1){$this->regMap=new SplFixedArray($N);$f=$this->seamFactor;for($yy=0;$yy<$h;$yy++)for($xx=0;$xx<$w;$xx++){$p=$yy*$w+$xx;$gx=($initial[$yy*$w+min($w-1,$xx+1)]-$initial[$yy*$w+max(0,$xx-1)])/($xx===0||$xx===$w-1?1:2);$gy=($initial[min($h-1,$yy+1)*$w+$xx]-$initial[max(0,$yy-1)*$w+$xx])/($yy===0||$yy===$h-1?1:2);$sx=fmod(($xx+.5)/$f,16.);$sy=fmod(($yy+.5)/$f,16.);$dist=min($sx,16-$sx,$sy,16-$sy);$band=max(0,min(1,1-$dist/5));$g=sqrt($gx*$gx+$gy*$gy);$this->regMap[$p]=$this->regular+$band*(.2*max(0,min(1,($f-.6)/.15))**2/(1+($g/6)**4)+$this->seamBoost/(1+($g/8)**4));$D[$p]=$this->diag[$p]+20*$this->regMap[$p]+$this->anchor[$p];}}$x=cf11_cg($initial,$rhs,$D,fn($v)=>$this->op($v));for($p=0;$p<$N;$p++)$result->a[$p*$ch+$channel]=$x[$p];unset($x,$rhs,$initial);

  }return $result;

 }

}

function cf11_enlarge(CF9Plane $field,float $factor,int $w,int $h,bool $cubic):CF9Plane{$out=new CF9Plane($w,$h,$field->ch);$xs=[];$ys=[];for($x=0;$x<$w;$x++){$v=cf11_bound(($x+.5)*$factor-.5,$field->w);$i=(int)$v;$f=$v-$i;$weights=$cubic?cf11_spline($f):[1-$f,$f];$indices=[];foreach($weights as $k=>$_)$indices[]=max(0,min($field->w-1,$i+$k-($cubic?1:0)));$xs[]=[$indices,$weights];}for($y=0;$y<$h;$y++){$v=cf11_bound(($y+.5)*$factor-.5,$field->h);$i=(int)$v;$f=$v-$i;$weights=$cubic?cf11_spline($f):[1-$f,$f];$indices=[];foreach($weights as $k=>$_)$indices[]=max(0,min($field->h-1,$i+$k-($cubic?1:0)));$ys[]=[$indices,$weights];}

 for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++)for($c=0;$c<$field->ch;$c++){$sum=0.;foreach($ys[$y][0]as $dy=>$yy)foreach($xs[$x][0]as $dx=>$xx)$sum+=$field->a[($yy*$field->w+$xx)*$field->ch+$c]*$ys[$y][1][$dy]*$xs[$x][1][$dx];$out->a[($y*$w+$x)*$field->ch+$c]=$sum;}return $out;

}

function cf11_original_active(array $m,array $map,array $geometry):string{$sc=intdiv($m['w'],16);$active=str_repeat("\0",$sc*intdiv($m['h'],16));foreach($geometry as $s=>$g){$p=intdiv($g[1],16)*$sc+intdiv($g[0],16);$active[$p]=(ord($map['mask'][intdiv($s,8)])&(1<<(7-$s%8)))?"\1":"\0";}return $active;}

function cf11_known(array $m,string $active,float $factor,int $ww,int $hh):string{$out=str_repeat("\0",$ww*$hh);$sc=intdiv($m['w'],16);for($y=0;$y<$hh;$y++)for($x=0;$x<$ww;$x++){$sx=max(0,min($m['iw']-1,(int)floor(($x+.5)/$factor)));$sy=max(0,min($m['ih']-1,(int)floor(($y+.5)/$factor)));$out[$y*$ww+$x]=$active[intdiv($sy,16)*$sc+intdiv($sx,16)]==="\1"?"\0":"\1";}return $out;}

function cf11_block_score(GdImage $in):float{$w=imagesx($in);$h=imagesy($in);$ss=$sb=0.;$ns=$nb=0;$lum=static fn(int $v):float=>((($v>>16)&255)*19595+(($v>>8)&255)*38470+($v&255)*7471)/65536;for($x=8;$x<$w;$x+=8)for($y=0;$y<$h;$y++){$d=min(10.,abs($lum(imagecolorat($in,$x,$y))-$lum(imagecolorat($in,$x-1,$y))));if($x%32===0){$ss+=$d;$ns++;}else{$sb+=$d;$nb++;}}for($y=8;$y<$h;$y+=8)for($x=0;$x<$w;$x++){$d=min(10.,abs($lum(imagecolorat($in,$x,$y))-$lum(imagecolorat($in,$x,$y-1))));if($y%32===0){$ss+=$d;$ns++;}else{$sb+=$d;$nb++;}}return min($ns,$nb)>=64&&$sb/$nb>.1?($ss/$ns)/($sb/$nb):1.;}


/** Fit the seam phase independently in both halves of each axis. */
function cf11_resize_phase(CF9Plane $luma,int $ow,int $oh):array{
 $w=$luma->w;$h=$luma->h;$offsets=[0.,0.];
 for($axis=0;$axis<2;$axis++){
  $n=$axis?$h:$w;$cross=$axis?$w:$h;$period=16*$n/($axis?$oh:$ow);
  if($period<5||$n<12*$period)continue;
  $first=(int)floor(2*$period)+1;$last=(int)ceil($n-2*$period);
  $omega=2*M_PI/$period;$estimates=[];
  for($half=0;$half<2;$half++){
   $start=$half?intdiv($cross,2):0;$end=$half?$cross:intdiv($cross,2);
   $real=$imag=$total=$cosSum=$sinSum=0.;
   for($i=$first;$i<$last;$i++){
    $energy=0.;$stride=$axis?1:$w;$adjacent=$axis?$w:1;$base=$i*$adjacent;
    for($j=$start;$j<$end;$j++){
     $p=$base+$j*$stride;
     $energy+=min(72,abs($luma->a[$p]-$luma->a[$p-$adjacent]));
    }
    $cosine=cos($i*$omega);$sine=sin($i*$omega);
    $total+=$energy;$real+=$energy*$cosine;$imag+=$energy*$sine;
    $cosSum+=$cosine;$sinSum+=$sine;
   }
   $real-=$total*$cosSum/($last-$first);$imag-=$total*$sinSum/($last-$first);
   if(hypot($real,$imag)<.07*$total)break;
   $estimates[]=-atan2($imag,$real)/$omega;
  }
  if(count($estimates)===2&&abs($estimates[0]-$estimates[1])<=.20){
   $offset=($estimates[0]+$estimates[1])/2;
   if(abs($offset)>=.20&&abs($offset)<=.80)$offsets[$axis]=$offset;
  }
 }
 return $offsets;
}

function cf11_box_mean(SplFixedArray $data,int $w,int $h,int $ch,int $radius):SplFixedArray{
 $input=$data;$diameter=2*$radius+1;
 for($axis=0;$axis<2;$axis++){
  $n=$axis?$h:$w;$lines=$axis?$w:$h;$stride=($axis?$w:1)*$ch;
  $output=new SplFixedArray($data->count());
  for($line=0;$line<$lines;$line++)for($c=0;$c<$ch;$c++){
   $start=$line*($axis?1:$w)*$ch+$c;$sum=0.;
   for($k=-$radius;$k<=$radius;$k++)$sum+=$input[$start+max(0,min($n-1,$k))*$stride];
   for($i=0;$i<$n;$i++){
    $output[$start+$i*$stride]=$sum/$diameter;
    $sum+=$input[$start+min($n-1,$i+$radius+1)*$stride]-$input[$start+max(0,$i-$radius)*$stride];
   }
  }
  $input=$output;
 }
 return $input;
}

function cf11_smooth_lattice(CF9Plane $field,int $radius,float $threshold,float $strength):void{
 $n=$field->a->count();
 $average=static fn(SplFixedArray $a):SplFixedArray=>cf11_box_mean($a,$field->w,$field->h,$field->ch,$radius);
 $squared=new SplFixedArray($n);
 for($i=0;$i<$n;$i++)$squared[$i]=$field->a[$i]*$field->a[$i];
 $mean=$average($field->a);$variance=$average($squared);unset($squared);
 for($i=0;$i<$n;$i++){
  $v=max(0,$variance[$i]-$mean[$i]*$mean[$i]);$gain=$v/($v+$threshold*$threshold);
  $variance[$i]=$gain;$mean[$i]*=1-$gain;
 }
 $gain=$average($variance);$bias=$average($mean);
 for($i=0;$i<$n;$i++)$field->a[$i]+=$strength*($gain[$i]*$field->a[$i]+$bias[$i]-$field->a[$i]);
}

function cf11_scatter(CF9Plane $plane,int $step,array $m,array $map,string $order,array $tiles,array $geometry,string $active,int $rw,int $rh,array $bg,float $margin,float $regular,bool $cubic,bool $full,float $nativeMargin=0.,float $offsetX=0.,float $offsetY=0.,float $severity=0.,float $phaseStrength=0.):CF9Plane{

 $iw=$m['iw'];$ih=$m['ih'];$w=$m['w'];$ow=$m['ow'];$oh=$m['oh'];$nx=intdiv($ow,16);$ny=intdiv($oh,16);$factor=$full?1.:min($rw/$ow,$rh/$oh)/$step;$ww=max(1,(int)ceil($iw*$factor));$hh=max(1,(int)ceil($ih*$factor));$n=$m['k'];$which=array_fill(0,$nx*$ny,-1);$labels=array_fill(0,$nx*$ny,-1);$geom=[];$unique=[];

 for($j=0;$j<$n;$j++){$s=cf_uget($order,$j);$g=$geometry[$s];$d=$tiles[$j];$x=$d%$nx*16;$y=intdiv($d,$nx)*16;[$ox,$oy,$ex,$ey,$vx,$vy]=$g;if(abs($ex)+abs($ey)!==1||abs($vx)+abs($vy)!==1||$ex*$vx+$ey*$vy!==0)throw new RuntimeException('Unaligned sampling group');$key=implode(',',[$ex,$ey,$vx,$vy,$ox-$ex*$x-$vx*$y,$oy-$ey*$x-$vy*$y]);if(!isset($unique[$key]))$unique[$key]=count($unique);$which[$d]=$j;$labels[$d]=$unique[$key];$geom[]=$g;}

 $max=$plane->w*$plane->h;$px=new SplFixedArray($max);$py=new SplFixedArray($max);$values=new SplFixedArray($max*$plane->ch);$confidenceWeights=new SplFixedArray($max);$used=0;$radius=$rw===$ow&&$rh===$oh?($step-1)/2+$nativeMargin:$margin*$step/min($rw/$ow,$rh/$oh);

 for($yy=0;$yy<$plane->h;$yy++)for($xx=0;$xx<$plane->w;$xx++){$x=($xx*$step+$step/2+$offsetX)*$ow/$rw-.5;$y=($yy*$step+$step/2+$offsetY)*$oh/$rh-.5;$cx=(int)floor(($x+.5)/16);$cy=(int)floor(($y+.5)/16);if($cx<0||$cy<0||$cx>=$nx||$cy>=$ny)continue;$tile=$cy*$nx+$cx;$j=$which[$tile];if($j<0)continue;$lx=(int)floor(($x-$radius+.5)/16);$hx=(int)floor(($x+$radius+.5)/16);$ly=(int)floor(($y-$radius+.5)/16);$hy=(int)floor(($y+$radius+.5)/16);$ok=true;for($b=$ly;$b<=$hy&&$ok;$b++)for($a=$lx;$a<=$hx;$a++)if($a<0||$b<0||$a>=$nx||$b>=$ny||$labels[$b*$nx+$a]!==$labels[$tile]){$ok=false;break;}if(!$ok)continue;[$ox,$oy,$ex,$ey,$vx,$vy]=$geom[$j];$u=$x-$cx*16;$v=$y-$cy*16;$sx=$ox+$ex*$u+$vx*$v;$sy=$oy+$ey*$u+$vy*$v;if($sx<-.5||$sy<-.5||$sx>=$iw-.5||$sy>=$ih-.5)continue;$confidence=1.;if($cubic&&($rw!==$ow||$rh!==$oh)){$distance=INF;for($dy=-1;$dy<=1;$dy++)for($dx=-1;$dx<=1;$dx++){$a=$cx+$dx;$b=$cy+$dy;if($a<0||$b<0||$a>=$nx||$b>=$ny||$labels[$b*$nx+$a]!==$labels[$tile]){$ddx=max($a*16-.5-$x,0.,$x-($a*16+15.5));$ddy=max($b*16-.5-$y,0.,$y-($b*16+15.5));$distance=min($distance,sqrt($ddx*$ddx+$ddy*$ddy));}}$softRadius=(2.5+($step-1)*.5)/min($rw/$ow,$rh/$oh);$confidence=max(.1,min(1.,($distance/$softRadius)**2));}$confidenceWeights[$used]=$confidence;$px[$used]=($sx+.5)*$factor-.5;$py[$used]=($sy+.5)*$factor-.5;for($c=0;$c<$plane->ch;$c++)$values[$used*$plane->ch+$c]=$plane->a[($yy*$plane->w+$xx)*$plane->ch+$c];$used++;}

 $px->setSize($used);$py->setSize($used);$values->setSize($used*$plane->ch);$confidenceWeights->setSize($used);$known=cf11_known($m,$active,$factor,$ww,$hh);$fit=new CF11Fit($px,$py,$confidenceWeights,$used,$ww,$hh,$regular,$cubic);if($m['d']>=14&&($rw!==$m['ow']||$rh!==$m['oh'])&&$cubic&&$plane->ch===1)$fit->seamFactor=$factor;$fit->seamBoost=$severity*(.06+.07*$phaseStrength);
 unset($px,$py);$field=$fit->solve($values,$plane->ch,$bg,$known);unset($fit,$values);
 if($severity>0)cf11_smooth_lattice($field,max(1,(int)(($plane->ch===1?10:14)*$factor+.5)),($plane->ch===1?6:13)+2*$phaseStrength,$severity);
 return cf11_enlarge($field,$factor,$iw,$ih,$cubic);

}

/** The native luma observation matrix is diagonal; omit its all-zero entries. */

function cf11_native_y(GdImage $image,array $m,string $order,array $tiles,array $geometry,string $active,float $bg,float $regular):CF9Plane{$w=$m['iw'];$h=$m['ih'];$N=$w*$h;$nx=intdiv($m['ow'],16);$sc=intdiv($m['w'],16);$initial=new SplFixedArray($N);for($p=0;$p<$N;$p++)$initial[$p]=$bg;

 for($j=0;$j<$m['k'];$j++){$s=cf_uget($order,$j);[$ox,$oy,$ex,$ey,$vx,$vy]=$geometry[$s];$d=$tiles[$j];$dx=$d%$nx*16;$dy=intdiv($d,$nx)*16;for($v=0;$v<16;$v++)for($u=0;$u<16;$u++){$sx=$ox+$ex*$u+$vx*$v;$sy=$oy+$ey*$u+$vy*$v;if($sx<0||$sy<0||$sx>=$w||$sy>=$h)continue;$rgb=imagecolorat($image,$dx+$u,$dy+$v);$initial[$sy*$w+$sx]=((($rgb>>16)&255)*19595+(($rgb>>8)&255)*38470+($rgb&255)*7471)/65536;}}

 $support=str_repeat("\0",$N);$rhs=new SplFixedArray($N);$diagonal=new SplFixedArray($N);for($p=0;$p<$N;$p++){$hit=$active[intdiv(intdiv($p,$w),16)*$sc+intdiv($p%$w,16)]==="\1";$support[$p]=$hit?"\1":"\0";$anchor=($hit?0:2)+.0001;$rhs[$p]=(($hit?1:0)+$anchor)*$initial[$p];$diagonal[$p]=($hit?1:0)+4*$regular+$anchor;}

 $operator=function(SplFixedArray $a)use($w,$h,$N,$regular,$support):SplFixedArray{$lap=cf11_lap($a,$w,$h);$out=new SplFixedArray($N);for($p=0;$p<$N;$p++){$hit=$support[$p]==="\1";$anchor=($hit?0:2)+.0001;$out[$p]=($hit?1:0)*$a[$p]+$regular*$lap[$p]+$anchor*$a[$p];}return $out;};$a=cf11_cg($initial,$rhs,$diagonal,$operator);$out=new CF9Plane($w,$h,1);$out->a=$a;return $out;

}

function cf11_phase(CF9Plane $uv,?string $valid=null):array{$best=null;$error=INF;$bx=$by=0;foreach([[1,0],[0,1],[1,1]]as [$px,$py]){$w=$uv->w+$px;$h=$uv->h+$py;$pad=new CF9Plane($w,$h,2);for($y=0;$y<$h;$y++)for($x=0;$x<$w;$x++)for($k=0;$k<2;$k++)$pad->a[($y*$w+$x)*2+$k]=$uv->a[(max(0,$y-$py)*$uv->w+max(0,$x-$px))*2+$k];$take=null;if($valid!==null){$take=str_repeat("\0",$w*$h);for($y=0;$y<$uv->h;$y++)for($x=0;$x<$uv->w;$x++)$take[($y+$py)*$w+$x+$px]=$valid[$y*$uv->w+$x];}$f=cf9_triangle($pad,$take);if($f===null)continue;$sum=0.;$n=0;for($y=2;$y<$f->h*2-2;$y+=3)for($x=2;$x<$f->w*2-2;$x+=3){$yi=intdiv($y,2);$xi=intdiv($x,2);$yn=$yi+($y%2?1:-1);$xn=$xi+($x%2?1:-1);for($k=0;$k<2;$k++){$a=$f->a;$pred=($a[($yi*$f->w+$xi)*2+$k]*.75+$a[($yi*$f->w+$xn)*2+$k]*.25)*.75+($a[($yn*$f->w+$xi)*2+$k]*.75+$a[($yn*$f->w+$xn)*2+$k]*.25)*.25;$d=$pred-$pad->a[($y*$w+$x)*2+$k];$sum+=$d*$d;$n++;}}if($sum/max(1,$n)<$error){$error=$sum/max(1,$n);$best=$f;$bx=-$px;$by=-$py;}}return[$best,$bx,$by];}

function cf11_photo_reg(array $m,int $rw,int $rh,bool $text):float{if($text)return .003;if($m['d']>=15&&($rw!==$m['ow']||$rh!==$m['oh'])){$t=max(0,min(1,(min($rw/$m['ow'],$rh/$m['oh'])-.6)/.15));return .02+.30*$t*$t;}return $m['d']>=14&&($rw!==$m['ow']||$rh!==$m['oh'])?.16:.02;}

function cf_sampling_restore(GdImage $image,array $m,GdImage $small,string $password,array $initial,bool $allowPhase=false):array{

 $key=cf_derive($password,hex2bin($m['s']));$map=cf_open_map($m,$key);[$order,$tiles]=CFTPacking::plan($m,$key,$map['mask']);$geometry=CF11Geometry::inverse($m['w'],$m['h']);$active=cf11_original_active($m,$map,$geometry);$rw=imagesx($image);$rh=imagesy($image);$iw=$m['iw'];$ih=$m['ih'];$uv=new CF9Plane($rw,$rh,2);$yplane=new CF9Plane($rw,$rh,1);

 for($y=0;$y<$rh;$y++)for($x=0;$x<$rw;$x++){$v=imagecolorat($image,$x,$y);$r=($v>>16)&255;$g=($v>>8)&255;$b=$v&255;$yy=($r*19595+$g*38470+$b*7471)/65536;$p=$y*$rw+$x;$yplane->a[$p]=$yy;$uv->a[$p*2]=$b-$yy;$uv->a[$p*2+1]=$r-$yy;}

 $rgb=cf_rgb($map['bg']>>8);$by=($rgb[0]*19595+$rgb[1]*38470+$rgb[2]*7471)/65536;$text=(bool)($m['b']&4)||($m['z']>0&&$m['k']*256<$iw*$ih*.65);$mono=(bool)($m['b']&2);$colors=null;$edgeMargin=0.;
 $scale=min($rw/$m['ow'],$rh/$m['oh']);
 [$phaseX,$phaseY]=$m['d']>=15&&$scale<.68?cf11_resize_phase($yplane,$m['ow'],$m['oh']):[0.,0.];
 $phaseStrength=min(1,max(abs($phaseX),abs($phaseY))/.45);
 $severity=$m['d']>=15&&!$text?min(1,max(0,(.62-$scale)/.15)):0.;

 $valid=null;if($m['d']>=14){$nx=intdiv($m['ow'],16);$ny=intdiv($m['oh'],16);$allowed=str_repeat("\0",$nx*$ny);for($i=0;$i<$m['k'];$i++)$allowed[$tiles[$i]]="\1";$valid=str_repeat("\0",$rw*$rh);for($y=0;$y<$rh;$y++){$oy=($y+.5)*$m['oh']/$rh;$iy=(int)floor($oy/16);$fy=fmod($oy,16.);if($iy>=$ny||$fy<3||$fy>13)continue;for($x=0;$x<$rw;$x++){$ox=($x+.5)*$m['ow']/$rw;$ix=(int)floor($ox/16);$fx=fmod($ox,16.);if($ix<$nx&&$fx>=3&&$fx<=13&&$allowed[$iy*$nx+$ix]==="\1")$valid[$y*$rw+$x]="\1";}}}$native=cf9_triangle($uv,$valid);$offsetX=$offsetY=0;if($native===null&&$allowPhase)[$native,$offsetX,$offsetY]=cf11_phase($uv,$valid);if($native===null&&!$allowPhase&&$rw===$m['ow']&&$rh===$m['oh'])return $initial;$edgeMargin=($native!==null||$allowPhase)&&$rw===$m['ow']&&$rh===$m['oh']&&!$text&&cf11_block_score($initial[0])>1.35?1.:0.;if(!$mono){$plane=$native??$uv;$colors=cf11_scatter($plane,$native?2:1,$m,$map,$order,$tiles,$geometry,$active,$rw,$rh,[$rgb[2]-$by,$rgb[0]-$by],.5,cf11_photo_reg($m,$rw,$rh,$text)+$severity*(.04+.05*$phaseStrength),!$text,false,$edgeMargin,$offsetX+$phaseX,$offsetY+$phaseY,$severity,$phaseStrength);unset($plane);}unset($uv,$native);

 $direct=$rw===$m['ow']&&$rh===$m['oh'];if($direct&&$edgeMargin===0.){unset($yplane);$yy=cf11_native_y($image,$m,$order,$tiles,$geometry,$active,$by,$text?.001:.01);}else{$yy=cf11_scatter($yplane,1,$m,$map,$order,$tiles,$geometry,$active,$rw,$rh,[$by],.35,$text?.001:.01,!$text&&!$direct,$text,$edgeMargin,$phaseX,$phaseY,$severity,$phaseStrength);unset($yplane);}

 $table=cf_calibration($small,$m);$out=cf_new($iw,$ih);for($y=0;$y<$ih;$y++)for($x=0;$x<$iw;$x++){$p=$y*$iw+$x;$v=$yy->a[$p];if($mono){$q=pm_clip($v);$g=pm_clip($table[$q][0]*.299+$table[$q][1]*.587+$table[$q][2]*.114);$color=$g*65793;}else{$r=$v+$colors->a[$p*2+1];$b=$v+$colors->a[$p*2];$g=($v-.299*$r-.114*$b)/.587;$color=($table[pm_clip($r)][0]<<16)|($table[pm_clip($g)][1]<<8)|$table[pm_clip($b)][2];}imagesetpixel($out,$x,$y,$color);}return[$out,$initial[1]];

}



function cf_tomato_transform(array $source,bool $inverse=false,int $iw=0,int $ih=0):array{return CF11Geometry::transform($source,$inverse,$iw,$ih);}

function cf_encrypt(array $source,array $cover,string $password=''):array{$w=imagesx($source[0]);$h=imagesy($source[0]);return cf_embed_payload(cf_tomato_transform($source),$cover,$password,$w,$h,cf_source_palette($source));}

function cf_decrypt(array $received,string $password=''):array{$before=$received[0];$received=fr_locate($received);$registered=$received[0]!==$before;[$m,$small]=cf_header($received[0]);$payload=cf_extract_payload($received,$password);$damaged=cf_crc_image($payload)!==$m['crc'];$out=cf_tomato_transform($payload,true,$m['iw'],$m['ih']);if($damaged){$out=cf_sampling_restore($received[0],$m,$small,$password,$out,$registered);$cal=base64_decode($m['cal']);$pal=[];for($i=0;$i<$m['z'];$i++)$pal[]=[ord($cal[36+$i*3]),ord($cal[37+$i*3]),ord($cal[38+$i*3])];$out=($m['b']&4)!==0||$m['z']>0&&$m['k']*256<$m['iw']*$m['ih']*.65?cf_repair_pixels($out,$pal):$out;}return $out;}



}

namespace {



/** MisanScramble v1.4. Same six-argument API on all platforms. */

const VERSION='v1.4';
const AUTHOR='fanmod';

function cf_input(mixed $value):array {

 if(is_array($value))return $value;

 if(!is_string($value))throw new RuntimeException('Invalid image input');

 if(!str_contains($value,"\0")&&is_file($value))return pm_load($value);

 $temp=tempnam(sys_get_temp_dir(),'misan-input-');

 if($temp===false)throw new RuntimeException('Cannot allocate input');

 try{if(file_put_contents($temp,$value)===false)throw new RuntimeException('Cannot read input');return pm_load($temp);}finally{unlink($temp);}

}

function process(string $mode,mixed $input,mixed $cover=null,string $key='',?string $output=null,?callable $progress=null):array {

 if(!in_array($mode,['encrypt','decrypt'],true))throw new RuntimeException('mode must be encrypt or decrypt');

 if(strlen($key)>16384)throw new RuntimeException('Password exceeds 16384 UTF-8 bytes');

 $emit=$progress??static function(float $n):void{};

 $emit(.02);$source=cf_input($input);$emit(.08);

 if($mode==='encrypt'){

  if($cover===null||$cover==='')throw new RuntimeException('Cover is required');

  $surface=cf_input($cover);$emit(.15);$result=\CFT2\cf_encrypt($source,$surface,$key);

 }else{$emit(.15);$result=\CFT2\cf_decrypt($source,$key);}

 $emit(.92);

 $tmp=tempnam(sys_get_temp_dir(),'misan-');

 if($tmp===false)throw new RuntimeException('Cannot allocate output');

 unlink($tmp);

 try{pm_save($result,$tmp);$data=file_get_contents($tmp);}finally{if(is_file($tmp))unlink($tmp);}

 if($output!==null){

  $dir=dirname($output);if(!is_dir($dir)&&!mkdir($dir,0775,true))throw new RuntimeException('Cannot create output directory');

  $f=@fopen($output,'xb');if(!$f)throw new RuntimeException('Output exists or is not writable');

  try{$at=0;while($at<strlen($data)){$n=fwrite($f,substr($data,$at));if($n===false||$n===0)throw new RuntimeException('Cannot write output');$at+=$n;}}finally{fclose($f);}

 }

 $emit(1.0);return ['data'=>$data,'width'=>imagesx($result[0]),'height'=>imagesy($result[0]),'mime'=>'image/png','output'=>$output];

}

if(PHP_SAPI==='cli'&&realpath($_SERVER['SCRIPT_FILENAME']??'')===__FILE__){

 try{

  if(count($argv)!==6)throw new RuntimeException('Usage: php misan.php encrypt|decrypt input cover|- key|- output');

  $k=$argv[4]==='-'?'':(str_starts_with($argv[4],'@@')?substr($argv[4],1):(str_starts_with($argv[4],'@')?file_get_contents(substr($argv[4],1)):$argv[4]));

  if(str_starts_with($argv[4],'@')&&!str_starts_with($argv[4],'@@')&&str_starts_with($k,"\xEF\xBB\xBF"))$k=substr($k,3);

  $r=process($argv[1],$argv[2],$argv[3]==='-'?null:$argv[3],$k,$argv[5]);unset($r['data']);echo json_encode($r,JSON_UNESCAPED_UNICODE).PHP_EOL;

 }catch(Throwable $e){fwrite(STDERR,$e->getMessage().PHP_EOL);exit(1);}

}elseif(PHP_SAPI!=='cli'&&realpath($_SERVER['SCRIPT_FILENAME']??'')===__FILE__){

 try{

  if($_SERVER['REQUEST_METHOD']!=='POST')throw new RuntimeException('POST mode,input,cover,key,output');

  $mode=$_POST['mode']??'';$file=$_FILES['input']??null;$cover=$_FILES['cover']??null;

  if(!$file||$file['error']!==UPLOAD_ERR_OK)throw new RuntimeException('Select an image');

  $r=process($mode,$file['tmp_name'],$cover&&$cover['error']===UPLOAD_ERR_OK?$cover['tmp_name']:null,$_POST['key']??'',null,null);

  $name=preg_replace('/[^a-zA-Z0-9_.-]/','_',basename($_POST['output']??($mode==='encrypt'?'encrypted.png':'restored.png')));

  if(!str_ends_with(strtolower($name),'.png'))$name.='.png';

  header('Content-Type: image/png');header('Content-Disposition: attachment; filename="'.$name.'"');echo $r['data'];

 }catch(Throwable $e){http_response_code(400);header('Content-Type: application/json; charset=utf-8');echo json_encode(['error'=>$e->getMessage()],JSON_UNESCAPED_UNICODE);}

}



}

