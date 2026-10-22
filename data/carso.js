/* Dati dell'escursione nel Carso Classico. Testi condensati dalla guida (Bondesan, DiSSGeA). */
window.DATA = window.DATA || {};
window.DATA.carso = {
  id: "carso",
  title: "Carso Classico",
  subtitle: "Le risorgive del Timavo, le grotte di San Canziano e la Grotta Gigante",
  cover: "img/cover_carso.jpg",
  color: "#2b3a4a",
  center: [45.72, 13.80], zoom: 11,
  pdf: "docs/Guida_Escursione_Carso_Classico.pdf",
  meeting: { coords: [45.4178, 11.8832], text: "Ritrovo alle 8.15 davanti alla stazione delle corriere di Padova (autostazione Busitalia), lungo la strada che costeggia l'autostazione dopo il parcheggio delle biciclette. Partenza tassativa alle 8.30." },
  programme: [
    ["8.15", "ritrovo", "stazione delle corriere di Padova"],
    ["8.30", "partenza tassativa", "il pullman non attende i ritardatari"],
    ["10.00", "sosta", "autogrill Gonars Sud (A4); viveri"],
    ["11.00", "tappa 1, risorgive del Timavo", "San Giovanni di Duino; sosta breve a piedi"],
    ["12.00", "pranzo al sacco", "centro visitatori di San Canziano; piccolo museo"],
    ["13.00", "tappa 2, grotte di San Canziano", "visita guidata di circa due ore, 3 km, 500-800 gradini"],
    ["16.00", "tappa 3, Grotta Gigante", "visita guidata; 500 gradini in discesa e altrettanti in salita"],
    ["17.30", "partenza per il rientro", "da Borgo Grotta Gigante"],
    ["19.30", "arrivo a Padova", "orario indicativo"]
  ],
  practical: [
    "Documento d'identità valido obbligatorio: l'escursione entra in Slovenia. Il passaporto non serve.",
    "Viaggio e ingressi alle grotte di norma a carico dell'Ateneo; pranzo a carico di ciascuno. Viveri all'autogrill; bar-ristorante self-service a San Canziano.",
    "In grotta 11-12 °C, fondo bagnato e scivoloso: scarpe da trekking o da ginnastica robuste, abbigliamento a strati, giacca. Caschetto e torcia non servono.",
    "San Canziano: 500-800 gradini e un ponte a 47 m sul fiume; Grotta Gigante: 500 gradini in discesa e in risalita. Chi soffre di vertigini o claustrofobia avvisi il docente prima.",
    "In grotta e su gran parte dell'altopiano la rete è assente: usare «Prepara l'uso offline» prima di partire."
  ],

  intro: [
    { h: "Un nome diventato concetto", p: [
      "Carso, Kras, Karst: dalla radice preindoeuropea kar, «roccia». Da questo nome locale la geologia ha ricavato carsismo, carsico e carsologia, applicati a ogni regione calcarea del pianeta. Il Carso Classico è un'unità morfocarsica di circa 900 km² fra l'Isonzo e Postumia, ripartita fra Italia e Slovenia; la parte italiana, circa 200 km², comprende il Carso isontino e il Carso triestino.",
      "L'altopiano, quasi rettangolare e lungo una quarantina di chilometri in direzione NW-SE, digrada da San Canziano (circa 320 m) alle risorgive del Timavo. Non ha un reticolo di valli: la superficie è movimentata da migliaia di doline e le acque scorrono in profondità. Nel settore italiano oltre 3.000 cavità, 150 con sviluppo superiore a 100 m, un'ottantina di doline più larghe di 100 m; in 40 km² attorno a Sgonico quasi mille ingressi.",
      "L'interesse scientifico nasce dall'acquedotto di Trieste e da un enigma: il Reka sparisce a San Canziano e ricompare, una quarantina di chilometri più a valle, alle sorgenti del Timavo. Nel 1599 Ferrante Imperato tentò il primo tracciamento con galleggianti; nel 1841 Lindner raggiunse il fiume sul fondo dell'Abisso di Trebiciano; dal 1884 Hanke, Marinitsch e Müller esplorarono il canyon di San Canziano fino al Lago Morto (1890)." ] },
    { h: "Le rocce e la struttura", p: [
      "Calcari e dolomie della piattaforma carbonatica friulana, dall'Aptiano all'Eocene medio, oltre duemila metri di spessore: Calcari di Monte Coste, Formazione di Monrupino, Calcari di Aurisina (fino a 1.000 m, la roccia della Grotta Gigante), Formazione Liburnica, Calcari ad Alveoline e Nummuliti, poi il Flysch di Trieste, impermeabile, su cui sorge la città.",
      "Il Carso triestino è il fianco meridionale dell'anticlinale della Piattaforma di Comeno, asse NW-SE per Doberdò, Gorjansko e Sežana; strati a 10-30° verso SW, subverticali e rovesciati a Duino e al Monte Grisa. Il Thrust del Carso accavalla i calcari sul flysch verso SW.",
      "La superficie dell'altopiano, fra 250 e 450 m, è una superficie di spianamento che tronca gli strati piegati, nata dopo la rimozione del flysch fra Eocene e Pliocene. L'abbassamento differenziale verso NW nel Plio-Quaternario ha fatto cessare i fiumi di superficie prima che il flysch a sud fosse rimosso: per questo mancano valli cieche e polje fossili e abbondano le doline (Gams 1998)." ] },
    { h: "Come l'acqua scava la pietra", p: [
      "CaCO₃ + CO₂ + H₂O ⇄ Ca²⁺ + 2 HCO₃⁻. L'acqua, acidificata dall'anidride carbonica del suolo, dissolve il calcare dove scorre; in grotta perde CO₂ e deposita calcite. Sul Carso triestino, con 1.350 mm di pioggia, la superficie si abbassa di qualche centesimo di millimetro all'anno, misurato alla stazione della Grotta Gigante.",
      "Forme di superficie: karren (Rillenkarren, Rinnenkarren, Kamenitze) e campi solcati; doline di dissoluzione (a imbuto, le più comuni), di crollo (pareti subverticali, San Canziano) e di intersezione. Forme sotterranee: grotte di attraversamento con morfologia di canyon (San Canziano) e grandi caverne di crollo (Grotta Gigante). Le concrezioni crescono di un centesimo o un decimo di millimetro all'anno." ] },
    { h: "Il Timavo, un fiume in tre atti", p: [
      "Il Reka nasce sullo Snežnik e scorre per una quarantina di chilometri sul flysch della sinclinale di Brkini, bacino di 440 km², piovosità 2.000-2.600 mm. A Cerkvenikov mlin (1961-1990): media 8,26 m³/s, minimo 0,18, massimo 305 m³/s. Al contatto con il calcare entra in una valle cieca e sparisce.",
      "Percorso sotterraneo: 34 km in linea d'aria, 70-80 km stimati, due giorni in piena. Raggiunto a Kačna jama (6 km, 140 m s.l.m.) e, 15 km oltre, in quattro cavità profonde 300-370 m con il fiume a 10-20 m s.l.m. (Trebiciano, Kanjeduce, Stršinkna, Lazzaro Jerko). L'onda di piena arriva per pressione prima dell'acqua nuova, riconoscibile dal calo di temperatura e conducibilità con 4-43 ore di ritardo.",
      "Risorgive di San Giovanni di Duino: media 35 m³/s, minima 10, massima 150, da quattro polle in tre rami. Sistema sorgentifero (Doberdò, Pietrarossa, Lisert, Moschenizze, sorgenti costiere): media 40, massima 175 m³/s. L'Isonzo, che perde almeno 3 m³/s a valle del Vipacco, contribuisce in media al 56% del deflusso della zona sorgentifera (Doctor 2008)." ] }
  ],

  stops: [
    { n: 1, id: "timavo", name: "Le risorgive del Timavo", coords: [45.7884, 13.5903], radius: 250, time: "11.00", dur: "sosta breve",
      summary: "A San Giovanni di Duino le acque del Carso vengono alla luce da tre bocche a due chilometri dal mare. Il luogo condensa idrogeologia, storia e archeologia in poche centinaia di metri: le polle, la chiesa di San Giovanni in Tuba, la mansio romana sulla via Gemina, la Grotta del Mitreo, il porto fluviale sommerso.",
      see: ["Colore e limpidezza dell'acqua: verde-azzurra in magra, torbida in piena per l'arrivo del Reka.", "Le opere di captazione dell'acquedotto di Trieste.", "Il livello dell'acqua rispetto ai ponticelli: annotarlo con l'ora, per il confronto con il Reka a San Canziano tre ore dopo."],
      numbers: ["Portata media 35 m³/s, minima 10, massima 150", "Sistema sorgentifero: media 40, massima 175 m³/s su 30 km²", "Progetto Timavo 1990-93: cavità allagate fino a -82/83 m, oltre 1.500 m", "Riserva di deflusso di base 518 milioni di m³ (Doctor 2008)", "Falda in magra a 2-5 m s.l.m."],
      figures: ["c_gearth", "c_sorgente_foto", "c_guglia", "c_risorgive_aereo", "c_igmi_q1", "c_boegan", "c_trebiciano_foto"],
      links: [
        { t: "Scheda del geosito «Risorgive del Fiume Timavo» (Università di Trieste)", u: "https://www.geoscienze.units.it/geositi" },
        { t: "Catasto regionale delle grotte del FVG", u: "https://catastogrotte.regione.fvg.it/" },
        { t: "Doctor 2008, connessioni idrologiche del Carso Classico (Acta Carsologica)", u: "https://doi.org/10.3986/ac.v37i1.163" }
      ],
      targets: ["doberdo", "ermada", "duino"],
      questions: ["Le acque che escono qui sono soltanto quelle del Reka? Quali indizi chimici e isotopici distinguono i contributi?", "Perché il fiume riemerge proprio in questo punto e non altrove lungo la costa?"] },
    { n: 2, id: "skocjan", name: "Le grotte di San Canziano", coords: [45.6631, 13.9892], radius: 400, time: "13.00", dur: "due ore",
      summary: "A Škocjan il Reka incontra il calcare e sparisce in un sistema di gole, doline di crollo e gallerie lungo oltre sei chilometri, patrimonio UNESCO dal 1986. La visita entra dal tunnel nella Grotta del Silenzio, attraversa la Sala Grande, scende al canyon della Šumeča jama, passa il ponte Cerkvenik a 47 m sul fiume e risale alla Velika dolina.",
      see: ["Il rapporto fra la galleria asciutta e concrezionata della Grotta del Silenzio e il canyon attivo: la sequenza dei livelli.", "La forma del canyon: marmitte, mensole, depositi di piena, nessuna concrezione dove l'acqua passa.", "Dal belvedere: la Dolina Grande è un tratto di grotta senza più il tetto; l'Okno è il residuo di volta fra due crolli."],
      numbers: ["Sviluppo 6.200 m; dislivello 223 m fra 435 e 212 m", "Canyon 2.600 m, alto fino a 146 m; sala Martel 300 × 120 × 146 m, 2,2 milioni di m³", "Velika dolina profonda 163 m; ponte sul canale Hanke 47 m (1933)", "Stalagmite Orjak 15 m; tunnel d'ingresso 140 m", "Temperature 1997-99: medie 10-11 °C, mensili 1,6-17,3 °C", "UNESCO 1986, parco 1996, Ramsar 1999, MAB 2004"],
      figures: ["c_skocjan_foto", "c_bauer", "c_schema_skocjan", "c_sebela", "c_kranjc", "c_igmi_q6", "c_gabrovsek"],
      links: [
        { t: "Park Škocjanske jame, sito ufficiale", u: "https://www.park-skocjanske-jame.si/" },
        { t: "Storia delle esplorazioni (Parco)", u: "https://www.park-skocjanske-jame.si/en/about-the-park/history-of-research" },
        { t: "Šebela 2009, geologia strutturale delle grotte (Acta Carsologica)", u: "https://doi.org/10.3986/ac.v38i2-3.121" },
        { t: "Kranjc & Opara 2002, temperature in grotta (Acta Carsologica)", u: "https://doi.org/10.3986/ac.v31i1.405" }
      ],
      targets: ["velika", "okno", "divaca"],
      questions: ["In che ordine si sono formati la Grotta del Silenzio e il canyon, e come si ricostruisce la sequenza?", "Perché la curva del fiume nel canale Hanke coincide con un incrocio di faglie?"] },
    { n: 3, id: "gigante", name: "La Grotta Gigante", coords: [45.7087, 13.7652], radius: 250, time: "16.00", dur: "circa un'ora e mezza",
      summary: "A Borgo Grotta Gigante si apre la più grande caverna turistica della regione, nata dalla riunione per crollo di pozzi e gallerie scavati in epoche diverse nei Calcari di Aurisina. È anche un laboratorio di geofisica: i pendoli di Marussi misurano le maree terrestri dagli anni Sessanta.",
      see: ["La volta con le superfici di distacco; i blocchi crollati lungo la parete sinistra; le stalagmiti cresciute sopra, che datano l'ultimo crollo.", "Le stalagmiti tozze a scodelle sovrapposte (Colonna Ruggero): gocce che cadono da grande altezza.", "Le argille rosse e gialle sul fondo; i pendoli; all'uscita, il confronto fra 11 °C e la temperatura esterna."],
      numbers: ["Grande Caverna (laser scanner 2011): 167,6 × 76,3 × 98,5 m, circa 365.000 m³; dati precedenti 130 × 65 × 110 m, 600.000 m³", "Ingresso 275 m, fondo 23 m; sviluppo 719 m; percorso 850 m, fondo a 101 m sotto l'ingresso", "Ultimo crollo: almeno 160.000-200.000 anni", "11 °C costanti; aperta dal 1908; Guinness 1995"],
      figures: ["c_igmi_q4", "c_igmi_q5", "c_carta_body", "c_carta_leg_pre"],
      links: [
        { t: "Grotta Gigante, sito ufficiale (Società Alpina delle Giulie)", u: "https://www.grottagigante.it/" },
        { t: "Scheda del geosito «Grotta Gigante» (Università di Trieste)", u: "https://www.geoscienze.units.it/geositi" }
      ],
      targets: ["monrupino", "skocjan_far"],
      questions: ["Che cosa resterà della Grotta Gigante fra qualche centinaio di migliaia di anni?", "Perché la temperatura è costante a 11 °C mentre nelle doline di San Canziano varia di oltre quindici gradi?"] }
  ],

  windows: [
    { name: "Bassa pianura friulana e Palmanova", coords: [45.905, 13.31], radius: 6000, text: "Dopo Gonars il pullman attraversa la bassa pianura friulana, la fascia delle risorgive che separa l'alta pianura ghiaiosa da quella argillosa. A sinistra la fortezza stellata di Palmanova; poco oltre il ponte sull'Isonzo. Da qui l'altopiano calcareo si annuncia come una linea scura sull'orizzonte orientale.", figures: ["c_gams1974"] },
    { name: "Terminazione occidentale del Carso", coords: [45.83, 13.52], radius: 4000, text: "Uscendo a Monfalcone si vedono, a sinistra, il Carso di Doberdò con il lago (5 m s.l.m., fondo di un polje su un graben, finestra sulla falda carsica), il lago di Pietrarossa, la dorsale Ermada-Cocco e il Solco del Vallone. L'Isonzo, subito a valle del Vipacco, perde almeno 3 m³/s nel Carso: parte dell'acqua che vedremo uscire al Timavo.", figures: ["c_igmi_q1"] },
    { name: "Sistiana, Duino e la costiera", coords: [45.77, 13.63], radius: 2500, text: "La baia di Sistiana è impostata su faglie; la falesia di Duino sugli strati subverticali del margine dell'anticlinale. Le cave di Aurisina sfruttano i Calcari di Aurisina, pietra ornamentale dall'epoca romana. La costa alta fra Sistiana e Miramare è il bordo della superficie di spianamento.", figures: ["c_carta_body"] },
    { name: "L'altopiano fra Prosecco e Opicina", coords: [45.715, 13.74], radius: 3000, text: "Calcari puri e doline a perdita d'occhio: la piattezza del paesaggio è la superficie di spianamento che tronca gli strati piegati. Verso Monrupino, a NE, dolomie e calcari dolomitici danno colline e vallecole. Tre tipi di dolina convivono: di dissoluzione, di crollo, di intersezione.", figures: ["c_igmi_q1abcd", "c_igmi_q5"] },
    { name: "Fernetti, Sežana, Divača", coords: [45.70, 13.90], radius: 5000, text: "Oltre il confine lo stesso altopiano, con i toponimi doppi sui cartelli. Fra Sežana e Divača si passa Lipica. La valle del Reka arriva da sud-est, sul flysch della sinclinale di Brkini, e termina contro il calcare a San Canziano in una valle cieca.", figures: ["c_gams_geomorf", "c_gams_profili"] },
    { name: "Val Rosandra, a sud-est di Trieste", coords: [45.62, 13.87], radius: 3000, text: "Forra incisa fin quasi al livello del mare dove calcari compatti si alternano ad arenarie e marne: forme carsiche e fluviali insieme, cascate, meandri, marmitte, più di quarantacinque grotte. Le due carte al 25.000 della guida mostrano quanto sia difficile rappresentarla.", figures: ["c_igmi_q2", "c_igmi_q3"] }
  ],

  targets: {
    doberdo: { name: "Lago di Doberdò", coords: [45.8380, 13.5450], note: "polje su graben, 5 m s.l.m." },
    ermada: { name: "Monte Ermada", coords: [45.8060, 13.6060], note: "dorsale Ermada-Cocco" },
    duino: { name: "Falesia di Duino", coords: [45.7720, 13.6000], note: "strati subverticali" },
    velika: { name: "Velika dolina", coords: [45.6640, 13.9915], note: "163 m di profondità" },
    okno: { name: "Ponte naturale Okno", coords: [45.6630, 13.9942], note: "residuo di volta fra due crolli" },
    divaca: { name: "Divača", coords: [45.6840, 13.9700], note: "3 km dalle grotte" },
    monrupino: { name: "Monrupino (Repentabor)", coords: [45.7210, 13.7950], note: "dolomie, rilievi collinari" },
    skocjan_far: { name: "San Canziano (direzione)", coords: [45.6631, 13.9892], note: "l'inghiottitoio del Reka" },
    trebiciano: { name: "Abisso di Trebiciano", coords: [45.6836, 13.8437], note: "Timavo a 12 m s.l.m." }
  },

  figures: [
    { id: "c_gams1974", cap: "Carta morfologico-idrogeologica del Carso: le forme principali seguono la direzione NW-SE delle strutture; le linee punteggiate sono le connessioni idriche sotterranee accertate (10) e incerte (11).", src: "Castiglioni (1978), fig. 9.11, da Gams (1974)", tags: ["carta", "idrogeologia"] },
    { id: "c_carta_body", cap: "Carta geologica del Carso Classico italiano alla scala 1:50.000. Calcari cretacei (verdi) al nucleo dell'altopiano, unità paleoceniche ed eoceniche (gialle e ocra) verso il mare, Flysch di Trieste, depositi quaternari sulla costa e nella piana di Monfalcone.", src: "Cucchi & Piano (a cura di), Progetto GEO-CGT, Regione FVG e Università di Trieste", tags: ["carta", "geologia"] },
    { id: "c_carta_leg_pre", cap: "Legenda della Carta geologica del Carso Classico italiano.", src: "Cucchi & Piano (a cura di), Progetto GEO-CGT", tags: ["carta", "geologia"] },
    { id: "c_gams_geomorf", cap: "Carta geomorfologica del Carso. 1 pianura carsica, 2 pianura dissecata, 3 valle secca, 4 forra, 5 serie di doline, 6 conche chiuse, 7a dorsale carbonatica, 7b forra in dorsale, 8 scarpata, 9 semigraben, 10 scorrimento lungo faglia, 11 dorsale impermeabile, 12 valle fluviale, 13 piana alluvionale, 14 corso d'acqua.", src: "Gams (1998), Acta Carsologica 27/2", tags: ["carta", "geomorfologia"] },
    { id: "c_gams_profili", cap: "Profili trasversali dell'altopiano (I-X) e sezioni geologiche A-A' e B-B'. 1 Quaternario, 3 flysch, 7-13 Cretaceo superiore, 14-16 Cretaceo inferiore. La superficie quasi piana tronca gli strati piegati.", src: "Gams (1998), da Pleničar (1961)", tags: ["sezione", "geologia"] },
    { id: "c_igmi_q1abcd", cap: "Quattro ritagli della Carta d'Italia al 25.000 (fogli Monte dei Pini e Samatorza) con doline dall'ettometro al decametro; ogni ritaglio copre poco più di 1,5 km².", src: "Cucchi, scheda 58 dell'Atlante dei tipi geografici, IGM", tags: ["carta", "doline"] },
    { id: "c_igmi_q5", cap: "Modello digitale del terreno del Carso triestino centrale: le doline come depressioni ombreggiate; le dorsali in alto a destra sono i rilievi dolomitici del settore NE.", src: "Cucchi, scheda 58 dell'Atlante, IGM", tags: ["carta", "doline"] },
    { id: "c_igmi_q2", cap: "La Val Rosandra nella Carta d'Italia attuale al 25.000 (foglio San Dorligo della Valle).", src: "Cucchi, scheda 58 dell'Atlante, IGM", tags: ["carta"] },
    { id: "c_igmi_q3", cap: "La Val Rosandra nella levata storica a tratteggio (foglio Erpelle-Cosina).", src: "Cucchi, scheda 58 dell'Atlante, IGM", tags: ["carta"] },
    { id: "c_gabrovsek", cap: "Carta semplificata e sezione del Carso con il percorso sotterraneo del Reka e le grotte in cui è stato raggiunto: 1 Škocjanske jame, 2 Kačna jama, 3 Kanjeduce, 4 Stršinkna dolina, 5 Labodnica (Trebiciano), 6 Lazzaro Jerko, 7 sorgenti del Timavo.", src: "Gabrovšek & Peric (2006), fig. 1", tags: ["carta", "idrogeologia"] },
    { id: "c_boegan", cap: "Profilo longitudinale del Timavo sotterraneo, da San Canziano (circa 320 m) alle sorgenti, con le cavità proiettate; Trebiciano raggiunge il fiume a 12 m s.l.m.", src: "Boegan (1938), Il Timavo", tags: ["sezione", "idrogeologia"] },
    { id: "c_trebiciano_foto", cap: "Il lago della Sala Lindner sul fondo dell'Abisso di Trebiciano, dove il Timavo fu raggiunto nel 1841, a 12 m s.l.m. sotto più di trecento metri di calcare.", src: "Cucchi & Zini, Le acque del Carso Classico, fig. 6", tags: ["foto", "idrogeologia"] },
    { id: "c_igmi_q1", cap: "Terminazione occidentale del Carso al 50.000 (fogli Grado e Gorizia): Carso di Doberdò e lago, dorsale Ermada-Cocco, depressione di Iamiano e Brestovizza, piana di Monfalcone, risorgive del Timavo, baia di Sistiana, falesia di Duino.", src: "Cucchi, scheda 58 dell'Atlante, IGM", tags: ["carta"] },
    { id: "c_gearth", cap: "Le tre bocche del Timavo dall'alto, fra la piana industriale di Monfalcone e il margine dell'altopiano; meno di due chilometri fino al golfo di Panzano.", src: "immagine satellitare Google Earth, materiale del corso", tags: ["foto", "idrogeologia"] },
    { id: "c_guglia", cap: "Il Complesso del Timavo: pianta delle cavità allagate rilevate dagli speleosubacquei a monte delle bocche.", src: "Guglia, in AA.VV. (1994), Progetto Timavo", tags: ["carta", "idrogeologia"] },
    { id: "c_risorgive_aereo", cap: "La stessa area in immagine aerea, con il reticolo ipogeo in blu.", src: "Cucchi & Zini, fig. 4", tags: ["foto", "idrogeologia"] },
    { id: "c_sorgente_foto", cap: "Una delle bocche del Timavo a San Giovanni di Duino.", src: "Cucchi & Zini, fig. 3", tags: ["foto"] },
    { id: "c_skocjan_foto", cap: "Il Reka fra le doline di crollo di San Canziano: il villaggio e la chiesa in alto, il ponte naturale al centro, la cascata nella Dolina Grande in basso.", src: "Cucchi & Zini, fig. 2", tags: ["foto", "grotte"] },
    { id: "c_bauer", cap: "Stereogramma della zona in cui il Timavo superiore diventa sotterraneo: il fiume allogenico scorre in un canyon carsico, passa sotto un ponte naturale, si inabissa in una grande grotta; le doline di crollo ai lati sono antichi corsi sotterranei abbandonati.", src: "Castiglioni (1978), fig. 9.12, da Bauer (1971)", tags: ["schema", "grotte"] },
    { id: "c_schema_skocjan", cap: "Schema delle grotte di San Canziano con il percorso turistico: tunnel artificiale, Tiha jama, Velika dvorana, Šumeča jama, ponte sul canale Hanke, Velika dolina.", src: "Park Škocjanske jame, materiale del corso", tags: ["schema", "grotte"] },
    { id: "c_sebela", cap: "Carta geologico-strutturale della parte orientale delle grotte: in rosso faglie e zone fratturate, in nero le giaciture; il fiume segue le discontinuità.", src: "Šebela (2009), Acta Carsologica 38/2-3, fig. 2", tags: ["carta", "grotte"] },
    { id: "c_kranjc", cap: "Pianta e sezione delle grotte con il percorso turistico (rosso), il fiume (azzurro), le doline di crollo (giallo) e i punti di misura della temperatura.", src: "Kranjc & Opara (2002), fig. 4, disegno di F. Drole", tags: ["carta", "grotte"] },
    { id: "c_igmi_q6", cap: "L'area di San Canziano nella Carta d'Italia al 50.000 (foglio Trieste, toponimi italiani): Divaccia, Mattauno, le doline di crollo; a ovest Corgnale.", src: "Cucchi, scheda 58 dell'Atlante, IGM", tags: ["carta"] },
    { id: "c_igmi_q4", cap: "Il Carso triestino centrale al 50.000 fra Prosecco, Sgonico, Rupingrande e Monrupino; in basso Borgo Grotta Gigante. L'altopiano è punteggiato di doline.", src: "Cucchi, scheda 58 dell'Atlante, IGM", tags: ["carta", "doline"] },
    { id: "c_ritrovo1", cap: "Il punto di ritrovo a Padova: la strada lungo la stazione delle corriere, a est della stazione ferroviaria.", src: "Google Earth, elaborazione del docente", tags: ["logistica"] },
    { id: "c_ritrovo2", cap: "Il punto di ritrovo a Padova, dettaglio.", src: "Google Earth, elaborazione del docente", tags: ["logistica"] }
  ],

  timeline: [
    { d: "1599", t: "Ferrante Imperato getta galleggianti nell'inghiottitoio: primo tracciamento" },
    { d: "1689", t: "Valvasor descrive l'inghiottitoio e il percorso sotterraneo" },
    { d: "1819", t: "Libro dei visitatori; Tominc fa costruire i gradini nella Velika dolina" },
    { d: "1839-40", t: "Svetina segue il fiume fino alla terza cascata" },
    { d: "1840-41", t: "Lindner nella Grotta Gigante e sul fondo di Trebiciano" },
    { d: "1851-52", t: "Schmidl con i minatori di Idrija" },
    { d: "1884", t: "Hanke, Marinitsch e Müller iniziano le esplorazioni sistematiche" },
    { d: "1890", t: "Sala Martel e Lago Morto raggiunti (5 ottobre); seconda entrata alla Gigante" },
    { d: "1904", t: "Scoperta della Tiha jama; ingresso della Gigante allargato" },
    { d: "1908", t: "Grotta Gigante aperta al pubblico" },
    { d: "1933", t: "Ponte sul canale Hanke, 47 m sopra il fiume" },
    { d: "anni '60", t: "Pendoli di Marussi nella Grotta Gigante" },
    { d: "1986", t: "Škocjan patrimonio UNESCO" },
    { d: "1990-93", t: "Progetto Timavo, cavità allagate fino a -82 m" },
    { d: "1991", t: "Superato il sifone del lago Marchesetti" },
    { d: "2011", t: "Rilievo laser scanner della Grande Caverna" }
  ],

  scales: [
    { label: "Deposizione dei calcari di piattaforma", years: 100e6 },
    { label: "Orogenesi dinarica e rimozione del flysch", years: 40e6 },
    { label: "Crisi di salinità del Messiniano", years: 5.5e6 },
    { label: "Ultimo crollo nella Grotta Gigante", years: 180000 },
    { label: "Crescita della stalagmite Orjak (15 m)", years: 150000 },
    { label: "Speleologia scientifica", years: 427 },
    { label: "Acqua dal Reka alle risorgive, in piena", years: 2 / 365 },
    { label: "Ritardo dell'onda di piena, pressione contro acqua nuova", years: 1 / (365 * 24) }
  ],

  glossary: [
    ["Allogenico (fiume)", "corso d'acqua nato su rocce impermeabili che entra nel carso dall'esterno, come il Reka."],
    ["Anticlinale", "piega convessa verso l'alto; il Carso è il fianco meridionale di un'anticlinale ad asse NW-SE."],
    ["Carsismo", "processi di dissoluzione delle rocce carbonatiche e forme che ne derivano; epigeo in superficie, ipogeo in profondità."],
    ["Concrezione o speleotema", "deposito di calcite formato in grotta dall'acqua di percolazione: stalattiti, stalagmiti, colonne, coltrine, colate, vasche."],
    ["Dolina", "depressione chiusa subcircolare; di dissoluzione, di crollo o di intersezione."],
    ["Flysch", "marne e arenarie torbiditiche, impermeabili; copertura originaria dei calcari del Carso."],
    ["Forra", "valle stretta e profonda a pareti ripide; il canyon di San Canziano ne è l'equivalente ipogeo."],
    ["Graben e horst", "blocchi ribassati e rialzati fra faglie; il lago di Doberdò occupa un graben."],
    ["Inghiottitoio (ponor)", "punto in cui un corso d'acqua entra nel sottosuolo."],
    ["Karren", "solchi, scannellature e vaschette sulla roccia nuda: Rillenkarren, Rinnenkarren, Kamenitze."],
    ["Livello di base", "quota sotto la quale erosione e dissoluzione non si approfondiscono; per il Carso il mare, cambiato più volte nel Quaternario."],
    ["Piattaforma carbonatica", "mare poco profondo in cui si accumulano sedimenti carbonatici biogenici."],
    ["Polje", "grande depressione carsica a fondo piatto, spesso su strutture tettoniche."],
    ["Risorgiva", "punto in cui le acque sotterranee tornano in superficie."],
    ["Rudiste", "bivalvi cretacei costruttori di scogliere; i loro gusci formano i Calcari di Aurisina."],
    ["Sifone", "condotto completamente allagato percorso in pressione; il Lago Morto termina in un sifone."],
    ["Superficie di spianamento", "superficie quasi piana che tronca strutture piegate; la sommità dell'altopiano."],
    ["Valle cieca", "valle che termina contro una parete rocciosa perché il fiume sparisce in un inghiottitoio."]
  ],

  questions: [
    "Perché il Reka scorre in superficie per quaranta chilometri e poi sparisce? Che cosa cambia nella roccia al contatto fra il flysch e il calcare?",
    "Quale relazione c'è fra le doline di crollo di San Canziano e il canyon sotterraneo? Che cosa resterà della Grotta Gigante fra qualche centinaio di migliaia di anni?",
    "Le acque che escono alle risorgive del Timavo sono soltanto quelle del Reka? Quali indizi chimici e isotopici permettono di distinguere i contributi?",
    "La Grotta del Silenzio è asciutta e concrezionata, il canyon è attivo e privo di concrezioni. In che ordine si sono formati?",
    "Quante doline si contano in un chilometro quadrato attorno a Borgo Grotta Gigante sulla carta al 50.000, e quante nel modello digitale?",
    "Perché sull'altopiano mancano valli fluviali e perché, secondo Gams, vi mancano anche valli cieche e polje fossili?",
    "Che cosa si deduce sul regime del fiume dal confronto fra livello e colore dell'acqua alle risorgive e a San Canziano nello stesso giorno?",
    "Perché la temperatura della Grotta Gigante è costante a 11 °C mentre nelle doline di San Canziano varia di oltre quindici gradi fra i mesi?"
  ],

  teacher: [
    { h: "A. Sulla A4, da Gonars a Monfalcone", items: ["Idea guida: il luogo che ha dato il nome al carsismo; altopiano senza fiumi, migliaia di doline, un fiume sotto terra per decine di km.", "Carso Classico 900 km², italiano 200; limiti del Carso triestino; oltre 3.000 cavità, 150 oltre 100 m; 80 doline > 100 m; quasi 1.000 ingressi in 40 km² attorno a Sgonico. Piovosità 1.350 mm (1.000-1.800); Reka 2.000-2.600.", "Piattaforma friulana, Aptiano-Eocene, oltre 2.000 m; Flysch di Trieste. Anticlinale di Comeno, strati 10-30° a SW, verticali a Duino; Thrust del Carso. Spianamento 250-450 m; flysch rimosso Eocene-Pliocene; niente valli cieche e polje fossili (Gams).", "Uscendo a Monfalcone: Doberdò (5 m, polje su graben), Pietrarossa, Vallone, Ermada-Cocco, Iamiano-Brestovizza. Isonzo perde 3 m³/s.", "Speleologia: 1599 Imperato; 1689 Valvasor; 1839-40 Svetina; 1840-41 Lindner; 1884 DÖAV. Motore: acquedotto e ferrovia."] },
    { h: "B. Prima della tappa 1, risorgive", items: ["Idea guida: qui esce un fiume scomparso 34 km a est; il Timavo è un sistema (Reka, Isonzo, piogge, mare).", "Reka: Dletvo/Snežnik; 40 km sul flysch di Brkini; 440 km²; Cerkvenikov mlin 8,26 / 0,18 / 305 m³/s (Parco: 0,03 / 380 / 9).", "Sotterraneo: 34 km in linea d'aria, 70-80 stimati, 2 giorni in piena; Kačna jama 6 km a 140 m; Trebiciano (1841, 380 m) e le altre tre con il fiume a 10-20 m; piene a Trebiciano fino a 110 m; ritardo 4-43 ore.", "Risorgive: 4 polle, 3 rami; 35/10/150 m³/s; sistema 40/175 su 30 km². Perché qui: confinamento, tettonica, livello di base, mescolanza. Progetto Timavo -82/83 m, 1.500 m. Doctor: Isonzo 56%, riserva 518 milioni di m³, 1-2 mesi. Falda 2-5 m; 12-13 a Opicina.", "Far guardare: colore, captazioni, ponticelli; San Giovanni in Tuba, mansio, Mitreo, porto; annotare livello e ora."] },
    { h: "C. Attraversando l'altopiano", items: ["Idea guida: piattezza = superficie di spianamento; la costa alta è il bordo.", "Dal finestrino: Sistiana su faglie, falesia di Duino, cave di Aurisina (Calcari di Aurisina, 1.000 m); Prosecco-Sgonico doline; NE dolomitico collinare; costa con solchi nel flysch; Fernetti, Sežana, Lipica, Divača.", "Doline in tre righe: dissoluzione, crollo, intersezione; generazioni diverse nello stesso 1,5 km²; karren.", "Chimica una volta sola: CaCO₃ + CO₂ + H₂O ⇄ Ca²⁺ + 2 HCO₃⁻; abbassamento qualche centesimo di mm/anno.", "Anticipare: attraversamento contro crollo; destino comune la dolina di crollo."] },
    { h: "D. Prima della tappa 2, San Canziano", items: ["Logistica prima: pranzo, bar, museo; visita 3 km, 500 gradini (istruzioni 500-800), 2 ore, 12 °C, 0-20 lungo il fiume; ponte a 47 m in gabbia; vertigini.", "Numeri: 6.200 m; 223 m (435-212); canyon 2.600 × 146; Martel 300 × 120 × 146, 2,2 milioni di m³; Velika dolina 163 m, 300 m; Okno. Tutela 1981, UNESCO 25 nov 1986, parco 1996, Ramsar 1999, MAB 2004; 413 ha. Colonna di 300 m, Formazione di Lipica 130 m.", "Sequenza dell'acqua: valle cieca, prima dolina sotto la fortezza, Mariničeva, Mala dolina, due cascate sotto l'Okno, Velika dolina (Tominc, Schmidl), Rudolf, Svetina 100 m e Fontane, Müller 100 × 60, canale Hanke e ponte 1933, Rinaldini, Putick, Martel, Lago Morto, sifone; 1991 oltre Marchesetti.", "Date: 1599, 1689, 1819, 1839-40, 1851-52, 1884, 1887 quattordicesima cascata, 1890 Martel (5 ott), 1904 Tiha jama, 1933 ponte, 1991.", "Dentro: Orjak 15 m; terrazze centimetriche (Dreybrodt & Gabrovšek); marmitte e mensole; strati seguiti poi tagliati; curva di Hanke su faglie (Šebela); belvedere; temperature 10-11 medie, 1,6-17,3 mensili, -1,5/21,9 estreme."] },
    { h: "E. Prima della tappa 3, Grotta Gigante", items: ["Logistica: 850 m, 500 gradini giù e su, fondo a 101 m, 11 °C; partenza 17.30.", "Numeri: 2 VG; ingresso 275, fondo 23, profondità 250, sviluppo 719; Grande Caverna 167,6 × 76,3 × 98,5, 365.000 m³ (prima 130 × 65 × 110, 600.000); Calcari di Aurisina.", "Genesi: approfondimento nel Messiniano; crolli che riuniscono pozzo, caverne e gallerie; blocchi a sinistra, stalagmiti sopra: ultimo crollo 160-200.000 anni; argille; stalagmiti a scodelle (Colonna Ruggero).", "Storia: 1840 Lindner; 1890 secondo accesso; 1904; 1908 Club Touristi Triestini; fine anni Novanta uscita dall'alto. Perco 1897, Ursus spelaeus; Stradi e Andreolotti; galleria d'uscita abitata dal Neolitico.", "Laboratorio: pendoli di Marussi (fili ~100 m), sismografi OGS, stazione meteo, stazione di dissoluzione con 30 campioni.", "Chiusura: 11 °C e la temperatura di fuori; due grotte, due meccanismi, un destino."] }
  ],

  legend: [
    { k: "timavo", n: "Percorso sotterraneo del Timavo (schematico)", style: "line:#1f78b4;dash" },
    { k: "reka", n: "Reka in superficie, sul flysch", style: "line:#1f78b4" },
    { k: "cavita", n: "Cavità in cui il fiume è stato raggiunto", style: "point:#1f78b4" },
    { k: "sorgenti", n: "Sistema sorgentifero", style: "fill:#7fb8e0" },
    { k: "dolina", n: "Doline di crollo di San Canziano", style: "fill:#e0603a" },
    { k: "flysch", n: "Flysch di Trieste e di Brkini (schematico)", style: "fill:#c8b89a" },
    { k: "asse", n: "Asse dell'anticlinale del Carso", style: "line:#4a3b8c;dashdot" },
    { k: "punto", n: "Grotte e luoghi notevoli", style: "point:#2b3a4a" }
  ],

  geo: { "type": "FeatureCollection", "features": [
    { "type": "Feature", "properties": { "k": "reka", "name": "Reka in superficie", "desc": "Il fiume sul flysch della sinclinale di Brkini, fino alla valle cieca di San Canziano.", "conf": "schematico" },
      "geometry": { "type": "LineString", "coordinates": [[14.20,45.57],[14.12,45.60],[14.06,45.635],[14.02,45.655],[13.995,45.662]] } },
    { "type": "Feature", "properties": { "k": "timavo", "name": "Timavo sotterraneo", "desc": "Percorso ipogeo stimato in 70-80 km contro 34 in linea d'aria; tracciato schematico per i punti in cui il fiume è stato raggiunto.", "conf": "schematico da Gabrovšek & Peric 2006" },
      "geometry": { "type": "LineString", "coordinates": [[13.989,45.663],[13.955,45.660],[13.924,45.664],[13.885,45.672],[13.844,45.684],[13.830,45.690],[13.780,45.715],[13.720,45.745],[13.660,45.770],[13.590,45.788]] } },
    { "type": "Feature", "properties": { "k": "cavita", "name": "Kačna jama (Abisso dei Serpenti)", "desc": "6 km a valle di San Canziano, acque a circa 140 m s.l.m.", "conf": "approssimato" }, "geometry": { "type": "Point", "coordinates": [13.9243, 45.6643] } },
    { "type": "Feature", "properties": { "k": "cavita", "name": "Abisso di Trebiciano (Labodnica, 17 VG)", "desc": "Noto dal 1841; 380 m di profondità; il fiume a 12 m s.l.m. nella Sala Lindner.", "conf": "approssimato" }, "geometry": { "type": "Point", "coordinates": [13.8437, 45.6836] } },
    { "type": "Feature", "properties": { "k": "cavita", "name": "Grotta Meravigliosa di Lazzaro Jerko", "desc": "Una delle quattro cavità che raggiungono il fiume a 10-20 m s.l.m.", "conf": "approssimato" }, "geometry": { "type": "Point", "coordinates": [13.830, 45.690] } },
    { "type": "Feature", "properties": { "k": "sorgenti", "name": "Sistema sorgentifero del Timavo", "desc": "Risorgive, laghi di Doberdò e Pietrarossa, Lisert, Moschenizze, Sardos, sorgenti costiere: media 40, massima 175 m³/s su una trentina di km².", "conf": "schematico" },
      "geometry": { "type": "Polygon", "coordinates": [[[13.545,45.845],[13.575,45.845],[13.610,45.820],[13.620,45.795],[13.600,45.775],[13.570,45.780],[13.540,45.800],[13.535,45.830],[13.545,45.845]]] } },
    { "type": "Feature", "properties": { "k": "dolina", "name": "Velika dolina", "desc": "Dolina di crollo profonda 163 m e larga circa 300 m; il fiume vi entra con una cascata ed esce nel canyon.", "conf": "approssimato" },
      "geometry": { "type": "Polygon", "coordinates": [[[13.9895,45.6632],[13.9920,45.6622],[13.9940,45.6630],[13.9938,45.6652],[13.9910,45.6656],[13.9893,45.6645],[13.9895,45.6632]]] } },
    { "type": "Feature", "properties": { "k": "dolina", "name": "Mala dolina", "desc": "Dolina di crollo separata dalla Velika dolina dal ponte naturale Okno.", "conf": "approssimato" },
      "geometry": { "type": "Polygon", "coordinates": [[[13.9945,45.6622],[13.9965,45.6618],[13.9972,45.6633],[13.9952,45.6638],[13.9945,45.6622]]] } },
    { "type": "Feature", "properties": { "k": "asse", "name": "Asse dell'anticlinale del Carso (Piattaforma di Comeno)", "desc": "Asse NW-SE per Doberdò, Gorjansko e Sežana; il Carso triestino è il fianco meridionale.", "conf": "schematico da Placer 1981" },
      "geometry": { "type": "LineString", "coordinates": [[13.52,45.85],[13.68,45.78],[13.80,45.74],[13.95,45.70],[14.05,45.67]] } },
    { "type": "Feature", "properties": { "k": "flysch", "name": "Flysch di Trieste (fascia costiera)", "desc": "Marne e arenarie impermeabili su cui sorge Trieste; tettonicamente sotto il Thrust del Carso.", "conf": "molto schematico" },
      "geometry": { "type": "Polygon", "coordinates": [[[13.600,45.775],[13.635,45.770],[13.730,45.712],[13.780,45.680],[13.830,45.645],[13.870,45.612],[13.860,45.585],[13.800,45.570],[13.770,45.600],[13.760,45.650],[13.710,45.700],[13.600,45.775]]] } },
    { "type": "Feature", "properties": { "k": "punto", "name": "Grotta Gigante (2 VG)", "desc": "Grande Caverna 167,6 × 76,3 × 98,5 m; aperta dal 1908.", "conf": "OSM" }, "geometry": { "type": "Point", "coordinates": [13.7652, 45.7087] } },
    { "type": "Feature", "properties": { "k": "punto", "name": "Ingresso delle grotte di San Canziano", "desc": "Centro visitatori di Matavun; tunnel artificiale verso la Tiha jama.", "conf": "OSM" }, "geometry": { "type": "Point", "coordinates": [13.9845, 45.6621] } },
    { "type": "Feature", "properties": { "k": "punto", "name": "Lago di Doberdò", "desc": "A 5 m s.l.m. sul fondo di un polje impostato su un graben; finestra sulla falda carsica.", "conf": "OSM" }, "geometry": { "type": "Point", "coordinates": [13.545, 45.838] } },
    { "type": "Feature", "properties": { "k": "punto", "name": "Lago di Pietrarossa", "desc": "Seconda finestra sulla falda nel settore sorgentifero.", "conf": "OSM" }, "geometry": { "type": "Point", "coordinates": [13.55, 45.825] } },
    { "type": "Feature", "properties": { "k": "punto", "name": "Falesia di Duino", "desc": "Strati subverticali e rovesciati del margine dell'anticlinale.", "conf": "approssimato" }, "geometry": { "type": "Point", "coordinates": [13.600, 45.772] } },
    { "type": "Feature", "properties": { "k": "punto", "name": "Cave di Aurisina", "desc": "Calcari di Aurisina, pietra ornamentale dall'epoca romana.", "conf": "approssimato" }, "geometry": { "type": "Point", "coordinates": [13.665, 45.748] } },
    { "type": "Feature", "properties": { "k": "punto", "name": "Valico di Fernetti", "desc": "Confine fra Italia e Slovenia; stesso altopiano, toponimi doppi.", "conf": "OSM" }, "geometry": { "type": "Point", "coordinates": [13.830, 45.704] } }
  ] }
};
