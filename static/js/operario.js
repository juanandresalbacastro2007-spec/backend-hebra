/**
 * HEBRATECH — MÓDULO OPERARIO (FRONTEND JS)
 * Funcionalidades:
 *   - Tablero Kanban con Drag & Drop
 *   - Registro, edición y eliminación de incidencias
 *   - Toggle para ocultar/mostrar tareas completadas
 *   - Columna "Completada" colapsable
 */

document.addEventListener('DOMContentLoaded', () => {

    // ─── Endpoints ───────────────────────────────────────────────────
    const ENDPOINTS = {
        tareas:           '/operarios/api/tareas/',
        cambiarEstado:    (id) => `/operarios/api/tarea/${id}/estado/`,
        guardarReporte:   '/operarios/api/reporte/',
        editarReporte:    (id) => `/operarios/api/reporte/${id}/editar/`,
        eliminarReporte:  (id) => `/operarios/api/reporte/${id}/eliminar/`,
        historialReportes: '/operarios/api/reportes/',
    };

    // ─── Estado local ────────────────────────────────────────────────
    let completadasOcultas = false;
    let pendingDeleteId    = null;

    // ─── Selectores del DOM ──────────────────────────────────────────
    const contadores = {
        'Pendiente':   document.getElementById('count-Pendiente'),
        'En Progreso': document.getElementById('count-En Progreso'),
        'Completada':  document.getElementById('count-Completada'),
    };

    const formReporte = {
        editId:       document.getElementById('reportEditId'),
        tipo:         document.getElementById('reportTipo'),
        descripcion:  document.getElementById('reportDesc'),
        periodo:      document.getElementById('reportPeriodo'),
        btnGuardar:   document.getElementById('btnSaveReport'),
        btnLabel:     document.getElementById('btnSaveReportLabel'),
        eyebrow:      document.getElementById('reportModalEyebrow'),
        modalTitle:   document.getElementById('reportModalLabel'),
        tipoCount:    document.getElementById('tipoCount'),
        descCount:    document.getElementById('descCount'),
        periodoCount: document.getElementById('periodoCount'),
        errTipo:      document.getElementById('err-tipo'),
        errDesc:      document.getElementById('err-desc'),
        errPeriodo:   document.getElementById('err-periodo'),
    };

    // ─── Inicialización ───────────────────────────────────────────────
    function init() {
        obtenerTareas();
        obtenerHistorialReportes();
        configurarDragAndDrop();
        configurarFormularioReportes();
        configurarBotonesExteriores();
        configurarToggleCompletadas();
        configurarColapsarCompletada();
        configurarModalEliminar();
        configurarBuscadorYFiltro();
    }

    // ═══════════════════════════════════════════════════════════════
    // 1. TAREAS — FETCH & RENDER
    // ═══════════════════════════════════════════════════════════════

    async function obtenerTareas() {
        const loading = document.getElementById('loadingIndicator');
        if (loading) loading.style.display = 'flex';
        try {
            const res  = await fetch(ENDPOINTS.tareas);
            if (!res.ok) throw new Error('No se pudo cargar el listado de tareas.');
            const data = await res.json();
            renderizarTareas(data.tareas);
        } catch (err) {
            console.error('Error al cargar el Kanban:', err);
            mostrarToast('No se pudieron cargar las tareas', 'err');
        } finally {
            if (loading) loading.style.display = 'none';
        }
    }

    function renderizarTareas(tareas) {
        // Limpiar columnas
        ['Pendiente', 'En Progreso', 'Completada'].forEach(estado => {
            const zona = document.getElementById(`list-${estado}`);
            if (!zona) return;
            const empty = zona.querySelector('.ht-col-empty');
            zona.innerHTML = '';
            if (empty) zona.appendChild(empty);
        });

        tareas.forEach(tarea => {
            const card = crearTarjetaTarea(tarea);
            const zona = document.getElementById(`list-${tarea.estado}`);
            if (zona) zona.appendChild(card);
        });

        actualizarContadoresVisuales(tareas);
        actualizarNavTareas(tareas);
        aplicarVisibilidadCompletadas();

        const total = document.getElementById('totalTasks');
        if (total) total.textContent = tareas.length;

        const sp = document.getElementById('statPendiente');
        const sc = document.getElementById('statProceso');
        const sf = document.getElementById('statFinalizado');
        if (sp) sp.textContent = tareas.filter(t => t.estado === 'Pendiente').length;
        if (sc) sc.textContent = tareas.filter(t => t.estado === 'En Progreso').length;
        if (sf) sf.textContent = tareas.filter(t => t.estado === 'Completada').length;
    }

    function crearTarjetaTarea(tarea) {
        const div = document.createElement('div');
        div.className = 'ht-card';
        div.setAttribute('draggable', 'true');
        div.setAttribute('data-id-asignacion', tarea.idAsignacion);
        div.setAttribute('data-prio', tarea.prioridad);
        div.setAttribute('data-estado', tarea.estado);

        const complejidadClass = `ht-badge-complex-${(tarea.complejidad || 'media').toLowerCase()}`;
        const prioClass        = `ht-badge-prio-${tarea.prioridad}`;

        div.innerHTML = `
            <div class="ht-card-header">
                <span class="ht-card-name">${tarea.nombreTarea}</span>
            </div>
            <div class="ht-card-proceso">
                <i class="bi bi-gear-fill"></i>${tarea.proceso || 'General'}
            </div>
            <p class="ht-card-desc">${tarea.descripcionTarea || 'Sin descripción adicional.'}</p>
            <div class="ht-card-footer">
                <div class="ht-card-meta">
                    <span class="ht-badge ${prioClass}">${tarea.prioridad}</span>
                    <span class="ht-badge ${complejidadClass}">${tarea.complejidad || 'Media'}</span>
                </div>
                <div style="display:flex;gap:6px;align-items:center;">
                    <span class="ht-card-hours"><i class="bi bi-clock"></i>${tarea.horasEstimadas}h</span>
                    <button class="ht-card-btn-detail btn-ver-detalle" title="Ver detalle">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="ht-card-btn-detail btn-reportar-tarea" title="Reportar incidencia" style="color:var(--warn);">
                        <i class="bi bi-exclamation-triangle-fill"></i>
                    </button>
                </div>
            </div>
        `;

        // Drag
        div.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', tarea.idAsignacion);
            div.classList.add('dragging');
        });
        div.addEventListener('dragend', () => div.classList.remove('dragging'));

        // Botón detalle
        div.querySelector('.btn-ver-detalle').addEventListener('click', e => {
            e.stopPropagation();
            abrirModalDetalle(tarea);
        });

        // Botón reportar
        div.querySelector('.btn-reportar-tarea').addEventListener('click', e => {
            e.stopPropagation();
            abrirModalReporte(null, tarea);
        });

        return div;
    }

    function actualizarNavTareas(tareas) {
        const navCount = document.getElementById('navTaskCount');
        if (navCount) navCount.textContent = tareas.length;

        const navTasks = document.getElementById('navTasksContainer');
        if (!navTasks) return;

        navTasks.innerHTML = tareas.length === 0
            ? '<div class="ht-empty-state"><i class="bi bi-inbox"></i><span>Sin tareas asignadas</span></div>'
            : tareas.map(t => `
                <div style="padding:10px 14px;border-bottom:1px solid var(--border);">
                    <div style="font-weight:500;font-size:.84rem;color:var(--text);">${t.nombreTarea}</div>
                    <div style="font-size:.76rem;color:var(--text-muted);margin-top:2px;">${t.estado} · ${t.prioridad}</div>
                </div>`).join('');
    }

    // ═══════════════════════════════════════════════════════════════
    // 2. MODAL DETALLE DE TAREA
    // ═══════════════════════════════════════════════════════════════

    function abrirModalDetalle(tarea) {
        const label = document.getElementById('taskDetailModalLabel');
        const body  = document.getElementById('taskDetailBody');
        if (!label || !body) return;

        label.textContent = tarea.nombreTarea;
        body.innerHTML = `
            <div class="ht-detail-grid">
                <div class="ht-detail-item">
                    <div class="ht-detail-label"><i class="bi bi-gear"></i> Proceso</div>
                    <div class="ht-detail-value">${tarea.proceso || '—'}</div>
                </div>
                <div class="ht-detail-item">
                    <div class="ht-detail-label"><i class="bi bi-bar-chart"></i> Complejidad</div>
                    <div class="ht-detail-value">${tarea.complejidad || '—'}</div>
                </div>
                <div class="ht-detail-item">
                    <div class="ht-detail-label"><i class="bi bi-flag"></i> Prioridad</div>
                    <div class="ht-detail-value">${tarea.prioridad}</div>
                </div>
                <div class="ht-detail-item">
                    <div class="ht-detail-label"><i class="bi bi-clock"></i> Horas estimadas</div>
                    <div class="ht-detail-value">${tarea.horasEstimadas}h</div>
                </div>
                <div class="ht-detail-item">
                    <div class="ht-detail-label"><i class="bi bi-calendar"></i> Inicio</div>
                    <div class="ht-detail-value">${tarea.fechaInicio}</div>
                </div>
                <div class="ht-detail-item">
                    <div class="ht-detail-label"><i class="bi bi-check2-circle"></i> Estado</div>
                    <div class="ht-detail-value">${tarea.estado}</div>
                </div>
            </div>
            <div class="ht-detail-desc">
                <div class="ht-detail-label mb-2"><i class="bi bi-card-text"></i> Descripción</div>
                <p>${tarea.descripcionTarea || 'Sin descripción adicional.'}</p>
            </div>
        `;

        // Botón "Generar reporte sobre esta tarea" en el footer del modal
        const btnOpen = document.getElementById('btnOpenReport');
        if (btnOpen) {
            const clone = btnOpen.cloneNode(true);
            btnOpen.parentNode.replaceChild(clone, clone.parentNode.querySelector('#btnOpenReport') || btnOpen);
            clone.addEventListener('click', () => {
                bootstrap.Modal.getOrCreateInstance(document.getElementById('taskDetailModal')).hide();
                setTimeout(() => abrirModalReporte(null, tarea), 300);
            });
        }

        bootstrap.Modal.getOrCreateInstance(document.getElementById('taskDetailModal')).show();
    }

    // ═══════════════════════════════════════════════════════════════
    // 3. DRAG & DROP
    // ═══════════════════════════════════════════════════════════════

    function configurarDragAndDrop() {
        document.querySelectorAll('.ht-drop-zone').forEach(zona => {
            const estadoTarget = zona.getAttribute('data-status');

            zona.addEventListener('dragover', e => {
                e.preventDefault();
                zona.classList.add('drag-over');
            });
            zona.addEventListener('dragleave', () => zona.classList.remove('drag-over'));
            zona.addEventListener('drop', async e => {
                e.preventDefault();
                zona.classList.remove('drag-over');
                const idAsignacion = e.dataTransfer.getData('text/plain');
                const tarjeta = document.querySelector(`[data-id-asignacion="${idAsignacion}"]`);
                if (tarjeta && estadoTarget) {
                    tarjeta.setAttribute('data-estado', estadoTarget);
                    zona.appendChild(tarjeta);
                    await actualizarEstadoEnServidor(idAsignacion, estadoTarget);
                    // Si se mueve a Completada y el toggle está activo, ocultar
                    if (estadoTarget === 'Completada' && completadasOcultas) {
                        tarjeta.classList.add('hidden-completed');
                    } else {
                        tarjeta.classList.remove('hidden-completed');
                    }
                    actualizarContadoresDesdeDOM();
                }
            });
        });
    }

    async function actualizarEstadoEnServidor(idAsignacion, nuevoEstado) {
        try {
            const res = await fetch(ENDPOINTS.cambiarEstado(idAsignacion), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': obtenerCsrfToken(),
                },
                body: JSON.stringify({ estado: nuevoEstado }),
            });
            if (!res.ok) throw new Error('Error al actualizar estado.');
        } catch (err) {
            console.error('No se pudo guardar el estado:', err);
            mostrarToast('Error al cambiar el estado de la tarea', 'err');
            obtenerTareas(); // revertir
        }
    }

    function actualizarContadoresDesdeDOM() {
        const tareasFake = Array.from(document.querySelectorAll('.ht-card')).map(c => ({
            estado: c.getAttribute('data-estado') || ''
        }));
        actualizarContadoresVisuales(tareasFake);
    }

    function actualizarContadoresVisuales(tareas = []) {
        ['Pendiente', 'En Progreso', 'Completada'].forEach(estado => {
            const el = contadores[estado];
            if (el) el.textContent = tareas.filter(t => t.estado === estado).length;
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // 4. TOGGLE — OCULTAR / MOSTRAR COMPLETADAS
    // ═══════════════════════════════════════════════════════════════

    function configurarToggleCompletadas() {
        const btn = document.getElementById('btnToggleCompletadas');
        if (!btn) return;
        btn.addEventListener('click', () => {
            completadasOcultas = !completadasOcultas;
            btn.classList.toggle('active', completadasOcultas);
            btn.querySelector('i').className = completadasOcultas ? 'bi bi-eye' : 'bi bi-eye-slash';
            btn.querySelector('span').textContent = completadasOcultas ? 'Mostrar completadas' : 'Ocultar completadas';
            aplicarVisibilidadCompletadas();
        });
    }

    function aplicarVisibilidadCompletadas() {
        document.querySelectorAll('.ht-card[data-estado="Completada"]').forEach(card => {
            card.classList.toggle('hidden-completed', completadasOcultas);
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // 5. COLAPSAR COLUMNA COMPLETADA
    // ═══════════════════════════════════════════════════════════════

    function configurarColapsarCompletada() {
        const header = document.getElementById('headerCompletada');
        const col    = document.getElementById('col-Completada');
        if (!header || !col) return;
        header.addEventListener('click', () => {
            col.classList.toggle('collapsed');
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // 6. MODAL REPORTE — CREAR Y EDITAR
    // ═══════════════════════════════════════════════════════════════

    function configurarBotonesExteriores() {
        const btnGenerar = document.getElementById('btnGenerateReport');
        if (btnGenerar) btnGenerar.addEventListener('click', () => abrirModalReporte());

        const btnOpen = document.getElementById('btnOpenReport');
        if (btnOpen) btnOpen.addEventListener('click', () => abrirModalReporte());
    }

    /**
     * Abre el modal en modo CREAR o EDITAR.
     * @param {object|null} reporte  - Reporte existente para editar (tiene idIncidencia)
     * @param {object|null} tarea    - Tarea vinculada (nuevo reporte desde una tarjeta)
     */
    function abrirModalReporte(reporte = null, tarea = null) {
        limpiarErroresFormulario();
        resetearFormularioReporte();

        const tareaRef  = document.getElementById('reportTareaRef');
        const tareaName = document.getElementById('reportTareaName');

        if (reporte) {
            // ── MODO EDICIÓN ──
            formReporte.editId.value          = reporte.idIncidencia;
            formReporte.tipo.value            = reporte.tipoIncidencia || '';
            formReporte.descripcion.value     = reporte.descripcionCompleta || reporte.descripcion || '';
            formReporte.periodo.value         = reporte.periodoEvaluado || '';
            formReporte.eyebrow.textContent   = 'Editar Incidencia';
            formReporte.modalTitle.textContent = 'Editar Reporte';
            formReporte.btnLabel.textContent   = 'Guardar cambios';
            // Actualizar contadores
            if (formReporte.tipoCount)    formReporte.tipoCount.textContent    = formReporte.tipo.value.length;
            if (formReporte.descCount)    formReporte.descCount.textContent    = formReporte.descripcion.value.length;
            if (formReporte.periodoCount) formReporte.periodoCount.textContent = formReporte.periodo.value.length;
            if (tareaRef) tareaRef.style.display = 'none';
        } else {
            // ── MODO CREAR ──
            formReporte.editId.value           = '';
            formReporte.eyebrow.textContent    = 'Nueva Incidencia';
            formReporte.modalTitle.textContent = 'Generar Reporte';
            formReporte.btnLabel.textContent   = 'Enviar reporte';

            if (tarea && tareaRef && tareaName) {
                tareaRef.style.display = 'flex';
                tareaName.textContent  = tarea.nombreTarea;
                formReporte.btnGuardar.setAttribute('data-id-tarea-vinculada', tarea.idTarea);
            } else {
                if (tareaRef) tareaRef.style.display = 'none';
                formReporte.btnGuardar.removeAttribute('data-id-tarea-vinculada');
            }
        }

        bootstrap.Modal.getOrCreateInstance(document.getElementById('reportModal')).show();
    }

    function configurarFormularioReportes() {
        if (!formReporte.btnGuardar) return;

        // Contadores de caracteres
        if (formReporte.tipo) {
            formReporte.tipo.addEventListener('input', e => {
                if (formReporte.tipoCount) formReporte.tipoCount.textContent = e.target.value.length;
            });
        }
        if (formReporte.descripcion) {
            formReporte.descripcion.addEventListener('input', e => {
                if (formReporte.descCount) formReporte.descCount.textContent = e.target.value.length;
            });
        }
        if (formReporte.periodo) {
            formReporte.periodo.addEventListener('input', e => {
                if (formReporte.periodoCount) formReporte.periodoCount.textContent = e.target.value.length;
            });
        }

        formReporte.btnGuardar.addEventListener('click', enviarReporteIncidencia);
    }

    async function enviarReporteIncidencia() {
        limpiarErroresFormulario();

        const payload = {
            tipoIncidencia:  formReporte.tipo        ? formReporte.tipo.value.trim()        : '',
            descripcion:     formReporte.descripcion ? formReporte.descripcion.value.trim() : '',
            periodoEvaluado: formReporte.periodo     ? formReporte.periodo.value.trim()     : '',
        };

        const editId = formReporte.editId ? formReporte.editId.value : '';
        const esEdicion = !!editId;
        const url    = esEdicion ? ENDPOINTS.editarReporte(editId) : ENDPOINTS.guardarReporte;

        try {
            formReporte.btnGuardar.disabled = true;
            const res  = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken':  obtenerCsrfToken(),
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.status === 400 && data.errores) {
                if (data.errores.tipoIncidencia  && formReporte.errTipo)    formReporte.errTipo.textContent    = data.errores.tipoIncidencia;
                if (data.errores.descripcion     && formReporte.errDesc)    formReporte.errDesc.textContent    = data.errores.descripcion;
                if (data.errores.periodoEvaluado && formReporte.errPeriodo) formReporte.errPeriodo.textContent = data.errores.periodoEvaluado;
                return;
            }

            if (!res.ok) throw new Error(data.error || 'Error del servidor.');

            bootstrap.Modal.getOrCreateInstance(document.getElementById('reportModal')).hide();
            resetearFormularioReporte();
            obtenerHistorialReportes();
            mostrarToast(esEdicion ? '✏️ Reporte actualizado correctamente' : '✅ Reporte enviado correctamente', 'ok');

        } catch (err) {
            console.error('Error al guardar incidencia:', err);
            mostrarToast('❌ No se pudo guardar el reporte. Intenta de nuevo.', 'err');
        } finally {
            formReporte.btnGuardar.disabled = false;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 7. HISTORIAL DE REPORTES (con acciones editar / eliminar)
    // ═══════════════════════════════════════════════════════════════

    async function obtenerHistorialReportes() {
        try {
            const res  = await fetch(ENDPOINTS.historialReportes);
            if (!res.ok) throw new Error('No se pudo consultar el historial.');
            const data = await res.json();
            renderizarHistorialReportes(data.reportes);
        } catch (err) {
            console.error('Error cargando historial:', err);
        }
    }

    function renderizarHistorialReportes(reportes) {
        const contenedor = document.getElementById('navReportesContainer');
        if (!contenedor) return;

        if (!reportes || reportes.length === 0) {
            contenedor.innerHTML = `
                <div class="ht-empty-state">
                    <i class="bi bi-file-earmark-text"></i>
                    <span>Sin reportes aún</span>
                </div>`;
            return;
        }

        contenedor.innerHTML = reportes.map(rep => `
            <div class="ht-report-card" data-id="${rep.idIncidencia}">
                <div class="ht-report-card-header">
                    <span class="ht-report-card-tipo">${rep.tipoIncidencia}</span>
                    <div class="ht-report-card-actions">
                        <button class="ht-report-action-btn ht-report-action-btn--edit"
                                data-id="${rep.idIncidencia}"
                                data-tipo="${encodeURIComponent(rep.tipoIncidencia)}"
                                data-desc="${encodeURIComponent(rep.descripcion)}"
                                data-periodo="${encodeURIComponent(rep.periodoEvaluado || '')}"
                                title="Editar reporte">
                            <i class="bi bi-pencil"></i> Editar
                        </button>
                        <button class="ht-report-action-btn ht-report-action-btn--delete"
                                data-id="${rep.idIncidencia}"
                                title="Eliminar reporte">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
                <p class="ht-report-card-desc">${rep.descripcion}</p>
                <div class="ht-report-card-meta">
                    <span class="ht-badge-status-${rep.estado}">${rep.estado}</span>
                    <span><i class="bi bi-calendar-event me-1"></i>${rep.fechaGeneracion}</span>
                    ${rep.periodoEvaluado ? `<span><i class="bi bi-bookmark me-1"></i>${rep.periodoEvaluado}</span>` : ''}
                </div>
            </div>`).join('');

        // Eventos botones editar
        contenedor.querySelectorAll('.ht-report-action-btn--edit').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const reporte = {
                    idIncidencia:       btn.dataset.id,
                    tipoIncidencia:     decodeURIComponent(btn.dataset.tipo),
                    descripcionCompleta: decodeURIComponent(btn.dataset.desc),
                    periodoEvaluado:    decodeURIComponent(btn.dataset.periodo),
                };
                // Cerrar dropdown antes de abrir modal
                document.activeElement?.blur();
                setTimeout(() => abrirModalReporte(reporte), 150);
            });
        });

        // Eventos botones eliminar
        contenedor.querySelectorAll('.ht-report-action-btn--delete').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                pendingDeleteId = btn.dataset.id;
                document.activeElement?.blur();
                setTimeout(() => {
                    bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteModal')).show();
                }, 150);
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // 8. MODAL CONFIRMAR ELIMINACIÓN
    // ═══════════════════════════════════════════════════════════════

    function configurarModalEliminar() {
        const btnConfirm = document.getElementById('btnConfirmDelete');
        if (!btnConfirm) return;

        btnConfirm.addEventListener('click', async () => {
            if (!pendingDeleteId) return;
            try {
                btnConfirm.disabled = true;
                const res = await fetch(ENDPOINTS.eliminarReporte(pendingDeleteId), {
                    method: 'POST',
                    headers: { 'X-CSRFToken': obtenerCsrfToken() },
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Error al eliminar.');
                bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteModal')).hide();
                obtenerHistorialReportes();
                mostrarToast('🗑️ Reporte eliminado correctamente', 'ok');
            } catch (err) {
                console.error('Error al eliminar:', err);
                mostrarToast('❌ No se pudo eliminar el reporte', 'err');
            } finally {
                btnConfirm.disabled = false;
                pendingDeleteId = null;
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // 9. BUSCADOR Y FILTRO DE PRIORIDAD
    // ═══════════════════════════════════════════════════════════════

    function configurarBuscadorYFiltro() {
        const search = document.getElementById('searchInput');
        const filter = document.getElementById('filterPrio');
        if (search) search.addEventListener('input', aplicarFiltros);
        if (filter) filter.addEventListener('change', aplicarFiltros);
    }

    function aplicarFiltros() {
        const texto = (document.getElementById('searchInput')?.value || '').toLowerCase();
        const prio  = document.getElementById('filterPrio')?.value || '';

        document.querySelectorAll('.ht-card').forEach(card => {
            const nombre = card.querySelector('.ht-card-name')?.textContent.toLowerCase() || '';
            const cardPrio = card.getAttribute('data-prio') || '';
            const coincideTexto = !texto || nombre.includes(texto);
            const coincidePrio  = !prio  || cardPrio === prio;
            // No interferir con el toggle de completadas
            const estaCompletada = card.getAttribute('data-estado') === 'Completada';
            if (estaCompletada && completadasOcultas) {
                card.style.display = 'none';
            } else {
                card.style.display = (coincideTexto && coincidePrio) ? '' : 'none';
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // 10. TOAST
    // ═══════════════════════════════════════════════════════════════

    function mostrarToast(mensaje, tipo = 'ok') {
        const wrap = document.getElementById('toastWrap');
        if (!wrap) return;
        const toast = document.createElement('div');
        toast.className = `ht-toast ht-toast-${tipo}`;
        toast.innerHTML = `<i class="bi bi-${tipo === 'ok' ? 'check-circle-fill' : 'x-circle-fill'}"></i><span>${mensaje}</span>`;
        wrap.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
    }

    // ═══════════════════════════════════════════════════════════════
    // 11. HELPERS
    // ═══════════════════════════════════════════════════════════════

    function limpiarErroresFormulario() {
        if (formReporte.errTipo)    formReporte.errTipo.textContent    = '';
        if (formReporte.errDesc)    formReporte.errDesc.textContent    = '';
        if (formReporte.errPeriodo) formReporte.errPeriodo.textContent = '';
    }

    function resetearFormularioReporte() {
        if (formReporte.tipo)         formReporte.tipo.value         = '';
        if (formReporte.descripcion)  formReporte.descripcion.value  = '';
        if (formReporte.periodo)      formReporte.periodo.value      = '';
        if (formReporte.editId)       formReporte.editId.value       = '';
        if (formReporte.tipoCount)    formReporte.tipoCount.textContent    = '0';
        if (formReporte.descCount)    formReporte.descCount.textContent    = '0';
        if (formReporte.periodoCount) formReporte.periodoCount.textContent = '0';
        limpiarErroresFormulario();
    }

    function obtenerCsrfToken() {
        for (const cookie of document.cookie.split(';')) {
            const c = cookie.trim();
            if (c.startsWith('csrftoken=')) return decodeURIComponent(c.substring(10));
        }
        return '';
    }

    // ─── Arrancar ────────────────────────────────────────────────
    init();
});