const bcrypt = require('bcryptjs');
const db = require('./db');

const kullanicilar = [
  {
    kullaniciAdi: '01EK34',
    ad: 'Elif',
    soyad: 'IT Kullanıcısı',
    email: 'elif.it@helpdesk.local',
    sifre: '123456',
    rol: 'departman_yetkilisi',
    departmanAdi: 'IT',
  },
  {
    kullaniciAdi: '02EK23',
    ad: 'İK',
    soyad: 'Kullanıcısı',
    email: 'ik@helpdesk.local',
    sifre: '123456',
    rol: 'departman_yetkilisi',
    departmanAdi: 'İnsan Kaynakları',
  },
  {
    kullaniciAdi: '03EK12',
    ad: 'Depo',
    soyad: 'Kullanıcısı',
    email: 'depo@helpdesk.local',
    sifre: '123456',
    rol: 'departman_yetkilisi',
    departmanAdi: 'Depo',
  },
  {
    kullaniciAdi: '04EK56',
    ad: 'Muhasebe',
    soyad: 'Kullanıcısı',
    email: 'muhasebe@helpdesk.local',
    sifre: '123456',
    rol: 'departman_yetkilisi',
    departmanAdi: 'Muhasebe',
  },
];

const kullanicilariOlustur = async () => {
  try {
    for (const kullanici of kullanicilar) {
      const [departmanlar] = await db.query(
        `
          SELECT id
          FROM departmanlar
          WHERE ad = ?
            AND aktif = 1
          LIMIT 1
        `,
        [kullanici.departmanAdi],
      );

      if (departmanlar.length === 0) {
        throw new Error(
          `${kullanici.departmanAdi} departmanı bulunamadı veya aktif değil.`,
        );
      }

      const departmanId = departmanlar[0].id;

      const [mevcutKullanicilar] = await db.query(
        `
          SELECT id
          FROM kullanicilar
          WHERE kullanici_adi = ?
          LIMIT 1
        `,
        [kullanici.kullaniciAdi],
      );

      const sifreHash = await bcrypt.hash(
        kullanici.sifre,
        12,
      );

      if (mevcutKullanicilar.length > 0) {
        await db.query(
          `
            UPDATE kullanicilar
            SET
              ad = ?,
              soyad = ?,
              email = ?,
              sifre = ?,
              rol = ?,
              departman_id = ?,
              aktif = 1
            WHERE kullanici_adi = ?
          `,
          [
            kullanici.ad,
            kullanici.soyad,
            kullanici.email,
            sifreHash,
            kullanici.rol,
            departmanId,
            kullanici.kullaniciAdi,
          ],
        );

        console.log(
          `${kullanici.kullaniciAdi} güncellendi → ${kullanici.departmanAdi}`,
        );
      } else {
        await db.query(
          `
            INSERT INTO kullanicilar (
              kullanici_adi,
              ad,
              soyad,
              email,
              sifre,
              rol,
              departman_id,
              aktif
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
          `,
          [
            kullanici.kullaniciAdi,
            kullanici.ad,
            kullanici.soyad,
            kullanici.email,
            sifreHash,
            kullanici.rol,
            departmanId,
          ],
        );

        console.log(
          `${kullanici.kullaniciAdi} oluşturuldu → ${kullanici.departmanAdi}`,
        );
      }
    }

    console.log('Örnek kullanıcılar hazır.');
    console.log('Tüm test şifreleri: 123456');

    process.exit(0);
  } catch (error) {
    console.error(
      'Kullanıcı oluşturma hatası:',
      error,
    );

    process.exit(1);
  }
};

kullanicilariOlustur();