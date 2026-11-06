import { useState } from 'react'
import { Geolocation } from '@capacitor/geolocation'
import { LocalNotifications } from '@capacitor/local-notifications'

function App() {
  const [latitude, setLatitude] = useState(null)
  const [longitude, setLongitude] = useState(null)
  const [precisao, setPrecisao] = useState(null)
  const [erro, setErro] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [permissaoStatus, setPermissaoStatus] = useState(null)

  // ─── Estados das Notificações ───────────────────────────────────────────────
  const [notifPermissao, setNotifPermissao] = useState(null)
  const [notifMensagem, setNotifMensagem] = useState(null)
  const [segundosAgendamento, setSegundosAgendamento] = useState(10)
  const [pendentes, setPendentes] = useState([])

  // ─── Permissão de Notificação ───────────────────────────────────────────────
  const solicitarPermissaoNotif = async () => {
    try {
      let status = await LocalNotifications.checkPermissions()
      setNotifPermissao(status.display)

      if (status.display !== 'granted') {
        status = await LocalNotifications.requestPermissions()
        setNotifPermissao(status.display)
      }

      if (status.display === 'granted') {
        setNotifMensagem({ tipo: 'sucesso', texto: '✅ Permissão de notificação concedida!' })
        return true
      } else {
        setNotifMensagem({ tipo: 'aviso', texto: '⚠️ Notificações bloqueadas pelo usuário.' })
        return false
      }
    } catch (error) {
      setNotifMensagem({ tipo: 'erro', texto: `❌ Erro ao pedir permissão: ${error.message}` })
      return false
    }
  }

  // ─── Notificação Imediata ───────────────────────────────────────────────────
  const dispararNotificacaoImediata = async () => {
    const permitido = await solicitarPermissaoNotif()
    if (!permitido) return

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Haruy Sushi 🍣',
            body: 'Seu pedido #1042 acabou de sair para entrega!',
            id: 1,
            sound: null,
            attachments: null,
            actionTypeId: '',
            extra: { pedidoId: 1042 },
          },
        ],
      })
      setNotifMensagem({ tipo: 'sucesso', texto: '🔔 Notificação imediata disparada!' })
    } catch (error) {
      setNotifMensagem({ tipo: 'erro', texto: `❌ Erro: ${error.message}` })
    }
  }

  // ─── Agendamento Futuro ─────────────────────────────────────────────────────
  const agendarLembrete = async () => {
    const permitido = await solicitarPermissaoNotif()
    if (!permitido) return

    try {
      const tempoFuturo = new Date(Date.now() + segundosAgendamento * 1000)
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Hora do Remédio! 💊',
            body: 'Está na hora de tomar a Amoxicilina 500mg.',
            id: 42,
            schedule: { at: tempoFuturo },
          },
        ],
      })
      setNotifMensagem({
        tipo: 'sucesso',
        texto: `⏰ Agendada para: ${tempoFuturo.toLocaleTimeString('pt-BR')}`,
      })
    } catch (error) {
      setNotifMensagem({ tipo: 'erro', texto: `❌ Erro: ${error.message}` })
    }
  }

  // ─── Listar Pendentes ───────────────────────────────────────────────────────
  const listarPendentes = async () => {
    try {
      const resultado = await LocalNotifications.getPending()
      setPendentes(resultado.notifications || [])
      setNotifMensagem({
        tipo: 'info',
        texto: `📋 ${resultado.notifications.length} notificação(ões) pendente(s).`,
      })
    } catch (error) {
      setNotifMensagem({ tipo: 'erro', texto: `❌ Erro: ${error.message}` })
    }
  }

  // ─── Cancelar Notificação por ID ────────────────────────────────────────────
  const cancelarNotificacao = async (id) => {
    try {
      await LocalNotifications.cancel({ notifications: [{ id }] })
      setNotifMensagem({ tipo: 'aviso', texto: `🗑️ Notificação #${id} cancelada.` })
      await listarPendentes()
    } catch (error) {
      setNotifMensagem({ tipo: 'erro', texto: `❌ Erro ao cancelar: ${error.message}` })
    }
  }

  // ─── Permissão de Localização ───────────────────────────────────────────────
  // Verifica e solicita permissões de localização
  const verificarPermissoes = async () => {
    try {
      const status = await Geolocation.checkPermissions()
      setPermissaoStatus(status.location)

      if (status.location !== 'granted') {
        const pedido = await Geolocation.requestPermissions()
        setPermissaoStatus(pedido.location)

        if (pedido.location !== 'granted') {
          throw new Error('Permissão de localização negada pelo usuário.')
        }
      }

      return true
    } catch (error) {
      setErro(`Erro de permissão: ${error.message}`)
      return false
    }
  }

  // Captura as coordenadas GPS
  const capturarLocalizacao = async () => {
    setCarregando(true)
    setErro(null)

    try {
      // Primeiro verifica/solicita permissões
      const permitido = await verificarPermissoes()
      if (!permitido) {
        setCarregando(false)
        return
      }

      // Captura a posição com alta precisão (GPS do hardware)
      const posicao = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      })

      setLatitude(posicao.coords.latitude)
      setLongitude(posicao.coords.longitude)
      setPrecisao(posicao.coords.accuracy)
      setErro(null)
    } catch (error) {
      if (error.message.includes('denied') || error.message.includes('permission')) {
        setErro('❌ Permissão de localização negada. Habilite nas configurações do aparelho.')
      } else if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        setErro('⏱️ Tempo esgotado. Verifique se o GPS está ativado e tente novamente.')
      } else {
        setErro(`❌ Erro ao obter localização: ${error.message}`)
      }
    } finally {
      setCarregando(false)
    }
  }

  // Abre as coordenadas no Google Maps
  const abrirNoMapa = () => {
    if (latitude && longitude) {
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      window.open(url, '_blank')
    }
  }

  return (
    <div className="container">
      <header className="header">
        <div className="icon-gps">📍</div>
        <h1>GPS Localizador</h1>
        <p className="subtitulo">Captura de Coordenadas Geográficas</p>
      </header>

      {/* Card de Status da Permissão */}
      {permissaoStatus && (
        <div className={`card-permissao ${permissaoStatus === 'granted' ? 'concedida' : 'negada'}`}>
          <span className="permissao-icone">
            {permissaoStatus === 'granted' ? '✅' : '⚠️'}
          </span>
          <span>
            Permissão: <strong>{permissaoStatus === 'granted' ? 'Concedida' : permissaoStatus}</strong>
          </span>
        </div>
      )}

      {/* Botão Principal */}
      <button
        className={`btn-localizar ${carregando ? 'carregando' : ''}`}
        onClick={capturarLocalizacao}
        disabled={carregando}
      >
        {carregando ? (
          <>
            <span className="spinner"></span>
            Obtendo localização...
          </>
        ) : (
          <>🛰️ Obter Minha Localização</>
        )}
      </button>

      {/* Mensagem de Erro */}
      {erro && (
        <div className="card-erro">
          <p>{erro}</p>
        </div>
      )}

      {/* Card de Coordenadas */}
      {latitude !== null && longitude !== null && (
        <div className="card-coordenadas">
          <h2>📌 Coordenadas Capturadas</h2>

          <div className="coordenada-item">
            <span className="coordenada-label">Latitude</span>
            <span className="coordenada-valor">{latitude.toFixed(6)}°</span>
          </div>

          <div className="coordenada-item">
            <span className="coordenada-label">Longitude</span>
            <span className="coordenada-valor">{longitude.toFixed(6)}°</span>
          </div>

          <div className="coordenada-item">
            <span className="coordenada-label">Precisão</span>
            <span className="coordenada-valor">{precisao ? `${precisao.toFixed(1)} metros` : 'N/A'}</span>
          </div>

          <div className="coordenada-item">
            <span className="coordenada-label">Data/Hora</span>
            <span className="coordenada-valor">{new Date().toLocaleString('pt-BR')}</span>
          </div>

          {/* Botão para abrir no Google Maps */}
          <button className="btn-mapa" onClick={abrirNoMapa}>
            🗺️ Abrir no Google Maps
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SEÇÃO: LOCAL NOTIFICATIONS
      ════════════════════════════════════════════════════════════════════ */}
      <section className="secao-notif">
        <div className="secao-notif-header">
          <span className="secao-notif-icone">🔔</span>
          <h2>Local Notifications</h2>
        </div>
        <p className="secao-notif-desc">
          Notificações geradas pelo dispositivo · funciona offline
        </p>

        {/* Status da permissão de notificação */}
        {notifPermissao && (
          <div className={`card-permissao ${notifPermissao === 'granted' ? 'concedida' : 'negada'}`}>
            <span className="permissao-icone">{notifPermissao === 'granted' ? '✅' : '⚠️'}</span>
            <span>
              Notificação: <strong>{notifPermissao === 'granted' ? 'Concedida' : notifPermissao}</strong>
            </span>
          </div>
        )}

        {/* Feedback de ações */}
        {notifMensagem && (
          <div className={`card-notif-feedback ${notifMensagem.tipo}`}>
            {notifMensagem.texto}
          </div>
        )}

        {/* Botão: Solicitar permissão */}
        <button className="btn-notif btn-permissao" onClick={solicitarPermissaoNotif}>
          🔑 Verificar / Pedir Permissão
        </button>

        {/* Botão: Notificação imediata */}
        <button className="btn-notif btn-imediata" onClick={dispararNotificacaoImediata}>
          ⚡ Disparar Notificação Imediata
        </button>

        {/* Agendamento futuro */}
        <div className="card-agendamento">
          <h3>⏰ Agendar Lembrete</h3>
          <div className="agendamento-controle">
            <label htmlFor="segundos">Disparar em:</label>
            <div className="agendamento-input-group">
              <input
                id="segundos"
                type="number"
                min="5"
                max="3600"
                value={segundosAgendamento}
                onChange={(e) => setSegundosAgendamento(Number(e.target.value))}
                className="input-segundos"
              />
              <span className="input-unidade">segundos</span>
            </div>
          </div>
          <button className="btn-notif btn-agendar" onClick={agendarLembrete}>
            💊 Agendar Hora do Remédio
          </button>
        </div>

        {/* Gerenciar pendentes */}
        <div className="card-pendentes">
          <div className="pendentes-header">
            <h3>📋 Notificações Pendentes</h3>
            <button className="btn-listar" onClick={listarPendentes}>Atualizar</button>
          </div>

          {pendentes.length === 0 ? (
            <p className="pendentes-vazio">Nenhuma notificação agendada.</p>
          ) : (
            <ul className="pendentes-lista">
              {pendentes.map((n) => (
                <li key={n.id} className="pendente-item">
                  <div className="pendente-info">
                    <strong>{n.title}</strong>
                    <span className="pendente-id">ID #{n.id}</span>
                  </div>
                  <button
                    className="btn-cancelar"
                    onClick={() => cancelarNotificacao(n.id)}
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <footer className="footer">
        <p>React + Capacitor • Geolocation + Local Notifications</p>
      </footer>
    </div>
  )
}

export default App
