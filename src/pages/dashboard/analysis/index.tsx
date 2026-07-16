import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  InboxOutlined,
  SendOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { GridContent } from '@ant-design/pro-components';
import { history } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Empty,
  Progress,
  Row,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';

import {
  apiRequest,
  getKullanici,
} from '@/services/helpDeskApi';

const { Title, Text } = Typography;

type TicketStatus =
  | 'bekliyor'
  | 'islemde'
  | 'tamamlandi';

type TicketPriority =
  | 'dusuk'
  | 'orta'
  | 'yuksek'
  | 'kritik';

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

type TicketType = {
  id: number;
  ticketNo: string;
  baslik: string;
  departmanId: number;
  departman: string;
  oncelik: TicketPriority;
  durum: TicketStatus;
  aciklama: string;
  olusturmaTarihi: string;
  guncellemeTarihi: string;
  olusturanKullaniciId?: number;
  olusturanKullaniciAdi?: string;
  olusturanKullanici?: string;
};

const oncelikMetni: Record<TicketPriority, string> = {
  dusuk: 'Düşük',
  orta: 'Orta',
  yuksek: 'Yüksek',
  kritik: 'Kritik',
};

const durumMetni: Record<TicketStatus, string> = {
  bekliyor: 'Bekliyor',
  islemde: 'İşlemde',
  tamamlandi: 'Tamamlandı',
};

const rolMetni: Record<string, string> = {
  personel: 'Personel',
  departman_yetkilisi: 'Departman Yetkilisi',
  admin: 'Sistem Yöneticisi',
};

const oncelikRengi = (
  oncelik: TicketPriority,
) => {
  if (oncelik === 'dusuk') {
    return 'green';
  }

  if (oncelik === 'orta') {
    return 'gold';
  }

  if (oncelik === 'yuksek') {
    return 'orange';
  }

  return 'red';
};

const durumRengi = (
  durum: TicketStatus,
) => {
  if (durum === 'bekliyor') {
    return 'gold';
  }

  if (durum === 'islemde') {
    return 'blue';
  }

  return 'green';
};

const tarihFormatla = (
  tarih: string,
) => {
  if (!tarih) {
    return '-';
  }

  return new Date(tarih).toLocaleString(
    'tr-TR',
  );
};

