// =====================================================================
//  ORTANOKTA MACERASI · HİKÂYE VERİSİ
// =====================================================================
const NAMES = {irem:'İrem', cengiz:'Cengiz'};
const PL = ['irem','cengiz'];
const AV = {irem:'🌸', cengiz:'🌊'};
const STATS = {ce:['🦁','Cesaret'], ck:['✨','Çekicilik'], ze:['🧠','Zekâ'], sa:['🍀','Şans']};

const ITEMS = {
  kaktus:{e:'🌵', n:'Kaktüs Sevgi', d:'Küçük, dikenli, çok sevimli. Bavuldan çıkan hediye.'},
  manti:{e:'🥟', n:'7 kilo mantı', d:'Annenin ev mantısı. Kokusu her kapıyı açar.'},
  pankart:{e:'🪧', n:'"SENİ ÖZLEDİM" pankartı', d:'4 metre. Rüzgârlı havada dikkat.'},
  harita:{e:'🗺️', n:'Yarım harita', d:'Ormandan geçen gizli bir yol işaretli. Diğer yarısı kayıp.'},
  anahtar:{e:'🗝️', n:'Paslı anahtar', d:'Üzerinde "Ö.H." yazıyor. Neyi açtığı bilinmiyor.'},
  profesor:{e:'🐐', n:'Profesör', d:'Gözlüklü, sakallı, kâğıt sever. Artık ailenizden.'},
  tarif:{e:'📜', n:'Gizli turşu tarifi', d:'İki kasabayı 100 yıldır küstüren efsanevi tarif.'},
  altin:{e:'🏆', n:'Altın Turşu Kupası', d:'47. Ortanokta Dev Turşu Festivali şampiyonluğu.'},
  durbun:{e:'🔭', n:'Dürbün', d:'Atış standından. Uzağı görmek uzak mesafe çiftine yakışır.'},
  lokum:{e:'🍬', n:'Gül lokumu', d:'Hasan Usta\'nın elinden. "Saklayın, işinize yarar" dedi.'},
  foto:{e:'📸', n:'Polaroid fotoğraf', d:'İkinizin de gözleri kapalı. Mükemmel.'},
  harita2:{e:'🧭', n:'Haritanın diğer yarısı', d:'Değirmende bir çuvalın altından çıktı. Ötenokta yönünü gösteriyor.'},
  un:{e:'🌾', n:'Taze değirmen unu', d:'20 yıl sonra ilk kez öğütüldü.'},
  kitap:{e:'📕', n:'Keçi Bakımı 101', d:'Profesör\'ün en sevdiği kitap. Bir sayfası işaretli.'}
};

const NPCS = {
  ramazan:{e:'🚕', n:'Ramazan Abi', d:'Kasabanın tek taksicisi. Duygusal.'},
  kediler:{e:'🐈', n:'14 Kedi', d:'Lideri tek gözlü Paşa. Pansiyonun asıl sahipleri.'},
  gulizar:{e:'💪', n:'Gülizar Hanım', d:'8 yıllık turşu şampiyonu. Kolu kütük gibi.'},
  hayri:{e:'🎈', n:'Kaptan Hayri', d:'Balonu internetten almış. Hiç uçmamış.'},
  necmi:{e:'🏚️', n:'Fikriye & Necmi', d:'20 yıl önce kaybolan efsanevi çift.'},
  tahsin:{e:'🎩', n:'Başkan Tahsin', d:'Ötenokta Belediye Başkanı. Bıyıklı, şüpheci.'},
  sevket:{e:'🎣', n:'Balıkçı Şevket', d:'Gölün yaşlı kurdu. Az konuşur, çok bilir.'}
};

// konuşan karakter portreleri (ilişki puanı olmayanlar da var)
const SPEAKERS = {
  ramazan:['🧔🏻','Ramazan Abi'], nadide:['👵🏼','Nadide Teyze'], gulizar:['💪🏽','Gülizar Hanım'],
  necmi:['👴🏻','Necmi Amca'], fikriye:['👵🏻','Fikriye Teyze'], hayri:['🧑🏼‍✈️','Kaptan Hayri'],
  tahsin:['🎩','Başkan Tahsin'], nurten:['👩🏻‍⚖️','Yargıç Nurten'], sukru:['👮🏻','Gardiyan Şükrü'],
  melahat:['🔮','Falcı Melahat'], baskan:['🎖️','Başkan Rıfkı'], anlatici:['📖','Anlatıcı'], pasa:['🐈','Paşa'],
  sunucu:['🎙️','Sunucu Necati'], sevket:['🎣','Balıkçı Şevket'], dede:['👴🏽','Tavlacı Dedeler'], saadet:['👩🏻‍🏫','Kütüphaneci Saadet'],
  hasan:['🍬','Lokumcu Hasan'], riza:['👴🏼','Değirmenci Rıza'], fener:['🏮','Fener Gecesi']
};

const MISSIONS = {
  m1:{t:'Altın Turşu Kupası\'nı kazan.', ok:P=>P.inv.includes('altin')},
  m2:{t:'Ramazan Abi ile can ciğer ol (❤️ 5).', ok:P=>(P.npc.ramazan||0)>=5},
  m3:{t:'En az 3 anlaşmazlığı sen kazan.', ok:(P,p)=>P.wins[p]>=3},
  m4:{t:'Hiç sıcak hava balonuna binmeden oyunu bitir.', ok:P=>!P.flags.rode},
  m5:{t:'Kaos puanını en az 7 yap.', ok:P=>P.kaos>=7},
  m6:{t:'Gülizar Hanım\'ın saygısını kazan (❤️ 2+).', ok:P=>(P.npc.gulizar||0)>=2},
  m7:{t:'14 kediyle dost ol (❤️ 2+).', ok:P=>(P.npc.kediler||0)>=2},
  m8:{t:'Gizli turşu tarifini ele geçir.', ok:P=>P.inv.includes('tarif') || !!P.flags.tarifVar},
  m9:{t:'En az bir kez hapse gir.', ok:P=>!!P.flags.jailed},
  m10:{t:'Kendi özelliklerinden birini 8\'e çıkar.', ok:(P,p)=>Math.max(...Object.values(P.stats[p]))>=8},
  m11:{t:'Kayıp efsane çift Fikriye ile Necmi\'yi bul.', ok:P=>!!P.flags.metNecmi},
  m12:{t:'Uyum puanını en az 12 yap.', ok:P=>P.uyum>=12},
  m13:{t:'Mini oyunlarda toplam en az 9 eşleşme yap.', ok:P=>(P.mqMatch||0)>=9},
  m14:{t:'Kasabada bir Polaroid fotoğraf çektir.', ok:P=>P.inv.includes('foto')},
  m15:{t:'Kasabadaki gezide eski değirmene git.', ok:P=>!!P.flags.v_degirmen}
};

const ENDINGS = {
  seyyah:{i:'🎈',t:'Balon Seyyahları',h:'Bir pilotla gökyüzünde kalmayı seçin.',b:`Kaptan Hayri'yle rotayı ufka çevirdiniz. Önce Ötenokta'yı, sonra ülkeyi, sonra kıtayı geride bıraktınız. Profesör navigatör, Hayri kaptan, siz de mürettebat. Ramazan Abi'ye her hafta bir kartpostal geliyor: "Sevgiler, Kapadokya'nın üstünden." Uzak mesafe sorununu kökten çözdünüz: artık aynı sepettesiniz.`},
  hapis:{i:'🔒',t:'Hapishanenin Efsaneleri',h:'Hapisten kaçamazsanız…',b:`Kaçamadınız. Ama Gardiyan Şükrü ile tavla turnuvası kurdunuz, hücreyi çiçeklerle süslediniz ve "Ötenokta'nın en romantik hücresi" seçildiniz. Üç gün sonra iyi hâlden serbest bırakıldınız. Çıkarken Şükrü ağladı. Hâlâ mektuplaşıyorsunuz.`},
  elci:{i:'🕊️',t:'Barış Elçileri',h:'Yüz yıllık sırrı barış için kullanın.',b:`1926'dan beri süren turşu kavgasını siz bitirdiniz. İki kasabanın sınırına el ele heykeliniz dikildi (Profesör de heykelde, gözlüğüyle). Her yıl o gün "İrem ile Cengiz Barış Bayramı" olarak kutlanacak. Okullarda adınız ders kitabında.`},
  zengin:{i:'💰',t:'Turşu Milyonerleri',h:'Sırrın bir fiyatı var mı?',b:`Tarifi dev bir firmaya sattınız. Artık zenginsiniz! Ama iki kasaba da size küs. Yatınızın adı "Ortanokta", kaptanı Profesör. Akşamları güvertede oturup "Acaba Ramazan Abi ne yapıyor?" diye iç geçiriyorsunuz. Para her şey değilmiş.`},
  yerlesik:{i:'🏡',t:'Ortanoktalı Oldunuz',h:'Kasabada çok dost edinip vedada bir sürpriz yapın.',b:`Kapılar kapanmadan otobüslerden atladınız. Taşınıyorsunuz! Nadide Teyze pansiyonu size devretti, 14 kedi de cabası. Bir ay sonra kasaba ikinizi ortak muhtar seçti. Uzak mesafe bitti: artık aynı kasabada, aynı sokakta, aynı 14 kediyle yaşıyorsunuz.`},
  keci:{i:'🐐',t:'Gururlu Keçi Ebeveynleri',h:'Profesör\'ü sonuna kadar yanınızda tutun.',b:`Profesör'ün ortak velayeti noter onaylı (belgeyi yedi, ama yine de geçerli). Altı ay İrem'de, altı ay Cengiz'de kalıyor ve iki şehir arasında kendi otobüs kartıyla seyahat ediyor. Muavinler onu tanıyor. Her kavuşmanızda o da orada: gözlüklü, sakallı ve gururlu.`},
  tursu:{i:'🥒',t:'Turşu İmparatorluğu',h:'Şampiyon olun ve pastada cesur bir tarif deneyin.',b:`Şampiyonluk kupası ve efsanevi turşulu pastayla bir marka kurdunuz: "İrem & Cengiz Turşuları". Sloganınız: "Uzaktan sevenlerin turşusu." Ürünleriniz iki şehirde birden satılıyor, böylece birbirinizi her market rafında görüyorsunuz. Gülizar Hanım genel müdür.`},
  varis:{i:'👵',t:'Efsanenin Varisleri',h:'Bir yalanı sürdürün ve efsaneyi bulun.',b:`Fikriye ile Necmi saklandıkları ormandan çıktı ve 20 yıl sonra kasabaya döndü. Ramazan Abi sevinçten bayıldı. Efsane çift, kasabanın önünde sizi resmen "varisleri" ilan etti. Artık Ortanokta'nın yeni efsane çifti sizsiniz, bu sefer gerçekten.`},
  kedi:{i:'🐈',t:'Kedi Kraliyet Ailesi',h:'14 kedinin gönlünü fethedin.',b:`14 kedi oy birliğiyle sizi kral ve kraliçe ilan etti. Paşa başınıza taç giydirdi (ton balığı konservesinin kapağı). Artık nereye giderseniz gidin bir kedi sizi tanıyor ve iki şehirde de birer kedi elçiniz var.`},
  sanat:{i:'🎨',t:'Avangart Sanatçı Çift',h:'Kaosu sanata dönüştürün.',b:`"Aşk Beklenmediktir: Keçili Pasta" performansınız bir eleştirmenin gözüne çarptı. Şimdi İstanbul'da serginiz açılıyor. Eleştirmenler "Hiçbir şey anlamadık, muhteşem" diyor. Bir sonraki eseriniz: "Donmuş Ekran: Uzak Mesafe Üzerine Bir Dans".`},
  bilgin:{i:'🧠',t:'Birbirini Ezbere Bilenler',h:'Mini oyunlarda neredeyse her cevabı tutturun.',b:`Ramazan Abi'nin taksisinden Yargıç Nurten'in sınavına kadar neredeyse her soruda aynı cevabı verdiniz. Kasabada bir efsane doğdu: "Birbirini ezbere bilen çift." Artık Ortanokta'da yeni evlenenler sizin sorularınızla sınanıyor ve kimse sizin puanınızı geçemiyor.`},
  album:{i:'📸',t:'Bir Fotoğraf, İki Şehir',h:'Bir anı yakalayın ve arkasına bir şey yazın.',b:`Polaroid fotoğrafı ikiye kesmediniz; onun yerine pazardaki amcaya bir kopyasını daha çektirdiniz. Arkasına yazdığınız not artık iki şehirde, iki başucunda duruyor. İkinizin de gözleri kapalı çıkmış, ama bunun hayatınızın en güzel fotoğrafı olduğunu biliyorsunuz.`},
  fener:{i:'🏮',t:'Fenerdeki Dilek',h:'Gökyüzüne bir dilek gönderin ve kalplerinizi aynı yerde buluşturun.',b:`Fener Gecesi'nde uçurduğunuz fener iki kasabanın üstünde süzülüp gözden kayboldu. Ertesi sabah otobüsler ayrı yönlere giderken ikinizin telefonuna aynı anda bir bildirim geldi: bir sonraki buluşmaya kalan gün sayısı. Dileğinizin ne olduğunu ikiniz de biliyorsunuz.`},
  ruh:{i:'💞',t:'Ruh İkizleri',h:'Neredeyse her kararda anlaşın.',b:`Bu kadar çok kararda aynı şeyi seçmek tesadüf olamaz: ikiniz aynı frekanstasınız. Ortanokta'da adınıza bir sokak açılıyor: "İrem ile Cengiz Sokağı". Sokağın başında gözlüklü bir keçi heykeli var.`},
  kaos:{i:'🌪️',t:'Efsanevi Kaos Ustaları',h:'Neredeyse hiçbir kararda anlaşmayın.',b:`Neredeyse hiçbir konuda anlaşamadınız ve yine de iki kasabanın en sevilen çifti oldunuz. Nereye gitseniz bir şey patlıyor, bir şey uçuyor, bir keçi bir şey yiyor. Ama hep birlikte. Ortanokta size fahri "Kaos Hemşehrisi" unvanı veriyor.`},
  mektup:{i:'💌',t:'Cepteki Mektuplar',h:'Vedada sözler yerine kâğıt.',b:`Otobüsler ters yönlere kalktı. İkiniz de aynı anda cebinizdeki mektubu açtınız. İki mektupta da aynı cümle vardı. O cümleyi siz biliyorsunuz. Mesafe bazen sadece bir otobüs yolculuğu kadar.`},
  klasik:{i:'📅',t:'Görüşmek Üzere',h:'En sade veda.',b:`Macera bitti, otobüsler kalktı, ama otogarın duvarında bir kâğıt asılı: bir sonraki buluşmanızın tarihi. Ramazan Abi her sabah o kâğıda bakıp gün sayıyor. Siz de öyle. Ortanokta sizi bekliyor.`}
};
const ENDING_ORDER = Object.keys(ENDINGS);

