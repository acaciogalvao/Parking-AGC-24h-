// script.js
import parkingSystem from "./parking.js";
import { realTimeUpdater } from "./realtime-updater.js";
import { Utils } from "./utils.js";

// Estado global
const state = {
    currentReceipt: null,
    settings: {
        faturamentoVisivel: true,
        SENHA_FATURAMENTO: "admin123"
    },
    vagaTimers: {},
    relogioRelatorioInterval: null
};

// Elementos do DOM
const DOM = {
    formEntrada: document.getElementById("form-entrada"),
    formBusca: document.getElementById("form-busca"),
    vagasCarros: document.getElementById("vagas-carros"),
    vagasMotos: document.getElementById("vagas-motos"),
    totalCarros: document.getElementById("total-carros"),
    totalMotos: document.getElementById("total-motos"),
    totalFaturamento: document.getElementById("total-faturamento"),
    modalRecibo: document.getElementById("modal-recibo"),
    reciboContent: document.getElementById("recibo-content"),
    btnEnviarWhatsapp: document.getElementById("btn-enviar-whatsapp"),
    btnEncerrarVaga: document.getElementById("btn-encerrar-vaga"),
    btnFecharRecibo: document.getElementById("btn-fechar-recibo"),
    toggleFaturamentoBtn: document.getElementById("toggle-faturamento"),
    relogioLogo: document.getElementById("relogio-logo"),
    modalFaturamento: document.getElementById("modal-faturamento"),
    btnVerRelatorio: document.getElementById("btn-ver-relatorio"),
    btnZerarFaturamento: document.getElementById("btn-zerar-faturamento"),
    btnFecharFaturamento: document.getElementById("btn-fechar-faturamento"),
    senhaFaturamento: document.getElementById("senha-faturamento"),
    relatorioFaturamento: document.getElementById("relatorio-faturamento"),
    resultadoBusca: document.getElementById("resultado-busca")
};

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    init();
    setupEventListeners();
    startLogoClock();
});

