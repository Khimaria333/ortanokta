// =====================================================================
//  ORTANOKTA MACERASI · MİNİ OYUN SORU HAVUZU
//  tahmin: biri kendisi için cevaplar, diğeri tahmin eder (t: 2. tekil, g: 3. tekil)
//  kim:    ikiniz de "İrem" ya da "Cengiz" dersiniz
//  ayni:   ikinize aynı soru, aynı cevabı verirseniz puan
// =====================================================================
const QB = {
tahmin:[
  {id:'t1', t:'Sabah ilk iş ne yaparsın?', g:'sabah ilk iş ne yapar?', o:['Telefona bakarım','Kahve ya da çay','5 dakika daha uyurum','Hemen duşa girerim']},
  {id:'t2', t:'Sinirlenince ne yaparsın?', g:'sinirlenince ne yapar?', o:['Susarım','Söylenirim','Bir şeyler yerim','Beş dakikada unuturum']},
  {id:'t3', t:'Sınırsız paran olsa ilk ne alırsın?', g:'sınırsız parası olsa ilk ne alır?', o:['Bir ev','Bir araba','Dünya turu bileti','Bir kedi ya da köpek']},
  {id:'t4', t:'En sevdiğin mevsim hangisi?', g:'en sevdiği mevsim hangisi?', o:['İlkbahar','Yaz','Sonbahar','Kış']},
  {id:'t5', t:'Pizzaya ananas?', g:'pizzaya ananas konusunda ne düşünür?', o:['Kesinlikle evet','Asla!','Sessiz kalırım','Hiç denemedim']},
  {id:'t6', t:'Dünyanın son günü son yemeğin ne olur?', g:'dünyanın son günü son yemeği ne olur?', o:['Mantı','Pizza','Annemin yemeği','Kocaman bir tatlı']},
  {id:'t7', t:'Korku filmi izlerken sen…', g:'korku filmi izlerken ne yapar?', o:['Gözümü kapatırım','Gülerim','Sürekli yorum yaparım','Uyuyakalırım']},
  {id:'t8', t:'Bir süper gücün olsa hangisi olurdu?', g:'bir süper gücü olsa hangisini seçer?', o:['Işınlanmak','Zihin okumak','Görünmezlik','Zamanı durdurmak']},
  {id:'t9', t:'Tatilde en çok ne yapmayı seversin?', g:'tatilde en çok ne yapmayı sever?', o:['Denize girmek','Şehir gezmek','Yeni yemekler denemek','Hiçbir şey yapmamak']},
  {id:'t10', t:'Kendini hangi hayvana benzetirsin?', g:'kendini hangi hayvana benzetir?', o:['Kedi','Köpek','Panda','Keçi 🐐']},
  {id:'t11', t:'Mesajlarda en çok kullandığın emoji?', g:'mesajlarda en çok hangi emojiyi kullanır?', o:['😂','❤️','🥺','🙄']},
  {id:'t12', t:'Bir partide sen…', g:'bir partide genelde ne yapar?', o:['Dans pistindeyim','Yemek masasındayım','Köşede sohbetteyim','Erkenden eve dönerim']},
  {id:'t13', t:'Hayalindeki ev nerede?', g:'hayalindeki ev nerede?', o:['Deniz kenarında','Ormanın içinde','Büyük bir şehirde','Küçük bir kasabada']},
  {id:'t14', t:'Gece 3\'te acıksan ne yaparsın?', g:'gece 3\'te acıksa ne yapar?', o:['Buzdolabını yağmalarım','Kuru ekmek bile olur','Aç uyurum','Sipariş veririm']},
  {id:'t15', t:'Bir filmde oynasan hangi türde olurdu?', g:'bir filmde oynasa hangi türde olurdu?', o:['Romantik komedi','Aksiyon','Korku','Animasyon']},
  {id:'t16', t:'Yolunu kaybedince ne yaparsın?', g:'yolunu kaybedince ne yapar?', o:['Haritaya bakarım','Birine sorarım','Rastgele yürürüm','Panik yaparım']},
  {id:'t17', t:'Seni en çok ne güldürür?', g:'en çok neye güler?', o:['Saçma videolar','Kendi esprilerim','Birinin sendelemesi','Hayvanlar']},
  {id:'t18', t:'Hangi hediyeyi tercih edersin?', g:'hangi hediyeyi tercih eder?', o:['Sürpriz bir deneyim','El yapımı bir şey','Çiçek','İşe yarar bir şey']},
  {id:'t19', t:'Uzun bir günün sonunda en çok neye ihtiyaç duyarsın?', g:'uzun bir günün sonunda en çok neye ihtiyaç duyar?', o:['Uzun bir sohbet','Sıcak bir duş','Güzel bir yemek','Biraz sessizlik']},
  {id:'t20', t:'En kötü huyun hangisi?', g:'sence kendi en kötü huyu hangisi?', o:['Geç kalmak','İnatçılık','Dağınıklık','Fazla düşünmek']},
  {id:'t21', t:'Bir konserde nerede durursun?', g:'bir konserde nerede durur?', o:['En önde, bağırarak','Ortada, dans ederek','Arkada, izleyerek','Hiç gitmem']},
  {id:'t22', t:'Tatlı mı, tuzlu mu?', g:'tatlıcı mı, tuzlucu mu?', o:['Tatlı','Tuzlu','İkisi birden','Turşu 🥒']},
  {id:'t23', t:'Bir günlüğüne başka bir meslekte olsan?', g:'bir günlüğüne hangi meslekte olmak isterdi?', o:['Pilot','Aşçı','Dedektif','Hayvan bakıcısı']},
  {id:'t24', t:'Telefonun şarjı %1 olsa son mesajını kime atarsın?', g:'telefonunun şarjı %1 olsa son mesajı kime atar?', o:['Sevgilime','Aileme','Arkadaş grubuna','Kimseye, sessizce kapanır']}
],
kim:[
  {id:'k1', t:'Kim daha çok geç kalır?'},
  {id:'k2', t:'Tartışmayı ilk kim bitirir?'},
  {id:'k3', t:'Görüntülü konuşmada "Sesin gitti" diyen kim olur?'},
  {id:'k4', t:'Kim daha kıskançtır?'},
  {id:'k5', t:'Kim daha çok fotoğraf çeker?'},
  {id:'k6', t:'Bir zombi kıyametinde kim daha uzun hayatta kalır?'},
  {id:'k7', t:'Kim önce "Özledim" yazar?'},
  {id:'k8', t:'Kim daha iyi yemek yapar?'},
  {id:'k9', t:'Kim daha çok uyur?'},
  {id:'k10', t:'Kim daha romantiktir?'},
  {id:'k11', t:'Kim daha çok para harcar?'},
  {id:'k12', t:'Haritayı ters tutan kim olur?'},
  {id:'k13', t:'Kim filmin sonunu önceden tahmin eder?'},
  {id:'k14', t:'Bir keçiyle kim daha iyi anlaşır? 🐐'},
  {id:'k15', t:'Kim daha inatçıdır?'},
  {id:'k16', t:'Film izlerken kim daha çok ağlar?'},
  {id:'k17', t:'Kim daha iyi dans eder?'},
  {id:'k18', t:'"5 dakikaya hazırım" deyip 30 dakika hazırlanan kim?'},
  {id:'k19', t:'Gece kim daha geç yatar?'},
  {id:'k20', t:'Mesajlara kim daha hızlı cevap verir?'}
],
ayni:[
  {id:'a1', t:'İlk tatilimiz nerede olsun?', o:['Deniz kenarı','Dağ evi','Yurt dışında bir şehir','Kamp']},
  {id:'a2', t:'Birlikte bir evcil hayvan alsak?', o:['Kedi','Köpek','Keçi 🐐','Şimdilik hiç']},
  {id:'a3', t:'Mükemmel bir akşam nasıl olur?', o:['Film ve battaniye','Dışarıda yemek','Uzun bir yürüyüş','Oyun gecesi']},
  {id:'a4', t:'Yeniden buluştuğumuzda ilk ne yapalım?', o:['Uzun uzun sarılmak','Bir şeyler yemek','Şehri gezmek','Sadece yan yana durmak']},
  {id:'a5', t:'Bir sonraki buluşmada kim kime gelsin?', o:['İrem, Cengiz\'e','Cengiz, İrem\'e','Ortada buluşalım','Sürpriz olsun']},
  {id:'a6', t:'Ortak bir şarkımız olsa türü ne olurdu?', o:['Pop','Rock','Türkü','Arabesk']},
  {id:'a7', t:'Birlikte bir iş kursak ne olurdu?', o:['Kafe','Turşucu 🥒','Seyahat kanalı','Oyun şirketi']},
  {id:'a8', t:'Dünyayı birlikte gezsek ilk durak?', o:['İtalya','Japonya','Kapadokya','İzlanda']},
  {id:'a9', t:'Evimizin en önemli eşyası?', o:['Kocaman bir kanepe','İyi bir mutfak','Geniş bir balkon','Dev bir yatak']},
  {id:'a10', t:'İlişkimizi bir film türüyle anlatsak?', o:['Romantik komedi','Macera','Dram','Tam bir kaos komedisi']},
  {id:'a11', t:'Hafta sonu sabahı nasıl geçsin?', o:['Geç kalkıp kahvaltı','Erkenden doğa yürüyüşü','Yatakta dizi','Pazar yeri gezmek']},
  {id:'a12', t:'Uzak mesafede en çok neyi özlüyoruz?', o:['Sarılmayı','Birlikte yemek yemeyi','Yan yana sessizce oturmayı','Birlikte gülmeyi']},
  {id:'a13', t:'Bir küslükten sonra barışmanın en iyi yolu?', o:['Hemen konuşmak','Biraz beklemek','Yemek ısmarlamak','Komik bir mesaj']},
  {id:'a14', t:'Bir gün düğünümüz olsa nasıl olurdu?', o:['Kocaman ve gürültülü','Küçük ve samimi','Sahilde','Kaçıp evlenirdik']},
  {id:'a15', t:'Süper kahraman ikilisi olsak ortak gücümüz?', o:['Işınlanmak','Zihin okumak','Zamanı durdurmak','Keçilerle konuşmak 🐐']},
  {id:'a16', t:'Bu maceradaki en sevdiğin karakter?', o:['Ramazan Abi','Profesör 🐐','Gülizar Hanım','Paşa 🐈']}
]};
const QBY = {}; Object.values(QB).forEach(list => list.forEach(q => { QBY[q.id] = q; }));
const KIM_OPTS = ['🌸 İrem','🌊 Cengiz'];
function qOptions(q, kind){ return kind === 'kim' ? KIM_OPTS : q.o; }