// Anlaşmazlık esprileri: yalnızca o ana kadar tanışılan şeylere atıf yapar
const FUNNY = [
  {t:'Bu sırada Profesör ikinizin de ayakkabı bağcıklarını yedi.', c:c=>c.has('profesor')},
  {t:'Yoldan geçen bir teyze "Bunlar evlenir" dedi ve yoluna devam etti.'},
  {t:'İkiniz de aynı anda "Peki, sen bilirsin" dediniz. Kimse bilmiyordu.'},
  {t:'Olanları izleyen Paşa sıkılıp uyudu.', c:c=>c.P.npc.kediler !== undefined},
  {t:'Ramazan Abi uzaktan "Ah, gençlik!" diye bağırdı.', c:c=>c.P.npc.ramazan !== undefined},
  {t:'Mesele o kadar uzadı ki yanınıza bir simitçi tezgâh kurdu.'},
  {t:'Kazanan zafer dansı yaptı. Kaybeden de katıldı, çünkü dans güzeldi.'},
  {t:'Sonunda kimse neyi tartıştığınızı hatırlamıyordu.'},
  {t:'Gülizar Hanım kollarını kavuşturup izledi: "Gençler, gençler…"', c:c=>c.P.npc.gulizar !== undefined},
  {t:'Fikriye Teyze\'nin sesi kulaklarınızda çınladı: "Kavga etmeyin!"', c:c=>c.f('metNecmi')}
];

// Taş-kağıt-makas
const HANDS = {tas:['✊','Taş'], kagit:['✋','Kağıt'], makas:['✌️','Makas']};
const RPS_ROUNDS = 3;

// =====================================================================
//  SAHNELER
//  art: sahne çizimi · sp: konuşan karakter · ch: bölüm
//  choice.st: seçimin özelliği (seçen +1 kazanır; anlaşmazlıkta zar buna göre)
//  check: yetenek kontrolü (anlaşırsanız iki kişinin gücü toplanır)
// =====================================================================
const CH = {
  0:'Hazırlık', 1:'Bölüm 1 · Ortanokta\'ya Hoş Geldiniz', 2:'Bölüm 2 · Kasabayı Keşfet', 3:'Bölüm 3 · Festival Günü',
  4:'Bölüm 4 · Profesör Firarda', 5:'Bölüm 5 · Ötenokta', 6:'Bölüm 6 · Büyük Final'
};
const CH_SUB = {
  0:'Her macera bir süper güçle başlar.', 1:'Haritanın tam ortasında bir buluşma.', 2:'Üç durak, beş mekân, sayısız sır.',
  3:'Turşu, şöhret ve bir keçi.', 4:'Gökyüzünde bir keçi var.', 5:'Düşman topraklarında bir dava.', 6:'Pasta, fenerler ve veda.'
};

