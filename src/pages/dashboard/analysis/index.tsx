import { history } from '@umijs/max';
import {
  Button,
  Card,
  DataTable,
  type DataTableColumn,
  EmptyState,
  Grid,
  GridItem,
  Heading,
  Progress,
  Spinner,
  Statistic,
  Tag,
  type TagTone,
  Text,
  ToastHost,
  toast,
} from '@/components/ui';
import {
  CheckCircleIcon,
  ClockIcon,
  FileTextIcon,
  InboxIcon,
  SendIcon,
  SyncIcon,
} from '@/components/ui/icons';
import { useEffect, useMemo, useState } from 'react';

import {
  apiRequest,
  getKullanici,
} from '@/services/helpDeskApi';

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
): TagTone => {
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
): TagTone => {
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
            toast.error(error.message);
          } else {
            toast.error(
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

  const gelenColumns: DataTableColumn<TicketType>[] =
    [
      {
        title: 'Ticket No',
        dataIndex: 'ticketNo',
        key: 'ticketNo',
        width: 150,
        render: (value) => {
          const ticketNo = String(value);
          return (
          <Text strong copyable>
            {ticketNo}
          </Text>
          );
        },
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
        render: (value) => {
          const oncelik =
            value as TicketPriority;
          return (
          <Tag
            tone={oncelikRengi(
              oncelik,
            )}
          >
            {oncelikMetni[oncelik]}
          </Tag>
          );
        },
      },
      {
        title: 'Durum',
        dataIndex: 'durum',
        key: 'durum',
        width: 130,
        render: (value) => {
          const durum =
            value as TicketStatus;
          return (
          <Tag tone={durumRengi(durum)}>
            {durumMetni[durum]}
          </Tag>
          );
        },
      },
      {
        title: 'Tarih',
        dataIndex: 'olusturmaTarihi',
        key: 'olusturmaTarihi',
        width: 180,
        render: (value) =>
          tarihFormatla(String(value)),
      },
    ];

  const gonderilenColumns: DataTableColumn<TicketType>[] =
    [
      {
        title: 'Ticket No',
        dataIndex: 'ticketNo',
        key: 'ticketNo',
        width: 150,
        render: (value) => {
          const ticketNo = String(value);
          return (
          <Text strong copyable>
            {ticketNo}
          </Text>
          );
        },
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
        render: (value) => {
          const oncelik =
            value as TicketPriority;
          return (
          <Tag
            tone={oncelikRengi(
              oncelik,
            )}
          >
            {oncelikMetni[oncelik]}
          </Tag>
          );
        },
      },
      {
        title: 'Durum',
        dataIndex: 'durum',
        key: 'durum',
        width: 130,
        render: (value) => {
          const durum =
            value as TicketStatus;
          return (
          <Tag tone={durumRengi(durum)}>
            {durumMetni[durum]}
          </Tag>
          );
        },
      },
      {
        title: 'Tarih',
        dataIndex: 'olusturmaTarihi',
        key: 'olusturmaTarihi',
        width: 180,
        render: (value) =>
          tarihFormatla(String(value)),
      },
    ];

  const istatistikKartlari = [
    {
      key: 'gelen',
      title: 'Bana Gelen',
      value: gelenTalepler.length,
      icon: <InboxIcon />,
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
      icon: <SendIcon />,
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
      icon: <ClockIcon />,
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
      icon: <SyncIcon spin />,
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
      icon: <CheckCircleIcon />,
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
      icon: <FileTextIcon />,
      description:
        'Erişebildiğiniz bütün talepler',
    },
  ];

  if (yukleniyor) {
    return (
      <div className="ui-page-content">
        <ToastHost />
        <div
          style={{
            minHeight: 480,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Spinner
            size="large"
            label="AGEST Desk hazırlanıyor..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="ui-page-content">
      <ToastHost />
      <Card
        style={{
          marginBottom: 24,
          overflow: 'hidden',
        }}
        bodyStyle={{ padding: 0 }}
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
              secondary
              style={{
                display: 'block',
                marginBottom: 8,
                fontSize: 15,
              }}
            >
              AGEST Desk çalışma alanı
            </Text>

            <Heading
              level={1}
              style={{
                marginTop: 0,
                marginBottom: 10,
              }}
            >
              Hoş Geldiniz,{' '}
              {kullanici?.ad ||
                'Kullanıcı'}
            </Heading>

            <Text
              secondary
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
              <Tag tone="blue">
                Kullanıcı:{' '}
                {kullanici?.kullaniciAdi ||
                  '-'}
              </Tag>

              <Tag tone="purple">
                Departman:{' '}
                {kullanici?.departman ||
                  '-'}
              </Tag>

              <Tag tone="cyan">
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
                variant="primary"
                icon={<InboxIcon />}
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
                  <SendIcon />
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

      <Grid gap={20} className="ui-dashboard-stats">
        {istatistikKartlari.map(
          (kart) => (
            <GridItem
              key={kart.key}
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
                  secondary
                  style={{
                    display: 'block',
                    marginTop: 12,
                    fontSize: 13,
                  }}
                >
                  {kart.description}
                </Text>
              </Card>
            </GridItem>
          ),
        )}
      </Grid>

      <Grid
        gap={24}
        className="ui-dashboard-main"
        style={{
          marginTop: 24,
        }}
      >
        <GridItem>
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
                variant="dashboard"
                percent={tamamlanmaOrani}
              />
            </div>

            <Grid gap={12} className="ui-three-cols">
              <GridItem>
                <Statistic
                  title="Toplam"
                  value={
                    gelenTalepler.length
                  }
                />
              </GridItem>

              <GridItem>
                <Statistic
                  title="Aktif"
                  value={
                    bekleyenTalep +
                    islemdeTalep
                  }
                />
              </GridItem>

              <GridItem>
                <Statistic
                  title="Çözülen"
                  value={
                    tamamlananTalep
                  }
                />
              </GridItem>
            </Grid>

            <Text
              secondary
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
        </GridItem>

        <GridItem>
          <Card
            title="Son Gelen Talepler"
            extra={
              <Button
                variant="link"
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
              <EmptyState description="Departmanınıza gelen talep bulunmuyor." />
            ) : (
              <DataTable<TicketType>
                rowKey="id"
                columns={gelenColumns}
                data={
                  sonGelenTalepler
                }
                minWidth={950}
              />
            )}
          </Card>
        </GridItem>
      </Grid>

      <Card
        title="Son Gönderdiğim Talepler"
        extra={
          <Button
            variant="link"
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
          <EmptyState description="Henüz başka bir departmana talep göndermediniz." />
        ) : (
          <DataTable<TicketType>
            rowKey="id"
            columns={gonderilenColumns}
            data={
              sonGonderilenTalepler
            }
            minWidth={950}
          />
        )}
      </Card>
    </div>
  );
};

export default Analysis;
