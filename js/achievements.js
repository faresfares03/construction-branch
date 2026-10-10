
const branchAchievements = [
    {
        id: 1,
        title: "إعداد الهيكلية التنظيمية لفرع الإنشاءات",
        category: "التطوير الإداري والتنظيمي",
        department: "إدارة الفرع",

        description:
            "إعداد الهيكلية التنظيمية للفرع وتحديد الأقسام والوحدات والارتباطات التنظيمية.",

        outcome:
            "النتيجة النهائية للهيكلية التنظيمية بعد استكمال إعدادها واعتمادها.",

        status: "completed",
        date: "",
        notes: ""
    },
    
{
    id: 2,
    title: "مناقشة وتوحيد أسس تدقيق الدراسات مع الإدارة المركزية",
    category: "التطوير الإداري والتنظيمي",
    department: "إدارة الفرع",

    description:
        "التنسيق مع الإدارة المركزية لمناقشة أسس ومعايير تدقيق الدراسات الهندسية، بهدف توحيد آلية التدقيق وتعزيز وضوح الملاحظات والإجراءات المعتمدة.",

    outcome:
        "لا تزال مناقشة أسس التدقيق وآلية توحيدها مع الإدارة المركزية قيد المتابعة، ولم يتم اعتماد الصيغة النهائية حتى تاريخه.",

    status: "inProgress",
    date: "",
    notes: "قيد المناقشة مع الإدارة المركزية."
},

    {
        id: 3,
        title: "تطوير آلية عمل قسم الدراسات",
        category: "التطوير الإداري والفني",
        department: "إدارة الفرع",

        description:
            "العمل على تطوير آلية إعداد الدراسات الهندسية ومراجعتها ومتابعتها، بما يسهم في تحسين جودة المخرجات الفنية وتنظيم إجراءات العمل والتنسيق مع الجهات المعنية.",

        outcome:
            "آلية عمل مطوّرة لقسم الدراسات تتضمن تنظيم إجراءات إعداد الدراسات ومراجعتها ومتابعتها، وفق ما تم إنجازه واعتماده فعليًا.",

        status: "completed",
        date: "",
        notes: ""
    },
    {
        id: 4,
        title: "تطوير آلية عمل قسم الإشراف والتنفيذ",
        category: "التطوير الإداري والفني",
        

        description:
            "العمل على تحسين تنظيم أعمال الإشراف الميداني ومتابعة تنفيذ المشاريع، وتعزيز توثيق نسب الإنجاز ورصد المعوقات ومعالجتها بالتنسيق مع الجهات ذات الصلة.",

        outcome:
            "آلية أكثر تنظيمًا لمتابعة المشاريع وتوثيق تقدم الأعمال والمعوقات التنفيذية، وفق الإجراءات التي جرى تطبيقها فعليًا.",

        status: "completed",
        date: "",
        notes: ""
    },
    {
        id: 5,
        title: "معالجة ملف مشروع مدرسة الشرطة المتوقف",
        category: "معالجة المشاريع المتعثرة",
        department: "قسم الإشراف والتنفيذ",

        description:
            "متابعة ملف مشروع مدرسة الشرطة المتوقف، ودراسة أسباب توقفه، وتنظيم الإجراءات اللازمة لمعالجة وضعه بالتنسيق مع الجهات المعنية، بما يدعم اتخاذ القرار المناسب بشأن استكمال المشروع.",

        outcome:
            "تشكيل اللجان المختصة وإعداد التقارير اللازمة ورفعها إلى الإدارة المركزية لدراسة وضع المشروع واتخاذ الإجراءات المناسبة.",

        status: "inProgress",
        date: "",
        notes: "المشروع متوقف منذ 25/10/2025، ولا يوجد عقد نافذ؛ ولا تُعد المعالجة نهائية إلا بعد اتخاذ الإجراء المعتمد."
    },


{
    id: 6,
    title: "استحداث آلية للتدقيق الداخلي للدراسات الهندسية",
    category: "التطوير الإداري والفني",
    department: "إدارة الفرع",

    description:
        "استحداث آلية للتدقيق الداخلي للدراسات الهندسية ضمن الفرع، بهدف مراجعة الدراسات والتحقق من استيفائها للمتطلبات الفنية قبل إحالتها إلى الإدارة المركزية، بما يسهم في رفع جودة الدراسات وتقليل الملاحظات وإعادة الإحالة.",

    outcome:
        "إيجاد مرحلة تدقيق داخلي للدراسات الهندسية قبل إحالتها إلى الإدارة المركزية، بما يعزز ضبط الجودة الفنية وتحسين جاهزية الدراسات للإحالة.",

    status: "completed",
    date: "",
    notes: ""
}


];

