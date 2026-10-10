
(() => {
    "use strict";

    // يدعم APP_DATA المعرّف باستخدام const في ملف data.js.
    const DATA = typeof APP_DATA !== "undefined"
        ? APP_DATA
        : window.APP_DATA;

    const $ = (id) => document.getElementById(id);

    let currentIndex = 0;
    let slides = [];

    /* =====================================================
       أدوات مساعدة
       ===================================================== */

    function safeArray(value) {
        if (Array.isArray(value)) return value;

        if (value && typeof value === "object") {
            return Object.values(value);
        }

        return [];
    }

    function getText(value, fallback = "") {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return fallback;
        }

        return String(value);
    }

    function escapeHTML(value) {
        return getText(value).replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function setText(id, value) {
        const element = $(id);

        if (element) {
            element.textContent = getText(value);
        }
    }

    function showEmpty(message) {
        return `
            <div class="empty-state">
                ${escapeHTML(message)}
            </div>
        `;
    }

    function getProjects() {
        return safeArray(DATA?.projects);
    }

    // قائمة مستقلة للمشاريع المتوقفة.
    function getStoppedProjects() {
        return safeArray(DATA?.stoppedProjects);
    }

    function getItemTitle(item) {
        if (typeof item === "string") return item;

        return getText(
            item?.name ||
            item?.title ||
            item?.project ||
            item?.description ||
            item?.task ||
            item?.requirement ||
            item?.recommendation ||
            item?.text,
            "عنصر دون عنوان"
        );
    }

    function getItemDescription(item) {
        if (typeof item === "string") return "";

        return getText(
            item?.details ||
            item?.reason ||
            item?.note ||
            item?.need ||
            item?.challenge ||
            item?.action ||
            item?.description ||
            ""
        );
    }

    function getProjectDescription(project) {
        return getText(
            project?.description ||
            project?.summary ||
            project?.details ||
            ""
        );
    }

    function getStatus(project) {
        return getText(
            project?.status || project?.statusLabel
        ).trim().toLowerCase();
    }

    function isStatus(project, type) {
        const status = getStatus(project);
        const label = getText(project?.statusLabel).trim();

        const aliases = {
            completed: [
                "completed", "complete", "done",
                "منجز", "منتهٍ", "منتهي", "مكتمل"
            ],
            ongoing: [
                "ongoing", "in-progress", "in_progress",
                "active", "قيد التنفيذ", "جاري التنفيذ",
                "جارٍ التنفيذ"
            ],
            study: [
                "study", "under-study", "under_study",
                "قيد الدراسة", "قيد إعداد الدراسة",
                "إعداد الدراسة"
            ],
            paused: [
                "paused", "stopped", "suspended",
                "متوقف", "متوقفة", "قيد التوقف"
            ]
        };

        return (aliases[type] || []).some((alias) =>
            status === alias.toLowerCase() || label === alias
        );
    }

    function getMaintenance() {
        const maintenance = DATA?.maintenance || {};

        return {
            small: safeArray(maintenance.under1000),
            large: safeArray(maintenance.under10000)
        };
    }

    function getReview() {
        const review = DATA?.review || {};

        return {
            internal: safeArray(review.internal),
            central: safeArray(review.central)
        };
    }

    function formatNumber(value) {
        return new Intl.NumberFormat("en-US", {
            maximumFractionDigits: 2
        }).format(value);
    }

    /* =====================================================
       بيانات الغلاف والعناوين
       ===================================================== */

    function populateMetadata() {
        const meta = DATA?.meta || {};

        const branch = getText(
            meta.branch,
            "فرع الإنشاءات"
        );

        const command = getText(
            meta.command,
            "قيادة الأمن الداخلي بمحافظة حلب"
        );

        const institution = getText(
            meta.institution,
            "الجمهورية العربية السورية"
        );

        const period = getText(
            meta.period,
            new Date().getFullYear()
        );

        const updated = getText(
            meta.lastUpdated,
            "غير محدد"
        );

        setText("topBranchName", branch);
        setText("presentationPeriod", period);
        setText("coverCommand", command);
        setText("coverPeriod", `العام ${period}`);
        setText("coverUpdated", `آخر تحديث: ${updated}`);
        setText("closingPeriod", period);

        // تثبيت عنوان الغلاف بصيغة مناسبة للعرض الرسمي.
        const coverTitle = $("coverTitle");

        if (coverTitle) {
            coverTitle.innerHTML =
                "عرض أعمال ومشاريع<br>فرع الإنشاءات";
        }

        const coverEyebrows = document.querySelectorAll(
            ".slide-cover .eyebrow"
        );

        if (coverEyebrows[0]) {
            coverEyebrows[0].textContent = institution;
        }

        document.title =
            `${branch} | عرض الأعمال والمشاريع`;
    }

    /* =====================================================
       المؤشرات العامة
       ===================================================== */

    function renderKpis() {
        const projects = getProjects();
        const stoppedProjects = getStoppedProjects();

        const completed = projects.filter(
            (project) => isStatus(project, "completed")
        ).length;

        const ongoing = projects.filter(
            (project) => isStatus(project, "ongoing")
        ).length;

        const study = projects.filter(
            (project) => isStatus(project, "study")
        ).length;

        // تُحسب المشاريع المتوقفة من قائمتها المستقلة.
        const paused = stoppedProjects.length;

        const review = getReview();
        const maintenance = getMaintenance();

        const totalReview =
            review.internal.length + review.central.length;

        const totalMaintenance =
            maintenance.small.length + maintenance.large.length;

        const cards = [
            {
                label: "إجمالي المشاريع المسجلة",
                value: projects.length,
                note: "المشاريع المسجلة ضمن قائمة المشاريع الأساسية",
                color: ""
            },
            {
                label: "المشاريع المنجزة",
                value: completed,
                note: "مشاريع مكتملة وفق البيانات",
                color: ""
            },
            {
                label: "قيد التنفيذ والدراسة",
                value: ongoing + study,
                note: `${ongoing} تنفيذ · ${study} دراسة`,
                color: "gold"
            },
            {
                label: "الدراسات قيد التدقيق",
                value: totalReview,
                note: `${review.internal.length} داخلية · ${review.central.length} مركزية`,
                color: "red"
            }
        ];

        const kpiCards = $("kpiCards");

        if (kpiCards) {
            kpiCards.innerHTML = cards.map((card) => `
                <div class="kpi-card ${card.color}">
                    <span class="kpi-label">
                        ${escapeHTML(card.label)}
                    </span>
                    <strong class="kpi-value">
                        ${card.value}
                    </strong>
                    <span class="kpi-note">
                        ${escapeHTML(card.note)}
                    </span>
                </div>
            `).join("");
        }

        const maintenanceCards = [
            {
                label: "إجمالي بنود الصيانة",
                value: totalMaintenance,
                note: "وفق القوائم المسجلة",
                color: ""
            },
            {
                label: "بنود قائمة الصيانة الأولى",
                value: maintenance.small.length,
                note: "عدد البنود في under1000",
                color: "gold"
            },
            {
                label: "بنود قائمة الصيانة الثانية",
                value: maintenance.large.length,
                note: "عدد البنود في under10000",
                color: ""
            },
            {
                label: "المشاريع المتوقفة",
                value: paused,
                note: "وفق قائمة المشاريع المتوقفة",
                color: "red"
            }
        ];

        const maintenanceKpis = $("maintenanceKpis");

        if (maintenanceKpis) {
            maintenanceKpis.innerHTML =
                maintenanceCards.map((card) => `
                    <div class="kpi-card ${card.color}">
                        <span class="kpi-label">
                            ${escapeHTML(card.label)}
                        </span>
                        <strong class="kpi-value">
                            ${card.value}
                        </strong>
                        <span class="kpi-note">
                            ${escapeHTML(card.note)}
                        </span>
                    </div>
                `).join("");
        }

        setText(
            "completedSummary",
            `عدد المشاريع المنجزة: ${completed}`
        );

        setText("ongoingCount", ongoing);
        setText("studyCount", study);
        setText("internalReviewCount", review.internal.length);
        setText("centralReviewCount", review.central.length);
        setText("maintenanceSmallCount", maintenance.small.length);
        setText("maintenanceLargeCount", maintenance.large.length);

        renderStatusChart({
            completed,
            ongoing,
            study,
            paused
        });
    }

    function renderStatusChart(counts) {
        const entries = [
            {
                label: "منجزة",
                value: counts.completed,
                color: "dark"
            },
            {
                label: "قيد التنفيذ",
                value: counts.ongoing,
                color: ""
            },
            {
                label: "قيد الدراسة",
                value: counts.study,
                color: "gold"
            },
            {
                label: "متوقفة",
                value: counts.paused,
                color: "red"
            }
        ];

        const max = Math.max(
            1,
            ...entries.map((entry) => entry.value)
        );

        const statusChart = $("statusChart");

        if (!statusChart) return;

        statusChart.innerHTML = entries.map((entry) => `
            <div class="bar-row">
                <span class="bar-label">
                    ${escapeHTML(entry.label)}
                </span>
                <div class="bar-track">
                    <div
                        class="bar-fill ${entry.color}"
                        style="width:${(entry.value / max) * 100}%"
                    ></div>
                </div>
                <strong class="bar-value">
                    ${entry.value}
                </strong>
            </div>
        `).join("");
    }

    function renderHighlights() {
        const highlights = safeArray(
            DATA?.executiveHighlights
        );

        const element = $("executiveHighlights");

        if (!element) return;

        element.innerHTML = highlights.length
            ? highlights.map((item) => `
                <div class="highlight-item">
                    <span class="highlight-dot"></span>
                    <span>${escapeHTML(getItemTitle(item))}</span>
                </div>
            `).join("")
            : showEmpty(
                "لا توجد مؤشرات تنفيذية مسجلة في البيانات الحالية."
            );
    }

    /* =====================================================
       بطاقات المشاريع
       ===================================================== */

    function renderProjectCard(
        project,
        index,
        mode = "normal"
    ) {
        const name = getItemTitle(project);
        const location = getText(
            project?.location || project?.place
        );

        const description = getProjectDescription(project);

        const rawProgress = project?.progress;
        const progressValue = Number(rawProgress);

        const hasProgress =
            rawProgress !== null &&
            rawProgress !== undefined &&
            rawProgress !== "" &&
            Number.isFinite(progressValue);

        const progress = hasProgress
            ? Math.min(100, Math.max(0, progressValue))
            : null;

        const status = getText(
            project?.statusLabel ||
            project?.status ||
            (mode === "completed" ? "منجز" : "")
        );

        let statusClass = "";

        if (isStatus(project, "paused") || mode === "stopped") {
            statusClass = "paused";
        } else if (isStatus(project, "study")) {
            statusClass = "study";
        }

        return `
            <article class="project-card">
                <h3>${escapeHTML(name)}</h3>

                <div class="project-meta">
                    ${status ? `
                        <span class="status-pill ${statusClass}">
                            ${escapeHTML(status)}
                        </span>
                    ` : ""}

                    ${location ? `
                        <span class="location-pill">
                            ${escapeHTML(location)}
                        </span>
                    ` : ""}
                </div>

                ${description ? `
                    <p class="project-description">
                        ${escapeHTML(description)}
                    </p>
                ` : ""}

                ${progress !== null ? `
                    <div class="project-progress">
                        <div class="progress-label">
                            <span>نسبة الإنجاز المسجلة</span>
                            <strong>${progress}%</strong>
                        </div>
                        <div class="bar-track">
                            <div
                                class="bar-fill"
                                style="width:${progress}%"
                            ></div>
                        </div>
                    </div>
                ` : ""}
            </article>
        `;
    }

    function renderProjectGroup(
        elementId,
        projects,
        emptyMessage,
        mode = "normal"
    ) {
        const element = $(elementId);

        if (!element) return;

        element.innerHTML = projects.length
            ? projects.map((project, index) =>
                renderProjectCard(project, index, mode)
            ).join("")
            : showEmpty(emptyMessage);
    }

    /* =====================================================
       تفاصيل المشاريع المتوقفة
       ===================================================== */

    function renderStoppedProjectCard(project, index) {
        const name = getItemTitle(project);

        const stopDate = getText(
            project?.stopDate ||
            project?.stoppageDate ||
            project?.date,
            "غير محدد"
        );

        const reason = getText(
            project?.reason ||
            project?.description ||
            project?.details,
            "لم يُسجل سبب التوقف."
        );

        const actionsTaken = getText(
            project?.actionsTaken ||
            project?.actions ||
            project?.action,
            "لم تُسجل إجراءات متابعة."
        );

        const followUpEntity = getText(
            project?.followUpEntity ||
            project?.responsibleEntity ||
            project?.followUp,
            "غير محدد"
        );

        const notes = getText(project?.notes);

        const location = getText(
            project?.location || project?.place
        );

        return `
            <article class="project-card stopped-project-card">
                <h3>
                    ${escapeHTML(name)}
                </h3>

                <div class="project-meta">
                    <span class="status-pill paused">
                        متوقف
                    </span>

                    <span class="location-pill">
                        تاريخ التوقف:
                        ${escapeHTML(stopDate)}
                    </span>

                    ${location ? `
                        <span class="location-pill">
                            ${escapeHTML(location)}
                        </span>
                    ` : ""}
                </div>

                <div class="stopped-project-details">
                    <p class="project-description">
                        <strong>سبب التوقف:</strong>
                        ${escapeHTML(reason)}
                    </p>

                    <p class="project-description">
                        <strong>الإجراءات المتخذة / المتابعة:</strong>
                        ${escapeHTML(actionsTaken)}
                    </p>

                    <p class="project-description">
                        <strong>الجهة المتابعة:</strong>
                        ${escapeHTML(followUpEntity)}
                    </p>

                    ${notes ? `
                        <p class="project-description">
                            <strong>ملاحظات:</strong>
                            ${escapeHTML(notes)}
                        </p>
                    ` : ""}
                </div>
            </article>
        `;
    }

    function renderStoppedProjects() {
        const projects = getStoppedProjects();
        const element = $("pausedProjects");

        if (!element) return;

        element.innerHTML = projects.length
            ? projects.map((project, index) =>
                renderStoppedProjectCard(project, index)
            ).join("")
            : showEmpty(
                "لا توجد مشاريع متوقفة أو متعثرة مسجلة."
            );
    }

    /* =====================================================
       القوائم التفصيلية
       ===================================================== */

    function renderCompactList(
        elementId,
        items,
        emptyMessage
    ) {
        const element = $(elementId);

        if (!element) return;

        element.innerHTML = items.length
            ? items.map((item, index) => {
                const title = getItemTitle(item);
                const description = getItemDescription(item);

                const isObject =
                    item !== null &&
                    typeof item === "object";

                const location = isObject
                    ? getText(item.location)
                    : "";

                const priority = isObject
                    ? getText(item.priority)
                    : "";

                const cost = isObject
                    ? Number(item.estimatedCost)
                    : NaN;

                const hasCost =
                    isObject &&
                    item.estimatedCost !== null &&
                    item.estimatedCost !== undefined &&
                    item.estimatedCost !== "" &&
                    Number.isFinite(cost);

                const costText = hasCost
                    ? `${formatNumber(cost)} $`
                    : "";

                return `
                    <div class="compact-item">
                        <span class="item-marker">
                            ${index + 1}
                        </span>

                        <div>
                            <strong>
                                ${escapeHTML(title)}
                            </strong>

                            ${location ? `
                                <small>
                                    الموقع: ${escapeHTML(location)}
                                </small>
                            ` : ""}

                            ${description ? `
                                <small>
                                    ${escapeHTML(description)}
                                </small>
                            ` : ""}

                            ${costText ? `
                                <small>
                                    التكلفة المقدّرة المسجلة:
                                    ${escapeHTML(costText)}
                                </small>
                            ` : ""}

                            ${priority ? `
                                <small>
                                    الأولوية: ${escapeHTML(priority)}
                                </small>
                            ` : ""}
                        </div>
                    </div>
                `;
            }).join("")
            : showEmpty(emptyMessage);
    }

    /* =====================================================
       الدراسات قيد التدقيق
       ===================================================== */

    function renderReview() {
        const review = getReview();

        const internalCount = review.internal.length;
        const centralCount = review.central.length;
        const total = internalCount + centralCount;

        renderCompactList(
            "internalReviewList",
            review.internal,
            "لا توجد دراسات مدرجة ضمن التدقيق الداخلي."
        );

        renderCompactList(
            "centralReviewList",
            review.central,
            "لا توجد دراسات مدرجة لدى الإدارة المركزية."
        );

        const donut = $("reviewDonut");

        if (!donut) return;

        if (!total) {
            donut.innerHTML = showEmpty(
                "لا توجد بيانات عن الدراسات قيد التدقيق."
            );

            return;
        }

        const internalAngle = (internalCount / total) * 360;

        donut.innerHTML = `
            <div
                class="donut-chart"
                style="background:conic-gradient(
                    var(--sage) 0deg ${internalAngle}deg,
                    var(--gold) ${internalAngle}deg 360deg
                )"
            >
                <div class="donut-hole">
                    <strong>${total}</strong>
                    <span>دراسة قيد التدقيق</span>
                </div>
            </div>

            <div class="donut-legend">
                <div class="legend-item">
                    <span class="legend-name">
                        <span class="legend-swatch green"></span>
                        التدقيق الداخلي
                    </span>
                    <strong>
                        ${internalCount}
                        (${Math.round(internalCount / total * 100)}%)
                    </strong>
                </div>

                <div class="legend-item">
                    <span class="legend-name">
                        <span class="legend-swatch gold"></span>
                        الإدارة المركزية
                    </span>
                    <strong>
                        ${centralCount}
                        (${Math.round(centralCount / total * 100)}%)
                    </strong>
                </div>
            </div>
        `;
    }

    /* =====================================================
       التحديات والاحتياجات
       ===================================================== */

    function renderFeatureList(
        elementId,
        items,
        emptyMessage,
        icon
    ) {
        const element = $(elementId);

        if (!element) return;

        element.innerHTML = items.length
            ? items.map((item, index) => {
                const title = getItemTitle(item);
                const description = getItemDescription(item);

                const featureIcon = typeof icon === "function"
                    ? icon(item, index)
                    : (icon || index + 1);

                return `
                    <article class="feature-card">
                        <span class="feature-icon">
                            ${escapeHTML(featureIcon)}
                        </span>

                        <div>
                            <h3>${escapeHTML(title)}</h3>

                            ${description ? `
                                <p>${escapeHTML(description)}</p>
                            ` : ""}
                        </div>
                    </article>
                `;
            }).join("")
            : showEmpty(emptyMessage);
    }

    /* =====================================================
       التوصيات
       ===================================================== */

    function renderRecommendations() {
        const items = safeArray(DATA?.recommendations);
        const element = $("recommendationsList");

        if (!element) return;

        element.innerHTML = items.length
            ? items.map((item, index) => {
                const description = getItemDescription(item);

                return `
                    <article class="recommendation-card">
                        <span class="recommendation-number">
                            ${String(index + 1).padStart(2, "0")}
                        </span>

                        <h3>
                            ${escapeHTML(getItemTitle(item))}
                        </h3>

                        ${description ? `
                            <p>${escapeHTML(description)}</p>
                        ` : ""}
                    </article>
                `;
            }).join("")
            : showEmpty(
                "لم تُدرج توصيات في البيانات الحالية."
            );
    }

    /* =====================================================
       خطة العمل
       ===================================================== */

    function renderRoadmap() {
        const items = safeArray(DATA?.roadmap);
        const element = $("roadmapList");

        if (!element) return;

        element.innerHTML = items.length
            ? items.map((item, index) => {
                const description = getItemDescription(item);

                return `
                    <div class="roadmap-item">
                        <div class="roadmap-marker">
                            <span>${index + 1}</span>
                        </div>

                        <div class="roadmap-content">
                            <h3>
                                ${escapeHTML(getItemTitle(item))}
                            </h3>

                            ${description ? `
                                <p>${escapeHTML(description)}</p>
                            ` : ""}
                        </div>
                    </div>
                `;
            }).join("")
            : showEmpty(
                "لم تُدرج خطة عمل مستقبلية في البيانات الحالية."
            );
    }

    /* =====================================================
       التنقل بين الشرائح
       ===================================================== */

    function showSlide(index) {
        if (!slides.length) return;

        currentIndex = Math.max(
            0,
            Math.min(index, slides.length - 1)
        );

        slides.forEach((slide, i) => {
            const active = i === currentIndex;

            slide.classList.toggle("active", active);
            slide.setAttribute("aria-hidden", String(!active));
        });

        setText("currentSlide", currentIndex + 1);
        setText("totalSlides", slides.length);

        const progressFill = $("progressFill");

        if (progressFill) {
            progressFill.style.width =
                `${((currentIndex + 1) / slides.length) * 100}%`;
        }

        const prevBtn = $("prevBtn");
        const nextBtn = $("nextBtn");

        if (prevBtn) {
            prevBtn.disabled = currentIndex === 0;
        }

        if (nextBtn) {
            nextBtn.disabled =
                currentIndex === slides.length - 1;
        }

        const title =
            slides[currentIndex]?.dataset.title ||
            "عرض الأعمال";

        const branch = getText(
            DATA?.meta?.branch,
            "فرع الإنشاءات"
        );

        document.title = `${title} | ${branch}`;
    }

    function showToast(message) {
        const toast = $("toast");

        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        window.clearTimeout(showToast.timer);

        showToast.timer = window.setTimeout(() => {
            toast.classList.remove("show");
        }, 2200);
    }

    async function toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            showToast(
                "تعذر تفعيل ملء الشاشة. جرّب تشغيل العرض في متصفح حديث."
            );
        }
    }

    function bindNavigation() {
        const prevBtn = $("prevBtn");
        const nextBtn = $("nextBtn");
        const fullscreenBtn = $("fullscreenBtn");
        const printBtn = $("printBtn");

        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                showSlide(currentIndex - 1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                showSlide(currentIndex + 1);
            });
        }

        if (fullscreenBtn) {
            fullscreenBtn.addEventListener(
                "click",
                toggleFullscreen
            );
        }

        if (printBtn) {
            printBtn.addEventListener("click", () => {
                window.print();
            });
        }

        document.addEventListener("keydown", (event) => {
            const tagName = document.activeElement?.tagName;

            if (
                event.altKey ||
                event.ctrlKey ||
                event.metaKey ||
                ["INPUT", "TEXTAREA", "SELECT"].includes(tagName)
            ) {
                return;
            }

            if (
                ["ArrowLeft", "ArrowDown", "PageDown", " "]
                    .includes(event.key)
            ) {
                event.preventDefault();
                showSlide(currentIndex + 1);
            } else if (
                ["ArrowRight", "ArrowUp", "PageUp"]
                    .includes(event.key)
            ) {
                event.preventDefault();
                showSlide(currentIndex - 1);
            } else if (event.key === "Home") {
                showSlide(0);
            } else if (event.key === "End") {
                showSlide(slides.length - 1);
            } else if (event.key.toLowerCase() === "f") {
                toggleFullscreen();
            } else if (
                event.key === "Escape" &&
                document.fullscreenElement
            ) {
                document.exitFullscreen();
            }
        });

        const presentation = $("presentation");

        if (!presentation) return;

        let touchStartX = 0;
        let touchStartY = 0;

        presentation.addEventListener(
            "touchstart",
            (event) => {
                const touch = event.changedTouches[0];

                touchStartX = touch.screenX;
                touchStartY = touch.screenY;
            },
            { passive: true }
        );

        presentation.addEventListener(
            "touchend",
            (event) => {
                const touch = event.changedTouches[0];

                const deltaX = touch.screenX - touchStartX;
                const deltaY = touch.screenY - touchStartY;

                if (
                    Math.abs(deltaX) < 70 ||
                    Math.abs(deltaX) < Math.abs(deltaY)
                ) {
                    return;
                }

                // في واجهة RTL: السحب لليسار ينتقل إلى التالي.
                showSlide(
                    deltaX < 0
                        ? currentIndex + 1
                        : currentIndex - 1
                );
            },
            { passive: true }
        );
    }

    /* =====================================================
       تشغيل العرض
       ===================================================== */

    function renderAll() {
        if (!DATA || typeof DATA !== "object") {
            const presentation = $("presentation");

            if (presentation) {
                presentation.innerHTML = `
                    <section class="slide active">
                        <div class="empty-state">
                            تعذر تحميل بيانات العرض.
                            تأكد من وجود js/data.js وتحميله قبل
                            js/presentation.js، ومن تعريف APP_DATA داخله.
                        </div>
                    </section>
                `;
            }

            return;
        }

        populateMetadata();

        const projects = getProjects();

        renderKpis();
        renderHighlights();

        renderProjectGroup(
            "completedProjects",
            projects.filter((project) =>
                isStatus(project, "completed")
            ),
            "لا توجد مشاريع مصنفة كمنجزة.",
            "completed"
        );

        renderProjectGroup(
            "ongoingProjects",
            projects.filter((project) =>
                isStatus(project, "ongoing")
            ),
            "لا توجد مشاريع مصنفة قيد التنفيذ."
        );

        renderProjectGroup(
            "studyProjects",
            projects.filter((project) =>
                isStatus(project, "study")
            ),
            "لا توجد مشاريع مصنفة قيد إعداد الدراسة."
        );

        renderReview();

        // عرض المشاريع المتوقفة من APP_DATA.stoppedProjects.
        renderStoppedProjects();

        const maintenance = getMaintenance();

        renderCompactList(
            "maintenanceSmall",
            maintenance.small,
            "لا توجد بنود في قائمة الصيانة الأولى."
        );

        renderCompactList(
            "maintenanceLarge",
            maintenance.large,
            "لا توجد بنود في قائمة الصيانة الثانية."
        );

        renderFeatureList(
            "challengesList",
            safeArray(DATA.challenges),
            "لم تُدرج تحديات في البيانات الحالية.",
            "!"
        );

        renderFeatureList(
            "needsList",
            safeArray(DATA.needs),
            "لم تُدرج احتياجات في البيانات الحالية.",
            "＋"
        );

        renderRecommendations();
        renderRoadmap();

        slides = Array.from(
            document.querySelectorAll("#presentation .slide")
        );

        bindNavigation();
        showSlide(0);
    }

    renderAll();
})();
