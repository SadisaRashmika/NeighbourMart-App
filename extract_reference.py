from pathlib import Path
import pymupdf
doc = pymupdf.open('C:/Users/ASUS/Downloads/hasithidev/IT3060HCI2026_Milestone02_GroupWE_112.pdf')
assets = Path('client/assets/images/checkout')
assets.mkdir(parents=True, exist_ok=True)
# Render only the product/photo regions of the supplied prototype PDF.
for name, index, box in [
    ('milk',57,(.14,.240,.275,.291)),
    ('dhal',57,(.12,.367,.285,.415)),
    ('red-onions',57,(.115,.491,.29,.520)),
    ('big-onions',58,(.535,.333,.905,.441)),
    ('shop',59,(.668,.061,.930,.135)),
    ('basket',57,(.075,.016,.133,.031)),
]:
    page = doc[index]
    rect = page.get_image_rects(page.get_images(full=True)[0][0])[0]
    x0,y0,x1,y1 = box
    clip = pymupdf.Rect(rect.x0 + x0*rect.width, rect.y0 + y0*rect.height, rect.x0 + x1*rect.width, rect.y0 + y1*rect.height)
    page.get_pixmap(matrix=pymupdf.Matrix(8,8),clip=clip).save(str(assets / f'{name}.png'))
print('Extracted six prototype image regions.')
