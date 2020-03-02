$id = "portfolio-m"
$HostName = "wp1177004.server-he.de"
$UserName = if ($args -eq '-preview') { "ftp1177004-mpreview" } else { "ftp1177004-m" }

# Location
$baseLocalEntry = 'E:\Sites\'
$baseLocalEntryPath = $baseLocalEntry + $id + '\'
$baseLocalConfigPath = 'D:\Tools\__configs\M-1\sites\' + $id + '\'
$baseLocalDist = $baseLocalEntryPath + 'dist' + '\'

$baseRemoteEntry = '/'

# WinSCP
$winSCPexec = $Env:APPS_HOME + '\' + 'winscp\current\WinSCP.exe'
$winSCPdnet = $Env:APPS_HOME + '\' + 'winscp\current\WinSCPnet.dll'

# Authentication
$hsh = $baseLocalEntryPath + $(if ($args -eq '-preview') { "env\preview" } else { "env\prod" })
$key = $baseLocalConfigPath + $(if ($args -eq '-preview') { "auth\preview" } else { "auth\prod" })
$pwd = $(Get-Content $hsh | ConvertTo-SecureString -Key (Get-Content $key))

# Session
$session = $Null
$sessionOptions = $Null
$sessionLogPath = $baseLocalEntry + '_logs\_winscp.' + $id + '.deploy.log'
$sessionDebugPath = $baseLocalEntry + '_logs\_winscp.' + $id + '.deploy.debug.log'

# Helper
$done = $False

try
{
    Write-Host '## RUN ## DEPLOY'

    Add-Type -Path $winSCPdnet

    Import-Module ($baseLocalEntryPath + 'run\module\session.psm1')
    Import-Module ($baseLocalEntryPath + 'run\module\transfer.psm1')

    $sessionOptions = SessionSettings $HostName $UserName $pwd

    $session = New-Object WinSCP.Session
    $session.ExecutablePath = $winSCPexec
    $session.SessionLogPath = $sessionLogPath
    $session.DebugLogPath = $sessionDebugPath

    $session.Open($sessionOptions)
    $session.add_FileTransferred({LogTransferredFiles($_)})

    $transferOptions = New-Object WinSCP.TransferOptions
    $transferOptions.ResumeSupport.State = [WinSCP.TransferResumeSupportState]::On

    try
    {
        do
        {
            $done = TransferQueueHandler "public" $session $transferOptions $baseLocalDist $baseRemoteEntry
        }
        while ($done -eq $False)

        $done = $False

        do
        {
            $done = TransferQueueHandler "assets" $session $transferOptions $baseLocalDist $baseRemoteEntry
        }
        while ($done -eq $False)

        $done = $False

        do
        {
            $done = TransferQueueHandler "snippets" $session $transferOptions $baseLocalDist $baseRemoteEntry
        }
        while ($done -eq $False)

        $done = $False

        do
        {
            $done = TransferQueueHandler "templates" $session $transferOptions $baseLocalDist $baseRemoteEntry
        }
        while ($done -eq $False)

        $done = $False

        do
        {
            $done = FileActionsHandler "public" $session $baseRemoteEntry
        }
        while ($done -eq $False)

        $done = $False

        do
        {
            $done = FileActionsHandler "assets" $session $baseRemoteEntry
        }
        while ($done -eq $False)

        $done = $False

        do
        {
            $done = FileActionsHandler "snippets" $session $baseRemoteEntry
        }
        while ($done -eq $False)

        $done = $False

        do
        {
            $done = FileActionsHandler "templates" $session $baseRemoteEntry
        }
        while ($done -eq $False)

        $done = $False
    }
    finally
    {
        $session.Dispose()
        Write-Host
        Write-Host '## Complete ##'
        Write-Host
    }

    exit 0
}
catch
{
    Write-Host
    Write-Host '## Error ##'
    Write-Host
    Write-Host "$($_.Exception.Message)"
    Write-Host
    Write-Host "$($e.Destination)"
    Write-Host
    Write-Host '##'

    exit 1
}
