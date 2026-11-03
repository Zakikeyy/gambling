/**
 * Data Riset Ilmiah & Parameter Probabilitas Kasino
 * Bersumber dari 8 Jurnal & Prosiding Penelitian Akademik Resmi
 */

export interface ResearchJournal {
  id: string;
  title: string;
  authors: string;
  institution: string;
  journalName: string;
  year: number;
  pdfPath: string;
  category: 'Hukum' | 'Psikologi' | 'Sosiologi' | 'Matematika' | 'Ekonomi';
  summary: string;
  keyQuotes: string[];
  scientificInsights: string[];
}

export interface GameMathProfile {
  gameId: string;
  gameTitle: string;
  winProbabilityText: string;
  winProbabilityPct: number;
  houseEdgePct: number;
  expectedValueText: string;
  mechanism: string;
  psychologicalTrap: string;
  journalCitation: string;
}

export const RESEARCH_JOURNALS: ResearchJournal[] = [
  {
    id: 'nadhifa-2024',
    title: 'Analisis Judi Online di Kalangan Remaja dalam Perspektif Hukum Indonesia',
    authors: 'Kayla Ayesha Nadhifa, Muh Syiratal Al Haq Nur Wahid, Gracella Madeline, Bunga Luizy, Juvita Kirana',
    institution: 'Universitas Tarumanagara Jakarta',
    journalName: 'Jurnal Multilingual, Vol. 4 No. 4',
    year: 2024,
    pdfPath: '/assets/aistudio/Kayla_Ayesha_Nadhifa__Muh_Syiratal_Al_Haq_Nur_Wahid_et_al_6ae57e2c.pdf',
    category: 'Hukum',
    summary: 'Menganalisis maraknya judi online pada generasi muda, jeratan hukum pidana (Pasal 303 KUHP dan Pasal 27 ayat 2 UU ITE jo. UU 1/2024 dengan ancaman 10 tahun penjara / denda Rp10 Miliar), serta pengaruh pelepasan dopamin di otak saat memperoleh kemenangan semu.',
    keyQuotes: [
      '"Disaat para pemain mendapatkan kemenangan disitulah awal rasa candu yang penasaran membuat ingin selalu menambah kemenangan, di dalam lingkaran itulah para pemain tidak bisa menghentikan permainan... uang yang didepositokan dari rekening pemain akan habis dengan sendirinya secara perlahan-lahan."',
      '"Menurut Mental Health Foundation, kemenangan dalam perjudian mempengaruhi bagian otak yang melepaskan dopamin. Hormon ini dapat menciptakan perasaan senang dan bahagia. Ketika seseorang mulai mengenal perjudian, mereka seringkali terjebak dalam keinginan berjudi yang terus-menerus."',
    ],
    scientificInsights: [
      'Kemenangan awal adalah umpan neurokimia: Lonjakan dopamin menciptakan ilusi kepuasan yang memaksa pemain kembali bertaruh.',
      'Situs judi tidak berlisensi menerapkan cara-cara tidak jujur untuk mengelabui pemain dan menguras deposit tanpa disadari.',
      'Sanksi hukum Indonesia sangat tegas: Pasal 27 ayat 2 UU ITE dan Pasal 303 KUHP mengancam pelaku dengan pidana penjara hingga 10 tahun.',
    ],
  },
  {
    id: 'bey-2026',
    title: 'Gambaran Perilaku Judi Online pada Dewasa Awal di Kelurahan Alak Kota Kupang',
    authors: 'Juan Valentino Bey, Dian L. Anakaka, Marleny P. Panis',
    institution: 'Universitas Nusa Cendana, Kupang',
    journalName: 'Observasi: Jurnal Publikasi Ilmu Psikologi, Vol. 4 No. 3',
    year: 2026,
    pdfPath: '/assets/aistudio/OBSERVASI___VOLUME__4_NOMOR__3_AGUSTUS_2026_Hal_13-23_9a1affa5.pdf',
    category: 'Psikologi',
    summary: 'Mengkaji psikologi kecanduan judi melalui teori Operant Conditioning (B.F. Skinner 1953), Cognitive Distortions (Ladouceur et al. 2003), dan Pathways Model (Blaszczynski & Nower 2002). Membuktikan kemenangan adalah penguat perilaku adiktif.',
    keyQuotes: [
      '"Dari perspektif operant conditioning, kemenangan dapat dipahami sebagai bentuk positive reinforcement yang memperkuat perilaku berjudi. Menurut Skinner (1953), perilaku yang diikuti oleh konsekuensi menyenangkan memiliki kemungkinan lebih besar untuk diulang pada masa mendatang."',
      '"Teori kognitif-perilaku perjudian yang dikembangkan oleh Ladouceur et al. (2003) menjelaskan bahwa perilaku judi dipertahankan oleh distorsi kognitif, seperti ilusi kontrol terhadap hasil permainan dan keyakinan bahwa kekalahan dapat dipulihkan melalui permainan berikutnya."',
      '"Dong dan Potenza (2021) menunjukkan bahwa perjudian online berkaitan dengan disregulasi emosi dan fluktuasi psikologis yang intens... pemain sering mempertahankan keyakinan bahwa kemenangan masih mungkin diperoleh pada kesempatan berikutnya meskipun pengalaman sebelumnya menunjukkan kerugian."',
    ],
    scientificInsights: [
      'Positive Reinforcement: Kemenangan sesekali sengaja dirancang sebagai penguat agar pemain tidak berhenti bermain.',
      'Ilusi Kontrol (Illusion of Control): Pemain salah mengira bahwa keputusan atau taktik mereka dapat mengendalikan probabilitas permainan acak.',
      'Disregulasi Emosi: Fluktuasi ekstrem antara euforia palsu saat menang dan depresi mendalam saat kalah memicu keterikatan psikologis.',
    ],
  },
  {
    id: 'subagyo-2022',
    title: 'Faktor yang Mempengaruhi Mahasiswa Melakukan Perjudian Online',
    authors: 'Abi Arsyan Makarim Subagyo, Laras Astuti',
    institution: 'Universitas Muhammadiyah Yogyakarta',
    journalName: 'Indonesian Journal of Criminal Law and Criminology (IJCLC), Vol. 3 No. 3',
    year: 2022,
    pdfPath: '/assets/aistudio/17674-Article_Text-64932-1-10-20230124_4c53f8de.pdf',
    category: 'Sosiologi',
    summary: 'Meneliti distorsi persepsi probabilitas dan ilusi keterampilan pada pemain judi, fenomena psikologis "hampir menang" (near miss), serta fakta bahwa penyedia judi memotong margin keuntungan/pajak meja langsung pada setiap taruhan.',
    keyQuotes: [
      '"Para penjudi yang sulit meninggalkan perjudian biasanya cenderung memiliki persepsi yang keliru tentang kemungkinan untuk menang... keyakinan yang ada hanyalah suatu ilusi yang diperoleh dari evaluasi peluang berdasarkan sesuatu situasi atau kejadian yang tidak menentu dan sangat subyektif."',
      '"Bagi mereka kekalahan dalam perjudian tidak pernah dihitung sebagai kekalahan tetapi dianggap sebagai \'hampir menang\', sehingga mereka terus memburu kemenangan yang menurut mereka pasti akan didapatkan."',
      '"Sisi lain dari perjudian online yang jarang diketahui oleh para pemainnya adalah ketika para penyedia jasa juga mengambil keuntungan dari pajak yang diambil dari setiap pemain... pajak itu diambil saat permainan sedang berlangsung."',
    ],
    scientificInsights: [
      'Near-Miss Fallacy: Otak penjudi memperlakukan kekalahan tipis sebagai tanda bahwa kemenangan sudah dekat, padahal probabilitas setiap putaran tetap independen.',
      'Potongan Bandar Terselubung (Rake/Takeout): Bandar selalu mengambil persentase tetap dari perputaran uang meja.',
      'Realita Kehilangan Aset: Banyak responden yang kehilangan uang kuliah hingga barang berharga karena terjebak persepsi keliru probabilitas.',
    ],
  },
  {
    id: 'rijal-2026',
    title: 'Analisis Perilaku Judi Online di Kalangan Mahasiswa di Kota Makassar',
    authors: 'Muh. Rijal, Ibrahim Arifin, A. Noer Chalifa Ramadhany, Indriani, Irwan Nur',
    institution: 'Universitas Negeri Makassar & Universitas Pendidikan Ganesha',
    journalName: 'Aksiologi: Jurnal Pendidikan dan Ilmu Sosial, Vol. 6 No. 2',
    year: 2026,
    pdfPath: '/assets/aistudio/3._ARTIKEL_RIJAL_3db61460.pdf',
    category: 'Sosiologi',
    summary: 'Menguraikan jebakan psikologis "Loss Chasing" (mengejar kerugian) dan mekanisme algoritma "Variable Ratio Reinforcement" yang membuat pemain tidak berdaya untuk berhenti meskipun merugi berulang kali.',
    keyQuotes: [
      '"Salah satu indikator utama dari perjudian bermasalah adalah kecenderungan individu untuk tetap bermain meskipun mengalami kekalahan berulang... kondisi ini sering dikaitkan dengan konsep loss chasing (mengejar kerugian), yaitu dorongan untuk terus berjudi dengan harapan dapat menutup kerugian sebelumnya."',
      '"Perilaku ini berkaitan dengan mekanisme variable ratio reinforcement, di mana kemenangan yang tidak pasti justru memperkuat perilaku bermain. Individu menjadi lebih terdorong untuk mencoba kembali karena sistem permainan dirancang memberikan harapan kemenangan acak."',
      '"Adanya hubungan yang negatif dan signifikan antara kecanduan judi online dan prestasi akademik mahasiswa... semakin tinggi keterlibatan, semakin rendah pencapaian akademik hingga ancaman Drop Out."',
    ],
    scientificInsights: [
      'Loss Chasing Trap: Siklus destruktif di mana setiap kekalahan justru memicu taruhan lebih besar karena dorongan irasional menutup modal lama.',
      'Variable Ratio Reinforcement: Hadiah acak tak menentu adalah metode pembentukan adiksi paling patologis yang ditiru dari mesin slot modern.',
      'Kerusakan Multidimensi: Insomnia, stres kronis, keengganan menerima kekalahan, dan kehancuran masa depan studi.',
    ],
  },
  {
    id: 'syahfitri-2025',
    title: 'Model Matematika terhadap Dinamika Kecanduan Judi Online pada Masyarakat Desa Tanjung Putus',
    authors: 'Fadila Inka Syahfitri, Erika Handayani Br. Siahaan, Fani Indriyani Ningsih, Apriyani Sitompul',
    institution: 'Universitas Islam Negeri Sumatera Utara (UINSU)',
    journalName: 'Jurnal Arjuna: Publikasi Ilmu Pendidikan, Bahasa dan Matematika, Vol. 3 No. 1',
    year: 2025,
    pdfPath: '/assets/aistudio/ARJUNA_Vol_3_No_1_Tahun_2025_hal_323-330_e632a04c.pdf',
    category: 'Matematika',
    summary: 'Memodelkan penyebaran kecanduan judi online menggunakan sistem persamaan diferensial epidemiologi SEIR (Susceptible, Exposed, Infected, Recovered). Menemukan bahwa laju penularan sangat cepat namun laju pemulihan sangat lambat serta risiko relaps tinggi.',
    keyQuotes: [
      '"Tingkat penyebaran kecanduan judi online terlihat cukup tinggi... laju pemulihan (R) relatif lambat karena adanya laju pemulihan yang rendah (λ = 0.071, ε = 0.023). Hal ini menunjukkan bahwa tanpa adanya intervensi yang lebih kuat, individu yang terinfeksi akan tetap berada dalam kondisi kecanduan untuk waktu yang cukup lama."',
      '"Judi online adalah platform yang ilegal dan telah disebarkan secara luas sebagai tipu daya agar orang-orang mencoba judi online tersebut. Akibatnya, pemain judi online tidak akan pernah merasa puas dengan semua hasil yang didapatkannya."',
    ],
    scientificInsights: [
      'Epidemiologi Adiksi: Kecanduan judi menyebar layaknya wabah penyakit di masyarakat dengan parameter transmisi yang eksponensial.',
      'Laju Kesembuhan Lambat: Begitu terinfeksi kecanduan judi, probabilitas pemulihan mandiri sangat rendah (hanya 0.023/hari), membuktikan perlunya kesadaran preventif total.',
      'Tingkat Kambuh Tinggi: Parameter perpindahan kembali dari sembuh ke rentan menunjukkan bahwa penjudi yang merasa sudah sembuh tetap rentan relapse jika terpapar kembali.',
    ],
  },
  {
    id: 'pradana-2014',
    title: 'Eksistensi dan Dinamika Transaksi Perjudian (Studi Kasus Judi Dadu di Stasiun Wonokromo)',
    authors: 'Ghany Santika Pradana',
    institution: 'Fakultas Ekonomi dan Bisnis Universitas Brawijaya',
    journalName: 'Jurnal Ilmiah FEB Universitas Brawijaya',
    year: 2014,
    pdfPath: '/assets/aistudio/agusafeb__Ghany_Santika_Pradana_2ecdf299.pdf',
    category: 'Ekonomi',
    summary: 'Membuktikan lewat Teori Permainan (Game Theory) dan Nilai Harapan Matematis bahwa transaksi perjudian bersifat unilateral dan zero-sum game yang timpang: sistem dirancang sedemikian rupa agar bandar selalu menang dan pemain selalu rugi.',
    keyQuotes: [
      '"Dari penelitian ini ditemukan adanya strategi khusus dari Bandar judi... bahwa hasil dari permainan judi dengan strategi yang dibuat oleh Bandar adalah untuk menguntungkan Bandar. Hasil dari permainan judi itu sendiri adalah kemenangan yang akan didapat oleh Bandar, sedangkan kekalahan adalah untuk pemain. Itu merupakan hasil strategi yang dibuat oleh Bandar."',
      '"Di sisi lain hal ini juga yang membuat seorang Bandar judi tidak akan pernah bangkrut, karena sistem yang dibuat sangat menguntungkan bagi dirinya sendiri unilateral."',
      '"Dengan perhitungan nilai harapan matematis (nilai ekspektasi), dapat disimpulkan bahwa kerugian yang akan didapat jika dilihat dari probabilitas... pemain tidak menyadari bahwa kerugian yang diderita jauh lebih besar daripada seberapa pun besarnya kemenangan yang berpeluang mereka dapatkan."',
      '"Penuturan informan Dimas: \'aku yo tau kalah akeh, yo tau menang akeh tapi gak tak ijir (hitung kumulatif). Sing tak ijir yo pas main tok ae.\' Pemain tidak pernah menghitung kerugian total secara objektif."',
    ],
    scientificInsights: [
      'Keuntungan Unilateral Bandar: Game Theory membuktikan bahwa probabilitas dan payout sengaja diatur agar bandar tidak mungkin bangkrut.',
      'Potongan Odds ("Banyu"): Kemenangan pemain selalu dipotong persentase margin yang memastikan house edge selalu positif bagi bandar.',
      'Selective Memory Distortion: Penjudi hanya merekam memori sesaat ketika menang dan menghapus memori kerugian total kumulatif.',
    ],
  },
  {
    id: 'arsanata-2024',
    title: 'Optimasi Peluang Kemenangan dalam Board Game dengan Menggunakan Pendekatan Statistika',
    authors: 'Ibrahim Akbar Arsanata, Damar Aji Twin Sadella, Shalichatun Niswah, et al.',
    institution: 'Universitas Negeri Semarang',
    journalName: 'Jurnal Potensial, Vol. 3 No. 1',
    year: 2024,
    pdfPath: '/assets/aistudio/737-Article_Text-1568-1-10-20240224_469f68ed.pdf',
    category: 'Matematika',
    summary: 'Menerapkan teori probabilitas ruang sampel kejadian saling bebas, distribusi probabilitas dadu, dan konsep Nilai Harapan (Expected Value - Kenton 2023) serta Hukum Bilangan Besar (Law of Large Numbers) untuk membuktikan batas peluang.',
    keyQuotes: [
      '"Bahkan untuk pemain yang telah lama bermain, bisa mengalami kesulitan dalam meraih kemenangan, karena kesalahan persepsi yang dimiliki. Dimana mereka sudah sangat percaya diri untuk menang, padahal peluang kemenangan mereka sangat kecil dan hanya berupa ilusi yang didapatkan berdasarkan evaluasi kejadian acak atau tak menentu yang memiliki sifat subyektif."',
      '"Menurut Kenton (2023) nilai harapan (Expected Value) adalah nilai rata-rata jangka panjang dari suatu variabel. Karena hukum bilangan besar (Law of Large Numbers), nilai rata-rata variabel menyatu ke nilai harapan ketika jumlah pengulangan mendekati tak terhingga."',
      '"Peluang muncul jumlah dadu kembar sangatlah kecil yaitu 1/36 untuk setiap pasangan dan total hanya 6/36 (16.67%). Miskonsepsi tentang probabilitas mempengaruhi seseorang dalam mengambil keputusan keliru."',
    ],
    scientificInsights: [
      'Law of Large Numbers (Hukum Bilangan Besar): Semakin banyak jumlah putaran taruhan yang dimainkan, hasil aktual pemain PASTI menyatu dengan Nilai Harapan Negatif (EV < 0).',
      'Distribusi Acak Independen: Dadu dan mesin RNG tidak memiliki "ingatan". Keyakinan bahwa setelah kalah berturut-turut pasti akan segera menang adalah kesesatan berpikir (Gambler\'s Fallacy).',
      'Miskonsepsi Subjektif: Manusia secara alami buruk dalam mengevaluasi probabilitas kombinatorial acak, yang selalu dieksploitasi oleh industri kasino.',
    ],
  },
  {
    id: 'yang-2026',
    title: "The Mathematics Behind 'The House Always Wins': Law of Large Numbers and Parrondo's Paradox",
    authors: 'Zishuo Yang',
    institution: 'Cogdel Cranleigh & CONF-MPCS (Shandong University Chen 2025 context)',
    journalName: 'Proceedings of CONF-MPCS 2026: Theoretic Physics & Plasma Physics (DOI: 10.54254/2753-8818/2026.DL33722)',
    year: 2026,
    pdfPath: '/assets/aistudio/The_Mathematics_Behind_The_House_Always_Wins_Law_o_ddb9dbf7.pdf',
    category: 'Matematika',
    summary: 'Menganalisis secara matematis dan simulatif mengapa kasino selalu menang. Menjelaskan fenomena fluktuasi jangka pendek di mana dalam 1-9 putaran awal pemain bisa mengalami return positif semu (+0.32), sebelum Hukum Bilangan Besar (Bernoulli 1713) mengonvergensikannya ke nilai harapan negatif. Mengkaji Teorema Gambler\'s Ruin (pembuktian Chen 2025 di Universitas Shandong) dan membuktikan bahwa Parrondo\'s Paradox tidak dapat dimanfaatkan pemain karena seluruh permainan kasino adalah submartingale.',
    keyQuotes: [
      '"In short-term trials (rounds 1-9), the sample mean displays high variance (average return reaching +0.32 in roulette), creating the psychological illusion that the player can beat the house. However, as n grows, the Law of Large Numbers converges the return asymptotically to the negative expected value (-0.0526 for American roulette, -0.0141 for craps)." - Zishuo Yang (2026)',
      '"Gambler\'s Ruin Theorem (proven rigorously by Huygens 1657 and generalized by Chen in 2025 at Shandong University) demonstrates that against a casino with quasi-infinite capital, the probability of player absorption at balance 0 is mathematically 1. Median bets to ruin in roulette is 1,847 bets, with only 12.3% surviving 1,000 rounds." - Yang (2026)',
      '"Parrondo\'s Paradox indicates that alternating losing games can sometimes yield a winning game, but in casino economics (Ethier & Lee framework), every game is a strict submartingale with negative drift. No betting pattern, martingale, or game switching can overturn the house edge." - Yang (2026)',
    ],
    scientificInsights: [
      'Mengapa Koin Sempat Naik di Awal: Pada sampel kecil (n < 50), variansi acak (σ/√n) mendominasi, menghasilkan kemenangan sesaat (+0.32). Inilah umpan psikologis yang memperdaya penjudi.',
      'Kepastian Bangkrut (Gambler\'s Ruin): Pemain dengan bankroll terbatas melawan kasino bermodal tak terbatas dijamin secara probabilitas matematis 100% akan bangkrut (P(Ruin) = 1).',
      'Kegagalan Trik Taruhan (Parrondo\'s Paradox): Tidak ada kombinasi strategi (martingale, fibonacci, berganti meja) yang mampu menciptakan ekspektasi positif dari permainan bersubmartingale.',
    ],
  },
];

