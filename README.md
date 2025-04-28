# Parking AGC 24h - Sistema de Gerenciamento de Estacionamento

Sistema completo para gerenciamento de estacionamentos 24 horas com controle de vagas, faturamento em tempo real e emissão de recibos automatizados.

## 📌 Índice

- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Usar](#-como-usar)
- [Contribuição](#-contribuição)
- [Licença](#-licença)
- [Autor](#-autor)

## 🚀 Funcionalidades

### 🅿 Controle de Vagas
- Monitoramento em tempo real de vagas para carros e motos
- Capacidade para 30 vagas de cada tipo
- Identificação visual de vagas ocupadas/livres
- Destaque para veículos estacionados há muito tempo

### 📝 Registro de Entradas
- Cadastro de veículos com placa e telefone do cliente
- Validação automática de formatos de placa (Mercosul e antigo)
- Formatação automática de telefones
- Prevenção de duplicação de veículos

### 🔍 Sistema de Busca
- Localização rápida de veículos pela placa
- Visualização de tempo estacionado e valor atual
- Atualização em tempo real dos valores durante a busca

### 💰 Faturamento
- Cálculo automático de valores baseado no tempo
- Taxa de R$ 0,1666 por minuto (R$ 10,00 por hora)
- Relatório detalhado com senha de acesso
- Opção para zerar o faturamento (com confirmação)

### 📄 Recibos Automáticos
- Geração de recibos detalhados
- Cálculo em tempo real do valor devido
- Envio direto por WhatsApp para o cliente
- Histórico completo de transações

### ⏱️ Funcionalidades em Tempo Real
- Atualização contínua do tempo estacionado
- Cálculo dinâmico do valor devido
- Relógio sincronizado em todo o sistema
- Notificações toast para ações do usuário

## 💻 Tecnologias Utilizadas

### Frontend
- HTML5 semântico
- CSS3 moderno com Flexbox e Grid
- JavaScript ES6+
- Font Awesome para ícones
- Design responsivo para todos os dispositivos

### Backend (Client-side)
- Sistema baseado em classes JavaScript
- Armazenamento local com localStorage
- Singleton pattern para o sistema de estacionamento
- Gerenciamento de tempo real com intervalos otimizados

## 🛠️ Instalação e Configuração

1. **Requisitos**:
   - Navegador moderno (Chrome, Firefox, Edge)
   - Acesso ao JavaScript (não bloqueado)

2. **Instalação**:
   ```bash
   git clone https://github.com/seu-usuario/parking-agc-24h.git
   cd parking-agc-24h
   ```

3. **Execução**:
   - Basta abrir o arquivo `index.html` em qualquer navegador moderno
   - Não requer servidor ou instalação adicional

4. **Configuração**:
   - Senha padrão do relatório de faturamento: `admin123`
   - Pode ser alterada no arquivo `script.js` (linha ~12)

## 📂 Estrutura do Projeto

```
parking-agc-24h/
├── index.html          # Página principal
├── css/
│   └── style.css       # Estilos principais
├── js/
│   ├── parking.js      # Lógica principal do estacionamento
│   ├── script.js       # Controle da interface
│   ├── utils.js        # Funções utilitárias
│   ├── validation.js   # Validação de dados
│   └── realtime-updater.js # Gerenciador de atualizações
```

## 🎮 Como Usar

1. **Registrar Entrada**:
   - Selecione o tipo de veículo (carro ou moto)
   - Informe a placa (formatos aceitos: ABC1234 ou ABC1D23)
   - Informe o telefone do cliente
   - Confirme a entrada

2. **Buscar Veículo**:
   - Digite a placa no campo de busca
   - Visualize todas as informações do veículo
   - Tempo e valor são atualizados em tempo real

3. **Encerrar Estadia**:
   - Clique no botão "Encerrar" na vaga ocupada
   - Confirme o recibo gerado
   - Escolha enviar por WhatsApp ou apenas encerrar

4. **Relatório de Faturamento**:
   - Clique no valor do faturamento no cabeçalho
   - Insira a senha para visualizar o relatório completo
   - Opção para zerar o faturamento disponível

## 🤝 Contribuição

Contribuições são bem-vindas! Siga estes passos:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📜 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

## ✏️ Autor

**Acácio Galvão** - 2025
---

Este projeto foi desenvolvido com ❤️ para simplificar o gerenciamento de estacionamentos.
