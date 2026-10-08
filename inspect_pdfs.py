from pathlib import Path
import sys
sys.stdout.reconfigure(encoding='utf-8')
import importlib.util
print('pypdf:', bool(importlib.util.find_spec('pypdf')))
folder = Path('C:/Users/ASUS/Downloads/hasithidev')
print('Folder exists:', folder.exists())
if importlib.util.find_spec('pypdf'):
    from pypdf import PdfReader
    for name in ['Assignment 3.pdf', 'IT3060HCI2026_Milestone02_GroupWE_112.pdf', 'IT3060 HCI Assignment 1.pdf']:
        print('\nDOCUMENT:', name)
        if 'Milestone02' in name:
            import fitz
            doc = fitz.open(folder / name)
            for i in [57,58,59]:
                doc[i].get_pixmap(matrix=fitz.Matrix(1.3,1.3)).save(f'prototype-{i+1}.png')
