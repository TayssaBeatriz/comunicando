const valor = document.getElementById("valor");
const menuOrbital = document.getElementById("menuOrbital");
const botoesMenu = [...menuOrbital.querySelectorAll(".satelite")];
const palavrasChave = [
    "eu", "quero", "preciso", "gostaria", "não", "sim", "por favor",
    "obrigado", "ajuda", "água", "comida", "banheiro", "dor"
];
const frasesRapidas = [
    "olá", "tudo bem", "pode ajudar", "quero ir para casa", "estou com dor",
    "preciso de água", "não entendi", "mais devagar", "até logo", "obrigado"
];
const sugestoesPorPalavra = {
    eu: ["quero", "preciso", "gostaria", "estou", "não sei", "posso", "vou", "tenho", "não quero", "quero ajuda"],
    quero: ["água", "comida", "ir ao banheiro", "ajuda", "falar", "ir para casa", "descansar", "saber", "parar", "mais tempo"],
    preciso: ["de ajuda", "de água", "de comida", "ir ao banheiro", "descansar", "falar com alguém", "de remédio", "ir para casa", "de tempo", "entender"],
    não: ["quero", "sei", "entendi", "posso", "estou bem", "gosto", "preciso", "consigo", "tenho certeza", "obrigado"],
    sim: ["por favor", "eu quero", "eu posso", "está bem", "obrigado", "vamos", "agora", "quero isso", "entendi", "claro"],
    ajuda: ["por favor", "agora", "para mim", "com isso", "eu preciso", "não consigo", "estou com dor", "quero falar", "por aqui", "obrigado"],
    agua: ["por favor", "eu quero", "preciso de", "agora", "um pouco", "mais água", "para beber", "obrigado", "estou com sede", "quero beber"],
    comida: ["por favor", "eu quero", "preciso de", "agora", "um pouco", "mais comida", "para comer", "obrigado", "estou com fome", "quero comer"],
    banheiro: ["por favor", "quero ir", "preciso ir", "agora", "onde fica", "me acompanhe", "com ajuda", "obrigado", "urgente", "vamos"],
    dor: ["estou com", "muita dor", "aqui", "preciso de ajuda", "agora", "por favor", "não estou bem", "chame alguém", "remédio", "obrigado"]
};

const aneis = [
    { elemento: document.getElementById("anelExterno"), quantidade: 13, teclas: [], palavras: palavrasChave },
    { elemento: document.getElementById("anelMeio"), quantidade: 13, teclas: [], palavras: [] },
    { elemento: document.getElementById("anelInterno"), quantidade: 10, teclas: [], palavras: [] }
];

let teclaAtiva = null;
let direcaoAtiva = "cima";
let aberturaDoMenuPendente = null;

