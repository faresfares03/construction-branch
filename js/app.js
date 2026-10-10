(() => {
    "use strict";

    /* =========================================================
       Helpers
       ========================================================= */

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];


    /* =========================================================
       Status
       ========================================================= */

    const STATUS = {
        completed: {
            label: "منجز",
            color: "green"
        },

        ongoing: {
            label: "قيد الإنجاز",
            color: "gold"
        },

        study: {
            label: "قيد إعداد الدراسة",
            color: "sage"
        },

        paused: {
            label: "متوقف",
            color: "red"
        },

        review: {
            label: "قيد التدقيق",
            color: "sage"
        }
    };


    /* =========================================================
       Utilities
       ========================================================= */

    function formatDate(date) {

        if (!date || date === "—") {
            return "—";
        }

        const d = new Date(date);

        if (Number.isNaN(d.getTime())) {
            return date;
        }

        return new Intl.DateTimeFormat("ar-SY", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }).format(d);
    }


    function countByStatus(status) {

        return Array.isArray(APP_DATA.projects)
            ? APP_DATA.projects.filter(
                project => project.status === status
            ).length
            : 0;
    }


    function escapeHTML(value) {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function getReviewGroups() {

        const review = APP_DATA.review || {};

        return {
            internal: Array.isArray(review.internal)
                ? review.internal
                : [],

            central: Array.isArray(review.central)
                ? review.central
                : []
        };
    }


    function getMaintenanceGroups() {

        const maintenance = APP_DATA.maintenance || {};

        return {
            under1000: Array.isArray(maintenance.under1000)
                ? maintenance.under1000
                : [],

            under10000: Array.isArray(maintenance.under10000)
                ? maintenance.under10000
                : []
        };
    }


    function getReviewItems() {

        const groups = getReviewGroups();

        return [
            ...groups.internal,
            ...groups.central
        ];
    }


    function getMaintenanceItems() {

        const groups = getMaintenanceGroups();

        return [
            ...groups.under1000,
            ...groups.under10000
        ];
    }


    function getTotalReviewCount() {

        return getReviewItems().length;
    }


    function getTotalMaintenanceCount() {

        return getMaintenanceItems().length;
    }


    function formatCost(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "—";
        }

        if (typeof value === "number") {
            return `$${value.toLocaleString("en-US")}`;
        }

        return String(value);
    }


    function getItemName(item) {

        return (
            item.name ||
            item.title ||
            item.projectName ||
            "بدون اسم"
        );
    }


    /* =========================================================
       META
       ========================================================= */

    function renderMeta() {

        const topDate = $("#topDate");
        const periodLabel = $("#periodLabel");
        const updatedLabel = $("#updatedLabel");

        const lastUpdated =
            APP_DATA.meta?.lastUpdated ||
            APP_DATA.meta?.updated ||
            "—";

        if (topDate) {
            topDate.textContent =
                `آخر تحديث: ${lastUpdated}`;
        }

        if (periodLabel) {
            periodLabel.textContent =
                APP_DATA.meta?.period || "—";
        }

        if (updatedLabel) {
            updatedLabel.textContent =
                lastUpdated;
        }
    }


    /* =========================================================
       Statistics
       ========================================================= */

    function renderStats() {

        const total =
            Array.isArray(APP_DATA.projects)
                ? APP_DATA.projects.length
                : 0;

        const statsGrid = $("#statsGrid");

        if (statsGrid) {

            const stats = [
                {
                    value: countByStatus("completed"),
                    label: "المشاريع المنجزة",
                    icon: "✓"
                },
                {
                    value: countByStatus("ongoing"),
                    label: "المشاريع قيد الإنجاز",
                    icon: "↻"
                },
                {
                    value: countByStatus("study"),
                    label: "المشاريع قيد الدراسة",
                    icon: "⌕"
                },
                {
                    value: countByStatus("paused"),
                    label: "المشاريع المتوقفة",
                    icon: "Ⅱ"
                }
            ];

            statsGrid.innerHTML = stats.map(item => `
                <div class="stat-card">

                    <div class="stat-icon">
                        ${item.icon}
                    </div>

                    <div class="stat-value">
                        ${item.value}
                    </div>

                    <div class="stat-label">
                        ${item.label}
                    </div>

                </div>
            `).join("");
        }


        /* Status bars */

        const statusBars = $("#statusBars");

        if (statusBars) {

            const bars = [
                {
                    label: "منجزة",
                    value: countByStatus("completed"),
                    color: ""
                },
                {
                    label: "قيد الإنجاز",
                    value: countByStatus("ongoing"),
                    color: "gold"
                },
                {
                    label: "قيد الدراسة",
                    value: countByStatus("study"),
                    color: ""
                },
                {
                    label: "متوقفة",
                    value: countByStatus("paused"),
                    color: "red"
                }
            ];

            statusBars.innerHTML = bars.map(item => {

                const percent = total
                    ? Math.round((item.value / total) * 100)
                    : 0;

                return `
                    <div>

                        <div class="mb-2 flex items-center justify-between text-xs font-bold">

                            <span>
                                ${item.label}
                            </span>

                            <span class="text-slate-500">
                                ${item.value} من ${total}
                                ·
                                ${percent}%
                            </span>

                        </div>

                        <div class="progress-track">

                            <div
                                class="progress-fill ${item.color}"
                                style="width:${percent}%"
                            ></div>

                        </div>

                    </div>
                `;

            }).join("");
        }


        /* Executive Highlights */

        const highlights = $("#executiveHighlights");

        if (highlights) {

            const items =
                Array.isArray(APP_DATA.executiveHighlights)
                    ? APP_DATA.executiveHighlights
                    : [];

            highlights.innerHTML = items.map(text => `
                <li class="flex gap-3 text-sm leading-7 text-white/70">

                    <span
                        class="mt-2 h-2 w-2 shrink-0 rounded-full bg-sy-gold"
                    ></span>

                    <span>
                        ${escapeHTML(text)}
                    </span>

                </li>
            `).join("");
        }
    }


    /* =========================================================
       Project Image
       ========================================================= */

    function projectImage(project) {

        if (
            project.images &&
            project.images.length > 0
        ) {

            return `
                <img
                    src="${escapeHTML(project.images[0])}"
                    alt="${escapeHTML(getItemName(project))}"
                    loading="lazy"
                >
            `;
        }

        return `
            <div class="project-placeholder">

                <div class="text-center">

                    <div class="mb-2 text-3xl opacity-50">
                        ▧
                    </div>

                    <div>
                        تُضاف صور المشروع هنا
                    </div>

                </div>

            </div>
        `;
    }


    /* =========================================================
       Project Card
       ========================================================= */

    function projectCard(project) {

        const status =
            STATUS[project.status] ||
            STATUS.ongoing;

        const progress =
            Number(project.progress) || 0;

        return `
            <article class="project-card">

                <div class="project-media">

                    ${projectImage(project)}

                    <span class="project-status">
                        ${escapeHTML(
                            project.statusLabel ||
                            status.label
                        )}
                    </span>

                </div>


                <div class="project-body">

                    <div class="project-title">
                        ${escapeHTML(getItemName(project))}
                    </div>


                    <div class="mt-2 text-xs text-slate-500">
                        ${escapeHTML(project.location || "—")}
                    </div>


                    <div class="mt-5">

                        <div class="mb-2 flex items-center justify-between text-xs font-bold">

                            <span>
                                نسبة الإنجاز
                            </span>

                            <span class="text-sy-green">
                                ${progress}%
                            </span>

                        </div>


                        <div class="progress-track">

                            <div
                                class="
                                    progress-fill
                                    ${
                                        project.status === "paused"
                                            ? "red"
                                            : project.status === "completed"
                                                ? ""
                                                : "gold"
                                    }
                                "
                                style="width:${progress}%"
                            ></div>

                        </div>

                    </div>


                    <div class="project-meta">

                        <span>
                            البدء:
                            ${formatDate(project.startDate)}
                        </span>

                        <span>
                            المستهدف:
                            ${formatDate(project.expectedEnd)}
                        </span>

                    </div>


                    <div class="project-actions">

                        <span class="text-[11px] text-slate-400">
                            ${escapeHTML(
                                project.statusLabel ||
                                status.label
                            )}
                        </span>

                        <button
                            class="details-btn"
                            data-project-id="${project.id}"
                            type="button"
                        >
                            عرض التفاصيل ←
                        </button>

                    </div>

                </div>

            </article>
        `;
    }



