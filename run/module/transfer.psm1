Function TransferHandler()
{
    if ($args[0] -eq 'public')
    {
        foreach ($filemask in $args[5])
        {
            $transfer = $args[1].PutFiles($args[3] + $args[0] + '\' + $filemask, ($args[4] + $args[0] + '/*__up'), $False, $args[2])
            $transfer.Check()
        }

        return $True
    }

    if ($args[0] -eq 'kirby' -OR $args[0] -eq 'site')
    {
        $transfer = $args[1].PutFiles($args[3] + $args[0], ($args[4] + $args[0] + '__up'), $False, $args[2])
        $transfer.Check()

        return $True
    }
}

Function ActionHandler()
{
    if ($args[3] -eq 'public')
    {
        if ($args[0] -eq 'unlink')
        {
            $files = $args[1].EnumerateRemoteFiles($args[2] + $args[3], '*', [WinSCP.EnumerationOptions]::None)

            foreach ($file in $files)
            {
                if ($file.FullName -notmatch "__up$")
                {
                    $args[1].MoveFile($file.FullName, $file.FullName + '__del')
                }
            }

            return $True
        }

        if ($args[0] -eq 'link')
        {
            $files = $args[1].EnumerateRemoteFiles($args[2] + $args[3], '*', [WinSCP.EnumerationOptions]::None)

            foreach ($file in $files)
            {
                if ($file.FullName -notmatch "__del$")
                {
                    $filename = $file.FullName -replace "__up"

                    Write-Host "$(Get-Date -Format 'HH:mm:ss') Working... $($file.FullName) => $filename"
                    $args[1].MoveFile($file.FullName, $filename)
                }
            }

            return $True
        }

        if ($args[0] -eq 'cleanup')
        {
            Write-Host "$(Get-Date -Format 'HH:mm:ss') Working... Remove Outdated $($args[3]) Files"
            Write-Host

            $args[1].RemoveFiles($args[2] + $args[3] + '/*__del')

            return $True
        }
    }

    if ($args[3] -eq 'kirby' -OR $args[3] -eq 'site')
    {
        if ($args[0] -eq 'unlink')
        {
            $files = $args[1].EnumerateRemoteFiles($args[2], $args[3], [WinSCP.EnumerationOptions]::MatchDirectories)

            foreach ($file in $files)
            {
                if ($file.FullName -notmatch "__up$")
                {
                    $args[1].MoveFile($file.FullName, $file.FullName + '__del')
                }
            }

            return $True
        }

        if ($args[0] -eq 'link')
        {
            $files = $args[1].EnumerateRemoteFiles($args[2], $args[3] + '__up', [WinSCP.EnumerationOptions]::MatchDirectories)

            foreach ($file in $files)
            {
                if ($file.FullName -notmatch "__del$")
                {
                    $filename = $file.FullName -replace "__up"

                    Write-Host "$(Get-Date -Format 'HH:mm:ss') Working... $($file.FullName) => $filename"
                    $args[1].MoveFile($file.FullName, $filename)
                }
            }

            return $True
        }

        if ($args[0] -eq 'cleanup')
        {
            Write-Host
            Write-Host "$(Get-Date -Format 'HH:mm:ss') Working... Remove Outdated $($args[3]) Files"
            Write-Host

            $args[1].RemoveFiles($args[2] + $args[3] + '__del')

            # if (!(Test-Path ($args[3] + '__del') -PathType container))
            # {
            #     $args[1].RemoveFiles($file + '__del')
            # }

            return $True
        }
    }
}

Function TransferQueueHandler
{
    $scope = (Get-Culture).TextInfo
    $done = $False

    if ($args[0] -eq 'public')
    {
        Write-Host
        Write-Host "## TransferQueue ##" $scope.ToTitleCase($args[0])
        Write-Host

        $filemasks = '.*', '*.php', '*.js', '*.css'

        do
        {
            $done = TransferHandler $args[0] $args[1] $args[2] $args[3] $args[4] $filemasks
        }
        while ($done -eq $False)

        $done = $False

        return $True
    }

    if ($args[0] -eq 'kirby' -OR $args[0] -eq 'site')
    {
        Write-Host
        Write-Host "## TransferQueue ##" $scope.ToTitleCase($args[0])
        Write-Host

        do
        {
            $done = TransferHandler $args[0] $args[1] $args[2] $args[3] $args[4]
        }
        while ($done -eq $False)

        $done = $False

        return $True
    }

    if ($args[0] -eq 'clone')
    {
        Write-Host
        Write-Host '## TransferQueue ## Content'
        Write-Host

        $transfer = $args[1].GetFiles($args[2] + '*', $args[3] + '*')
        $transfer.Check()

        return $True
    }
}

Function FileActionsHandler
{
    $done = $False

    if ($args[0] -eq 'public')
    {
        ## MOVE
        Write-Host
        Write-Host "$(Get-Date -Format 'HH:mm:ss') Working... Activate Public Upload"
        Write-Host

        do
        {
            $done = ActionHandler "unlink" $args[1] $args[2] 'public'
        }
        while($done -eq $False)

        $done = $False

        do
        {
            $done = ActionHandler "link" $args[1] $args[2] 'public'
        }
        while($done -eq $False)

        $done = $False

        do
        {
            $done = ActionHandler "cleanup" $args[1] $args[2] 'public'
        }
        while($done -eq $False)

        $done = $False

        return $True
    }

    if ($args[0] -eq 'kirby' -OR $args[0] -eq 'site')
    {
        ## MOVE
        Write-Host
        Write-Host "$(Get-Date -Format 'HH:mm:ss') Working... Move New $($args[0]) Files"

        do
        {
            $done = ActionHandler "unlink" $args[1] $args[2] $args[0]
        }
        while($done -eq $False)

        $done = $False

        do
        {
            $done = ActionHandler "link" $args[1] $args[2] $args[0]
        }
        while($done -eq $False)

        $done = $False

        do
        {
            $done = ActionHandler "cleanup" $args[1] $args[2] $args[0]
        }
        while($done -eq $False)

        $done = $False

        return $True
    }

    if ($args[0] -eq 'clone')
    {
        if (!(Test-Path $args[3] -PathType container))
        {
            New-Item -Path $args[1] -Name "db" -ItemType "directory" | Out-Null
        }

        elseif (!(Get-ChildItem $args[3] | Measure-Object).Count -eq 0)
        {
            Write-Host
            Write-Host "## TransferQueue ## Backup"
            Write-Host

            $timestamp = $(Get-Date -Format "yyyyMMddHHmmss")

            if (!(Test-Path $args[2] -PathType container))
            {
                New-Item -Path $args[1] -Name "backup" -ItemType "directory" | Out-Null
            }

            Write-Host "$(Get-Date -Format 'HH:mm:ss') Working... Prepare Backup Folder"
            New-Item -Path $args[2] -Name $timestamp -ItemType "directory" | Out-Null

            if (Test-Path ($args[2] + $timestamp) -PathType container)
            {
                Write-Host "$(Get-Date -Format 'HH:mm:ss') Working... Backup Content Data"
                Copy-Item ($args[3] + '*') ($args[2] + $timestamp) -Recurse
            }
        }

        return $True
    }
}

Function LogTransferredFiles
{
    param($e)

    if ($Null -eq $e.Error)
    {
        Write-Host "$(Get-Date -Format 'HH:mm:ss') Working... $($e.Destination)"
    }

    else
    {
        Write-Host "## Error $($e.Error) ## $($e.Destination)"
    }
}
