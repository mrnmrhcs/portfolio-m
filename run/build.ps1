Write-Host '### TASK ### BUILD ###'
Write-Host

$env:DEBUG = $False

if ($Args[0] -match 'debug') {
  $env:DEBUG = $True
}

Write-Host 'LINT'
Write-Host

.\vendor\bin\phpcs --standard='.\phpcs.ruleset.xml' --report=summary '.\app' -v
npx stylelint './app/snippets/**/*.scss' './app/resources/**/*.scss'
npx eslint './app/resources/main.js' './app/snippets/**/script.js'

Write-Host 'BUILD'
Write-Host

if ($env:DEBUG -eq $True) {
  gulp --verbose
}
Else {
  gulp
}

Write-Host
Write-Host 'COMPLETE'
Write-Host
