$scope = (Get-Culture).TextInfo
Function TransferHandler()
{
    if ($args[0] -eq 'public')
    {
        foreach ($filemask in $args[5])
        {
            $transfer = $args[1].PutFiles($args[3] + $filemask, ($args[4] + '*__up'), $False, $args[2])
            $transfer.Check()
        }

        return $True
    }

    if ($args[0] -eq 'assets' -OR $args[0] -eq 'snippets' -OR $args[0] -eq 'templates')
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
            $files = $args[1].EnumerateRemoteFiles($args[2], '*', [WinSCP.EnumerationOptions]::None)

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
            Write-Host
            Write-Host "## Activate Upload ## $($scope.ToTitleCase($args[3]))"
            Write-Host

            $files = $args[1].EnumerateRemoteFiles($args[2], '*', [WinSCP.EnumerationOptions]::None)

            foreach ($file in $files)
            {
                if ($file.FullName -notmatch "__del$")
                {
                    $filename = $file.FullName -replace "__up"

                    Write-Host "$(Get-Date -Format 'HH:mm:ss') Working... $($file.FullName) => $($filename)"
                    $args[1].MoveFile($file.FullName, $filename)
                }
            }

            return $True
        }

        if ($args[0] -eq 'cleanup')
        {
            Write-Host "$(Get-Date -Format 'HH:mm:ss') Working... /Delete Outdated $($scope.ToTitleCase($args[3])) Files"

            $args[1].RemoveFiles($args[2] + '*__del')

            return $True
        }
    }

    if ($args[3] -eq 'assets' -OR $args[3] -eq 'snippets' -OR $args[3] -eq 'templates')
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
            Write-Host
            Write-Host "## Activate Upload ## $($scope.ToTitleCase($args[3]))"
            Write-Host

            $files = $args[1].EnumerateRemoteFiles($args[2], $args[3] + '__up', [WinSCP.EnumerationOptions]::MatchDirectories)

            foreach ($file in $files)
            {
                if ($file.FullName -notmatch "__del$")
                {
                    $filename = $file.FullName -replace "__up"

                    Write-Host "$(Get-Date -Format 'HH:mm:ss') Working... $($file.FullName) => $($filename)"
                    $args[1].MoveFile($file.FullName, $filename)
                }
            }

            return $True
        }

        if ($args[0] -eq 'cleanup')
        {
            Write-Host "$(Get-Date -Format 'HH:mm:ss') Working... /Delete Outdated $($scope.ToTitleCase($args[3])) Files"

            $args[1].RemoveFiles($args[2] + $args[3] + '__del')

            return $True
        }
    }
}

Function TransferQueueHandler
{
    $done = $False

    if ($args[0] -eq 'public')
    {
        Write-Host
        Write-Host "## TransferQueue ## $($scope.ToTitleCase($args[0]))"
        Write-Host

        $filemasks = '.*', '*.php', '*.js', '*.css', '*.txt'

        do
        {
            $done = TransferHandler $args[0] $args[1] $args[2] $args[3] $args[4] $filemasks
        }
        while ($done -eq $False)

        $done = $False

        return $True
    }

    if ($args[0] -eq 'assets' -OR $args[0] -eq 'snippets' -OR $args[0] -eq 'templates')
    {
        Write-Host
        Write-Host "## TransferQueue ## $($scope.ToTitleCase($args[0]))"
        Write-Host

        do
        {
            $done = TransferHandler $args[0] $args[1] $args[2] $args[3] $args[4]
        }
        while ($done -eq $False)

        $done = $False

        return $True
    }
}

Function FileActionsHandler
{
    $done = $False

    if ($args[0] -eq 'public')
    {
        do
        {
            $done = ActionHandler "unlink" $args[1] $args[2] 'public'
        }
        while ($done -eq $False)

        $done = $False

        do
        {
            $done = ActionHandler "link" $args[1] $args[2] 'public'
        }
        while ($done -eq $False)

        $done = $False

        do
        {
            $done = ActionHandler "cleanup" $args[1] $args[2] 'public'
        }
        while ($done -eq $False)

        $done = $False

        return $True
    }

    if ($args[0] -eq 'assets' -OR $args[0] -eq 'snippets' -OR $args[0] -eq 'templates')
    {
        do
        {
            $done = ActionHandler "unlink" $args[1] $args[2] $args[0]
        }
        while ($done -eq $False)

        $done = $False

        do
        {
            $done = ActionHandler "link" $args[1] $args[2] $args[0]
        }
        while ($done -eq $False)

        $done = $False

        do
        {
            $done = ActionHandler "cleanup" $args[1] $args[2] $args[0]
        }
        while ($done -eq $False)

        $done = $False

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
