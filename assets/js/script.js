document.addEventListener('DOMContentLoaded', () => {
    const nombreGasto = document.getElementById('nombreGasto');
    const descripcionGasto = document.getElementById('descripcionGasto');
    const valorGasto = document.getElementById('valorGasto');
    const botonFormulario = document.getElementById('botonFormulario');
    const listaDeGastos = document.getElementById('listaDeGastos');
    const totalGastosSpan = document.getElementById('totalGastos');
    const mensajeAdvertencia = document.getElementById('mensajeAdvertencia');
    const textoAdvertencia = document.getElementById('textoAdvertencia');
    const montoExcedente = document.getElementById('montoExcedente');
    
    // Elementos del modal
    const modalEdicion = document.getElementById('modalEdicion');
    const editNombreGasto = document.getElementById('editNombreGasto');
    const editDescripcionGasto = document.getElementById('editDescripcionGasto');
    const editValorGasto = document.getElementById('editValorGasto');
    const guardarEdicion = document.getElementById('guardarEdicion');
    const cancelarEdicion = document.getElementById('cancelarEdicion');
    
    const LIMITE_GASTOS = 780000;
    let gastos = [];
    let total = 0;
    let gastoEnEdicion = null;

    function formatearMoneda(valor) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(valor).replace('COP', '');
    }

    function mostrarAdvertencia(excedente) {
        textoAdvertencia.textContent = `¡Has superado el límite de ${formatearMoneda(LIMITE_GASTOS)} COP!`;
        montoExcedente.textContent = `Excedente: ${formatearMoneda(excedente)} COP`;
        mensajeAdvertencia.style.display = 'block';
    }

    function ocultarAdvertencia() {
        mensajeAdvertencia.style.display = 'none';
    }

    function actualizarTotal() {
        total = gastos.reduce((sum, gasto) => sum + parseInt(gasto.valor), 0);
        totalGastosSpan.textContent = formatearMoneda(total);
        
        if (total > LIMITE_GASTOS) {
            totalGastosSpan.classList.add('total-excedido');
            mostrarAdvertencia(total - LIMITE_GASTOS);
        } else {
            totalGastosSpan.classList.remove('total-excedido');
            ocultarAdvertencia();
        }
    }

    function mostrarModal(gasto) {
        gastoEnEdicion = gasto;
        editNombreGasto.value = gasto.nombre;
        editDescripcionGasto.value = gasto.descripcion;
        editValorGasto.value = gasto.valor;
        modalEdicion.style.display = 'flex';
    }

    function ocultarModal() {
        modalEdicion.style.display = 'none';
        gastoEnEdicion = null;
    }
    
    function agregarGasto(nombre, descripcion, valor) {
        if (!nombre || !descripcion || !valor || isNaN(valor.replace(/\./g, ''))) {
            alert('Por favor, complete todos los campos con valores válidos');
            return;
        }
        
        const valorNumerico = parseInt(valor.replace(/\./g, ''));
        if (valorNumerico <= 0) {
            alert('Por favor, ingrese un valor mayor a 0');
            return;
        }

        const nuevoTotal = total + valorNumerico;
        const montoDisponible = LIMITE_GASTOS - total;
        
        if (nuevoTotal > LIMITE_GASTOS) {
            textoAdvertencia.textContent = `Esta operación superará el límite establecido`;
            montoExcedente.textContent = `Monto disponible: ${formatearMoneda(montoDisponible)} COP`;
            mensajeAdvertencia.style.display = 'block';
        }

        const gasto = {
            id: Date.now(),
            nombre: nombre,
            descripcion: descripcion,
            valor: valorNumerico
        };
        
        gastos.push(gasto);
        renderizarLista();
        actualizarTotal();
    }

    window.eliminarGasto = function(id) {
        gastos = gastos.filter(gasto => gasto.id !== id);
        actualizarTotal();
        renderizarLista();
    }

    window.editarGasto = function(id) {
        const gasto = gastos.find(g => g.id === id);
        if (gasto) {
            mostrarModal(gasto);
        }
    }

    function renderizarLista() {
        listaDeGastos.innerHTML = '';
        gastos.forEach(gasto => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="gasto-header">
                    <strong>${gasto.nombre}</strong>
                    <span class="valor-monetario">${formatearMoneda(gasto.valor)} COP</span>
                </div>
                <div class="gasto-descripcion">
                    ${gasto.descripcion}
                </div>
                <div class="gasto-acciones">
                    <button onclick="editarGasto(${gasto.id})" 
                            class="boton-editar"
                            style="padding: 5px 10px; font-size: 0.9rem;">
                        Editar
                    </button>
                    <button onclick="eliminarGasto(${gasto.id})" 
                            style="padding: 5px 10px; font-size: 0.9rem;">
                        Eliminar
                    </button>
                </div>
            `;
            listaDeGastos.appendChild(li);
        });
    }

    botonFormulario.addEventListener('click', () => {
        agregarGasto(
            nombreGasto.value, 
            descripcionGasto.value, 
            valorGasto.value
        );
        nombreGasto.value = '';
        descripcionGasto.value = '';
        valorGasto.value = '';
        nombreGasto.focus();
    });

    guardarEdicion.addEventListener('click', () => {
        if (!gastoEnEdicion) return;
        
        const valorNumerico = parseInt(editValorGasto.value.replace(/\./g, ''));
        if (!editNombreGasto.value || !editDescripcionGasto.value || isNaN(valorNumerico) || valorNumerico <= 0) {
            alert('Por favor, complete todos los campos con valores válidos');
            return;
        }

        // Actualizar el gasto
        const index = gastos.findIndex(g => g.id === gastoEnEdicion.id);
        if (index !== -1) {
            gastos[index] = {
                ...gastoEnEdicion,
                nombre: editNombreGasto.value,
                descripcion: editDescripcionGasto.value,
                valor: valorNumerico
            };
            
            renderizarLista();
            actualizarTotal();
            ocultarModal();
        }
    });

    cancelarEdicion.addEventListener('click', ocultarModal);

    // Cerrar modal al hacer clic fuera de él
    modalEdicion.addEventListener('click', (e) => {
        if (e.target === modalEdicion) {
            ocultarModal();
        }
    });

    [nombreGasto, descripcionGasto, valorGasto].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (input === descripcionGasto) {
                    // Para el textarea, permitimos nueva línea con Enter
                    if (!e.shiftKey) {
                        e.preventDefault();
                        botonFormulario.click();
                    }
                } else {
                    e.preventDefault();
                    botonFormulario.click();
                }
            }
        });
    });
});