export const GAME_MATH_PROFILES: Record<string, GameMathProfile> = {
  mines: {
    gameId: 'mines',
    gameTitle: 'Mines (Diamond & Bom)',
    winProbabilityText: 'P(Aman 1 Langkah) = 87.5% | P(Aman 5 Langkah) = 43.6% | P(Clear 14) = 0.83%',
    winProbabilityPct: 43.6,
    houseEdgePct: 8.5,
    expectedValueText: 'EV = -8.5% per putaran',
    mechanism: 'Grid 4x4 (16 petak). Setiap kali membuka diamond aman, ruang sampel berkurang sehingga rasio bom meningkat tajam pada setiap langkah berikutnya.',
    psychologicalTrap: 'Pemain terperangkap "Near Miss" & ilusi kontrol: merasa sedikit lagi menang besar, namun probabilitas kumulatif anjlok secara eksponensial.',
    journalCitation: 'Ladouceur et al. (2003) & Subagyo & Astuti (2022) - Ilusi Kontrol & Perangkap Near Miss',
  },
  slots: {
    gameId: 'slots',
    gameTitle: 'Mesin Slot (777 Vegas)',
    winProbabilityText: 'P(Jackpot 777) = 0.46% | P(Menang Simbol Apapun) = 14.8%',
    winProbabilityPct: 14.8,
    houseEdgePct: 11.2,
    expectedValueText: 'RTP = 88.8% | EV = -11.2%',
    mechanism: '3 reel terpisah dengan bobot acak non-linear. Simbol bernilai tinggi (Crown, 777) memiliki bobot kemunculan paling rendah di algoritma.',
    psychologicalTrap: 'Penerapan murni Variable Ratio Reinforcement Schedule (Skinner 1953; Rijal et al. 2026): kemenangan kecil sesekali diberikan untuk memicu banjir dopamin.',
    journalCitation: 'Skinner (1953) via Bey et al. (2026) & Rijal et al. (2026) - Variable Ratio Reinforcement',
  },
  blackjack: {
    gameId: 'blackjack',
    gameTitle: 'Blackjack 21',
    winProbabilityText: 'P(Pemain Menang) = 42.2% | P(Dealer Menang) = 49.1% | P(Seri/Push) = 8.7%',
    winProbabilityPct: 42.2,
    houseEdgePct: 2.1,
    expectedValueText: 'EV = -2.1% (dengan strategi sempurna)',
    mechanism: 'Pemain wajib mengambil keputusan terlebih dahulu. Jika pemain bust (>21), taruhan langsung hangus meskipun dealer nantinya juga bust.',
    psychologicalTrap: 'Ilusi Keterampilan (Perception of Skill): pemain merasa kartu dapat diprediksi dengan kepintaran, padahal dealer advantage bersifat absolut.',
    journalCitation: 'Subagyo & Astuti (2022) - Faktor Persepsi Keterampilan & Miskonsepsi Probabilitas',
  },
  roulette: {
    gameId: 'roulette',
    gameTitle: 'Rolet Eropa (0-36)',
    winProbabilityText: 'P(Merah/Hitam) = 48.65% | P(Angka Tunggal) = 2.70%',
    winProbabilityPct: 48.65,
    houseEdgePct: 2.7,
    expectedValueText: 'EV = -2.70% untuk semua jenis taruhan luar/dalam',
    mechanism: 'Terdapat 37 angka (1-36 dan 0 hijau). Taruhan warna membayar 1:1, padahal peluangnya bukan 50% melainkan 18/37 (48.65%). Angka 0 menjamin profit bandar.',
    psychologicalTrap: 'Gambler\'s Fallacy (Kesesatan Penjudi): mengira jika warna merah sudah keluar 5 kali, maka putaran berikutnya "pasti" hitam, padahal putaran saling bebas.',
    journalCitation: 'Ghany Santika Pradana (2014) & Arsanata et al. (2024) - Keuntungan Unilateral Bandar & Kejadian Saling Bebas',
  },
  baccarat: {
    gameId: 'baccarat',
    gameTitle: 'Baccarat (Punto Banco)',
    winProbabilityText: 'P(Banker) = 45.86% | P(Player) = 44.62% | P(Tie/Seri) = 9.52%',
    winProbabilityPct: 44.62,
    houseEdgePct: 1.06,
    expectedValueText: 'EV(Banker) = -1.06% (potong komisi 5%) | EV(Tie) = -14.36%',
    mechanism: 'Aturan draw kartu ke-3 telah dipatenkan demi keuntungan statistik Banker. Kemenangan Banker selalu dipotong komisi 5% oleh kasino.',
    psychologicalTrap: 'Potongan margin tersembunyi (Rake/Pajak Meja): pemain merasa Banker aman, padahal komisi 5% secara akumulatif menguras bankroll.',
    journalCitation: 'Subagyo & Astuti (2022) - Potongan Pajak Meja & Ghany (2014) Strategi Keuntungan Bandar',
  },
  craps: {
    gameId: 'craps',
    gameTitle: 'Craps Dadu Kasino',
    winProbabilityText: 'P(Muncul Angka 7) = 16.67% (6/36) | P(Kembar) = 16.67% (6/36) | P(Snake Eyes) = 2.78%',
    winProbabilityPct: 41.5,
    houseEdgePct: 1.41,
    expectedValueText: 'EV(Pass Line) = -1.41% | EV(Any Seven) = -16.67%',
    mechanism: 'Jumlah kombinasi 2 dadu menghasilkan ruang sampel n(S)=36. Angka 7 memiliki kombinasi terbanyak (6 pasangan), dirancang untuk melenyapkan taruhan pemain pada fase point.',
    psychologicalTrap: 'Pemain mengira lemparan dadu dapat dikendalikan atau "ditebak jika telaten" seperti penuturan penjudi dadu stasiun Wonokromo.',
    journalCitation: 'Ghany Santika Pradana (2014) - Kasus Dadu Wonokromo & Arsanata et al. (2024) Distribusi Dadu',
  },
  scratch: {
    gameId: 'scratch',
    gameTitle: 'Kartu Gosok (Scratchcards)',
    winProbabilityText: 'P(Tiket Menang Apapun) = 18.5% | P(Jackpot Utama) = 0.05%',
    winProbabilityPct: 18.5,
    houseEdgePct: 28.0,
    expectedValueText: 'RTP = 72.0% | EV = -28.0%',
    mechanism: 'Setiap kartu memiliki hasil pre-deterministik dari algoritma cetak/digital dengan rasio pembayaran total jauh di bawah omzet penjualan tiket.',
    psychologicalTrap: 'Ilusi Hadiah Instan & Sensasi Fisik Menggosok: memicu lonjakan dopamin cepat dengan biaya kerugian persentase terbesar di industri perjudian.',
    journalCitation: 'Nadhifa et al. (2024) & Rijal et al. (2026) - Motivasi Uang Cepat & Kerugian Berulang',
  },
  horses: {
    gameId: 'horses',
    gameTitle: 'Pacuan Kuda (Derby Racing)',
    winProbabilityText: 'P(Favorit Kuda 1) = 33.3% | P(Kuda 3) = 18.2% | P(Kuda 6 Longshot) = 5.8%',
    winProbabilityPct: 22.5,
    houseEdgePct: 17.5,
    expectedValueText: 'Track Takeout (Potongan Bandar) = 17.5%',
    mechanism: 'Sistem taruhan Pari-Mutuel. Bandar memotong 15-20% dari seluruh total uang taruhan sebelum membagikan sisa saldo kepada pemenang.',
    psychologicalTrap: 'Godaan Pengali Tinggi (Odds 15x): membuat pemain mempertaruhkan koin pada opsi tidak rasional yang secara statistik hampir pasti kalah.',
    journalCitation: 'PP No. 9 Tahun 1981 & Subagyo & Astuti (2022) - Tinjauan Hukum Pacuan Kuda & Potongan Bandar',
  },
  wheel: {
    gameId: 'wheel',
    gameTitle: 'Wheel of Fortune (Big Six)',
    winProbabilityText: 'P(Segmen 1x) = 44.4% | P(Segmen 5x) = 14.8% | P(Segmen 40x) = 1.85%',
    winProbabilityPct: 35.2,
    houseEdgePct: 18.8,
    expectedValueText: 'EV = -15.7% hingga -24.1% tergantung nomor',
    mechanism: 'Roda vertikal dibagi menjadi 54 segmen. Segmen 40x hanya ada 1 petak, sementara segmen 1x mendominasi roda namun bayarannya sangat kecil.',
    psychologicalTrap: 'House edge terburuk di seluruh kasino Vegas. Lampu dan suara putaran roda membius persepsi kognitif pemain agar melupakan kalkulasi nilai harapan.',
    journalCitation: 'Kenton (2023) & Arsanata et al. (2024) - Nilai Harapan Negatif Jangka Panjang',
  },
  plinko: {
    gameId: 'plinko',
    gameTitle: 'Plinko Drop',
    winProbabilityText: 'P(Mendarat di Tengah / Rugi) = 68.7% | P(Ujung 10x) = 0.78%',
    winProbabilityPct: 24.3,
    houseEdgePct: 9.4,
    expectedValueText: 'EV = -9.4% per drop',
    mechanism: 'Papan Galton mengikuti kurva distribusi normal Gaussian / binomial. Setiap pantulan pasak memiliki peluang 50:50 kiri-kanan, sehingga mayoritas bola terkonsentrasi di tengah bernilai < 1x modal.',
    psychologicalTrap: 'Animasi bola yang "nyaris" melompat ke lubang 10x di tepi memicu ilusi bahwa pantulan berikutnya akan berhasil (*near-miss*).',
    journalCitation: 'Arsanata et al. (2024) - Teori Distribusi Probabilitas & Subagyo & Astuti (2022) Efek Near-Miss',
  },
  crash: {
    gameId: 'crash',
    gameTitle: 'Crash Vegas (Rocket Multiplier)',
    winProbabilityText: 'P(Crash di < 1.50x) = 60% | P(Crash di 1.00x Instan) = 5.5%',
    winProbabilityPct: 40.0,
    houseEdgePct: 5.0,
    expectedValueText: 'EV = -5.0% per putaran',
    mechanism: 'Grafik pengali roket naik secara eksponensial hingga algoritma secara acak memicu "Crash" mendadak. Jika pemain tidak mencairkan taruhan sebelum crash, seluruh taruhan hangus seketika.',
    psychologicalTrap: 'Ilusi Pengendalian Waktu (*Timing Control*): pemain merasa dapat membaca kecepatan roket padahal kurva random crash sepenuhnya independen.',
    journalCitation: 'Syahfitri et al. (2025) - Dinamika Adiksi Model Matematika & Rijal et al. (2026) Loss Chasing',
  },
  keno: {
    gameId: 'keno',
    gameTitle: 'Keno Vegas (Lotere 80 Angka)',
    winProbabilityText: 'P(Tembus 5 Angka dari 10) = 3.8% | P(Tembus 10 Angka) = 1 dalam 8.9 Juta',
    winProbabilityPct: 15.2,
    houseEdgePct: 25.0,
    expectedValueText: 'EV = -25.0% (House Edge tertinggi di kasino)',
    mechanism: 'Pemain memilih 1 hingga 10 angka dari 80 bola. Komputer mengundi 20 bola secara acak. Rasio pembayaran bayaran tidak sebanding dengan probabilitas kombinasi matematika.',
    psychologicalTrap: 'Impian Menang Instan Miliaran: house edge mencapai 25% membuat Keno menjadi salah satu perangkap matematis paling merugikan bagi bankroll.',
    journalCitation: 'Pradana (2014) - Teori Nilai Harapan Unilateral & Nadhifa et al. (2024) Bahaya Candu',
  },
};

