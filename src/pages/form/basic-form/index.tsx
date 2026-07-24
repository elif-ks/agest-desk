import { history } from '@umijs/max';
import {
  Button,
  Card,
  Alert,
  FileUpload,
  FormField,
  Grid,
  GridItem,
  Heading,
  Input,
  Modal,
  PageHeader,
  Select,
  Tag,
  Text,
  Textarea,
  ToastHost,
  toast,
} from '@/components/ui';
import {
  InfoCircleIcon,
  SendIcon,
  UploadIcon,
} from '@/components/ui/icons';
import type { FC } from 'react';
import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  apiRequest,
  getKullanici,
} from '@/services/helpDeskApi';

type Departman = {
  id: number;
  ad: string;
};

type Kullanici = {
  id: number;
  kullaniciAdi: string;
  ad: string;
  soyad: string;
  email: string;
  rol: string;
  departmanId: number | null;
  departman: string | null;
};

type TalepFormValues = {
  baslik: string;
  departmanId: number;
  oncelik:
    | 'dusuk'
    | 'orta'
    | 'yuksek'
    | 'kritik';
  aciklama: string;
  dosyalar?: File[];
};

type OlusturulanTalep = {
  id: number;
  ticketNo: string;
  baslik: string;
  aciklama: string;
  oncelik: string;
  durum: string;
  departmanId: number;
  departman: string;
  olusturmaTarihi: string;
};

type TalepResponse = {
  message: string;
  talep?: OlusturulanTalep;
};

type HizliKonu = {
  etiket: string;
  baslik: string;
  aciklama: string;
};

