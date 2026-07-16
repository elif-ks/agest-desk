import {
  CloudUploadOutlined,
  InfoCircleOutlined,
  SendOutlined,
} from '@ant-design/icons';
import {
  PageContainer,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { history } from '@umijs/max';
import {
  Alert,
  Button,
  Card,
  Col,
  Modal,
  Row,
  Space,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import type { FC } from 'react';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  apiRequest,
  getKullanici,
} from '@/services/helpDeskApi';

const { Text, Title } = Typography;

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
};

const hizliKonular: HizliKonu[] = [
  {
    etiket: 'Bilgisayar',
    baslik: 'Bilgisayar sorunu',
  },
  {
    etiket: 'Yazıcı',
    baslik: 'Yazıcı sorunu',
  },
  {
    etiket: 'Ağ / İnternet',
    baslik: 'Ağ veya internet sorunu',
  },
  {
    etiket: 'Yazılım',
    baslik: 'Program veya yazılım sorunu',
  },
  {
    etiket: 'Hesap / Şifre',
    baslik: 'Kullanıcı hesabı veya şifre sorunu',
  },
  {
    etiket: 'Diğer',
    baslik: '',
  },
];

const BasicForm: FC = () => {
  const kullanici =
    getKullanici() as Kullanici | null;

  const [form] =
    ProForm.useForm<TalepFormValues>();

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

  const hizliKonuSec = (
    konu: HizliKonu,
  ) => {
    setSeciliHizliKonu(konu.etiket);

    form.setFieldValue(
      'baslik',
      konu.baslik,
    );

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
      const data =
        await apiRequest<TalepResponse>(
          '/talepler',
          {
            method: 'POST',
            body: JSON.stringify(values),
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
      <PageContainer
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

              <ProForm<TalepFormValues>
                form={form}
                name="ticket-create"
                layout="vertical"
                onFinish={onFinish}
                onReset={() => {
                  setSeciliHizliKonu(
                    undefined,
                  );
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

                  <Text
                    type="secondary"
                    style={{
                      display: 'block',
                      marginBottom: 12,
                    }}
                  >
                    Sık karşılaşılan bir konu
                    seçebilir veya başlığı
                    kendiniz yazabilirsiniz.
                  </Text>

                  <Space wrap>
                    {hizliKonular.map(
                      (konu) => (
                        <Button
                          key={konu.etiket}
                          type={
                            seciliHizliKonu ===
                            konu.etiket
                              ? 'primary'
                              : 'default'
                          }
                          onClick={() =>
                            hizliKonuSec(konu)
                          }
                        >
                          {konu.etiket}
                        </Button>
                      ),
                    )}
                  </Space>
                </div>

                <ProFormText
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

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <ProFormSelect
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
                    <ProFormSelect
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

                <ProFormTextArea
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
                    name="dosya"
                    multiple
                    beforeUpload={() => false}
                  >
                    <p className="ant-upload-drag-icon">
                      <CloudUploadOutlined />
                    </p>

                    <p className="ant-upload-text">
                      Dosyanızı buraya
                      sürükleyin veya seçmek
                      için tıklayın
                    </p>

                    <p className="ant-upload-hint">
                      Ekran görüntüsü veya
                      ilgili belge
                      ekleyebilirsiniz.
                    </p>
                  </Upload.Dragger>
                </div>
              </ProForm>
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
      </PageContainer>

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

export default BasicForm;