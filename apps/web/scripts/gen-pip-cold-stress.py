# -*- coding: utf-8 -*-
"""Generates src/config/brands/pip-products/cold-stress.ts from scraped PIP data."""
import io, json

RU = {
0:"Жилет с подогревом, один размер: гибкие нагревательные панели в груди и спине, три режима — 32 °C, 46 °C и 57 °C. Двусторонние застёжки-липучки подгоняются под любую фигуру, дышащий софтшелл не сковывает движения. Управление кнопкой на жилете или пультом из комплекта; повербанк 5 В/2 А даёт до 5 часов на минимальном режиме.",
1:"Подперчатки с подогревом, один размер: надеваются под любые перчатки и греют кровь, циркулирующую по тыльной стороне кисти. Материал тянется в четырёх направлениях и не мешает мелкой моторике, удлинённая манжета не пропускает снег. Три режима — 32 °C, 43 °C и 52 °C, два USB-аккумулятора до 2,5 часов работы.",
2:"Комплект из двух сменных USB-аккумуляторов Li-Ion для подперчаток с подогревом Boss® Therm™ (399-HG20). До 2,5 часов работы на минимальном режиме, полная зарядка за 2-2,5 часа.",
3:"Сменный аккумулятор 5 В для жилета с подогревом Boss® Therm™ (300-HV100). Вес 140 г, габариты 11,9 × 9,2 × 7 см.",
4:"Химические грелки для рук, активируются воздухом: выходят на рабочую температуру за 2-5 минут и греют больше 8 часов. Размер вкладыша 5,1 × 8,9 см — помещаются в перчатку или под подшлемник. Нагрев можно прервать, убрав грелку в герметичный пакет. Нетоксичны.",
5:"Набор химических грелок: 6 пар для рук, 10 корпусных и 5 пар для пальцев ног. Активируются воздухом, выходят на температуру за 2-5 минут и держат тепло 8-12 часов. Нетоксичны, нагрев можно прервать в герметичной упаковке.",
6:"Химические грелки для пальцев ног: надеваются поверх носка внутрь обуви. Активируются воздухом, выходят на температуру за 2-5 минут и греют больше 8 часов. Нетоксичны. Поставляются коробкой на 40 пар.",
7:"Корпусные химические грелки под свитшот или куртку: активируются воздухом, выходят на температуру за 2-5 минут и греют больше 12 часов. Нагрев можно прервать, убрав грелку в герметичный пакет. Нетоксичны.",
8:"Сменный пульт управления для жилета с подогревом Boss® Therm™ (300-HV100) — переключение режимов нагрева, не снимая верхнюю одежду.",
}

APPS = {
0:["Работа на холоде","3 режима нагрева","Пульт в комплекте","Машинная стирка"],
1:["Работа на холоде","Не мешает моторике","3 режима нагрева","Машинная стирка"],
2:["Аксессуар","Только для 399-HG20"],
3:["Аксессуар","Для жилета 300-HV100"],
4:["Строительство","Холодные склады","Работа на холоде","8+ часов тепла"],
5:["Набор","Работа на холоде","8-12 часов тепла"],
6:["Для обуви","Работа на холоде","8+ часов тепла"],
7:["Под одежду","Работа на холоде","12+ часов тепла"],
8:["Аксессуар","Для жилета 300-HV100"],
}

# [ccID, pid, brand, name, sku, img, ruKey, appKey, sizes, colors, variants]
ROWS = [
["11712","111749","Boss® Therm™","Therm™ Heated Vest","300-HV100","/archive/pim/300/8/300-HV100.jpg",0,0,"один размер","Black",1],
["11712","139231","Boss® Therm™","Therm™ Heated Glove Liner","399-HG20","/archive/pim/300/9/399-HG20---OMH.jpg",1,1,"один размер","Black",1],
["11712","139392","Boss® Therm™","Therm™ Heated Glove Liner Replacement Batteries - Two Pack","399-GLVBT","/archive/pim/300/11/399-GLVBT---FLAT.jpg",2,2,"один размер","Black",1],
["11712","127237","Boss® Therm™","Heated Vest Battery, 5V","399-HVBAT","/archive/pim/300/9/399-HVBAT---PKG - BATTERY - CORD.jpg",3,3,"один размер","Black",1],
["11662","82472","PIP®","Heat Packs - Air Activated Hand Warmers","399-HEATPACK","/archive/pim/300/51/399-HEATPACK-Individual.jpg",4,4,"один размер","Orange",1],
["11662","165378","PIP®","Heat Packs - Air Activated Hand, Body and Toe Warmer Multi Pack","399-HEATPACK-MULTI","/archive/pim/300/41/399-HEATPACK-MULTI.jpg",5,5,"один размер","White",1],
["11662","164260","PIP®","Heat Packs - Air Activated Toe Warmers","399-HEATPACK-TOE","/archive/pim/300/41/399-HEATPACK-TOE.jpg",6,6,"один размер","White",1],
["11662","165276","PIP®","Heat Packs - Air Activated Body Warmers","399-HEATPACK-BODY","/archive/pim/300/41/399-HEATPACK-BODY.jpg",7,7,"один размер","Black",1],
["11662","127228","Boss® Therm™","Heated Vest Remote Control Box","399-HVRE","/archive/pim/300/9/399-HVRE---PKG - REMOTE.jpg",8,8,"один размер","Black",1],
# PIP cross-lists the two spare parts under Warming as well as Heated Apparel.
["11662","139392","Boss® Therm™","Therm™ Heated Glove Liner Replacement Batteries - Two Pack","399-GLVBT","/archive/pim/300/11/399-GLVBT---FLAT.jpg",2,2,"один размер","Black",1],
["11662","127237","Boss® Therm™","Heated Vest Battery, 5V","399-HVBAT","/archive/pim/300/9/399-HVBAT---PKG - BATTERY - CORD.jpg",3,3,"один размер","Black",1],
]

SUBS = [("11712","heatedApparel"), ("11662","warming")]

DOC = """PIP Cold Stress products, mirrored from the manufacturer catalog at
https://us.pipglobal.com/en/products/?scID=2581

NOTE: PIP cross-lists the two Boss(R) Therm(TM) spare parts (399-GLVBT and
399-HVBAT) under both Heated Apparel and Warming, so the subcategory counts
(4 + 7) add up to more than the 9 distinct products. The grid and the sidebar
badge de-duplicate by `pid`; the chips keep the manufacturer's own numbers."""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pip_emit import emit

n = emit('src/config/brands/pip-products/cold-stress.ts', 2581, DOC, RU, APPS, ROWS, SUBS, 'pipColdStress')
print("cold-stress rows:", n)