function normalizarPalavra(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function palavraAtual() {
    const palavras = valor.textContent.trim().split(/\s+/);
    return normalizarPalavra(palavras.at(-1) || "");
}

function preencherAte(palavras, quantidade, reserva) {
    const resultado = [...palavras];
    reserva.forEach((palavra) => {
        if (resultado.length < quantidade && !resultado.includes(palavra)) resultado.push(palavra);
    });
    return resultado.slice(0, quantidade);
}

function atualizarTextoDasTeclas(anel, palavras) {
    anel.palavras = palavras;
    anel.teclas.forEach((tecla, indice) => {
        const texto = palavras[indice];
        tecla.textContent = texto;
        tecla.dataset.valor = texto;
        tecla.setAttribute("aria-label", `Sugestão: ${texto}`);
    });
}

function atualizarSugestoes() {
    const sugestoes = sugestoesPorPalavra[palavraAtual()] || [
        "quero", "preciso", "por favor", "ajuda", "agora", "mais", "de novo",
        "está bem", "não entendi", "obrigado"
    ];

    atualizarTextoDasTeclas(aneis[0], palavrasChave);
    atualizarTextoDasTeclas(aneis[1], preencherAte(sugestoes, 13, palavrasChave));
    atualizarTextoDasTeclas(aneis[2], preencherAte(sugestoes, 10, frasesRapidas));
}

function adicionarPalavra(texto) {
    if (!texto) return;
    valor.textContent = `${valor.textContent.trim()} ${texto}`.trim();
    atualizarSugestoes();
}

function direcaoDoAngulo(angulo) {
    const x = Math.cos(angulo * Math.PI / 180);
    const y = Math.sin(angulo * Math.PI / 180);
    if (Math.abs(x) >= Math.abs(y)) return x >= 0 ? "direita" : "esquerda";
    return y >= 0 ? "baixo" : "cima";
}

function setaDoMenu(tecla) {
    return { direita: "ArrowRight", esquerda: "ArrowLeft", cima: "ArrowUp", baixo: "ArrowDown" }[tecla.dataset.direcao];
}

function setaRetornaAoTeclado(teclaPressionada) {
    return { direita: "ArrowLeft", esquerda: "ArrowRight", cima: "ArrowDown", baixo: "ArrowUp" }[direcaoAtiva] === teclaPressionada;
}

function mostrarCunha(anel, posicao) {
    const abertura = 360 / anel.quantidade;
    const inicio = posicao * abertura - abertura / 2;
    aneis.forEach((outroAnel) => outroAnel.cunha.classList.remove("ativa"));
    anel.cunha.style.background = `conic-gradient(from ${inicio}deg, rgb(47 143 91 / 72%) 0deg ${abertura}deg, transparent ${abertura}deg 360deg)`;
    anel.cunha.classList.add("ativa");
}

function selecionarTecla(tecla, anel, posicao) {
    teclaAtiva = tecla;
    direcaoAtiva = tecla.dataset.direcao;
    menuOrbital.dataset.direcao = direcaoAtiva;
    menuOrbital.classList.add("ativo");
    mostrarCunha(anel, posicao);
}

function focarTecla(anelDestino, posicaoDestino) {
    aneis.forEach((anel) => anel.teclas.forEach((tecla) => (tecla.tabIndex = -1)));
    const proximaTecla = aneis[anelDestino].teclas[posicaoDestino];
    proximaTecla.tabIndex = 0;
    proximaTecla.focus();
}

function abrirMenuOrbital() {
    const { tecla, anel, posicao } = aberturaDoMenuPendente;
    aberturaDoMenuPendente = null;
    selecionarTecla(tecla, anel, posicao);
    botoesMenu.forEach((botao, indice) => (botao.tabIndex = indice === 0 ? 0 : -1));
    botoesMenu[0].focus();
}

function moverNoTeclado(evento, indiceAnel, posicaoAtual, tecla) {
    if (["Enter", " "].includes(evento.key)) {
        evento.preventDefault();
        adicionarPalavra(tecla.dataset.valor);
        return;
    }

    if (aberturaDoMenuPendente && evento.key === aberturaDoMenuPendente.seta) {
        evento.preventDefault();
        abrirMenuOrbital();
        return;
    }

    const anelAtual = aneis[indiceAnel];
    let proximoAnel = indiceAnel;
    let proximaPosicao = posicaoAtual;
    switch (evento.key) {
        case "ArrowLeft": proximaPosicao = (posicaoAtual + anelAtual.quantidade - 1) % anelAtual.quantidade; break;
        case "ArrowRight": proximaPosicao = (posicaoAtual + 1) % anelAtual.quantidade; break;
        case "ArrowUp":
            proximoAnel = (indiceAnel + aneis.length - 1) % aneis.length;
            proximaPosicao = Math.round((posicaoAtual / anelAtual.quantidade) * aneis[proximoAnel].quantidade) % aneis[proximoAnel].quantidade;
            break;
        case "ArrowDown":
            proximoAnel = (indiceAnel + 1) % aneis.length;
            proximaPosicao = Math.round((posicaoAtual / anelAtual.quantidade) * aneis[proximoAnel].quantidade) % aneis[proximoAnel].quantidade;
            break;
        default: return;
    }

    aberturaDoMenuPendente = indiceAnel === 0 && evento.key === setaDoMenu(tecla)
        ? { tecla, anel: anelAtual, posicao: posicaoAtual, seta: evento.key }
        : null;
    evento.preventDefault();
    focarTecla(proximoAnel, proximaPosicao);
}

function moverNoMenu(evento, indiceAtual) {
    if (setaRetornaAoTeclado(evento.key)) {
        evento.preventDefault();
        teclaAtiva.focus();
        return;
    }
    const anterior = ["ArrowUp", "ArrowLeft"].includes(evento.key);
    const proximo = ["ArrowDown", "ArrowRight"].includes(evento.key);
    if (!anterior && !proximo) return;
    evento.preventDefault();
    const indiceDestino = (indiceAtual + (anterior ? botoesMenu.length - 1 : 1)) % botoesMenu.length;
    botoesMenu.forEach((botao) => (botao.tabIndex = -1));
    botoesMenu[indiceDestino].tabIndex = 0;
    botoesMenu[indiceDestino].focus();
}

aneis.forEach((anel, indiceAnel) => {
    const cunha = document.createElement("div");
    cunha.className = "cunha";
    anel.elemento.appendChild(cunha);
    anel.cunha = cunha;

    for (let posicao = 0; posicao < anel.quantidade; posicao += 1) {
        const tecla = document.createElement("button");
        const angulo = (posicao / anel.quantidade) * 360 - 90;
        const raio = indiceAnel === 0 ? 80 : indiceAnel === 1 ? 72 : 55;
        const x = 50 + Math.cos(angulo * Math.PI / 180) * raio * 0.5;
        const y = 50 + Math.sin(angulo * Math.PI / 180) * raio * 0.5;
        tecla.className = "tecla";
        tecla.type = "button";
        tecla.tabIndex = posicao === 0 && indiceAnel === 0 ? 0 : -1;
        tecla.dataset.direcao = direcaoDoAngulo(angulo);
        tecla.style.left = `${x}%`;
        tecla.style.top = `${y}%`;
        tecla.style.transform = "translate(-50%, -50%)";
        tecla.addEventListener("click", () => adicionarPalavra(tecla.dataset.valor));
        tecla.addEventListener("mouseenter", () => selecionarTecla(tecla, anel, posicao));
        tecla.addEventListener("focus", () => selecionarTecla(tecla, anel, posicao));
        tecla.addEventListener("keydown", (evento) => moverNoTeclado(evento, indiceAnel, posicao, tecla));
        anel.teclas.push(tecla);
        anel.elemento.appendChild(tecla);
    }
});

botoesMenu.forEach((botao, indice) => {
    botao.tabIndex = -1;
    botao.addEventListener("keydown", (evento) => moverNoMenu(evento, indice));
});

document.getElementById("limpar").addEventListener("click", () => { valor.textContent = ""; atualizarSugestoes(); });
document.getElementById("excluir").addEventListener("click", () => { valor.textContent = valor.textContent.trim().split(/\s+/).slice(0, -1).join(" "); atualizarSugestoes(); });
document.getElementById("falar").addEventListener("click", () => alert("Reconhecimento de voz será adicionado em breve."));
document.getElementById("concluir").addEventListener("click", () => console.log("Frase formada:", valor.textContent));

atualizarSugestoes();
aneis[0].teclas[0].focus();