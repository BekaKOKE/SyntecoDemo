# -*- coding: utf-8 -*-
"""Generates the batch-7 product table: Fall Protection.

Rows live in scripts/data/b7-fall-protection.json (scraped from
us.pipglobal.com); Russian copy lives in pip_ru_batch7.py.

Unlike the other categories PIP writes a unique description per product
here, so pip_ru_batch7.RU holds 613 blocks for 684 products.
"""
import io, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from pip_emit import emit
from pip_ru_batch7 import RU, APPS

CATS = [
    ("Fall Protection", 2584, "fall-protection", [
        ("11679", "accessories"), ("11678", "anchorageConnectors"),
        ("11779", "bodyBelts"), ("11681", "connectingDevices"),
        ("11788", "descentAndConfinedSpaces"), ("11739", "fallProtectionKits"),
        ("11785", "harnesses"), ("11810", "horizontalLifelines"),
        ("11784", "lanyardEnergyAbsorbing"), ("11783", "lanyardPositioning"),
        ("11786", "ropeAndGrabs"), ("11782", "selfRetractingLifelines"),
        ("11693", "toolTethering"), ("11814", "verticalLifelines"),
    ], "pipFallProtection",
     "PIP Fall Protection — the Miller(R) range: harnesses, energy-absorbing\n"
     "and positioning lanyards, self-retracting lifelines, anchorage\n"
     "connectors, horizontal and vertical lifelines, DuraHoist confined-space\n"
     "systems, descent and rescue kits and tool tethering, mirrored from\n"
     "https://us.pipglobal.com/en/products/?scID=2584"),
]

EN = "Names and catalog numbers stay in English: buyers search by PIP\nnomenclature. Only the descriptions are localised."

total = 0
for name, sc, slug, subs, registry, doc in CATS:
    path = os.path.join(HERE, 'data', 'b7-%s.json' % slug)
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
