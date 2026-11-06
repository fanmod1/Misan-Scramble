// Copyright (c) 2026 fanmod
import javax.swing.*;
import javax.swing.border.*;
import javax.swing.filechooser.FileNameExtensionFilter;
import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.event.*;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.*;

/** MisanScramble v1.4 desktop UI; JDK 8 and JDK 17 share this source. */
public class MisanApp extends JFrame {
 static final Color BG=new Color(0xf2f5f0),FG=new Color(0x243c35),GREEN=new Color(0x21483e),MUTED=new Color(0x80907e);
 String mode="encrypt";File input,cover;MisanCore.Result result;boolean busy;
 JPanel page,workspace,controls,resultCard,files,coverField;JButton encryptTab,decryptTab,inputButton,coverButton,run,save,show;
 JLabel inputLabel,status,percent,dimensions,resultLabel;JPasswordField key;JProgressBar progress;Preview preview;
 public MisanApp(){
  super("弥散混淆 v1.4");setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);setSize(1120,780);setMinimumSize(new Dimension(380,620));setLocationRelativeTo(null);
  UIManager.put("FileChooser.readOnly",Boolean.TRUE);Font font=new Font("Microsoft YaHei UI",Font.PLAIN,13);
  java.util.Enumeration<Object> e=UIManager.getDefaults().keys();while(e.hasMoreElements()){Object k=e.nextElement();if(UIManager.get(k) instanceof javax.swing.plaf.FontUIResource)UIManager.put(k,font);}
  page=new JPanel(new BorderLayout(0,26));page.setBackground(BG);page.setBorder(new EmptyBorder(30,30,30,30));
  JPanel header=new JPanel(new FlowLayout(FlowLayout.LEFT,14,0));header.setOpaque(false);
  BufferedImage logo;try(InputStream stream=MisanApp.class.getResourceAsStream("/assets/icon.png")){if(stream==null)throw new IOException("Missing icon");logo=ImageIO.read(stream);}catch(IOException error){throw new IllegalStateException(error);}setIconImage(logo);JLabel icon=new JLabel(new ImageIcon(logo.getScaledInstance(52,52,Image.SCALE_SMOOTH)));header.add(icon);
  JPanel title=column();title.setOpaque(false);JLabel brand=label("弥散混淆  v1.4",25,FG);brand.setFont(brand.getFont().deriveFont(Font.BOLD));title.add(brand);title.add(Box.createVerticalStrut(4));title.add(label("图片混淆与还原 · fanmod",12,MUTED));header.add(title);page.add(header,BorderLayout.NORTH);
  workspace=new JPanel(new BorderLayout(24,18));workspace.setOpaque(false);
  controls=new RoundPanel();controls.setLayout(new BoxLayout(controls,BoxLayout.Y_AXIS));controls.setBorder(new EmptyBorder(25,25,25,25));controls.setPreferredSize(new Dimension(380,580));
  JPanel tabs=new JPanel(new GridLayout(1,2,4,0));tabs.setBackground(new Color(0xedf2eb));tabs.setBorder(new EmptyBorder(4,4,4,4));tabs.setMaximumSize(new Dimension(Integer.MAX_VALUE,49));
  encryptTab=button("混淆",()->setMode("encrypt"),false);decryptTab=button("解混淆",()->setMode("decrypt"),false);tabs.add(encryptTab);tabs.add(decryptTab);controls.add(tabs);gap(controls,24);
  files=new JPanel(new GridLayout(1,2,14,0));files.setOpaque(false);files.setMaximumSize(new Dimension(Integer.MAX_VALUE,195));
  JPanel inputField=column();inputField.setOpaque(false);inputLabel=label("要混淆的图片",12,FG);inputField.add(inputLabel);gap(inputField,10);
  inputButton=fileButton("选择图片",false);inputField.add(inputButton);files.add(inputField);
  coverField=column();coverField.setOpaque(false);coverField.add(label("表图",12,FG));gap(coverField,10);coverButton=fileButton("选择表图",true);coverField.add(coverButton);files.add(coverField);controls.add(files);gap(controls,24);
  JPanel keyHead=new JPanel(new BorderLayout());keyHead.setOpaque(false);keyHead.setMaximumSize(new Dimension(Integer.MAX_VALUE,20));keyHead.add(label("密码",12,FG),BorderLayout.WEST);keyHead.add(label("可留空",11,MUTED),BorderLayout.EAST);controls.add(keyHead);gap(controls,10);
  JPanel keyBox=new JPanel(new BorderLayout());keyBox.setBackground(Color.WHITE);keyBox.setBorder(new CompoundBorder(new LineBorder(new Color(0xdce4d9)),new EmptyBorder(4,10,4,5)));keyBox.setMaximumSize(new Dimension(Integer.MAX_VALUE,48));
  key=new JPasswordField();key.setEchoChar('●');key.setBorder(null);key.setForeground(FG);show=button("显示",()->{boolean visible=key.getEchoChar()!=0;key.setEchoChar(visible?(char)0:'●');show.setText(visible?"隐藏":"显示");},false);show.setFont(show.getFont().deriveFont(11f));keyBox.add(key,BorderLayout.CENTER);keyBox.add(show,BorderLayout.EAST);controls.add(keyBox);gap(controls,24);
  run=button("开始混淆    →",()->start(),true);run.setMaximumSize(new Dimension(Integer.MAX_VALUE,50));controls.add(run);gap(controls,22);
  JPanel ph=new JPanel(new BorderLayout(8,0));ph.setOpaque(false);ph.setMaximumSize(new Dimension(Integer.MAX_VALUE,35));status=label("请选择图片和表图",11,MUTED);percent=label("",11,MUTED);ph.add(status,BorderLayout.CENTER);ph.add(percent,BorderLayout.EAST);controls.add(ph);gap(controls,8);
  progress=new JProgressBar(0,1000);progress.setBorderPainted(false);progress.setBackground(new Color(0xedf2eb));progress.setForeground(new Color(0x769a66));progress.setMaximumSize(new Dimension(Integer.MAX_VALUE,5));controls.add(progress);controls.add(Box.createVerticalGlue());
  resultCard=new RoundPanel();resultCard.setLayout(new BorderLayout(0,20));resultCard.setBorder(new EmptyBorder(24,24,22,24));
  JPanel rh=new JPanel(new BorderLayout());rh.setOpaque(false);rh.add(label("预览",12,FG),BorderLayout.WEST);dimensions=label("",11,MUTED);rh.add(dimensions,BorderLayout.EAST);resultCard.add(rh,BorderLayout.NORTH);
  preview=new Preview();resultCard.add(preview,BorderLayout.CENTER);
  JPanel footer=new JPanel(new BorderLayout());footer.setOpaque(false);resultLabel=label("等待处理",11,MUTED);footer.add(resultLabel,BorderLayout.WEST);save=button("保存图片    ↓",()->download(),false);save.setBackground(new Color(0xf0f5e8));save.setForeground(new Color(0x335b3c));save.setEnabled(false);footer.add(save,BorderLayout.EAST);resultCard.add(footer,BorderLayout.SOUTH);
  for(Component c:controls.getComponents())if(c instanceof JComponent)((JComponent)c).setAlignmentX(LEFT_ALIGNMENT);
  workspace.add(controls,BorderLayout.WEST);workspace.add(resultCard,BorderLayout.CENTER);page.add(workspace,BorderLayout.CENTER);
  JScrollPane scroll=new JScrollPane(page);scroll.setBorder(null);scroll.getViewport().setBackground(BG);scroll.getVerticalScrollBar().setUnitIncrement(18);scroll.setHorizontalScrollBarPolicy(ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);setContentPane(scroll);
  addComponentListener(new ComponentAdapter(){boolean narrow;public void componentResized(ComponentEvent e){boolean n=getWidth()<800;if(n==narrow)return;narrow=n;workspace.removeAll();if(n){workspace.setLayout(new BoxLayout(workspace,BoxLayout.Y_AXIS));controls.setMaximumSize(new Dimension(Integer.MAX_VALUE,580));preview.setPreferredSize(new Dimension(300,320));resultCard.setPreferredSize(new Dimension(330,450));workspace.add(controls);workspace.add(Box.createVerticalStrut(18));workspace.add(resultCard);}else{workspace.setLayout(new BorderLayout(24,18));preview.setPreferredSize(new Dimension(350,370));workspace.add(controls,BorderLayout.WEST);workspace.add(resultCard,BorderLayout.CENTER);}page.revalidate();}});
  setMode("encrypt");
 }
 static JPanel column(){JPanel p=new JPanel();p.setLayout(new BoxLayout(p,BoxLayout.Y_AXIS));p.setAlignmentX(LEFT_ALIGNMENT);return p;}
 static JLabel label(String text,int size,Color color){JLabel l=new JLabel(text);l.setFont(new Font("Microsoft YaHei UI",Font.PLAIN,size));l.setForeground(color);l.setAlignmentX(LEFT_ALIGNMENT);return l;}
 static void gap(JPanel p,int n){p.add(Box.createVerticalStrut(n));}
 static JButton button(String text,Runnable action,boolean primary){JButton b=new JButton(text);b.setFont(new Font("Microsoft YaHei UI",Font.PLAIN,13));b.setBackground(primary?GREEN:Color.WHITE);b.setForeground(primary?Color.WHITE:FG);b.setFocusPainted(false);b.setBorder(new EmptyBorder(13,16,13,16));b.setCursor(Cursor.getPredefinedCursor(Cursor.HAND_CURSOR));b.setAlignmentX(LEFT_ALIGNMENT);b.addActionListener(e->action.run());return b;}
 JButton fileButton(String text,boolean isCover){JButton b=button("<html><center>＋<br><br>"+text+"</center></html>",()->choose(isCover),false);b.setBackground(new Color(0xfafbf8));b.setForeground(new Color(0x839a89));b.setBorder(new CompoundBorder(new LineBorder(new Color(0xbdccbd)),new EmptyBorder(4,4,4,4)));b.setPreferredSize(new Dimension(140,155));b.setMinimumSize(new Dimension(100,155));b.setMaximumSize(new Dimension(Integer.MAX_VALUE,155));return b;}
 void reset(){result=null;save.setEnabled(false);progress.setValue(0);percent.setText("");dimensions.setText("");resultLabel.setText("等待处理");}
 void setMode(String m){if(busy)return;mode=m;reset();boolean en=mode.equals("encrypt");encryptTab.setBackground(en?Color.WHITE:new Color(0xedf2eb));decryptTab.setBackground(en?new Color(0xedf2eb):Color.WHITE);coverField.setVisible(en);files.setLayout(new GridLayout(1,en?2:1,14,0));inputLabel.setText(en?"要混淆的图片":"要还原的图片");run.setText(en?"开始混淆    →":"开始解混淆    →");status.setText(en?"请选择图片和表图":"请选择要还原的图片");files.revalidate();}
 void choose(boolean isCover){JFileChooser fc=new JFileChooser();fc.setDialogTitle("选择图片");fc.setFileFilter(new FileNameExtensionFilter("图片","png","jpg","jpeg","webp","gif","bmp","tif","tiff"));if(fc.showOpenDialog(this)!=JFileChooser.APPROVE_OPTION)return;
  File f=fc.getSelectedFile();try{BufferedImage im=ImageIO.read(f);if(im==null)throw new IOException("无法读取此图片格式");if((long)im.getWidth()*im.getHeight()>48000000)throw new IOException("图片超过48MP上限");JButton b=isCover?coverButton:inputButton;int w=130,h=130;double s=Math.min(w/(double)im.getWidth(),h/(double)im.getHeight());b.setIcon(new ImageIcon(im.getScaledInstance(Math.max(1,(int)(im.getWidth()*s)),Math.max(1,(int)(im.getHeight()*s)),Image.SCALE_SMOOTH)));b.setText("");b.setToolTipText(f.getName());if(isCover)cover=f;else{input=f;preview.image=im;preview.repaint();}reset();status.setText(f.getName());}catch(Exception e){status.setText(e.getMessage());}}
 void lock(boolean state){busy=state;for(JComponent c:new JComponent[]{encryptTab,decryptTab,inputButton,coverButton,key,show,run})c.setEnabled(!state);}
 void start(){if(input==null||mode.equals("encrypt")&&cover==null){status.setText(mode.equals("encrypt")?"请选择图片和表图":"请选择要还原的图片");return;}
  reset();lock(true);status.setText(mode.equals("encrypt")?"正在混淆…":"正在还原…");final String m=mode,k=new String(key.getPassword());final File in=input,cv=cover;
  new SwingWorker<MisanCore.Result,Double>(){protected MisanCore.Result doInBackground()throws Exception{return MisanCore.process(m,in.getPath(),m.equals("encrypt")?cv.getPath():null,k,null,n->publish(n));}
   protected void process(java.util.List<Double> values){for(double n:values)progress.setValue(Math.max(progress.getValue(),(int)Math.round(n*1000)));percent.setText(Math.round(progress.getValue()/10.)+"%");}
   protected void done(){try{result=get();preview.image=ImageIO.read(new ByteArrayInputStream(result.data));preview.repaint();dimensions.setText(result.width+" × "+result.height);resultLabel.setText("已完成");status.setText(m.equals("encrypt")?"混淆完成":"还原完成");save.setEnabled(true);}catch(Exception e){Throwable t=e.getCause()==null?e:e.getCause();String msg=t.getMessage();status.setText(msg!=null&&msg.toLowerCase().contains("password")?"密码不正确":msg);progress.setValue(0);percent.setText("");}finally{lock(false);}}
  }.execute();
 }
 void download(){if(result==null)return;JFileChooser fc=new JFileChooser();fc.setDialogTitle("保存图片");fc.setSelectedFile(new File(mode.equals("encrypt")?"encrypted.png":"restored.png"));fc.setFileFilter(new FileNameExtensionFilter("PNG 图片","png"));if(fc.showSaveDialog(this)!=JFileChooser.APPROVE_OPTION)return;File f=fc.getSelectedFile();if(!f.getName().toLowerCase().endsWith(".png"))f=new File(f.getParentFile(),f.getName()+".png");if(f.exists()&&JOptionPane.showConfirmDialog(this,"替换已有文件？","保存图片",JOptionPane.YES_NO_OPTION)!=JOptionPane.YES_OPTION)return;try{Files.write(f.toPath(),result.data);status.setText("图片已保存");}catch(IOException e){status.setText(e.getMessage());}}
 static class RoundPanel extends JPanel {RoundPanel(){setOpaque(false);}protected void paintComponent(Graphics g){Graphics2D a=(Graphics2D)g.create();a.setRenderingHint(RenderingHints.KEY_ANTIALIASING,RenderingHints.VALUE_ANTIALIAS_ON);a.setColor(Color.WHITE);a.fillRoundRect(0,0,getWidth()-1,getHeight()-1,26,26);a.setColor(new Color(0xe0e7dd));a.drawRoundRect(0,0,getWidth()-1,getHeight()-1,26,26);a.dispose();super.paintComponent(g);}}
 static class Preview extends JPanel {BufferedImage image;Preview(){setBackground(new Color(0xf6f8f3));setPreferredSize(new Dimension(350,370));}protected void paintComponent(Graphics g){super.paintComponent(g);Graphics2D a=(Graphics2D)g.create();a.setRenderingHint(RenderingHints.KEY_INTERPOLATION,RenderingHints.VALUE_INTERPOLATION_BICUBIC);if(image==null){a.setColor(new Color(0xa1afa0));a.setFont(new Font("Microsoft YaHei UI",Font.PLAIN,12));String t="图片将在这里显示";a.drawString(t,(getWidth()-a.getFontMetrics().stringWidth(t))/2,getHeight()/2);}else{double s=Math.min((getWidth()-24)/(double)image.getWidth(),(getHeight()-24)/(double)image.getHeight());int w=Math.max(1,(int)(image.getWidth()*s)),h=Math.max(1,(int)(image.getHeight()*s));a.drawImage(image,(getWidth()-w)/2,(getHeight()-h)/2,w,h,null);}a.dispose();}}
 public static void main(String[] args){SwingUtilities.invokeLater(()->new MisanApp().setVisible(true));}
}
