Write-Host '### TASK ### DEPLOY ###'
Write-Host

# DIAGNOSTICS
$Timer = [system.diagnostics.stopwatch]::startNew()

# PARTS
$Sets = @('Public', 'Assets', 'Snippets', 'Templates')

try {

  # IMPORT
  Import-Module '.\run\module\env.psm1'
  Import-Module '.\run\module\transfer.psm1'

  # DEPENDENCY
  $winSCPexec = 'C:\Apps\_m\apps\winscp\current\WinSCP.exe'
  $winSCPdnet = 'C:\Apps\_m\apps\winscp\current\WinSCPnet.dll'

  Add-Type -Path $winSCPdnet

  # AUTHENTICATION
  $Config = GetEnvConfig '.\'

  $usr = if ($Env:NODE_ENV -eq 'staging') { $Config.SESSION_USER_PREVIEW } else { $Config.SESSION_USER }
  $hsh = if ($Env:NODE_ENV -eq 'staging') { $Config.SESSION_HASH_PREVIEW } else { $Config.SESSION_HASH }
  $key = if ($Env:NODE_ENV -eq 'staging') { 'T:\__configs\M-1\sites\' + $Env:npm_package_name + '\auth\staging' } else { 'T:\__configs\M-1\sites\' + $Env:npm_package_name + '\auth\production' }
  $pw = $hsh | ConvertTo-SecureString -Key (Get-Content $key)

  # OPTIONS
  $Options = New-Object WinSCP.TransferOptions

  Function SessionConnect {
    [CmdletBinding()]

    # SESSION
    $Settings = New-Object WinSCP.SessionOptions -Property @{
      Protocol              = [WinSCP.Protocol]::Ftp
      FtpSecure             = [WinSCP.FtpSecure]::Explicit
      HostName              = $Config.SESSION_HOST
      UserName              = $usr
      Password              = [System.Net.NetworkCredential]::new('', $pw).Password
      TimeoutInMilliseconds = '60000'
    }

    $Settings.AddRawSettings("AddressFamily", "1")
    $Settings.AddRawSettings("FollowDirectorySymlinks", "1")
    $Settings.AddRawSettings("Utf", "1")
    $Settings.AddRawSettings("MinTlsVersion", "12")

    $WinSCP = New-Object WinSCP.Session
    $WinSCP.ExecutablePath = $winSCPexec

    # LOG
    $WinSCP.SessionLogPath = $Env:Onedrive + '\_mmrhcs\_logs\_winscp\m1.winscp.' + $Env:npm_package_name + '.deploy.log'
    $WinSCP.DebugLogPath = $Env:Onedrive + '\_mmrhcs\_logs\_winscp\m1.winscp.' + $Env:npm_package_name + '.deploy.debug.log'
    $WinSCP.DebugLogLevel = '0'
    $WinSCP.add_FileTransferred( { LogTransferredFiles($_) })

    # CONNECT
    $WinSCP.Open($Settings)

    return $WinSCP
  }

  try {

    # QUEUE - TRANSFER

    forEach ($Set in $Sets) {

      $Done = $Null

      while ($Done -eq $Null) {

        $Session = SessionConnect –ErrorAction Stop
        $ExitCode = $Null

        try {

          TransferHandler -Session $Session -Options $Options -Switch $Set –ErrorAction Stop
        }
        catch {

          if ($Session.Opened -eq $True) {

            Write-Host
            Write-Host '# CONNECTION # STATUS'
            Write-Host
            Write-Host "$(Get-Date -Format 'HH:mm:ss') Terminating..."

            $Session.Close()
            $Session.Dispose()

            Write-Host "$(Get-Date -Format 'HH:mm:ss') $(if ($Session.Opened -ne $True) { 'Connection Status: Closed' } else { 'Connection Status: Open' })"

            $Session = $Null
          }

          Write-Host
          Write-Host "$(Get-Date -Format 'HH:mm:ss') Retry..."

          $ExitCode = 1
        }

        if ($ExitCode -ne 1) {

          $Session.Close()
          $Session.Dispose()
          $Session = $Null
          $Done = $True
        }
      }
    }

    try {

      # QUEUE - ACTIVATION

      forEach ($Set in $Sets) {

        $Done = $Null

        while ($Done -eq $Null) {

          $Session = SessionConnect –ErrorAction Stop
          $ExitCode = $Null

          try {

            ActionHandler -Session $Session -Switch $Set -State 'Unlink' –ErrorAction Stop
            ActionHandler -Session $Session -Switch $Set -State 'Link' –ErrorAction Stop
          }
          catch {

            if ($Session.Opened -eq $True) {

              Write-Host
              Write-Host '# CONNECTION # STATUS'
              Write-Host
              Write-Host "$(Get-Date -Format 'HH:mm:ss') Terminating..."

              $Session.Close()
              $Session.Dispose()

              Write-Host "$(Get-Date -Format 'HH:mm:ss') $(if ($Session.Opened -ne $True) { 'Connection Status: Closed' } else { 'Connection Status: Open' })"

              $Session = $Null
            }

            Write-Host
            Write-Host "$(Get-Date -Format 'HH:mm:ss') Retry..."

            $ExitCode = 1
          }

          if ($ExitCode -ne 1) {

            $Session.Close()
            $Session.Dispose()
            $Session = $Null
            $Done = $True
          }
        }
      }
    }
    catch {

      Write-Host
      Write-Host '# ERROR # ACTIVATION'
      Write-Host
      Write-Host $_.Exception.Message
      Write-Host $_.ScriptStackTrace
      Write-Host
    }

    try {

      # QUEUE - CLEANUP

      forEach ($Set in $Sets) {

        $Done = $Null

        while ($Done -eq $Null) {

          $Session = SessionConnect –ErrorAction Stop
          $ExitCode = $Null

          try {

            ActionHandler -Session $Session -Switch $Set -State 'Cleanup' –ErrorAction Stop
          }
          catch {

            if ($Session.Opened -eq $True) {

              Write-Host
              Write-Host '# CONNECTION # STATUS'
              Write-Host
              Write-Host "$(Get-Date -Format 'HH:mm:ss') Terminating..."

              $Session.Close()

              Write-Host "$(Get-Date -Format 'HH:mm:ss') $(if ($Session.Opened -ne $True) { 'Connection Status: Closed' } else { 'Connection Status: Open' })"
            }

            $Session.Dispose()
            $Session = $Null

            Write-Host
            Write-Host "$(Get-Date -Format 'HH:mm:ss') Retry..."

            $ExitCode = 1
          }

          if ($ExitCode -ne 1) {

            $Session.Close()
            $Session.Dispose()
            $Session = $Null
            $Done = $True
          }
        }
      }
    }
    catch {

      Write-Host
      Write-Host '# ERROR # CLEANUP'
      Write-Host
      Write-Host $_.Exception.Message
      Write-Host $_.ScriptStackTrace
      Write-Host
    }
  }
  catch {

    Write-Host
    Write-Host '# ERROR # TRANSFER'
    Write-Host
    Write-Host $_.Exception.Message
    Write-Host $_.ScriptStackTrace
    Write-Host
  }
}
catch {

  Write-Host
  Write-Host '# ERROR # CONNECTION'
  Write-Host
  Write-Host $_.Exception.Message
  Write-Host $_.ScriptStackTrace
  Write-Host
}
finally {

  if ($Session.Opened -eq $True) {

    Write-Host
    Write-Host '# CONNECTION # STATUS'
    Write-Host
    Write-Host "$(Get-Date -Format 'HH:mm:ss') Terminating..."

    $Session.Close()
    $Session.Dispose()

    Write-Host "$(Get-Date -Format 'HH:mm:ss') $(if ($Session.Opened -ne $True) { 'Connection Status: Closed' } else { 'Connection Status: Open' })"

    $Session = $Null
  }

  $Timer.Stop()

  Write-Host
  Write-Host "### TASK ### DEPLOY ### END"
  Write-Host
  Write-Host "Time: $($Timer.Elapsed.TotalMinutes) Minutes"
  Write-Host
}
