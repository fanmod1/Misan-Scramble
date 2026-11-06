param([string]$JavaHome = $env:JAVA_HOME)
& (Join-Path (Split-Path $PSScriptRoot -Parent) 'build-desktop.ps1') -TargetJdk '17' -JavaHome $JavaHome
