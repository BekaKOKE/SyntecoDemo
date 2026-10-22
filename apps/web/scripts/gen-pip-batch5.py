# -*- coding: utf-8 -*-
"""Generates the batch-5 product table: Eye Protection.

Rows live in scripts/data/b5-eye-protection.json (scraped from
us.pipglobal.com); Russian copy lives in pip_ru_batch5.py.
"""
import io, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from pip_emit import emit
from pip_ru_batch5 import RU, APPS

CATS = [
    ("Eye Protection", 2562, "eye-protection", [
        ("11557", "eyewearAccessories"), ("11611", "faceProtection"),
        ("11613", "safetyGlasses"), ("11554", "safetyGoggles"),
    ], "pipEyeProtection",
     "PIP Eye Protection products — the Bouton(R) Optical, UVEX(R),\n"
     "Fibre-Metal(R), North(R) and JSP(R) EVOGuard(TM) ranges: safety\n"
     "glasses and readers, sealed and vented goggles, face shields,\n"
     "headgear, brackets and lens-care supplies, mirrored from\n"
     "https://us.pipglobal.com/en/products/?scID=2562"),
]

EN = "Names and catalog numbers stay in English: buyers search by PIP\nnomenclature. Only the descriptions are localised."

total = 0
for name, sc, slug, subs, registry, doc in CATS:
    path = os.path.join(HERE, 'data', 'b5-%s.json' % slug)
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