const S = {
karakter:{ch:0, title:'Süper Gücünü Seç', art:'magic', individual:true, sp:'anlatici',
 text:c=>`Macera başlamadan önce her biriniz gizlice bir süper güç seçiyor. Seçtiğin güç o özelliğine <b>+2</b> verir.<br><br>Oyun boyunca anlaşmazlıklarda zarı ve zor anlarda başarıyı bu özellikler belirleyecek. Farklı güçler seçerseniz takım olarak dengeli olursunuz; aynısını seçerseniz o konuda yenilmez olursunuz.`,
 choices:[
  {t:'Cesur Yürek', d:'Korkusuz, atılgan, biraz düşüncesiz.', s:'Cesur Yürek', st:'ce'},
  {t:'Büyüleyici Gülüş', d:'Herkesi ikna eder. Keçiler bile.', s:'Büyüleyici Gülüş', st:'ck'},
  {t:'Dahi Beyin', d:'Plan yapar, bulmaca çözer, tarif ezberler.', s:'Dahi Beyin', st:'ze'},
  {t:'Şanslı Yıldız', d:'Neden bilinmez, hep işler yolunda gider.', s:'Şanslı Yıldız', st:'sa'}
 ], go:'otogar'},

otogar:{ch:1, title:'Ortanokta Otogarı', art:'otogar', sp:'anlatici',
 text:`Aylarca süren görüntülü konuşmalar, donan ekranlar ve "sesin gelmiyor" cümlelerinden sonra İrem ile Cengiz sonunda haritanın tam ortasındaki, nüfusu 312 (ve bir keçi) olan <b>Ortanokta</b> kasabasında buluşuyor.<br><br>İki otobüs aynı anda perona yanaşıyor. Kapılar açılıyor. Göz göze geliyorsunuz.`,
 choices:[
  {t:'Film sahnesi gibi ağır çekim koşup sarılmak', s:'ağır çekim koşu', st:'ce', fx:{npc:{ramazan:1}},
   ok:`Ağır çekim. Rüzgârda saçlar. Peronun ortasında buluşup birbirinize sarılıyorsunuz. Otogarın önünde bekleyen taksici Ramazan Abi gözyaşlarını siliyor ve sizi o an kalbine yazıyor.`, go:'bavul'},
  {t:'Hiç tanışmıyormuş gibi resmî bir el sıkışma', s:'resmî el sıkışma', st:'ze', fx:{npc:{gulizar:1}},
   ok:`"Merhaba, ben Cengiz." "Memnun oldum, ben İrem." Üç saniye dayanıp gülmekten yere çöküyorsunuz. Bankta oturan heybetli bir teyze, Gülizar Hanım, bu resmiyetten çok etkileniyor: "Terbiyeli gençler."`, go:'bavul'},
  {t:'Önceden belirlenmiş gizli ajan şifresiyle selamlaşmak', s:'gizli ajan şifresi', st:'sa', fx:{inv:['+harita']},
   ok:`"Kartal yuvaya indi." "Ama hamsiler henüz göç etmedi." Yan banktaki bir amca sizi gerçek ajan sanıp paniğe kapılıyor ve kaçarken cebinden bir kâğıt düşürüyor: <b>yarısı yırtık bir harita</b>. Üzerinde ormandan geçen gizli bir yol işaretli.`, go:'bavul'}
 ]},

bavul:{ch:1, title:'Bavuldaki Sürpriz', art:'otogar', sp:'anlatici',
 text:`Peronda bavulu birlikte açıyorsunuz. Bavulda sadece tek bir hediyeye yer vardı ve ikiniz de ne olduğunu merak ediyorsunuz. İçinden ne çıkıyor?<br><br><i>(Bu eşya ileride işinize yarayabilir.)</i>`,
 choices:[
  {t:'Adı "Sevgi" olan bir saksı kaktüs', s:'kaktüs Sevgi', st:'ck', fx:{inv:['+kaktus']},
   ok:`Kaktüs Sevgi bavuldan çıkıyor: küçük, dikenli ve çok sevimli. Onu her yere yanınızda taşımaya karar veriyorsunuz. Otogarın çıkışında bir taksi korna çalıyor.`, go:'taksi'},
  {t:'Annenin yaptığı 7 kilo ev mantısı', s:'7 kilo mantı', st:'sa', fx:{inv:['+manti']},
   ok:`Bavul açılınca bütün peronu mantı kokusu sarıyor. Üç kedi ve bir muhtar peşinize takılıyor. 7 kilo, 2 kişi. Hesap tutmuyor ama sorun değil. Otogarın çıkışında bir taksi korna çalıyor.`, go:'taksi'},
  {t:'Kocaman bir "SENİ ÖZLEDİM" pankartı', s:'pankart', st:'ce', fx:{inv:['+pankart']},
   ok:`4 metrelik pankartı açıyorsunuz. Rüzgâr ikinizi birden otogarın çıkışına kadar sürüklüyor; arkanızdan yolcular "Özledik! Özledik!" diye slogan atıyor. Tam bir taksinin önünde duruyorsunuz.`, go:'taksi'}
 ]},

taksi:{ch:1, title:'Ramazan Abi\'nin Taksisi', art:'kasaba', sp:'ramazan',
 text:c=>`Kasabanın tek taksisi 1987 model bir Tofaş. Şoför sizi görünce frene basıp ağlamaya başlıyor:<br><br><i>"Fikriye! Necmi! 20 yıl önce kaybolan efsanevi Ortanokta çifti geri döndü!"</i>${c.has('harita')?'<br><br>Cebinizdeki yarım harita, ormandan geçen gizli bir kestirmeyi gösteriyor…':''}`,
 choices:[
  {t:'Oyuna girmek: artık Fikriye ile Necmi\'siniz', s:'Fikriye ile Necmi olmak', st:'ck', fx:{npc:{ramazan:2}, flag:{alias:1}},
   ok:`"Evet Ramazan… Döndük." Ramazan Abi taksimetreyi kapatıp bütün kasabaya haber salıyor. Pansiyona varana kadar kasabanın yarısı size börek getiriyor. Artık herkes sizi Fikriye ile Necmi sanıyor. Bu yalan büyüyecek…`, go:'taksi_sohbet'},
  {t:'Dürüstçe "Biz İrem ile Cengiz\'iz" demek', s:'dürüst olmak', st:'ze', fx:{npc:{ramazan:1}},
   ok:`Ramazan Abi duruyor, düşünüyor ve daha çok ağlıyor: "Tıpkı onlar gibi! Onlar da uzaktan sevgiliydi!" Pansiyona kadar kayıp çiftin hikâyesini anlatıyor: 20 yıl önce bir gece ormana gitmişler ve bir daha dönmemişler.`, go:'taksi_sohbet'},
  {t:'Taksiye binmeyip haritadaki orman kestirmesini kullanmak', s:'orman kestirmesi', st:'ce', req:c=>c.has('harita'), rq:'🗺️ Yarım harita gerekli',
   ok:`Ramazan Abi'ye el sallayıp ormana dalıyorsunuz. Harita yarım olduğu için yol tam ortada bitiyor. Ve tabii ki kayboluyorsunuz.`, go:'orman'}
 ]},

pansiyon:{ch:1, title:'14 Kedili Oda', art:'pansiyon', sp:'nadide',
 text:`Kasabanın tek pansiyonu Nadide Teyze'nin. Teyze anahtarı uzatıyor:<br><br><i>"Tek oda kaldı evladım. İçinde 14 kedi yaşıyor. Onlar da müşteri, parasını ödediler."</i><br><br>Kapıyı açıyorsunuz. 14 çift göz size bakıyor. Lider belli: tek gözlü, iri bir tekir. Adı Paşa.`,
 choices:[
  {t:'Paşa ile diplomatik görüşme yapmak', s:'kedi diplomasisi', st:'ck', check:{dc:8}, fx:{npc:{kediler:2}}, fxF:{npc:{kediler:-1}},
   ok:`Paşa'ya ton balığı ikram edip bir antlaşma imzalıyorsunuz (patisini basıyor). Yatak sizin, koltuk onların. Gece mışıl mışıl uyuyorsunuz. 14 kedi artık sizin müttefikiniz.`,
   fail:`Paşa ton balığını yiyor ve antlaşmayı yırtıyor. Gece boyunca 14 kedi sırayla yüzünüze oturuyor. Sabah gözleriniz şiş, kedilerle aranız bozuk.`, go:'kesif'},
  {t:'Her kediye isim verip yoklama almak', s:'kedi yoklaması', st:'ze', fx:{npc:{kediler:1}, inv:['+anahtar']},
   ok:`Pamuk, Duman, Köfte, Sultan, Lahmacun… Bir kedi eksik! Onu dolapta, eski bir kutunun içinde uyurken buluyorsunuz. Kutuda bir de <b>paslı bir anahtar</b> var. Üzerinde "Ö.H." yazıyor. Anahtarı cebe atıp yatıyorsunuz.`, go:'kesif'},
  {t:'Bahçedeki çadırda yatmak', s:'bahçede çadır', st:'ce',
   ok:`Bahçeye çadır kurup yıldızları izliyorsunuz. Çok romantik. Gece yarısı ormanın içinden garip bir "meeee" sesi ve titreyen bir fener ışığı geliyor…`, go:'gece'}
 ]},

gece:{ch:1, title:'Ormandaki Işık', art:'gece', sp:'anlatici',
 text:`Gece yarısı. Pansiyonun bahçesi zifiri karanlık. Ormanın içinden bir fener ışığı ve "meeee" sesi geliyor. Çadırın fermuarı yarı açık. Birinin kalbi hızlı çarpıyor (ikinizin de).`,
 choices:[
  {t:'Işığı takip etmek', s:'ışığı takip', st:'ce',
   ok:`Pijamayla, ellerinizde telefon feneri, ormana dalıyorsunuz. Işık hep biraz ileride. Bir süre sonra pansiyonun nerede kaldığını bilmiyorsunuz.`, go:'orman'},
  {t:'Kayan yıldıza dilek tutup uyumak', s:'dilek tutmak', st:'sa', fx:{flag:{dilek:1}},
   ok:`Tam o anda bir yıldız kayıyor. İkiniz de gizlice bir dilek tutuyorsunuz. (Ne dilediğinizi oyun bile bilmiyor.) Sabah güneşle ve tuhaf bir şans hissiyle uyanıyorsunuz.`, go:'kesif'},
  {t:'Kedileri çadıra çağırıp güvenlik ekibi kurmak', s:'kedi güvenliği', st:'ck', fx:{npc:{kediler:2}},
   ok:`14 kedi çadıra doluşup nöbet tutuyor. Hiç bu kadar güvende hissetmemiştiniz. Sabah Paşa'nın patisi yüzünüzde uyanıyorsunuz. Kediler sizi bir daha unutmayacak.`, go:'kesif'}
 ]},

orman:{ch:1, title:'Kayıp Orman', art:c=>c.from==='gece'?'ormanGece':'orman', sp:'anlatici',
 text:c=>`${c.from==='gece'?'Fener ışığı bir anda kayboluyor. Etraf zifiri karanlık.':'Ağaçlar, ağaçlar, daha fazla ağaç. Haritanın bittiği yerdesiniz.'} Telefonlar çekmiyor (uzak mesafe ilişkisinde en büyük korkunuz). Uzaktan bir "meee" sesi geliyor ve ağaçların arasında, bacasından duman çıkan bir kulübe seçiliyor.`,
 choices:[
  {t:'"Meee" sesine doğru gitmek', s:'sese gitmek', st:'ce', fx:{inv:['+profesor']},
   ok:`Bir çalılığın arkasında gözlüklü, sakallı bir keçi buluyorsunuz. Tasmasında "PROFESÖR" yazıyor. Size bakıp "nihayet" der gibi başını sallıyor ve sizi doğruca kulübenin kapısına götürüyor.`, go:'kulube'},
  {t:'Ağaca tırmanıp yön bulmak', s:'ağaca tırmanmak', st:'ce', check:{dc:9}, fx:{flag:{balonGordu:1}},
   ok:`Ağacın tepesinden bütün vadiyi görüyorsunuz: kasaba, festival alanı ve orada şişirilen <b>dev bir sıcak hava balonu</b>. Bunu aklınızın bir köşesine yazıp kulübeye doğru iniyorsunuz.`,
   fail:`Üçüncü dalda dal kırılıyor. Düşüyorsunuz… tam kulübenin kapısının önüne. Kapı gıcırdayarak açılıyor.`, go:'kulube'},
  {t:'Mantı kokusuyla ormanın hayvanlarını çağırmak', s:'mantı yemi', st:'sa', req:c=>c.has('manti'), rq:'🥟 Mantı gerekli', fx:{inv:['-manti','+profesor']},
   ok:`Mantının kapağını açıyorsunuz. Sincaplar, tavşanlar ve gözlüklü bir keçi ortaya çıkıyor. Keçi bütün mantıyı yiyor ve sizi kulübeye kadar götürüyor. Tasmasında "PROFESÖR" yazıyor. Artık o da sizinle.`, go:'kulube'}
 ]},

kulube:{ch:1, title:'Gizli Kulübe', art:'kulube', sp:'necmi', onEnter:{flag:{metNecmi:1}},
 text:c=>`Kapıyı yaşlı bir çift açıyor. Ramazan Abi'nin bahsettiği kayıp efsane: <b>Fikriye ile Necmi!</b>${c.has('profesor')?' Profesör içeri dalıp sobanın yanına kıvrılıyor; burayı iyi bildiği belli.':''}<br><br>20 yıldır ormanda saklanıyorlar. Sebebi: 1926'dan beri Ortanokta ile komşu kasaba Ötenokta'yı küstüren <b>gizli turşu tarifi</b> onların elinde ve iki kasaba da onu istiyor.`,
 choices:[
  {t:'Bütün hikâyeyi dinlemek', s:'hikâyeyi dinlemek', st:'ze', fx:{npc:{necmi:2}, flag:{sir:1}},
   ok:`Necmi Amca sobanın başında anlatıyor: tarif aslında iki kasabanın ortak icadıymış, kavga da bir yanlış anlamadan çıkmış. "Bir gün biri bu sırrı doğru yerde söylerse iki kasaba barışır." Geceyi kulübede, sobanın sıcağında geçiriyorsunuz.`, go:'kesif'},
  {t:'Tarifi gizlice "ödünç" almak', s:'tarifi aşırmak', st:'sa', check:{dc:9}, fx:{inv:['+tarif'], npc:{necmi:-1}}, fxF:{npc:{necmi:-2}},
   ok:`Fikriye Teyze çay koyarken tarifi cebe atıyorsunuz. Başardınız! Gece kulübede kalıyorsunuz ama vicdanınız sızlıyor ve Necmi Amca sabaha kadar size şüpheyle bakıyor.`,
   fail:`Elinizi kavanoza uzattığınız anda Fikriye Teyze'nin oklavası iniyor. Geceyi kulübenin önündeki odun yığınında geçiriyorsunuz. İçeriden "Ötenokta casusları!" diye homurtular geliyor.`, go:'kesif'},
  {t:'Onlarla çay içip tavla oynamak', s:'çay ve tavla', st:'ck', fx:{npc:{necmi:1}, inv:['+tarif']},
   ok:`Üç el tavla, iki demlik çay. Necmi Amca hepsini kazanıyor ama sizi çok seviyor. Gece yatmadan önce Fikriye Teyze avucunuza katlanmış bir kâğıt sıkıştırıyor: "Doğru zamanda kullanın." <b>Gizli turşu tarifi!</b>`, go:'kesif'}
 ]},

festival:{ch:3, title:'Büyük Turşu Festivali', art:'festival', sp:'anlatici',
 text:c=>{
   let x = `Isınma turu biter bitmez festival tüm hızıyla başlıyor! <b>47. Ortanokta Dev Turşu Festivali</b>'nde turşu yarışması, panayır, falcı çadırı var; bir köşede de dev bir sıcak hava balonu şişiriliyor.`;
   if (c.f('juri')) x += ' Jüri üyeleri ısınma turundaki performansınızı konuşuyor.';
   if (c.f('alias')) x += `<br><br>Belediye Başkanı Rıfkı Bey sizi "Fikriye ile Necmi" sandığı için açılış konuşmasını size yaptırmak istiyor!`;
   return x; },
 choices:[
  {t:'Çiftler Turşu Yarışması\'na katılmak', s:'turşu yarışması', st:'ze',
   ok:`Kayıt masasına gidiyorsunuz. Önünüze 50 kilo lahana ve bir fıçı konuyor. Yan tezgâhtaki rakipleriniz ciddi. Çok ciddi.`, go:'tursu'},
  {t:'Panayırı gezmek', s:'panayır', st:'sa',
   ok:`Pamuk şeker, çarkıfelek, falcı çadırı ve bir köşede horlayarak uyuyan bir balon kaptanı. Panayır sizi çağırıyor.`, go:'panayir'},
  {t:'"Fikriye ile Necmi" olarak açılış konuşması yapmak', s:'açılış konuşması', st:'ck', req:c=>c.f('alias'), rq:'Kasabanın sizi Fikriye ile Necmi sanması gerekli',
   ok:`Kürsüye çıkıyorsunuz. 312 kişi ve bir keçi size bakıyor. Mikrofon cızırdıyor.`, go:'konusma'}
 ]},

tursu:{ch:3, title:'Çiftler Turşu Yarışması', art:'tursu', sp:'gulizar',
 text:`50 kilo lahana, bir fıçı ve 8 yıllık şampiyonlar <b>Muhtar Bey ile Gülizar Hanım</b>'ın tehditkâr bakışları. Gülizar Hanım parmağını size doğrultuyor:<br><br><i>"Gençler, bu festivalde 8 yıldır kimse beni yenemedi."</i><br><br>Stratejinizi seçin. Anlaşırsanız iki kişinin gücü toplanır.`,
 choices:[
  {t:'Babaanne usulü şaşmaz tarif', s:'babaanne usulü', st:'ze', check:c=>({dc:9-(c.f('juri')?1:0)}),
   ok:`Sirke, tuz, sarımsak, sabır. Jüri koklayıp başını sallıyor. Finale kaldınız!`,
   fail:`Tuzu iki kere koydunuz. Jüri yüzünü buruşturuyor. Elendiniz.`, go:'duello', goF:'teselli'},
  {t:'Deneysel: gizli malzeme çikolata', s:'çikolatalı turşu', st:'sa', check:c=>({dc:10-(c.f('juri')?1:0)}),
   ok:`Jüri tadıyor. Sessizlik. Biri "Bu bir devrim" diye fısıldıyor. Finale kaldınız!`,
   fail:`Jüri tadıyor. Bir jüri üyesi bayılıyor, diğeri polisi arıyor. Elendiniz.`, go:'duello', goF:'teselli'},
  {t:'Turşuya serenat yapıp sevgiyle demlemek', s:'turşuya serenat', st:'ck', check:c=>({dc:9-(c.f('juri')?1:0)}),
   ok:`Lahanalar utançtan kızarıyor (iyi bir işaret). Seyirciler telefon fenerlerini sallıyor. Finale kaldınız!`,
   fail:`Şarkınız o kadar duygusal ki turşu ağlıyor ve fazla tuzlu oluyor. Elendiniz.`, go:'duello', goF:'teselli'},
  {t:'Gizli turşu tarifini kullanmak', s:'gizli tarif', st:'ze', req:c=>c.has('tarif'), rq:'📜 Gizli tarif gerekli', fx:{flag:{tarifIfsa:1}},
   ok:`Tarifi uyguluyorsunuz. Jüri ilk lokmada donup kalıyor: "Bu tat… 1926…" Finale kaldınız! Ama kalabalıkta şapkalı bir adam hızla not alıp ortadan kayboluyor. Bir Ötenokta casusu…`, go:'duello'}
 ]},

teselli:{ch:3, title:'Kaybedenler Köşesi', art:'festival', sp:'gulizar',
 text:`Elendiniz. Bir bankta oturmuş, bozgun turşunuzu yiyorsunuz. Gülizar Hanım yanınıza oturuyor:<br><br><i>"Hepimiz bir gün kaybettik. Ben 1991'de kaybettim. Bir daha asla."</i>`,
 choices:[
  {t:'Gülizar Hanım\'dan bilek güreşi dersi almak', s:'bilek güreşi dersi', st:'ce', fx:{npc:{gulizar:2}},
   ok:`Gülizar Hanım size efsanevi "Anadolu Kilidi"ni öğretiyor. Kollarınız ağrıyor ama Gülizar Hanım artık size saygı duyuyor.`, go:'balon'},
  {t:'Jüriye resmî itiraz dilekçesi vermek', s:'itiraz', st:'ze', check:{dc:10}, fxF:{npc:{gulizar:-1}},
   ok:`Dilekçeniz o kadar ikna edici ki jüri kararı bozuyor! Finale kaldınız!`,
   fail:`Jüri dilekçenizi turşu kavanozunun altına koyuyor. Gülizar Hanım "Mızıkçılar" diye homurdanıyor.`, go:'duello', goF:'balon'},
  {t:'Kaderi kabul edip pamuk şeker almak', s:'pamuk şeker', st:'sa', fx:{flag:{dilek:1}},
   ok:`Pamuk şekerin içinden küçük bir kâğıt çıkıyor: "Bugün şanslı gününüz." Her şeye rağmen içiniz ısınıyor.`, go:'balon'}
 ]},

duello:{ch:3, title:'Final Düellosu', art:'duello', sp:'gulizar',
 text:c=>`${c.from==='teselli'?'İtirazınız kabul edildi, finaldesiniz! ':''}Karşınızda Muhtar Bey ile Gülizar Hanım. Gülizar Hanım kollarını sıvıyor:<br><br><i>"Finalde turşu yok. Düellonun türünü siz seçin."</i><br><br>Ödül: Altın Turşu Kupası ve… kasabanın gözlüklü keçisi Profesör.`,
 choices:[
  {t:'Dans düellosu', s:'dans', st:'ck', check:c=>({dc:10-(c.f('juri')?1:0)}), fx:{inv:['+altin','+profesor'], flag:{sampiyon:1}}, fxF:{npc:{gulizar:1}},
   ok:`Görüntülü konuşmalarda ekran donunca yaptığınız "donmuş ekran" dansı kasabayı yıkıyor. ŞAMPİYONSUNUZ! Kupa ve Profesör sizin.`,
   fail:`Muhtar Bey ile Gülizar Hanım'ın tangosu kusursuzdu. Kaybettiniz, ama Gülizar Hanım cesaretinizi takdir ediyor.`, go:'balon'},
  {t:'"Birbirinizi ne kadar tanıyorsunuz?" bilgi yarışması', d:'Gerçek sorular: birbiriniz hakkında ne kadar çok bilirseniz o kadar iyi.', s:'bilgi yarışması', st:'ze',
   ok:`Gülizar Hanım ellerini ovuşturuyor: "Bilgi yarışması! Bunu 8 yıldır kimse bizden almadı." Muhtar Bey sahneye bir masa ve iki zil getiriyor.`, go:'duello_bilgi'},
  {t:'Gülizar Hanım ile bilek güreşi', s:'bilek güreşi', st:'ce', check:c=>({dc:11-(c.f('juri')?1:0)}), fx:{inv:['+altin','+profesor'], flag:{sampiyon:1}, npc:{gulizar:2}}, fxF:{npc:{gulizar:2}},
   ok:`Dört el, tek kola karşı. 11 dakika. Gülizar Hanım sonunda gülümseyip bırakıyor: "Bu sevgi beni yendi." ŞAMPİYONSUNUZ! Gülizar Hanım artık en büyük hayranınız.`,
   fail:`Gülizar Hanım ikinizi birden 2 saniyede yeniyor. Ama ayağa kalkıp ellerinizi sıkıyor: "Kimse benimle güreşmeye cesaret edemezdi." Saygısını kazandınız.`, go:'balon'}
 ]},

panayir:{ch:3, title:'Panayır', art:'panayir', sp:'anlatici',
 text:`Panayırda dolaşıyorsunuz. Bir yanda falcı Melahat'ın çadırı, bir yanda atış standı, ötede dev bir balonun dibinde horlayan Kaptan Hayri.`,
 choices:[
  {t:'Falcı Melahat\'a fal baktırmak', s:'fal', st:'sa', fx:{flag:{kehanet:1}},
   ok:`Melahat fincanı çeviriyor: "Gökyüzünde bir keçi görüyorum. Ve bir mahkeme. Ve bir pasta. Çok büyük bir pasta." Saçmalık gibi geliyor. Şimdilik.`, go:'balon'},
  {t:'Atış standında şansını denemek', s:'atış standı', st:'ce', check:{dc:9}, fx:{inv:['+durbun']},
   ok:`Hepsini vuruyorsunuz! Ödül: eski ama sağlam bir <b>dürbün</b>. Uzağı görmek uzak mesafe çiftine yakışır.`,
   fail:`Hiçbirini vuramıyorsunuz. Teselli ödülü olarak bir sakız alıyorsunuz. Sakız da bayat.`, go:'balon'},
  {t:'Uyuyan Kaptan Hayri ile tanışmak', s:'Hayri ile tanışmak', st:'ck', fx:{npc:{hayri:2}},
   ok:`Hayri'yi nazikçe uyandırıp çay ikram ediyorsunuz. Hayatını anlatıyor: balonu internetten almış, hiç uçmamış ama çok istiyor. Artık dostsunuz. Hayri çayını bitirip yeniden uykuya dalıyor.`, go:'balon'}
 ]},

konusma:{ch:3, title:'Sahte Çiftin Konuşması', art:'konusma', sp:'ramazan',
 text:`Kürsüdesiniz. Bütün kasaba "Fikriye ile Necmi"nin 20 yıl sonra ne söyleyeceğini bekliyor. Ramazan Abi ön sırada, mendili elinde:<br><br><i>"Haydi Fikriye'm, haydi Necmi'm…"</i>`,
 choices:[
  {t:'Çok duygusal bir konuşma yapmak', s:'duygusal konuşma', st:'ck', check:{dc:9}, fx:{npc:{ramazan:1, gulizar:1}}, fxF:{npc:{ramazan:-1}},
   ok:`"20 yıl uzak kaldık ama kalbimiz hep buradaydı…" Kasaba hıçkırıklara boğuluyor. Ramazan Abi üç mendil bitiriyor.`,
   fail:`Konuşmanın ortasında Fikriye'nin doğum yerini yanlış söylüyorsunuz. Kalabalık uğulduyor. Ramazan Abi kırgın.`, go:'balon'},
  {t:'Gerçeği itiraf etmek', s:'gerçeği itiraf', st:'ze', fx:{npc:{ramazan:1, gulizar:1}, flag:{durust:1, alias:0}},
   ok:`"Aslında biz İrem ile Cengiz'iz. Uzaktan sevgiliyiz ve sadece buluşmak istedik." Kısa bir sessizlik… sonra alkış. Gülizar Hanım "Dürüstlük her şeydir" diyor.`, go:'balon'},
  {t:'Konuşma yerine türkü söylemek', s:'türkü', st:'sa', check:{dc:10}, fx:{npc:{ramazan:2}},
   ok:`Uydurduğunuz türkü kasabanın yeni marşı oluyor. Ramazan Abi taksisinin hoparlöründen sürekli çalacak.`,
   fail:`Davulcu yanlış ritim çalıyor, siz yanlış yerden giriyorsunuz. Herkes nazikçe alkışlıyor. Çok nazikçe.`, go:'balon'}
 ]},

balon:{ch:4, title:'Balon Kalkıyor!', art:'balon', sp:'anlatici', onEnter:{inv:['-profesor']},
 text:c=>`Festivalin en coşkulu anında bir çığlık yükseliyor! ${c.has('profesor')?'Profesör kucağınızdan sıyrılıp':'Kasabanın gözlüklü keçisi Profesör kalabalığı yararak'} sıcak hava balonunun sepetine atlıyor ve halatı kemiriyor. Halat kopuyor, balon <b>yükselmeye başlıyor!</b> Kaptan Hayri hâlâ yerde horluyor.${c.f('kehanet')?'<br><br>Falcı Melahat\'ın sözleri aklınızda yankılanıyor: "Gökyüzünde bir keçi…"':''}${c.f('balonGordu')?'<br><br>Bu balonu ormandaki ağacın tepesinden görmüştünüz!':''}`,
 choices:[
  {t:'Halata atlayıp tırmanmak!', s:'halata tırmanmak', st:'ce', check:{dc:10}, fx:{flag:{rode:1}},
   ok:`Çamaşır ipine asılmış iki çorap gibi ama tırmanıyorsunuz! Sepete düşüyorsunuz. Profesör "geç kaldınız" der gibi bakıyor.`,
   fail:`Halat elinizden kayıyor ve bir turşu fıçısının içine düşüyorsunuz. Balon gidiyor. Yerden takip etmeniz lazım!`, go:'gokyuzu', goF:'takip'},
  {t:'Kaptan Hayri\'yi uyandırıp birlikte binmek', s:'Hayri ile binmek', st:'ck', req:c=>c.n('hayri')>=2, rq:'🎈 Kaptan Hayri ile dost olmanız gerekli', fx:{flag:{rode:1}},
   ok:`Hayri bir saniyede uyanıyor: "Hayatımın uçuşu!" Kopan halatın ucunu yakalayıp hep birlikte sepete tırmanıyorsunuz. Bu sefer bir pilotunuz var (gerçi hiç uçmamış).`, go:'gokyuzu_pilot'},
  {t:'Ramazan Abi\'nin taksisiyle yerden takip etmek', s:'taksiyle takip', st:'sa', req:c=>c.n('ramazan')>=2, rq:'🚕 Ramazan Abi ile dost olmanız gerekli', fx:{npc:{ramazan:1}, flag:{taksi:1}},
   ok:`Ramazan Abi kornaya basarak yanaşıyor: "Atlayın!" Tofaş, balonun peşinde tozu dumana katarak yola çıkıyor.`, go:'takip'},
  {t:'Bavuldaki hediyeyle Profesör\'ü oyalamak', s:'hediye tuzağı', st:'sa', req:c=>c.has('kaktus')||c.has('manti')||c.has('pankart'), rq:'🎁 Bavuldaki hediye gerekli', fx:{inv:['-kaktus','-manti','-pankart'], flag:{rode:1}},
   ok:`Hediyenizi havaya kaldırıyorsunuz. Profesör ona uzanırken sepet yere yaklaşıyor, siz de fırsatı kaçırmadan içine atlıyorsunuz. Hediyenizi Profesör'e kaptırıyorsunuz (yiyor), ama hepiniz balondasınız!`, go:'gokyuzu'},
  {t:'Keçi Bakımı 101\'deki sakinleştirici ıslığı çalmak', s:'keçi ıslığı', st:'ze', req:c=>c.has('kitap'), rq:'📕 Keçi Bakımı 101 gerekli', fx:{inv:['+profesor'], flag:{bosBalon:1}},
   ok:`İşaretli sayfadaki ıslığı çalıyorsunuz. Profesör kulaklarını dikip sepetten zarifçe aşağı atlıyor ve kucağınıza konuyor. Ama boş balon yükselmeye devam ediyor… ve doğruca Ötenokta'ya gidiyor. Düşman kasabaya inen bir Ortanokta balonu? Bu savaş sebebi! Peşinden gitmelisiniz.`, go:'takip'}
 ]},

gokyuzu:{ch:4, title:'Pilotsuz Gökyüzü', art:'gokyuzu', sp:'anlatici', onEnter:{inv:['+profesor']},
 text:`Ortanokta küçüldükçe küçülüyor. Profesör kucağınızda, keyfi yerinde. Pilot yok. Rüzgâr sizi doğruca 100 yıldır küs olduğunuz komşu kasaba <b>Ötenokta</b>'ya taşıyor. Balon alçalıyor, bir yere inmek zorundasınız!`,
 choices:[
  {t:'Bir düğünün tam ortasına inmek', s:'düğüne inmek', st:'ck', fx:{flag:{dugun:1}, npc:{tahsin:1}},
   ok:`Gelin ile damadın arasına süzülüyorsunuz. Davulcu bunu bir gösteri sanıp çalmaya devam ediyor, siz de halaya katılıyorsunuz. Meğer gelin Başkan Tahsin'in kızıymış ve gösteriye bayılmış. Ama düğünün sonunda jandarma geliyor…`, go:'cift_testi'},
  {t:'Kasaba gölüne inmek', s:'göle inmek', st:'sa', fx:c=>c.n('sevket')>=2 ? {npc:{tahsin:1}, flag:{balikci:1}} : null,
   ok:c=>c.n('sevket')>=2
     ? `Şıpırt! Profesör sırt üstü zarifçe yüzüyor. Kıyıdaki balıkçı size havlu uzatıyor ve gözlerini kısıyor: "Siz… Şevket abimin dostları mısınız?" Meğer Balıkçı Şevket'in ikiz kardeşi Şefik'miş! Sizi jandarmaya kendisi götürüyor ama yol boyunca Başkan Tahsin'e telefonda sizi övüyor.`
     : `Şıpırt! Profesör sırt üstü zarifçe yüzüyor. Kıyıdaki balıkçılar havlu uzatıyor… ve aksanınızı duyunca sizi Ortanokta casusu diye jandarmaya teslim ediyor.`, go:'cift_testi'},
  {t:'Belediye binasının çatısına kusursuz bir iniş', s:'çatıya iniş', st:'ze', check:{dc:10}, fx:{npc:{tahsin:2}}, fxF:{npc:{tahsin:-2}},
   ok:`Balonu bayrak direğinin yanına kusursuzca indiriyorsunuz. Aşağıdaki Başkan Tahsin bile etkileniyor: "Ne iniş ama!" Yine de kurallar kurallardır: sizi meydana çağırıyor.`,
   fail:`Balon bacaya takılıyor, çatının yarısı çöküyor ve Başkan Tahsin'in tören pastası ezilmiş durumda. Başkan çok, çok kızgın. Jandarma geliyor.`, go:'cift_testi'},
  {t:'Dürbünle güvenli bir yer bulmak', s:'dürbünle bakmak', st:'ze', req:c=>c.has('durbun'), rq:'🔭 Dürbün gerekli', fx:{flag:{muze:1}, npc:{tahsin:1}},
   ok:`Dürbünle kasabanın kenarındaki Turşu Müzesi'nin bahçesini görüp yumuşak bir iniş yapıyorsunuz. Müzede 1926 kavgasının belgelerini okuyup tarihi öğreniyorsunuz. Çıkışta sizi jandarma bekliyor, ama artık elinizde bir koz var.`, go:'cift_testi'}
 ]},

gokyuzu_pilot:{ch:4, title:'Kaptan Hayri\'nin İlk Uçuşu', art:'gokyuzu', sp:'hayri', onEnter:{inv:['+profesor']},
 text:`Hayri dümende (balonun dümeni yok ama o öyle hissediyor). Profesör güvende, kucağınızda.<br><br><i>"Gençler, aşağıda Ötenokta var. İleride ise… sonsuz ufuk. Nereye?"</i>`,
 choices:[
  {t:'Ufka doğru: dünya turuna çıkmak!', s:'dünya turu', st:'ce', go:'END:seyyah',
   ok:`Hayri'nin gözleri parlıyor: "Hep bunu istedim!" Rotayı ufka çeviriyorsunuz. Aşağıda Ötenokta küçülüp kayboluyor…`},
  {t:'Ötenokta\'ya güvenli iniş', s:'güvenli iniş', st:'ze', fx:{npc:{tahsin:1, hayri:1}},
   ok:`Hayri ilk inişini kasaba meydanına yapıyor. Biraz sarsıntılı ama güvenli. Ötenokta halkı ve jandarma etrafınızı sarıyor.`, go:'cift_testi'},
  {t:'Hayri\'ye "Biraz daha uçalım" demek', s:'biraz daha uçmak', st:'sa', fx:{npc:{hayri:2}},
   ok:`Gün batımında iki kasabanın üzerinde süzülüyorsunuz. Hayatınızın en güzel manzarası. Sonra rüzgâr dönüyor ve sizi Ötenokta meydanına, jandarmanın tam önüne bırakıyor.`, go:'cift_testi'}
 ]},

takip:{ch:4, title:'Yerden Takip', art:'yol', sp:c=>c.f('taksi')?'ramazan':'anlatici',
 text:c=>`${c.f('bosBalon')?'Boş balon Ötenokta\'ya doğru süzülüyor; Profesör kucağınızda, siz yerden peşindesiniz.':'Balon Ötenokta\'ya doğru süzülüyor, siz yerden peşindesiniz.'}${c.f('taksi')?' Ramazan Abi\'nin Tofaş\'ı inliyor: <i>"Dayan Profesör, geliyoruz!"</i>':' Koşuyorsunuz. Çok koşuyorsunuz. Üstünüz turşu kokuyor.'}`,
 choices:[
  {t:'Fikriye ile Necmi\'nin orman yolunu kullanmak', s:'orman yolu', st:'ze', req:c=>c.f('sir')||c.n('necmi')>=2||c.f('efsaneIz'), rq:'🏚️ Ormandaki gizli kulübeyi bilmeniz gerekli', fx:{flag:{necmiYanda:1, metNecmi:1}, inv:['+profesor']},
   ok:c=>`Orman yolunda kulübeye uğruyorsunuz. ${c.f('metNecmi')?'Fikriye ile Necmi':'Kapıyı açan yaşlı çift, kayıp efsane Fikriye ile Necmi! İkisi de'} "Artık saklanmak yok!" deyip size katılıyor. Ötenokta'ya balondan önce varıyorsunuz ve inen balondan atlayan Profesör kucağınıza konuyor. Ama meydanda jandarma bekliyor.`, go:'cift_testi'},
  {t:'Ana yoldan son sürat', s:'ana yol', st:'sa', check:{dc:9}, fx:{inv:['+profesor']}, fxF:{inv:['+profesor'], npc:{tahsin:-1}},
   ok:`Balon meydana inerken tam zamanında varıyorsunuz. Profesör kucağınıza atlıyor. Mükemmel zamanlama! Ama Ötenokta jandarması da oradaydı.`,
   fail:`Geç kalıyorsunuz. Profesör bu arada Başkan Tahsin'in bıyığının yarısını yemiş. Keçinizi yakalıyorsunuz ama Başkan hiç mutlu değil. Jandarma geliyor.`, go:'cift_testi'},
  {t:'14 kediyi çağırıp kedi ordusu kurmak', s:'kedi ordusu', st:'ck', req:c=>c.n('kediler')>=2, rq:'🐈 Kedilerle dost olmanız gerekli', fx:{flag:{kediOrdusu:1}, inv:['+profesor']},
   ok:`Bir ıslık ve 14 kedi yanınızda. Paşa önde, kediler arkada Ötenokta'ya yürüyorsunuz. Profesör kedileri görünce balondan kendiliğinden iniyor. Kasaba meydanında herkes bu manzarayı şaşkınlıkla izliyor, jandarma dahil.`, go:'cift_testi'},
  {t:'Tam haritadaki gizli geçidi kullanmak', s:'gizli geçit', st:'ze', req:c=>c.has('harita')&&c.has('harita2'), rq:'🗺️ Haritanın iki yarısı da gerekli', fx:{inv:['+profesor'], npc:{tahsin:2}, flag:{gecit:1}},
   ok:`İki yarıyı birleştirince ortaya çıkan gizli geçitten Ötenokta'ya balondan çok önce varıyorsunuz. Meydanda soluklanırken balon iniyor ve Profesör kucağınıza atlıyor. Başkan Tahsin, düşman kasabadan bu kadar sakin gelen birini ilk kez görüyor. Yine de jandarma çağırmadan edemiyor.`, go:'cift_testi'}
 ]},

mahkeme:{ch:5, title:'Casusluk Davası', art:'mahkeme', sp:'tahsin',
 text:c=>{
   const t = c.P.flags.test || 0;
   let x = t >= 3 ? 'Yargıç Nurten Hanım testten çok etkilenmiş: "Bu kadar uyumlu casus olmaz." '
     : t >= 1 ? 'Yargıç Nurten Hanım testin sonucunu not ediyor: "Hmm. Fena değil." '
     : 'Yargıç Nurten Hanım test kâğıdına kırmızı kalemle kocaman bir soru işareti çiziyor. ';
   x += `Başkan Tahsin bıyığını burarak kürsüye çıkıyor:<br><br><i>"Ortanoktalı casuslar! Gizli turşu tarifimizi çalmaya geldiniz!"</i>`;
   if (c.n('tahsin')>=2) x += '<br><br>Başkan Tahsin sizden biraz hoşlanmış gibi; sesi pek sert değil.';
   if (c.n('tahsin')<=-1) x += '<br><br>Başkan Tahsin size çok kızgın. İşiniz zor.';
   if (c.f('tarifIfsa')) x += '<br><br>Festivaldeki şapkalı casus kürsüye çıkıyor: "Bunlar bizim tarifi kullandı!" Suçlama ağırlaşıyor.';
   if (c.f('muze') || c.f('tarihBilgi')) x += '<br><br>1926 kavgasının gerçek hikâyesini biliyorsunuz. Dürüst bir savunma işe yarayabilir.';
   if (c.f('otenoktaBilgi')) x += ' Kahvehanedeki dedikodu da aklınızda: Nurten Hanım dürüst insanlara yumuşak davranırmış.';
   if (c.has('lokum') && c.f('tatliIpucu')) x += '<br><br>Cebinizdeki lokum kutusu sanki ışıldıyor…';
   return x; },
 choices:[
  {t:'Şarkıyla kendini savunmak', s:'şarkılı savunma', st:'ck', check:c=>({dc:10 - Math.max(-2,Math.min(2,c.n('tahsin'))) + (c.f('tarifIfsa')?2:0) - Math.min(3, c.P.flags.test||0)}),
   ok:`Uyduruk bir türküyle hikâyenizi anlatıyorsunuz. Başkan Tahsin'in bıyığı titriyor, ağlıyor. Yargıç tokmağı vuruyor: "Beraat!"`,
   fail:`Şarkı güzel ama Yargıç Nurten Hanım'ın kulakları hassas. Tokmak iniyor: "Hapis!"`, go:'pasta', goF:'hapis'},
  {t:'Dürüstçe her şeyi anlatmak', s:'dürüst savunma', st:'ze', check:c=>({dc:9 - Math.max(-2,Math.min(2,c.n('tahsin'))) - (c.f('durust')?2:0) - ((c.f('muze')||c.f('tarihBilgi'))?2:0) - (c.f('otenoktaBilgi')?1:0) + (c.f('tarifIfsa')?2:0) - Math.min(3, c.P.flags.test||0)}),
   ok:`Farklı şehirler, donan aramalar, buluşma, keçi, balon… Meydanda herkes kendi uzak mesafe hikâyesini anlatmaya başlıyor. Yargıç: "Bu çift casus olamaz. Beraat!"`,
   fail:`Hikâye o kadar saçma ki kimse inanmıyor. Tokmak iniyor: "Hapis!"`, go:'pasta', goF:'hapis'},
  {t:'Profesör\'ü avukatınız olarak tanıtmak', s:'keçi avukat', st:'sa', req:c=>c.has('profesor'), rq:'🐐 Profesör yanınızda olmalı', check:c=>({dc:8 - (c.has('kitap')?3:0) - Math.min(3, c.P.flags.test||0)}),
   ok:`Profesör arka ayaklarına kalkıp gözlüğünü düzeltiyor: "Meee." Yargıç ikna oluyor: "Bu keçi haklı. Beraat!"`,
   fail:`Profesör savunma yapacağına dava dosyasını yiyor. Yargıç "Delil karartma!" diye bağırıyor: "Hapis!"`, go:'pasta', goF:'hapis'},
  {t:'Başkan Tahsin\'e gül lokumu ikram etmek', s:'lokum ikramı', st:'ck', req:c=>c.has('lokum'), rq:'🍬 Lokum gerekli', check:c=>({dc:c.f('tatliIpucu')?4:9}), fx:{inv:['-lokum'], npc:{tahsin:2}}, fxF:{inv:['-lokum']},
   ok:`Kutuyu açıyorsunuz. Başkan Tahsin bir lokum alıyor… gözlerini kapatıyor… bir tane daha alıyor. "Lokum getiren casus olmaz," diyerek davayı kendisi geri çekiyor. Yargıç Nurten de bir tane alıyor: "Beraat!"`,
   fail:`Başkan Tahsin lokumu ağzına atıyor ve yüzünü buruşturuyor: "Bu Ortanokta lokumu! Biz fıstıklı severiz!" Tokmak iniyor: "Hapis!"`, go:'pasta', goF:'hapis'},
  {t:'Gizli turşu tarifini herkesin önünde okumak', s:'tarifi açıklamak', st:'ze', req:c=>c.has('tarif'), rq:'📜 Gizli tarif gerekli', fx:{inv:['-tarif'], flag:{tarifVar:1}, npc:{tahsin:3}},
   ok:`Tarifi yüksek sesle okuyorsunuz. Ötenokta'lıların yüzü değişiyor: bu tarif kendi büyükannelerinin tarifiyle birebir aynı! İki kasabanın aynı tarifi yüz yıldır kıskandığı ortaya çıkıyor.`, go:'baris'},
  {t:'Fikriye ile Necmi tanıklık etsin', s:'efsane tanıklar', st:'ck', req:c=>c.f('necmiYanda'), rq:'🏚️ Fikriye ile Necmi yanınızda olmalı', fx:{npc:{necmi:2, tahsin:2}, flag:{tarifVar:1}},
   ok:`Fikriye ile Necmi kalabalığı yarıp geliyor. Necmi Amca 1926'nın gerçeğini anlatıyor: kavga bir yanlış anlamaymış ve tarif iki kasabanın ortak mirasıymış. Başkan Tahsin dizlerinin üstüne çöküyor.`, go:'baris'},
  {t:'Kedi ordusu mahkemeyi bassın', s:'kedi baskını', st:'ce', req:c=>c.f('kediOrdusu'), rq:'🐈 Kedi ordusu gerekli', fx:{npc:{kediler:2}},
   ok:`14 kedi aynı anda kürsüye atlıyor. Yargıç Nurten Hanım kedi alerjisi yüzünden hapşırmaktan karar veremiyor ve davayı düşürüyor. Kediler kahraman!`, go:'pasta'}
 ]},

hapis:{ch:5, title:'Ötenokta Hapishanesi', art:'hapis', sp:'sukru', onEnter:{flag:{jailed:1}},
 text:c=>`Hücredesiniz. Gardiyan Şükrü bir yandan çay içip bir yandan tavla tahtasını siliyor:<br><br><i>"Merak etmeyin, burası beş yıldızlı. Çay bedava."</i><br><br>Kapının üstünde paslı bir tabela: <b>"Ö.H. · Ötenokta Hapishanesi"</b>.${c.has('anahtar')?'<br><br>Bir dakika… cebinizdeki paslı anahtarın üzerinde de "Ö.H." yazıyordu!':''}`,
 choices:[
  {t:'Paslı anahtarı kilitte denemek', s:'paslı anahtar', st:'sa', req:c=>c.has('anahtar'), rq:'🗝️ Paslı anahtar gerekli', fx:{inv:['-anahtar']},
   ok:`Klik! Kapı açılıyor. Meğer Nadide Teyze gençliğinde bu hapishanenin müdürüymüş. Şükrü çayına dalmışken sessizce kaçıyorsunuz.`, go:'pasta'},
  {t:'Gardiyan Şükrü ile tavla oynayıp özgürlüğe bahse girmek', s:'tavla bahsi', st:'ze', check:{dc:9},
   ok:`Son zarda düşeş! Şükrü sözünü tutup kapıyı açıyor: "Ama bir rövanş isterim."`,
   fail:`Şükrü sizi 5-0 yeniyor. Kapı kapalı kalıyor. Şükrü "Yarın yine oynarız" diyor. Yarın, öbür gün, ondan sonraki gün…`, go:'pasta', goF:'END:hapis'},
  {t:'Kaşıkla tünel kazmak', s:'kaşıkla tünel', st:'sa', check:{dc:10},
   ok:`Üç saat kazdıktan sonra tünel… kasabanın pastanesinin mutfağına çıkıyor. Özgürsünüz ve önünüzde dev bir pasta hamuru var.`,
   fail:`Kaşık bükülüyor. Şükrü size yeni bir kaşık veriyor, "kahvaltı için" diyor. Kahvaltı uzun sürecek.`, go:'pasta', goF:'END:hapis'},
  {t:'Ramazan Abi\'nin kurtarma operasyonu', s:'Ramazan kurtarıyor', st:'ck', req:c=>c.n('ramazan')>=3, rq:'🚕 Ramazan Abi ile kanka olmanız gerekli (❤️3)',
   ok:`Tofaş hapishanenin önüne yanaşıyor. Ramazan Abi, Şükrü'nün eski askerlik arkadaşı çıkıyor. İki dost kucaklaşırken siz sessizce taksiye biniyorsunuz.`, go:'pasta'},
  {t:'Gardiyan Şükrü\'ye lokum rüşveti', s:'lokum rüşveti', st:'sa', req:c=>c.has('lokum'), rq:'🍬 Lokum gerekli', fx:{inv:['-lokum']},
   ok:`Şükrü kutuya bakıyor, etrafa bakıyor, kutuya bakıyor. "Ben bir çay demlemeye gidiyorum. Kapı… açık kalmış olabilir." Lokum sizin özgürlüğünüz oluyor.`, go:'pasta'}
 ]},

baris:{ch:5, title:'Yüz Yıllık Barış', art:'baris', sp:'tahsin',
 text:`Meydanda tarihî bir an yaşanıyor: 1926'dan beri küs olan iki kasaba aynı tarifi yüz yıldır kıskandığını anlıyor. Ortanoktalılar da yoldan çıkagelmiş: Ramazan Abi, Nadide Teyze, Gülizar Hanım, hepsi burada. Başkan Tahsin gözyaşlarını silip size dönüyor:<br><br><i>"Bu sır artık sizin. Ne yapacaksınız?"</i>`,
 choices:[
  {t:'Barış elçisi olup iki kasabayı birleştirmek', s:'barış elçiliği', st:'ck', go:'END:elci',
   ok:`İki başkanın ellerini birleştiriyorsunuz. Davullar çalıyor, iki kasaba aynı halaya giriyor…`},
  {t:'Tarifi iki kasabaya hediye edip barış pastası yapmak', s:'barış pastası', st:'ze', fx:{npc:{tahsin:1, ramazan:1}},
   ok:`"Bunu bir pastayla kutlayalım!" İki kasaba aynı anda mutfaklara koşuyor. Ve herkes size bakıyor: şefler sizsiniz.`, go:'pasta'},
  {t:'Tarifi en yüksek teklifi verene satmak', s:'tarifi satmak', st:'sa', go:'END:zengin',
   ok:`Kalabalığın arkasından takım elbiseli bir adam öne çıkıp çek defterini açıyor…`}
 ]},

pasta:{ch:6, title:'Sevgi Pastası', art:'mutfak', sp:'anlatici',
 text:c=>{
   const x = c.from==='mahkeme' ? 'Beraat kararıyla meydan bir anda bayram yerine dönüyor.'
     : c.from==='hapis' ? 'Hapisten kurtulup meydana koştuğunuzda, Başkan Tahsin olanlara gülmekten kızgınlığını unutmuş durumda.'
     : 'İki kasaba aynı mutfakta, yüz yıl sonra ilk kez yan yana.';
   return `${x} Ötenokta ile Ortanokta arasındaki ilk dostluk kutlaması için dev bir <b>Sevgi Pastası</b> yapılacak ve şefler sizsiniz. Bütün kasaba mutfağın kapısında bekliyor. Tarif ne olsun?`; },
 choices:[
  {t:'Turşulu pasta (iki kasabanın ortak tutkusu)', s:'turşulu pasta', st:'ze', check:c=>({dc:((c.has('tarif')||c.f('tarifVar'))?6:11) - (c.f('tarihBilgi')?2:0) - (c.has('un')?2:0)}), fx:{flag:{tursuPasta:1}},
   ok:`Kat kat turşu, arası krema. Kulağa korkunç geliyor ama ilk lokmada Başkan Tahsin gözlerini kapatıyor: "Dedemin anlattığı tat bu!"`,
   fail:`Turşu ile krema birbirini reddediyor. Pasta hafifçe köpürüyor. Kimse yemiyor ama herkes fotoğrafını çekiyor.`, go:'dalis'},
  {t:'Klasik çikolatalı pasta', s:'klasik çikolatalı', st:'ck',
   ok:`Beş katlı, parlak, kusursuz. Gülizar Hanım bile "Fena değil" diyor (onun dilinde bu "muhteşem" demek).`, go:'dalis'},
  {t:'Her şeyden biraz: mantı, turşu, çikolata, umut', s:'her şeyli pasta', st:'sa', req:c=>c.has('manti'), rq:'🥟 Mantı gerekli', fx:{inv:['-manti'], flag:{devPasta:1}},
   ok:`Pasta 3 metre oluyor ve Pisa Kulesi gibi sola yatıyor. İçinde mantı var. Neden olduğunu kimse sormuyor.`, go:'dalis'},
  {t:'Taze değirmen unuyla Ortanokta usulü baklava-pasta', s:'baklava-pasta', st:'ze', req:c=>c.has('un'), rq:'🌾 Değirmen unu gerekli', fx:{inv:['-un'], npc:{tahsin:1, ramazan:1}, flag:{baklava:1}},
   ok:`Rıza Dede'nin ununu kat kat açıyorsunuz. Ortaya baklava ile pasta arası, iki kasabanın da "Bu bizim tatlımız!" diye sahiplendiği bir şey çıkıyor. Kimse kavga etmiyor. Herkes ikinci dilimi istiyor.`, go:'dalis'}
 ]},

dalis:{ch:6, title:'Pasta Kesme Anı', art:'mutfak', sp:'anlatici',
 text:c=>`Bütün kasaba meydanda toplanmış. ${c.f('tursuPasta')?'Turşulu':c.f('devPasta')?'3 metrelik':c.f('baklava')?'Baklava tadındaki':'Beş katlı'} pastanın önündesiniz; bıçak ikinizin elinde, birlikte kesmek üzeresiniz… ${c.has('profesor')?'ve tam o anda Profesör kucağınızdan fırlayıp':'ve tam o anda kalabalığın arasından Profesör fırlayıp'} havada süzülüyor ve <b>pastanın tam ortasına dalıyor.</b>`,
 choices:[
  {t:'Kahkahalarla gülmek', s:'gülmek', st:'ck', fx:{inv:['+profesor'], flag:{guldu:1}},
   ok:`Gülmeniz bulaşıcı: önce Ramazan Abi, sonra iki kasabanın tamamı gülüyor. Kremalı Profesör size sarılıyor. Hayatınızın en güzel aile fotoğrafı.`, go:'fener'},
  {t:'Pastayı kurtarmak için atılmak', s:'pastayı kurtarmak', st:'ce', check:{dc:10}, fx:{inv:['+profesor'], npc:{gulizar:1}}, fxF:{inv:['+profesor']},
   ok:`Ragbi oyuncusu gibi atılıp pastanın yarısını kurtarıyorsunuz! Dilimler iki kasabaya yetiyor. Gülizar Hanım ayakta alkışlıyor.`,
   fail:`Siz de pastanın içine dalıyorsunuz. Artık üçünüz de pastanın içindesiniz. Pasta kurtarılamadı ama herkes gülüyor.`, go:'fener'},
  {t:'Bunu planlı bir sanat performansı olarak sunmak', s:'sanat performansı', st:'ze', fx:{inv:['+profesor'], flag:{sanat:1}},
   ok:`"Bu eserin adı: Aşk Beklenmediktir." Kalabalık bir an susuyor, sonra coşkuyla alkışlıyor. Şehirden gelmiş bir sanat eleştirmeni not defterini çıkarıyor.`, go:'fener'}
 ]},

veda:{ch:6, title:'Otogarda Veda', art:'veda', sp:'ramazan',
 text:c=>`Fener Gecesi'nin ertesi sabahı Ramazan Abi hepinizi Tofaş'a doldurup Ortanokta Otogarı'na götürüyor (nasıl sığdınız kimse bilmiyor).<br><br>Otobüsleriniz aynı anda kalkacak, ama bu kez ters yönlere. Herkes sizi uğurlamaya gelmiş.${c.has('profesor')?' Profesör aranızda; kimin otobüsüne bineceğini bilmiyor.':''}<br><br><i>"Eee çocuklar… şimdi ne olacak?"</i>`,
 choices:[
  {t:'Bir sonraki buluşmanın tarihini hemen belirlemek', s:'yeni tarih', st:'ze', fx:{flag:{tarih:1}},
   ok:`Takvimleri açıp tarihi seçiyorsunuz. Ramazan Abi tarihi kocaman harflerle yazıp otogarın duvarına asıyor. Kornalar çalıyor…`, go:'end'},
  {t:'Birbirinizin cebine gizli bir mektup bırakmak', s:'gizli mektup', st:'ck', fx:{flag:{mektup:1}},
   ok:`Son kez sarılırken ikiniz de gizlice diğerinin cebine bir mektup bırakıyorsunuz. İkiniz de öbürünün fark etmediğini sanıyor. Kornalar çalıyor…`, go:'end'},
  {t:'Profesör için ortak velayet anlaşması imzalamak', s:'ortak velayet', st:'sa', req:c=>c.has('profesor'), rq:'🐐 Profesör yanınızda olmalı', fx:{flag:{velayet:1}},
   ok:`Nadide Teyze çantasından noter mührünü çıkarıyor (pansiyon aynı zamanda noterlik). Belge otogarın bankında imzalanıyor. Kornalar çalıyor…`, go:'end'},
  {t:'Otobüslerden inip Ortanokta\'ya taşınmak!', s:'taşınmak', st:'ce', req:c=>(c.n('ramazan')+c.n('gulizar')+c.n('kediler'))>=7, rq:'Kasabada çok güçlü dostluklar gerekli (Ramazan + Gülizar + Kediler toplam ❤️7)', go:'END:yerlesik',
   ok:`Kapılar kapanmak üzereyken ikiniz de aynı anda otobüslerden atlıyorsunuz…`}
 ]}
};