const Analysis = () => {
  const kullanici =
    getKullanici() as Kullanici | null;

  const [gelenTalepler, setGelenTalepler] =
    useState<TicketType[]>([]);

  const [
    gonderilenTalepler,
    setGonderilenTalepler,
  ] = useState<TicketType[]>([]);

  const [yukleniyor, setYukleniyor] =
    useState<boolean>(true);

  useEffect(() => {
    const dashboardVerileriniGetir =
      async () => {
        setYukleniyor(true);

        try {
          const [
            gelenData,
            gonderilenData,
          ] = await Promise.all([
            apiRequest<TicketType[]>(
              '/talepler?tip=gelen',
            ),
            apiRequest<TicketType[]>(
              '/talepler?tip=gonderilen',
            ),
          ]);

          setGelenTalepler(gelenData);
          setGonderilenTalepler(
            gonderilenData,
          );
        } catch (error) {
          console.error(
            'Dashboard veri hatası:',
            error,
          );

          if (error instanceof Error) {
            message.error(error.message);
          } else {
            message.error(
              'Dashboard verileri yüklenemedi.',
            );
          }
        } finally {
          setYukleniyor(false);
        }
      };

    dashboardVerileriniGetir();
  }, []);

  const bekleyenTalep = gelenTalepler.filter(
    (talep) =>
      talep.durum === 'bekliyor',
  ).length;

  const islemdeTalep = gelenTalepler.filter(
    (talep) =>
      talep.durum === 'islemde',
  ).length;

  const tamamlananTalep =
    gelenTalepler.filter(
      (talep) =>
        talep.durum === 'tamamlandi',
    ).length;

  const toplamGorunen =
    gelenTalepler.length +
    gonderilenTalepler.length;

  const tamamlanmaOrani =
    gelenTalepler.length === 0
      ? 0
      : Math.round(
          (tamamlananTalep /
            gelenTalepler.length) *
            100,
        );

  const sonGelenTalepler = useMemo(() => {
    return [...gelenTalepler]
      .sort(
        (a, b) =>
          new Date(
            b.olusturmaTarihi,
          ).getTime() -
          new Date(
            a.olusturmaTarihi,
          ).getTime(),
      )
      .slice(0, 5);
  }, [gelenTalepler]);

  const sonGonderilenTalepler =
    useMemo(() => {
      return [...gonderilenTalepler]
        .sort(
          (a, b) =>
            new Date(
              b.olusturmaTarihi,
            ).getTime() -
            new Date(
              a.olusturmaTarihi,
            ).getTime(),
        )
        .slice(0, 5);
    }, [gonderilenTalepler]);

  const gelenColumns: ColumnsType<TicketType> =
    [
      {
        title: 'Ticket No',
        dataIndex: 'ticketNo',
        key: 'ticketNo',
        width: 150,
        render: (
          ticketNo: string,
        ) => (
          <Text
            strong
            copyable
          >
            {ticketNo}
          </Text>
        ),
      },
      {
        title: 'Talep Başlığı',
        dataIndex: 'baslik',
        key: 'baslik',
        ellipsis: true,
      },
      {
        title: 'Gönderen',
        dataIndex:
          'olusturanKullanici',
        key: 'olusturanKullanici',
        render: (
          _: unknown,
          record: TicketType,
        ) =>
          record.olusturanKullanici ||
          record.olusturanKullaniciAdi ||
          '-',
      },
      {
        title: 'Öncelik',
        dataIndex: 'oncelik',
        key: 'oncelik',
        width: 120,
        render: (
          oncelik: TicketPriority,
        ) => (
          <Tag
            color={oncelikRengi(
              oncelik,
            )}
          >
            {oncelikMetni[oncelik]}
          </Tag>
        ),
      },
      {
        title: 'Durum',
        dataIndex: 'durum',
        key: 'durum',
        width: 130,
        render: (
          durum: TicketStatus,
        ) => (
          <Tag color={durumRengi(durum)}>
            {durumMetni[durum]}
          </Tag>
        ),
      },
      {
        title: 'Tarih',
        dataIndex: 'olusturmaTarihi',
        key: 'olusturmaTarihi',
        width: 180,
        render: (
          tarih: string,
        ) =>
          tarihFormatla(tarih),
      },
    ];

  const gonderilenColumns: ColumnsType<TicketType> =
    [
      {
        title: 'Ticket No',
        dataIndex: 'ticketNo',
        key: 'ticketNo',
        width: 150,
        render: (
          ticketNo: string,
        ) => (
          <Text
            strong
            copyable
          >
            {ticketNo}
          </Text>
        ),
      },
      {
        title: 'Talep Başlığı',
        dataIndex: 'baslik',
        key: 'baslik',
        ellipsis: true,
      },
      {
        title: 'Hedef Departman',
        dataIndex: 'departman',
        key: 'departman',
        width: 180,
      },
      {
        title: 'Öncelik',
        dataIndex: 'oncelik',
        key: 'oncelik',
        width: 120,
        render: (
          oncelik: TicketPriority,
        ) => (
          <Tag
            color={oncelikRengi(
              oncelik,
            )}
          >
            {oncelikMetni[oncelik]}
          </Tag>
        ),
      },
      {
        title: 'Durum',
        dataIndex: 'durum',
        key: 'durum',
        width: 130,
        render: (
          durum: TicketStatus,
        ) => (
          <Tag color={durumRengi(durum)}>
            {durumMetni[durum]}
          </Tag>
        ),
      },
      {
        title: 'Tarih',
        dataIndex: 'olusturmaTarihi',
        key: 'olusturmaTarihi',
        width: 180,
        render: (
          tarih: string,
        ) =>
          tarihFormatla(tarih),
      },
    ];

  const istatistikKartlari = [
    {
      key: 'gelen',
      title: 'Bana Gelen',
      value: gelenTalepler.length,
      icon: <InboxOutlined />,
      description:
        'Departmanınıza gönderilen talepler',
      onClick: () =>
        history.push(
          '/talepler/gelen',
        ),
    },
    {
      key: 'gonderilen',
      title: 'Gönderdiklerim',
      value: gonderilenTalepler.length,
      icon: <SendOutlined />,
      description:
        'Diğer departmanlara gönderilenler',
      onClick: () =>
        history.push(
          '/talepler/gonderilen',
        ),
    },
    {
      key: 'bekleyen',
      title: 'Bekleyen',
      value: bekleyenTalep,
      icon: <ClockCircleOutlined />,
      description:
        'Henüz işleme alınmayan talepler',
      onClick: () =>
        history.push(
          '/talepler/bekleyen',
        ),
    },
    {
      key: 'islemde',
      title: 'İşlemde',
      value: islemdeTalep,
      icon: <SyncOutlined spin />,
      description:
        'Üzerinde çalışılan talepler',
      onClick: () =>
        history.push(
          '/talepler/islemde',
        ),
    },
    {
      key: 'tamamlanan',
      title: 'Tamamlanan',
      value: tamamlananTalep,
      icon: <CheckCircleOutlined />,
      description:
        'Çözüme ulaştırılan talepler',
      onClick: () =>
        history.push(
          '/talepler/tamamlanan',
        ),
    },
    {
      key: 'toplam',
      title: 'Toplam Görünen',
      value: toplamGorunen,
      icon: <FileTextOutlined />,
      description:
        'Erişebildiğiniz bütün talepler',
    },
  ];

  if (yukleniyor) {
    return (
      <GridContent>
        <div
          style={{
            minHeight: 480,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Spin
            size="large"
            tip="AGEST Desk hazırlanıyor..."
          />
        </div>
      </GridContent>
    );
  }

  return (
    <GridContent>
      <Card
        variant="borderless"
        style={{
          marginBottom: 24,
          overflow: 'hidden',
        }}
        styles={{
          body: {
            padding: 0,
          },
        }}
      >
        <div
          style={{
            minHeight: 230,
            padding: '32px 36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'space-between',
            gap: 32,
            flexWrap: 'wrap',
            background:
              'linear-gradient(135deg, rgba(22,119,255,0.11), rgba(114,46,209,0.08))',
          }}
        >
          <div
            style={{
              flex: '1 1 480px',
            }}
          >
            <Text
              type="secondary"
              style={{
                display: 'block',
                marginBottom: 8,
                fontSize: 15,
              }}
            >
              AGEST Desk çalışma alanı
            </Text>

            <Title
              level={1}
              style={{
                marginTop: 0,
                marginBottom: 10,
              }}
            >
              Hoş Geldiniz,{' '}
              {kullanici?.ad ||
                'Kullanıcı'}
            </Title>

            <Text
              type="secondary"
              style={{
                fontSize: 16,
              }}
            >
              {kullanici?.departman ||
                'Departman'}{' '}
              departmanına gelen talepleri
              ve gönderdiğiniz talepleri bu
              ekrandan takip edebilirsiniz.
            </Text>

            <div
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                marginTop: 22,
              }}
            >
              <Tag color="blue">
                Kullanıcı:{' '}
                {kullanici?.kullaniciAdi ||
                  '-'}
              </Tag>

              <Tag color="purple">
                Departman:{' '}
                {kullanici?.departman ||
                  '-'}
              </Tag>

              <Tag color="cyan">
                Rol:{' '}
                {rolMetni[
                  kullanici?.rol || ''
                ] ||
                  kullanici?.rol ||
                  '-'}
              </Tag>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                marginTop: 24,
              }}
            >
              <Button
                type="primary"
                icon={<InboxOutlined />}
                onClick={() =>
                  history.push(
                    '/talepler/gelen',
                  )
                }
              >
                Gelen Talepleri Gör
              </Button>

              <Button
                icon={
                  <SendOutlined />
                }
                onClick={() =>
                  history.push(
                    '/talepler/yeni',
                  )
                }
              >
                Yeni Talep Oluştur
              </Button>
            </div>
          </div>

          <div
            style={{
              flex: '0 0 auto',
              minWidth: 220,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
  style={{
    width: 230,
    height: 140,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  <img
    src="/icons/AgestLogo.png"
    alt="AGEST Logo"
    style={{
      width: 150,
      maxWidth: 'none',
      height: 'auto',
      objectFit: 'contain',
    }}
  />
</div>
          </div>
        </div>
      </Card>

      <Row gutter={[20, 20]}>
        {istatistikKartlari.map(
          (kart) => (
            <Col
              key={kart.key}
              xs={24}
              sm={12}
              lg={8}
              xl={4}
            >
              <Card
                hoverable={
                  Boolean(kart.onClick)
                }
                onClick={kart.onClick}
                style={{
                  height: '100%',
                  cursor: kart.onClick
                    ? 'pointer'
                    : 'default',
                }}
              >
                <Statistic
                  title={kart.title}
                  value={kart.value}
                  prefix={kart.icon}
                />

                <Text
                  type="secondary"
                  style={{
                    display: 'block',
                    marginTop: 12,
                    fontSize: 13,
                  }}
                >
                  {kart.description}
                </Text>
              </Card>
            </Col>
          ),
        )}
      </Row>

      <Row
        gutter={[24, 24]}
        style={{
          marginTop: 24,
        }}
      >
        <Col xs={24} xl={7}>
          <Card
            title="Departman Performansı"
            style={{
              height: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <Progress
                type="dashboard"
                percent={tamamlanmaOrani}
                strokeColor={{
                  '0%': '#1677ff',
                  '100%': '#52c41a',
                }}
              />
            </div>

            <Row gutter={[12, 12]}>
              <Col span={8}>
                <Statistic
                  title="Toplam"
                  value={
                    gelenTalepler.length
                  }
                />
              </Col>

              <Col span={8}>
                <Statistic
                  title="Aktif"
                  value={
                    bekleyenTalep +
                    islemdeTalep
                  }
                />
              </Col>

              <Col span={8}>
                <Statistic
                  title="Çözülen"
                  value={
                    tamamlananTalep
                  }
                />
              </Col>
            </Row>

            <Text
              type="secondary"
              style={{
                display: 'block',
                marginTop: 22,
                lineHeight: 1.6,
              }}
            >
              Departmanınıza gelen{' '}
              {gelenTalepler.length} talebin{' '}
              {tamamlananTalep} tanesi
              tamamlandı.
            </Text>
          </Card>
        </Col>

        <Col xs={24} xl={17}>
          <Card
            title="Son Gelen Talepler"
            extra={
              <Button
                type="link"
                onClick={() =>
                  history.push(
                    '/talepler/gelen',
                  )
                }
              >
                Tümünü Gör
              </Button>
            }
            style={{
              height: '100%',
            }}
          >
            {sonGelenTalepler.length ===
            0 ? (
              <Empty description="Departmanınıza gelen talep bulunmuyor." />
            ) : (
              <Table<TicketType>
                rowKey="id"
                columns={gelenColumns}
                dataSource={
                  sonGelenTalepler
                }
                pagination={false}
                scroll={{
                  x: 950,
                }}
                size="middle"
              />
            )}
          </Card>
        </Col>
      </Row>

      <Card
        title="Son Gönderdiğim Talepler"
        extra={
          <Button
            type="link"
            onClick={() =>
              history.push(
                '/talepler/gonderilen',
              )
            }
          >
            Tümünü Gör
          </Button>
        }
        style={{
          marginTop: 24,
        }}
      >
        {sonGonderilenTalepler.length ===
        0 ? (
          <Empty description="Henüz başka bir departmana talep göndermediniz." />
        ) : (
          <Table<TicketType>
            rowKey="id"
            columns={gonderilenColumns}
            dataSource={
              sonGonderilenTalepler
            }
            pagination={false}
            scroll={{
              x: 950,
            }}
            size="middle"
          />
        )}
      </Card>
    </GridContent>
  );
};

export default Analysis;