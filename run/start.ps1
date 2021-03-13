Write-Host '### TASK ### RUN ###'
Write-Host

$env:NODE_ENV=$Args[1]

if ($Args[2] -match 'debug') {
    $env:NODE_DEBUG="*"
}

gulp