// =====================================================================
//  YENİ SAHNELER: mini oyunlar, Kasabayı Keşfet, Fener Gecesi
// =====================================================================
const goKesif = c => (c.P.visits || 0) >= 3 ? 'isinma' : 'kesif';
const VISIT = loc => ({flag:{['v_' + loc]:1}, visit:1});

Object.assign(S, {
taksi_sohbet:{ch:1, title:'Taksi Sohbeti', art:'kasaba', sp:'ramazan', choices:[],
 mini:{qs:[['tahmin','irem'],['tahmin','cengiz']],
  intro:`Ramazan Abi dikiz aynasından bakıp gülümsüyor:<br><br><i>"Yol uzun, biraz sohbet edelim. Bakalım birbirinizi ne kadar tanıyorsunuz! Biriniz kendisi için cevaplasın, öbürü tahmin etsin."</i>`,
  reward:(m, n) => m === n
   ? {fx:{npc:{ramazan:2}, uyum:1}, text:`Ramazan Abi direksiyonu yumrukluyor: "İşte gerçek aşk bu!" Taksimetreyi kapatıp bütün yol size eski Ortanokta türküleri söylüyor.`}
   : m > 0 ? {fx:{npc:{ramazan:1}}, text:`"Fena değil, fena değil," diyor Ramazan Abi. "Ama daha çok konuşun. Ben eşimle kırk yıldır konuşuyorum, hâlâ bitmedi."`}
   : {fx:null, text:`Ramazan Abi derin bir iç çekiyor: "Siz bu kasabada epey konuşacaksınız…" Pansiyonun önünde frene basıyor.`}},
 go:'pansiyon'},

kesif:{ch:2, title:'Kasabayı Keşfet', art:'kasaba', sp:c=>(c.P.visits||0)===0 && c.from==='kulube' ? 'fikriye' : 'anlatici',
 text:c=>{
   const v = c.P.visits || 0;
   if (v === 0){
     const a = c.from === 'kulube' ? `Sabah Fikriye Teyze sizi orman yolundan kasabaya kadar geçiriyor: <i>"Bizi gördüğünüzü kimseye söylemeyin."</i>`
       : c.from === 'gece' ? `Sabah çadırda kuş sesleriyle uyanıyorsunuz. Nadide Teyze bahçeye kahvaltı getirmiş.`
       : `Sabah Nadide Teyze kocaman bir kahvaltı sofrası kurmuş. Kediler de masada.`;
     return `${a}<br><br>Festival öğleden sonra başlıyor. O zamana kadar kasabayı gezmek için <b>3 durağa</b> vaktiniz var. Beş mekândan üçünü seçebilirsiniz; her yerde başka bir şey bulacaksınız. Nereye gidelim?`;
   }
   return `${v === 1 ? 'İlk durak tamam!' : 'İkinci durak da tamam!'} Festivale kadar <b>${3 - v} durak</b> daha gezebilirsiniz. Sırada neresi var?`; },
 choices:[
  {t:'Pazar yeri', d:'Lokumcular, pazarcı teyzeler ve eski bir fotoğraf makinesi.', s:'pazar yeri', st:'sa', req:c=>!c.f('v_pazar'), rq:'Buraya zaten gittiniz',
   ok:`Kalabalığın ve bağırışların peşinden pazar yerine yürüyorsunuz.`, go:'pazar'},
  {t:'Eski değirmen', d:'Kasabanın kenarında, gıcırdayan, biraz ürkütücü.', s:'eski değirmen', st:'ce', req:c=>!c.f('v_degirmen'), rq:'Buraya zaten gittiniz',
   ok:`Kasabanın kenarındaki yıkık değirmene doğru yürüyorsunuz. Çarkın gıcırtısı uzaktan duyuluyor.`, go:'degirmen'},
  {t:'Göl kenarı', d:'Sakin su, yaşlı bir balıkçı ve kuğu şeklinde bir tekne.', s:'göl kenarı', st:'ck', req:c=>!c.f('v_gol'), rq:'Buraya zaten gittiniz',
   ok:`Söğütlerin arasından göle iniyorsunuz.`, go:'gol'},
  {t:'Kahvehane', d:'Tavla şakırtıları ve kasabanın bütün dedikoduları.', s:'kahvehane', st:'ze', req:c=>!c.f('v_kahve'), rq:'Buraya zaten gittiniz',
   ok:`Tavla şakırtılarının geldiği kahvehaneye giriyorsunuz.`, go:'kahve'},
  {t:'Kasaba kütüphanesi', d:'Tozlu raflar ve duvarda tuhaf bir fotoğraf.', s:'kütüphane', st:'ze', req:c=>!c.f('v_kutuphane'), rq:'Buraya zaten gittiniz',
   ok:`Gıcırdayan kapıyı itip kütüphaneye giriyorsunuz.`, go:'kutuphane'}
 ]},

pazar:{ch:2, title:'Pazar Yeri', art:'pazar', sp:'hasan', onEnter:VISIT('pazar'),
 text:`Ortanokta pazarı! Tezgâhlarda domatesler, peynirler, rengârenk lokumlar. Lokumcu Hasan Usta "Gül lokumu, taze taze!" diye bağırıyor. Köşede eski bir fotoğraf makinesiyle müşteri bekleyen bir amca var.`,
 choices:[
  {t:'Hasan Usta\'dan bir kutu lokum almak', s:'lokum almak', st:'sa', fx:{inv:['+lokum']},
   ok:`Hasan Usta bir kutu gül lokumu sarıyor ve göz kırpıyor: "Ötenokta'ya yolunuz düşerse saklayın. Oranın insanı lokuma bayılır." Ne demek istediğini anlamıyorsunuz. Henüz.`, go:goKesif},
  {t:'Pazarcı teyzelere kasa taşımak', s:'kasa taşımak', st:'ce', fx:{npc:{ramazan:1}},
   ok:`Domates kasalarını tek tek taşıyorsunuz. Meğer teyzelerden biri Ramazan Abi'nin ablasıymış! Haber ışık hızıyla Ramazan Abi'ye ulaşıyor: "Benim çocuklar çok iyi çocuklar!"`, go:goKesif},
  {t:'Eski makineyle fotoğraf çektirmek', s:'fotoğraf çektirmek', st:'ck', fx:{inv:['+foto']},
   ok:`Fotoğrafçı amca "Gülümseyin!" diyor ve flaş patlıyor. Elinize sıcacık bir <b>Polaroid fotoğraf</b> veriyor. İkinizin de gözleri kapalı. Mükemmel.`, go:goKesif}
 ]},

degirmen:{ch:2, title:'Eski Değirmen', art:'degirmen', sp:'riza', onEnter:VISIT('degirmen'),
 text:`Kasabanın kenarında yıkık bir değirmen. Kapısı yarı açık, çarkı gıcırdıyor. Kasabalılar buraya "Gıcırtılı" diyor ve pek yaklaşmıyor. Kapının önünde yaşlı Değirmenci Rıza Dede pipo tüttürüyor.`,
 choices:[
  {t:'İçeri girip etrafı araştırmak', s:'değirmeni araştırmak', st:'ce', check:{dc:9}, fx:{inv:['+harita2']},
   ok:c=>c.has('harita')
     ? `Bir çuvalın altında yırtık bir kâğıt: haritanın <b>diğer yarısı</b>! Cebinizdeki yarımla birleştirince ormanın içinden Ötenokta'ya uzanan gizli bir geçit beliriyor.`
     : `Bir çuvalın altında yırtık bir kâğıt buluyorsunuz: <b>bir haritanın yarısı</b>. Ötenokta yönünü gösteriyor ama diğer yarısı kayıp.`,
   fail:`Karanlıkta bir baykuş yüzünüze uçuyor ve çığlık atarak dışarı koşuyorsunuz. Rıza Dede pipo dumanının arasından kıkırdıyor.`, go:goKesif},
  {t:'Rıza Dede ile sohbet etmek', s:'Rıza Dede ile sohbet', st:'ck', fx:{flag:{efsaneIz:1}},
   ok:c=>c.f('metNecmi')
     ? `Rıza Dede fısıldıyor: "Fikriye ile Necmi'yi gördünüz, değil mi? Yüzünüzden belli." Size ormandaki kulübeye çıkan en kısa yolu tarif ediyor: "Bir gün acil bir işiniz olursa bu yol herkesten önce Ötenokta'ya çıkar."`
     : `Rıza Dede fısıldıyor: "Fikriye ile Necmi ölmedi. Ormanda bir kulübede yaşıyorlar. O kulübeden geçen yol, Ötenokta'ya herkesten önce çıkar." Bunu aklınızın bir köşesine yazıyorsunuz.`, go:goKesif},
  {t:'Değirmen çarkını çalıştırmak', s:'çarkı çalıştırmak', st:'ze', check:{dc:10}, fx:{inv:['+un']},
   ok:`Biraz yağ, biraz tekme ve çark dönmeye başlıyor! 20 yıl sonra ilk kez un öğütülüyor. Rıza Dede'nin gözleri doluyor ve size bir çuval <b>taze un</b> hediye ediyor.`,
   fail:`Çark bir tur dönüp tamamen duruyor. Tepeden bir kuş yuvası düşüyor. Rıza Dede omuz silkiyor: "Yirmi yıldır böyle."`, go:goKesif}
 ]},

gol:{ch:2, title:'Göl Kenarı', art:'gol', sp:'sevket', onEnter:VISIT('gol'),
 text:`Kasabanın gölü sakin ve pırıl pırıl. İskelede Balıkçı Şevket oltasını sallıyor ve sizi görünce başını hafifçe eğiyor. Kıyıda kuğu şeklinde, pedallı bir tekne bağlı.`,
 choices:[
  {t:'Şevket ile balık tutmak', s:'balık tutmak', st:'sa', check:{dc:8}, fx:{npc:{sevket:2}}, fxF:{npc:{sevket:1}},
   ok:`Kocaman bir sazan! Şevket ilk kez gülümsüyor: "Siz iyi insanlarsınız. Bir gün suya düşerseniz benim adımı verin." Ne demek istediğini anlamıyorsunuz.`,
   fail:`Bir çizme tutuyorsunuz. Şevket yine de takdirle bakıyor: "Herkes çizme tutamaz."`, go:goKesif},
  {t:'Kuğu tekneyle göle açılmak', s:'kuğu tekne', st:'ck', fx:{uyum:1},
   ok:`Pedal çevire çevire gölün ortasına gidiyorsunuz. Etraf sessiz. Bir an uzak mesafe, ekranlar ve otobüsler aklınıza gelmiyor. Sadece ikiniz ve plastik bir kuğu.`, go:goKesif},
  {t:'Yüzme yarışı yapmak', s:'yüzme yarışı', st:'ce', check:{dc:10}, fx:{npc:{sevket:1}}, fxF:{kaos:1},
   ok:`Kıyıya aynı anda varıyorsunuz. Hakemliği üstlenen Şevket ciddiyetle beraberlik ilan ediyor ve size birer havlu fırlatıyor.`,
   fail:`Yarı yolda ikiniz de yoruluyorsunuz ve Şevket sizi oltasıyla tek tek kıyıya çekmek zorunda kalıyor. Sırılsıklam ve kahkahalar içindesiniz.`, go:goKesif}
 ]},

kahve:{ch:2, title:'Kahvehane', art:'kahve', sp:'dede', onEnter:VISIT('kahve'),
 text:`Köy kahvesinde üç dede tavla oynuyor; çaylar tavşan kanı, radyoda eski bir şarkı. Biri size seslenip zarları uzatıyor:<br><br><i>"Gençler, bir el atar mısınız?"</i>`,
 choices:[
  {t:'Dedelerle tavla oynamak', s:'tavla', st:'ze', check:{dc:9}, fx:{flag:{tatliIpucu:1}},
   ok:`Mars ediyorsunuz! Dedeler hayranlıkla ellerinizi sıkıyor ve bir sır veriyor: "Ötenokta'nın başkanı Tahsin, gül lokumuna bayılır. Bir lokumla dağları devirirsin."`,
   fail:`Dedeler sizi üç el üst üste mars ediyor ve "Bir daha gelin, öğretiriz" diyerek çay ısmarlıyor.`, go:goKesif},
  {t:'Kasaba dedikodularını dinlemek', s:'dedikodu', st:'sa', fx:{flag:{otenoktaBilgi:1}},
   ok:`Dedikodular saatlerce sürüyor ama sonunda işe yarar bir şey öğreniyorsunuz: komşu kasaba Ötenokta'nın mahkemesinde yargıç olan eczacı Nurten Hanım, dürüst insanlara hep yumuşak davranırmış.`, go:goKesif},
  {t:'Kahve falına baktırmak', s:'kahve falı', st:'ck', fx:{flag:{kehanet:1}},
   ok:`Dedelerden biri fincanı çeviriyor: "Bir yol görüyorum… yukarıdan, havadan. Bir de sakallı bir dost." Herkes gülüyor. Siz gülmüyorsunuz.`, go:goKesif}
 ]},

kutuphane:{ch:2, title:'Kasaba Kütüphanesi', art:'kutuphane', sp:'saadet', onEnter:VISIT('kutuphane'),
 text:`Tozlu raflar, gıcırdayan parke. Kütüphaneci Saadet Hanım gözlüğünün üstünden bakıyor: <i>"Sessiz olun."</i> Duvarda gözlüklü bir keçinin fotoğrafı asılı. Altında şöyle yazıyor: <b>"Eski Kütüphane Müdürümüz: Profesör"</b>.`,
 choices:[
  {t:'1926 arşivini incelemek', s:'1926 arşivi', st:'ze', fx:{flag:{tarihBilgi:1}},
   ok:`Sararmış gazeteler: "Ortanokta ile Ötenokta Arasında Turşu Krizi!" Kavganın aslında bir tarif kâğıdının ikiye yırtılmasıyla başladığını öğreniyorsunuz. Bu bilgi bir gün işe yarayabilir.`, go:goKesif},
  {t:'Birbirinize fısıltıyla şiir okumak', s:'şiir okumak', st:'ck', fx:{uyum:1},
   ok:`En arka rafta eski bir şiir kitabı buluyor ve birbirinize fısıltıyla okuyorsunuz. Saadet Hanım "Şşşt" diyecekken vazgeçip gözlerini siliyor.`, go:goKesif},
  {t:'Dağınık kitapları yerine dizmek', s:'kitap dizmek', st:'sa', check:{dc:9}, fx:{inv:['+kitap']},
   ok:`Saadet Hanım minnettar: "Bunu siz alın, Profesör'ün en sevdiği kitaptı." Elinizde <b>Keçi Bakımı 101</b> var. Bir sayfası işaretli: "Kaçan keçiyi sakinleştiren ıslık".`,
   fail:`Kitapları alfabetik değil renklerine göre diziyorsunuz. Saadet Hanım bayılmak üzere. Sessizce çıkıyorsunuz.`, go:goKesif}
 ]},

isinma:{ch:3, title:'Çiftler Isınma Turu', art:'festival', sp:'sunucu', choices:[],
 mini:{qs:[['kim'],['ciz','irem'],['kim'],['ciz','cengiz']],
  intro:`Meydanda mikrofon cızırdıyor. Sunucu Necati sahnede:<br><br><i>"Festivale çiftler ısınma turuyla başlıyoruz! İki oyunumuz var: önce soruyorum, ikiniz de aynı anda cevaplıyorsunuz. KİM DAHA ÇOK…? Sonra da çizim yarışması: biriniz çizecek, öbürü bilecek!"</i>`,
  reward:(m, n) => m === n
   ? {fx:{flag:{juri:1}, npc:{gulizar:1}, uyum:1}, text:`Hepsini bildiniz! Sunucu Necati mikrofonu düşürüyor. Jüri üyeleri birbirine bakıp not alıyor ve ön sıradaki Gülizar Hanım bile alkışlıyor. Jürinin gözüne girdiniz.`}
   : m >= Math.ceil(n / 2) ? {fx:{flag:{juri:1}}, text:`"Fena değil!" diye bağırıyor Necati. Jüri masasındakiler size gülümsüyor; turşu yarışmasında bu işinize yarayabilir.`}
   : {fx:null, text:`Seyirciler kahkahalarla gülüyor. Necati "Bu çift daha birbirini keşfediyor!" diyor. En azından herkes sizi tanıdı.`}},
 go:'festival'},

duello_bilgi:{ch:3, title:'Final: Bilgi Yarışması', art:'duello', sp:'gulizar', choices:[],
 mini:{qs:[['tahmin','irem'],['tahmin','cengiz'],['ayni'],['kim']],
  intro:`Muhtar Bey ile Gülizar Hanım ilk turu kusursuz geçiyor: 4 soruda 4 doğru. Şimdi sıra sizde. Gülizar Hanım mikrofonu alıyor:<br><br><i>"Dört soru soracağım. Muhtar Bey'le bizi geçmek için en az üçünü bilmeniz lazım. Hile yok, birbirinize bakmak yok!"</i>`,
  reward:(m, n) => m >= 3
   ? {fx:{inv:['+altin','+profesor'], flag:{sampiyon:1}, npc:{gulizar:2}, uyum:m === n ? 1 : 0},
      text:m === n ? `Dörtte dört! Gülizar Hanım mikrofonu bırakıp ikinizi birden kucaklıyor: "8 yıldır böylesini görmedim." ŞAMPİYONSUNUZ! Kupa ve Profesör sizin.`
        : `Dörtte üç, tam sınırda! Seyirciler ayağa kalkıyor. Gülizar Hanım elinizi sıkıyor: "Birbirinizi gerçekten tanıyorsunuz." ŞAMPİYONSUNUZ! Kupa ve Profesör sizin.`}
   : {fx:{npc:{gulizar:1}}, text:m === 2 ? `Dörtte iki… Kıl payı kaybettiniz. Gülizar Hanım teselli ediyor: "Az kaldı. Daha çok konuşun, seneye gelin."` : `Gülizar Hanım iç çekiyor: "Siz bu festivalden sonra epey konuşacaksınız." Kaybettiniz ama salondaki herkes size gülümsüyor.`}},
 go:'balon'},

cift_testi:{ch:5, title:'Gerçek Çift Testi', art:'mahkeme', sp:'nurten', choices:[],
 mini:{qs:[['ayni'],['tahmin','irem'],['refleks'],['tahmin','cengiz']],
  intro:`Ötenokta meydanı. Başkan Tahsin sizi gösterip "Ortanoktalı casuslar!" diye bağırıyor ve meydanda bir mahkeme kuruluyor. Yargıç eczacı Nurten Hanım gözlüğünü indiriyor:<br><br><i>"Önce şunu görelim: gerçekten çift misiniz, yoksa sahte mi? Gerçek çiftler aynı cevapları verir ve aynı anda tepki verir. Ayrı ayrı cevaplayın!"</i>`,
  reward:(m, n) => ({fx:{flag:{test:m}, uyum:m === n ? 1 : 0},
   text: m === n ? `Nurten Hanım test kâğıdını havaya kaldırıyor: "Kusursuz! Bunlar gerçek bir çift." Meydanda bir mırıltı dolaşıyor. Dava sizin için çok daha kolay geçecek.`
     : m >= 1 ? `Nurten Hanım kaşlarını kaldırıyor: "Hmm. ${m} doğru. Sahte çift değilsiniz ama… göreceğiz." Dava biraz daha kolay geçecek.`
     : `Nurten Hanım kâğıda kocaman bir soru işareti çiziyor. Başkan Tahsin zafer kazanmış gibi bıyığını buruyor. İşiniz zor.`})},
 go:'mahkeme'},

fener:{ch:6, title:'Fener Gecesi', art:'fener', sp:'fener',
 text:c=>`Pastanın ${c.f('guldu')?'kahkahalarla biten':c.f('sanat')?'sanat eserine dönüşen':'başına gelenler'} kutlaması iki kasabanın en güzel gecesine dönüşüyor. Meydanda <b>Fener Gecesi</b> başlıyor: davullar, ışıklar, gökyüzüne yükselen yüzlerce kâğıt fener.${c.has('profesor')?' Profesör, boynunda küçük bir fenerle aranızda dolaşıyor.':''}`,
 choices:[
  {t:'Bir dilek feneri uçurmak', s:'dilek feneri', st:'sa', fx:{flag:{fenerDilek:1}},
   ok:`Fenerin içine bir dilek yazıp birlikte havaya bırakıyorsunuz. Fener diğerlerinin arasında yükselip bir yıldız gibi kayboluyor. Ne yazdığınızı ikiniz de biliyorsunuz.`, go:'gece_mini'},
  {t:'Sahnede düet yapmak', s:'düet', st:'ck', check:{dc:9}, fx:{npc:{ramazan:1, gulizar:1, tahsin:1}}, fxF:{kaos:1},
   ok:`Ramazan Abi'nin taksisinde öğrendiğiniz türküyü söylüyorsunuz. İki kasaba hep bir ağızdan eşlik ediyor. Başkan Tahsin ile Başkan Rıfkı kol kola sallanıyor.`,
   fail:`Mikrofon tam nakaratta tiz bir çığlık atıyor ve davulcu irkilip davulunu düşürüyor. Yine de herkes alkışlıyor, çünkü bu gece kimse kimseye kızamaz.`, go:'gece_mini'},
  {t:'Profesör ile dans pistine çıkmak', s:'keçiyle dans', st:'ce', req:c=>c.has('profesor'), rq:'🐐 Profesör yanınızda olmalı', fx:{flag:{keciDans:1}, npc:{kediler:1}},
   ok:`Profesör ön ayaklarını omuzlarınıza koyuyor ve üçünüz birden dans ediyorsunuz. Paşa ve 13 kedi de etrafınızda dönüyor. Bu görüntü yıllarca anlatılacak.`, go:'gece_mini'},
  {t:'Polaroid fotoğrafın arkasına not yazmak', s:'fotoğrafa not', st:'ze', req:c=>c.has('foto'), rq:'📸 Polaroid fotoğraf gerekli', fx:{flag:{fotoNot:1}},
   ok:`Fenerlerin ışığında fotoğrafın arkasına birlikte bir not yazıyorsunuz. Kısa bir cümle. Fotoğrafı göğüs cebinize koyuyorsunuz.`, go:'gece_mini'}
 ]},

gece_mini:{ch:6, title:'Fenerlerin Altında', art:'fener', sp:'anlatici', choices:[],
 mini:{qs:[['ayni'],['kim'],['ayni']],
  intro:`Herkes dağıldıktan sonra ikiniz pansiyonun çatısında baş başa kalıyorsunuz. Gökyüzü fenerlerle dolu. Bir fener alçalıp yanınızdan geçerken üzerinde el yazısıyla sorular olduğunu görüyorsunuz…`,
  reward:(m, n) => m === n
   ? {fx:{flag:{kalp:1}, uyum:1}, text:`Üç soruya da aynı cevabı verdiniz. Bir süre hiç konuşmadan fenerleri izliyorsunuz. Konuşmaya gerek yok.`}
   : m >= 2 ? {fx:{flag:{kalp:1}}, text:`Neredeyse hepsinde aynı cevap. Birbirinize bakıp gülüyorsunuz; tutmayan cevabı sabaha kadar tartışabilirsiniz.`}
   : {fx:null, text:`Cevaplar pek tutmadı ama çatıda kahkahalarınız bütün kasabaya yayılıyor. Nadide Teyze aşağıdan "Uyuyun artık!" diye sesleniyor.`}},
 go:'veda'}
});

