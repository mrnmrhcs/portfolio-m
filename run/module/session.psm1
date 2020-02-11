Function SessionSettings
{
    $options = New-Object WinSCP.SessionOptions -Property @{
      Protocol = [WinSCP.Protocol]::Ftp
      HostName = $args[0]
      UserName = $args[1]
      Password = [System.Net.NetworkCredential]::new('', $args[2]).Password
      FtpSecure = [WinSCP.FtpSecure]::Explicit
      TimeoutInMilliseconds = 4200
    }

    $options.AddRawSettings('AddressFamily', '1')
    $options.AddRawSettings('FollowDirectorySymlinks', '1')
    $options.AddRawSettings('Utf', '1')
    $options.AddRawSettings('FtpForcePasvIp2', '0')
    $options.AddRawSettings('FtpPingInterval', '10')
    $options.AddRawSettings('SslSessionReuse', '0')

    return $options
}