function startLogoClock() {
    setInterval(() => {
        const relogioLogoElement = DOM.relogioLogo;
        const now = new Date();
        relogioLogoElement.textContent = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`;
    }, 1000);
}

function init() {
    renderVagas();
    updateCounters();
    addValidationIcons();
    setupInputMasks();
    startSessionTimer();
    setInterval(() => {
        updateVagasInfo();
    }, 60000);

    function updateVagasInfo() {
        document.querySelectorAll('.tempo-vaga').forEach(el => {
            const startTime = el.getAttribute('data-entry');
            Utils.updateClockAndTimer(el, startTime);
        });
        updateCounters();
    }
}

function setupEventListeners() {
    DOM.formEntrada.addEventListener("submit", handleFormEntrada);
    DOM.formBusca.addEventListener("submit", handleFormBusca);
    DOM.btnEnviarWhatsapp.addEventListener("click", confirmAndSendWhatsapp);
    DOM.btnEncerrarVaga.addEventListener("click", closeAndEndParking);
    DOM.btnFecharRecibo.addEventListener("click", closeModalOnly);
    DOM.toggleFaturamentoBtn.addEventListener("click", toggleFaturamento);

    DOM.btnFecharFaturamento.addEventListener("click", () => {
        DOM.modalFaturamento.style.display = "none";
        DOM.senhaFaturamento.value = "";
        DOM.relatorioFaturamento.style.display = "none";
        DOM.btnZerarFaturamento.disabled = true;
        if (state.relogioRelatorioInterval) {
            clearInterval(state.relogioRelatorioInterval);
            state.relogioRelatorioInterval = null;
        }
    });

    document.querySelector(".faturamento").addEventListener("click", e => {
        if (e.target.closest(".faturamento") && !e.target.closest(".btn-toggle")) {
            DOM.modalFaturamento.style.display = "block";
        }
    });

    DOM.btnVerRelatorio.addEventListener("click", () => {
        if (DOM.senhaFaturamento.value === state.settings.SENHA_FATURAMENTO) {
            DOM.relatorioFaturamento.style.display = "block";
            DOM.btnZerarFaturamento.disabled = false;

            document.getElementById("total-faturamento-relatorio").textContent =
                Utils.formatCurrency(parkingSystem.totalRevenue);

            const occupied = parkingSystem.getOccupiedSpaces();
            document.getElementById("total-carros-relatorio").textContent = occupied.carros;
            document.getElementById("total-motos-relatorio").textContent = occupied.motos;

            const relogioElement = document.getElementById("data-hora-relatorio");
            const now = new Date();
            relogioElement.textContent = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`;
            
            if (state.relogioRelatorioInterval) {
                clearInterval(state.relogioRelatorioInterval);
            }
            state.relogioRelatorioInterval = setInterval(() => {
                const now = new Date();
                relogioElement.textContent = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`;
            }, 1000);
        } else {
            Utils.showToast("Senha incorreta! Acesso não autorizado.", "error");
        }
    });

    DOM.btnZerarFaturamento.addEventListener("click", () => {
        if (confirm("⚠️ ATENÇÃO! Você está prestes a ZERAR todo o faturamento. Esta ação não pode ser desfeita. Deseja continuar?")) {
            parkingSystem.resetRevenue();
            updateCounters();
            document.getElementById("total-faturamento-relatorio").textContent = Utils.formatCurrency(0);
            Utils.showToast("Faturamento zerado com sucesso!", "success");
            DOM.modalFaturamento.style.display = "none";
            DOM.senhaFaturamento.value = "";
            DOM.relatorioFaturamento.style.display = "none";
            DOM.btnZerarFaturamento.disabled = true;
            if (state.relogioRelatorioInterval) {
                clearInterval(state.relogioRelatorioInterval);
                state.relogioRelatorioInterval = null;
            }
        }
    });

    document.addEventListener("click", e => {
        if (e.target.closest(".btn-encerrar")) {
            previewReceipt(e);
        }
        if (e.target.closest(".btn-fechar-busca")) {
            clearSearch();
        }
    });
}

function renderVagas() {
    clearVagaTimers();
    renderVagasPorTipo("carro", DOM.vagasCarros);
    renderVagasPorTipo("moto", DOM.vagasMotos);
}

function clearVagaTimers() {
    Object.values(state.vagaTimers).forEach(timerId => clearInterval(timerId));
    state.vagaTimers = {};
}

function renderVagasPorTipo(vehicleType, container) {
    container.innerHTML = "";
    const spaces = vehicleType === "carro" ? parkingSystem.carSpaces : parkingSystem.motoSpaces;

    spaces.forEach(space => {
        const vagaElement = document.createElement("div");
        vagaElement.className = `vaga ${space.occupied ? "vaga-ocupada" : "vaga-livre"}`;
        vagaElement.setAttribute("data-type", vehicleType);
        vagaElement.setAttribute("data-number", space.number);

        const icon = vehicleType === "carro" ? "fa-car" : "fa-motorcycle";
        let vagaInfoHTML = space.occupied ? `
            <div class="vaga-info">
                <div class="vaga-placa">${vehicleType === "carro" ? "🚗" : "🛵"} ${parkingSystem.formatarPlacaExibicao(space.vehicle.plate)}</div>
                <div class="vaga-horario">🕒 Entrada: ${Utils.formatDateTime(space.vehicle.entryTime)}</div>
                <div class="vaga-tempo">⏱️ Tempo: <span class="tempo-vaga" data-entry="${space.vehicle.entryTime}">00:00:00</span></div>
                <div class="vaga-valor">�� Valor atual: ${Utils.formatCurrency(
                    space.calculateParkingFee(space.calculateMinutes(new Date(space.vehicle.entryTime), new Date()))
                )}</span></div>
            </div>
            <button class="btn-encerrar" data-type="${vehicleType}" data-number="${space.number}">
                <i class="fas fa-stop-circle"></i> Encerrar
            </button>
        ` : `<div class="vaga-info">🅿️ Vaga livre</div>`;

        vagaElement.innerHTML = `
            <div class="vaga-numero">
                <span>${space.number}</span>
                <i class="fas ${icon} vaga-icone"></i>
            </div>
            ${vagaInfoHTML}
        `;

        container.appendChild(vagaElement);

        if (space.occupied) {
            startVagaTimer(space.vehicle.entryTime, vagaElement, space.number, vehicleType);
        }
    });
}

function startVagaTimer(entryTime, vagaElement, spaceNumber, vehicleType) {
    const key = `${vehicleType}-${spaceNumber}`;
    if (state.vagaTimers[key]) clearInterval(state.vagaTimers[key]);

    const tempoElement = vagaElement.querySelector(".tempo-vaga");
    const valorElement = vagaElement.querySelector(".vaga-valor");

    if (!tempoElement || !valorElement) return;

    const updateTimerAndValue = () => {
        const now = new Date();
        const diffMs = now - new Date(entryTime);
        tempoElement.textContent = Utils.formatTime(diffMs);

        const minutesParked = Math.max(0, Math.floor(diffMs / (1000 * 60)));
        const currentValue = Math.round(minutesParked * 0.166666 * 100) / 100;
        valorElement.textContent = Utils.formatCurrency(currentValue);

        const hoursParked = minutesParked / 60;
        vagaElement.style.background =
            hoursParked > 2
                ? "linear-gradient(135deg, #ffcdd2 0%, #ef9a9a 100%)"
                : hoursParked > 1
                ? "linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)"
                : "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)";
    };

    updateTimerAndValue();
    state.vagaTimers[key] = setInterval(updateTimerAndValue, 1000);
}

function handleFormEntrada(event) {
    event.preventDefault();
    try {
        const vehicleType = document.getElementById("tipo-veiculo").value;
        const plate = Utils.sanitizeInput(document.getElementById("placa").value.trim());
        const phone = Utils.sanitizeInput(document.getElementById("telefone").value.trim());

        if (!vehicleType) {
            Utils.showToast("Por favor, selecione o tipo de veículo.", "warning");
            return;
        }

        if (!Utils.validatePlate(plate)) {
            Utils.showToast("Por favor, insira uma placa válida (formato: ABC1D23 ou ABC1234).", "warning");
            return;
        }

        if (!Utils.validatePhone(phone)) {
            Utils.showToast("Por favor, insira um telefone válido (formato: (11) 98765-4321).", "warning");
            return;
        }

        const existingVehicle = parkingSystem.findVehicleByPlate(plate);
        if (existingVehicle) {
            Utils.showToast(`Este veículo já está estacionado na vaga ${existingVehicle.number} (${existingVehicle.type === "carro" ? "carro" : "moto"}).`, "warning");
            return;
        }

        const freeSpace = parkingSystem.findFreeSpace(vehicleType);
        if (!freeSpace) {
            Utils.showToast(`Não há vagas disponíveis para ${vehicleType === "carro" ? "carros" : "motos"}.`, "warning");
            return;
        }

        const success = parkingSystem.occupySpace(vehicleType, freeSpace.number, plate, phone);
        if (success) {
            Utils.showToast(`Veículo estacionado com sucesso na vaga ${freeSpace.number}!`, "success");
            renderVagas();
            updateCounters();
            DOM.formEntrada.reset();
            document.querySelectorAll(".validation-icon").forEach(icon => {
                icon.innerHTML = "";
            });
        } else {
            Utils.showToast("Ocorreu um erro ao estacionar o veículo. Por favor, tente novamente.", "error");
        }
    } catch (error) {
        console.error("Erro no formulário de entrada:", error);
        Utils.showToast("Erro ao processar entrada. Tente novamente.", "error");
    }
}

function handleFormBusca(event) {
    event.preventDefault();
    try {
        const plate = Utils.sanitizeInput(document.getElementById("busca-placa").value.trim());

        if (!plate) {
            DOM.resultadoBusca.innerHTML = '<div class="alert">⚠️ Por favor, digite uma placa para buscar.</div>';
            return;
        }

        realTimeUpdater.removeUpdater("busca");
        realTimeUpdater.removeUpdater("buscaRelogio");

        const vehicle = parkingSystem.findVehicleByPlate(plate);
        if (vehicle) {
            const entryTime = new Date(vehicle.vehicle.entryTime);
            const now = new Date();
            const minutesParked = vehicle.calculateMinutes(entryTime, now);
            const amountDue = vehicle.calculateParkingFee(minutesParked);

            DOM.resultadoBusca.innerHTML = `
                <div class="found-vehicle">
                    <div class="busca-header">
                        <h3><i class="fas ${vehicle.type === "carro" ? "fa-car" : "fa-motorcycle"}"></i> Veículo Encontrado <span class="relogio-busca"></span></h3>
                        <button class="btn-fechar-busca">×</button>
                    </div>
                    <p><strong>🔢 Placa:</strong> ${parkingSystem.formatarPlacaExibicao(vehicle.vehicle.plate)}</p>
                    <p><strong>🚦 Tipo:</strong> ${vehicle.type === "carro" ? "🚗 Carro" : "🛵 Moto"}</p>
                    <p><strong>🅿️ Vaga:</strong> ${vehicle.number}</p>
                    <p><strong>⏱️ Entrada:</strong> ${Utils.formatDateTime(entryTime)}</p>
                    <p><strong>⏳ Tempo estacionado:</strong> <span class="tempo-dinamico-busca">00:00:00</span></p>
                    <p><strong>💰 Valor devido:</strong> <span class="valor-dinamico-busca">${Utils.formatCurrency(amountDue)}</span></p>
                </div>
            `;

            startRealTimeUpdatesBusca(vehicle);
        } else {
            DOM.resultadoBusca.innerHTML = '<div class="alert">⚠️ Nenhum veículo encontrado com esta placa.</div>';
        }
    } catch (error) {
        console.error("Erro na busca:", error);
        Utils.showToast("Erro ao buscar veículo. Tente novamente.", "error");
    }
}

function updateCounters() {
    const freeSpaces = parkingSystem.getFreeSpaces();
    DOM.totalCarros.textContent = 30 - freeSpaces.carros;
    DOM.totalMotos.textContent = 30 - freeSpaces.motos;
    DOM.totalFaturamento.innerHTML = `
        <span class="valor-faturamento">${Utils.formatCurrency(parkingSystem.totalRevenue)}</span>
    `;
}

function toggleFaturamento() {
    state.settings.faturamentoVisivel = !state.settings.faturamentoVisivel;
    const faturamentoContainer = document.querySelector(".faturamento");
    faturamentoContainer.classList.toggle("hidden", !state.settings.faturamentoVisivel);
    DOM.toggleFaturamentoBtn.innerHTML = state.settings.faturamentoVisivel
        ? '<i class="fas fa-eye-slash"></i>'
        : '<i class="fas fa-eye"></i>';
}

function addValidationIcons() {
    const inputs = [
        document.getElementById("placa"),
        document.getElementById("telefone"),
        document.getElementById("busca-placa")
    ];

    inputs.forEach(input => {
        const icon = document.createElement("span");
        icon.className = "validation-icon";
        input.parentNode.insertBefore(icon, input.nextSibling);
    });
}

function setupInputMasks() {
    const telefoneInput = document.getElementById("telefone");
    telefoneInput.addEventListener("input", e => {
        e.target.value = Utils.formatPhone(e.target.value);
        updateValidationIcon(e.target);
    });

    const placaInputs = [document.getElementById("placa"), document.getElementById("busca-placa")];
    placaInputs.forEach(input =>
        input.addEventListener("input", e => {
            e.target.value = Utils.formatPlate(e.target.value);
            updateValidationIcon(e.target);
        })
    );
}

function updateValidationIcon(input) {
    const icon = input.nextElementSibling;
    if (!icon || !icon.classList.contains("validation-icon")) return;

    if (input.value.length === 0) {
        icon.innerHTML = "";
    } else if (
        (input.id === "placa" || input.id === "busca-placa") &&
        Utils.validatePlate(input.value)
    ) {
        icon.innerHTML = '<i class="fas fa-check-circle valid"></i>';
    } else if (input.id === "telefone" && Utils.validatePhone(input.value)) {
        icon.innerHTML = '<i class="fas fa-check-circle valid"></i>';
    } else {
        icon.innerHTML = '<i class="fas fa-times-circle invalid"></i>';
    }
}

function startRealTimeUpdatesBusca(vehicle) {
    const entryTime = new Date(vehicle.vehicle.entryTime);
    const tempoElement = DOM.resultadoBusca.querySelector(".tempo-dinamico-busca");
    const valorElement = DOM.resultadoBusca.querySelector(".valor-dinamico-busca");
    const relogioElement = DOM.resultadoBusca.querySelector(".relogio-busca");

    const updateBuscaValues = () => {
        const now = new Date();
        const elapsed = now - entryTime;
        if (tempoElement) tempoElement.textContent = Utils.formatTime(elapsed);

        const minutesParked = vehicle.calculateMinutes(entryTime, now);
        const amountDue = vehicle.calculateParkingFee(minutesParked);
        if (valorElement)
            valorElement.textContent = Utils.formatCurrency(amountDue);
    };

    Utils.updateClock(relogioElement);
    realTimeUpdater.addUpdater("buscaRelogio", () => Utils.updateClock(relogioElement), 1000);
    realTimeUpdater.addUpdater("busca", updateBuscaValues, 1000);
}

function previewReceipt(event) {
    const button = event.target.closest(".btn-encerrar");
    if (!button) return;

    const vehicleType = button.getAttribute("data-type");
    const spaceNumber = parseInt(button.getAttribute("data-number"));
    const spaces = vehicleType === "carro" ? parkingSystem.carSpaces : parkingSystem.motoSpaces;
    const space = spaces.find(s => s.number === spaceNumber);

    if (space && space.occupied) {
        const entryTime = new Date(space.vehicle.entryTime);
        const exitTime = new Date();
        const minutesParked = space.calculateMinutes(entryTime, exitTime);
        const amountDue = space.calculateParkingFee(minutesParked);

        state.currentReceipt = {
            spaceNumber: space.number,
            vehicleType: space.type,
            plate: space.vehicle.plate,
            entryTime,
            exitTime,
            minutesParked,
            amountDue,
            phone: space.vehicle.phone
        };

        showReceiptPreview(state.currentReceipt);
    }
}

function showReceiptPreview(receipt) {
    realTimeUpdater.removeUpdater("tempo");
    realTimeUpdater.removeUpdater("relogioModal");

    DOM.reciboContent.innerHTML = `
        <div class="recibo-header">
            <h3>📋 Parking AGC 24h</h3>
            <p>Prévia do Recibo de Estacionamento</p>
        </div>
        <div class="recibo-item">
            <span>🅿️ Vaga:</span>
            <span class="recibo-valor">${receipt.spaceNumber} (${receipt.vehicleType === "carro" ? "🚗 Carro" : "🛵 Moto"})</span>
        </div>
        <div class="recibo-item">
            <span>🔢 Placa:</span>
            <span class="recibo-valor">${parkingSystem.formatarPlacaExibicao(receipt.plate)}</span>
        </div>
        <div class="recibo-item">
            <span>⏱️ Entrada:</span>
            <span class="recibo-valor">${Utils.formatDateTime(receipt.entryTime)}</span>
        </div>
        <div class="recibo-item">
            <span>⏱️ Saída:</span>
            <span class="recibo-valor saida-time">${Utils.formatDateTime(new Date())}</span>
        </div>
        <div class="recibo-item">
            <span>⏳ Tempo estacionado:</span>
            <span class="recibo-valor tempo-dinamico">00:00:00</span>
        </div>
        <div class="recibo-item">
            <span>💰 Valor atual:</span>
            <span class="recibo-valor valor-dinamico">${Utils.formatCurrency(receipt.amountDue)}</span>
        </div>
        <div class="recibo-total">
            <span>Total estimado:</span>
            <span class="valor-total">${Utils.formatCurrency(receipt.amountDue)}</span>
        </div>
        <div class="recibo-footer">
            <p>Confirme o encerramento ou cancele.</p>
        </div>
    `;

    DOM.modalRecibo.style.display = "block";

    const tempoElement = DOM.reciboContent.querySelector(".tempo-dinamico");
    const valorElement = DOM.reciboContent.querySelector(".valor-dinamico");
    const saidaElement = DOM.reciboContent.querySelector(".saida-time");
    const valorTotalElement = DOM.reciboContent.querySelector(".valor-total");
    const entryTime = new Date(receipt.entryTime);

    const relogioModal = DOM.reciboContent.querySelector(".relogio-modal");
    Utils.updateClock(relogioModal);
    realTimeUpdater.addUpdater("relogioModal", () => Utils.updateClock(relogioModal), 1000);

    updateReciboValues(entryTime, tempoElement, valorElement, saidaElement, valorTotalElement);
    realTimeUpdater.addUpdater("tempo", () =>
        updateReciboValues(entryTime, tempoElement, valorElement, saidaElement, valorTotalElement),
        1000
    );
}

function updateReciboValues(entryTime, tempoElement, valorElement, saidaElement, valorTotalElement) {
    const now = new Date();
    const diffMs = now - entryTime;

    tempoElement.textContent = Utils.formatTime(diffMs);
    saidaElement.textContent = Utils.formatDateTime(now);

    const minutesParked = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    const amountDue = Math.round(minutesParked * 0.166666 * 100) / 100;

    valorElement.textContent = Utils.formatCurrency(amountDue);
    valorTotalElement.textContent = Utils.formatCurrency(amountDue);
}

function confirmAndSendWhatsapp() {
    if (!state.currentReceipt) return;

    const receipt = parkingSystem.freeSpace(state.currentReceipt.vehicleType, state.currentReceipt.spaceNumber);

    if (receipt) {
        const now = new Date();
        receipt.exitTime = now;
        receipt.minutesParked = Math.max(0, Math.floor((now - new Date(receipt.entryTime)) / (1000 * 60)));
        receipt.amountDue = Math.round(receipt.minutesParked * 0.166666 * 100) / 100;

        DOM.modalRecibo.style.display = "none";
        renderVagas();
        updateCounters();
        clearSearchIfShowing(receipt.plate);

        const phone = receipt.phone.replace(/\D/g, "");
        if (!phone) {
            Utils.showToast("Número de telefone não disponível para envio.", "warning");
            return;
        }

        const message =
            `*Recibo de Estacionamento - Parking AGC 24h*%0A%0A` +
            `*🔢 Placa:* ${parkingSystem.formatarPlacaExibicao(receipt.plate)}%0A` +
            `*🅿️ Vaga:* ${receipt.spaceNumber} (${receipt.vehicleType === "carro" ? "🚗 Carro" : "🛵 Moto"})%0A` +
            `*⏱️ Entrada:* ${Utils.formatDateTime(receipt.entryTime)}%0A` +
            `*⏱️ Saída:* ${Utils.formatDateTime(receipt.exitTime)}%0A` +
            `*⏳ Tempo:* ${receipt.minutesParked} minutos%0A` +
            `*💰 Total:* ${Utils.formatCurrency(receipt.amountDue)}%0A%0A` +
            `Obrigado por utilizar nossos serviços!`;

        const whatsappUrl = `https://wa.me/55${phone}?text=${message}`;
        window.open(whatsappUrl, "_blank");

        realTimeUpdater.removeUpdater("tempo");
        realTimeUpdater.removeUpdater("relogioModal");
        state.currentReceipt = null;
    }
}

function closeAndEndParking() {
    realTimeUpdater.removeUpdater("tempo");
    realTimeUpdater.removeUpdater("relogioModal");

    if (state.currentReceipt) {
        const receipt = parkingSystem.freeSpace(state.currentReceipt.vehicleType, state.currentReceipt.spaceNumber);
        if (receipt) {
            renderVagas();
            updateCounters();
            clearSearchIfShowing(receipt.plate);
        }
    }

    DOM.modalRecibo.style.display = "none";
    state.currentReceipt = null;
}

function closeModalOnly() {
    realTimeUpdater.removeUpdater("tempo");
    realTimeUpdater.removeUpdater("relogioModal");
    DOM.modalRecibo.style.display = "none";
    state.currentReceipt = null;
}

function clearSearchIfShowing(plate) {
    const vehicleDisplayed = DOM.resultadoBusca.querySelector(".found-vehicle");
    if (vehicleDisplayed) {
        const displayedPlate = vehicleDisplayed
            .querySelector("p:nth-child(1)")
            .textContent.split(":")[1]
            .trim()
            .replace(/-/g, "")
            .toUpperCase();
        const normalizedPlate = parkingSystem.normalizarPlaca(plate);

        if (displayedPlate === normalizedPlate) {
            clearSearch();
        }
    }
}

function clearSearch() {
    DOM.resultadoBusca.innerHTML = "";
    document.getElementById("busca-placa").value = "";
    realTimeUpdater.removeUpdater("busca");
    realTimeUpdater.removeUpdater("buscaRelogio");

    const validationIcon = document.getElementById("busca-placa").nextElementSibling;
    if (validationIcon && validationIcon.classList.contains("validation-icon")) {
        validationIcon.innerHTML = "";
    }
}

function startSessionTimer() {
    let timeout;
    const resetTimer = () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            if (confirm("Sua sessão expirou. Deseja continuar?")) {
                resetTimer();
            } else {
                parkingSystem.saveToLocalStorage();
                window.location.reload();
            }
        }, 30 * 60 * 1000); // 30 minutos
    };

    resetTimer();
    document.addEventListener("click", resetTimer);
    document.addEventListener("keypress", resetTimer);
}

// Exportar para testes
if (typeof module !== "undefined" && module.exports) {
    module.exports = { parkingSystem, Utils, realTimeUpdater };
}