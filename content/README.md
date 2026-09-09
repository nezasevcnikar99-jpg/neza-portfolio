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
| `kategorija` | Arhitektura, Literarni esej ali Grafika                            |
| `citat`      | pokaže se ob prehodu miške čez projekt na prvi strani              |
| `naslovna`   | ime datoteke iz `images/`; vedno prva slika na strani projekta     |
| `izrez`      | dve števili 0–100: kateri del naslovne slike se vidi v mreži       |
| `vrstniRed`  | manjše število pomeni prej v mreži                                 |
| `galerija`   | ena vrstica na sliko: `ime datoteke | stran ali galerija | opis`   |

`stran` pomeni, da se slika vidi že na strani projekta. Mest je štiri —
naslovna in tri od tu; kar je čez, gre kljub oznaki v galerijo. `galerija`
pomeni, da se pokaže šele, ko obiskovalec klikne gumb Galerija. Opis je lahko
prazen.

Slike naj imajo govoreča imena (`hisa-01.jpg`), ker so ta imena tudi to, po
čemer stran ve, da je slika že naložena.