const hizliKonularByDepartman: Record<string, HizliKonu[]> = {
  it: [
    { etiket: 'Bilgisayar', baslik: 'Bilgisayar sorunu', aciklama: 'Sorunun yaşandığı bilgisayar:\nKarşılaşılan hata:\nSorun ne zamandır devam ediyor:\nDaha önce denenen işlemler:' },
    { etiket: 'Yazıcı', baslik: 'Yazıcı sorunu', aciklama: 'Yazıcının bulunduğu konum:\nYazıcının marka/modeli:\nKarşılaşılan hata:\nSorun ne zamandır devam ediyor:' },
    { etiket: 'Ağ / İnternet', baslik: 'Ağ veya internet sorunu', aciklama: 'Sorunun yaşandığı konum:\nBağlantı türü (kablolu/kablosuz):\nKarşılaşılan hata:\nSorun ne zamandır devam ediyor:' },
    { etiket: 'Yazılım', baslik: 'Program veya yazılım sorunu', aciklama: 'Programın adı:\nKarşılaşılan hata:\nYapılmak istenen işlem:\nSorun ne zamandır devam ediyor:' },
    { etiket: 'E-Posta', baslik: 'E-posta sorunu', aciklama: 'E-posta hesabı:\nKarşılaşılan hata:\nSorun gönderme mi alma mı:\nSorun ne zamandır devam ediyor:' },
    { etiket: 'Hesap / Şifre', baslik: 'Kullanıcı hesabı veya şifre sorunu', aciklama: 'İlgili kullanıcı hesabı:\nTalep türü (şifre sıfırlama/hesap açma/yetki):\nKarşılaşılan hata veya ihtiyaç:' },
    { etiket: 'Donanım', baslik: 'Donanım arızası', aciklama: 'Arızalı donanım:\nCihazın bulunduğu konum:\nArızanın açıklaması:\nSorun ne zamandır devam ediyor:' },
    { etiket: 'Diğer', baslik: '', aciklama: '' },
  ],
  muhasebe: [
    { etiket: 'Fatura', baslik: 'Fatura ile ilgili işlem talebi', aciklama: 'Fatura numarası:\nFirma/kurum adı:\nFatura tarihi:\nTalebin veya sorunun açıklaması:' },
    { etiket: 'Ödeme', baslik: 'Ödeme işlemi talebi', aciklama: 'Ödeme yapılacak kişi/firma:\nTutar:\nSon ödeme tarihi:\nÖdeme açıklaması:' },
    { etiket: 'Maaş', baslik: 'Maaş ile ilgili talep', aciklama: 'İlgili dönem:\nTalebin veya sorunun açıklaması:\nVarsa eksik ya da hatalı görünen bilgi:' },
    { etiket: 'Avans', baslik: 'Avans talebi', aciklama: 'Talep edilen avans tutarı:\nAvans nedeni:\nİstenen tarih:\nEk açıklama:' },
    { etiket: 'Masraf', baslik: 'Masraf bildirimi', aciklama: 'Masraf türü:\nMasraf tarihi:\nTutar:\nMasrafın açıklaması:\nBelge/fatura ektedir:' },
    { etiket: 'Cari Hesap', baslik: 'Cari hesap ile ilgili talep', aciklama: 'İlgili firma/kişi:\nCari hesap numarası (varsa):\nTalebin veya sorunun açıklaması:' },
    { etiket: 'Diğer', baslik: '', aciklama: '' },
  ],
  'insan kaynaklari': [
    { etiket: 'İzin', baslik: 'İzin talebi', aciklama: 'İzin türü:\nİzin başlangıç tarihi:\nİzin bitiş tarihi:\nİzin nedeni:' },
    { etiket: 'Personel Bilgisi', baslik: 'Personel bilgilerinin güncellenmesi', aciklama: 'Güncellenecek bilgi:\nMevcut bilgi:\nYeni bilgi:\nDeğişiklik nedeni:' },
    { etiket: 'İşe Giriş', baslik: 'İşe giriş işlemi talebi', aciklama: 'Personelin adı soyadı:\nGörevi:\nDepartmanı:\nİşe başlangıç tarihi:\nGerekli ek açıklamalar:' },
    { etiket: 'İşten Ayrılış', baslik: 'İşten ayrılış işlemi talebi', aciklama: 'Personelin adı soyadı:\nDepartmanı:\nSon çalışma tarihi:\nAyrılış nedeni:\nGerekli ek açıklamalar:' },
    { etiket: 'Eğitim', baslik: 'Personel eğitim talebi', aciklama: 'Talep edilen eğitimin adı:\nEğitimin amacı:\nKatılacak personel:\nTercih edilen tarih:' },
    { etiket: 'Sağlık Raporu', baslik: 'Sağlık raporu bildirimi', aciklama: 'Rapor başlangıç tarihi:\nRapor bitiş tarihi:\nRaporun açıklaması:\nRapor belgesi ektedir:' },
    { etiket: 'Diğer', baslik: '', aciklama: '' },
  ],
  depo: [
    { etiket: 'Malzeme', baslik: 'Malzeme talebi', aciklama: 'Talep edilen malzeme:\nMiktar:\nKullanım amacı:\nİstenen teslim tarihi:' },
    { etiket: 'Stok', baslik: 'Stok kontrol talebi', aciklama: 'Kontrol edilecek ürün/malzeme:\nÜrün kodu (varsa):\nTalep edilen kontrolün açıklaması:' },
    { etiket: 'Ürün Girişi', baslik: 'Ürün giriş işlemi', aciklama: 'Ürünün adı:\nÜrün kodu:\nMiktar:\nTeslim eden firma/kişi:\nGiriş tarihi:' },
    { etiket: 'Ürün Çıkışı', baslik: 'Ürün çıkış işlemi', aciklama: 'Ürünün adı:\nÜrün kodu:\nMiktar:\nTeslim edilecek kişi/departman:\nÇıkış nedeni:' },
    { etiket: 'Ofis Ekipmanı', baslik: 'Ofis ekipmanı talebi', aciklama: 'Talep edilen ekipman:\nMiktar:\nKullanacak kişi/departman:\nTalep nedeni:' },
    { etiket: 'Sarf Malzeme', baslik: 'Sarf malzeme talebi', aciklama: 'Talep edilen sarf malzemesi:\nMiktar:\nKullanacak kişi/departman:\nİstenen teslim tarihi:' },
    { etiket: 'Diğer', baslik: '', aciklama: '' },
  ],
};

const departmanAdiniDuzenle = (departmanAdi: string) => {
  return departmanAdi
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim();
};