function evalEnding(P){
  const f = k => !!P.flags[k], has = i => P.inv.includes(i), n = k => P.npc[k]||0;
  // Önce yolda hak edilen özel sonlar, sonra vedadaki seçim, en son genel sonlar
  if (f('sampiyon') && f('tursuPasta')) return 'tursu';
  if (f('alias') && f('metNecmi') && n('necmi')>=2) return 'varis';
  if ((P.mqMatch||0) >= 11) return 'bilgin';
  if (f('fotoNot') && f('kalp')) return 'album';
  if (f('fenerDilek') && f('kalp')) return 'fener';
  if (n('kediler') >= 4) return 'kedi';
  if (f('sanat') && P.kaos >= 5) return 'sanat';
  if (f('velayet') && has('profesor')) return 'keci';
  if (P.uyum >= 16) return 'ruh';
  if (P.kaos >= 10) return 'kaos';
  if (f('mektup')) return 'mektup';
  return 'klasik';
}

// =====================================================================
//  RASTGELE OLAYLAR
//  Aynı bölüm içindeki geçişlerde, oyun başına en fazla 3 kez araya girer.
//  ch:null → olayın bölümü, döneceği sahnenin bölümüdür.
// =====================================================================
const EV_RET = c => c.P.evtRet;
const EVENTS = {
ev_yagmur:{title:'Ani Sağanak', art:'kasaba', sp:'anlatici', cond:c => true,
 text:`Gökyüzü bir anda kararıyor ve bardaktan boşanırcasına yağmur başlıyor! Kasabalılar dükkânlara kaçışıyor. Sizin şemsiyeniz yok.`,
 choices:[
  {t:'Pankartı başımızın üstüne tutmak', s:'pankart şemsiye', st:'ze', req:c => c.has('pankart'), rq:'🪧 Pankart gerekli', fx:{uyum:1},
   ok:`"SENİ ÖZLEDİM" pankartının altında, omuz omuza yürüyorsunuz. Islanan tek şey pankartın "Ö" harfi. Yoldan geçenler fotoğraf çekiyor.`, go:EV_RET},
  {t:'Yağmurun altında dans etmek', s:'yağmurda dans', st:'ck', check:{dc:8}, fx:{uyum:1}, fxF:{kaos:1},
   ok:`Su birikintilerinde dönüp duruyorsunuz. Film sahnesi gibi. Balkondaki bir teyze alkışlıyor.`,
   fail:`İkinci dönüşte biriniz kayıyor, öbürü onu tutmaya çalışırken ikiniz birden su birikintisine oturuyorsunuz. Sırılsıklam ve kahkahalar içinde.`, go:EV_RET},
  {t:'En yakın kahvehaneye sığınmak', s:'kahvehaneye sığınmak', st:'sa', fx:{flag:{kehanet:1}},
   ok:`Kahvehanede dedeler size çay ısmarlıyor. Biri fincanınıza bakıp mırıldanıyor: "Gökyüzünde bir yolculuk görüyorum…" Yağmur dinince yola devam ediyorsunuz.`, go:EV_RET}
 ]},
ev_keci:{title:'Profesör Firarda (Yine)', art:'kasaba', sp:'anlatici', cond:c => c.has('profesor') && c.P.inv.some(i => i !== 'profesor'),
 text:c => `Bir anlık dalgınlık… Profesör çantanıza kafasını sokup <b>${ITEMS[c.P.inv.find(i => i !== 'profesor')].n}</b> eşyanızı ağzına alıyor ve dörtnala kaçıyor!`,
 choices:[
  {t:'Peşinden koşmak', s:'keçiyi kovalamak', st:'ce', check:{dc:9}, fxF:c => ({inv:['-' + c.P.inv.find(i => i !== 'profesor')]}),
   ok:`Üç sokak, iki bahçe ve bir çamaşır ipinden sonra Profesör'ü köşeye sıkıştırıyorsunuz. Eşyanız biraz salyalı ama sağlam.`,
   fail:`Profesör bir çitin üstünden atlayıp gözden kayboluyor. Yarım saat sonra elleri boş geri geliyor. Eşyanız gitti.`, go:EV_RET},
  {t:'Keçi Bakımı 101\'deki ıslığı çalmak', s:'keçi ıslığı', st:'ze', req:c => c.has('kitap'), rq:'📕 Keçi Bakımı 101 gerekli',
   ok:`Islığı duyan Profesör frene basıyor, geri dönüp eşyayı ayaklarınızın dibine bırakıyor ve özür diler gibi başını eğiyor.`, go:EV_RET},
  {t:'Gülüp bırakmak: "Ona lazımmış"', s:'gitsin varsın', st:'ck', fx:c => ({inv:['-' + c.P.inv.find(i => i !== 'profesor')], uyum:1}),
   ok:`İkiniz de gülmekten duramıyorsunuz. Profesör bir süre sonra elleri boş ve çok mutlu geri dönüyor. Eşyayı nereye sakladığını hiç öğrenemeyeceksiniz.`, go:EV_RET}
 ]},
ev_muzisyen:{title:'Gezgin Müzisyen', art:'kasaba', sp:'anlatici', cond:c => true,
 text:`Köşe başında saçı sakalı birbirine karışmış bir müzisyen bağlama çalıyor. Sizi görünce göz kırpıp romantik bir türküye geçiyor.`,
 choices:[
  {t:'Kol kola sallanmak', s:'sallanmak', st:'ck', fx:{uyum:1},
   ok:`Türkünün nakaratında kendinizi kaybediyorsunuz. Müzisyen son notada eğilip "Bu şarkı sizin" diyor.`, go:EV_RET},
  {t:'Bahşiş verip bir şarkı istemek', s:'şarkı istemek', st:'sa', fx:{npc:{ramazan:1}},
   ok:`Müzisyen istediğiniz şarkıyı çalıyor. Meğer Ramazan Abi'nin en sevdiği şarkıymış; taksisinden inip size katılıyor.`, go:EV_RET},
  {t:'Mikrofonu kapıp eşlik etmek', s:'eşlik etmek', st:'ce', check:{dc:9}, fx:{npc:{ramazan:1, gulizar:1}}, fxF:{kaos:1},
   ok:`Sesinizi duyan kasabalılar pencereleri açıyor. Bir anda sokak konserine dönüyor. Gülizar Hanım bile başını sallıyor.`,
   fail:`İlk notada sesiniz çatallanıyor. Bir köpek uluyarak size katılıyor. Müzisyen nazikçe mikrofonu geri alıyor.`, go:EV_RET}
 ]},
ev_yavru:{title:'Kayıp Yavru Kedi', art:'kasaba', sp:'anlatici', cond:c => true,
 text:`Bir duvarın dibinde minicik, tekir bir yavru kedi miyavlıyor. Boynundaki kurdelede "Paşa'nın oğlu" yazıyor.`,
 choices:[
  {t:'Yavruyu sahibine götürmek', s:'yavruyu götürmek', st:'ze', fx:{npc:{kediler:2}},
   ok:`Yavruyu Nadide Teyze'nin pansiyonuna götürüyorsunuz. Paşa sizi görünce ilk kez mırlıyor. 14 kedinin gözünde artık kahramansınız.`, go:EV_RET},
  {t:'Bir süre sevip oynamak', s:'yavruyla oynamak', st:'ck', fx:{uyum:1, npc:{kediler:1}},
   ok:`Yavru ikinizin arasında gidip geliyor ve sonunda ikinizin kucağına aynı anda oturmaya karar veriyor. Sonra kendisi evinin yolunu buluyor.`, go:EV_RET},
  {t:'Ona bir isim verip fotoğraf çekmek', s:'isim vermek', st:'sa', fx:{flag:{yavru:1}},
   ok:`Adını "Köfte Jr." koyuyorsunuz. Fotoğrafta yavru esniyor, siz gülüyorsunuz. Mükemmel bir kare.`, go:EV_RET}
 ]},
ev_cekilis:{title:'Şanslı Çekiliş', art:'festival', sp:'anlatici', cond:c => true,
 text:`Bir çocuk elinde kutuyla koşarak geliyor: "Okul yararına çekiliş! Bir bilet sadece 5 lira! Büyük ödül sürpriz!"`,
 choices:[
  {t:'İki bilet almak', s:'bilet almak', st:'sa', check:{dc:8}, fx:{inv:['+lokum']},
   ok:`Kazandınız! Büyük ödül: Lokumcu Hasan Usta'nın meşhur gül lokumu kutusu. Çocuk sizden çok seviniyor.`,
   fail:`Biletlerden biri boş, öbüründe "Bir dahakine" yazıyor. Ama okulun yeni kitaplıklarına katkıda bulundunuz.`, go:EV_RET},
  {t:'Bilet almadan bağış yapmak', s:'bağış', st:'ck', fx:{npc:{gulizar:1}},
   ok:`Çocuk sevinçle koşup kutuyu teslim ediyor. Uzaktan izleyen Gülizar Hanım sizi takdirle süzüyor: "Hayırlı gençler."`, go:EV_RET}
 ]},
ev_telefon:{title:'Aynı Anda Çalan Telefonlar', art:'kasaba', sp:'anlatici', cond:c => true,
 text:`İkinizin telefonu aynı anda çalıyor. Ekranlarda: <b>"Annem — görüntülü arama"</b>. İki aile de "Buluşma nasıl gidiyor?" diye merak etmiş.`,
 choices:[
  {t:'İkisini birden açıp tanıştırmak', s:'aileleri tanıştırmak', st:'ck', check:{dc:8}, fx:{uyum:1}, fxF:{kaos:1},
   ok:`İki ekran, iki anne, bir sürü "Aaa ne tatlısınız!" Anneler birbirlerinin numarasını istiyor. Bu iş büyüyor…`,
   fail:`İki ekranda iki anne aynı anda konuşuyor, görüntü donuyor, biri "Sesiniz gelmiyor" diyor. Uzak mesafe ilişkisinin özeti.`, go:EV_RET},
  {t:'"Sonra arayalım" mesajı atmak', s:'sonra aramak', st:'ze',
   ok:`İkiniz de aynı anda aynı mesajı yazıyorsunuz: "Çok iyiyiz, sonra ararız ❤️". Telefonları cebe atıp anın tadını çıkarıyorsunuz.`, go:EV_RET},
  {t:'Birlikte selfie çekip göndermek', s:'selfie', st:'sa', fx:{flag:{selfie:1}},
   ok:`Arka planda bir keçi, bir taksi ve bir simitçi. Fotoğraf iki aile grubunda da rekor beğeni alıyor.`, go:EV_RET}
 ]},
ev_tavuk:{title:'Kaçak Tavuklar', art:'kasaba', sp:'ramazan', cond:c => c.P.npc.ramazan !== undefined,
 text:`Yolun ortasında kanat çırpan bir tavuk sürüsü! Arkalarından Ramazan Abi nefes nefese koşuyor: <i>"Kardeşimin tavukları! Tutun şunları!"</i>`,
 choices:[
  {t:'Tavukları kovalamak', s:'tavuk kovalamak', st:'ce', check:{dc:9}, fx:{npc:{ramazan:2}}, fxF:{kaos:1},
   ok:`On iki tavuğun on ikisini de yakalıyorsunuz. Ramazan Abi duygulanıyor: "Siz benim ailemsiniz artık."`,
   fail:`Tavuklar sizi kovalıyor. Nasıl olduğunu kimse anlamıyor. Ramazan Abi gülmekten tavukları unutuyor.`, go:EV_RET},
  {t:'Profesör\'ü çoban olarak göndermek', s:'çoban Profesör', st:'sa', req:c => c.has('profesor'), rq:'🐐 Profesör yanınızda olmalı', fx:{npc:{ramazan:2}},
   ok:`Profesör tek bir "Meee" ile sürüyü sıraya diziyor ve kümese kadar götürüyor. Ramazan Abi ağzı açık bakıyor.`, go:EV_RET},
  {t:'Mısır serpip tavukları çağırmak', s:'mısır serpmek', st:'ze', fx:{npc:{ramazan:1}},
   ok:`Bir avuç mısır ve tavuklar kendiliğinden kümese yürüyor. Bazen en basit plan en iyisidir.`, go:EV_RET}
 ]},
ev_turist:{title:'Turist Çift', art:'kasaba', sp:'anlatici', cond:c => true,
 text:`Haritası elinde, kaybolmuş görünen yaşlı bir turist çift size yaklaşıyor: <i>"Pardon, burası Ortanokta mı, Ötenokta mı? Kırk yıldır evliyiz ve hâlâ yön konusunda anlaşamıyoruz."</i>`,
 choices:[
  {t:'Onlara kasabayı gezdirmek', s:'turistlere rehberlik', st:'ck', fx:{uyum:1},
   ok:`Bir saat boyunca kasabayı gezdiriyorsunuz. Giderken teyze kulağınıza fısıldıyor: "Kırk yıl sonra siz de böyle kaybolun inşallah."`, go:EV_RET},
  {t:'Sırlarını sormak', s:'evlilik sırrı', st:'ze', fx:{flag:{sir40:1}},
   ok:`Amca gülümsüyor: "Sır yok evladım. Kavga edince ilk kim gülerse o kazanır." Teyze ekliyor: "Hep ben kazanırım." Bu söz aklınızda kalıyor.`, go:EV_RET}
 ]}
};
const EVENT_IDS = Object.keys(EVENTS);
EVENT_IDS.forEach(id => { S[id] = Object.assign({ch:null, event:true}, EVENTS[id]); });
EVENT_IDS.forEach(id => { S[id].choices = S[id].choices; });
const EVENT_CHAPTERS = [1, 2, 3];
const EVENT_P = 0.13, EVENT_MAX = 3;