function stoppedProjectCard(item) {
    const name = escapeHTML(item.name || "مشروع دون اسم");
    const stopDate = escapeHTML(item.stopDate || "غير محدد");
    const reason = escapeHTML(item.reason || "لم يُسجل سبب التوقف.");
    const actions = escapeHTML(
        item.actionsTaken || "لم تُسجل إجراءات متخذة حتى الآن."
    );
    const entity = escapeHTML(item.followUpEntity || "غير محددة");
    const notes = item.notes
        ? `
            <div class="stopped-project-field full-width">
                <div class="stopped-project-label">ملاحظات إضافية</div>
                <div class="stopped-project-value">${escapeHTML(item.notes)}</div>
            </div>
        `
        : "";

    return `
        <article class="stopped-project-card">

            <header class="stopped-project-header">
                <div>
                    <h3 class="stopped-project-title">${name}</h3>
                    <p class="stopped-project-date">
                        تاريخ التوقف: ${stopDate}
                    </p>
                </div>

                <span class="stopped-project-status">
                    متوقف
                </span>
            </header>

            <div class="stopped-project-body">

                <div class="stopped-project-field full-width">
                    <div class="stopped-project-label">سبب التوقف</div>
                    <div class="stopped-project-value">${reason}</div>
                </div>

                <div class="stopped-project-field full-width stopped-project-actions">
                    <div class="stopped-project-label">الإجراءات المتخذة / قيد المتابعة</div>
                    <div class="stopped-project-value">${actions}</div>
                </div>

                <div class="stopped-project-field">
                    <div class="stopped-project-label">جهة المتابعة</div>
                    <div class="stopped-project-value">${entity}</div>
                </div>

                ${notes}

            </div>

            <footer class="stopped-project-footer">
                <span>سجل متابعة المشاريع المتوقفة</span>
                <span>الحالة: <strong>يتطلب المعالجة والمتابعة</strong></span>
            </footer>

        </article>
    `;
}


    /* =========================================================
       Render Projects
       ========================================================= */

    function renderProjectGroups() {

        const projects =
            Array.isArray(APP_DATA.projects)
                ? APP_DATA.projects
                : [];

        const groups = {

            completed:
                projects.filter(
                    p => p.status === "completed"
                ),

            ongoing:
                projects.filter(
                    p => p.status === "ongoing"
                ),

            study:
                projects.filter(
                    p => p.status === "study"
                ),

            paused:
                projects.filter(
                    p => p.status === "paused"
                )
        };


        /* Completed */

        const completedGrid =
            $("#completedGrid");

        if (completedGrid) {

            completedGrid.innerHTML =
                groups.completed.length

                    ? groups.completed
                        .map(projectCard)
                        .join("")

                    : `
                        <div class="
                            empty-state
                            md:col-span-2
                            xl:col-span-3
                        ">
                            لا توجد مشاريع منجزة مضافة حاليًا.
                        </div>
                    `;
        }


        /* Ongoing */

        const ongoingGrid =
            $("#ongoingGrid");

        if (ongoingGrid) {

            ongoingGrid.innerHTML =
                groups.ongoing.length

                    ? groups.ongoing
                        .map(projectCard)
                        .join("")

                    : `
                        <div class="
                            empty-state
                            md:col-span-2
                            xl:col-span-3
                        ">
                            لا توجد مشاريع قيد الإنجاز مضافة حاليًا.
                        </div>
                    `;
        }


        /* Paused */

        const pausedGrid =
            $("#pausedGrid");

        if (pausedGrid) {

            pausedGrid.innerHTML =
                groups.paused.length

                    ? groups.paused
                        .map(projectCard)
                        .join("")

                    : `
                        <div class="
                            empty-state
                            lg:col-span-2
                        ">
                            لا توجد مشاريع متوقفة مضافة حاليًا.
                        </div>
                    `;
        }


        /* Counts */

        if ($("#completedCount")) {

            $("#completedCount").textContent =
                `${groups.completed.length} مشروع`;
        }

        if ($("#ongoingCount")) {

            $("#ongoingCount").textContent =
                `${groups.ongoing.length} مشروع`;
        }

        if ($("#studiesCount")) {

            $("#studiesCount").textContent =
                `${groups.study.length} مشروع`;
        }

        if ($("#pausedCount")) {

            $("#pausedCount").textContent =
                `${groups.paused.length} مشروع`;
        }


        /* Studies Table */

        const studiesTable =
            $("#studiesTable");

        if (studiesTable) {

            studiesTable.innerHTML =
                groups.study.length

                    ? `
                        <div class="overflow-x-auto">

                            <table class="data-table">

                                <thead>

                                    <tr>
                                        <th>المشروع</th>
                                        <th>الموقع</th>
                                        <th>مرحلة الدراسة</th>
                                        <th>نسبة الإنجاز</th>
                                        <th>الحالة</th>
                                    </tr>

                                </thead>


                                <tbody>

                                    ${groups.study.map(project => `

                                        <tr>

                                            <td class="font-bold">
                                                ${escapeHTML(
                                                    getItemName(project)
                                                )}
                                            </td>

                                            <td>
                                                ${escapeHTML(
                                                    project.location || "—"
                                                )}
                                            </td>

                                            <td>
                                                ${escapeHTML(
                                                    project.stage || "—"
                                                )}
                                            </td>

                                            <td class="min-w-[170px]">

                                                <div class="flex items-center gap-3">

                                                    <div class="progress-track flex-1">

                                                        <div
                                                            class="progress-fill"
                                                            style="
                                                                width:${Number(project.progress) || 0}%
                                                            "
                                                        ></div>

                                                    </div>

                                                    <span class="font-bold">
                                                        ${Number(project.progress) || 0}%
                                                    </span>

                                                </div>

                                            </td>

                                            <td>

                                                <span class="status-chip">
                                                    ${escapeHTML(
                                                        project.statusLabel ||
                                                        "قيد إعداد الدراسة"
                                                    )}
                                                </span>

                                            </td>

                                        </tr>

                                    `).join("")}

                                </tbody>

                            </table>

                        </div>
                    `

                    : `
                        <div class="empty-state m-5">
                            لا توجد دراسات مضافة حاليًا.
                        </div>
                    `;
        }


        /* Attach details buttons */

        $$(".details-btn").forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(button.dataset.projectId);

                    openProjectModal(id);

                }
            );

        });
    }




