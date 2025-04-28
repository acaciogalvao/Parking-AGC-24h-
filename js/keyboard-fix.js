// keyboard-fix.js
// Script para melhorar a visibilidade quando o teclado virtual é ativado no modo paisagem

document.addEventListener("DOMContentLoaded", function() {
    // Seleciona todos os campos de entrada que podem ativar o teclado
    const inputFields = document.querySelectorAll('input, select, textarea');
    
    // Altura da viewport original (sem teclado)
    let originalViewportHeight = window.innerHeight;
    
    // Detecta mudanças na altura da viewport (possível indicação de teclado aberto)
    window.addEventListener('resize', function() {
        // Se estamos em modo paisagem (largura > altura) e em um dispositivo móvel
        if (window.innerWidth > window.innerHeight && window.innerWidth <= 1024) {
            // Se a altura atual é significativamente menor que a original, provavelmente o teclado está aberto
            if (window.innerHeight < originalViewportHeight * 0.75) {
                document.body.classList.add('keyboard-open');
            } else {
                document.body.classList.remove('keyboard-open');
                originalViewportHeight = window.innerHeight; // Atualiza a altura original
            }
        }
    });
    
    // Adiciona eventos de foco para cada campo de entrada
    inputFields.forEach(function(field) {
        field.addEventListener('focus', function() {
            // Se estamos em modo paisagem (largura > altura) e em um dispositivo móvel
            if (window.innerWidth > window.innerHeight && window.innerWidth <= 1024) {
                // Adiciona classe para indicar que um campo está focado
                document.body.classList.add('input-focused');
                
                // Rola a página para o campo focado com um pequeno atraso
                setTimeout(() => {
                    // Obtém a posição do campo em relação ao topo da página
                    const fieldRect = this.getBoundingClientRect();
                    const fieldTop = fieldRect.top + window.pageYOffset;
                    
                    // Rola para posicionar o campo no terço superior da tela
                    window.scrollTo({
                        top: fieldTop - (window.innerHeight / 3),
                        behavior: 'smooth'
                    });
                }, 300);
            }
        });
        
        field.addEventListener('blur', function() {
            // Remove a classe quando o campo perde o foco
            document.body.classList.remove('input-focused');
        });
    });
});
