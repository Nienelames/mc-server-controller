Add-Type -AssemblyName PresentationFramework

shutdown.exe /s /t 60

$cancelResult = [System.Windows.MessageBox]::Show('Shutting down in 60. Cancel?', 'Shutdown', 'YesNo', 'Warning')

if ($cancelResult -eq 'Yes') {
    shutdown.exe /a
}