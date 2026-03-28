/**
 * Utility to generate calendar invitation links for consultations.
 */

const generateGoogleCalendarLink = (appointment) => {
  const { appointmentDate, duration, doctor, reasonForConsultation, zoomJoinUrl } = appointment;
  const start = new Date(appointmentDate);
  const end = new Date(start.getTime() + (duration || 30) * 60000);

  const fmtDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const title = `Consultation with Dr. ${doctor?.name || 'Veterinarian'}`;
  const details = `Reason: ${reasonForConsultation}\n\nJoin Zoom: ${zoomJoinUrl}`;
  const location = zoomJoinUrl || 'Online Video Link';

  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${fmtDate(start)}/${fmtDate(end)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
};

const generateICSLink = (appointment) => {
  const { appointmentDate, duration, doctor, reasonForConsultation, zoomJoinUrl } = appointment;
  const start = new Date(appointmentDate);
  const end = new Date(start.getTime() + (duration || 30) * 60000);

  const fmtDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${fmtDate(start)}`,
    `DTEND:${fmtDate(end)}`,
    `SUMMARY:Consultation with Dr. ${doctor?.name || 'Veterinarian'}`,
    `DESCRIPTION:Reason: ${reasonForConsultation}\\n\\nJoin Zoom: ${zoomJoinUrl}`,
    `LOCATION:${zoomJoinUrl || 'Online Video Link'}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\n");

  const base64Content = Buffer.from(icsContent).toString('base64');
  return `data:text/calendar;base64,${base64Content}`;
};

module.exports = {
  generateGoogleCalendarLink,
  generateICSLink
};
