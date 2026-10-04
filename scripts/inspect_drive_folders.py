import urllib.request
import re
import json

def check_drive_folder(folder_id):
    url = f'https://drive.google.com/drive/folders/{folder_id}?usp=sharing'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            print(f'=== Folder {folder_id} ===')
            title_m = re.search(r'<title>(.*?)</title>', html)
            if title_m:
                print('Folder Title:', title_m.group(1))
            
            # Extract Drive file entries
            # Drive embeds initial data in script tag window['_DRIVE_ivd'] or similar
            matches = re.findall(r'\[\"([a-zA-Z0-9_-]{25,45})\",\[\"([^\"]+)\"', html)
            print(f'Matches count: {len(matches)}')
            for fid, name in matches[:25]:
                print(f'  - File: {name} (ID: {fid})')
                
            # Generic file names
            file_names = set(re.findall(r'[\w\s\(\)\-\.]+\.(?:pdf|zip|epub|rar)', html, re.IGNORECASE))
            print('Detected PDF/ZIP/EPUB filenames:', file_names)

    except Exception as e:
        print(f'Error fetching {folder_id}: {e}')

if __name__ == '__main__':
    check_drive_folder('1X9uI9yRlzY4itV7mVdLt6xVlKv_gQjdN')
    check_drive_folder('13mSn291SEcELK-JxSRyJS4Zv95Yjy0bl')