function renderStoppedProjects() {
    const container = $("#pausedGrid");
    const count = $("#pausedCount");

    if (!container) return;

    const projects = Array.isArray(APP_DATA.projects)
        ? APP_DATA.projects
        : [];

    const stoppedProjects = Array.isArray(APP_DATA.stoppedProjects)
        ? APP_DATA.stoppedProjects
        : [];

    // المشاريع المتوقفة القديمة الموجودة ضمن قائمة المشاريع العامة.
    const legacyPaused = projects.filter(
        project => project.status === "paused"
    );

    // منع تكرار المشروع إذا كان موجودًا في القائمتين.
    const independentStopped = stoppedProjects.filter(
        stopped => !legacyPaused.some(
            project => project.name === stopped.name
        )
    );

    const total = legacyPaused.length + independentStopped.length;

    if (count) {
        count.textContent = `${total} مشروع`;
    }

    const cards = [
        ...legacyPaused.map(project => projectCard(project)),
        ...independentStopped.map(project => stoppedProjectCard(project))
    ];

    container.innerHTML = cards.length
        ? cards.join("")
        : `
            <div class="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500">
                لا توجد مشاريع متوقفة مسجلة حاليًا.
            </div>
        `;

    // إعادة ربط أزرار تفاصيل المشاريع القديمة بعد إعادة رسم البطاقات.
    $$(".details-btn", container).forEach(button => {
        button.addEventListener("click", () => {
            openProjectModal(Number(button.dataset.projectId));
        });
    });
}



    /* =========================================================
       Review Cards
       ========================================================= */

    function reviewCard(item, type) {

        const title =
            getItemName(item);

        const statusLabel =
            item.statusLabel ||
            (type === "internal"
                ? "تدقيق داخلي"
                : "تدقيق في الإدارة المركزية");

        const progress =
            Number(item.progress) || 0;

        return `
            <article class="project-card">

                <div class="project-media">

                    ${projectImage(item)}

                    <span class="project-status">
                        ${escapeHTML(statusLabel)}
                    </span>

                </div>


                <div class="project-body">

                    <div class="project-title">
                        ${escapeHTML(title)}
                    </div>

                    <div class="mt-2 text-xs text-slate-500">
                        ${escapeHTML(item.location || "—")}
                    </div>


                    ${
                        item.stage
                            ? `
                                <div class="mt-4 text-sm text-slate-600">
                                    <strong>المرحلة:</strong>
                                    ${escapeHTML(item.stage)}
                                </div>
                            `
                            : ""
                    }


                    ${
                        item.description
                            ? `
                                <p class="
                                    mt-4
                                    text-sm
                                    leading-7
                                    text-slate-500
                                ">
                                    ${escapeHTML(item.description)}
                                </p>
                            `
                            : ""
                    }


                    <div class="mt-5">

                        <div class="mb-2 flex items-center justify-between text-xs font-bold">

                            <span>
                                نسبة الإنجاز
                            </span>

                            <span class="text-sy-green">
                                ${progress}%
                            </span>

                        </div>

                        <div class="progress-track">

                            <div
                                class="progress-fill"
                                style="width:${progress}%"
                            ></div>

                        </div>

                    </div>


                    ${
                        item.need
                            ? `
                                <div class="
                                    mt-4
                                    rounded-xl
                                    border
                                    border-sy-gold/20
                                    bg-sy-gold/5
                                    p-3
                                    text-sm
                                    leading-7
                                ">
                                    <strong class="text-sy-gold">
                                        المطلوب:
                                    </strong>
                                    ${escapeHTML(item.need)}
                                </div>
                            `
                            : ""
                    }

                </div>

            </article>
        `;
    }


    /* =========================================================
       Render Review
       ========================================================= */

    function renderReview() {

        const groups =
            getReviewGroups();

        const all =
            [
                ...groups.internal,
                ...groups.central
            ];

        const total =
            all.length;


        const count =
            $("#reviewCount");

        if (count) {

            count.textContent =
                `${total} ${total === 1 ? "حالة" : "حالات"}`;
        }


        const container =
            $("#reviewGrid");

        if (!container) {
            return;
        }


        if (!total) {

            container.innerHTML = `
                <div class="
                    empty-state
                    lg:col-span-3
                ">
                    لا توجد مشاريع قيد التدقيق مضافة حاليًا.
                </div>
            `;

            return;
        }


        let html = "";


        if (groups.internal.length) {

            html += `
                <div class="lg:col-span-3">

                    <div class="
                        mb-4
                        flex
                        items-center
                        justify-between
                    ">

                        <div>
                            <h3 class="
                                text-lg
                                font-extrabold
                                text-sy-deep
                            ">
                                التدقيق الداخلي
                            </h3>

                            <p class="
                                mt-1
                                text-sm
                                text-slate-500
                            ">
                                ${groups.internal.length}
                                ${groups.internal.length === 1 ? "مشروع" : "مشاريع"}
                            </p>
                        </div>

                    </div>

                </div>

                ${groups.internal
                    .map(item => reviewCard(item, "internal"))
                    .join("")}
            `;
        }


        if (groups.central.length) {

            html += `
                <div class="lg:col-span-3 mt-6">

                    <div class="
                        mb-4
                        flex
                        items-center
                        justify-between
                    ">

                        <div>
                            <h3 class="
                                text-lg
                                font-extrabold
                                text-sy-deep
                            ">
                                التدقيق في الإدارة المركزية
                            </h3>

                            <p class="
                                mt-1
                                text-sm
                                text-slate-500
                            ">
                                ${groups.central.length}
                                ${groups.central.length === 1 ? "مشروع" : "مشاريع"}
                            </p>
                        </div>

                    </div>

                </div>

                ${groups.central
                    .map(item => reviewCard(item, "central"))
                    .join("")}
            `;
        }


        container.innerHTML = html;
    }


    /* =========================================================
       Maintenance Card
       ========================================================= */

    function maintenanceCard(item) {

        const title =
            getItemName(item);

        const cost =
            item.estimatedCost ??
            item.cost ??
            item.amount ??
            item.value;

        const status =
            item.statusLabel ||
            item.status ||
            "أعمال صيانة";


        return `
            <article class="info-card">

                <div class="
                    flex
                    items-start
                    justify-between
                    gap-4
                ">

                    <div class="number">
                        ${escapeHTML(item.icon || "01")}
                    </div>

                    <span class="status-chip">
                        ${escapeHTML(status)}
                    </span>

                </div>


                <h3>
                    ${escapeHTML(title)}
                </h3>


                ${
                    item.location
                        ? `
                            <div class="
                                mt-2
                                text-xs
                                font-semibold
                                text-slate-400
                            ">
                                الموقع:
                                ${escapeHTML(item.location)}
                            </div>
                        `
                        : ""
                }


                ${
                    cost !== undefined &&
                    cost !== null &&
                    cost !== ""
                        ? `
                            <div class="
                                mt-4
                                rounded-xl
                                border
                                border-sy-gold/20
                                bg-sy-gold/5
                                p-3
                            ">

                                <div class="
                                    text-[11px]
                                    text-slate-400
                                ">
                                    التقدير المالي
                                </div>

                                <div class="
                                    mt-1
                                    font-extrabold
                                    text-sy-deep
                                ">
                                    ${escapeHTML(formatCost(cost))}
                                </div>

                            </div>
                        `
                        : ""
                }


                ${
                    item.description
                        ? `
                            <p>
                                ${escapeHTML(item.description)}
                            </p>
                        `
                        : ""
                }


                ${
                    item.need
                        ? `
                            <p>
                                <strong class="text-sy-deep">
                                    الاحتياج:
                                </strong>
                                ${escapeHTML(item.need)}
                            </p>
                        `
                        : ""
                }


                ${
                    item.priority
                        ? `
                            <p>
                                <strong class="text-sy-deep">
                                    الأولوية:
                                </strong>
                                ${escapeHTML(item.priority)}
                            </p>
                        `
                        : ""
                }

            </article>
        `;
    }


    /* =========================================================
       Render Maintenance
       ========================================================= */

    function renderMaintenance() {

        const groups =
            getMaintenanceGroups();

        const total =
            groups.under1000.length +
            groups.under10000.length;


        const count =
            $("#maintenanceCount");

        if (count) {

            count.textContent =
                `${total} ${total === 1 ? "عمل" : "أعمال"}`;
        }


        const smallCount =
            $("#maintenanceSmallCount");

        if (smallCount) {

            smallCount.textContent =
                `${groups.under1000.length} ${
                    groups.under1000.length === 1
                        ? "عمل"
                        : "أعمال"
                }`;
        }


        const mediumCount =
            $("#maintenanceMediumCount");

        if (mediumCount) {

            mediumCount.textContent =
                `${groups.under10000.length} ${
                    groups.under10000.length === 1
                        ? "عمل"
                        : "أعمال"
                }`;
        }


        const smallGrid =
            $("#maintenanceSmallGrid");

        if (smallGrid) {

            smallGrid.innerHTML =
                groups.under1000.length

                    ? groups.under1000
                        .map(maintenanceCard)
                        .join("")

                    : `
                        <div class="
                            empty-state
                            lg:col-span-3
                        ">
                            لا توجد أعمال صيانة ضمن فئة دون 1,000$ حاليًا.
                        </div>
                    `;
        }


        const mediumGrid =
            $("#maintenanceMediumGrid");

        if (mediumGrid) {

            mediumGrid.innerHTML =
                groups.under10000.length

                    ? groups.under10000
                        .map(maintenanceCard)
                        .join("")

                    : `
                        <div class="
                            empty-state
                            lg:col-span-3
                        ">
                            لا توجد أعمال صيانة ضمن فئة دون 10,000$ حاليًا.
                        </div>
                    `;
        }
    }


    /* =========================================================
       Project Modal
       ========================================================= */

    function openProjectModal(projectId) {

        const project =
            APP_DATA.projects.find(
                item => Number(item.id) === projectId
            );

        if (!project) {
            return;
        }


        const modal =
            $("#projectModal");

        const content =
            $("#modalContent");

        if (!modal || !content) {
            return;
        }


        const completedWork =
            project.completedWork || [];

        const remainingWork =
            project.remainingWork || [];


        content.innerHTML = `

            <div class="space-y-6">

                <div>

                    <div class="mb-3">

                        <span class="status-chip">
                            ${escapeHTML(
                                project.statusLabel ||
                                "—"
                            )}
                        </span>

                    </div>

                    <h2 class="
                        text-2xl
                        font-extrabold
                        text-white
                    ">
                        ${escapeHTML(getItemName(project))}
                    </h2>

                    <p class="
                        mt-2
                        text-sm
                        leading-7
                        text-white/60
                    ">
                        ${escapeHTML(
                            project.description || ""
                        )}
                    </p>

                </div>


                <div class="
                    grid
                    gap-3
                    sm:grid-cols-2
                ">

                    <div class="
                        rounded-2xl
                        border
                        border-white/10
                        bg-white/5
                        p-4
                    ">

                        <div class="
                            text-xs
                            text-white/40
                        ">
                            الموقع
                        </div>

                        <div class="
                            mt-2
                            font-bold
                            text-white
                        ">
                            ${escapeHTML(
                                project.location || "—"
                            )}
                        </div>

                    </div>


                    <div class="
                        rounded-2xl
                        border
                        border-white/10
                        bg-white/5
                        p-4
                    ">

                        <div class="
                            text-xs
                            text-white/40
                        ">
                            نسبة الإنجاز
                        </div>

                        <div class="
                            mt-2
                            font-bold
                            text-white
                        ">
                            ${Number(project.progress) || 0}%
                        </div>

                    </div>

                </div>


                ${
                    completedWork.length
                        ? `
                            <div>

                                <h3 class="
                                    mb-3
                                    font-bold
                                    text-sy-gold
                                ">
                                    الأعمال المنفذة
                                </h3>

                                <ul class="
                                    space-y-2
                                    text-sm
                                    leading-7
                                    text-white/70
                                ">

                                    ${completedWork.map(item => `
                                        <li class="flex gap-3">

                                            <span class="
                                                mt-3
                                                h-1.5
                                                w-1.5
                                                shrink-0
                                                rounded-full
                                                bg-sy-gold
                                            "></span>

                                            <span>
                                                ${escapeHTML(item)}
                                            </span>

                                        </li>
                                    `).join("")}

                                </ul>

                            </div>
                        `
                        : ""
                }


                ${
                    remainingWork.length
                        ? `
                            <div>

                                <h3 class="
                                    mb-3
                                    font-bold
                                    text-sy-gold
                                ">
                                    الأعمال المتبقية
                                </h3>

                                <ul class="
                                    space-y-2
                                    text-sm
                                    leading-7
                                    text-white/70
                                ">

                                    ${remainingWork.map(item => `
                                        <li class="flex gap-3">

                                            <span class="
                                                mt-3
                                                h-1.5
                                                w-1.5
                                                shrink-0
                                                rounded-full
                                                bg-sy-sage
                                            "></span>

                                            <span>
                                                ${escapeHTML(item)}
                                            </span>

                                        </li>
                                    `).join("")}

                                </ul>

                            </div>
                        `
                        : ""
                }


                ${
                    project.challenge
                        ? `
                            <div class="
                                rounded-2xl
                                border
                                border-sy-burgundy/20
                                bg-sy-burgundy/10
                                p-4
                            ">

                                <div class="
                                    text-xs
                                    font-bold
                                    text-red-200
                                ">
                                    المعوق
                                </div>

                                <div class="
                                    mt-2
                                    text-sm
                                    leading-7
                                    text-white/70
                                ">
                                    ${escapeHTML(
                                        project.challenge
                                    )}
                                </div>

                            </div>
                        `
                        : ""
                }


                ${
                    project.need
                        ? `
                            <div class="
                                rounded-2xl
                                border
                                border-sy-gold/20
                                bg-sy-gold/10
                                p-4
                            ">

                                <div class="
                                    text-xs
                                    font-bold
                                    text-sy-gold
                                ">
                                    الاحتياج
                                </div>

                                <div class="
                                    mt-2
                                    text-sm
                                    leading-7
                                    text-white/70
                                ">
                                    ${escapeHTML(
                                        project.need
                                    )}
                                </div>

                            </div>
                        `
                        : ""
                }

            </div>
        `;


        modal.classList.remove("hidden");

        document.body.classList.add("overflow-hidden");
    }


    function closeProjectModal() {

        const modal =
            $("#projectModal");

        if (!modal) {
            return;
        }

        modal.classList.add("hidden");

        document.body.classList.remove("overflow-hidden");
    }


    /* =========================================================
       Challenges
       ========================================================= */

    function renderChallenges() {

        const container =
            $("#challengesGrid");

        if (!container) {
            return;
        }


        if (
            !APP_DATA.challenges ||
            APP_DATA.challenges.length === 0
        ) {

            container.innerHTML = `
                <div class="
                    empty-state
                    lg:col-span-3
                ">
                    لا توجد تحديات مضافة حاليًا.
                </div>
            `;

            return;
        }


        container.innerHTML =
            APP_DATA.challenges.map((item, index) => `

                <article class="info-card">

                    <div class="
                        flex
                        items-center
                        justify-between
                        gap-3
                    ">

                        <div class="number">
                            ${String(index + 1).padStart(2, "0")}
                        </div>

                        <span class="
                            status-chip
                            ${
                                item.priority === "عالية"
                                    ? "text-sy-burgundy border-sy-burgundy/20 bg-sy-burgundy/5"
                                    : ""
                            }
                        ">
                            أولوية ${escapeHTML(item.priority || "—")}
                        </span>

                    </div>


                    <h3>
                        ${escapeHTML(item.title)}
                    </h3>


                    <p>
                        <strong class="text-sy-deep">
                            الأثر:
                        </strong>

                        ${escapeHTML(item.impact)}
                    </p>


                    <p>
                        <strong class="text-sy-deep">
                            المعالجة:
                        </strong>

                        ${escapeHTML(item.action)}
                    </p>

                </article>

            `).join("");
    }


    /* =========================================================
       Needs
       ========================================================= */

    function renderNeeds() {

        const container =
            $("#needsGrid");

        if (!container) {
            return;
        }


        if (
            !APP_DATA.needs ||
            APP_DATA.needs.length === 0
        ) {

            container.innerHTML = `
                <div class="
                    empty-state
                    lg:col-span-4
                ">
                    لا توجد احتياجات مضافة حاليًا.
                </div>
            `;

            return;
        }


        container.innerHTML =
            APP_DATA.needs.map(item => `

                <article class="info-card">

                    <div class="number">
                        ${escapeHTML(item.icon || "01")}
                    </div>

                    <h3>
                        ${escapeHTML(item.title)}
                    </h3>

                    <p>
                        ${escapeHTML(item.description)}
                    </p>

                </article>

            `).join("");
    }


    /* =========================================================
       Recommendations
       ========================================================= */

   
