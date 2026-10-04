$refs = @(
    "C:\Windows\System32\WinMetadata\Windows.Foundation.winmd",
    "C:\Windows\System32\WinMetadata\Windows.Graphics.winmd",
    "C:\Windows\System32\WinMetadata\Windows.Media.winmd",
    "C:\Windows\System32\WinMetadata\Windows.Storage.winmd",
    "System.Runtime.WindowsRuntime"
)

$source = Get-Content -Raw -Path "scripts/WinOcr.cs"
Add-Type -TypeDefinition $source -ReferencedAssemblies $refs

$res = [WinOcr]::Recognize("temp_ingestion/test_ocr_page.jpg")
Write-Host "OCR Output Length:" $res.Length
Write-Host "First 300 chars:"
Write-Host $res.Substring(0, [Math]::Min(300, $res.Length))
