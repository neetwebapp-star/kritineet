[Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if ($engine -ne $null) {
    Write-Host "Windows Native OCR is AVAILABLE! Language: $($engine.RecognizerLanguage.LanguageTag)"
} else {
    Write-Host "Windows Native OCR NOT available"
}
