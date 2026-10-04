using System;
using System.IO;
using System.Threading.Tasks;
using Windows.Graphics.Imaging;
using Windows.Media.Ocr;
using Windows.Storage;

public class WinOcr {
    public static async Task<string> RecognizeAsync(string imagePath) {
        StorageFile file = await StorageFile.GetFileFromPathAsync(Path.GetFullPath(imagePath));
        using (var stream = await file.OpenAsync(FileAccessMode.Read)) {
            BitmapDecoder decoder = await BitmapDecoder.CreateAsync(stream);
            SoftwareBitmap bitmap = await decoder.GetSoftwareBitmapAsync();
            OcrEngine engine = OcrEngine.TryCreateFromUserProfileLanguages();
            if (engine == null) {
                return "OCR_ENGINE_NOT_AVAILABLE";
            }
            OcrResult result = await engine.RecognizeAsync(bitmap);
            return result.Text;
        }
    }

    public static string Recognize(string imagePath) {
        return RecognizeAsync(imagePath).GetAwaiter().GetResult();
    }
}
