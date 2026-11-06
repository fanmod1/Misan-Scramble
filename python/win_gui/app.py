# Copyright (c) 2026 fanmod
"""MisanScramble v1.4 Windows GUI. The algorithm lives in ../core/misan.py."""
from pathlib import Path
import sys, threading, queue, io
import tkinter as tk
from tkinter import filedialog, ttk
from PIL import Image, ImageTk, ImageOps

if not getattr(sys, 'frozen', False):
    sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'core'))
import misan

BG, FG, GREEN, MUTED = '#f2f5f0', '#243c35', '#21483e', '#80907e'

class RoundedFrame(tk.Frame):
    def __init__(self, master, **kwargs):
        super().__init__(master, bg=BG, **kwargs)
        self.back = tk.Canvas(self, bg=BG, highlightthickness=0)
        self.back.place(x=0, y=0, relwidth=1, relheight=1)
        self.back.bind('<Configure>', self.paint)

    def paint(self, event):
        w, h, r = event.width - 1, event.height - 1, 22
        points = [r, 0, w-r, 0, w, 0, w, r, w, h-r, w, h, w-r, h, r, h, 0, h, 0, h-r, 0, r, 0, 0]
        self.back.delete('all')
        self.back.create_polygon(points, smooth=True, splinesteps=24, fill='white', outline='#e0e7dd')

