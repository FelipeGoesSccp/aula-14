# 📍 GPS Localizador + 🔔 Local Notifications

Aplicativo mobile híbrido desenvolvido com **React + Capacitor**, capaz de capturar coordenadas GPS do dispositivo e disparar notificações locais (imediatas ou agendadas) — tudo funcionando **offline**, sem depender de servidor.

---

## 🚀 Funcionalidades

### 📍 GPS Localizador
- Verifica e solicita permissão de localização do sistema operacional
- Captura latitude, longitude e precisão em metros via hardware GPS
- Exibe data e hora da captura
- Abre as coordenadas diretamente no **Google Maps**

### 🔔 Local Notifications
- Verifica e solicita permissão de notificação (**Android 13+ / API 33**)
- **Disparo imediato** — notificação aparece instantaneamente na barra de status
- **Agendamento futuro** — define em quantos segundos a notificação deve disparar (funciona mesmo com o app fechado)
- **Lista notificações pendentes** — visualiza todas que ainda não foram disparadas
- **Cancela notificações** individualmente pelo ID

---

## 🛠️ Tecnologias utilizadas

| Tecnologia | Função |
|---|---|
| [React 19](https://react.dev/) | Interface do usuário |
| [Vite](https://vitejs.dev/) | Bundler e servidor de desenvolvimento |
| [Capacitor](https://capacitorjs.com/) | Ponte entre Web e nativo Android/iOS |
| [@capacitor/geolocation](https://capacitorjs.com/docs/apis/geolocation) | Acesso ao GPS do dispositivo |
| [@capacitor/local-notifications](https://capacitorjs.com/docs/apis/local-notifications) | Notificações locais nativas |
| [GitHub Actions](https://docs.github.com/en/actions) | CI/CD para geração automática do APK |

---

## ⚙️ Como rodar localmente

### Pré-requisitos
- Node.js 18+
- Android Studio (para emular ou gerar APK)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/FelipeGoesSccp/aula-14.git
cd aula-14

# 2. Instale as dependências
npm install

# 3. Gere o build da aplicação web
npm run build

# 4. Sincronize com o projeto Android nativo
npx cap sync

# 5. Abra no Android Studio
npx cap open android
```

---

## 📱 Baixar o APK

O APK é gerado automaticamente pelo **GitHub Actions** a cada `git push` na branch `main`.

Para baixar:
1. Acesse a aba [**Actions**](../../actions) deste repositório
2. Clique no workflow **Build Android APK** mais recente
3. Em **Artifacts**, baixe o arquivo **`GPS-Localizador-Notifications-APK`**
4. Instale o `.apk` no seu Android (habilite "Fontes desconhecidas" nas configurações)

---

## 🔐 Permissões Android

| Permissão | Motivo |
|---|---|
| `ACCESS_FINE_LOCATION` | Captura de coordenadas GPS precisas |
| `ACCESS_COARSE_LOCATION` | Fallback de localização por rede |
| `POST_NOTIFICATIONS` | Exibição de notificações (obrigatório Android 13+) |
| `RECEIVE_BOOT_COMPLETED` | Reagendar notificações após reiniciar o device |
| `SCHEDULE_EXACT_ALARM` | Precisão no agendamento de notificações |

---

## 📂 Estrutura do projeto

```
aula-14/
├── .github/
│   └── workflows/
│       └── build.yml        # Pipeline CI/CD → gera APK automaticamente
├── android/                 # Projeto Android nativo (gerado pelo Capacitor)
├── public/                  # Arquivos estáticos
├── src/
│   ├── App.jsx              # Componente principal (GPS + Notificações)
│   ├── main.jsx             # Entry point React
│   └── style.css            # Estilos globais
├── capacitor.config.json    # Configuração do Capacitor
├── package.json
└── vite.config.js
```

---

## 📚 Conceitos aprendidos

- **Push vs Local Notification** — diferença entre notificações geradas localmente (offline) e as enviadas por servidor remoto (Firebase/Supabase)
- **Fluxo de permissões Android 13+** — `checkPermissions()` → `requestPermissions()` → feedback ao usuário
- **Schedule Trigger** — uso de `schedule: { at: new Date() }` para agendar alertas futuros
- **Lifecycle de notificações** — `getPending()` e `cancel()` para gerenciar notificações agendadas
- **CI/CD com GitHub Actions** — geração automática de APK em nuvem sem precisar do Android Studio local

---

<p align="center">
  Feito com ⚡ React + Capacitor
</p>
