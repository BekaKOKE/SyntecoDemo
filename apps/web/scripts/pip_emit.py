# -*- coding: utf-8 -*-
"""Shared emitter for the generated PIP product tables.

Each gen-pip-<category>.py owns only its data — the scraped rows and the
Russian description/tag tables — and calls emit() to write the .ts file.
The TypeScript side shares src/config/brands/pip-products/build.ts, so the
manufacturer/datasheet URL rules exist in exactly one place.
"""
import io, json


def j(v):
    return json.dumps(v, ensure_ascii=False)


def emit(path, sc_id, doc, ru, apps, rows, subs, registry_name):
    """
    path          — output .ts path, relative to apps/web
    sc_id         — PIP scID for this super-category
    doc           — module docstring body (already wrapped to ~78 cols)
    ru            — {descKey: russian description}
    apps          — {appKey: [russian tags]}
    rows          — [[ccID, pid, brand, name, sku, imgPath, descKey, appKey,
                      sizes, colors, variants], ...]
    subs          — [(ccID, exportName), ...] in catalog order
    registry_name — name of the exported ccID -> products record
    """
    out = []
    out.append("import type { BrandProduct } from '../types';")
    out.append("import { buildProducts, type ProductRow, type ProductTables } from './build';")
    out.append("")
    out.append("/**")
    for line in doc.strip().splitlines():
        out.append((" * " + line).rstrip())
    out.append(" *")
    out.append(" * Generated — do not edit by hand.")
    out.append(" */")
    out.append("")
    out.append("const SC_ID = %d;" % sc_id)
    out.append("")
    out.append("const TABLES: ProductTables = {")
    out.append("  /** Russian card copy, shared between products of the same family. */")
    out.append("  descriptions: {")
    for k in sorted(ru):
        out.append("    %d: %s," % (k, j(ru[k])))
    out.append("  },")
    out.append("  /** Russian application tags. */")
    out.append("  applications: {")
    for k in sorted(apps):
        out.append("    %d: %s," % (k, j(apps[k])))
    out.append("  },")
    out.append("};")
    out.append("")
    out.append("const build = (rows: ProductRow[]): BrandProduct[] => buildProducts(SC_ID, TABLES, rows);")
    out.append("")

    for cc, varname in subs:
        sub_rows = [r for r in rows if str(r[0]) == str(cc)]
        out.append("/** ccID %s — %d products. */" % (cc, len(sub_rows)))
        out.append("export const %s: BrandProduct[] = build([" % varname)
        for r in sub_rows:
            out.append("  [%s, %s, %s, %s, %s, %s, %d, %d, %s, %s, %d]," % (
                r[0], j(r[1]), j(r[2]), j(r[3]), j(r[4]), j(r[5]),
                r[6], r[7], j(r[8]), j(r[9]), r[10]))
        out.append("]);")
        out.append("")

    out.append("/** Every product of this category, keyed by PIP ccID. */")
    out.append("export const %s: Record<string, BrandProduct[]> = {" % registry_name)
    for cc, varname in subs:
        out.append("  '%s': %s," % (cc, varname))
    out.append("};")
    out.append("")

    io.open(path, 'w', encoding='utf-8').write("\n".join(out))
    return len(rows)
