<div align="center">
  <h1>🎮 GameCast - Master Edition</h1>
  <p><strong>A alternativa definitiva, leve e P2P para compartilhamento de tela entre gamers.</strong></p>
  <p><em>"Esse é um site para gamers que usam o Discord até o Discord voltar atrás."</em></p>
</div>

<br>

## 🚀 Sobre o Projeto

O **GameCast** (também referenciado como *Backseat P2P*) é uma plataforma web de **screencasting em tempo real** construída com WebRTC e Firebase. Desenvolvido com foco no público gamer, ele resolve o problema de quedas de qualidade e limites de banda de outras plataformas, estabelecendo conexões Peer-to-Peer (P2P) diretas e de baixíssima latência entre quem transmite e quem assiste.

Perfeito para quem quer fazer *backseat gaming*, assistir campeonatos com os amigos ou compartilhar a tela sem depender de servidores intermediários pesados.

## ✨ Principais Funcionalidades

- **📡 Conexão P2P Pura (WebRTC):** Transmissão direta entre os usuários, garantindo a menor latência possível e alta qualidade de imagem.
- **🪟 Multitelas Flutuantes (PiP Dinâmico):** Assista a várias transmissões simultaneamente. As janelas são flutuantes, arrastáveis e totalmente redimensionáveis.
- **⚙️ Otimização Inteligente de Bitrate:** Ajuste automático ou manual de resolução e bitrate (suporte a VP8, VP9 e AV1) adaptando-se à qualidade da sua rede.
- **🔊 Áudio do Sistema Nativo:** Captura do áudio do jogo em alta fidelidade com medidor de volume interativo (LED indicativo).
- **📊 Monitoramento de Banda:** Acompanhe o consumo de upload ao vivo diretamente na interface.
- **🖥️ Versão Web e Desktop:** Pode ser rodado diretamente no navegador ou baixado como executável (`.exe`) para integração com o desktop.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript Vanilla (Design responsivo e Dark Mode nativo).
- **Comunicação:** [WebRTC](https://webrtc.org/) (RTCPeerConnection, getUserMedia, getDisplayMedia).
- **Sinalização (Signaling):** [Firebase Realtime Database](https://firebase.google.com/products/realtime-database).

## 🎯 Como Usar

### Como Host (Transmissor)
1. Acesse o site ou abra o aplicativo desktop.
2. Digite um "Nick da Sala" no menu lateral esquerdo.
3. Clique em **"CRIAR SALA INTELIGENTE"**.
4. Selecione a tela ou jogo que deseja transmitir (o áudio do sistema será capturado automaticamente).
5. Seus amigos verão sua sala na lista e poderão entrar com um clique!

### Como Viewer (Espectador)
1. Acesse a aplicação.
2. No menu lateral esquerdo, clique em **"Assistir"** ao lado da sala desejada.
3. Uma janela flutuante se abrirá. Você pode arrastá-la pela tela e redimensioná-la pelo ícone de régua 📏.

## 📥 Instalação (Local / Fork)

Caso queira rodar o projeto na sua própria máquina ou customizar:

```bash
# Clone o repositório
git clone https://github.com/wanderlycan/screencasting.git

# Entre na pasta
cd screencasting

# Abra o index.html no seu navegador favorito ou use um Live Server
```
*(Nota: Para a captura de áudio do sistema funcionar perfeitamente em alguns navegadores web, é recomendado o uso de HTTPS ou localhost).*

---

## 🔍 Tags e SEO (Search Engine Optimization)

> **Nota para indexação:** As palavras-chave abaixo ajudam o Google e a busca do GitHub a recomendarem este repositório para usuários buscando alternativas de compartilhamento de tela.

**Tópicos (GitHub Topics):**  
`webrtc` `p2p` `screencasting` `discord-alternative` `screen-share` `firebase` `javascript` `gamecast` `streaming` `peer-to-peer`

**Keywords (Google Search):**  
*Screencasting P2P, alternativa ao Discord para compartilhar tela, compartilhar tela de jogos sem lag, WebRTC screen share, transmissão de tela P2P, assistir amigos jogando, gamecast master edition, Backseat P2P, streaming leve para gamers, open source screen sharing HTML JS.*

---
<div align="center">
  Feito com ☕ e muito código. Se curtiu o projeto, considere apoiar via Pix diretamente na interface do app! ⭐ Deixe uma estrela no repositório!
</div>
