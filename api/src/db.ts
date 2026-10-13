// The SQLite database with the bookings, in `api/data/hotel.sqlite`. It is created on the first start.
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

/** A row of the `bookings` table */
export interface BookingRow {
    id: number;
    room_id: string;
    guest_name: string;
    guests: number;
    check_in: string;
    check_out: string;
    created_at: string;
}

const dataDir = new URL("../data/", import.meta.url);
mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(fileURLToPath(new URL("hotel.sqlite", dataDir)));
db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_id TEXT NOT NULL,
        guest_name TEXT NOT NULL,
        guests INTEGER NOT NULL,
        check_in TEXT NOT NULL,
        check_out TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
`);

const statements = {
    // Two stays overlap if each one starts before the other one ends
    countOverlapping: db.prepare("SELECT COUNT(*) AS count FROM bookings WHERE room_id = ? AND check_in < ? AND check_out > ?"),
    insert: db.prepare("INSERT INTO bookings (room_id, guest_name, guests, check_in, check_out) VALUES (?, ?, ?, ?, ?) RETURNING *"),
    // The guest isn't logged in, so the name on the booking is what identifies them
    selectByGuest: db.prepare("SELECT * FROM bookings WHERE lower(guest_name) = lower(?) ORDER BY check_in"),
    selectOverlapping: db.prepare("SELECT * FROM bookings WHERE check_in < ? AND check_out > ? ORDER BY room_id, check_in"),
    deleteByIdAndGuest: db.prepare("DELETE FROM bookings WHERE id = ? AND lower(guest_name) = lower(?)"),
};

export const countOverlappingBookings = (roomId: string, checkIn: string, checkOut: string) =>
    (statements.countOverlapping.get(roomId, checkOut, checkIn) as { count: number }).count;

export const insertBooking = (row: Omit<BookingRow, "id" | "created_at">) =>
    statements.insert.get(row.room_id, row.guest_name, row.guests, row.check_in, row.check_out) as unknown as BookingRow;

export const selectBookingsByGuest = (guestName: string) => statements.selectByGuest.all(guestName) as unknown as BookingRow[];

/** The bookings of all rooms that overlap the period from `from` to `to` (exclusive) */
export const selectOverlappingBookings = (from: string, to: string) =>
    statements.selectOverlapping.all(to, from) as unknown as BookingRow[];

/** Returns whether a booking was deleted */
export const deleteBooking = (id: number, guestName: string) => statements.deleteByIdAndGuest.run(id, guestName).changes > 0;