/*
const LegacyBasicForm: FC = () => {
  const kullanici =
    getKullanici() as Kullanici | null;

  const [form] =
    LegacyForm.useForm<TalepFormValues>();

  const secilenDepartmanId = Form.useWatch(
    'departmanId',
    form,
  );

  const [departmanlar, setDepartmanlar] =
    useState<Departman[]>([]);

  const [
    departmanlarYukleniyor,
    setDepartmanlarYukleniyor,
  ] = useState<boolean>(true);

  const [
    talepOlusturuluyor,
    setTalepOlusturuluyor,
  ] = useState<boolean>(false);

  const [
    basariModalAcik,
    setBasariModalAcik,
  ] = useState<boolean>(false);

  const [
    olusturulanTalep,
    setOlusturulanTalep,
  ] = useState<OlusturulanTalep>();

  const [
    seciliHizliKonu,
    setSeciliHizliKonu,
  ] = useState<string>();
  const [dosyaListesi, setDosyaListesi] = useState<UploadFile[]>([]);

  useEffect(() => {
    const departmanlariGetir = async () => {
      try {
        const data =
          await apiRequest<Departman[]>(
            '/departmanlar',
          );

        setDepartmanlar(data);
      } catch (error) {
        console.error(
          'Departman yükleme hatası:',
          error,
        );

        message.error(
          'Departman listesi yüklenemedi. Backend bağlantısını kontrol edin.',
        );
      } finally {
        setDepartmanlarYukleniyor(false);
      }
    };

    departmanlariGetir();
  }, []);

  const secilebilirDepartmanlar =
    useMemo(() => {
      return departmanlar.filter(
        (departman) =>
          departman.id !==
          kullanici?.departmanId,
      );
    }, [
      departmanlar,
      kullanici?.departmanId,
    ]);

  const secilenDepartman = useMemo(() => {
    return departmanlar.find(
      (departman) =>
        departman.id ===
        Number(secilenDepartmanId),
    );
  }, [departmanlar, secilenDepartmanId]);

  const secilenDepartmanKonulari = useMemo(() => {
    if (!secilenDepartman) {
      return [];
    }

    const anahtar = departmanAdiniDuzenle(
      secilenDepartman.ad,
    );

    return (
      hizliKonularByDepartman[anahtar] || [
        {
          etiket: 'Genel Talep',
          baslik: 'Genel işlem talebi',
          aciklama:
            'Talebinizi ayrıntılı şekilde açıklayınız:',
        },
        { etiket: 'Diğer', baslik: '', aciklama: '' },
      ]
    );
  }, [secilenDepartman]);

  useEffect(() => {
    setSeciliHizliKonu(undefined);
    form.setFieldValue('baslik', '');
    form.setFieldValue('aciklama', '');
  }, [secilenDepartmanId, form]);

  const hizliKonuSec = (
    konu: HizliKonu,
  ) => {
    setSeciliHizliKonu(konu.etiket);

    form.setFieldsValue({
      baslik: konu.baslik,
      aciklama: konu.aciklama,
    });

    if (konu.etiket === 'Diğer') {
      form.focusField('baslik');
    }
  };

  const formuTemizle = () => {
  form.resetFields();

  form.setFieldValue(
    'oncelik',
    'orta',
  );

  setSeciliHizliKonu(undefined);
  setDosyaListesi([]);
};

  const yeniTalepOlustur = () => {
    setBasariModalAcik(false);
    setOlusturulanTalep(undefined);

    formuTemizle();
  };

  const gonderilenTaleplereGit = () => {
    setBasariModalAcik(false);

    history.push(
      '/talepler/gonderilen',
    );
  };

  const onFinish = async (
  values: TalepFormValues,
) => {
  setTalepOlusturuluyor(true);

  try {
    const formData = new FormData();

    formData.append(
      'baslik',
      values.baslik,
    );

    formData.append(
      'departmanId',
      String(values.departmanId),
    );

    formData.append(
      'oncelik',
      values.oncelik,
    );

    formData.append(
      'aciklama',
      values.aciklama,
    );

    dosyaListesi.forEach((dosya) => {
      if (dosya.originFileObj) {
        formData.append(
          'dosyalar',
          dosya.originFileObj,
        );
      }
    });

    const data =
      await apiRequest<TalepResponse>(
        '/talepler',
        {
          method: 'POST',
          body: formData,
        },
      );

    if (!data.talep) {
      message.success(data.message);

      formuTemizle();

      return true;
    }

    setOlusturulanTalep(data.talep);

    formuTemizle();

    setBasariModalAcik(true);

    return true;
  } catch (error) {
    console.error(
      'Talep oluşturma hatası:',
      error,
    );

    if (error instanceof Error) {
      message.error(error.message);
    } else {
      message.error(
        'Talep oluşturulurken beklenmeyen bir hata oluştu.',
      );
    }

    return false;
  } finally {
    setTalepOlusturuluyor(false);
  }
};

  return (
    <>
      <LegacyPage
        title="Yeni Talep Oluştur"
        content="İlgili departmana yeni bir destek veya işlem talebi oluşturabilirsiniz."
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} xl={17}>
            <Card variant="borderless">
              <div
                style={{
                  marginBottom: 24,
                }}
              >
                <Title
                  level={4}
                  style={{
                    marginBottom: 4,
                  }}
                >
                  Talep Bilgileri
                </Title>

                <Text type="secondary">
                  Talebinizin daha hızlı
                  çözülebilmesi için bilgileri
                  detaylı şekilde doldurun.
                </Text>
              </div>

              <LegacyForm<TalepFormValues>
                form={form}
                name="ticket-create"
                layout="vertical"
                onFinish={onFinish}
                onReset={() => {
                  setSeciliHizliKonu(undefined);
                  setDosyaListesi([]);
                }}
                submitter={{
                  searchConfig: {
                    submitText:
                      'Talebi Oluştur',
                    resetText:
                      'Formu Temizle',
                  },
                  submitButtonProps: {
                    icon: <SendOutlined />,
                    loading:
                      talepOlusturuluyor,
                    disabled:
                      talepOlusturuluyor ||
                      secilebilirDepartmanlar.length ===
                        0,
                  },
                  resetButtonProps: {
                    disabled:
                      talepOlusturuluyor,
                  },
                }}
                initialValues={{
                  oncelik: 'orta',
                }}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <LegacyFormSelect
                      name="departmanId"
                      label="Gönderilecek Departman"
                      placeholder="Departman seçiniz"
                      disabled={
                        departmanlarYukleniyor ||
                        secilebilirDepartmanlar.length ===
                          0
                      }
                      options={secilebilirDepartmanlar.map(
                        (departman) => ({
                          label: departman.ad,
                          value: departman.id,
                        }),
                      )}
                      rules={[
                        {
                          required: true,
                          message:
                            'Departman seçiniz.',
                        },
                      ]}
                      fieldProps={{
                        loading:
                          departmanlarYukleniyor,
                        showSearch: true,
                        optionFilterProp:
                          'label',
                        notFoundContent:
                          departmanlarYukleniyor
                            ? 'Departmanlar yükleniyor...'
                            : 'Gönderilebilecek aktif departman bulunamadı.',
                      }}
                    />
                  </Col>

                  <Col xs={24} md={12}>
                    <LegacyFormSelect
                      name="oncelik"
                      label="Öncelik"
                      placeholder="Öncelik seçiniz"
                      options={[
                        {
                          label: 'Düşük',
                          value: 'dusuk',
                        },
                        {
                          label: 'Orta',
                          value: 'orta',
                        },
                        {
                          label: 'Yüksek',
                          value: 'yuksek',
                        },
                        {
                          label: 'Kritik',
                          value: 'kritik',
                        },
                      ]}
                      rules={[
                        {
                          required: true,
                          message:
                            'Öncelik seçiniz.',
                        },
                      ]}
                    />
                  </Col>
                </Row>

                <div
                  style={{
                    marginBottom: 20,
                  }}
                >
                  <Text
                    strong
                    style={{
                      display: 'block',
                      marginBottom: 10,
                    }}
                  >
                    Hızlı Konu Seç
                  </Text>

                  {!secilenDepartman ? (
                    <Alert
                      type="info"
                      showIcon
                      message="Önce gönderilecek departmanı seçiniz"
                      description="Departmanı seçtiğinizde o departmana ait hızlı konu önerileri burada gösterilecektir."
                    />
                  ) : (
                    <>
                      <Text
                        type="secondary"
                        style={{
                          display: 'block',
                          marginBottom: 12,
                        }}
                      >
                        {secilenDepartman.ad} departmanına ait hızlı konu seçenekleri:
                      </Text>

                      <Space wrap>
                        {secilenDepartmanKonulari.map((konu) => (
                          <Button
                            key={konu.etiket}
                            type={
                              seciliHizliKonu === konu.etiket
                                ? 'primary'
                                : 'default'
                            }
                            onClick={() => hizliKonuSec(konu)}
                          >
                            {konu.etiket}
                          </Button>
                        ))}
                      </Space>
                    </>
                  )}
                </div>

                <LegacyFormText
                  name="baslik"
                  label="Talep Başlığı"
                  placeholder="Örn: Bilgisayar açılmıyor"
                  fieldProps={{
                    onChange: () => {
                      if (
                        seciliHizliKonu
                      ) {
                        setSeciliHizliKonu(
                          undefined,
                        );
                      }
                    },
                  }}
                  rules={[
                    {
                      required: true,
                      message:
                        'Talep başlığını giriniz.',
                    },
                    {
                      min: 5,
                      message:
                        'Başlık en az 5 karakter olmalıdır.',
                    },
                  ]}
                />

                <LegacyFormTextArea
                  name="aciklama"
                  label="Talep Açıklaması"
                  placeholder="Yaşadığınız problemi veya talebinizi detaylı şekilde açıklayın..."
                  fieldProps={{
                    rows: 8,
                    showCount: true,
                    maxLength: 1500,
                  }}
                  rules={[
                    {
                      required: true,
                      message:
                        'Talep açıklamasını giriniz.',
                    },
                    {
                      min: 10,
                      message:
                        'Açıklama en az 10 karakter olmalıdır.',
                    },
                  ]}
                />

                <div
                  style={{
                    marginBottom: 24,
                  }}
                >
                  <Text
                    strong
                    style={{
                      display: 'block',
                      marginBottom: 8,
                    }}
                  >
                    Dosya veya Ekran Görüntüsü
                  </Text>

                  <Upload.Dragger
  name="dosyalar"
  multiple
  fileList={dosyaListesi}
  beforeUpload={() => false}
  maxCount={5}
  accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt"
  onChange={({ fileList }) => {
    const gecerliDosyalar =
      fileList.slice(0, 5);

    setDosyaListesi(
      gecerliDosyalar,
    );
  }}
  onRemove={(dosya) => {
    setDosyaListesi(
      (mevcutDosyalar) =>
        mevcutDosyalar.filter(
          (mevcutDosya) =>
            mevcutDosya.uid !==
            dosya.uid,
        ),
    );

    return true;
  }}
>
                    <p className="legacy-upload-drag-icon">
                      <CloudUploadOutlined />
                    </p>

                    <p className="legacy-upload-text">
                      Dosyanızı buraya
                      sürükleyin veya seçmek
                      için tıklayın
                    </p>

                    <p className="legacy-upload-hint">
                      Ekran görüntüsü veya
                      ilgili belge
                      ekleyebilirsiniz.
                    </p>
                  </Upload.Dragger>
                </div>
              </LegacyForm>
            </Card>
          </Col>

          <Col xs={24} xl={7}>
            <Card variant="borderless">
              <Title level={4}>
                Talep Oluştururken
              </Title>

              <Alert
                type="info"
                showIcon
                icon={
                  <InfoCircleOutlined />
                }
                message="Doğru departmanı seçin"
                description="Talebiniz seçtiğiniz departmanın görev ekranına gönderilecektir."
                style={{
                  marginBottom: 16,
                }}
              />

              <Text type="secondary">
                {kullanici?.departman
                  ? `Kendi departmanınız olan ${kullanici.departman} seçim listesinde gösterilmez.`
                  : 'Kendi departmanınıza talep gönderemezsiniz.'}
              </Text>
            </Card>
          </Col>
        </Row>
      </LegacyPage>

      <Modal
        open={basariModalAcik}
        centered
        closable={false}
        maskClosable={false}
        footer={null}
        width={520}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '20px 8px 8px',
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background:
                'rgba(82, 196, 26, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: 34,
            }}
          >
            ✓
          </div>

          <Title
            level={3}
            style={{
              marginBottom: 8,
            }}
          >
            Talebiniz Oluşturuldu
          </Title>

          <Text type="secondary">
            Talebiniz ilgili departmana
            başarıyla gönderildi.
          </Text>

          {olusturulanTalep && (
            <Card
              size="small"
              style={{
                marginTop: 24,
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  gap: 16,
                  marginBottom: 12,
                }}
              >
                <Text type="secondary">
                  Ticket No
                </Text>

                <Text
                  strong
                  copyable
                >
                  {
                    olusturulanTalep.ticketNo
                  }
                </Text>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  gap: 16,
                  marginBottom: 12,
                }}
              >
                <Text type="secondary">
                  Hedef Departman
                </Text>

                <Text strong>
                  {
                    olusturulanTalep.departman
                  }
                </Text>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <Text type="secondary">
                  Durum
                </Text>

                <Tag color="gold">
                  Bekliyor
                </Tag>
              </div>
            </Card>
          )}

          <Space
            wrap
            style={{
              marginTop: 24,
              justifyContent: 'center',
            }}
          >
            <Button
              onClick={yeniTalepOlustur}
            >
              Yeni Talep Oluştur
            </Button>

            <Button
              type="primary"
              onClick={
                gonderilenTaleplereGit
              }
            >
              Gönderdiğim Talepleri Gör
            </Button>
          </Space>
        </div>
      </Modal>
    </>
  );
};
*/

