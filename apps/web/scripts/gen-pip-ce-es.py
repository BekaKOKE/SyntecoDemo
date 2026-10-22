# -*- coding: utf-8 -*-
"""Generates the Controlled Environment and Electrical Safety product tables.

Rows come from scripts/data/*.json (scraped from us.pipglobal.com and verified
against the browser by SHA-1); Russian copy comes from pip_ru_ce_es.py.
"""
import io, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from pip_emit import emit
from pip_ru_ce_es import RU, APPS


def load(*names):
    rows = []
    for n in names:
        rows += json.load(io.open(os.path.join(HERE, 'data', n + '.json'), encoding='utf-8'))
    # scraped rows carry no variant count of their own — each listing slot is
    # one product here, unlike Arm Protection where PIP repeats tiles per size
    return [r + [1] for r in rows]


def tables_for(rows):
    """Only the copy this category actually uses, so each file stays readable."""
    return {
        'descriptions': {k: RU[k] for k in sorted({r[6] for r in rows})},
        'applications': {k: APPS[k] for k in sorted({r[7] for r in rows})},
    }


CE_ROWS = load('ce-1', 'ce-2', 'ce-3')
ES_ROWS = load('es-1', 'es-2')

CE_SUBS = [
    ('11588', 'ceApron'),
    ('11686', 'ceFingerCots'),
    ('11553', 'ceGloves'),
    ('11730', 'ceMasks'),
    ('11548', 'ceSupplies'),
    ('11697', 'reusableClothing'),
]
ES_SUBS = [
    ('11640', 'arcAccessories'),
    ('11642', 'arcClothing'),
    ('11644', 'arcProtectionKits'),
    ('11624', 'electricalGloveProtection'),
    ('11648', 'electricalSafetyAccessories'),
    ('11698', 'insulatingBlankets'),
    ('11649', 'insulatingGloveKit'),
    ('11620', 'insulatingGloves'),
    ('11670', 'insulatingSleeves'),
]

CE_DOC = """PIP Controlled Environment products, mirrored from the manufacturer
catalog at https://us.pipglobal.com/en/products/?scID=2561

Cleanroom gloves, finger cots, aprons, masks, supplies and reusable garments —
CleanTeam(R), QRP(R), Uniform Technology(TM), North(R).

English names and catalog numbers are verbatim: buyers search by PIP
nomenclature. Only the descriptions are localised."""

ES_DOC = """PIP Electrical Safety products, mirrored from the manufacturer
catalog at https://us.pipglobal.com/en/products/?scID=2565

Novax(R) rubber insulating gloves, sleeves and blankets, arc-rated clothing,
shields and complete arc flash kits.

English names and catalog numbers are verbatim: buyers search by PIP
nomenclature. Only the descriptions are localised."""

n1 = emit('src/config/brands/pip-products/controlled-environment.ts', 2561, CE_DOC,
          tables_for(CE_ROWS)['descriptions'], tables_for(CE_ROWS)['applications'],
          CE_ROWS, CE_SUBS, 'pipControlledEnvironment')
n2 = emit('src/config/brands/pip-products/electrical-safety.ts', 2565, ES_DOC,
          tables_for(ES_ROWS)['descriptions'], tables_for(ES_ROWS)['applications'],
          ES_ROWS, ES_SUBS, 'pipElectricalSafety')
print('controlled-environment rows:', n1)
print('electrical-safety rows:', n2)
