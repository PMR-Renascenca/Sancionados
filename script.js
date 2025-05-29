//para o botão funcionar, preciso criar uma função que chama esse botão
function buscar() {
    // Pega os valores dos filtros
    const cadastro = document.getElementById("cadastro").value.toLowerCase();
    const tipoSancionado = document.getElementById("tipoSancionado").value.toLowerCase();
    const nomeSancionado = document.getElementById("nomeSancionado").value.toLowerCase();
    const uf = document.getElementById("uf").value.toLowerCase();
    const orgaoEntidadeSancionado = document.getElementById("orgaoEntidadeSancionado").value.toLowerCase();
    const categoriaSancao = document.getElementById("categoriaSancao").value.toLowerCase();
    const dataSancao = document.getElementById("dataSancao").value;
    const multa = document.getElementById("multa").value;
    const quantidade = document.getElementById("quantidade").value;
    const periodoVigencia = document.getElementById("periodoVigencia").value;

    // Pega as linhas da tabela
    const linhas = document.querySelectorAll('.tabela tbody tr');

    linhas.forEach(linha => {
        const colunas = linha.getElementsByTagName('td');
        
        // Função auxiliar para normalizar valores
        const normalizarValor = (valor) => {
            if (!valor) return '';
            return valor.toString().toLowerCase().trim();
        };

        // Função auxiliar para comparar datas
        const compararDatas = (data1, data2) => {
            if (!data1 || !data2) return true;
            if (data1 === 'Sem Informação') return true;
            const d1 = new Date(data1);
            const d2 = new Date(data2);
            return d1.getTime() === d2.getTime();
        };

        // Função auxiliar para comparar valores numéricos
        const compararNumeros = (num1, num2) => {
            if (!num1 || !num2) return true;
            if (num1 === 'não se aplica' || num2 === 'não se aplica') return true;
            return parseFloat(num1) === parseFloat(num2);
        };

        const atendeFiltros =
            (!cadastro || normalizarValor(colunas[0]?.textContent) === cadastro) &&
            (!tipoSancionado || normalizarValor(colunas[1]?.textContent) === tipoSancionado) &&
            (!nomeSancionado || normalizarValor(colunas[2]?.textContent).includes(nomeSancionado)) &&
            (!uf || normalizarValor(colunas[3]?.textContent) === uf) &&
            (!orgaoEntidadeSancionado || normalizarValor(colunas[4]?.textContent).includes(orgaoEntidadeSancionado)) &&
            (!categoriaSancao || normalizarValor(colunas[5]?.textContent).includes(categoriaSancao)) &&
            (!dataSancao || compararDatas(colunas[6]?.textContent, dataSancao)) &&
            (!multa || compararNumeros(colunas[7]?.textContent, multa)) &&
            (!quantidade || compararNumeros(colunas[8]?.textContent, quantidade)) &&
            (!periodoVigencia || compararDatas(colunas[9]?.textContent, periodoVigencia));

        linha.style.display = atendeFiltros ? '' : 'none';
    });
}

function limparFiltros() {
    // Limpar todos os selects
    document.getElementById("cadastro").selectedIndex = 0;
    document.getElementById("tipoSancionado").selectedIndex = 0;
    document.getElementById("nomeSancionado").selectedIndex = 0;
    document.getElementById("uf").selectedIndex = 0;
    document.getElementById("orgaoEntidadeSancionado").selectedIndex = 0;
    document.getElementById("categoriaSancao").selectedIndex = 0;

    // Limpar todos os inputs
    document.getElementById("dataSancao").value = "";
    document.getElementById("multa").value = "";
    document.getElementById("quantidade").value = "";
    document.getElementById("periodoVigencia").value = "";

    // Mostrar todas as linhas da tabela
    const linhas = document.querySelectorAll('.tabela tbody tr');
    linhas.forEach(linha => {
        linha.style.display = '';
    });
}

function downloadPDF(pdfPath, numeroEmenda) {
    // Cria um elemento 'a' invisível
    const link = document.createElement('a');
    link.href = pdfPath;
    link.download = `Emenda_${numeroEmenda}.pdf`; // Nome do arquivo para download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function mostrarDetalhes(numeroEmenda) {
    // Aqui você pode implementar a lógica para mostrar os detalhes
    // Por exemplo, abrir um modal ou redirecionar para uma página de detalhes
    alert(`Detalhes da emenda ${numeroEmenda}`);
}

document.addEventListener("DOMContentLoaded", function() {
    var detalhes2025 = document.getElementById("detalhes-2025");
    if (detalhes2025) {
        var pdf = "pdf/2025_relatorio.pdf";
        // Gera a data do dia atual
        var hoje = new Date();
        var dia = String(hoje.getDate()).padStart(2, '0');
        var mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Janeiro é 0!
        var ano = hoje.getFullYear();
        var dataAtualizacao = `Atualizado em ${dia}/${mes}/${ano}`;

        detalhes2025.innerHTML = `
            <button class="botao-detalhes" onclick="downloadPDF('pdf/2025.pdf')">
                Baixar PDF
            </button>
            <br>
            <span style="color: #555; font-size: 0.9em;">
                ${dataAtualizacao}
            </span>
        `;
    }
});

// Lista de formatos válidos
const FORMATOS_VALIDOS = ['pdf', 'docx', 'txt', 'csv', 'odt', 'calc', 'rtf', 'json'];

