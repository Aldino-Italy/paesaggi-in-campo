/* Istruzioni di installazione per browser. Voci verificate il 22/10/2026 su:
   Manuale utente iPhone e iPad (support.apple.com/it-it, iOS e iPadOS 27 e 26), Guida di Chrome (support.google.com/chrome, hl=it),
   Mozilla Support (it), Microsoft Support (it-it) e, per i computer, su Google Chrome 156 e Microsoft Edge 155 in italiano.
   Le immagini «img/guida/…» sono schermate reali; quelle dei telefoni si aggiungono quando disponibili. */
window.DATA = window.DATA || {};
window.DATA.installa = {
  "ios-safari": {
    name: "iPhone, Safari",
    lead: "Su iPhone l'app si installa soltanto dal menu Condividi: Safari non ha un pulsante «Installa». La versione di iOS si legge in Impostazioni › Generali › Info.",
    steps: [
      { t: "Apri il link dell'app in **Safari**." },
      { t: "Tocca **«Condividi»** (quadrato con la freccia verso l'alto). Su **iOS 27** si trova dentro **«Menu della pagina»** (tre righe orizzontali), su **iOS 26** dentro **«Altro»** (…); se il layout dei pannelli è «In basso» o «In alto» è già nella barra di Safari." },
      { t: "Fai scorrere l'elenco e tocca **«Aggiungi alla schermata Home»**. Se la voce manca, scorri in fondo, tocca **«Modifica azioni»** e aggiungila." },
      { t: "Controlla che **«Apri come app web»** sia attivo." },
      { t: "Tocca **«Aggiungi»**. L'icona «Paesaggi» compare nella schermata Home: da ora apri l'app sempre da lì." }
    ],
    note: "Su iOS 18 il percorso è più breve: «Condividi» nella barra in basso, «Aggiungi alla schermata Home», «Aggiungi».",
    src: "support.apple.com/it-it, Manuale utente di iPhone per iOS 27 e iOS 26"
  },
  "ipad-safari": {
    name: "iPad, Safari",
    steps: [
      { t: "Apri il link dell'app in **Safari**." },
      { t: "Tocca il pulsante **Condividi** (quadrato con la freccia verso l'alto), a destra del campo di ricerca." },
      { t: "**iPadOS 27**: tocca **«Visualizza altro»**. **iPadOS 26**: tocca **«Altro»**." },
      { t: "Tocca **«Aggiungi alla schermata Home»** e lascia attivo **«Apri come app web»**." },
      { t: "Tocca **«Aggiungi»**." }
    ],
    src: "support.apple.com/it-it, Manuale utente di iPad per iPadOS 27 e 26"
  },
  "ios-chrome": {
    name: "iPhone e iPad, Chrome",
    steps: [
      { t: "Con l'app aperta in Chrome, tocca **«Condividi»** a destra della barra degli indirizzi." },
      { t: "Tocca **«Aggiungi alla schermata Home»**." },
      { t: "Lascia il nome «Paesaggi» e tocca **«Aggiungi»**." }
    ],
    note: "Se la voce non compare, apri lo stesso link in Safari e segui le istruzioni per Safari.",
    src: "support.google.com/chrome, piattaforma iOS (hl=it)"
  },
  "ios-edge": {
    name: "iPhone e iPad, Edge o Firefox",
    steps: [
      { t: "Copia l'indirizzo dell'app (pulsante in fondo a questa pagina)." },
      { t: "Apri **Safari**, incolla l'indirizzo e segui le istruzioni per Safari." }
    ],
    note: "Microsoft e Mozilla non documentano in italiano l'aggiunta alla schermata Home su iOS: con Safari il risultato è sicuro."
  },
  "ios-inapp": {
    name: "iPhone: link aperto dentro WhatsApp, Instagram, Gmail, Moodle",
    lead: "Dentro le altre app il link si apre in un browser interno, dal quale non si può installare.",
    steps: [
      { t: "Cerca nel browser interno il pulsante che apre la pagina in Safari (di solito l'icona della bussola o il menu in alto a destra); se non lo trovi, copia l'indirizzo." },
      { t: "Apri **Safari**, incolla l'indirizzo e segui le istruzioni per Safari." }
    ],
    note: "Le voci variano da un'app all'altra e cambiano con gli aggiornamenti: la via più sicura è inquadrare il QR code con la fotocamera, che apre direttamente Safari."
  },
  "android-chrome": {
    name: "Android, Chrome",
    steps: [
      { t: "Apri il link dell'app in **Chrome**. Se in basso compare la barra **«Installa app»**, toccala e passa al punto 4." },
      { t: "Tocca **⋮** (Altro), in alto a destra." },
      { t: "Tocca la voce di installazione: **«Installa app»**; nelle versioni più recenti la voce può chiamarsi **«Installa e crea scorciatoia»**." },
      { t: "Nella finestra di conferma tocca **«Installa»** (non «Crea scorciatoia», che apre il sito nel browser)." },
      { t: "Apri l'app dall'icona «Paesaggi» nella schermata Home o nell'elenco delle app." }
    ],
    src: "support.google.com/chrome, piattaforma Android (hl=it), e stringhe italiane di Chromium"
  },
  "android-samsung": {
    name: "Android, Samsung Internet",
    steps: [
      { t: "Apri il link in **Samsung Internet** e cerca l'icona di installazione nella barra degli indirizzi; toccala e conferma." },
      { t: "Se l'icona non c'è, apri il menu **≡** in basso a destra e scegli l'aggiunta alla schermata Home." }
    ],
    note: "Samsung non pubblica una guida in italiano per questa funzione. In caso di dubbio apri lo stesso link in Chrome, presente su tutti i Galaxy."
  },
  "android-firefox": {
    name: "Android, Firefox",
    steps: [
      { t: "Apri il link in **Firefox** e tocca il menu **⋮**." },
      { t: "Tocca **«Installa»**; se manca, **«Agg. a schermata principale»**." },
      { t: "Nel pannello «Aggiungi a schermata Home» trascina l'icona o tocca **«Aggiungi automaticamente»**." }
    ],
    src: "support.mozilla.org/it, «Utilizzare le web app in Firefox per Android»"
  },
  "android-edge": {
    name: "Android, Edge",
    steps: [
      { t: "Copia l'indirizzo dell'app (pulsante in fondo a questa pagina), aprilo in **Chrome** e segui le istruzioni per Chrome." }
    ],
    note: "Microsoft non documenta in italiano l'installazione delle app web su Edge per Android."
  },
  "android-inapp": {
    name: "Android: link aperto dentro WhatsApp, Gmail, Telegram, Moodle",
    lead: "Nel browser interno di un'altra app l'installazione non è possibile.",
    steps: [
      { t: "Tocca **⋮** in alto a destra e scegli **«Apri nel browser Chrome»** (o «Apri nel browser»), oppure usa il pulsante «Apri in Chrome» in fondo a questa pagina." },
      { t: "Prosegui con le istruzioni per Chrome." }
    ],
    src: "stringhe italiane di Chromium per le schede personalizzate (Custom Tabs)"
  },
  "desktop-chrome": {
    name: "Computer, Google Chrome",
    steps: [
      { t: "Nella barra degli indirizzi, a destra, fai clic su **«Installa»**.", img: "img/guida/chrome_1.jpg", src: "Google Chrome 156, schermata reale" },
      { t: "Nella finestra **«Installa app»** fai clic su **«Installa»**.", img: "img/guida/chrome_2.jpg", src: "Google Chrome 156, schermata reale" },
      { t: "In alternativa: menu **⋮** › **«Trasmetti, salva e condividi»** › **«Installa Paesaggi in campo…»**.", img: "img/guida/chrome_3.jpg", src: "Google Chrome 156, schermata reale" }
    ],
    note: "L'app si apre in una finestra propria e compare tra i programmi del computer.",
    after: { img: "img/guida/chrome_4.jpg", cap: "L'app installata, nella sua finestra" },
    src: "Google Chrome 156 in italiano"
  },
  "desktop-edge": {
    name: "Computer, Microsoft Edge",
    steps: [
      { t: "Nella barra degli indirizzi fai clic sull'icona **«App disponibile. Installa Paesaggi in campo»**.", img: "img/guida/edge_1.jpg", src: "Microsoft Edge 155, schermata reale" },
      { t: "Nella finestra **«Installa l'app Paesaggi in campo»** fai clic su **«Installa»**.", img: "img/guida/edge_2.jpg", src: "Microsoft Edge 155, schermata reale" },
      { t: "In alternativa: **…** (Impostazioni e altro) › **«Altri strumenti»** › **«App»** › **«Installa Paesaggi in campo»**.", img: "img/guida/edge_3.jpg", src: "Microsoft Edge 155, schermata reale" },
      { t: "Alla prima apertura, nel «Controllo di partenza», alla richiesta della posizione fai clic su **«Consenti»**.", img: "img/guida/edge_5.jpg", src: "Microsoft Edge 155, schermata reale" }
    ],
    after: { img: "img/guida/edge_6.jpg", cap: "Il Controllo di partenza completato" },
    src: "Microsoft Edge 155 in italiano"
  },
  "mac-safari": {
    name: "Mac, Safari",
    steps: [
      { t: "Con l'app aperta in Safari, fai clic su **Condividi** nella barra strumenti." },
      { t: "Scegli **«Aggiungi al Dock»**, poi **«Aggiungi»**." }
    ],
    src: "support.apple.com/it-it, Manuale di Safari per macOS 26"
  },
  "desktop-firefox": {
    name: "Computer, Firefox",
    steps: [
      { t: "Su **Windows**, da Firefox 143, compare nella barra degli indirizzi il pulsante per aggiungere il sito come app web alla barra delle applicazioni: fai clic e conferma." },
      { t: "Su **Mac e Linux** Firefox non installa app web: usa l'app come sito, oppure aprila in Chrome, Edge o Safari." }
    ],
    src: "support.mozilla.org/it, «Web app in Firefox per Windows»"
  },
  "permessi-ios": {
    name: "Se hai negato la posizione (iPhone e iPad)",
    steps: [
      { t: "Apri **Impostazioni** › **Privacy e sicurezza** › **Localizzazione** e controlla che **Localizzazione** sia attiva." },
      { t: "Per Safari: **Impostazioni** › **App** › **Safari** › **Posizione** › **«Chiedi»** o **«Consenti»**." },
      { t: "Riapri l'app e tocca di nuovo «Consenti la posizione» nel Controllo di partenza; alla richiesta scegli **«Consenti»**." }
    ],
    src: "support.apple.com/it-it, articolo 102647 e Manuale utente di iPhone per iOS 26"
  },
  "permessi-android": {
    name: "Se hai negato la posizione (Android)",
    steps: [
      { t: "Apri **Impostazioni** › **Posizione** e attiva **«Usa posizione»**." },
      { t: "Nella stessa pagina: **«Autorizzazioni di accesso alla posizione»** › **Chrome** › consenti e attiva **«Usa posizione esatta»**." },
      { t: "In Chrome: icona a sinistra dell'indirizzo › **«Autorizzazioni»** › **«Reimposta le autorizzazioni»**; poi riapri l'app e consenti la posizione." }
    ],
    src: "support.google.com/android e support.google.com/chrome (hl=it)"
  }
};
