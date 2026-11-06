param(
 [string]$SdkRoot = $env:ANDROID_HOME,
 [string]$JdkRoot = $env:JAVA_HOME,
 [string]$Keystore = (Join-Path $env:LOCALAPPDATA 'MisanScramble\example-signing.p12'),
 [string]$StorePassword = 'misanscramble-example'
)
$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
if (-not $SdkRoot -or -not $JdkRoot) { throw 'Set ANDROID_HOME and JAVA_HOME (JDK 17), or pass -SdkRoot and -JdkRoot.' }
$buildTools = Get-ChildItem -LiteralPath (Join-Path $SdkRoot 'build-tools') -Directory | Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'aapt2.exe') } | Sort-Object Name -Descending | Select-Object -First 1
$platform = Get-ChildItem -LiteralPath (Join-Path $SdkRoot 'platforms') -Directory | Sort-Object Name -Descending | Select-Object -First 1
if (-not $buildTools -or -not $platform) { throw 'Install Android SDK Platform and Build Tools 36 or newer.' }
$androidJar = Join-Path $platform.FullName 'android.jar'
$buildDir = Join-Path $env:PUBLIC ('MisanScramble-build-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $buildDir | Out-Null
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'src') -Destination $buildDir -Recurse
foreach ($dirName in @('gen','classes','dex')) { New-Item -ItemType Directory -Path (Join-Path $buildDir $dirName) | Out-Null }
$licenseAssets = Join-Path $buildDir 'license-assets'
New-Item -ItemType Directory -Path $licenseAssets | Out-Null
Copy-Item -LiteralPath (Join-Path $repoRoot 'LICENSE'),(Join-Path $repoRoot 'THIRD_PARTY_NOTICES.txt') -Destination $licenseAssets
$oldJavaHome = $env:JAVA_HOME
$env:JAVA_HOME = $JdkRoot
function Invoke-BuildTool([string]$name, [string[]]$toolArgs) {
 & (Join-Path $buildTools.FullName $name) @toolArgs
 if ($LASTEXITCODE -ne 0) { throw "$name failed" }
}
try {
 Invoke-BuildTool 'aapt2.exe' @('compile','--dir',(Join-Path $buildDir 'src\main\res'),'-o',(Join-Path $buildDir 'resources.zip'))
 Invoke-BuildTool 'aapt2.exe' @('link','-o',(Join-Path $buildDir 'resources.apk'),'--manifest',(Join-Path $buildDir 'src\main\AndroidManifest.xml'),'-I',$androidJar,'--java',(Join-Path $buildDir 'gen'),'-A',$licenseAssets,'--version-name','v1.4','--version-code','14',(Join-Path $buildDir 'resources.zip'))
 $javaFiles = @((Get-ChildItem -LiteralPath (Join-Path $buildDir 'src\main\java') -Recurse -Filter '*.java' -File).FullName) + @((Get-ChildItem -LiteralPath (Join-Path $buildDir 'gen') -Recurse -Filter '*.java' -File).FullName)
 $argumentFile = Join-Path $buildDir 'javac.args'
 [IO.File]::WriteAllLines($argumentFile, @($javaFiles | ForEach-Object { '"' + $_.Replace('\','/') + '"' }), (New-Object Text.UTF8Encoding $false))
 & (Join-Path $JdkRoot 'bin\javac.exe') -encoding UTF-8 -source 8 -target 8 -classpath $androidJar -d (Join-Path $buildDir 'classes') ("@" + $argumentFile)
 if ($LASTEXITCODE -ne 0) { throw 'Java compilation failed' }
 & (Join-Path $JdkRoot 'bin\jar.exe') cf (Join-Path $buildDir 'classes.jar') -C (Join-Path $buildDir 'classes') .
 if ($LASTEXITCODE -ne 0) { throw 'Class packaging failed' }
 Invoke-BuildTool 'd8.bat' @('--lib',$androidJar,'--min-api','26','--output',(Join-Path $buildDir 'dex'),(Join-Path $buildDir 'classes.jar'))
 Copy-Item -LiteralPath (Join-Path $buildDir 'resources.apk') -Destination (Join-Path $buildDir 'unsigned.apk')
 Add-Type -AssemblyName System.IO.Compression.FileSystem
 $apkZip = [IO.Compression.ZipFile]::Open((Join-Path $buildDir 'unsigned.apk'),[IO.Compression.ZipArchiveMode]::Update)
 try { foreach ($dexFile in Get-ChildItem -LiteralPath (Join-Path $buildDir 'dex') -Filter '*.dex') { [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($apkZip,$dexFile.FullName,$dexFile.Name) | Out-Null } } finally { $apkZip.Dispose() }
 Invoke-BuildTool 'zipalign.exe' @('-f','-p','4',(Join-Path $buildDir 'unsigned.apk'),(Join-Path $buildDir 'aligned.apk'))
 if (-not (Test-Path -LiteralPath $Keystore)) {
  New-Item -ItemType Directory -Path (Split-Path $Keystore -Parent) -Force | Out-Null
  & (Join-Path $JdkRoot 'bin\keytool.exe') -genkeypair -keystore $Keystore -storetype PKCS12 -alias misanscramble -keyalg RSA -keysize 2048 -validity 10000 -dname 'CN=MisanScramble Example, O=MisanScramble' -storepass $StorePassword -keypass $StorePassword
  if ($LASTEXITCODE -ne 0) { throw 'Signing key creation failed' }
 }
 Invoke-BuildTool 'apksigner.bat' @('sign','--ks',$Keystore,'--ks-key-alias','misanscramble','--ks-pass',("pass:"+$StorePassword),'--out',(Join-Path $buildDir '弥散混淆-v1.4.apk'),(Join-Path $buildDir 'aligned.apk'))
 Invoke-BuildTool 'apksigner.bat' @('verify','--verbose',(Join-Path $buildDir '弥散混淆-v1.4.apk'))
 Copy-Item -LiteralPath (Join-Path $buildDir '弥散混淆-v1.4.apk') -Destination (Join-Path $PSScriptRoot '弥散混淆-v1.4.apk') -Force
 Write-Host 'Built 弥散混淆-v1.4.apk'
} finally { $env:JAVA_HOME = $oldJavaHome }