function renderRecommendations() {

    const container = $("#recommendationsGrid");

    if (!container) {
        return;
    }

    const recommendations = Array.isArray(APP_DATA.recommendations)
        ? APP_DATA.recommendations
        : [];

    if (recommendations.length === 0) {
        container.innerHTML = `
            <div class="empty-state lg:col-span-2">
                لا توجد توصيات مضافة حاليًا.
            </div>
        `;
        return;
    }

    container.innerHTML = recommendations.map((item, index) => `

        <article class="recommendation-card">

            <div class="recommendation-number">
                ${String(index + 1).padStart(2, "0")}
            </div>

            <div class="min-w-0">

                <h3 class="font-bold leading-7">
                    ${escapeHTML(
                        typeof item === "string"
                            ? item
                            : item.title || "توصية تنفيذية"
                    )}
                </h3>

                ${
                    typeof item === "object" && item !== null && item.description
                        ? `
                            <p class="mt-2 text-sm leading-7 text-white/70">
                                ${escapeHTML(item.description)}
                            </p>
                        `
                        : ""
                }

                <div class="mt-3 text-xs text-white/40">
                    توصية تنفيذية
                </div>

            </div>

        </article>

    `).join("");
}


    /* =========================================================
       Roadmap
       ========================================================= */

    function renderRoadmap() {

        const container =
            $("#roadmapGrid");

        if (!container) {
            return;
        }


        if (
            !APP_DATA.roadmap ||
            APP_DATA.roadmap.length === 0
        ) {

            container.innerHTML = `
                <div class="empty-state">
                    لا توجد مراحل مضافة حاليًا.
                </div>
            `;

            return;
        }


        container.innerHTML = `

            <div class="roadmap-line"></div>

            ${APP_DATA.roadmap.map(item => `

                <div class="roadmap-item">

                    <div class="roadmap-dot">
                        ${escapeHTML(item.phase)}
                    </div>

                    <div class="roadmap-content">

                        <h3>
                            ${escapeHTML(item.title)}
                        </h3>

                        <p>
                            ${escapeHTML(item.description)}
                        </p>

                    </div>

                </div>

            `).join("")}

        `;
    }


    /* =========================================================
       Comprehensive Presentation
       ========================================================= */

    let currentSlide = 0;


    function buildPresentationSlides() {

        const projects =
            Array.isArray(APP_DATA.projects)
                ? APP_DATA.projects
                : [];

        const review =
            getReviewGroups();

        const maintenance =
            getMaintenanceGroups();

        const challenges =
            Array.isArray(APP_DATA.challenges)
                ? APP_DATA.challenges
                : [];

        const needs =
            Array.isArray(APP_DATA.needs)
                ? APP_DATA.needs
                : [];

        const recommendations =
            Array.isArray(APP_DATA.recommendations)
                ? APP_DATA.recommendations
                : [];

        const roadmap =
            Array.isArray(APP_DATA.roadmap)
                ? APP_DATA.roadmap
                : [];


        const slides = [];


        /* ---------------------------------------------------------
           Slide 01 — Cover
           --------------------------------------------------------- */

        slides.push({
            type: "cover",

            kicker:
                APP_DATA.meta?.branch ||
                "فرع الإنشاءات",

            title:
                APP_DATA.meta?.title ||
                "أعمال ومشاريع فرع الإنشاءات",

            subtitle:
                "عرض تقديمي شامل لأعمال ومشاريع الفرع والحالة التنفيذية والاحتياجات والتوصيات.",

            footer:
                `آخر تحديث: ${
                    APP_DATA.meta?.lastUpdated ||
                    APP_DATA.meta?.updated ||
                    "—"
                }`
        });


        /* ---------------------------------------------------------
           Slide 02 — Executive Summary
           --------------------------------------------------------- */

        slides.push({
            type: "summary",

            kicker: "01 — الملخص التنفيذي",

            title: "الملخص التنفيذي",

            subtitle:
                "صورة شاملة عن واقع المشاريع والأعمال المسجلة ضمن العرض الحالي.",

            stats: [
                {
                    value: projects.length,
                    label: "إجمالي المشاريع"
                },
                {
                    value: countByStatus("completed"),
                    label: "مشاريع منجزة"
                },
                {
                    value: countByStatus("ongoing"),
                    label: "قيد الإنجاز"
                },
                {
                    value: countByStatus("study"),
                    label: "قيد الدراسة"
                },
                {
                    value: getTotalReviewCount(),
                    label: "قيد التدقيق"
                },
                {
                    value: getTotalMaintenanceCount(),
                    label: "أعمال الصيانة"
                }
            ]
        });


        /* ---------------------------------------------------------
           Slide 03 — Completed
           --------------------------------------------------------- */

        slides.push({
            type: "projects",

            kicker: "02 — المشاريع المنجزة",

            title: "المشاريع المنجزة",

            subtitle:
                `بلغ عدد المشاريع المنجزة ${projects.filter(
                    p => p.status === "completed"
                ).length} مشروعًا.`,

            items:
                projects.filter(
                    p => p.status === "completed"
                ),

            empty:
                "لا توجد مشاريع منجزة مضافة حاليًا."
        });


        /* ---------------------------------------------------------
           Slide 04 — Ongoing
           --------------------------------------------------------- */

        slides.push({
            type: "projects",

            kicker: "03 — المشاريع قيد الإنجاز",

            title: "المشاريع قيد الإنجاز",

            subtitle:
                `عدد المشاريع قيد الإنجاز حاليًا: ${countByStatus("ongoing")}.`,

            items:
                projects.filter(
                    p => p.status === "ongoing"
                ),

            empty:
                "لا توجد مشاريع قيد الإنجاز مضافة حاليًا."
        });


        /* ---------------------------------------------------------
           Slide 05 — Studies
           --------------------------------------------------------- */

        slides.push({
            type: "projects",

            kicker: "04 — المشاريع قيد إعداد الدراسة",

            title: "المشاريع قيد إعداد الدراسة",

            subtitle:
                `عدد المشاريع قيد إعداد الدراسة: ${countByStatus("study")}.`,

            items:
                projects.filter(
                    p => p.status === "study"
                ),

            empty:
                "لا توجد مشاريع قيد إعداد الدراسة مضافة حاليًا."
        });


        /* ---------------------------------------------------------
           Slide 06 — Review
           --------------------------------------------------------- */

        slides.push({
            type: "review",

            kicker: "05 — قيد التدقيق",

            title: "المشاريع قيد التدقيق",

            subtitle:
                `إجمالي الحالات قيد التدقيق: ${getTotalReviewCount()}.`,

            internal: review.internal,

            central: review.central
        });


        /* ---------------------------------------------------------
           Slide 07 — Paused
           --------------------------------------------------------- */

        slides.push({
            type: "projects",

            kicker: "06 — المشاريع المتوقفة",

            title: "المشاريع المتوقفة",

            subtitle:
                `عدد المشاريع المتوقفة: ${countByStatus("paused")}.`,

            items:
                projects.filter(
                    p => p.status === "paused"
                ),

            empty:
                "لا توجد مشاريع متوقفة مضافة حاليًا."
        });


        /* ---------------------------------------------------------
           Slide 08 — Maintenance
           --------------------------------------------------------- */

        slides.push({
            type: "maintenance",

            kicker: "07 — أعمال الصيانة",

            title: "أعمال الصيانة",

            subtitle:
                `إجمالي أعمال الصيانة المدرجة: ${getTotalMaintenanceCount()}.`,

            under1000:
                maintenance.under1000,

            under10000:
                maintenance.under10000
        });


        /* ---------------------------------------------------------
           Slide 09 — Challenges
           --------------------------------------------------------- */

        slides.push({
            type: "list",

            kicker: "08 — التحديات",

            title: "أبرز التحديات",

            subtitle:
                challenges.length
                    ? `تم تسجيل ${challenges.length} تحديًا أو معوقًا ضمن البيانات الحالية.`
                    : "لم تتم إضافة التحديات بعد.",

            items: challenges.map(item => ({
                title: item.title,
                description:
                    `الأثر: ${item.impact || "—"}`
                    +
                    ` — المعالجة: ${item.action || "—"}`
            })),

            empty:
                "لا توجد تحديات مضافة حاليًا."
        });


        /* ---------------------------------------------------------
           Slide 10 — Needs
           --------------------------------------------------------- */

        slides.push({
            type: "list",

            kicker: "09 — الاحتياجات",

            title: "الاحتياجات",

            subtitle:
                needs.length
                    ? `الاحتياجات المطلوبة لدعم أعمال الفرع: ${needs.length}.`
                    : "لم تتم إضافة الاحتياجات بعد.",

            items: needs.map(item => ({
                title: item.title,
                description: item.description
            })),

            empty:
                "لا توجد احتياجات مضافة حاليًا."
        });


        /* ---------------------------------------------------------
           Slide 11 — Recommendations
           --------------------------------------------------------- */

        slides.push({
            type: "recommendations",

            kicker: "10 — التوصيات",

            title: "التوصيات التنفيذية",

            subtitle:
                recommendations.length
                    ? `عدد التوصيات المقترحة: ${recommendations.length}.`
                    : "لم تتم إضافة التوصيات بعد.",

            items: recommendations,

            empty:
                "لا توجد توصيات مضافة حاليًا."
        });


        /* ---------------------------------------------------------
           Slide 12 — Roadmap
           --------------------------------------------------------- */

        slides.push({
            type: "roadmap",

            kicker: "11 — خطة العمل القادمة",

            title: "خطة العمل القادمة",

            subtitle:
                roadmap.length
                    ? "المراحل المقترحة لاستكمال المتابعة والتنفيذ."
                    : "لم تتم إضافة خطة العمل بعد.",

            items: roadmap,

            empty:
                "لا توجد مراحل مضافة حاليًا."
        });


        /* ---------------------------------------------------------
           Slide 13 — Closing
           --------------------------------------------------------- */

        slides.push({
            type: "closing",

            kicker: "12 — الخلاصة",

            title:
                "نحو تنفيذ أكثر كفاءة ومتابعة أكثر دقة",

            subtitle:
                "استكمال الأعمال وفق الأولويات، وتسريع معالجة المعوقات، ورفع كفاءة المتابعة والتنسيق بما يضمن حسن تنفيذ المشاريع والأعمال.",

            footer:
                APP_DATA.meta?.branch ||
                "فرع الإنشاءات"
        });


        return slides;
    }


    function getSlides() {

        return buildPresentationSlides();
    }


    /* =========================================================
       Presentation Slide Renderer
       ========================================================= */

    function renderPresentationSlide() {

        const container =
            $("#presentationContent");

        const number =
            $("#slideNumber");

        const progress =
            $("#presentationProgress");


        if (!container) {
            return;
        }


        const slides =
            getSlides();

        const slide =
            slides[currentSlide];


        if (!slide) {
            return;
        }


        let html = "";


        /* ---------------------------------------------------------
           Cover
           --------------------------------------------------------- */

        if (slide.type === "cover") {

            html = `

                <div class="presentation-slide">

                    <div class="presentation-kicker">
                        ${escapeHTML(slide.kicker)}
                    </div>

                    <div class="presentation-title">
                        ${escapeHTML(slide.title)}
                    </div>

                    <div class="presentation-subtitle">
                        ${escapeHTML(slide.subtitle)}
                    </div>

                    <div class="
                        mt-8
                        text-sm
                        text-white/40
                    ">
                        ${escapeHTML(slide.footer)}
                    </div>

                </div>
            `;
        }


        /* ---------------------------------------------------------
           Summary
           --------------------------------------------------------- */

        else if (slide.type === "summary") {

            html = `

                <div class="presentation-slide">

                    <div class="presentation-kicker">
                        ${escapeHTML(slide.kicker)}
                    </div>

                    <div class="presentation-title">
                        ${escapeHTML(slide.title)}
                    </div>

                    <div class="presentation-subtitle">
                        ${escapeHTML(slide.subtitle)}
                    </div>


                    <div class="
                        mt-10
                        grid
                        grid-cols-2
                        gap-4
                        md:grid-cols-3
                    ">

                        ${slide.stats.map(stat => `

                            <div class="
                                rounded-2xl
                                border
                                border-white/10
                                bg-white/5
                                p-5
                                text-center
                            ">

                                <div class="
                                    text-3xl
                                    font-extrabold
                                    text-sy-gold
                                ">
                                    ${escapeHTML(stat.value)}
                                </div>

                                <div class="
                                    mt-2
                                    text-xs
                                    text-white/50
                                ">
                                    ${escapeHTML(stat.label)}
                                </div>

                            </div>

                        `).join("")}

                    </div>

                </div>
            `;
        }


        /* ---------------------------------------------------------
           Projects
           --------------------------------------------------------- */

        else if (slide.type === "projects") {

            html = `

                <div class="presentation-slide">

                    <div class="presentation-kicker">
                        ${escapeHTML(slide.kicker)}
                    </div>

                    <div class="presentation-title">
                        ${escapeHTML(slide.title)}
                    </div>

                    <div class="presentation-subtitle">
                        ${escapeHTML(slide.subtitle)}
                    </div>


                    ${
                        slide.items.length
                            ? `
                                <div class="
                                    mt-8
                                    grid
                                    gap-4
                                    md:grid-cols-2
                                ">

                                    ${slide.items.map((item, index) => `

                                        <div class="
                                            rounded-2xl
                                            border
                                            border-white/10
                                            bg-white/5
                                            p-5
                                        ">

                                            <div class="
                                                flex
                                                items-start
                                                gap-4
                                            ">

                                                <div class="
                                                    flex
                                                    h-10
                                                    w-10
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    bg-sy-gold/10
                                                    font-bold
                                                    text-sy-gold
                                                ">
                                                    ${String(index + 1).padStart(2, "0")}
                                                </div>


                                                <div class="min-w-0">

                                                    <div class="
                                                        font-bold
                                                        leading-7
                                                        text-white
                                                    ">
                                                        ${escapeHTML(
                                                            getItemName(item)
                                                        )}
                                                    </div>

                                                    <div class="
                                                        mt-1
                                                        text-xs
                                                        text-white/40
                                                    ">
                                                        ${escapeHTML(
                                                            item.location || "—"
                                                        )}
                                                    </div>

                                                </div>

                                            </div>


                                            ${
                                                item.description
                                                    ? `
                                                        <div class="
                                                            mt-4
                                                            text-sm
                                                            leading-7
                                                            text-white/60
                                                        ">
                                                            ${escapeHTML(
                                                                item.description
                                                            )}
                                                        </div>
                                                    `
                                                    : ""
                                            }


                                            <div class="
                                                mt-4
                                                flex
                                                items-center
                                                justify-between
                                                gap-4
                                            ">

                                                <span class="
                                                    text-xs
                                                    text-white/40
                                                ">
                                                    ${escapeHTML(
                                                        item.statusLabel ||
                                                        STATUS[item.status]?.label ||
                                                        "—"
                                                    )}
                                                </span>

                                                <span class="
                                                    font-bold
                                                    text-sy-gold
                                                ">
                                                    ${Number(item.progress) || 0}%
                                                </span>

                                            </div>

                                        </div>

                                    `).join("")}

                                </div>
                            `
                            : `
                                <div class="
                                    mt-10
                                    rounded-2xl
                                    border
                                    border-white/10
                                    bg-white/5
                                    p-8
                                    text-center
                                    text-white/40
                                ">
                                    ${escapeHTML(slide.empty)}
                                </div>
                            `
                    }

                </div>
            `;
        }


        /* ---------------------------------------------------------
           Review
           --------------------------------------------------------- */

        else if (slide.type === "review") {

            const total =
                slide.internal.length +
                slide.central.length;

            html = `

                <div class="presentation-slide">

                    <div class="presentation-kicker">
                        ${escapeHTML(slide.kicker)}
                    </div>

                    <div class="presentation-title">
                        ${escapeHTML(slide.title)}
                    </div>

                    <div class="presentation-subtitle">
                        ${escapeHTML(slide.subtitle)}
                    </div>


                    ${
                        total
                            ? `
                                <div class="
                                    mt-8
                                    grid
                                    gap-5
                                    lg:grid-cols-2
                                ">

                                    <div class="
                                        rounded-2xl
                                        border
                                        border-white/10
                                        bg-white/5
                                        p-5
                                    ">

                                        <div class="
                                            mb-4
                                            flex
                                            items-center
                                            justify-between
                                        ">

                                            <div class="
                                                font-extrabold
                                                text-sy-gold
                                            ">
                                                تدقيق داخلي
                                            </div>

                                            <div class="
                                                text-xs
                                                text-white/40
                                            ">
                                                ${slide.internal.length}
                                            </div>

                                        </div>


                                        ${
                                            slide.internal.length
                                                ? `
                                                    <div class="space-y-3">

                                                        ${slide.internal.map((item, index) => `

                                                            <div class="
                                                                rounded-xl
                                                                border
                                                                border-white/10
                                                                bg-black/10
                                                                p-4
                                                            ">

                                                                <div class="
                                                                    flex
                                                                    gap-3
                                                                ">

                                                                    <span class="
                                                                        text-sm
                                                                        font-bold
                                                                        text-sy-gold
                                                                    ">
                                                                        ${String(index + 1).padStart(2, "0")}
                                                                    </span>

                                                                    <div>

                                                                        <div class="
                                                                            font-bold
                                                                            leading-6
                                                                            text-white
                                                                        ">
                                                                            ${escapeHTML(
                                                                                getItemName(item)
                                                                            )}
                                                                        </div>

                                                                        <div class="
                                                                            mt-1
                                                                            text-xs
                                                                            text-white/40
                                                                        ">
                                                                            ${escapeHTML(
                                                                                item.location || "—"
                                                                            )}
                                                                        </div>

                                                                    </div>

                                                                </div>

                                                            </div>

                                                        `).join("")}

                                                    </div>
                                                `
                                                : `
                                                    <div class="
                                                        text-sm
                                                        text-white/30
                                                    ">
                                                        لا توجد حالات.
                                                    </div>
                                                `
                                        }

                                    </div>


                                    <div class="
                                        rounded-2xl
                                        border
                                        border-white/10
                                        bg-white/5
                                        p-5
                                    ">

                                        <div class="
                                            mb-4
                                            flex
                                            items-center
                                            justify-between
                                        ">

                                            <div class="
                                                font-extrabold
                                                text-sy-gold
                                            ">
                                                تدقيق في الإدارة المركزية
                                            </div>

                                            <div class="
                                                text-xs
                                                text-white/40
                                            ">
                                                ${slide.central.length}
                                            </div>

                                        </div>


                                        ${
                                            slide.central.length
                                                ? `
                                                    <div class="space-y-3">

                                                        ${slide.central.map((item, index) => `

                                                            <div class="
                                                                rounded-xl
                                                                border
                                                                border-white/10
                                                                bg-black/10
                                                                p-4
                                                            ">

                                                                <div class="
                                                                    flex
                                                                    gap-3
                                                                ">

                                                                    <span class="
                                                                        text-sm
                                                                        font-bold
                                                                        text-sy-gold
                                                                    ">
                                                                        ${String(index + 1).padStart(2, "0")}
                                                                    </span>

                                                                    <div>

                                                                        <div class="
                                                                            font-bold
                                                                            leading-6
                                                                            text-white
                                                                        ">
                                                                            ${escapeHTML(
                                                                                getItemName(item)
                                                                            )}
                                                                        </div>

                                                                        <div class="
                                                                            mt-1
                                                                            text-xs
                                                                            text-white/40
                                                                        ">
                                                                            ${escapeHTML(
                                                                                item.location || "—"
                                                                            )}
                                                                        </div>

                                                                    </div>

                                                                </div>

                                                            </div>

                                                        `).join("")}

                                                    </div>
                                                `
                                                : `
                                                    <div class="
                                                        text-sm
                                                        text-white/30
                                                    ">
                                                        لا توجد حالات.
                                                    </div>
                                                `
                                        }

                                    </div>

                                </div>
                            `
                            : `
                                <div class="
                                    mt-10
                                    rounded-2xl
                                    border
                                    border-white/10
                                    bg-white/5
                                    p-8
                                    text-center
                                    text-white/40
                                ">
                                    لا توجد مشاريع قيد التدقيق مضافة حاليًا.
                                </div>
                            `
                    }

                </div>
            `;
        }


        /* ---------------------------------------------------------
           Maintenance
           --------------------------------------------------------- */

        else if (slide.type === "maintenance") {

            html = `

                <div class="presentation-slide">

                    <div class="presentation-kicker">
                        ${escapeHTML(slide.kicker)}
                    </div>

                    <div class="presentation-title">
                        ${escapeHTML(slide.title)}
                    </div>

                    <div class="presentation-subtitle">
                        ${escapeHTML(slide.subtitle)}
                    </div>


                    <div class="
                        mt-8
                        grid
                        gap-5
                        lg:grid-cols-2
                    ">


                        <div class="
                            rounded-2xl
                            border
                            border-white/10
                            bg-white/5
                            p-5
                        ">

                            <div class="
                                mb-4
                                flex
                                items-center
                                justify-between
                            ">

                                <div class="
                                    font-extrabold
                                    text-sy-gold
                                ">
                                    صيانة دون 1,000$
                                </div>

                                <div class="
                                    text-xs
                                    text-white/40
                                ">
                                    ${slide.under1000.length}
                                </div>

                            </div>


                            ${
                                slide.under1000.length
                                    ? `
                                        <div class="space-y-3">

                                            ${slide.under1000.map((item, index) => `

                                                <div class="
                                                    rounded-xl
                                                    border
                                                    border-white/10
                                                    bg-black/10
                                                    p-4
                                                ">

                                                    <div class="
                                                        flex
                                                        gap-3
                                                    ">

                                                        <span class="
                                                            text-sm
                                                            font-bold
                                                            text-sy-gold
                                                        ">
                                                            ${String(index + 1).padStart(2, "0")}
                                                        </span>

                                                        <div class="min-w-0">

                                                            <div class="
                                                                font-bold
                                                                leading-6
                                                                text-white
                                                            ">
                                                                ${escapeHTML(
                                                                    getItemName(item)
                                                                )}
                                                            </div>

                                                            ${
                                                                item.location
                                                                    ? `
                                                                        <div class="
                                                                            mt-1
                                                                            text-xs
                                                                            text-white/40
                                                                        ">
                                                                            ${escapeHTML(item.location)}
                                                                        </div>
                                                                    `
                                                                    : ""
                                                            }

                                                        </div>

                                                    </div>

                                                </div>

                                            `).join("")}

                                        </div>
                                    `
                                    : `
                                        <div class="
                                            text-sm
                                            text-white/30
                                        ">
                                            لا توجد أعمال ضمن هذه الفئة.
                                        </div>
                                    `
                            }

                        </div>


                        <div class="
                            rounded-2xl
                            border
                            border-white/10
                            bg-white/5
                            p-5
                        ">

                            <div class="
                                mb-4
                                flex
                                items-center
                                justify-between
                            ">

                                <div class="
                                    font-extrabold
                                    text-sy-gold
                                ">
                                    صيانة دون 10,000$
                                </div>

                                <div class="
                                    text-xs
                                    text-white/40
                                ">
                                    ${slide.under10000.length}
                                </div>

                            </div>


                            ${
                                slide.under10000.length
                                    ? `
                                        <div class="space-y-3">

                                            ${slide.under10000.map((item, index) => `

                                                <div class="
                                                    rounded-xl
                                                    border
                                                    border-white/10
                                                    bg-black/10
                                                    p-4
                                                ">

                                                    <div class="
                                                        flex
                                                        gap-3
                                                    ">

                                                        <span class="
                                                            text-sm
                                                            font-bold
                                                            text-sy-gold
                                                        ">
                                                            ${String(index + 1).padStart(2, "0")}
                                                        </span>

                                                        <div class="min-w-0">

                                                            <div class="
                                                                font-bold
                                                                leading-6
                                                                text-white
                                                            ">
                                                                ${escapeHTML(
                                                                    getItemName(item)
                                                                )}
                                                            </div>

                                                            ${
                                                                item.location
                                                                    ? `
                                                                        <div class="
                                                                            mt-1
                                                                            text-xs
                                                                            text-white/40
                                                                        ">
                                                                            ${escapeHTML(item.location)}
                                                                        </div>
                                                                    `
                                                                    : ""
                                                            }

                                                        </div>

                                                    </div>

                                                </div>

                                            `).join("")}

                                        </div>
                                    `
                                    : `
                                        <div class="
                                            text-sm
                                            text-white/30
                                        ">
                                            لا توجد أعمال ضمن هذه الفئة.
                                        </div>
                                    `
                            }

                        </div>

                    </div>

                </div>
            `;
        }


        /* ---------------------------------------------------------
           Generic List
           --------------------------------------------------------- */

        else if (slide.type === "list") {

            html = `

                <div class="presentation-slide">

                    <div class="presentation-kicker">
                        ${escapeHTML(slide.kicker)}
                    </div>

                    <div class="presentation-title">
                        ${escapeHTML(slide.title)}
                    </div>

                    <div class="presentation-subtitle">
                        ${escapeHTML(slide.subtitle)}
                    </div>


                    ${
                        slide.items.length
                            ? `
                                <div class="
                                    mt-8
                                    space-y-3
                                ">

                                    ${slide.items.map((item, index) => `

                                        <div class="
                                            flex
                                            gap-4
                                            rounded-2xl
                                            border
                                            border-white/10
                                            bg-white/5
                                            p-5
                                        ">

                                            <div class="
                                                flex
                                                h-10
                                                w-10
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-xl
                                                bg-sy-gold/10
                                                font-bold
                                                text-sy-gold
                                            ">
                                                ${String(index + 1).padStart(2, "0")}
                                            </div>


                                            <div>

                                                <div class="
                                                    font-bold
                                                    leading-7
                                                    text-white
                                                ">
                                                    ${escapeHTML(item.title)}
                                                </div>

                                                <div class="
                                                    mt-1
                                                    text-sm
                                                    leading-7
                                                    text-white/50
                                                ">
                                                    ${escapeHTML(
                                                        item.description || ""
                                                    )}
                                                </div>

                                            </div>

                                        </div>

                                    `).join("")}

                                </div>
                            `
                            : `
                                <div class="
                                    mt-10
                                    rounded-2xl
                                    border
                                    border-white/10
                                    bg-white/5
                                    p-8
                                    text-center
                                    text-white/40
                                ">
                                    ${escapeHTML(slide.empty)}
                                </div>
                            `
                    }

                </div>
            `;
        }


        /* ---------------------------------------------------------
           Recommendations
           --------------------------------------------------------- */

        else if (slide.type === "recommendations") {

            html = `

                <div class="presentation-slide">

                    <div class="presentation-kicker">
                        ${escapeHTML(slide.kicker)}
                    </div>

                    <div class="presentation-title">
                        ${escapeHTML(slide.title)}
                    </div>

                    <div class="presentation-subtitle">
                        ${escapeHTML(slide.subtitle)}
                    </div>


                    ${
                        slide.items.length
                            ? `
                                <div class="
                                    mt-8
                                    grid
                                    gap-4
                                    md:grid-cols-2
                                ">

                                    ${slide.items.map((item, index) => `

                                        <div class="
                                            rounded-2xl
                                            border
                                            border-sy-gold/20
                                            bg-sy-gold/5
                                            p-5
                                        ">

                                            <div class="
                                                flex
                                                gap-4
                                            ">

                                                <div class="
                                                    text-xl
                                                    font-extrabold
                                                    text-sy-gold
                                                ">
                                                    ${String(index + 1).padStart(2, "0")}
                                                </div>

                                                <div class="
                                                    font-bold
                                                    leading-7
                                                    text-white
                                                ">
                                                    ${escapeHTML(item)}
                                                </div>

                                            </div>

                                        </div>

                                    `).join("")}

                                </div>
                            `
                            : `
                                <div class="
                                    mt-10
                                    rounded-2xl
                                    border
                                    border-white/10
                                    bg-white/5
                                    p-8
                                    text-center
                                    text-white/40
                                ">
                                    ${escapeHTML(slide.empty)}
                                </div>
                            `
                    }

                </div>
            `;
        }


        /* ---------------------------------------------------------
           Roadmap
           --------------------------------------------------------- */

        else if (slide.type === "roadmap") {

            html = `

                <div class="presentation-slide">

                    <div class="presentation-kicker">
                        ${escapeHTML(slide.kicker)}
                    </div>

                    <div class="presentation-title">
                        ${escapeHTML(slide.title)}
                    </div>

                    <div class="presentation-subtitle">
                        ${escapeHTML(slide.subtitle)}
                    </div>


                    ${
                        slide.items.length
                            ? `
                                <div class="
                                    mt-8
                                    space-y-4
                                ">

                                    ${slide.items.map((item, index) => `

                                        <div class="
                                            flex
                                            gap-4
                                            rounded-2xl
                                            border
                                            border-white/10
                                            bg-white/5
                                            p-5
                                        ">

                                            <div class="
                                                flex
                                                h-11
                                                w-11
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-full
                                                border
                                                border-sy-gold/30
                                                bg-sy-gold/10
                                                text-sm
                                                font-bold
                                                text-sy-gold
                                            ">
                                                ${escapeHTML(
                                                    item.phase ||
                                                    String(index + 1)
                                                )}
                                            </div>


                                            <div>

                                                <div class="
                                                    font-bold
                                                    text-white
                                                ">
                                                    ${escapeHTML(item.title)}
                                                </div>

                                                <div class="
                                                    mt-1
                                                    text-sm
                                                    leading-7
                                                    text-white/50
                                                ">
                                                    ${escapeHTML(item.description)}
                                                </div>

                                            </div>

                                        </div>

                                    `).join("")}

                                </div>
                            `
                            : `
                                <div class="
                                    mt-10
                                    rounded-2xl
                                    border
                                    border-white/10
                                    bg-white/5
                                    p-8
                                    text-center
                                    text-white/40
                                ">
                                    ${escapeHTML(slide.empty)}
                                </div>
                            `
                    }

                </div>
            `;
        }


        /* ---------------------------------------------------------
           Closing
           --------------------------------------------------------- */

        else if (slide.type === "closing") {

            html = `

                <div class="
                    presentation-slide
                    text-center
                ">

                    <div class="presentation-kicker">
                        ${escapeHTML(slide.kicker)}
                    </div>

                    <div class="presentation-title">
                        ${escapeHTML(slide.title)}
                    </div>

                    <div class="presentation-subtitle">
                        ${escapeHTML(slide.subtitle)}
                    </div>

                    <div class="
                        mt-10
                        text-sm
                        font-bold
                        text-sy-gold
                    ">
                        ${escapeHTML(slide.footer)}
                    </div>

                </div>
            `;
        }


        container.innerHTML = html;


        if (number) {

            number.textContent =
                `${currentSlide + 1} / ${slides.length}`;
        }


        if (progress) {

            progress.style.width =
                `${((currentSlide + 1) / slides.length) * 100}%`;
        }
    }


    function openPresentation() {

        const presentation =
            $("#presentationMode");

        if (!presentation) {
            return;
        }


        currentSlide = 0;

        renderPresentationSlide();

        presentation.classList.remove("hidden");

        document.body.classList.add(
            "overflow-hidden"
        );
    }


    function closePresentation() {

        const presentation =
            $("#presentationMode");

        if (!presentation) {
            return;
        }


        presentation.classList.add("hidden");

        document.body.classList.remove(
            "overflow-hidden"
        );
    }


    function nextSlide() {

        const slides =
            getSlides();

        currentSlide =
            Math.min(
                currentSlide + 1,
                slides.length - 1
            );

        renderPresentationSlide();
    }


    function previousSlide() {

        currentSlide =
            Math.max(
                currentSlide - 1,
                0
            );

        renderPresentationSlide();
    }


    /* =========================================================
       Mobile Sidebar
       ========================================================= */
