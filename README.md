<img src="assets/icon.svg" width="72" height="72" alt="弥散混淆图标">

# 弥散混淆 · v1.4

作者：**fanmod** · [MIT License](LICENSE)

**Misan Scramble** — 支持表图、密码和多语言互通的可逆图像混淆工具。

将原图分割并按密钥重排，填入表图的轮廓空白区域。混淆结果保留表图比例；还原时只需要混淆图与对应密码，不需要另外保存表图。图像处理在本地完成，不接入 AI 或远程图像服务。

[使用方法](#使用方法) · [统一接口](#统一接口) · [从源码构建](#从源码构建) · [许可与致谢](#许可与致谢)

## 功能

- **表图自适应**：支持照片与插画，自动提取简笔轮廓、调节局部线宽并选择醒目的线条颜色。
- **可选密码**：支持中文、emoji 和首尾空格；留空时使用无密码模式。
- **保留原图颜色**：载荷不做颜色翻转，统一导出 PNG，避免导出阶段的额外有损压缩。
- **传播恢复**：针对常见 JPEG/WebP 压缩、等比缩放、有限偏色进行重建，支持带边框的完整轴对齐截图定位。重度缩图后会自动校正采样偏移，并抑制平坦区域的拼块色斑。
- **多端互通**：JavaScript、Python、Java、PHP 使用同一个六参数业务接口和相同图片协议。
- **简洁界面**：浏览器、Windows、Java 桌面和原生 Android 使用一致的操作布局。

## 使用方法

| 平台 | 入口 | 环境 |
|---|---|---|
| 网页 | [`html_js/index.html`](html_js/index.html) | 支持 Web Crypto、BigInt、Canvas 的现代浏览器 |
| Windows | `python/win_gui/弥散混淆-v1.4.exe` | Windows 10/11 x64，无需安装 Python |
| Java 8 桌面 | `java/jar-jdk8/弥散混淆-v1.4.jar` | Java 8 或以上 |
| Java 17 桌面 | `java/jar-jdk17/弥散混淆-v1.4.jar` | Java 17 或以上 |
| Android | `java/androia-app/弥散混淆-v1.4.apk` | Android 8.0 / API 26 或以上 |
| Python 核心 | [`python/core/misan.py`](python/core/misan.py) | Python 3.10+、NumPy、Pillow |
| Java 核心 | [`java/core/MisanCore.java`](java/core/MisanCore.java) | JDK 8+ |
| PHP 核心 | [`php/misan.php`](php/misan.php) | 64 位 PHP 8.0+、GD、zlib；EXIF 扩展用于 JPEG 方向校正 |

**混淆**：选择原图和表图 → 输入密码或留空 → 开始混淆 → 保存图片。

**还原**：选择混淆图 → 输入相同密码或留空 → 开始解混淆 → 保存图片。

网页可直接打开，也可用任意静态服务器提供服务。通过 localhost / HTTPS 访问时可使用 Worker；浏览器限制本地文件 Worker 时会自动在本页处理。上传 GitHub 后，可将仓库根目录设为 GitHub Pages 来源，再访问 `/html_js/`。

## 项目结构

```text
assets/                统一图标（SVG、64px PNG、小尺寸 ICO）
html_js/               HTML、CSS、独立单文件 JS 接口
python/
  core/misan.py         单文件 Python 核心与命令行
  win_gui/              Windows GUI 源码、图标、构建脚本、EXE
java/
  core/MisanCore.java   单文件 Java 核心与命令行
  jar-jdk8/             JDK 8 GUI 源码、构建入口、JAR
  jar-jdk17/            JDK 17 GUI 源码、构建入口、JAR
  androia-app/          原生 Java + XML Android 应用、构建脚本、APK
  build-desktop.ps1     桌面 JAR 公共构建脚本
  dependencies.json    Java 依赖版本、下载地址与 SHA-256
php/misan.php           单文件 PHP 核心、命令行和 HTTP 入口
LICENSE                 本项目原创代码的 MIT 协议
THIRD_PARTY_NOTICES.txt 第三方版权与许可全文
```

EXE、JAR、APK 是随源码提供的预编译示例；Windows EXE 包含 Python 与运行依赖，因此体积相对较大。

## 统一接口

四端业务入口均为：

```text
process(mode, input, cover, key, output, progress)
```

| 参数 | 含义 |
|---|---|
| `mode` | `encrypt` 或 `decrypt` |
| `input` | 输入图片 |
| `cover` | 表图；解混淆时传 `null` / `None` |
| `key` | 原样使用的字符串；空字符串表示无密码，最多 16384 个 UTF-8 字节 |
| `output` | PNG 输出路径；网页中为下载文件名；不写文件时传 `null` / `None` |
| `progress` | 接收 `0…1` 数字的回调；不用时传 `null` / `None` |

返回字段统一为 `data`、`width`、`height`、`mime`、`output`。`data` 是 PNG 字节，`mime` 固定为 `image/png`。原生核心写文件时不覆盖已有文件。

各语言使用自然图像类型：JS 接受 File/Blob、ArrayBuffer/TypedArray 或 `{data,width,height}` RGBA 对象；Python 接受路径、图片字节或 uint8 RGBA 数组；Java 接受路径字符串/Path、byte[] 或 `MisanCore.Image`（ARGB int[]）；PHP 接受路径、图片字节或 GD 图像数组。浏览器返回 PNG 字节供页面下载，不直接写任意磁盘路径。

### JavaScript

`misan.js` 包含完整图像流程和所需依赖，无需 npm 或第二个 JS 文件。

```html
<script src="misan.js"></script>
<script>
async function encrypt(inputFile, coverFile) {
  return MisanScramble.process('encrypt', inputFile, coverFile, '123', 'encrypted.png', console.log);
}
</script>
```

### Python

```shell
python -m pip install -r python/requirements.txt
```

将 `python/core` 加入模块搜索路径后：

```python
from misan import process

result = process('encrypt', 'input.jpg', 'cover.png', '123', 'encrypted.png', print)
result = process('decrypt', 'encrypted.png', None, '123', 'restored.png', print)
```

### Java

```java
MisanCore.Result result = MisanCore.process(
    "encrypt", "input.jpg", "cover.png", "123", "encrypted.png", System.out::println);
```

核心不依赖 AWT 编译类型；桌面与 Android 共用同一算法，Android 版本增加 `com.misanscramble.core` 包名。输入格式由环境解码器决定，桌面 JAR 已包含 WebP 解码依赖。

### PHP

```php
require 'misan.php';
$result = process('encrypt', 'input.jpg', 'cover.png', '123', 'encrypted.png', null);
```

建议 `memory_limit=768M` 或更高。HTTP POST 使用 multipart 字段 `mode`、`input`（文件）、`cover`（文件，解混淆可省略）、`key`、`output`（下载文件名，可省略）；成功返回 `image/png`，错误返回 HTTP 400 JSON。脚本接口支持进度回调，HTTP 上传/下载进度由客户端管理。

### 命令行

三种原生命令行均使用五个位置参数：

```text
encrypt|decrypt input cover key output
```

```shell
python python/core/misan.py encrypt input.jpg cover.png 123 encrypted.png
python python/core/misan.py decrypt encrypted.png - 123 restored-python.png
php -d extension=gd -d extension=exif -d memory_limit=768M php/misan.php decrypt encrypted.png - 123 restored-php.png
javac -encoding UTF-8 java/core/MisanCore.java
java -cp "java/core;java/jar-jdk8/弥散混淆-v1.4.jar" MisanCore decrypt encrypted.png - 123 restored-java.png
```

Java classpath 分隔符在 Windows 为 `;`，Linux/macOS 为 `:`。仅用 JDK 编解码时，可用格式取决于 JDK ImageIO。

命令行 `cover=-` 表示无表图，`key=-` 表示空密码。跨终端传递 emoji、多行密码或字面量 `-` 时，将密码原样保存为 UTF-8 文件并传 `@key.txt`；只移除 UTF-8 BOM，保留首尾空格和换行。字面量 `@` 开头的密码使用 `@@...`。六参数业务接口不解释这些命令行约定，始终接受原样密码。

## 从源码构建

以下打包脚本面向 Windows PowerShell；核心脚本及桌面 JAR 可在满足依赖的其他系统使用。构建缓存、下载的依赖和签名密钥均保存在仓库外。

| 产物 | 所需工具 | 命令 |
|---|---|---|
| EXE | Python、pip | `./python/win_gui/build.ps1` |
| Java 8 JAR | JDK 8 | `./java/jar-jdk8/build.ps1 -JavaHome "你的JDK8目录"` |
| Java 17 JAR | JDK 17 | `./java/jar-jdk17/build.ps1 -JavaHome "你的JDK17目录"` |
| APK | JDK 17、Android SDK Platform / Build Tools 36+ | `./java/androia-app/build.ps1 -SdkRoot "你的SDK目录" -JdkRoot "你的JDK17目录"` |

桌面构建会从 Maven Central 获取固定版本依赖并校验 SHA-256，**不依赖已有 JAR 示例**。Android 使用 SDK 自带的 aapt2、d8、zipalign、apksigner，无需 Gradle 或第三方 UI 框架。EXE 构建安装 NumPy、Pillow、PyInstaller。

桌面图片解码依赖固定为已验证兼容 JDK 8 的 TwelveMonkeys 3.12.0。两套 JAR 分别使用 JDK 8 和 JDK 17 实际编译。

APK 示例使用本地生成的示例签名。正式发布请通过构建脚本的 `-Keystore`、`-StorePassword` 参数指定自己的密钥；签名文件不要提交到仓库。

## 兼容与恢复范围

未经有损处理的编码图可逐像素还原解码后的 RGBA。经过压缩或缩小时会尝试按剩余像素重建，但有损传播丢失的信息无法完全恢复；完整图像、比例不变和清晰定位区域能提高成功率。裁剪载荷、严重压缩、透视旋转、重绘和极端缩小可能超出恢复范围。

输入先解码为像素，载荷不依赖附加文件字节或 EXIF 保存；HEIC 等额外格式依赖本端解码器。画幅受 48MP 工作限制和设备可用内存约束。


弥散混淆是保留颜色的可逆图像混淆，密码控制位置排列与参数认证；其保密能力不等同于 AES 等标准加密，不应将图像外观不可辨认视为密码学安全证明。

## 贡献

欢迎提交 Issue 或 Pull Request。报告问题时请附运行环境、操作步骤、错误信息，以及可公开的最小样张；请勿上传私人图片或真实敏感密码。修改核心算法时，请同时验证四端互通、空密码与 Unicode 密码、原始 PNG、受压缩图及带边框截图。

## 许可与致谢

本项目原创代码使用 **[MIT License](LICENSE)**。允许使用、修改和再分发，须保留适用的版权与许可声明。第三方代码和运行依赖继续遵循其各自许可证，完整文本见 [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt)。

| 项目 | 用途 | 许可 |
|---|---|---|
| [iris10086/pic-scramble（小番茄混淆）](https://github.com/iris10086/pic-scramble) | Gilbert 遍历代码及重排思路 | MIT |
| [jakubcerveny/gilbert](https://github.com/jakubcerveny/gilbert) | 广义 Gilbert 遍历 | BSD-2-Clause |
| [pako](https://github.com/nodeca/pako) | 前端 zlib | MIT / Zlib |
| [UPNG.js](https://github.com/photopea/UPNG.js) | 前端 PNG 解码 | MIT |
| [TwelveMonkeys ImageIO](https://github.com/haraldk/TwelveMonkeys) | 桌面 Java WebP 解码 | BSD-3-Clause |
| [NumPy](https://numpy.org/)、[Pillow](https://python-pillow.org/) | Python 图像与数值处理 | 见第三方声明 |
| [Python](https://www.python.org/)、[Tcl/Tk](https://www.tcl.tk/)、[PyInstaller](https://pyinstaller.org/) | 发布的 Windows EXE 内的解释器与附带运行库、界面库、引导程序 | 见第三方声明，含 PyInstaller Bootloader Exception |
