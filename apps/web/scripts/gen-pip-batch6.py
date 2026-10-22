# -*- coding: utf-8 -*-
"""Generates the batch-6 product table: Protective Clothing.

Rows live in scripts/data/b6-protective-clothing.json (scraped from
us.pipglobal.com); Russian copy lives in pip_ru_batch6.py.
"""
import io, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from pip_emit import emit
from pip_ru_batch6 import RU, APPS

CATS = [
    ("Protective Clothing", 2563, "protective-clothing", [
        ("11716", "accessories"), ("11560", "aprons"),
        ("11821", "chemicalResistantClothing"), ("11742", "coldWeatherWear"),
        ("11654", "cutResistantWear"), ("11561", "disposableClothing"),
        ("11566", "frClothing"), ("11734", "faceCovers"),
        ("11629", "hiVisApparel"), ("11711", "hiVisColdGear"),
        ("11752", "hiVisRainwear"), ("11740", "hoodsAndPaintCaps"),
        ("11723", "metalMeshClothing"), ("11558", "rainwear"),
    ], "pipProtectiveClothing",
     "PIP Protective Clothing — Bisley(R), Falcon(TM), PosiWear(R),\n"
     "Boss(R), US Mesh(R) and the PIP(R) AR/FR collection: aprons,\n"
     "disposable and chemical-resistant suits, FR and arc-rated apparel,\n"
     "hi-vis wear, cold gear, rainwear and metal mesh, mirrored from\n"
     "https://us.pipglobal.com/en/products/?scID=2563"),
]

EN = "Names and catalog numbers stay in English: buyers search by PIP\nnomenclature. Only the descriptions are localised."

total = 0
for name, sc, slug, subs, registry, doc in CATS:
    path = os.path.join(HERE, 'data', 'b6-%s.json' % slug)
    rows = [r + [1] for r in json.load(io.open(path, encoding='utf-8'))]
    tables_d = {k: RU[k] for k in sorted({r[6] for r in rows})}
    tables_a = {k: APPS[k] for k in sorted({r[7] for r in rows})}
    seen = {str(r[0]) for r in rows}
    listed = {cc for cc, _ in subs}
    assert seen == listed, (name, seen ^ listed)
    n = emit('src/config/brands/pip-products/%s.ts' % slug, sc, doc + "\n\n" + EN,
             tables_d, tables_a, rows, subs, registry)
    total += n
    print('%-24s %3d products -> %s.ts' % (name, n, slug))
print('total', total)
