function ajustarPeriodoCovid(data) {
    const inicioCovid = new Date(2020, 5, 29);
    const fimCovid = new Date(2021, 10, 13);
    const dataAlvo = new Date(2021, 10, 14);
    
    if (data >= inicioCovid && data <= fimCovid) {
        const diasAdicionais = Math.floor((dataAlvo - data) / (1000 * 60 * 60 * 24));
        return new Date(data.getTime() + diasAdicionais * 24 * 60 * 60 * 1000);
    }
    return data;
}

function adicionarDiasExtra(dataInicial, dias) {
    let dataFinal = new Date(dataInicial.getTime() + dias * 24 * 60 * 60 * 1000);
    let dataAtual = new Date(dataInicial);

    while (dataAtual < dataFinal) {
        // Verifica se a data atual é 20/12 e se não está dentro do período de 140 dias
        if (dataAtual.getMonth() === 11 && dataAtual.getDate() === 20) {
            const periodo140Dias = new Date(dataInicial.getTime() + 140 * 24 * 60 * 60 * 1000);
            if (dataAtual > periodo140Dias) {
                dataFinal = new Date(dataFinal.getTime() + 32 * 24 * 60 * 60 * 1000);
            }
        }
        dataAtual.setDate(dataAtual.getDate() + 1);
    }

    return ajustarPeriodoCovid(dataFinal);
}

function ajustarDataFinal(dataFinal) {
    if ((dataFinal.getMonth() === 11 && dataFinal.getDate() >= 20) || 
        (dataFinal.getMonth() === 0 && dataFinal.getDate() <= 20)) {
        const diasPassados = Math.floor((dataFinal - new Date(dataFinal.getFullYear(), 11, 20)) / (1000 * 60 * 60 * 24));
        const proximaData = new Date(dataFinal.getMonth() === 11 ? dataFinal.getFullYear() + 1 : dataFinal.getFullYear(), 0, 21);
        dataFinal = new Date(proximaData.getTime() + diasPassados * 24 * 60 * 60 * 1000);
    }
    return dataFinal;
}

function calcularPrescricao(dataInicial) {
    // Adiciona 140 dias à data inicial
    let dataPrescricao = adicionarDiasExtra(new Date(dataInicial), 140);
    
    // Verifica se a data após a adição de 140 dias cai entre 20/12 e 20/01
    const verificaPeriodo = (data) => {
        const mes = data.getMonth();
        const dia = data.getDate();
        return (mes === 11 && dia >= 20) || (mes === 0 && dia <= 20);
    };

    // Guarda a informação se a data está no período especificado
    let diasFaltando = 0;
    if (verificaPeriodo(dataPrescricao)) {
        const dataLimite = new Date(dataPrescricao.getFullYear(), 0, 21); // 21/01 do mesmo ano
        diasFaltando = Math.ceil((dataLimite - dataPrescricao) / (1000 * 60 * 60 * 24)); // Calcula os dias faltantes
    }

    // Agora, adiciona os dias adicionais (365, 730, 1826)
    const resultados = {};
    const diasAdicionais = [365, 730, 1826];

    diasAdicionais.forEach((dias, index) => {
        let dataFinal = ajustarDataFinal(adicionarDiasExtra(dataPrescricao, dias));

        // Adiciona os dias faltantes se a data original estava no período
        if (verificaPeriodo(dataPrescricao)) {
            dataFinal = new Date(dataFinal.getTime() + diasFaltando * 24 * 60 * 60 * 1000);
        }

        // Armazena o resultado
        resultados[`resultado${index + 1}`] = dataFinal;
    });

    return resultados;
}

function calcular() {
    const dataInput = document.getElementById('data-inicial');
    const dataStr = dataInput.value;

    if (!validarData(dataStr)) {
        mostrarErro('Por favor, insira uma data válida no formato DD/MM/AAAA.');
        return;
    }

    try {
        const [dia, mes, ano] = dataStr.split('/').map(Number);
        let dataInicial = new Date(ano, mes - 1, dia);
        dataInicial = ajustarPeriodoCovid(dataInicial);

        const data365Dias = ajustarDataFinal(adicionarDiasExtra(dataInicial, 365 + 140));
        const data730Dias = ajustarDataFinal(adicionarDiasExtra(dataInicial, 730 + 140));
        const data1826Dias = ajustarDataFinal(adicionarDiasExtra(dataInicial, 1826 + 140));

        mostrarResultado('resultado-1', 'Infração leve (1 ano)', data365Dias);
        mostrarResultado('resultado-2', 'Infração média (2 anos)', data730Dias);
        mostrarResultado('resultado-3', 'Infração grave (5 anos)', data1826Dias);
    } catch (e) {
        mostrarErro(`Ocorreu um erro: ${e.message}`);
    }
}

function validarData(dataStr) {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(dataStr)) return false;
    
    const [, dia, mes, ano] = dataStr.match(regex);
    const data = new Date(ano, mes - 1, dia);
    return data.getDate() == dia && data.getMonth() == mes - 1 && data.getFullYear() == ano;
}

function mostrarResultado(elementId, titulo, data) {
    const elemento = document.getElementById(elementId);
    elemento.innerHTML = `
        <strong>${titulo}</strong><br>
        Data limite de prescrição: ${formatarData(data)}
    `;
    elemento.style.display = 'block';
}

function mostrarErro(mensagem) {
    alert(mensagem);
}

function formatarData(data) {
    return `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
}

function formatarEntradaData(event) {
    let input = event.target;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    if (value.length > 4) value = value.slice(0, 4) + '/' + value.slice(4);
    if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
    input.value = value;
}

// Eventos
document.getElementById('calcular').addEventListener('click', calcular);
document.getElementById('data-inicial').addEventListener('input', formatarEntradaData);
document.getElementById('data-inicial').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        calcular();
    }
});

// Limpar resultados ao focar no campo de entrada
document.getElementById('data-inicial').addEventListener('focus', function() {
    document.querySelectorAll('.resultado').forEach(el => el.style.display = 'none');
});