// =====================================================================
//  ROZETLER (albümdeki bütün oyunlara bakılarak hesaplanır)
// =====================================================================
const BADGES = {
  ilk:{i:'🎈', t:'İlk Macera', d:'İlk oyununuzu bitirin.', ok:(A) => A.length >= 1},
  uc:{i:'🧳', t:'Gezgin Çift', d:'3 oyun bitirin.', ok:(A) => A.length >= 3},
  on:{i:'🏆', t:'Ortanokta Müdavimi', d:'10 oyun bitirin.', ok:(A) => A.length >= 10},
  ruh:{i:'💞', t:'Ruh İkizi', d:'"Ruh İkizleri" sonunu bulun.', ok:(A) => A.some(g => g.ending === 'ruh')},
  kaosu:{i:'🌪️', t:'Kaos Kraliyeti', d:'"Efsanevi Kaos Ustaları" sonunu bulun.', ok:(A) => A.some(g => g.ending === 'kaos')},
  bilgin:{i:'🧠', t:'Ezber Çift', d:'Bir oyunda mini oyunlarda en az 11 eşleşme yapın.', ok:(A) => A.some(g => (g.mm || 0) >= 11)},
  kusursuz:{i:'🎯', t:'Kusursuz Tur', d:'Bir mini oyunu tek hata yapmadan bitirin.', ok:(A) => A.some(g => (g.perf || 0) > 0)},
  gorev1:{i:'🤫', t:'Gizli Ajan', d:'Gizli görevlerden birini başarın.', ok:(A) => A.some(g => g.mis && (g.mis.irem || g.mis.cengiz))},
  gorev2:{i:'🕵️', t:'Ajan İkilisi', d:'Aynı oyunda ikiniz de gizli görevinizi başarın.', ok:(A) => A.some(g => g.mis && g.mis.irem && g.mis.cengiz)},
  hapis:{i:'🔒', t:'Sabıkalı', d:'Ötenokta hapishanesine düşün.', ok:(A) => A.some(g => g.jailed)},
  balon:{i:'☁️', t:'Bulut Yolcusu', d:'Sıcak hava balonuna binin.', ok:(A) => A.some(g => g.rode)},
  keci:{i:'🐐', t:'Keçi Dostu', d:'Oyunu Profesör yanınızdayken bitirin.', ok:(A) => A.some(g => g.prof)},
  ikna:{i:'🤝', t:'Uzlaşma Ustası', d:'Bir oyunda 3 kez partnerinizin fikrine katılın.', ok:(A) => A.some(g => (g.ikna || 0) >= 3)},
  zar:{i:'🎲', t:'Kaderin Zarları', d:'Taş-kağıt-makasta 3 kez berabere kalıp kararı zara bırakın.', ok:(A) => A.some(g => g.zar)},
  kesif:{i:'🗺️', t:'Kâşif', d:'Kasabadaki 5 mekânın hepsini gezin (farklı oyunlarda olabilir).', ok:(A) => ['pazar','degirmen','gol','kahve','kutuphane'].every(v => A.some(g => (g.visits || []).includes(v)))},
  olay:{i:'⚡', t:'Sürprizlere Açık', d:'Bir oyunda 3 rastgele olayla karşılaşın.', ok:(A) => A.some(g => (g.evts || 0) >= 3)},
  yedi:{i:'📚', t:'Hikâye Avcısı', d:'7 farklı son bulun.', ok:(A, F) => F.length >= 7},
  hepsi:{i:'👑', t:'Ortanokta Efsanesi', d:'Bütün sonları bulun.', ok:(A, F) => ENDING_ORDER.every(k => F.includes(k))}
};
const BADGE_ORDER = Object.keys(BADGES);
function earnedBadges(album, found){ const A = album || [], F = found || []; return BADGE_ORDER.filter(k => { try { return BADGES[k].ok(A, F); } catch(e){ return false; } }); }

