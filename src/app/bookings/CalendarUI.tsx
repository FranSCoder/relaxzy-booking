//TODO
// Insert a little delay after adding a booking so the customer names appear right on on the new bookings

"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Grid, MenuItem } from '@mui/material';
import { Calendar, luxonLocalizer, View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { DateTime, Settings } from "luxon";
import CircularProgress from "@mui/material/CircularProgress";
import { useCalendarData } from "@/hooks/useCalendarData";
import { calendarFormats } from "@/utils/dateHelpers";

Settings.defaultZone = "Europe/Madrid";
const localizer = luxonLocalizer(DateTime, { firstDayOfWeek: 1 });

function CalendarUI() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [editing, setEditing] = useState(false);
  const [localForm, setLocalForm] = useState({ service_name: '', start_time: '', end_time: '', notes: '', status: '' });
  const [view, setView] = useState<View>("week");
  const [date, setDate] = useState(new Date());

  useEffect(() => {
  const handler = () => {
    // Simply change date state to trigger your hook re-run
    setDate(new Date(date)); 
  };

  window.addEventListener("refreshCalendarData", handler);
  return () => window.removeEventListener("refreshCalendarData", handler);
}, [date]);

  const onView = useCallback((v: View) => setView(v), []);
  const onNavigate = useCallback((d: Date) => setDate(d), []);

  const { bookings, loading, fetchError } = useCalendarData(date, view);

  const { min, max } = useMemo(() => {
    const start = DateTime.now().startOf("day").set({ hour: 10 });
    const end = DateTime.now().startOf("day").set({ hour: 22 });
    return { min: start.toJSDate(), max: end.toJSDate() };
  }, []);

  const events = bookings.map((b) => ({
    title: `${b.client_name} - ${b.short_service_name}`,
    start: new Date(b.start_time),
    end: new Date(b.end_time),
    booking: b,
    id: b.id,
  }));

  const dayPropGetter = (date: Date) => {
    const today = DateTime.now().startOf("day").toISODate();
    const current = DateTime.fromJSDate(date).startOf("day").toISODate();
    return today === current ? { style: { backgroundColor: "rgba(212, 228, 209, 1)" } } : {};
  };

  return (
    <div className="h-fit relative">
      <div style={{ opacity: loading ? 0.5 : 1, transition: "opacity 0.3s" }}>
        <Calendar
          localizer={localizer}
          defaultView="week"
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          min={min}
          max={max}
          dayPropGetter={dayPropGetter}
          eventPropGetter={() => ({
            style: {
              backgroundColor: "rgba(4, 62, 0, 1)",
              color: "white",
              borderRadius: "8px",
              border: "1.5px solid #6FBF73",
              padding: "4px",
            },
          })}
          view={view}
          onSelectEvent={(event) => {
            // event.booking contains full booking DTO
            // open dialog with booking details
            const b = (event as any).booking;
            setSelectedBooking(b);
            setEditing(false);
            setDialogOpen(true);
            // initialize local form
            setLocalForm({
              service_name: b.service_name || '',
              start_time: new Date(b.start_time).toISOString(),
              end_time: new Date(b.end_time).toISOString(),
              notes: b.notes || '',
              status: b.status || '',
            });
          }}
          onView={onView}
          onNavigate={onNavigate}
          date={date}
          formats={calendarFormats}
        />
      </div>

      {loading && (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
          <CircularProgress />
        </div>
      )}

      {fetchError && <div>Error loading bookings: {fetchError}</div>}
      {/* Booking details dialog */}
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setEditing(false); }} fullWidth maxWidth="md">
        <DialogTitle>Booking details</DialogTitle>
        <DialogContent>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <TextField label="Client" value={selectedBooking?.client_name ?? ''} fullWidth disabled />
            </div>
            <div>
              <TextField label="Surname" value={selectedBooking?.client_surname ?? ''} fullWidth disabled />
            </div>
            <div>
              <TextField label="Phone" value={selectedBooking?.client_phone ?? ''} fullWidth disabled />
            </div>
            <div>
              <TextField label="Email" value={selectedBooking?.client_email ?? ''} fullWidth disabled />
            </div>
            <div>
              <TextField
                label="Service"
                value={localForm.service_name}
                fullWidth
                disabled={!editing}
                onChange={(e) => setLocalForm((p) => ({ ...p, service_name: e.target.value }))}
              />
            </div>
            <div>
              <TextField
                label="Status"
                value={localForm.status}
                fullWidth
                disabled={!editing}
                select
                onChange={(e) => setLocalForm((p) => ({ ...p, status: e.target.value }))}
              >
                <MenuItem value="confirmed">confirmed</MenuItem>
                <MenuItem value="cancelled">cancelled</MenuItem>
                <MenuItem value="pending">pending</MenuItem>
              </TextField>
            </div>
            <div>
              <TextField
                label="Start Time"
                value={localForm.start_time}
                fullWidth
                disabled={!editing}
                onChange={(e) => setLocalForm((p) => ({ ...p, start_time: e.target.value }))}
              />
            </div>
            <div>
              <TextField
                label="End Time"
                value={localForm.end_time}
                fullWidth
                disabled={!editing}
                onChange={(e) => setLocalForm((p) => ({ ...p, end_time: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <TextField
                label="Notes"
                value={localForm.notes}
                fullWidth
                disabled={!editing}
                multiline
                rows={3}
                onChange={(e) => setLocalForm((p) => ({ ...p, notes: e.target.value }))}
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          {!editing ? (
            <Button onClick={() => setEditing(true)} color="primary">Edit</Button>
          ) : (
            <>
              <Button onClick={() => {
                // cancel edits: restore from selectedBooking
                if (selectedBooking) {
                  setLocalForm({
                    service_name: selectedBooking.service_name || '',
                    start_time: new Date(selectedBooking.start_time).toISOString(),
                    end_time: new Date(selectedBooking.end_time).toISOString(),
                    notes: selectedBooking.notes || '',
                    status: selectedBooking.status || '',
                  });
                }
                setEditing(false);
              }} color="inherit">Cancel</Button>
              <Button onClick={async () => {
                if (!selectedBooking) return;
                try {
                  const res = await fetch('/api/bookings/update', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: selectedBooking.id, ...localForm }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data?.error || 'Update failed');
                  // refresh calendar data
                  window.dispatchEvent(new Event('refreshCalendarData'));
                  setEditing(false);
                  setDialogOpen(false);
                } catch (err) {
                  console.error('Update failed', err);
                  alert('Failed to save booking');
                }
              }} variant="contained" color="primary">Save</Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default React.memo(CalendarUI);
