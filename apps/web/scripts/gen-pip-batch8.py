# -*- coding: utf-8 -*-
"""Generates the batch-8 product table: Hand Protection — the last category.

Rows live in scripts/data/b8-hand-protection.json (scraped from
us.pipglobal.com); Russian copy lives in pip_ru_batch8.py.
"""
import io, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from pip_emit import emit
from pip_ru_batch8 import RU, APPS

CATS = [
    ("Hand Protection", 2560, "hand-protection", [
        ("11559", "chemicalResistant"), ("11570", "cutResistantGloves"),
        ("11547", "disposableGloves"), ("11731", "extendedUseDisposableGloves"),
        ("11552", "fabricWorkGloves"), ("11549", "generalPurposeCoated"),
        ("11550", "generalPurposeUncoated"), ("11581", "highPerformanceGloves"),
        ("11573", "leatherDrivers"), ("11621", "leatherPalmGloves"),
        ("11724", "metalMeshGloves"), ("11568", "paradeGloves"),
        ("11587", "protectionFromCold"), ("11578", "protectionFromHeat"),
    ], "pipHandProtection",
     "PIP Hand Protection — the largest category: ATG(R) MaxiFlex(R),\n"
     "MaxiCut(R), MaxiChem(R) and MaxiDry(R), G-Tek(R), Kut Gard(R) ATA(R),\n"
     "Assurance(R), Boss(R), Caiman(R), North(R) and US Mesh(R). Chemical,\n"
     "cut, heat and cold protection, disposables, coated and uncoated general\n"
     "purpose, leather and metal mesh, mirrored from\n"
     "https://us.pipglobal.com/en/products/?scID=2560"),
]

EN = "Names and catalog numbers stay in English: buyers search by PIP\nnomenclature. Only the descriptions are localised."

total = 0
for name, sc, slug, subs, registry, doc in CATS:
    path = os.path.join(HERE, 'data', 'b8-%s.json' % slug)
    rows = [r + [1] for r in json.load(io.open(path, encoding='utf-8'))]
    tables_d = {k: RU[k] for k in sorted({r[6] for r in rows})}
    tables_a = {k: APPS[k] for k in sorted({r[7] for r in rows})}
    seen = {str(r[0]) for r in rows}
    listed = {cc for cc, _ in subs}
    assert seen == listed, (name, seen ^ listed)
    n = emit('src/config/brands/pip-products/%s.ts' % slug, sc, doc + "\n\n" + EN,
             tables_d, tables_a, rows, subs, registry)
    total += n
    print('%-24s %4d products -> %s.ts' % (name, n, slug))
print('total', total)
