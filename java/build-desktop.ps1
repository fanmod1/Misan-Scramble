param(
 [Parameter(Mandatory=$true)][ValidateSet('8','17')][string]$TargetJdk,
 [string]$JavaHome = $env:JAVA_HOME,
 [string]$DependencyCache = (Join-Path $env:LOCALAPPDATA 'MisanScramble\dependencies')
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$javaRoot = $PSScriptRoot
$repoRoot = Split-Path $javaRoot -Parent
$sourceRoot = Join-Path $javaRoot ('jar-jdk' + $TargetJdk)
$javac = if ($JavaHome) { Join-Path $JavaHome 'bin\javac.exe' } else { 'javac' }
$jarTool = if ($JavaHome) { Join-Path $JavaHome 'bin\jar.exe' } else { 'jar' }
$compilerVersion = (& $javac -version 2>&1 | Out-String).Trim()
if ($LASTEXITCODE -ne 0) { throw 'javac is unavailable' }
if (($TargetJdk -eq '8' -and $compilerVersion -notmatch '^javac 1\.8\.') -or ($TargetJdk -eq '17' -and $compilerVersion -notmatch '^javac 17(?:\.|\s|$)')) { throw "Use JDK $TargetJdk. Found: $compilerVersion" }
$buildDir = Join-Path $env:TEMP ('MisanScramble-v1.4-jdk' + $TargetJdk + '-' + [Guid]::NewGuid().ToString('N'))
$classes = Join-Path $buildDir 'classes'
New-Item -ItemType Directory -Path $classes -Force | Out-Null
New-Item -ItemType Directory -Path $DependencyCache -Force | Out-Null
$services = @{}
foreach ($dependency in (Get-Content -LiteralPath (Join-Path $javaRoot 'dependencies.json') -Raw | ConvertFrom-Json)) {
 $filename = $dependency.artifact + '-' + $dependency.version + '.jar'
 $cached = Join-Path $DependencyCache $filename
 if (-not (Test-Path -LiteralPath $cached)) {
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  Invoke-WebRequest -UseBasicParsing -Uri $dependency.url -OutFile $cached
 }
 if ((Get-FileHash -LiteralPath $cached -Algorithm SHA256).Hash.ToLowerInvariant() -ne $dependency.sha256) { throw "SHA-256 mismatch: $filename" }
 $zip = [IO.Compression.ZipFile]::OpenRead($cached)
 try {
  foreach ($entry in $zip.Entries) {
   $name = $entry.FullName
   if ($name.EndsWith('/') -or $name -eq 'META-INF/MANIFEST.MF' -or $name -match '\.(SF|RSA|DSA)$' -or $name.EndsWith('module-info.class')) { continue }
   if ($name.StartsWith('META-INF/services/')) {
    if (-not $services.ContainsKey($name)) { $services[$name] = New-Object 'Collections.Generic.HashSet[string]' }
    $reader = New-Object IO.StreamReader($entry.Open())
    try { foreach ($line in $reader.ReadToEnd().Split("`n")) { $provider=$line.Trim(); if ($provider -and -not $provider.StartsWith('#')) { $services[$name].Add($provider) | Out-Null } } } finally { $reader.Dispose() }
    continue
   }
   $targetPath = [IO.Path]::GetFullPath((Join-Path $classes $name))
   if (-not $targetPath.StartsWith($classes + [IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid dependency archive path' }
   if (-not (Test-Path -LiteralPath $targetPath)) {
    New-Item -ItemType Directory -Path (Split-Path $targetPath -Parent) -Force | Out-Null
    [IO.Compression.ZipFileExtensions]::ExtractToFile($entry,$targetPath,$false)
   }
  }
 } finally { $zip.Dispose() }
}
foreach ($name in $services.Keys) {
 $targetPath = Join-Path $classes $name
 New-Item -ItemType Directory -Path (Split-Path $targetPath -Parent) -Force | Out-Null
 [IO.File]::WriteAllText($targetPath, (($services[$name] | Sort-Object) -join "`n") + "`n", (New-Object Text.UTF8Encoding $false))
}
$assetDir = Join-Path $classes 'assets'
New-Item -ItemType Directory -Path $assetDir -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $repoRoot 'assets\icon.png') -Destination $assetDir
$noticeDir = Join-Path $classes 'META-INF\misan-scramble'
New-Item -ItemType Directory -Path $noticeDir -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $repoRoot 'LICENSE'),(Join-Path $repoRoot 'THIRD_PARTY_NOTICES.txt') -Destination $noticeDir
& $javac -encoding UTF-8 -d $classes (Join-Path $sourceRoot 'MisanCore.java') (Join-Path $sourceRoot 'MisanApp.java')
if ($LASTEXITCODE -ne 0) { throw 'Java compilation failed' }
$manifestPath = Join-Path $buildDir 'MANIFEST.MF'
[IO.File]::WriteAllText($manifestPath,"Manifest-Version: 1.0`nMain-Class: MisanApp`nImplementation-Title: 弥散混淆`nImplementation-Version: v1.4`nImplementation-Vendor: fanmod`nBuild-Jdk-Spec: $TargetJdk`n`n",(New-Object Text.UTF8Encoding $false))
$outputPath = Join-Path $sourceRoot '弥散混淆-v1.4.jar'
& $jarTool cfm $outputPath $manifestPath -C $classes .
if ($LASTEXITCODE -ne 0) { throw 'JAR packaging failed' }
Write-Host "Built $outputPath with $compilerVersion"