// Biten bir oyunun albüm kaydı
function albumEntry(P){
  const tr = p => { const e = P.log && P.log[0]; if (!e || e.scene !== 'karakter') return null; return S.karakter.choices[p === 'irem' ? e.i : e.c].t; };
  return {
    seed:P.seed, at:Date.now(), ending:P.ending, uyum:P.uyum, kaos:P.kaos, mm:P.mqMatch || 0, mt:P.mqTotal || 0,
    moves:P.log.length, ikna:P.ikna || 0, zar:P.log.some(e => e.m === 'zar'), perf:P.log.filter(e => e.mini && e.mm === e.mt).length,
    jailed:!!P.flags.jailed, rode:!!P.flags.rode, prof:P.inv.includes('profesor'), evts:P.evtCount || 0,
    visits:['pazar','degirmen','gol','kahve','kutuphane'].filter(v => P.flags['v_' + v]),
    mis:{irem:!!(MISSIONS[P.missions.irem] && MISSIONS[P.missions.irem].ok(P, 'irem')), cengiz:!!(MISSIONS[P.missions.cengiz] && MISSIONS[P.missions.cengiz].ok(P, 'cengiz'))},
    traits:{irem:tr('irem'), cengiz:tr('cengiz')}
  };
}

// =====================================================================
//  JOKERLER (kişi başı 2: biri başta, biri yolda kazanılır; gizli)
// =====================================================================
const JOKERS = {
  veto:{i:'🛑', n:'Veto', d:'Anlaşmazlıkta taş-kağıt-makasa gerek kalmadan senin kararın geçer. Kaos yine yazılır.', w:'Taş-kağıt-makas ekranında'},
  sans:{i:'🍀', n:'Şans tılsımı', d:'Seçtiğin işin yetenek kontrolüne +3 ekler. Senin kararın uygulanırsa harcanır.', w:'🎲 işaretli bir seçeneği seçip kilitlemeden önce'},
  maymun:{i:'🗝️', n:'Maymuncuk', d:'Kilitli bir seçeneği tek seferliğine senin için açar.', w:'Kilitli bir seçeneğe dokununca'},
  kehanet:{i:'🔮', n:'Kehanet', d:'O sahnedeki seçeneklerden hangisinin ileride işe yarayacak bir şey getirdiğini gösterir.', w:'Karar ekranında'},
  goz:{i:'👀', n:'Göz ucuyla', d:'Partnerin kararını verdiyse, sen kilitlemeden önce ne seçtiğini görürsün.', w:'Karar ekranında, partnerin oy verdikten sonra'},
  yari:{i:'✂️', n:'Yarı yarıya', d:'Mini oyunda tahmin ederken iki yanlış şıkkı eler.', w:'"Tahmin et" ya da "Çiz-bil" sorusunda tahminci sen olduğunda'}
};
const JOKER_IDS = Object.keys(JOKERS);

