const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const db = require('./db');
const authMiddleware = require('./authMiddleware');

const {
  mailBaglantisiniKontrolEt,
  yeniTalepMailiGonder,
} = require('./mailService');

const app = express();

mailBaglantisiniKontrolEt();

app.use(
  cors({
    origin: 'http://localhost:8000',
  }),
);

app.use(express.json());

app.get('/api', (req, res) => {
  res.json({
    message: 'Help Desk API çalışıyor',
  });
});

/* =====================================================
   LOGIN
===================================================== */

app.post('/api/auth/login', async (req, res) => {
  const { kullaniciAdi, sifre } = req.body;

  if (!kullaniciAdi || !sifre) {
    return res.status(400).json({
      message: 'Kullanıcı adı ve şifre zorunludur.',
    });
  }

  try {
    const [kullanicilar] = await db.query(
      `
        SELECT
          k.id,
          k.kullanici_adi AS kullaniciAdi,
          k.ad,
          k.soyad,
          k.email,
          k.sifre,
          k.rol,
          k.departman_id AS departmanId,
          d.ad AS departman
        FROM kullanicilar k
        LEFT JOIN departmanlar d
          ON d.id = k.departman_id
        WHERE k.kullanici_adi = ?
          AND k.aktif = 1
        LIMIT 1
      `,
      [kullaniciAdi.trim()],
    );

    if (kullanicilar.length === 0) {
      return res.status(401).json({
        message: 'Kullanıcı adı veya şifre hatalı.',
      });
    }

    const kullanici = kullanicilar[0];

    const sifreDogruMu = await bcrypt.compare(
      sifre,
      kullanici.sifre,
    );

    if (!sifreDogruMu) {
      return res.status(401).json({
        message: 'Kullanıcı adı veya şifre hatalı.',
      });
    }

    const token = jwt.sign(
      {
        id: kullanici.id,
        kullaniciAdi: kullanici.kullaniciAdi,
        rol: kullanici.rol,
        departmanId: kullanici.departmanId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '8h',
      },
    );

    return res.json({
      message: 'Giriş başarılı.',
      token,
      kullanici: {
        id: kullanici.id,
        kullaniciAdi: kullanici.kullaniciAdi,
        ad: kullanici.ad,
        soyad: kullanici.soyad,
        email: kullanici.email,
        rol: kullanici.rol,
        departmanId: kullanici.departmanId,
        departman: kullanici.departman,
      },
    });
  } catch (error) {
    console.error('Giriş hatası:', error);

    return res.status(500).json({
      message:
        'Giriş işlemi sırasında bir hata meydana geldi.',
    });
  }
});

/* =====================================================
   GİRİŞ YAPAN KULLANICI
===================================================== */

app.get(
  '/api/auth/me',
  authMiddleware,
  async (req, res) => {
    try {
      const [kullanicilar] = await db.query(
        `
          SELECT
            k.id,
            k.kullanici_adi AS kullaniciAdi,
            k.ad,
            k.soyad,
            k.email,
            k.rol,
            k.departman_id AS departmanId,
            d.ad AS departman
          FROM kullanicilar k
          LEFT JOIN departmanlar d
            ON d.id = k.departman_id
          WHERE k.id = ?
            AND k.aktif = 1
          LIMIT 1
        `,
        [req.kullanici.id],
      );

      if (kullanicilar.length === 0) {
        return res.status(404).json({
          message: 'Kullanıcı bulunamadı.',
        });
      }

      return res.json(kullanicilar[0]);
    } catch (error) {
      console.error(
        'Kullanıcı bilgisi hatası:',
        error,
      );

      return res.status(500).json({
        message: 'Kullanıcı bilgileri alınamadı.',
      });
    }
  },
);

/* =====================================================
   MYSQL TEST
===================================================== */

app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT DATABASE() AS database_name',
    );

    return res.json({
      message: 'MySQL bağlantısı başarılı',
      database: rows[0].database_name,
    });
  } catch (error) {
    console.error(
      'MySQL bağlantı hatası:',
      error,
    );

    return res.status(500).json({
      message: 'MySQL bağlantı hatası',
    });
  }
});

