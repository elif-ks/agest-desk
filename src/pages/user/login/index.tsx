import {
  LockOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { Helmet } from '@umijs/max';
import {
  Alert,
  App,
  Card,
  Col,
  Row,
  Space,
  Tag,
  Typography,
} from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';

import {
  apiRequest,
} from '@/services/helpDeskApi';

import Settings from '../../../../config/defaultSettings';

const { Text, Title } = Typography;

type LoginValues = {
  kullaniciAdi: string;
  sifre: string;
  beniHatirla?: boolean;
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

type LoginResponse = {
  message: string;
  token?: string;
  kullanici?: Kullanici;
};

const useStyles = createStyles(() => ({
  container: {
    minHeight: '100vh',
    background:
      'linear-gradient(135deg, #eef3ff 0%, #f7f9fc 48%, #ffffff 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },

  wrapper: {
    width: '100%',
    maxWidth: 1120,
  },

  card: {
    overflow: 'hidden',
    borderRadius: 28,
    boxShadow:
      '0 28px 90px rgba(15, 23, 42, 0.14)',
    border: '1px solid rgba(15, 23, 42, 0.06)',
  },

  brandArea: {
    minHeight: 620,
    padding: '56px 48px',
    background:
      'linear-gradient(145deg, #3e649d 0%, #6076a0b0 54%, #2156a4 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    color: '#ffffff',
  },

  logo: {
    width: 190,
    maxWidth: '100%',
    objectFit: 'contain',
  },

  brandContent: {
    maxWidth: 450,
  },

  brandTitle: {
    color: '#ffffff !important',
    fontSize: '42px !important',
    marginBottom: '14px !important',
  },

  brandText: {
    color: 'rgba(255, 255, 255, 0.74)',
    fontSize: 17,
    lineHeight: 1.8,
  },

  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    color: 'rgba(255, 255, 255, 0.88)',
  },

  loginArea: {
    minHeight: 620,
    background: '#ffffff',
    padding: '56px 52px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },

  loginHeader: {
    marginBottom: 28,
  },

  form: {
    maxWidth: 420,
    width: '100%',
    margin: '0 auto',
  },

  footer: {
    marginTop: 34,
    textAlign: 'center',
  },
}));

const Login: React.FC = () => {
  const { styles } = useStyles();
  const { message } = App.useApp();

  const [hataMesaji, setHataMesaji] =
    useState<string>('');

  const [
    girisYapiliyor,
    setGirisYapiliyor,
  ] = useState<boolean>(false);

  const handleSubmit = async (
    values: LoginValues,
  ) => {
    setGirisYapiliyor(true);
    setHataMesaji('');

    try {
      const data =
        await apiRequest<LoginResponse>(
          '/auth/login',
          {
            method: 'POST',
            auth: false,
            body: JSON.stringify({
              kullaniciAdi:
                values.kullaniciAdi.trim(),
              sifre: values.sifre,
            }),
          },
        );

      if (
        !data.token ||
        !data.kullanici
      ) {
        throw new Error(
          'Giriş bilgileri sunucudan alınamadı.',
        );
      }

      localStorage.setItem(
        'helpDeskToken',
        data.token,
      );

      localStorage.setItem(
        'helpDeskKullanici',
        JSON.stringify(
          data.kullanici,
        ),
      );

      message.success(
        `Hoş geldiniz ${data.kullanici.ad}`,
      );

      window.location.href =
        '/dashboard';
    } catch (error) {
      console.error(
        'Giriş hatası:',
        error,
      );

      if (error instanceof Error) {
        setHataMesaji(
          error.message,
        );
      } else {
        setHataMesaji(
          'Giriş sırasında beklenmeyen bir hata oluştu.',
        );
      }
    } finally {
      setGirisYapiliyor(false);
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          Giriş Yap
          {Settings.title
            ? ` - ${Settings.title}`
            : ''}
        </title>
      </Helmet>

      <div className={styles.wrapper}>
        <Card
          className={styles.card}
          styles={{
            body: {
              padding: 0,
            },
          }}
        >
          <Row>
            <Col
              xs={0}
              md={11}
            >
              <div
                className={
                  styles.brandArea
                }
              >
                <div>
                  <img
                    src="/icons/AgestLogo.png"
                    alt="AGEST Logo"
                    className={
                      styles.logo
                    }
                  />
                </div>

                <div
                  className={
                    styles.brandContent
                  }
                >
                  <Tag
                    color="blue"
                    style={{
                      marginBottom: 18,
                    }}
                  >
                    Kurumsal Talep Sistemi
                  </Tag>

                  <Title
                    level={1}
                    className={
                      styles.brandTitle
                    }
                  >
                    AGEST Desk
                  </Title>

                  <Text
                    className={
                      styles.brandText
                    }
                  >
                    Departmanlar arası destek,
                    talep ve iş takibi için
                    geliştirilmiş şirket içi
                    yönetim platformu.
                  </Text>

                  <Space
                    direction="vertical"
                    size={16}
                    style={{
                      marginTop: 34,
                    }}
                  >
                    <div
                      className={
                        styles.feature
                      }
                    >
                      <SafetyCertificateOutlined />
                      Güvenli kullanıcı girişi
                    </div>

                    <div
                      className={
                        styles.feature
                      }
                    >
                      <SafetyCertificateOutlined />
                      Departman bazlı
                      yetkilendirme
                    </div>

                    <div
                      className={
                        styles.feature
                      }
                    >
                      <SafetyCertificateOutlined />
                      Gerçek zamanlı talep
                      takibi
                    </div>
                  </Space>
                </div>

                <Text
                  style={{
                    color:
                      'rgba(255, 255, 255, 0.48)',
                  }}
                >
                  © 2026 AGEST
                </Text>
              </div>
            </Col>

            <Col
              xs={24}
              md={13}
            >
              <div
                className={
                  styles.loginArea
                }
              >
                <div
                  className={
                    styles.form
                  }
                >
                  <div
                    className={
                      styles.loginHeader
                    }
                  >
                    <Title
                      level={2}
                      style={{
                        marginBottom: 8,
                      }}
                    >
                      Hesabınıza Giriş Yapın
                    </Title>

                    <Text type="secondary">
                      Kullanıcı adınız ve
                      şifrenizle AGEST Desk
                      çalışma alanına erişin.
                    </Text>
                  </div>

                  <LoginForm<LoginValues>
                    onFinish={handleSubmit}
                    submitter={{
                      searchConfig: {
                        submitText:
                          'Giriş Yap',
                      },
                      submitButtonProps: {
                        size: 'large',
                        loading:
                          girisYapiliyor,
                        block: true,
                        style: {
                          height: 48,
                          borderRadius: 10,
                          fontWeight: 600,
                        },
                      },
                      resetButtonProps: {
                        style: {
                          display: 'none',
                        },
                      },
                    }}
                  >
                    {hataMesaji && (
                      <Alert
                        type="error"
                        showIcon
                        message={
                          hataMesaji
                        }
                        style={{
                          marginBottom: 24,
                        }}
                      />
                    )}

                    <ProFormText
                      name="kullaniciAdi"
                      label="Kullanıcı Adı"
                      fieldProps={{
                        size: 'large',
                        prefix:
                          <UserOutlined />,
                        autoComplete:
                          'username',
                      }}
                      placeholder="Kullanıcı adınızı giriniz"
                      rules={[
                        {
                          required: true,
                          message:
                            'Kullanıcı adınızı giriniz.',
                        },
                      ]}
                    />

                    <ProFormText.Password
                      name="sifre"
                      label="Şifre"
                      fieldProps={{
                        size: 'large',
                        prefix:
                          <LockOutlined />,
                        autoComplete:
                          'current-password',
                      }}
                      placeholder="Şifrenizi giriniz"
                      rules={[
                        {
                          required: true,
                          message:
                            'Şifrenizi giriniz.',
                        },
                      ]}
                    />

                    <div
                      style={{
                        marginTop: -4,
                        marginBottom: 22,
                      }}
                    >
                      <ProFormCheckbox
                        noStyle
                        name="beniHatirla"
                      >
                        Beni Hatırla
                      </ProFormCheckbox>
                    </div>
                  </LoginForm>

                  <div
                    className={
                      styles.footer
                    }
                  >
                    <Text type="secondary">
                      Yetki veya giriş sorunu
                      yaşarsanız sistem
                      yöneticinizle iletişime
                      geçin.
                    </Text>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default Login;