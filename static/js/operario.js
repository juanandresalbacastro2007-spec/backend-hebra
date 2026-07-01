/**
 * HEBRATECH — MÓDULO OPERARIO
 * Bugs corregidos:
 *   - Empty state se oculta/muestra correctamente
 *   - Botón ojo abre el modal de detalle
 *   - Contadores top bar se actualizan al arrastrar
 */

document.addEventListener('DOMContentLoaded', () => {

// ─── Endpoints ───────────────────────────────────────────────────
    const ENDPOINTS = {
        tareas:            '/operarios/api/tareas/',
        cambiarEstado:     (id) => `/operarios/api/tarea/${id}/estado/`,
        guardarReporte:    '/operarios/api/reporte/',
        editarReporte:     (id) => `/operarios/api/reporte/${id}/editar/`,
        eliminarReporte:   (id) => `/operarios/api/reporte/${id}/eliminar/`,
        historialReportes: '/operarios/api/reportes/',
        pdfReporte:        (id) => `/operarios/api/reporte/${id}/pdf/`,
    };

    // ─── Estado local ────────────────────────────────────────────────
    let completadasOcultas = false;
    let pendingDeleteId    = null;
    // Cache de objetos tarea para el modal de detalle
    const cacheTareas = {};

    // ─── Selectores ──────────────────────────────────────────────────
    const contadoresColumna = {
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

    // ─── Init ────────────────────────────────────────────────────────
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
            if (!res.ok) throw new Error('Error al cargar tareas');
            const data = await res.json();
            renderizarTareas(data.tareas);
        } catch (err) {
            console.error(err);
            mostrarToast('No se pudieron cargar las tareas', 'err');
        } finally {
            if (loading) loading.style.display = 'none';
        }
    }

    function renderizarTareas(tareas) {
        // Limpiar zonas y cache
        Object.keys(cacheTareas).forEach(k => delete cacheTareas[k]);

        ['Pendiente', 'En Progreso', 'Completada'].forEach(estado => {
            const zona = document.getElementById(`list-${estado}`);
            if (!zona) return;
            // Quitar solo las cards, conservar el empty state en el DOM
            zona.querySelectorAll('.ht-card').forEach(c => c.remove());
        });

        tareas.forEach(tarea => {
            // Guardar en cache para el modal de detalle
            cacheTareas[tarea.idAsignacion] = tarea;
            const card = crearTarjetaTarea(tarea);
            const zona = document.getElementById(`list-${tarea.estado}`);
            if (zona) {
                // ✅ FIX 1: insertar ANTES del empty state para que quede arriba
                const emptyEl = zona.querySelector('.ht-col-empty');
                if (emptyEl) {
                    zona.insertBefore(card, emptyEl);
                } else {
                    zona.appendChild(card);
                }
            }
        });

        // Actualizar visibilidad del empty state en cada columna
        actualizarEmptyStates();
        actualizarTodosLosContadores(tareas);
        actualizarNavTareas(tareas);
        aplicarVisibilidadCompletadas();

        const total = document.getElementById('totalTasks');
        if (total) total.textContent = tareas.length;
    }

    // ✅ FIX 1: controla el empty state por columna
    function actualizarEmptyStates() {
        ['Pendiente', 'En Progreso', 'Completada'].forEach(estado => {
            const zona    = document.getElementById(`list-${estado}`);
            const emptyEl = document.getElementById(`empty-${estado}`);
            if (!zona || !emptyEl) return;
            const tieneCards = zona.querySelectorAll('.ht-card').length > 0;
            emptyEl.classList.toggle('hidden', tieneCards);
        });
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
                    <button class="ht-card-btn-detail" data-action="ver" title="Ver detalle">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="ht-card-btn-detail" data-action="reportar" title="Reportar incidencia" style="color:var(--warn);">
                        <i class="bi bi-exclamation-triangle-fill"></i>
                    </button>
                </div>
            </div>
        `;

        // Drag
        div.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', String(tarea.idAsignacion));
            div.classList.add('dragging');
        });
        div.addEventListener('dragend', () => div.classList.remove('dragging'));

        // ✅ FIX 2: delegación directa, sin buscar clase — usa data-action
        div.addEventListener('click', e => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            e.stopPropagation();
            if (btn.dataset.action === 'ver')      abrirModalDetalle(tarea);
            if (btn.dataset.action === 'reportar') abrirModalReporte(null, tarea);
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

        // ✅ FIX 2: reemplazar el botón del footer con uno limpio para evitar listeners duplicados
        const btnOld = document.getElementById('btnOpenReport');
        if (btnOld) {
            const btnNew = btnOld.cloneNode(true);
            btnOld.replaceWith(btnNew);
            btnNew.addEventListener('click', () => {
                bootstrap.Modal.getOrCreateInstance(document.getElementById('taskDetailModal')).hide();
                setTimeout(() => abrirModalReporte(null, tarea), 320);
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
            zona.addEventListener('dragleave', e => {
                // Solo quitar si el cursor sale de la zona real (no de un hijo)
                if (!zona.contains(e.relatedTarget)) zona.classList.remove('drag-over');
            });
            zona.addEventListener('drop', async e => {
                e.preventDefault();
                zona.classList.remove('drag-over');

                const idAsignacion = e.dataTransfer.getData('text/plain');
                const tarjeta      = document.querySelector(`[data-id-asignacion="${idAsignacion}"]`);
                if (!tarjeta || !estadoTarget) return;

                const estadoAnterior = tarjeta.getAttribute('data-estado');
                if (estadoAnterior === estadoTarget) return; // sin cambio

                // Mover card al DOM — insertarla antes del empty state
                tarjeta.setAttribute('data-estado', estadoTarget);
                // Actualizar cache
                if (cacheTareas[idAsignacion]) cacheTareas[idAsignacion].estado = estadoTarget;

                const emptyEl = zona.querySelector('.ht-col-empty');
                if (emptyEl) zona.insertBefore(tarjeta, emptyEl);
                else zona.appendChild(tarjeta);

                // Visibilidad si es Completada
                if (estadoTarget === 'Completada' && completadasOcultas) {
                    tarjeta.classList.add('hidden-completed');
                } else {
                    tarjeta.classList.remove('hidden-completed');
                }

                // ✅ FIX 3: actualizar TODOS los contadores desde el DOM
                actualizarEmptyStates();
                actualizarContadoresDesdeDOM();

                await actualizarEstadoEnServidor(idAsignacion, estadoTarget);
            });
        });
    }

    async function actualizarEstadoEnServidor(idAsignacion, nuevoEstado) {
        try {
            const res = await fetch(ENDPOINTS.cambiarEstado(idAsignacion), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken':  obtenerCsrfToken(),
                },
                body: JSON.stringify({ estado: nuevoEstado }),
            });
            if (!res.ok) throw new Error('Error al actualizar estado');
        } catch (err) {
            console.error(err);
            mostrarToast('Error al cambiar el estado. Recargando…', 'err');
            obtenerTareas(); // revertir desde servidor
        }
    }

    // ✅ FIX 3: lee los data-estado actuales del DOM y actualiza los 6 contadores
    function actualizarContadoresDesdeDOM() {
        const cards = Array.from(document.querySelectorAll('.ht-card'));
        const pendiente  = cards.filter(c => c.getAttribute('data-estado') === 'Pendiente').length;
        const enProgreso = cards.filter(c => c.getAttribute('data-estado') === 'En Progreso').length;
        const completada = cards.filter(c => c.getAttribute('data-estado') === 'Completada').length;

        // Contadores de columna (círculo junto al título)
        if (contadoresColumna['Pendiente'])   contadoresColumna['Pendiente'].textContent   = pendiente;
        if (contadoresColumna['En Progreso']) contadoresColumna['En Progreso'].textContent = enProgreso;
        if (contadoresColumna['Completada'])  contadoresColumna['Completada'].textContent  = completada;

        // Contadores top bar (barra de controles)
        const sp = document.getElementById('statPendiente');
        const sc = document.getElementById('statProceso');
        const sf = document.getElementById('statFinalizado');
        if (sp) sp.textContent = pendiente;
        if (sc) sc.textContent = enProgreso;
        if (sf) sf.textContent = completada;

        // Total
        const total = document.getElementById('totalTasks');
        if (total) total.textContent = cards.length;
    }

    function actualizarTodosLosContadores(tareas) {
        const pendiente  = tareas.filter(t => t.estado === 'Pendiente').length;
        const enProgreso = tareas.filter(t => t.estado === 'En Progreso').length;
        const completada = tareas.filter(t => t.estado === 'Completada').length;

        if (contadoresColumna['Pendiente'])   contadoresColumna['Pendiente'].textContent   = pendiente;
        if (contadoresColumna['En Progreso']) contadoresColumna['En Progreso'].textContent = enProgreso;
        if (contadoresColumna['Completada'])  contadoresColumna['Completada'].textContent  = completada;

        const sp = document.getElementById('statPendiente');
        const sc = document.getElementById('statProceso');
        const sf = document.getElementById('statFinalizado');
        if (sp) sp.textContent = pendiente;
        if (sc) sc.textContent = enProgreso;
        if (sf) sf.textContent = completada;

        const total = document.getElementById('totalTasks');
        if (total) total.textContent = tareas.length;
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
            btn.querySelector('i').className   = completadasOcultas ? 'bi bi-eye' : 'bi bi-eye-slash';
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
        header.addEventListener('click', () => col.classList.toggle('collapsed'));
    }

    // ═══════════════════════════════════════════════════════════════
    // 6. MODAL REPORTE — CREAR Y EDITAR
    // ═══════════════════════════════════════════════════════════════

    function configurarBotonesExteriores() {
        const btnGenerar = document.getElementById('btnGenerateReport');
        if (btnGenerar) btnGenerar.addEventListener('click', () => abrirModalReporte());
    }

    function abrirModalReporte(reporte = null, tarea = null) {
        limpiarErroresFormulario();
        resetearFormularioReporte();

        const tareaRef  = document.getElementById('reportTareaRef');
        const tareaName = document.getElementById('reportTareaName');

        if (reporte) {
            // Modo edición
            formReporte.editId.value           = reporte.idIncidencia;
            formReporte.tipo.value             = reporte.tipoIncidencia || '';
            formReporte.descripcion.value      = reporte.descripcionCompleta || reporte.descripcion || '';
            formReporte.periodo.value          = reporte.periodoEvaluado || '';
            formReporte.eyebrow.textContent    = 'Editar Incidencia';
            formReporte.modalTitle.textContent = 'Editar Reporte';
            formReporte.btnLabel.textContent   = 'Guardar cambios';
            if (formReporte.tipoCount)    formReporte.tipoCount.textContent    = formReporte.tipo.value.length;
            if (formReporte.descCount)    formReporte.descCount.textContent    = formReporte.descripcion.value.length;
            if (formReporte.periodoCount) formReporte.periodoCount.textContent = formReporte.periodo.value.length;
            if (tareaRef) tareaRef.style.display = 'none';
        } else {
            // Modo crear
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

        formReporte.btnGuardar.addEventListener('click', enviarReporte);
    }

    async function enviarReporte() {
        limpiarErroresFormulario();

        const payload = {
            tipoIncidencia:  formReporte.tipo        ? formReporte.tipo.value.trim()        : '',
            descripcion:     formReporte.descripcion ? formReporte.descripcion.value.trim() : '',
            periodoEvaluado: formReporte.periodo     ? formReporte.periodo.value.trim()     : '',
        };

        const editId   = formReporte.editId ? formReporte.editId.value : '';
        const esEdicion = !!editId;
        const url      = esEdicion ? ENDPOINTS.editarReporte(editId) : ENDPOINTS.guardarReporte;

        try {
            formReporte.btnGuardar.disabled = true;
            const res  = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': obtenerCsrfToken() },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (res.status === 400 && data.errores) {
                if (data.errores.tipoIncidencia  && formReporte.errTipo)    formReporte.errTipo.textContent    = data.errores.tipoIncidencia;
                if (data.errores.descripcion     && formReporte.errDesc)    formReporte.errDesc.textContent    = data.errores.descripcion;
                if (data.errores.periodoEvaluado && formReporte.errPeriodo) formReporte.errPeriodo.textContent = data.errores.periodoEvaluado;
                return;
            }

            if (!res.ok) throw new Error(data.error || 'Error del servidor');

            bootstrap.Modal.getOrCreateInstance(document.getElementById('reportModal')).hide();
            resetearFormularioReporte();
            obtenerHistorialReportes();
            mostrarToast(esEdicion ? '✏️ Reporte actualizado' : '✅ Reporte enviado correctamente', 'ok');

            // — Descarga automática del PDF al crear (no al editar) —
            if (!esEdicion && data.idIncidencia) {
                descargarPDF(data.idIncidencia);
            }

        } catch (err) {
            console.error(err);
            mostrarToast('❌ No se pudo guardar el reporte', 'err');
        } finally {
            formReporte.btnGuardar.disabled = false;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 7. HISTORIAL DE REPORTES
    // ═══════════════════════════════════════════════════════════════

    async function obtenerHistorialReportes() {
        try {
            const res  = await fetch(ENDPOINTS.historialReportes);
            if (!res.ok) throw new Error('Error historial');
            const data = await res.json();
            renderizarHistorialReportes(data.reportes);
        } catch (err) {
            console.error(err);
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
                        <button class="ht-report-action-btn ht-report-action-btn--pdf"
                                data-id="${rep.idIncidencia}"
                                title="Descargar PDF">
                            <i class="bi bi-file-earmark-pdf-fill"></i>
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

        contenedor.querySelectorAll('.ht-report-action-btn--edit').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const reporte = {
                    idIncidencia:        btn.dataset.id,
                    tipoIncidencia:      decodeURIComponent(btn.dataset.tipo),
                    descripcionCompleta: decodeURIComponent(btn.dataset.desc),
                    periodoEvaluado:     decodeURIComponent(btn.dataset.periodo),
                };
                document.activeElement?.blur();
                setTimeout(() => abrirModalReporte(reporte), 150);
            });
        });

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

        contenedor.querySelectorAll('.ht-report-action-btn--pdf').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                descargarPDF(btn.dataset.id);
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // 8. MODAL ELIMINAR
    // ═══════════════════════════════════════════════════════════════

    function configurarModalEliminar() {
        const btnConfirm = document.getElementById('btnConfirmDelete');
        if (!btnConfirm) return;

        btnConfirm.addEventListener('click', async () => {
            if (!pendingDeleteId) return;
            try {
                btnConfirm.disabled = true;
                const res  = await fetch(ENDPOINTS.eliminarReporte(pendingDeleteId), {
                    method: 'POST',
                    headers: { 'X-CSRFToken': obtenerCsrfToken() },
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Error al eliminar');
                bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteModal')).hide();
                obtenerHistorialReportes();
                mostrarToast('🗑️ Reporte eliminado', 'ok');
            } catch (err) {
                console.error(err);
                mostrarToast('❌ No se pudo eliminar el reporte', 'err');
            } finally {
                btnConfirm.disabled = false;
                pendingDeleteId = null;
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // 9. BUSCADOR Y FILTRO
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
            const nombre     = card.querySelector('.ht-card-name')?.textContent.toLowerCase() || '';
            const cardPrio   = card.getAttribute('data-prio') || '';
            const cardEstado = card.getAttribute('data-estado') || '';

            const coincideTexto = !texto || nombre.includes(texto);
            const coincidePrio  = !prio  || cardPrio === prio;

            const ocultaPorToggle = completadasOcultas && cardEstado === 'Completada';

            card.style.display = (coincideTexto && coincidePrio && !ocultaPorToggle) ? '' : 'none';
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

    function descargarPDF(idIncidencia) {
        const link = document.createElement('a');
        link.href  = ENDPOINTS.pdfReporte(idIncidencia);
        link.setAttribute('download', `HebraTech_Incidencia_${String(idIncidencia)}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // ── Arrancar ─────────────────────────────────────────────────
    init();
});