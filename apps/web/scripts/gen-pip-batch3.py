# -*- coding: utf-8 -*-
"""Generates the batch-3 product tables: Emergency Responder, Ergonomics,
First Aid, Foot Protection, Heat Stress, Respiratory Protection, Warning
Beacons, Welding Protection and Workwear.

Rows live in scripts/data/b3-<slug>.json (scraped from us.pipglobal.com);
Russian copy lives in pip_ru_batch3.py.
"""
import io, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from pip_emit import emit
from pip_ru_batch3 import RU, APPS

# category -> (scID, slug, [(ccID, exportName)], registryName, docstring)
CATS = [
    ("Emergency Responder", 2578, "emergency-responder", [
        ("11636", "fireAndRescueGloves"), ("11635", "fireAndRescueGoggle"),
    ], "pipEmergencyResponder",
     "PIP Emergency Responder products — extrication gloves and fire/rescue\n"
     "goggles, mirrored from https://us.pipglobal.com/en/products/?scID=2578"),

    ("Ergonomics", 2564, "ergonomics", [
        ("11614", "ergonomicSupports"), ("11564", "kneeProtection"),
    ], "pipErgonomics",
     "PIP Ergonomics products — back, wrist, elbow and knee supports,\n"
     "mirrored from https://us.pipglobal.com/en/products/?scID=2564"),

    ("First Aid", 2570, "first-aid", [
        ("11687", "eyewash"), ("11582", "firstAidKit"),
    ], "pipFirstAid",
     "PIP First Aid products — Fendall(R) and Eyesaline(R) eyewash stations,\n"
     "cartridges and accessories plus first aid kits, mirrored from\n"
     "https://us.pipglobal.com/en/products/?scID=2570"),

    ("Foot Protection", 2586, "foot-protection", [
        ("11794", "overTheShoeBoots"), ("11793", "overTheSockBoots"),
        ("11823", "safetyFootwear"), ("11829", "workBoots"),
        ("11830", "workShoes"), ("11828", "workTrainers"),
    ], "pipFootProtection",
     "PIP Foot Protection products — BOSS(R) overboots and the PUMA(R) SAFETY\n"
     "range, mirrored from https://us.pipglobal.com/en/products/?scID=2586\n"
     "\n"
     "Note: PUMA(R) SAFETY footwear runs large; the size advice is kept in the\n"
     "Russian copy because buyers order the wrong size without it."),

    ("Heat Stress", 2574, "heat-stress", [
        ("11655", "absorptive"), ("11616", "evaporativeCooling"),
        ("11736", "hydration"), ("11627", "phaseChangeCooling"),
        ("11656", "sunProtection"),
    ], "pipHeatStress",
     "PIP Heat Stress products — EZ-Cool(R), HyperKewl(TM) and THORZT(TM)\n"
     "cooling, hydration and sun protection, mirrored from\n"
     "https://us.pipglobal.com/en/products/?scID=2574"),

    ("Respiratory Protection", 2566, "respiratory-protection", [
        ("11571", "disposableMasks"), ("11818", "escapeSolutions"),
        ("11668", "reusableFacepieces"), ("11819", "suppliedAirRespirators"),
    ], "pipRespiratoryProtection",
     "PIP Respiratory Protection products — disposable N95/P95 respirators,\n"
     "North(R) and Force Typhoon(TM) reusable facepieces, filters, cartridges\n"
     "and supplied-air kit, mirrored from\n"
     "https://us.pipglobal.com/en/products/?scID=2566"),

    ("Warning Beacons", 2567, "warning-beacons", [
        ("11601", "eFlareBeacon"),
    ], "pipWarningBeacons",
     "PIP Warning Beacons — the Eflare(R) range, mirrored from\n"
     "https://us.pipglobal.com/en/products/?scID=2567"),

    ("Welding Protection", 2585, "welding-protection", [
        ("11701", "frClothing"), ("11703", "handProtection"),
        ("11747", "headProtection"), ("11709", "weldingAccessory"),
    ], "pipWeldingProtection",
     "PIP Welding Protection products — Caiman(R) and Ironcat(R) gloves,\n"
     "FR clothing, Fibre-Metal(R) helmets and welding accessories, mirrored\n"
     "from https://us.pipglobal.com/en/products/?scID=2585"),

    ("Workwear", 2588, "workwear", [
        ("11757", "workApparel"),
    ], "pipWorkwear",
     "PIP Workwear — the Bisley(R) X-Airflow(TM), Essentials and Performance\n"
     "ranges, mirrored from https://us.pipglobal.com/en/products/?scID=2588"),
]

EN = "Names and catalog numbers stay in English: buyers search by PIP\nnomenclature. Only the descriptions are localised."

total = 0
for name, sc, slug, subs, registry, doc in CATS:
    path = os.path.join(HERE, 'data', 'b3-%s.json' % slug)
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
