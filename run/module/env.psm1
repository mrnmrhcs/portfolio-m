Function GetEnvConfig {

    $localEnvFile = ".env"
    $conf = New-Object -TypeName psobject

    if (!(Test-Path $localEnvFile)) {

        Write-Host ".env missing"
        return
    }

    $localEnv = Get-Content $localEnvFile -ErrorAction Stop

    foreach ($line in $localEnv) {

        $kvp = $line -split "=",2
        $conf | Add-Member -MemberType NoteProperty -Name $kvp[0] -Value $kvp[1]
    }

    return $conf
}
