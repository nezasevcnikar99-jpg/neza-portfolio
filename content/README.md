# Gradivo za projekte

Tu se zbira vsebina, preden gre na spletno stran. Ena datoteka na projekt v
`projects/`, slike v `images/`. Ko je vse pripravljeno:

    npm run import -- --dry-run     # samo pove, kaj bi naredil
    npm run import                  # vpraša za e-pošto in geslo, potem naloži

Uvoz nikoli ničesar ne izbriše. Če isti projekt uvoziš še enkrat, se
posodobi — nova kopija ne nastane. Slika, ki je na strani že naložena, se ne
naloži drugič.

## Oblika datoteke

```
---
naslov: Hiša ob reki
podnaslov: Prenova kmečke domačije
slug: hisa-ob-reki
kategorija: Arhitektura
leto: 2024
stranka: Zasebni naročnik
vloga: Projektiranje in vodenje
citat: Hiša se je naučila poslušati reko.
naslovna: hisa-01.jpg
izrez: 50 35
vrstniRed: 1
galerija:
  hisa-02.jpg | stran | Pogled z južne strani
  hisa-03.jpg | stran | Dnevni prostor
  hisa-04.jpg | galerija | Detajl stopnišča
  hisa-05.jpg | galerija |
---

Prvi odstavek je uvod na strani projekta.

## Koncept

Vse za tem naslovom je besedilo koncepta. Prazna vrstica pomeni nov odstavek.
```

### Kaj pomeni kaj

| Vrstica      | Pomen                                                             |
|--------------|-------------------------------------------------------------------|
| `naslov`     | obvezno                                                            |
| `slug`       | naslov v spletnem naslovu; če ga izpustiš, nastane iz naslova      |
| `kategorija` | Idejna zasnova, Seminarski projekt, Raziskava ali Natečaj           |
| `citat`      | pokaže se ob prehodu miške čez projekt na prvi strani              |
| `naslovna`   | ime datoteke iz `images/`; vedno prva slika na strani projekta     |
| `izrez`      | dve števili 0–100: kateri del naslovne slike se vidi v mreži       |
| `vrstniRed`  | manjše število pomeni prej v mreži                                 |
| `velikost`   | oblika v mreži na prvi strani: samodejno, kvadrat ali ležeče       |
| `oblika`     | `besedilo` za eseje (besedilo čez sredino strani), sicer `projekt` |
| `galerija`   | ena vrstica na sliko: `ime datoteke | stran ali galerija | opis`   |
| `cele`       | slike, ki se ne obrežejo (tlorisi, prerezi), ločene z vejico       |

Slike, naštete pri `cele`, se v vsakem okvirju pokažejo vse, na svetli
podlagi. Uvoz jih samo vklopi; izklopiš jih v adminu pri sliki.

**Vrstni red v galeriji** je vedno: najprej načrti obstoječega stanja (s
tlorisi rušenja), nato načrti prenove, na koncu fotografije. Tri slike z
oznako `stran` naj v tem zaporedju ohranijo svoj medsebojni vrstni red, ker
vrstni red določa, v kateri okvir pride katera.

`stran` pomeni, da se slika vidi že na strani projekta. Mest je štiri —
naslovna in tri od tu; kar je čez, gre kljub oznaki v galerijo. `galerija`
pomeni, da se pokaže šele, ko obiskovalec klikne gumb Galerija. Opis je lahko
prazen.

Slike naj imajo govoreča imena (`hisa-01.jpg`), ker so ta imena tudi to, po
čemer stran ve, da je slika že naložena.

## Načrti v PDF

Načrte ni treba pretvarjati ročno. PDF odloži v `content/pdf/`, potem:

```
npm run pdf -- content/pdf/hisa-nacrti.pdf --name hisa-nacrt
```

Vsaka stran postane slika v `content/images/` — `hisa-nacrt-01.jpg`,
`hisa-nacrt-02.jpg` … — s številko strani iz PDF-ja, tako da jo lahko takoj
navedeš v `galerija`.

| Možnost           | Pomen                                                        |
|-------------------|--------------------------------------------------------------|
| `--name ime`      | začetek imena datotek; brez tega velja ime PDF-ja             |
| `--pages 1,3-5`   | samo te strani; brez tega vse                                 |
| `--px 2400`       | daljša stranica slike v pikslih                               |
| `--format png`    | za čiste risbe s tankimi črtami; privzeto je `jpg`            |
| `--crop x,y,š,v`  | izreže del strani; štiri števila v odstotkih strani, od zgoraj levo |

Izrez je za portfolijske strani: ena stran je postavitev z naslovi, opisi in
številko strani, na spletno stran pa gre navadno samo slika s te strani.

PDF-i ostanejo samo pri tebi — v repozitorij se ne shranjujejo, na stran gredo
šele slike.
