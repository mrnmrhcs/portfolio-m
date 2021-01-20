Function TransferHandler {
    [CmdletBinding()]

    param (
        [Parameter(Mandatory)] [PSObject]$Session,
        [Parameter(Mandatory)] [PSObject]$Options,
        [Parameter(Mandatory)] [ValidateSet('Public','Assets','Snippets','Templates')] [String]$Switch
    )

    if ($Switch -eq 'Public') {

        Write-Host
        Write-Host "# $((Get-Culture).TextInfo.ToUpper($Switch)) # TRANSFER"
        Write-Host

        $FileMasks = '.*', '*.php', '*.js', '*.css', '*.txt'

        foreach ($Mask in $FileMasks) {

            $Done = $Null

            while ($Done -eq $Null) {

                $Transfer = $Session.PutFiles("$(Get-Location)\dist\$Mask", ('/*__up'), $False, $Options)
                $Transfer.Check()

                if ($Transfer.IsSuccess) {

                    $Done = $True
                }
                else {

                    Write-Host
                    Write-Host "$(Get-Date -Format 'HH:mm:ss') Retry..."
                }
            }
        }

        return
    }

    if ($Switch -eq 'Assets' -OR $Switch -eq 'Snippets' -OR $Switch -eq 'Templates') {

        Write-Host
        Write-Host "# $((Get-Culture).TextInfo.ToUpper($Switch)) # TRANSFER"
        Write-Host

        $Done = $Null

        while ($Done -eq $Null) {

            $Transfer = $Session.PutFiles("$(Get-Location)\dist\$((Get-Culture).TextInfo.ToLower($Switch))", ("/$((Get-Culture).TextInfo.ToLower($Switch))__up"), $False, $Options)
            $Transfer.Check()

            if ($Transfer.IsSuccess) {

                $Done = $True
            }
            else {

                Write-Host
                Write-Host "$(Get-Date -Format 'HH:mm:ss') Retry..."
            }
        }

        return
    }
}

Function ActionHandler {
    [CmdletBinding()]

    param (
        [Parameter(Mandatory)] [PSObject]$Session,
        [Parameter(Mandatory)] [ValidateSet('Public','Assets','Snippets','Templates')] [String]$Switch,
        [Parameter()] [ValidateSet('Unlink','Link','Cleanup')] [String]$State
    )

    if ($Switch -eq 'Public') {

        Write-Host
        Write-Host "# $((Get-Culture).TextInfo.ToUpper($Switch)) # $((Get-Culture).TextInfo.ToUpper($State))"
        Write-Host

        if ($State -eq 'Unlink') {

            $Files = $Session.EnumerateRemoteFiles('/', '*', [WinSCP.EnumerationOptions]::None)

            foreach ($File in $Files) {

                if ($File.FullName -notmatch "__up$") {

                    $Session.MoveFile($File.FullName, $File.FullName + '__del')

                    Write-Host "$(Get-Date -Format 'HH:mm:ss') Success... $($File.FullName) => $($File.FullName)__del"
                }
            }

            return
        }

        if ($State -eq 'Link') {

            $Files = $Session.EnumerateRemoteFiles('/', '*', [WinSCP.EnumerationOptions]::None)

            foreach ($File in $Files) {

                if ($File.FullName -notmatch "__del$") {

                    $FileName = $File.FullName -replace "__up"
                    $Session.MoveFile($File.FullName, $FileName)

                    Write-Host "$(Get-Date -Format 'HH:mm:ss') Success... $($File.FullName) => $FileName"
                }
            }

            return
        }

        if ($State -eq 'Cleanup') {

            $Done = $Null

            while ($Done -eq $Null) {

                $Removal = $Session.RemoveFiles('*.*__del')

                if ($Removal.IsSuccess) {

                    Write-Host "$(Get-Date -Format 'HH:mm:ss') Success... /*.*__del => delete"

                    $Done = $True
                }
                else {

                    Write-Host "$(Get-Date -Format 'HH:mm:ss') $(if ($Session.Opened -ne $True) { 'Connection Status: Closed' } else { 'Connection Status: Open' })"
                    Write-Host "$(Get-Date -Format 'HH:mm:ss') Retry..."
                }
            }

            return
        }
    }

    if ($Switch -eq 'Assets' -OR $Switch -eq 'Snippets' -OR $Switch -eq 'Templates') {

        Write-Host
        Write-Host "# $((Get-Culture).TextInfo.ToUpper($Switch)) # $((Get-Culture).TextInfo.ToUpper($State))"
        Write-Host

        if ($State -eq 'Unlink') {

            $Files = $Session.EnumerateRemoteFiles('/', "$((Get-Culture).TextInfo.ToLower($Switch))", [WinSCP.EnumerationOptions]::MatchDirectories)

            foreach ($File in $Files) {

                if ($File.FullName -notmatch "__up$") {

                    $Session.MoveFile($File.FullName, $File.FullName + '__del')

                    Write-Host "$(Get-Date -Format 'HH:mm:ss') Success... $($File.FullName) => $($File.FullName)__del"
                }
            }

            return
        }

        if ($State -eq 'Link') {

            $Files = $Session.EnumerateRemoteFiles('/', "$((Get-Culture).TextInfo.ToLower($Switch))__up", [WinSCP.EnumerationOptions]::MatchDirectories)

            foreach ($File in $Files) {

                if ($File.FullName -notmatch "__del$") {

                    $FileName = $File.FullName -replace "__up"
                    $Session.MoveFile($File.FullName, $FileName)

                    Write-Host "$(Get-Date -Format 'HH:mm:ss') Success... $($File.FullName) => $FileName"
                }
            }

            return
        }

        if ($State -eq 'Cleanup') {

            $Done = $Null

            while ($Done -eq $Null) {

                $Removal = $Session.RemoveFiles(('/' + (Get-Culture).TextInfo.ToLower($Switch) + '__del'))

                if ($Removal.IsSuccess) {

                    Write-Host "$(Get-Date -Format 'HH:mm:ss') Success... /$((Get-Culture).TextInfo.ToLower($Switch))__del => delete"

                    $Done = $True

                }
                else {

                    Write-Host "$(Get-Date -Format 'HH:mm:ss') $(if ($Session.Opened -ne $True) { 'Connection Status: Closed' } else { 'Connection Status: Open' })"
                    Write-Host "$(Get-Date -Format 'HH:mm:ss') Retry..."
                }
            }

            return
        }
    }
}

Function LogTransferredFiles {

    param($e)

    if ($Null -eq $e.Error) {

        Write-Host "$(Get-Date -Format 'HH:mm:ss') Success... $($e.Destination)"
    }
    else {

        Write-Host
        Write-Host "# ERROR $($e.Error) # $($e.Destination)"
    }
}
