import type {
  ActionType,
  ProColumns,
} from '@ant-design/pro-components';
import {
  PageContainer,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import { useLocation } from '@umijs/max';
import {
  Button,
  Drawer,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';

import { apiRequest } from '@/services/helpDeskApi';

const { Text } = Typography;

type TicketStatus =
  | 'bekliyor'
  | 'islemde'
  | 'tamamlandi';

type TicketPriority =
  | 'dusuk'
  | 'orta'
  | 'yuksek'
  | 'kritik';

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

type DurumGuncelleResponse = {
  message: string;
  talep?: TicketType;
};

const oncelikMetni: Record<
  TicketPriority,
  string
> = {
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

const TableList = () => {
  const actionRef = useRef<ActionType | null>(
    null,
  );

  const location = useLocation();

  const [talepler, setTalepler] = useState<
    TicketType[]
  >([]);

  const [yukleniyor, setYukleniyor] =
    useState<boolean>(true);

  const [
    durumGuncelleniyor,
    setDurumGuncelleniyor,
  ] = useState<boolean>(false);

  const [showDetail, setShowDetail] =
    useState<boolean>(false);

  const [currentTicket, setCurrentTicket] =
    useState<TicketType>();

  const gonderilenSayfasiMi =
    location.pathname.includes('/gonderilen');

  const gelenSayfasiMi =
    location.pathname.includes('/gelen');

  const talepleriGetir = async () => {
    setYukleniyor(true);

    try {
      let endpoint = '/talepler';

      if (gelenSayfasiMi) {
        endpoint = '/talepler?tip=gelen';
      }

      if (gonderilenSayfasiMi) {
        endpoint = '/talepler?tip=gonderilen';
      }

      const data =
        await apiRequest<TicketType[]>(
          endpoint,
        );

      setTalepler(data);
    } catch (error) {
      console.error(
        'Talep listeleme hatası:',
        error,
      );

      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error(
          'Talepler yüklenemedi.',
        );
      }
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => {
    setCurrentTicket(undefined);
    setShowDetail(false);

    talepleriGetir();
  }, [location.pathname]);

  const durumGuncelle = async (
    talepId: number,
    yeniDurum: TicketStatus,
  ) => {
    setDurumGuncelleniyor(true);

    try {
      const data =
        await apiRequest<DurumGuncelleResponse>(
          `/talepler/${talepId}/durum`,
          {
            method: 'PATCH',
            body: JSON.stringify({
              durum: yeniDurum,
            }),
          },
        );

      message.success(data.message);

      if (data.talep) {
        setTalepler((mevcutTalepler) =>
          mevcutTalepler.map((talep) =>
            talep.id === data.talep?.id
              ? data.talep
              : talep,
          ),
        );

        setCurrentTicket(data.talep);
      }
    } catch (error) {
      console.error(
        'Talep durum güncelleme hatası:',
        error,
      );

      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error(
          'Talep durumu güncellenirken beklenmeyen bir hata oluştu.',
        );
      }
    } finally {
      setDurumGuncelleniyor(false);
    }
  };

  const filteredTickets = useMemo(() => {
    if (
      location.pathname.includes('/bekleyen')
    ) {
      return talepler.filter(
        (ticket) =>
          ticket.durum === 'bekliyor',
      );
    }

    if (
      location.pathname.includes('/islemde')
    ) {
      return talepler.filter(
        (ticket) =>
          ticket.durum === 'islemde',
      );
    }

    if (
      location.pathname.includes(
        '/tamamlanan',
      )
    ) {
      return talepler.filter(
        (ticket) =>
          ticket.durum === 'tamamlandi',
      );
    }

    return talepler;
  }, [location.pathname, talepler]);

  const pageTitle = useMemo(() => {
    if (
      location.pathname.includes('/gelen')
    ) {
      return 'Bana Gelen Talepler';
    }

    if (
      location.pathname.includes(
        '/gonderilen',
      )
    ) {
      return 'Gönderdiğim Talepler';
    }

    if (
      location.pathname.includes(
        '/bekleyen',
      )
    ) {
      return 'Bekleyen Talepler';
    }

    if (
      location.pathname.includes('/islemde')
    ) {
      return 'İşlemdeki Talepler';
    }

    if (
      location.pathname.includes(
        '/tamamlanan',
      )
    ) {
      return 'Tamamlanan Talepler';
    }

    return 'Tüm Talepler';
  }, [location.pathname]);

  const pageDescription = useMemo(() => {
    if (gonderilenSayfasiMi) {
      return 'Diğer departmanlara gönderdiğiniz talepleri ve güncel durumlarını takip edebilirsiniz.';
    }

    if (gelenSayfasiMi) {
      return 'Departmanınıza gönderilen talepleri görüntüleyebilir ve işlem yapabilirsiniz.';
    }

    return 'Help Desk sistemindeki talepleri görüntüleyebilir ve filtreleyebilirsiniz.';
  }, [
    gelenSayfasiMi,
    gonderilenSayfasiMi,
  ]);

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

  const columns: ProColumns<TicketType>[] = [
    {
      title: 'Ticket No',
      dataIndex: 'ticketNo',
      copyable: true,
      width: 160,
      render: (_, record) => (
        <Button
          type="link"
          style={{
            padding: 0,
            fontWeight: 600,
          }}
          onClick={() => {
            setCurrentTicket(record);
            setShowDetail(true);
          }}
        >
          {record.ticketNo}
        </Button>
      ),
    },
    {
      title: 'Talep Başlığı',
      dataIndex: 'baslik',
      ellipsis: true,
      width: 280,
    },
    {
      title: 'Hedef Departman',
      dataIndex: 'departman',
      width: 180,
    },
    {
      title: 'Gönderen',
      dataIndex: 'olusturanKullanici',
      width: 180,
      search: false,
      render: (_, record) =>
        record.olusturanKullanici ||
        record.olusturanKullaniciAdi ||
        '-',
    },
    {
      title: 'Öncelik',
      dataIndex: 'oncelik',
      valueType: 'select',
      valueEnum: {
        dusuk: {
          text: 'Düşük',
        },
        orta: {
          text: 'Orta',
        },
        yuksek: {
          text: 'Yüksek',
        },
        kritik: {
          text: 'Kritik',
        },
      },
      width: 130,
      render: (_, record) => (
        <Tag
          color={oncelikRengi(
            record.oncelik,
          )}
        >
          {oncelikMetni[record.oncelik]}
        </Tag>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'durum',
      valueType: 'select',
      valueEnum: {
        bekliyor: {
          text: 'Bekliyor',
        },
        islemde: {
          text: 'İşlemde',
        },
        tamamlandi: {
          text: 'Tamamlandı',
        },
      },
      width: 150,
      render: (_, record) => (
        <Tag
          color={durumRengi(record.durum)}
        >
          {durumMetni[record.durum]}
        </Tag>
      ),
    },
    {
      title: 'Oluşturma Tarihi',
      dataIndex: 'olusturmaTarihi',
      search: false,
      width: 190,
      render: (_, record) =>
        tarihFormatla(
          record.olusturmaTarihi,
        ),
    },
    {
      title: 'İşlem',
      valueType: 'option',
      width: 120,
      fixed: 'right',
      render: (_, record) => [
        <Button
          key="detail"
          type="link"
          onClick={() => {
            setCurrentTicket(record);
            setShowDetail(true);
          }}
        >
          Görüntüle
        </Button>,
      ],
    },
  ];

  return (
    <PageContainer
      title={pageTitle}
      content={pageDescription}
    >
      <ProTable<TicketType>
        actionRef={actionRef}
        rowKey="id"
        loading={yukleniyor}
        headerTitle={`${pageTitle} (${filteredTickets.length})`}
        columns={columns}
        dataSource={filteredTickets}
        search={{
          labelWidth: 'auto',
          searchText: 'Ara',
          resetText: 'Temizle',
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
        }}
        scroll={{
          x: 1350,
        }}
        options={{
          reload: () => {
            talepleriGetir();
          },
          density: true,
          setting: true,
        }}
      />

      <Drawer
        title="Talep Detayı"
        size={650}
        open={showDetail}
        onClose={() => {
          setShowDetail(false);
          setCurrentTicket(undefined);
        }}
      >
        {currentTicket && (
          <>
            <ProDescriptions<TicketType>
              title={
                currentTicket.ticketNo
              }
              column={1}
              dataSource={currentTicket}
              columns={[
                {
                  title: 'Talep Başlığı',
                  dataIndex: 'baslik',
                },
                {
                  title: 'Hedef Departman',
                  dataIndex: 'departman',
                },
                {
                  title: 'Gönderen',
                  dataIndex:
                    'olusturanKullanici',
                  render: () =>
                    currentTicket.olusturanKullanici ||
                    currentTicket.olusturanKullaniciAdi ||
                    '-',
                },
                {
                  title: 'Öncelik',
                  dataIndex: 'oncelik',
                  render: () => (
                    <Tag
                      color={oncelikRengi(
                        currentTicket.oncelik,
                      )}
                    >
                      {
                        oncelikMetni[
                          currentTicket.oncelik
                        ]
                      }
                    </Tag>
                  ),
                },
                {
                  title: 'Durum',
                  dataIndex: 'durum',
                  render: () => (
                    <Tag
                      color={durumRengi(
                        currentTicket.durum,
                      )}
                    >
                      {
                        durumMetni[
                          currentTicket.durum
                        ]
                      }
                    </Tag>
                  ),
                },
                {
                  title: 'Oluşturma Tarihi',
                  dataIndex:
                    'olusturmaTarihi',
                  render: () =>
                    tarihFormatla(
                      currentTicket.olusturmaTarihi,
                    ),
                },
                {
                  title: 'Son Güncelleme',
                  dataIndex:
                    'guncellemeTarihi',
                  render: () =>
                    tarihFormatla(
                      currentTicket.guncellemeTarihi,
                    ),
                },
              ]}
            />

            <div
              style={{
                marginTop: 24,
                padding: 20,
                background:
                  'rgba(0, 0, 0, 0.02)',
                borderRadius: 8,
              }}
            >
              <Text strong>
                Talep Açıklaması
              </Text>

              <div
                style={{
                  marginTop: 12,
                }}
              >
                <Text>
                  {currentTicket.aciklama}
                </Text>
              </div>
            </div>

            {!gonderilenSayfasiMi && (
              <div
                style={{
                  marginTop: 24,
                  paddingTop: 24,
                  borderTop:
                    '1px solid rgba(0, 0, 0, 0.06)',
                }}
              >
                <Text
                  strong
                  style={{
                    display: 'block',
                    marginBottom: 16,
                  }}
                >
                  Talep İşlemleri
                </Text>

                <Space wrap>
                 {currentTicket.durum === 'bekliyor' && (
  <Button
    type="primary"
    loading={durumGuncelleniyor}
    onClick={() =>
      durumGuncelle(
        currentTicket.id,
        'islemde',
      )
    }
  >
    İşleme Al
  </Button>
)}

{currentTicket.durum === 'islemde' && (
  <>
    <Button
      loading={durumGuncelleniyor}
      onClick={() =>
        durumGuncelle(
          currentTicket.id,
          'bekliyor',
        )
      }
    >
      Bekliyora Geri Al
    </Button>

    <Button
      type="primary"
      loading={durumGuncelleniyor}
      onClick={() =>
        durumGuncelle(
          currentTicket.id,
          'tamamlandi',
        )
      }
    >
      Tamamlandı Olarak İşaretle
    </Button>
  </>
)}

{currentTicket.durum === 'tamamlandi' && (
  <>
    <Button
      loading={durumGuncelleniyor}
      onClick={() =>
        durumGuncelle(
          currentTicket.id,
          'islemde',
        )
      }
    >
      İşleme Geri Al
    </Button>

    <Tag color="green">
      Bu talep tamamlandı
    </Tag>
  </>
)}
                </Space>
              </div>
            )}

            {gonderilenSayfasiMi && (
              <div
                style={{
                  marginTop: 24,
                  padding: 16,
                  background:
                    'rgba(22, 119, 255, 0.06)',
                  borderRadius: 8,
                }}
              >
                <Text type="secondary">
                  Bu talebi başka bir
                  departmana gönderdiğiniz için
                  yalnızca durumunu takip
                  edebilirsiniz. İşlem yapma
                  yetkisi hedef departmandadır.
                </Text>
              </div>
            )}
          </>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;