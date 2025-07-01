// Simple Calendar Widget for Dashboard (reference implementation)
// This is a minimal, self-contained calendar with event dots and add event button

const calendarEvents = [
  { date: '2025-06-18', color: '#10b981', label: '2' }, // Example event
  { date: '2025-06-20', color: '#6366f1', label: '' },
  { date: '2025-06-21', color: '#f59e0b', label: '' },
];

function renderCalendar(containerId) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay();

  let html = `<div class="calendar-card" style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);padding:1.5rem 1rem 1rem 1rem;margin:2rem 0;max-width:480px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
      <span style="font-weight:600;font-size:1.1rem;">Calendar View</span>
      <button id="addEventBtn" style="background:#6366f1;color:#fff;padding:0.5rem 1rem;border:none;border-radius:6px;font-weight:600;cursor:pointer;font-size:1rem;">+ Add Event</button>
    </div>
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;">
        <thead><tr style="background:#f8fbfa;">
          <th style="padding:6px 0;font-size:0.95rem;font-weight:600;color:#222;">SUN</th>
          <th style="padding:6px 0;font-size:0.95rem;font-weight:600;color:#222;">MON</th>
          <th style="padding:6px 0;font-size:0.95rem;font-weight:600;color:#222;">TUE</th>
          <th style="padding:6px 0;font-size:0.95rem;font-weight:600;color:#222;">WED</th>
          <th style="padding:6px 0;font-size:0.95rem;font-weight:600;color:#222;">THU</th>
          <th style="padding:6px 0;font-size:0.95rem;font-weight:600;color:#222;">FRI</th>
          <th style="padding:6px 0;font-size:0.95rem;font-weight:600;color:#222;">SAT</th>
        </tr></thead><tbody><tr>`;
  let day = 1;
  let printed = 0;
  for (let i = 0; i < startDay; i++) {
    html += '<td></td>';
    printed++;
  }
  for (; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const event = calendarEvents.find(ev => ev.date === dateStr);
    let cell = `<td style="text-align:center;padding:8px 0;position:relative;">
      <div style="width:32px;height:32px;line-height:32px;margin:0 auto;border-radius:50%;${event ? `background:#eef2ff;` : ''}position:relative;">
        <span style="font-weight:600;font-size:1rem;${event ? 'color:#10b981;' : ''}">${day}</span>`;
    if (event) {
      if (event.label) {
        cell += `<span style="position:absolute;top:2px;right:2px;background:${event.color};color:#fff;border-radius:50%;font-size:0.85rem;padding:2px 6px;">${event.label}</span>`;
      } else {
        cell += `<span style="position:absolute;bottom:2px;right:2px;width:8px;height:8px;background:${event.color};border-radius:50%;display:inline-block;"></span>`;
      }
    }
    cell += '</div></td>';
    html += cell;
    printed++;
    if (printed % 7 === 0 && day !== daysInMonth) html += '</tr><tr>';
  }
  for (; printed % 7 !== 0; printed++) html += '<td></td>';
  html += '</tr></tbody></table></div></div>';
  document.getElementById(containerId).innerHTML = html;
  var addEventBtn = document.getElementById('addEventBtn');
  if (addEventBtn) {
    addEventBtn.onclick = function() {
      window.location.href = 'add-event.html';
    };
  }
}