const initialValues: TalepFormValues = {
  baslik: '',
  departmanId: 0,
  oncelik: 'orta',
  aciklama: '',
  dosyalar: [],
};

const BasicForm: FC = () => {
  const kullanici = getKullanici() as Kullanici | null;
  const baslikRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState<TalepFormValues>(initialValues);
  const [departmanlar, setDepartmanlar] = useState<Departman[]>([]);
  const [departmanlarYukleniyor, setDepartmanlarYukleniyor] = useState(true);
  const [talepOlusturuluyor, setTalepOlusturuluyor] = useState(false);
  const [basariModalAcik, setBasariModalAcik] = useState(false);
  const [olusturulanTalep, setOlusturulanTalep] =
    useState<OlusturulanTalep>();
  const [seciliHizliKonu, setSeciliHizliKonu] = useState<string>();

  useEffect(() => {
    const departmanlariGetir = async () => {
      try {
        setDepartmanlar(await apiRequest<Departman[]>('/departmanlar'));
      } catch (error) {
        console.error('Departman yükleme hatası:', error);
        toast.error(
          'Departman listesi yüklenemedi. Backend bağlantısını kontrol edin.',
        );
      } finally {
        setDepartmanlarYukleniyor(false);
      }
    };
    void departmanlariGetir();
  }, []);

  const secilebilirDepartmanlar = useMemo(
    () =>
      departmanlar.filter(
        (departman) => departman.id !== kullanici?.departmanId,
      ),
    [departmanlar, kullanici?.departmanId],
  );

  const secilenDepartman = useMemo(
    () =>
      departmanlar.find(
        (departman) => departman.id === Number(values.departmanId),
      ),
    [departmanlar, values.departmanId],
  );

  const secilenDepartmanKonulari = useMemo(() => {
    if (!secilenDepartman) return [];
    const anahtar = departmanAdiniDuzenle(secilenDepartman.ad);
    return (
      hizliKonularByDepartman[anahtar] || [
        {
          etiket: 'Genel Talep',
          baslik: 'Genel işlem talebi',
          aciklama: 'Talebinizi ayrıntılı şekilde açıklayınız:',
        },
        { etiket: 'Diğer', baslik: '', aciklama: '' },
      ]
    );
  }, [secilenDepartman]);

  const formuTemizle = () => {
    setValues({ ...initialValues, dosyalar: [] });
    setSeciliHizliKonu(undefined);
  };

  const departmanDegistir = (departmanId: number) => {
    setValues((current) => ({
      ...current,
      departmanId,
      baslik: '',
      aciklama: '',
    }));
    setSeciliHizliKonu(undefined);
  };

  const hizliKonuSec = (konu: HizliKonu) => {
    setSeciliHizliKonu(konu.etiket);
    setValues((current) => ({
      ...current,
      baslik: konu.baslik,
      aciklama: konu.aciklama,
    }));
    if (konu.etiket === 'Diğer') {
      requestAnimationFrame(() => baslikRef.current?.focus());
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (talepOlusturuluyor) return;

    setTalepOlusturuluyor(true);
    try {
      const formData = new FormData();
      formData.append('baslik', values.baslik);
      formData.append('departmanId', String(values.departmanId));
      formData.append('oncelik', values.oncelik);
      formData.append('aciklama', values.aciklama);
      values.dosyalar?.forEach((dosya) =>
        formData.append('dosyalar', dosya),
      );

      const data = await apiRequest<TalepResponse>('/talepler', {
        method: 'POST',
        body: formData,
      });

      if (!data.talep) {
        toast.success(data.message);
        formuTemizle();
        return;
      }

      setOlusturulanTalep(data.talep);
      formuTemizle();
      setBasariModalAcik(true);
    } catch (error) {
      console.error('Talep oluşturma hatası:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Talep oluşturulurken beklenmeyen bir hata oluştu.',
      );
    } finally {
      setTalepOlusturuluyor(false);
    }
  };

  return (
    <>
      <ToastHost />
      <PageHeader
        title="Yeni Talep Oluştur"
        description="İlgili departmana yeni bir destek veya işlem talebi oluşturabilirsiniz."
      />

      <Grid gap={24} className="ui-ticket-create-layout">
        <GridItem>
          <Card>
            <div style={{ marginBottom: 24 }}>
              <Heading level={4} style={{ marginBottom: 4 }}>
                Talep Bilgileri
              </Heading>
              <Text secondary>
                Talebinizin daha hızlı çözülebilmesi için bilgileri detaylı
                şekilde doldurun.
              </Text>
            </div>

            <form name="ticket-create" onSubmit={onSubmit} onReset={formuTemizle}>
              <div className="ui-ticket-create-fields">
                <FormField
                  label="Gönderilecek Departman"
                  htmlFor="departmanId"
                  required
                >
                  <Select
                    id="departmanId"
                    value={values.departmanId || ''}
                    disabled={
                      departmanlarYukleniyor ||
                      secilebilirDepartmanlar.length === 0
                    }
                    required
                    requiredMessage="Departman seçiniz."
                    onChange={(event) =>
                      departmanDegistir(Number(event.target.value))
                    }
                    options={[
                      {
                        label: departmanlarYukleniyor
                          ? 'Departmanlar yükleniyor...'
                          : 'Departman seçiniz',
                        value: '',
                        disabled: true,
                      },
                      ...secilebilirDepartmanlar.map((departman) => ({
                        label: departman.ad,
                        value: departman.id,
                      })),
                    ]}
                  />
                </FormField>

                <FormField label="Öncelik" htmlFor="oncelik" required>
                  <Select
                    id="oncelik"
                    value={values.oncelik}
                    required
                    requiredMessage="Öncelik seçiniz."
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        oncelik: event.target.value as TalepFormValues['oncelik'],
                      }))
                    }
                    options={[
                      { label: 'Düşük', value: 'dusuk' },
                      { label: 'Orta', value: 'orta' },
                      { label: 'Yüksek', value: 'yuksek' },
                      { label: 'Kritik', value: 'kritik' },
                    ]}
                  />
                </FormField>
              </div>

              <div style={{ marginBottom: 20 }}>
                <Text strong style={{ display: 'block', marginBottom: 10 }}>
                  Hızlı Konu Seç
                </Text>
                {!secilenDepartman ? (
                  <Alert
                    type="info"
                    title="Önce gönderilecek departmanı seçiniz"
                  >
                    <div>
                      Departmanı seçtiğinizde o departmana ait hızlı konu
                      önerileri burada gösterilecektir.
                    </div>
                  </Alert>
                ) : (
                  <>
                    <Text
                      secondary
                      style={{ display: 'block', marginBottom: 12 }}
                    >
                      {secilenDepartman.ad} departmanına ait hızlı konu
                      seçenekleri:
                    </Text>
                    <div className="ui-inline">
                      {secilenDepartmanKonulari.map((konu) => (
                        <Button
                          key={konu.etiket}
                          variant={
                            seciliHizliKonu === konu.etiket
                              ? 'primary'
                              : 'default'
                          }
                          onClick={() => hizliKonuSec(konu)}
                        >
                          {konu.etiket}
                        </Button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <FormField label="Talep Başlığı" htmlFor="baslik" required>
                <Input
                  ref={baslikRef}
                  id="baslik"
                  value={values.baslik}
                  placeholder="Örn: Bilgisayar açılmıyor"
                  required
                  minLength={5}
                  requiredMessage="Talep başlığını giriniz."
                  minLengthMessage="Başlık en az 5 karakter olmalıdır."
                  onChange={(event) => {
                    setValues((current) => ({
                      ...current,
                      baslik: event.target.value,
                    }));
                    setSeciliHizliKonu(undefined);
                  }}
                />
              </FormField>

              <FormField label="Talep Açıklaması" htmlFor="aciklama" required>
                <Textarea
                  id="aciklama"
                  value={values.aciklama}
                  placeholder="Yaşadığınız problemi veya talebinizi detaylı şekilde açıklayın..."
                  rows={8}
                  required
                  minLength={10}
                  maxLength={1500}
                  onInvalid={(event) => {
                    const field = event.currentTarget;
                    field.setCustomValidity(
                      field.validity.valueMissing
                        ? 'Talep açıklamasını giriniz.'
                        : 'Açıklama en az 10 karakter olmalıdır.',
                    );
                  }}
                  onInput={(event) => event.currentTarget.setCustomValidity('')}
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      aciklama: event.target.value,
                    }))
                  }
                />
                <Text secondary className="ui-character-count">
                  {values.aciklama.length} / 1500
                </Text>
              </FormField>

              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Dosya veya Ekran Görüntüsü
              </Text>
              <FileUpload
                files={values.dosyalar ?? []}
                onChange={(dosyalar) =>
                  setValues((current) => ({ ...current, dosyalar }))
                }
                multiple
                maxCount={5}
                disabled={talepOlusturuluyor}
                accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                icon={<UploadIcon />}
                hint="Ekran görüntüsü veya ilgili belge ekleyebilirsiniz."
              />

              <div className="ui-ticket-create-actions">
                <Button
                  type="reset"
                  disabled={talepOlusturuluyor}
                >
                  Formu Temizle
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  icon={<SendIcon />}
                  loading={talepOlusturuluyor}
                  disabled={
                    talepOlusturuluyor ||
                    secilebilirDepartmanlar.length === 0
                  }
                >
                  Talebi Oluştur
                </Button>
              </div>
            </form>
          </Card>
        </GridItem>

        <GridItem>
          <Card>
            <Heading level={4}>Talep Oluştururken</Heading>
            <Alert type="info" title="Doğru departmanı seçin">
              <div className="ui-alert-content">
                <InfoCircleIcon />
                <span>
                  Talebiniz seçtiğiniz departmanın görev ekranına
                  gönderilecektir.
                </span>
              </div>
            </Alert>
            <Text secondary style={{ display: 'block', marginTop: 16 }}>
              {kullanici?.departman
                ? `Kendi departmanınız olan ${kullanici.departman} seçim listesinde gösterilmez.`
                : 'Kendi departmanınıza talep gönderemezsiniz.'}
            </Text>
          </Card>
        </GridItem>
      </Grid>

      <Modal
        open={basariModalAcik}
        onClose={() => undefined}
        closeOnOverlay={false}
        closable={false}
        width={520}
      >
        <div className="ui-ticket-success">
          <div className="ui-ticket-success__icon">✓</div>
          <Heading level={3} style={{ marginBottom: 8 }}>
            Talebiniz Oluşturuldu
          </Heading>
          <Text secondary>
            Talebiniz ilgili departmana başarıyla gönderildi.
          </Text>

          {olusturulanTalep && (
            <Card className="ui-ticket-success__card">
              <div className="ui-ticket-success__row">
                <Text secondary>Ticket No</Text>
                <Text strong copyable>{olusturulanTalep.ticketNo}</Text>
              </div>
              <div className="ui-ticket-success__row">
                <Text secondary>Hedef Departman</Text>
                <Text strong>{olusturulanTalep.departman}</Text>
              </div>
              <div className="ui-ticket-success__row">
                <Text secondary>Durum</Text>
                <Tag tone="gold">Bekliyor</Tag>
              </div>
            </Card>
          )}

          <div className="ui-ticket-success__actions">
            <Button
              onClick={() => {
                setBasariModalAcik(false);
                setOlusturulanTalep(undefined);
                formuTemizle();
              }}
            >
              Yeni Talep Oluştur
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setBasariModalAcik(false);
                history.push('/talepler/gonderilen');
              }}
            >
              Gönderdiğim Talepleri Gör
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BasicForm;
