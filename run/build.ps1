Write-Host '### TASK ### BUILD ###'
Write-Host

$env:NODE_ENV=$Args[1]

if ($Args[2] -match 'debug') {
    $env:NODE_DEBUG="*"
}

Write-Host 'LINT'

.\vendor\bin\phpcs --standard='.\phpcs.ruleset.xml' --report=summary '.\app' -v
npx stylelint './app/snippets/**/*.scss' './app/resources/**/*.scss'
npx eslint './app/resources/main.js' './app/snippets/**/script.js'

Write-Host 'BUILD'

gulp

Write-Host 'COMPLETE'