class App:
    def __init__(self, root):
        self.root = root
        root.title('弥散混淆 v1.4')
        root.geometry('1100x760')
        root.minsize(360, 580)
        root.configure(bg=BG)
        icon = Path(getattr(sys, '_MEIPASS', Path(__file__).parent)) / 'app.ico'
        if icon.exists(): root.iconbitmap(str(icon))
        logo_path = Path(getattr(sys, '_MEIPASS', Path(__file__).parent)) / 'app.png'
        self.brand_image = ImageTk.PhotoImage(Image.open(logo_path).resize((52, 52), Image.Resampling.LANCZOS))
        root.option_add('*Font', ('Microsoft YaHei UI', 10))
        self.mode, self.input, self.cover = 'encrypt', None, None
        self.result, self.image, self.photo = None, None, None
        self.busy, self.narrow = False, None
        self.events = queue.Queue()
        style = ttk.Style()
        style.theme_use('clam')
        style.configure('Misan.Horizontal.TProgressbar', background='#769a66', troughcolor='#edf2eb', borderwidth=0, lightcolor='#769a66', darkcolor='#769a66', thickness=5)
        self.canvas = tk.Canvas(root, bg=BG, highlightthickness=0)
        self.scroll = ttk.Scrollbar(root, orient='vertical', command=self.canvas.yview)
        self.scroll.pack(side='right', fill='y')
        self.canvas.pack(fill='both', expand=True)
        self.canvas.configure(yscrollcommand=self.scroll.set)
        self.page = tk.Frame(self.canvas, bg=BG)
        self.page_id = self.canvas.create_window((0, 0), window=self.page, anchor='nw')
        self.page.bind('<Configure>', lambda e: self.canvas.configure(scrollregion=self.canvas.bbox('all')))
        self.canvas.bind('<Configure>', self.layout)
        root.bind_all('<MouseWheel>', lambda e: self.canvas.yview_scroll(int(-e.delta / 120), 'units'))
        header = tk.Frame(self.page, bg=BG)
        header.pack(fill='x', padx=30, pady=(30, 25))
        tk.Label(header, image=self.brand_image, bg=BG).pack(side='left', padx=(0, 14))
        title = tk.Frame(header, bg=BG)
        title.pack(side='left')
        tk.Label(title, text='弥散混淆  v1.4', bg=BG, fg=FG, font=('Segoe UI', 23, 'bold'), anchor='w').pack(anchor='w')
        tk.Label(title, text='图片混淆与还原 · fanmod', bg=BG, fg=MUTED, font=('Microsoft YaHei UI', 10)).pack(anchor='w', pady=(3, 0))
        self.workspace = tk.Frame(self.page, bg=BG)
        self.workspace.pack(fill='both', expand=True, padx=30, pady=(0, 30))
        self.controls = RoundedFrame(self.workspace, padx=24, pady=24)
        self.result_card = RoundedFrame(self.workspace, padx=20, pady=20)
        self.controls.grid_propagate(False)
        self.tabs = tk.Frame(self.controls, bg='#edf2eb', padx=4, pady=4)
        self.tabs.pack(fill='x', pady=(0, 24))
        self.encrypt_tab = self.button(self.tabs, '混淆', lambda: self.set_mode('encrypt'))
        self.decrypt_tab = self.button(self.tabs, '解混淆', lambda: self.set_mode('decrypt'))
        self.encrypt_tab.pack(side='left', fill='x', expand=True)
        self.decrypt_tab.pack(side='left', fill='x', expand=True)
        self.files = tk.Frame(self.controls, bg='white')
        self.files.pack(fill='x')
        self.file_frames, self.file_buttons, self.thumbs = {}, {}, {}
        for which, text in [('input', '要混淆的图片'), ('cover', '表图')]:
            frame = tk.Frame(self.files, bg='white')
            frame.grid(row=0, column=0 if which == 'input' else 1, sticky='ew', padx=(0, 7) if which == 'input' else (7, 0))
            self.files.columnconfigure(0 if which == 'input' else 1, weight=1, uniform='file')
            label = tk.Label(frame, text=text, bg='white', fg=FG, anchor='w', font=('Microsoft YaHei UI', 10, 'bold'))
            label.pack(fill='x', pady=(0, 10))
            btn = tk.Button(frame, text='＋\n\n选择图片' if which == 'input' else '＋\n\n选择表图', command=lambda w=which: self.choose(w), bg='#fafbf8', fg='#839a89', activebackground='#edf2eb', relief='flat', borderwidth=0, highlightthickness=1, highlightbackground='#bdccbd', height=7, cursor='hand2', wraplength=120)
            btn.pack(fill='x')
            self.file_frames[which], self.file_buttons[which] = frame, btn
            if which == 'input': self.input_label = label
        key_head = tk.Frame(self.controls, bg='white')
        key_head.pack(fill='x', pady=(24, 10))
        tk.Label(key_head, text='密码', bg='white', fg=FG, font=('Microsoft YaHei UI', 10, 'bold')).pack(side='left')
        tk.Label(key_head, text='可留空', bg='white', fg=MUTED, font=('Microsoft YaHei UI', 9)).pack(side='right')
        key_box = tk.Frame(self.controls, bg='white', highlightbackground='#dce4d9', highlightthickness=1, padx=10, pady=10)
        key_box.pack(fill='x')
        self.key = tk.Entry(key_box, show='●', relief='flat', bg='white', fg=FG, borderwidth=0)
        self.key.pack(side='left', fill='x', expand=True)
        self.show = self.button(key_box, '显示', self.toggle_key, small=True)
        self.show.pack(side='right')
        self.run = self.button(self.controls, '开始混淆    →', self.start, primary=True)
        self.run.pack(fill='x', pady=(24, 20))
        progress_head = tk.Frame(self.controls, bg='white')
        progress_head.pack(fill='x')
        self.status = tk.Label(progress_head, text='请选择图片和表图', bg='white', fg=MUTED, anchor='w', wraplength=260, font=('Microsoft YaHei UI', 9))
        self.status.pack(side='left', fill='x', expand=True)
        self.percent = tk.Label(progress_head, text='', bg='white', fg=MUTED, font=('Segoe UI', 9))
        self.percent.pack(side='right')
        self.progress = ttk.Progressbar(self.controls, style='Misan.Horizontal.TProgressbar', maximum=1, mode='determinate')
        self.progress.pack(fill='x', pady=(9, 0))
        rhead = tk.Frame(self.result_card, bg='white')
        rhead.pack(fill='x', pady=(0, 20))
        tk.Label(rhead, text='预览', bg='white', fg=FG, font=('Microsoft YaHei UI', 10, 'bold')).pack(side='left')
        self.dimensions = tk.Label(rhead, text='', bg='white', fg=MUTED, font=('Segoe UI', 9))
        self.dimensions.pack(side='right')
        self.preview = tk.Label(self.result_card, text='▧\n\n图片将在这里显示', bg='#f6f8f3', fg='#a1afa0', font=('Microsoft YaHei UI', 12))
        self.preview.pack(fill='both', expand=True)
        self.preview.bind('<Configure>', lambda e: self.draw_preview())
        footer = tk.Frame(self.result_card, bg='white')
        footer.pack(fill='x', pady=(20, 0))
        self.result_label = tk.Label(footer, text='等待处理', bg='white', fg=MUTED, font=('Microsoft YaHei UI', 9))
        self.result_label.pack(side='left')
        self.save = self.button(footer, '保存图片    ↓', self.download)
        self.save.configure(state='disabled', bg='#f0f5e8', fg='#335b3c')
        self.save.pack(side='right')
        self.set_mode('encrypt')
        root.after(60, self.poll)

    def button(self, parent, text, command, primary=False, small=False):
        return tk.Button(parent, text=text, command=command, bg=GREEN if primary else 'white', fg='white' if primary else FG, activebackground='#2f5d4f' if primary else '#edf2eb', activeforeground='white' if primary else FG, relief='flat', bd=0, padx=8 if small else 16, pady=2 if small else 12, cursor='hand2', font=('Microsoft YaHei UI', 9 if small else 10, 'normal' if small else 'bold'))

    def layout(self, event):
        self.canvas.itemconfigure(self.page_id, width=event.width)
        narrow = event.width < 800
        if self.narrow == narrow: return
        self.narrow = narrow
        if not hasattr(self, 'workspace'): return
        self.controls.grid_forget(); self.result_card.grid_forget()
        self.workspace.columnconfigure(0, weight=1 if narrow else 0, minsize=0 if narrow else 365)
        self.workspace.columnconfigure(1, weight=0 if narrow else 1)
        self.controls.configure(width=365, height=580)
        self.controls.grid(row=0, column=0, sticky='nsew', padx=(0, 0 if narrow else 22))
        self.result_card.grid(row=1 if narrow else 0, column=0 if narrow else 1, sticky='nsew', pady=(18 if narrow else 0, 0))
        self.preview.configure(height=18 if narrow else 1)

    def reset(self):
        self.result = None
        self.save.configure(state='disabled')
        self.progress['value'] = 0
        self.percent.configure(text='')
        self.dimensions.configure(text='')
        self.result_label.configure(text='等待处理')

    def set_mode(self, mode):
        if self.busy: return
        self.mode = mode
        self.reset()
        self.encrypt_tab.configure(bg='white' if mode == 'encrypt' else '#edf2eb', fg=GREEN if mode == 'encrypt' else MUTED)
        self.decrypt_tab.configure(bg='white' if mode == 'decrypt' else '#edf2eb', fg=GREEN if mode == 'decrypt' else MUTED)
        if mode == 'encrypt': self.file_frames['cover'].grid()
        else: self.file_frames['cover'].grid_remove()
        self.files.columnconfigure(1, weight=1 if mode == 'encrypt' else 0, uniform='file' if mode == 'encrypt' else '')
        self.input_label.configure(text='要混淆的图片' if mode == 'encrypt' else '要还原的图片')
        self.run.configure(text='开始混淆    →' if mode == 'encrypt' else '开始解混淆    →')
        self.status.configure(text='请选择图片和表图' if mode == 'encrypt' else '请选择要还原的图片')

    def toggle_key(self):
        visible = bool(self.key.cget('show'))
        self.key.configure(show='' if visible else '●')
        self.show.configure(text='隐藏' if visible else '显示')

    def choose(self, which):
        path = filedialog.askopenfilename(title='选择图片', filetypes=[('图片', '*.png *.jpg *.jpeg *.webp *.bmp *.gif *.tif *.tiff *.avif *.heic'), ('所有文件', '*.*')])
        if not path: return
        try:
            with Image.open(path) as src: image = ImageOps.exif_transpose(src).convert('RGBA')
            thumb = ImageOps.contain(image, (130, 130))
            self.thumbs[which] = ImageTk.PhotoImage(thumb)
            self.file_buttons[which].configure(image=self.thumbs[which], text='', height=150, compound='center')
            if which == 'input': self.input = path; self.image = image; self.draw_preview()
            else: self.cover = path
            self.reset()
            self.status.configure(text=Path(path).name)
        except Exception as e: self.status.configure(text=str(e))

    def draw_preview(self):
        if self.image is None: return
        w, h = max(30, self.preview.winfo_width() - 24), max(30, self.preview.winfo_height() - 24)
        thumb = ImageOps.contain(self.image, (w, h))
        self.photo = ImageTk.PhotoImage(thumb)
        self.preview.configure(image=self.photo, text='')

    def lock(self, busy):
        self.busy = busy
        for widget in [self.encrypt_tab, self.decrypt_tab, self.key, self.show, self.run, *self.file_buttons.values()]: widget.configure(state='disabled' if busy else 'normal')

    def start(self):
        if not self.input or self.mode == 'encrypt' and not self.cover:
            self.status.configure(text='请选择图片和表图' if self.mode == 'encrypt' else '请选择要还原的图片'); return
        self.reset(); self.lock(True)
        self.status.configure(text='正在混淆…' if self.mode == 'encrypt' else '正在还原…')
        args = self.mode, self.input, self.cover if self.mode == 'encrypt' else None, self.key.get()
        def work():
            try:
                result = misan.process(*args, None, lambda n: self.events.put(('progress', n)))
                self.events.put(('done', result))
            except Exception as e: self.events.put(('error', str(e)))
        threading.Thread(target=work, daemon=True).start()

    def poll(self):
        try:
            while True:
                event, value = self.events.get_nowait()
                if event == 'progress':
                    self.progress['value'] = max(float(self.progress['value']), value)
                    self.percent.configure(text=f'{round(float(self.progress["value"]) * 100)}%')
                elif event == 'done':
                    self.result = value
                    self.image = Image.open(io.BytesIO(value['data'])).convert('RGBA')
                    self.draw_preview(); self.lock(False)
                    self.save.configure(state='normal')
                    self.dimensions.configure(text=f'{value["width"]} × {value["height"]}')
                    self.result_label.configure(text='已完成')
                    self.status.configure(text='混淆完成' if self.mode == 'encrypt' else '还原完成')
                else:
                    self.lock(False); self.status.configure(text='密码不正确' if 'password' in value.lower() else value)
                    self.progress['value'] = 0; self.percent.configure(text='')
        except queue.Empty: pass
        self.root.after(60, self.poll)

    def download(self):
        if not self.result: return
        path = filedialog.asksaveasfilename(title='保存图片', defaultextension='.png', initialfile='encrypted.png' if self.mode == 'encrypt' else 'restored.png', filetypes=[('PNG 图片', '*.png')])
        if not path: return
        try:
            if Path(path).suffix.lower() != '.png': path += '.png'
            Path(path).write_bytes(self.result['data'])
            self.status.configure(text='图片已保存')
        except OSError as e: self.status.configure(text=str(e))

if __name__ == '__main__':
    root = tk.Tk()
    App(root)
    root.mainloop()