// =====================================================================
//  BİR YIL SONRA… (yolculuğa göre değişen epilog)
// =====================================================================
function epilogue(P){
  const f = k => !!P.flags[k], has = i => P.inv.includes(i), n = k => P.npc[k] || 0, out = [];
  // Profesör
  if (P.ending === 'keci') out.push('Profesör iki şehir arasında o kadar çok yolculuk yaptı ki otobüs firması ona "yılın yolcusu" plaketi verdi.');
  else if (has('profesor')) out.push('Profesör her ay ikinize de aynı anda bir kartpostal yolluyor. Nasıl yaptığını kimse bilmiyor; zarfların hepsi biraz ısırılmış.');
  else out.push('Profesör hâlâ Ortanokta kütüphanesinde "onursal müdür" ve her ziyaretçiye sizi soruyor.');
  // en yakın dost
  const best = Object.entries(P.npc).sort((a, b) => b[1] - a[1])[0];
  const DOST = {
    ramazan:'Ramazan Abi taksisinin arka camına ikinizin fotoğrafını yapıştırdı; her yolcuya hikâyenizi anlatıyor.',
    kediler:'Paşa her sabah pansiyonun penceresinde sizin geleceğiniz yolu gözlüyor. 14 kedi artık 19 oldu.',
    gulizar:'Gülizar Hanım bu yıl turşu yarışmasını yine kazandı ve kürsüde "Bu kupayı İrem ile Cengiz\'e adıyorum" dedi.',
    hayri:'Kaptan Hayri sonunda ehliyetini aldı ve balonunun adını "İrem & Cengiz" koydu.',
    necmi:'Fikriye ile Necmi kasabaya geri döndü; kulübeyi "aşıklar için misafirhane" yaptılar ve ilk rezervasyon sizin adınıza.',
    tahsin:'Başkan Tahsin her bayram size bir kutu fıstıklı lokum yolluyor. Kutunun üstünde "Casus olmadığınızı biliyordum" yazıyor.',
    sevket:'Balıkçı Şevket gölde tuttuğu en büyük balığa sizin adınızı verdi. Balık bu fikre pek sıcak bakmıyor.'
  };
  if (best && best[1] >= 2 && DOST[best[0]]) out.push(DOST[best[0]]);
  // yolculuktan izler
  if (has('altin') || f('sampiyon')) out.push('Altın Turşu Kupası, ikinizden birinin evinde başköşede duruyor; altı ayda bir kargoyla yer değiştiriyor.');
  else if (f('jailed')) out.push('Ötenokta hapishanesindeki hücreniz artık bir müze: kapısında "Burada iki âşık üç gün tavla oynadı" yazıyor.');
  else if (f('fenerDilek')) out.push('Fener Gecesi\'nde uçurduğunuz fener hiç geri gelmedi. İkiniz de dileğinizin yolda olduğuna inanıyorsunuz.');
  else if (f('yavru')) out.push('Köfte Jr. büyüdü ve kasabanın en tombul kedisi oldu.');
  else if (f('rode')) out.push('Balonla uçtuğunuz gün kasabanın kartpostallarına girdi; turistler hâlâ o kartpostalı alıyor.');
  if (f('sir40')) out.push('Turist çiftin sözü aklınızda: "Kavga edince ilk kim gülerse o kazanır." İkiniz de hep ilk gülmeye çalışıyorsunuz.');
  // ilişkinin hâli
  if (P.uyum >= 16) out.push('Telefonda konuşurken hâlâ aynı anda aynı cümleyi kuruyorsunuz. Artık şaşırmıyorsunuz bile.');
  else if (P.kaos >= 10) out.push('Hâlâ hiçbir konuda anlaşamıyorsunuz: film, yemek, keçi… Ama her tartışma bir kahkahayla bitiyor.');
  else out.push('Bazen anlaştınız, bazen taş-kağıt-makasla karar verdiniz. Ama en önemli konuda hep aynı fikirdeydiniz.');
  out.push('Ve bir sonraki buluşmanın tarihi takvimde çoktan işaretli. 💌');
  return out.join(' ');
}