/**
 * Kutipan Ilmiah Dinamis untuk Menang & Kalah
 */
export const SCIENTIFIC_WIN_EXPLANATIONS = [
  {
    title: 'Kemenangan Semu: Umpan Positive Reinforcement',
    quote: '"Dari perspektif operant conditioning, kemenangan dapat dipahami sebagai bentuk positive reinforcement yang memperkuat perilaku berjudi. Menurut Skinner (1953), perilaku yang diikuti konsekuensi menyenangkan memiliki kemungkinan lebih besar diulang."',
    source: 'Bey, Anakaka, & Panis (2026) - Jurnal Observasi Psikologi',
    explanation: 'Selamat atas kemenangan sesaat ini! Namun ingat: algoritma kasino sengaja memberikan kemenangan acak agar otak Anda terbiasa dan terus memasang taruhan berikutnya.',
  },
  {
    title: 'Mekanisme Variable Ratio Reinforcement',
    quote: '"Kemenangan yang tidak pasti justru memperkuat perilaku bermain. Individu menjadi lebih terdorong mencoba kembali karena sistem permainan dirancang memberikan harapan kemenangan acak."',
    source: 'Muh. Rijal et al. (2026) - Jurnal Aksiologi Sosiologi',
    explanation: 'Kemenangan ini adalah jadwal penguatan rasio acak (*Variable Ratio*). Inilah metode psikologis paling mematikan yang membuat pemain merasa "lagi hoki" sebelum akhirnya saldo terkuras habis.',
  },
  {
    title: 'Jeratan Lonjakan Hormon Dopamin',
    quote: '"Menurut Mental Health Foundation, kemenangan dalam perjudian mempengaruhi bagian otak yang melepaskan dopamin... menciptakan perasaan senang sesaat yang membuat mereka terjebak dalam keinginan berjudi terus-menerus hingga uang habis perlahan."',
    source: 'Kayla Ayesha Nadhifa et al. (2024) - Jurnal Multilingual',
    explanation: 'Rasa senang yang Anda rasakan sekarang adalah stimulasi dopamin kimiawi. Bandar memanfaatkan reaksi biologis ini agar Anda tidak mampu berhenti bermain.',
  },
  {
    title: 'Ilusi Kontrol (Illusion of Control)',
    quote: '"Perilaku judi dipertahankan oleh distorsi kognitif, seperti ilusi kontrol terhadap hasil permainan dan keyakinan bahwa kemenangan didapat karena keterampilan pribadi."',
    source: 'Ladouceur et al. (2003) & Subagyo & Astuti (2022) - IJCLC',
    explanation: 'Jangan merasa Anda menang karena keahlian menebak. Dalam perjudian acak murni, kemenangan sesaat ini hanyalah anomali statistik sebelum hukum bilangan besar bekerja.',
  },
  {
    title: 'Fluktuasi Jangka Pendek: Mengapa Koin Sempat Naik di Awal?',
    quote: '"In short-term trials (rounds 1-9), the sample mean displays high variance (average return reaching +0.32 in roulette), creating the psychological illusion that the player can beat the house. As n grows, Law of Large Numbers converges the return to negative expected value."',
    source: 'Zishuo Yang (2026) - Proceedings of CONF-MPCS (Physics & Mathematics)',
    explanation: 'Kenaikan saldo di awal permainan BUKAN tanda keberhasilan atau sistem yang rusak! Pada sampel kecil (n < 50), variansi acak (σ/√n) mendominasi, menghasilkan profit positif sesaat (+0.32). Namun setelah ratusan ronde, saldo PASTI terhisap ke nol.',
  },
  {
    title: 'Ilusi "Aman" di Game House Edge Rendah (Craps & Rolet Eropa)',
    quote: '"The illusion of safety in low-edge games (craps 1.41%, EU roulette 2.70%) merely slows the rate of decay without altering the ultimate absorbing barrier. Gambler\'s Ruin remains certain: E[Rounds to Ruin] = Bankroll / (Edge × Bet)."',
    source: 'Zishuo Yang (2026) citing Chen (2025) - CONF-MPCS 2026',
    explanation: 'Pada Rolet Eropa (edge 2.7%) dan Craps (edge 1.41%), pengikisan koin per putaran sangat lambat sehingga saldo tampak awet pada 100 ronde pertama. Ini bukan berarti permainan ini aman, melainkan bandar hanya menguras modal Anda secara perlahan (slow bleed) hingga habis total.',
  },
];