/* =====================================================
   DEPARTMANLAR
===================================================== */

app.get(
  '/api/departmanlar',
  authMiddleware,
  async (req, res) => {
    try {
      const [departmanlar] = await db.query(
        `
          SELECT
            id,
            ad
          FROM departmanlar
          WHERE aktif = 1
          ORDER BY ad ASC
        `,
      );

      return res.json(departmanlar);
    } catch (error) {
      console.error(
        'Departmanlar alınamadı:',
        error,
      );

      return res.status(500).json({
        message: 'Departmanlar alınamadı.',
      });
    }
  },
);

/* =====================================================
   YENİ TALEP
===================================================== */

app.post(
  '/api/talepler',
  authMiddleware,
  async (req, res) => {
    const {
      baslik,
      aciklama,
      departmanId,
      oncelik,
    } = req.body;

    const gecerliOncelikler = [
      'dusuk',
      'orta',
      'yuksek',
      'kritik',
    ];

    if (
      !baslik ||
      !aciklama ||
      !departmanId ||
      !oncelik
    ) {
      return res.status(400).json({
        message:
          'Başlık, açıklama, departman ve öncelik alanları zorunludur.',
      });
    }

    if (baslik.trim().length < 5) {
      return res.status(400).json({
        message:
          'Talep başlığı en az 5 karakter olmalıdır.',
      });
    }

    if (aciklama.trim().length < 10) {
      return res.status(400).json({
        message:
          'Talep açıklaması en az 10 karakter olmalıdır.',
      });
    }

    if (
      !gecerliOncelikler.includes(oncelik)
    ) {
      return res.status(400).json({
        message: 'Geçersiz öncelik değeri.',
      });
    }

    let connection;
    let transactionTamamlandi = false;

    try {
      connection = await db.getConnection();

      await connection.beginTransaction();

      const [departmanSonucu] =
        await connection.query(
          `
            SELECT
              id,
              ad,
              email
            FROM departmanlar
            WHERE id = ?
              AND aktif = 1
            LIMIT 1
          `,
          [departmanId],
        );

      if (departmanSonucu.length === 0) {
        await connection.rollback();

        return res.status(400).json({
          message:
            'Seçilen departman bulunamadı veya aktif değil.',
        });
      }

      if (
        Number(departmanId) ===
        Number(req.kullanici.departmanId)
      ) {
        await connection.rollback();

        return res.status(400).json({
          message:
            'Kendi departmanınıza talep gönderemezsiniz.',
        });
      }

      const hedefDepartman =
        departmanSonucu[0];

      const geciciTicketNo =
        `TMP-${Date.now()}-${Math.floor(
          Math.random() * 100000,
        )}`;

      const [eklemeSonucu] =
        await connection.query(
          `
            INSERT INTO talepler (
              ticket_no,
              baslik,
              aciklama,
              departman_id,
              oncelik,
              durum,
              olusturan_kullanici_id
            )
            VALUES (
              ?,
              ?,
              ?,
              ?,
              ?,
              'bekliyor',
              ?
            )
          `,
          [
            geciciTicketNo,
            baslik.trim(),
            aciklama.trim(),
            Number(departmanId),
            oncelik,
            req.kullanici.id,
          ],
        );

      const yil = new Date().getFullYear();

      const ticketNo = `TK-${yil}-${String(
        eklemeSonucu.insertId,
      ).padStart(5, '0')}`;

      await connection.query(
        `
          UPDATE talepler
          SET ticket_no = ?
          WHERE id = ?
        `,
        [
          ticketNo,
          eklemeSonucu.insertId,
        ],
      );

      await connection.commit();

      transactionTamamlandi = true;

      const [yeniTalep] = await db.query(
        `
          SELECT
            t.id,
            t.ticket_no AS ticketNo,
            t.baslik,
            t.aciklama,
            t.oncelik,
            t.durum,
            t.olusturma_tarihi AS olusturmaTarihi,
            t.guncelleme_tarihi AS guncellemeTarihi,

            d.id AS departmanId,
            d.ad AS departman,

            k.id AS olusturanKullaniciId,
            k.kullanici_adi AS olusturanKullaniciAdi,
            CONCAT(
              k.ad,
              ' ',
              k.soyad
            ) AS olusturanKullanici

          FROM talepler t

          INNER JOIN departmanlar d
            ON d.id = t.departman_id

          LEFT JOIN kullanicilar k
            ON k.id =
              t.olusturan_kullanici_id

          WHERE t.id = ?

          LIMIT 1
        `,
        [eklemeSonucu.insertId],
      );

      const talep = yeniTalep[0];

      /*
       * MAIL BİLDİRİMİ
       *
       * Ticket MySQL'e kaydedildikten sonra
       * hedef departmanın mail adresine bildirim gönderilir.
       *
       * Mail gönderilemezse ticket silinmez.
       */

      try {
        await yeniTalepMailiGonder({
          alici: hedefDepartman.email,
          ticketNo: talep.ticketNo,
          baslik: talep.baslik,
          aciklama: talep.aciklama,
          oncelik: talep.oncelik,
          hedefDepartman:
            talep.departman,
          gonderen:
            talep.olusturanKullanici ||
            talep.olusturanKullaniciAdi ||
            req.kullanici.kullaniciAdi,
        });
      } catch (mailError) {
        console.error(
          'Talep oluşturuldu ancak mail gönderilemedi:',
          mailError,
        );
      }

      return res.status(201).json({
        message: 'Talep başarıyla oluşturuldu.',
        talep,
      });
    } catch (error) {
      if (
        connection &&
        !transactionTamamlandi
      ) {
        try {
          await connection.rollback();
        } catch (rollbackError) {
          console.error(
            'Transaction rollback hatası:',
            rollbackError,
          );
        }
      }

      console.error(
        'Talep oluşturma hatası:',
        error,
      );

      return res.status(500).json({
        message:
          'Talep oluşturulurken bir hata meydana geldi.',
      });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  },
);

/* =====================================================
   TALEPLERİ GETİR
===================================================== */

app.get(
  '/api/talepler',
  authMiddleware,
  async (req, res) => {
    try {
      const {
        durum,
        departmanId,
        oncelik,
        tip,
      } = req.query;

      const kosullar = [];
      const parametreler = [];

      if (
        req.kullanici.rol !== 'admin'
      ) {
        if (
          !req.kullanici.departmanId
        ) {
          return res.status(403).json({
            message:
              'Kullanıcının departman bilgisi bulunamadı.',
          });
        }

        if (tip === 'gelen') {
          kosullar.push(
            't.departman_id = ?',
          );

          parametreler.push(
            req.kullanici.departmanId,
          );
        } else if (
          tip === 'gonderilen'
        ) {
          kosullar.push(
            't.olusturan_kullanici_id = ?',
          );

          parametreler.push(
            req.kullanici.id,
          );
        } else {
          kosullar.push(
            `
              (
                t.departman_id = ?
                OR
                t.olusturan_kullanici_id = ?
              )
            `,
          );

          parametreler.push(
            req.kullanici.departmanId,
            req.kullanici.id,
          );
        }
      } else if (departmanId) {
        kosullar.push(
          't.departman_id = ?',
        );

        parametreler.push(
          Number(departmanId),
        );
      }

      if (durum) {
        kosullar.push(
          't.durum = ?',
        );

        parametreler.push(durum);
      }

      if (oncelik) {
        kosullar.push(
          't.oncelik = ?',
        );

        parametreler.push(oncelik);
      }

      const whereBolumu =
        kosullar.length > 0
          ? `WHERE ${kosullar.join(
              ' AND ',
            )}`
          : '';

      const [talepler] = await db.query(
        `
          SELECT
            t.id,
            t.ticket_no AS ticketNo,
            t.baslik,
            t.aciklama,
            t.oncelik,
            t.durum,
            t.olusturma_tarihi AS olusturmaTarihi,
            t.guncelleme_tarihi AS guncellemeTarihi,

            d.id AS departmanId,
            d.ad AS departman,

            k.id AS olusturanKullaniciId,
            k.kullanici_adi AS olusturanKullaniciAdi,
            CONCAT(
              k.ad,
              ' ',
              k.soyad
            ) AS olusturanKullanici

          FROM talepler t

          INNER JOIN departmanlar d
            ON d.id = t.departman_id

          LEFT JOIN kullanicilar k
            ON k.id =
              t.olusturan_kullanici_id

          ${whereBolumu}

          ORDER BY
            t.olusturma_tarihi DESC
        `,
        parametreler,
      );

      return res.json(talepler);
    } catch (error) {
      console.error(
        'Talepler alınamadı:',
        error,
      );

      return res.status(500).json({
        message: 'Talepler alınamadı.',
      });
    }
  },
);

/* =====================================================
   TALEP DURUMU GÜNCELLE
===================================================== */

/* =====================================================
   TALEP DURUMU GÜNCELLE
===================================================== */

app.patch(
  '/api/talepler/:id/durum',
  authMiddleware,
  async (req, res) => {
    const talepId = Number(req.params.id);
    const { durum } = req.body;

    const gecerliDurumlar = [
      'bekliyor',
      'islemde',
      'tamamlandi',
    ];

    const izinVerilenGecisler = {
      bekliyor: ['islemde'],
      islemde: ['bekliyor', 'tamamlandi'],
      tamamlandi: ['islemde'],
    };

    if (
      !Number.isInteger(talepId) ||
      talepId <= 0
    ) {
      return res.status(400).json({
        message: 'Geçersiz talep numarası.',
      });
    }

    if (!gecerliDurumlar.includes(durum)) {
      return res.status(400).json({
        message: 'Geçersiz talep durumu.',
      });
    }

    try {
      const [mevcutTalepler] = await db.query(
        `
          SELECT
            id,
            durum,
            departman_id AS departmanId
          FROM talepler
          WHERE id = ?
        `,
        [talepId],
      );

      if (mevcutTalepler.length === 0) {
        return res.status(404).json({
          message: 'Talep bulunamadı.',
        });
      }

      const mevcutTalep = mevcutTalepler[0];

      if (
        req.kullanici.rol !== 'admin' &&
        mevcutTalep.departmanId !==
          req.kullanici.departmanId
      ) {
        return res.status(403).json({
          message:
            'Bu talep üzerinde işlem yapma yetkiniz bulunmuyor.',
        });
      }

      if (
        mevcutTalep.durum !== durum &&
        !izinVerilenGecisler[
          mevcutTalep.durum
        ].includes(durum)
      ) {
        return res.status(400).json({
          message:
            'Bu durum geçişine izin verilmiyor.',
        });
      }

      await db.query(
        `
          UPDATE talepler
          SET durum = ?
          WHERE id = ?
        `,
        [durum, talepId],
      );

      const [guncellenenTalep] =
        await db.query(
          `
            SELECT
              t.id,
              t.ticket_no AS ticketNo,
              t.baslik,
              t.aciklama,
              t.oncelik,
              t.durum,
              t.olusturma_tarihi AS olusturmaTarihi,
              t.guncelleme_tarihi AS guncellemeTarihi,

              d.id AS departmanId,
              d.ad AS departman,

              k.id AS olusturanKullaniciId,
              k.kullanici_adi AS olusturanKullaniciAdi,
              CONCAT(
                k.ad,
                ' ',
                k.soyad
              ) AS olusturanKullanici

            FROM talepler t

            INNER JOIN departmanlar d
              ON d.id = t.departman_id

            LEFT JOIN kullanicilar k
              ON k.id = t.olusturan_kullanici_id

            WHERE t.id = ?
          `,
          [talepId],
        );

      return res.json({
        message:
          'Talep durumu başarıyla güncellendi.',
        talep: guncellenenTalep[0],
      });
    } catch (error) {
      console.error(
        'Talep durum güncelleme hatası:',
        error,
      );

      return res.status(500).json({
        message:
          'Talep durumu güncellenirken bir hata meydana geldi.',
      });
    }
  },
);

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Help Desk API http://localhost:${PORT} adresinde çalışıyor`,
  );
});