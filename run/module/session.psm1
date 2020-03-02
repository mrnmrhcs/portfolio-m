Function SessionSettings
{
    $options = New-Object WinSCP.SessionOptions -Property @{
      Protocol = [WinSCP.Protocol]::Ftp
      FtpSecure = [WinSCP.FtpSecure]::Explicit
      HostName = $args[0]
      UserName = $args[1]
      Password = [System.Net.NetworkCredential]::new('', $args[2]).Password
      TimeoutInMilliseconds = 60000
    }

    $options.AddRawSettings("AddressFamily", "1")
    $options.AddRawSettings("CacheDirectories", "0")
    $options.AddRawSettings("CacheDirectoryChanges", "0")
    $options.AddRawSettings("PreserveDirectoryChanges", "0")
    $options.AddRawSettings("FollowDirectorySymlinks", "1")
    $options.AddRawSettings("Utf", "1")
    # $options.AddRawSettings("FtpPingInterval", "60")
    $options.AddRawSettings("MinTlsVersion", "11")

    return $options
}
