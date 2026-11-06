package com.misanscramble.app;

import android.app.Activity;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;
import android.text.method.PasswordTransformationMethod;
import android.view.View;
import android.view.WindowManager;
import android.widget.*;
import java.io.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import com.misanscramble.core.MisanCore;

/** Native Java + XML UI. No WebView, network permission or server. */
public class MainActivity extends Activity {
 private String mode="encrypt";private Uri input,cover;private boolean busy,keyVisible;private MisanCore.Result result;
 private TextView status,percent,dimensions,resultLabel;private EditText key;private ProgressBar progress;private ImageView preview;
 private final ExecutorService executor=Executors.newSingleThreadExecutor();
 protected void onCreate(Bundle state){super.onCreate(state);getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);setContentView(R.layout.activity_main);
  View scroll=findViewById(R.id.scroll);scroll.setOnApplyWindowInsetsListener((v,insets)->{int l,t,r,b;if(android.os.Build.VERSION.SDK_INT>=30){android.graphics.Insets bars=insets.getInsets(android.view.WindowInsets.Type.systemBars());l=bars.left;t=bars.top;r=bars.right;b=bars.bottom;}else{l=insets.getSystemWindowInsetLeft();t=insets.getSystemWindowInsetTop();r=insets.getSystemWindowInsetRight();b=insets.getSystemWindowInsetBottom();}v.setPadding(l,t,r,b);return insets;});
  status=findViewById(R.id.status);percent=findViewById(R.id.percent);dimensions=findViewById(R.id.dimensions);resultLabel=findViewById(R.id.resultLabel);key=findViewById(R.id.key);progress=findViewById(R.id.progress);preview=findViewById(R.id.preview);
  findViewById(R.id.encryptTab).setOnClickListener(v->setMode("encrypt"));findViewById(R.id.decryptTab).setOnClickListener(v->setMode("decrypt"));
  findViewById(R.id.inputButton).setOnClickListener(v->pick(10));findViewById(R.id.coverButton).setOnClickListener(v->pick(11));
  findViewById(R.id.showKey).setOnClickListener(v->{keyVisible=!keyVisible;key.setTransformationMethod(keyVisible?null:PasswordTransformationMethod.getInstance());key.setSelection(key.length());((Button)v).setText(keyVisible?"隐藏":"显示");});
  findViewById(R.id.run).setOnClickListener(v->start());findViewById(R.id.save).setOnClickListener(v->save());adapt();
 }
 private void reset(){result=null;findViewById(R.id.save).setEnabled(false);progress.setProgress(0);percent.setText("");dimensions.setText("");resultLabel.setText("等待处理");}
 private void setMode(String m){if(busy)return;mode=m;reset();boolean en=m.equals("encrypt");findViewById(R.id.coverField).setVisibility(en?View.VISIBLE:View.GONE);((TextView)findViewById(R.id.inputLabel)).setText(en?"要混淆的图片":"要还原的图片");((Button)findViewById(R.id.run)).setText(en?"开始混淆    →":"开始解混淆    →");findViewById(R.id.encryptTab).setBackgroundResource(en?R.drawable.field:android.R.color.transparent);findViewById(R.id.decryptTab).setBackgroundResource(en?android.R.color.transparent:R.drawable.field);status.setText(en?"请选择图片和表图":"请选择要还原的图片");}
 private void pick(int request){Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT);i.setType("image/*");i.addCategory(Intent.CATEGORY_OPENABLE);startActivityForResult(i,request);}
 private byte[] read(Uri uri)throws IOException{try(InputStream in=getContentResolver().openInputStream(uri);ByteArrayOutputStream out=new ByteArrayOutputStream()){if(in==null)throw new IOException("无法读取图片");byte[] buffer=new byte[32768];int n;while((n=in.read(buffer))!=-1){if(out.size()+n>134217728)throw new IOException("文件过大");out.write(buffer,0,n);}return out.toByteArray();}}
 protected void onActivityResult(int request,int code,Intent data){super.onActivityResult(request,code,data);if(code!=RESULT_OK||data==null||data.getData()==null)return;Uri uri=data.getData();
  if(request==12){if(result==null)return;final byte[] bytes=result.data;executor.execute(()->{try(OutputStream out=getContentResolver().openOutputStream(uri,"wt")){if(out==null)throw new IOException("无法保存图片");out.write(bytes);runOnUiThread(()->status.setText("图片已保存"));}catch(Exception e){runOnUiThread(()->status.setText("保存失败"));}});return;}
  if(request!=10&&request!=11)return;
  executor.execute(()->{try{byte[] bytes=read(uri);BitmapFactory.Options options=new BitmapFactory.Options();options.inJustDecodeBounds=true;BitmapFactory.decodeByteArray(bytes,0,bytes.length,options);if(options.outWidth<1||options.outHeight<1)throw new IOException("无法读取此图片格式");if((long)options.outWidth*options.outHeight>48000000)throw new IOException("图片超过48MP上限");options.inJustDecodeBounds=false;options.inSampleSize=Math.max(1,Math.max(options.outWidth,options.outHeight)/1200);Bitmap bitmap=BitmapFactory.decodeByteArray(bytes,0,bytes.length,options);runOnUiThread(()->{reset();if(request==10){input=uri;preview.setImageBitmap(bitmap);findViewById(R.id.empty).setVisibility(View.GONE);}else cover=uri;ImageView thumb=findViewById(request==10?R.id.inputThumb:R.id.coverThumb);thumb.setImageBitmap(bitmap);thumb.setVisibility(View.VISIBLE);findViewById(request==10?R.id.inputHint:R.id.coverHint).setVisibility(View.GONE);status.setText("图片已选择");});}catch(Throwable e){runOnUiThread(()->status.setText(e.getMessage()==null?"无法读取图片":e.getMessage()));}});
 }
 private void lock(boolean state){busy=state;for(int id:new int[]{R.id.encryptTab,R.id.decryptTab,R.id.inputButton,R.id.coverButton,R.id.key,R.id.showKey,R.id.run})findViewById(id).setEnabled(!state);}
 private void start(){if(input==null||mode.equals("encrypt")&&cover==null){status.setText(mode.equals("encrypt")?"请选择图片和表图":"请选择要还原的图片");return;}
  reset();lock(true);final String m=mode,password=key.getText().toString();final Uri in=input,cv=cover;status.setText(m.equals("encrypt")?"正在混淆…":"正在还原…");
  executor.execute(()->{try{
   MisanCore.Result r=MisanCore.process(m,read(in),m.equals("encrypt")?read(cv):null,password,null,n->runOnUiThread(()->{int value=Math.max(progress.getProgress(),(int)Math.round(n*1000));progress.setProgress(value);percent.setText(Math.round(value/10.)+"%");}));
   BitmapFactory.Options opts=new BitmapFactory.Options();opts.inSampleSize=Math.max(1,Math.max(r.width,r.height)/1400);Bitmap bitmap=BitmapFactory.decodeByteArray(r.data,0,r.data.length,opts);
   runOnUiThread(()->{result=r;preview.setImageBitmap(bitmap);findViewById(R.id.empty).setVisibility(View.GONE);dimensions.setText(r.width+" × "+r.height);resultLabel.setText("已完成");status.setText(m.equals("encrypt")?"混淆完成":"还原完成");lock(false);findViewById(R.id.save).setEnabled(true);});
  }catch(Throwable e){String raw=e.getMessage();final String message=e instanceof OutOfMemoryError?"图片过大，当前设备内存不足":raw!=null&&raw.toLowerCase().contains("password")?"密码不正确":raw==null?"处理失败，请重试":raw;runOnUiThread(()->{lock(false);status.setText(message);progress.setProgress(0);percent.setText("");});}});
 }
 private void save(){if(result==null)return;Intent i=new Intent(Intent.ACTION_CREATE_DOCUMENT);i.setType("image/png");i.addCategory(Intent.CATEGORY_OPENABLE);i.putExtra(Intent.EXTRA_TITLE,mode.equals("encrypt")?"encrypted.png":"restored.png");startActivityForResult(i,12);}
 private int dp(int n){return Math.round(n*getResources().getDisplayMetrics().density);}
 private void adapt(){boolean wide=getResources().getConfiguration().screenWidthDp>=760;LinearLayout workspace=findViewById(R.id.workspace);workspace.setOrientation(wide?LinearLayout.HORIZONTAL:LinearLayout.VERTICAL);LinearLayout.LayoutParams left=new LinearLayout.LayoutParams(wide?dp(350):LinearLayout.LayoutParams.MATCH_PARENT,LinearLayout.LayoutParams.WRAP_CONTENT);findViewById(R.id.controls).setLayoutParams(left);LinearLayout.LayoutParams right=new LinearLayout.LayoutParams(wide?0:LinearLayout.LayoutParams.MATCH_PARENT,LinearLayout.LayoutParams.WRAP_CONTENT,wide?1:0);right.setMargins(wide?dp(18):0,wide?0:dp(18),0,0);findViewById(R.id.resultCard).setLayoutParams(right);}
 public void onConfigurationChanged(Configuration config){super.onConfigurationChanged(config);adapt();}
 protected void onDestroy(){executor.shutdownNow();super.onDestroy();}
}
