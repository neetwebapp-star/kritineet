param (
    [Parameter(Mandatory=$true)]
    [string]$ImagePath
)

[Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null
[Windows.Storage.StorageFile, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null

$fullPath = [System.IO.Path]::GetFullPath($ImagePath)
$fileTask = [Windows.Storage.StorageFile]::GetFileFromPathAsync($fullPath)
$file = $fileTask.GetAwaiter().GetResult()

$streamTask = $file.OpenAsync([Windows.Storage.FileAccessMode]::Read)
$stream = $streamTask.GetAwaiter().GetResult()

$decoderTask = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
$decoder = $decoderTask.GetAwaiter().GetResult()

$bitmapTask = $decoder.GetSoftwareBitmapAsync()
$bitmap = $bitmapTask.GetAwaiter().GetResult()

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
$ocrResultTask = $engine.RecognizeAsync($bitmap)
$ocrResult = $ocrResultTask.GetAwaiter().GetResult()

foreach ($line in $ocrResult.Lines) {
    Write-Output $line.Text
}