/**
 * Verifica se um arquivo existe no servidor
 * @param {string} url - URL do arquivo para verificar
 * @returns {Promise<boolean>} - Retorna true se o arquivo existe
 */
async function verificarArquivo(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        console.error('Erro ao verificar arquivo:', error);
        return false;
    }
}

/**
 * Baixa um arquivo no formato selecionado
 * @param {string} idArquivo - ID do elemento select
 */
async function baixarArquivo(idArquivo) {
    // Pega o select e o botão
    const select = document.getElementById(idArquivo);
    const botao = select.nextElementSibling;
    
    if (!select || !botao) {
        console.error('Elementos não encontrados');
        return;
    }

    // Desabilita o botão durante a verificação
    botao.disabled = true;
    
    try {
        // Pega o formato selecionado
        const formato = select.value.toLowerCase();
        
        // Valida o formato
        if (!FORMATOS_VALIDOS.includes(formato)) {
            throw new Error('Formato de arquivo inválido');
        }

        // Pega a linha da tabela que contém os dados
        const linha = document.querySelector(`tr td[data-tipo="detalhes"] select#${idArquivo}`).closest('tr');
        const colunas = linha.getElementsByTagName('td');
        
        // Cria um objeto com os dados
        const dados = {
            cadastro: colunas[0].textContent,
            tipoSancionado: colunas[1].textContent,
            nomeSancionado: colunas[2].textContent,
            uf: colunas[3].textContent,
            orgaoEntidadeSancionado: colunas[4].textContent,
            categoriaSancao: colunas[5].textContent,
            dataSancao: colunas[6].textContent,
            multa: colunas[7].textContent,
            quantidade: colunas[8].textContent,
            periodoVigencia: colunas[9].textContent
        };

        let conteudo = '';
        let tipoMime = '';

        // Gera o conteúdo baseado no formato
        switch(formato) {
            case 'json':
                conteudo = JSON.stringify(dados, null, 2);
                tipoMime = 'application/json';
                break;
                
            case 'csv':
                const cabecalhos = Object.keys(dados).join(',');
                const valores = Object.values(dados).join(',');
                conteudo = `${cabecalhos}\n${valores}`;
                tipoMime = 'text/csv';
                break;
                
            case 'txt':
                conteudo = Object.entries(dados)
                    .map(([chave, valor]) => `${chave}: ${valor}`)
                    .join('\n');
                tipoMime = 'text/plain';
                break;
                
            case 'rtf':
                conteudo = `{\\rtf1\\ansi\\deff0\n` +
                          `{\\fonttbl{\\f0\\fnil\\fcharset0 Arial;}}\n` +
                          `{\\colortbl;\\red0\\green0\\blue0;}\n` +
                          `\\viewkind4\\uc1\\pard\\cf1\\f0\\fs24\n` +
                          `Relatório de Sanção\\par\\par\n` +
                          Object.entries(dados)
                              .map(([chave, valor]) => `${chave}: ${valor}\\par`)
                              .join('\n') +
                          `}`;
                tipoMime = 'application/rtf';
                break;
                
            case 'odt':
            case 'docx':
                conteudo = `<?xml version="1.0" encoding="UTF-8"?>\n` +
                          `<document>\n` +
                          `  <title>Relatório de Sanção</title>\n` +
                          `  <content>\n` +
                          Object.entries(dados)
                              .map(([chave, valor]) => `    <p>${chave}: ${valor}</p>`)
                              .join('\n') +
                          `  </content>\n` +
                          `</document>`;
                tipoMime = formato === 'odt' ? 'application/vnd.oasis.opendocument.text' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                break;
                
            default:
                conteudo = `Relatório de Sanção\n\n` +
                          `Cadastro: ${dados.cadastro}\n` +
                          `Tipo Sancionado: ${dados.tipoSancionado}\n` +
                          `Nome Sancionado: ${dados.nomeSancionado}\n` +
                          `UF: ${dados.uf}\n` +
                          `Órgão/Entidade: ${dados.orgaoEntidadeSancionado}\n` +
                          `Categoria: ${dados.categoriaSancao}\n` +
                          `Data: ${dados.dataSancao}\n` +
                          `Multa: ${dados.multa}\n` +
                          `Quantidade: ${dados.quantidade}\n` +
                          `Período: ${dados.periodoVigencia}`;
                tipoMime = 'text/plain';
        }
        
        // Cria um blob com o conteúdo
        const blob = new Blob([conteudo], { type: tipoMime });
        
        // Cria uma URL para o blob
        const url = window.URL.createObjectURL(blob);
        
        // Cria um elemento de link temporário
        const link = document.createElement('a');
        link.href = url;
        link.download = `${idArquivo}.${formato}`;
        
        // Adiciona o link ao documento
        document.body.appendChild(link);
        
        // Simula o clique no link
        link.click();
        
        // Remove o link do documento
        document.body.removeChild(link);
        
        // Libera a URL do blob
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        // Mostra mensagem de erro amigável
        alert(`Não foi possível baixar o arquivo: ${error.message}`);
    } finally {
        // Reabilita o botão
        botao.disabled = false;
    }
}

// Inicializa os selects quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Adiciona evento de mudança para todos os selects
    document.querySelectorAll('.formato-select').forEach(select => {
        select.addEventListener('change', function() {
            const botao = this.nextElementSibling;
            if (botao) {
                botao.disabled = !FORMATOS_VALIDOS.includes(this.value.toLowerCase());
            }
        });
    });
});

