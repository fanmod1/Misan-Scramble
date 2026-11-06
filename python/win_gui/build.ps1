$ErrorActionPreference = 'Stop'
$guiRoot = $PSScriptRoot
$repoRoot = Split-Path (Split-Path $guiRoot -Parent) -Parent
$coreRoot = Join-Path (Split-Path $guiRoot -Parent) 'core'
python -m pip install numpy Pillow pyinstaller
$versionPath = Join-Path $env:TEMP 'MisanScramble-v1.4-version.txt'
$versionText = @'
VSVersionInfo(ffi=FixedFileInfo(filevers=(1,4,0,0),prodvers=(1,4,0,0),mask=0x3f,flags=0x0,OS=0x40004,fileType=0x1,subtype=0x0,date=(0,0)),kids=[StringFileInfo([StringTable('040904B0',[StringStruct('FileDescription','弥散混淆 v1.4'),StringStruct('FileVersion','1.4.0.0'),StringStruct('InternalName','MisanScramble'),StringStruct('CompanyName','fanmod'),StringStruct('LegalCopyright','Copyright (c) 2026 fanmod'),StringStruct('OriginalFilename','弥散混淆-v1.4.exe'),StringStruct('ProductName','弥散混淆'),StringStruct('ProductVersion','v1.4')])]),VarFileInfo([VarStruct('Translation',[1033,1200])])])
'@
[IO.File]::WriteAllText($versionPath,$versionText,[Text.Encoding]::UTF8)
python -m PyInstaller --noconfirm --clean --exclude-module numpy.f2py --exclude-module charset_normalizer --onefile --windowed --name '弥散混淆-v1.4' --paths $coreRoot --icon (Join-Path $guiRoot 'app.ico') --add-data ((Join-Path $guiRoot 'app.ico') + ';.') --add-data ((Join-Path $guiRoot 'app.png') + ';.') --add-data ((Join-Path $repoRoot 'LICENSE') + ';.') --add-data ((Join-Path $repoRoot 'THIRD_PARTY_NOTICES.txt') + ';.') --version-file $versionPath --distpath $guiRoot --workpath (Join-Path $env:TEMP 'MisanScramble-v1.4-build') --specpath (Join-Path $env:TEMP 'MisanScramble-v1.4-spec') (Join-Path $guiRoot 'app.py')
if ($LASTEXITCODE -ne 0) { throw 'Build failed' }