function initMobileMenu() {
        const menuBtn = $("#menuBtn");
        const sidebar = $(".sidebar");
        const overlay = $("#sidebarOverlay");

        if (!menuBtn || !sidebar) {
            return;
        }

        function closeMobileMenu() {
            // إزالة كلاس الفتح فقط، وسيتكفل ملف CSS بإخفائها نحو اليمين
            sidebar.classList.remove("open");
            
            if (overlay) {
                overlay.classList.add("hidden");
            }
            document.body.style.overflow = "";
        }

        function openMobileMenu() {
            // إضافة كلاس الفتح
            sidebar.classList.add("open");

            if (overlay) {
                overlay.classList.remove("hidden");
            }
            document.body.style.overflow = "hidden";
        }

        menuBtn.addEventListener("click", () => {
            if (sidebar.classList.contains("open")) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        if (overlay) {
            overlay.addEventListener("click", closeMobileMenu);
        }

        $$(".nav-link").forEach(link => {
            link.addEventListener("click", closeMobileMenu);
        });
    }

    /* =========================================================
       Active Navigation
       ========================================================= */

    function initActiveNavigation() {

        const links =
            $$(".nav-link");

        const sections =
            $$("main section[id]");


        if (!links.length || !sections.length) {
            return;
        }


        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (!entry.isIntersecting) {
                            return;
                        }


                        links.forEach(link => {

                            link.classList.remove(
                                "active"
                            );

                        });


                        const active =
                            links.find(
                                link =>
                                    link.getAttribute("href") ===
                                    `#${entry.target.id}`
                            );


                        if (active) {

                            active.classList.add(
                                "active"
                            );

                        }

                    });

                },
                {
                    threshold: 0.25,
                    rootMargin: "-90px 0px -50% 0px"
                }
            );


        sections.forEach(
            section => observer.observe(section)
        );
    }


    /* =========================================================
       Presentation Events
       ========================================================= */

    function initPresentation() {

        const presentationBtn =
            $("#presentationBtn");

        const closeBtn =
            $("#closePresentation");

        const nextBtn =
            $("#nextSlide");

        const prevBtn =
            $("#prevSlide");


        if (presentationBtn) {

            presentationBtn.addEventListener(
                "click",
                openPresentation
            );

        }


        if (closeBtn) {

            closeBtn.addEventListener(
                "click",
                closePresentation
            );

        }


        if (nextBtn) {

            nextBtn.addEventListener(
                "click",
                nextSlide
            );

        }


        if (prevBtn) {

            prevBtn.addEventListener(
                "click",
                previousSlide
            );

        }
    }


    /* =========================================================
       Fullscreen
       ========================================================= */

    function initFullscreen() {

        const button =
            $("#fullscreenBtn");


        if (!button) {
            return;
        }


        button.addEventListener(
            "click",
            async () => {

                try {

                    if (!document.fullscreenElement) {

                        await document.documentElement
                            .requestFullscreen();

                    } else {

                        await document.exitFullscreen();

                    }

                } catch (error) {

                    console.warn(
                        "Fullscreen is not available:",
                        error
                    );

                }

            }
        );
    }


    /* =========================================================
       Print
       ========================================================= */

    function initPrint() {

        const button =
            $("#printBtn");


        if (!button) {
            return;
        }


        button.addEventListener(
            "click",
            () => {

                window.print();

            }
        );
    }


    /* =========================================================
       Modal Events
       ========================================================= */

    function initModal() {

        const modal =
            $("#projectModal");


        if (!modal) {
            return;
        }


        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    closeProjectModal();

                }

            }
        );


        const closeButtons =
            $$(
                "[data-close-modal]",
                modal
            );


        closeButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    closeProjectModal
                );

            }
        );
    }


    /* =========================================================
       Keyboard Controls
       ========================================================= */

    function initKeyboard() {

        document.addEventListener(
            "keydown",
            event => {

                const presentation =
                    $("#presentationMode");

                const modal =
                    $("#projectModal");


                /* ESC */

                if (event.key === "Escape") {

                    if (
                        presentation &&
                        !presentation.classList.contains(
                            "hidden"
                        )
                    ) {

                        closePresentation();

                    }


                    if (
                        modal &&
                        !modal.classList.contains(
                            "hidden"
                        )
                    ) {

                        closeProjectModal();

                    }

                }


                /* Presentation controls */

                if (
                    presentation &&
                    !presentation.classList.contains(
                        "hidden"
                    )
                ) {

                    if (
                        event.key === "ArrowLeft" ||
                        event.key === "ArrowDown"
                    ) {

                        nextSlide();

                    }


                    if (
                        event.key === "ArrowRight" ||
                        event.key === "ArrowUp"
                    ) {

                        previousSlide();

                    }

                }

            }
        );
    }


    /* =========================================================
       Reveal Animation
       ========================================================= */

    function initRevealAnimation() {

        const elements =
            $$(".reveal");


        if (!elements.length) {
            return;
        }


        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (entry.isIntersecting) {

                            entry.target.classList.add(
                                "reveal"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    });

                },
                {
                    threshold: 0.10
                }
            );


        elements.forEach(
            element => observer.observe(element)
        );
    }


    /* =========================================================
       Initialize Application
       ========================================================= */

    function init() {

        /* Data */

        renderMeta();

        renderStats();

        renderProjectGroups();

        renderStoppedProjects();

        renderReview();

        renderMaintenance();

        renderChallenges();

        renderNeeds();

        renderRecommendations();

        renderRoadmap();


        /* UI */

        initMobileMenu();

        initActiveNavigation();

        initPresentation();

        initFullscreen();

        initPrint();

        initModal();

        initKeyboard();

        initRevealAnimation();


        console.log(
            "Construction Branch Dashboard loaded successfully."
        );

        console.log(
            `Projects loaded: ${
                Array.isArray(APP_DATA.projects)
                    ? APP_DATA.projects.length
                    : 0
            }`
        );

        console.log(
            `Review items loaded: ${
                getTotalReviewCount()
            }`
        );

        console.log(
            `Maintenance items loaded: ${
                getTotalMaintenanceCount()
            }`
        );
    }


    /* =========================================================
       Start
       ========================================================= */

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();

    }

})();