export const SCIENTIFIC_LOSS_EXPLANATIONS = [
  {
    title: 'Realita Teori Permainan: Bandar Selalu Menang',
    quote: '"Strategi yang dibuat oleh Bandar adalah untuk menguntungkan Bandar. Hasil dari permainan itu sendiri adalah kemenangan bagi Bandar, sedangkan kekalahan adalah untuk pemain. Bandar tidak akan pernah bangkrut karena sistem dibuat unilateral."',
    source: 'Ghany Santika Pradana (2014) - Jurnal Ilmiah FEB UB',
    explanation: 'Inilah kenyataan pahit perjudian: sistem tidak pernah dibuat adil. Secara matematis, seluruh permainan kasino dirancang dengan house advantage yang menjamin kerugian pemain dalam jangka panjang.',
  },
  {
    title: 'Hukum Bilangan Besar & Nilai Harapan Negatif (EV < 0)',
    quote: '"Nilai harapan (Expected Value) adalah nilai rata-rata jangka panjang. Karena hukum bilangan besar (Law of Large Numbers), rata-rata hasil pemain pasti menyatu ke nilai harapan negatif ketika jumlah putaran bertambah."',
    source: 'Kenton (2023) & Arsanata et al. (2024) - Jurnal Potensial Statistika',
    explanation: 'Kekalahan ini bukan karena Anda kurang beruntung, melainkan rumus matematika yang bekerja dengan sempurna. Semakin sering Anda bertaruh, kepastian bangkrut mendekati 100%.',
  },
  {
    title: 'Teorema Gambler\'s Ruin: Kepastian Bangkrut 100%',
    quote: '"Gambler\'s Ruin Theorem (Huygens 1657; Chen 2025 at Shandong University) demonstrates that against a casino with quasi-infinite capital, the probability of player absorption at balance 0 is mathematically 1. Median bets to ruin in roulette is 1,847 bets, with only 12.3% surviving 1,000 rounds."',
    source: 'Zishuo Yang (2026) & Chen (2025) - CONF-MPCS 2026',
    explanation: 'Kekalahan beruntun ini adalah bukti nyata Teorema Gambler\'s Ruin: bermain melawan bandar bermodal besar dengan aturan submartingale menjamin saldo pemain akan tersedot habis hingga nol (P(Ruin) = 1).',
  },
  {
    title: 'Laju Pengikisan Rolet Eropa & Craps: Lambat Tapi Pasti Nol',
    quote: '"A low house edge does not prevent bankruptcy; it simply increases the expected time to ruin. At 50 betting units, Craps requires ~3,546 rounds and European Roulette ~1,852 rounds to hit zero in expectation. The absorbing barrier at 0 is inescapable."',
    source: 'Yang, Zishuo (2026) - The Mathematics Behind \'The House Always Wins\'',
    explanation: 'Di Craps dan Rolet Eropa, kerugian per ronde sangat kecil sehingga pemain merasa saldonya "terjaga" di awal. Namun dalam ribuan putaran, hukum bilangan besar menarik saldo ke angka nol tanpa kompromi.',
  },
  {
    title: 'Bahaya Perangkap "Loss Chasing"',
    quote: '"Salah satu indikator utama dari perjudian bermasalah adalah dorongan untuk terus berjudi dengan harapan dapat menutup kerugian sebelumnya (loss chasing). Pola ini membentuk siklus psikologis yang menghancurkan finansial."',
    source: 'Muh. Rijal et al. (2026) - Jurnal Aksiologi',
    explanation: 'Jangan sekali-kali tergoda menaikkan taruhan untuk "mengembalikan modal yang hilang". Riset membuktikan bahwa mengejar kekalahan adalah pintu masuk kehancuran ekonomi dan stres kronis.',
  },
  {
    title: 'Kesesatan "Hampir Menang" (Near-Miss Effect)',
    quote: '"Bagi mereka kekalahan dalam perjudian tidak pernah dihitung sebagai kekalahan tetapi dianggap sebagai \'hampir menang\', sehingga mereka terus memburu kemenangan yang sebenarnya mustahil didapatkan secara konsisten."',
    source: 'Subagyo & Astuti (2022) - Indonesian Journal of Criminal Law & Criminology',
    explanation: 'Jangan biarkan otak Anda tertipu oleh hasil yang tampak "nyaris kena". Kalah tetaplah kalah, dan setiap putaran baru selalu diatur oleh probabilitas independen yang menguntungkan house.',
  },
];
