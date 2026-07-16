const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

const mailBaglantisiniKontrolEt = async () => {
  try {
    await transporter.verify();

    console.log(
      'Mail servisi bağlantısı başarılı.',
    );
  } catch (error) {
    console.error(
      'Mail servisi bağlantı hatası:',
      error,
    );
  }
};

const yeniTalepMailiGonder = async ({
  alici,
  ticketNo,
  baslik,
  aciklama,
  oncelik,
  hedefDepartman,
  gonderen,
}) => {
  if (!alici) {
    console.log(
      `${ticketNo} için departman mail adresi bulunamadı.`,
    );

    return;
  }

  const oncelikMetinleri = {
    dusuk: 'Düşük',
    orta: 'Orta',
    yuksek: 'Yüksek',
    kritik: 'Kritik',
  };

  await transporter.sendMail({
    from: `"Help Desk" <${process.env.MAIL_USER}>`,
    to: alici,
    subject: `[${ticketNo}] Yeni Talep - ${baslik}`,
    text: `
Yeni bir Help Desk talebi oluşturuldu.

Ticket No: ${ticketNo}
Hedef Departman: ${hedefDepartman}
Gönderen: ${gonderen}
Öncelik: ${oncelikMetinleri[oncelik] || oncelik}

Başlık:
${baslik}

Açıklama:
${aciklama}
    `.trim(),
    html: `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 640px;
          margin: 0 auto;
          color: #1f1f1f;
        "
      >
        <div
          style="
            background: #1677ff;
            color: white;
            padding: 24px;
            border-radius: 12px 12px 0 0;
          "
        >
          <h2 style="margin: 0;">
            Yeni Help Desk Talebi
          </h2>
        </div>

        <div
          style="
            padding: 24px;
            border: 1px solid #e5e7eb;
            border-top: 0;
            border-radius: 0 0 12px 12px;
          "
        >
          <p>
            Departmanınıza yeni bir talep gönderildi.
          </p>

          <table
            style="
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            "
          >
            <tr>
              <td style="padding: 8px; font-weight: bold;">
                Ticket No
              </td>
              <td style="padding: 8px;">
                ${ticketNo}
              </td>
            </tr>

            <tr>
              <td style="padding: 8px; font-weight: bold;">
                Hedef Departman
              </td>
              <td style="padding: 8px;">
                ${hedefDepartman}
              </td>
            </tr>

            <tr>
              <td style="padding: 8px; font-weight: bold;">
                Gönderen
              </td>
              <td style="padding: 8px;">
                ${gonderen}
              </td>
            </tr>

            <tr>
              <td style="padding: 8px; font-weight: bold;">
                Öncelik
              </td>
              <td style="padding: 8px;">
                ${oncelikMetinleri[oncelik] || oncelik}
              </td>
            </tr>
          </table>

          <h3>${baslik}</h3>

          <p
            style="
              line-height: 1.6;
              white-space: pre-line;
            "
          >
            ${aciklama}
          </p>

          <p
            style="
              margin-top: 24px;
              color: #6b7280;
              font-size: 13px;
            "
          >
            Help Desk sistemi tarafından otomatik gönderilmiştir.
          </p>
        </div>
      </div>
    `,
  });

  console.log(
    `${ticketNo} mail bildirimi gönderildi → ${alici}`,
  );
};

module.exports = {
  mailBaglantisiniKontrolEt,
  yeniTalepMailiGonder,
};