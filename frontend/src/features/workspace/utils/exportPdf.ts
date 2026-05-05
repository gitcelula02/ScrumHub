import { jsPDF } from "jspdf";
import type { Task } from "@/types";

const STATUS_LABEL: Record<string, string> = {
  todo: "Por hacer",
  "in-progress": "En progreso",
  review: "En revisión",
  done: "Hecho",
};

export function exportSprintReport(tasks: Task[], sprint = "Sprint 24") {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  let y = M;

  // Header bar
  doc.setFillColor(0, 122, 204);
  doc.rect(0, 0, W, 6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(30, 30, 30);
  doc.text("ScrumHub — Reporte de Sprint", M, (y += 18));

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(110, 110, 110);
  y += 18;
  doc.text(
    `${sprint} · Generado ${new Date().toLocaleString("es-ES")}`,
    M,
    y
  );

  // Stats
  y += 28;
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const wip = tasks.filter((t) => t.status === "in-progress").length;
  const review = tasks.filter((t) => t.status === "review").length;
  const todo = tasks.filter((t) => t.status === "todo").length;
  const points = tasks.reduce((s, t) => s + t.points, 0);

  const stats = [
    { label: "Total", value: total },
    { label: "Hechos", value: done },
    { label: "En curso", value: wip },
    { label: "En revisión", value: review },
    { label: "Por hacer", value: todo },
    { label: "Story pts", value: points },
  ];
  const cardW = (W - M * 2 - 5 * 8) / 6;
  stats.forEach((s, i) => {
    const x = M + i * (cardW + 8);
    doc.setDrawColor(220);
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(x, y, cardW, 52, 3, 3, "FD");
    doc.setFontSize(9);
    doc.setTextColor(110);
    doc.text(s.label.toUpperCase(), x + 8, y + 16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(30);
    doc.text(String(s.value), x + 8, y + 40);
    doc.setFont("helvetica", "normal");
  });
  y += 52 + 24;

  // Progress
  doc.setFontSize(11);
  doc.setTextColor(30);
  doc.setFont("helvetica", "bold");
  doc.text("Progreso", M, y);
  y += 8;
  const barW = W - M * 2;
  doc.setFillColor(235, 235, 235);
  doc.rect(M, y, barW, 8, "F");
  const pct = total ? done / total : 0;
  doc.setFillColor(76, 175, 80);
  doc.rect(M, y, barW * pct, 8, "F");
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(`${Math.round(pct * 100)}% completado`, M, y);
  y += 24;

  // Table header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30);
  doc.text("Tareas", M, y);
  y += 10;

  const cols = [
    { label: "ID", w: 60 },
    { label: "Título", w: 200 },
    { label: "Estado", w: 70 },
    { label: "Prioridad", w: 60 },
    { label: "Asignado", w: 90 },
    { label: "Pts", w: 25 },
  ];

  const drawHeader = () => {
    doc.setFillColor(240, 240, 240);
    doc.rect(M, y, W - M * 2, 22, "F");
    doc.setFontSize(8);
    doc.setTextColor(80);
    doc.setFont("helvetica", "bold");
    let x = M + 6;
    cols.forEach((c) => {
      doc.text(c.label.toUpperCase(), x, y + 14);
      x += c.w;
    });
    y += 22;
  };
  drawHeader();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(40);

  for (const t of tasks) {
    if (y > H - 60) {
      doc.addPage();
      y = M;
      drawHeader();
    }
    doc.setDrawColor(235);
    doc.line(M, y, W - M, y);
    let x = M + 6;
    const row = [
      t.id,
      t.title.length > 50 ? t.title.slice(0, 50) + "…" : t.title,
      STATUS_LABEL[t.status] ?? t.status,
      t.priority,
      t.assignee,
      String(t.points),
    ];
    row.forEach((val, i) => {
      doc.text(val, x, y + 14);
      x += cols[i].w;
    });
    y += 20;
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `ScrumHub · ${sprint} · Página ${p} / ${pageCount}`,
      W / 2,
      H - 20,
      { align: "center" }
    );
  }

  doc.save(`scrumhub-${sprint.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}
