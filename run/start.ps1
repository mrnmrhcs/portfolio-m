Write-Host '### TASK ### RUN ###'
Write-Host

$env:DEBUG = $False

if ($Args[0] -match 'debug') {
  $env:DEBUG = $True
}

Write-Host 'RUN'
Write-Host

if ($env:DEBUG -eq $True) {
  gulp --verbose
}
Else {
  gulp
}