(function renderBranchAchievements() {
    const grid = document.getElementById("achievementsGrid");

    if (!grid) return;

    const statusInfo = {
        completed: {
            label: "مكتمل",
            className: "bg-emerald-50 text-emerald-800"
        },

        "in-progress": {
            label: "قيد الاستكمال",
            className: "bg-amber-50 text-amber-800"
        },

        "under-review": {
            label: "قيد المناقشة أو الاعتماد",
            className: "bg-sky-50 text-sky-800"
        }
    };

    // حماية النصوص عند عرضها داخل HTML
    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    // حساب الإحصائيات
    const totalCount = branchAchievements.length;

    const completedCount = branchAchievements.filter(
        item => item.status === "completed"
    ).length;

    const pendingCount = totalCount - completedCount;

    // تحديث مؤشرات الإنجازات
    const countElement = document.getElementById("achievementCount");
    const totalElement = document.getElementById("achievementTotal");
    const completedElement = document.getElementById("achievementCompleted");
    const pendingElement = document.getElementById("achievementPending");

    if (countElement) {
        countElement.textContent = `${totalCount} إنجاز`;
    }

    if (totalElement) {
        totalElement.textContent = totalCount;
    }

    if (completedElement) {
        completedElement.textContent = completedCount;
    }

    if (pendingElement) {
        pendingElement.textContent = pendingCount;
    }

    // حالة عدم وجود إنجازات
    if (totalCount === 0) {
        grid.innerHTML = `
            <div class="panel-card text-center text-slate-500
                        md:col-span-2 xl:col-span-3">

                <div class="mb-3 text-3xl">★</div>

                <h3 class="font-bold text-sy-deep">
                    لا توجد إنجازات مسجلة بعد
                </h3>

                <p class="mt-2 text-sm leading-7">
                    أضف الإنجازات إلى مصفوفة
                    <code>branchAchievements</code>
                    في ملف <code>js/achievements.js</code>.
                </p>

            </div>
        `;

        return;
    }

    // إنشاء بطاقات الإنجازات
    grid.innerHTML = branchAchievements.map(function (item) {
        const status = statusInfo[item.status] || statusInfo["in-progress"];

        return `
            <article class="panel-card relative overflow-hidden">

                <div class="absolute right-0 top-0 h-full w-1 bg-sy-gold"></div>

                <div class="flex items-start justify-between gap-3">

                    <div class="min-w-0">

                        <div class="text-xs font-bold text-sy-sage">
                            ${escapeHTML(item.category || "إنجاز نوعي")}
                        </div>

                        <h3 class="mt-2 text-lg font-extrabold
                                   leading-8 text-sy-deep">
                            ${escapeHTML(item.title)}
                        </h3>

                    </div>

                    <span class="shrink-0 rounded-full px-3 py-1
                                 text-xs font-bold ${status.className}">
                        ${status.label}
                    </span>

                </div>

                ${
                    item.department
                        ? `
                            <div class="mt-4 text-sm text-slate-500">
                                <strong>القسم / المكتب:</strong>
                                ${escapeHTML(item.department)}
                            </div>
                        `
                        : ""
                }

                ${
                    item.description
                        ? `
                            <p class="mt-3 text-sm leading-7 text-slate-600">
                                ${escapeHTML(item.description)}
                            </p>
                        `
                        : ""
                }

                ${
                    item.outcome
                        ? `
                            <div class="mt-4 rounded-xl bg-sy-ivory p-4">

                                <div class="text-xs font-bold text-sy-earth">
                                    النتيجة / المخرج
                                </div>

                                <p class="mt-2 text-sm leading-7 text-sy-deep">
                                    ${escapeHTML(item.outcome)}
                                </p>

                            </div>
                        `
                        : ""
                }

                ${
                    item.date
                        ? `
                            <div class="mt-4 text-xs text-slate-500">
                                التاريخ: ${escapeHTML(item.date)}
                            </div>
                        `
                        : ""
                }

                ${
                    item.notes
                        ? `
                            <p class="mt-3 border-t border-slate-100
                                      pt-3 text-xs leading-6 text-slate-500">
                                ${escapeHTML(item.notes)}
                            </p>
                        `
                        : ""
                }

            </article>
        `;
    }).join("");
})();