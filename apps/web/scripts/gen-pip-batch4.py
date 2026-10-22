# -*- coding: utf-8 -*-
"""Generates the batch-4 product tables: Hearing Protection and Head
Protection.

Rows live in scripts/data/b4-<slug>.json (scraped from us.pipglobal.com);
Russian copy lives in pip_ru_batch4.py.
"""
import io, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from pip_emit import emit
from pip_ru_batch4 import RU, APPS

# category -> (scID, slug, [(ccID, exportName)], registryName, docstring)
CATS = [
    ("Hearing Protection", 2568, "hearing-protection", [
        ("11574", "earMuffs"), ("11598", "earPlugs"),
    ], "pipHearingProtection",
     "PIP Hearing Protection products — PIP(R) V3(TM) and Howard Leight(R)\n"
     "ear muffs, disposable and reusable ear plugs, dispensers and refills,\n"
     "mirrored from https://us.pipglobal.com/en/products/?scID=2568"),

    ("Head Protection", 2569, "head-protection", [
        ("11721", "accessories"), ("11576", "bumpCaps"),
        ("11652", "frHoods"), ("11645", "goToWorkKits"),
        ("11575", "hardHats"), ("11738", "safetyHelmets"),
        ("11628", "winterCapsAndLiners"),
    ], "pipHeadProtection",
     "PIP Head Protection products — Dynamic(R), JSP(R) Evolution(R),\n"
     "Traverse(TM), Fibre-Metal(R) and North(R) hard hats and safety helmets,\n"
     "bump caps, FR hoods, winter liners and the full accessory range,\n"
     "mirrored from https://us.pipglobal.com/en/products/?scID=2569"),
]

EN = "Names and catalog numbers stay in English: buyers search by PIP\nnomenclature. Only the descriptions are localised."

total = 0
for name, sc, slug, subs, registry, doc in CATS:
    path = os.path.join(HERE, 'data', 'b4-%s.json' % slug)
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
