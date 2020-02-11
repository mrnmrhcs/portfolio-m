# Scope
$id = "firma"
$HostName = 'wp1177004.server-he.de'
$UserName = 'ftp1177004-s'

# Locations
$baseLocalEntry = 'E:\Sites\'
$baseLocalEntryPath = $baseLocalEntry + $id + '\'
$baseLocalConfigPath = 'D:\Tools\__configs\M-1\sites\' + $id + '\'
$baseLocalBackup = $baseLocalEntryPath + 'backup' + '\'
$baseLocalContent = $baseLocalEntryPath + 'db' + '\'

$baseRemoteEntry = '/'
$baseRemoteContent = $baseRemoteEntry + 'content' + '/'

$winSCPexec = $Env:APPS_HOME + '\' + 'winscp\current\WinSCP.exe'
$winSCPdnet = $Env:APPS_HOME + '\' + 'winscp\current\WinSCPnet.dll'

# Authentication
$hsh = $baseLocalEntryPath + 'env\live'
$key = $baseLocalConfigPath + 'auth\live'
$pwd = $(Get-Content $hsh | ConvertTo-SecureString -Key (Get-Content $key))

$session = $null
$sessionOptions = $null
$done = $false

try
{
    Add-Type -Path $winSCPdnet

    Import-Module ($baseLocalEntryPath + 'run\module\session.psm1')
    Import-Module ($baseLocalEntryPath + 'run\module\transfer.psm1')

    $sessionOptions = SessionSettings $HostName $UserName $pwd

    $session = New-Object WinSCP.Session
    $session.ExecutablePath = $winSCPexec

    $session.Open($sessionOptions)
    $session.add_FileTransferred({LogTransferredFiles($_)})

    $transferOptions = New-Object WinSCP.TransferOptions
    $transferOptions.ResumeSupport.State = [WinSCP.TransferResumeSupportState]::On

    try
    {
        Write-Host '## RUN ## CLONE'

        do
        {
            $done = FileActionsHandler "clone" $baseLocalEntryPath $baseLocalBackup $baseLocalContent
        }

        while ($done -eq $False)
        $done = $False

        do
        {
            $done = TransferQueueHandler "clone" $session $baseRemoteContent $baseLocalContent
        }

        while ($done -eq $False)
        $done = $False
    }

    finally
    {
        Write-Host
        $session.Dispose()
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
    Write-Host "$($_.ScriptStackTrace)"
    Write-Host
    Write-Host '##'

    exit 1
}
