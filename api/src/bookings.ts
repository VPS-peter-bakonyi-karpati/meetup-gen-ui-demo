// Booking logic of the hotel: availability, booking and cancelling. Errors are thrown with a message for the guest.
import {
    countOverlappingBookings,
    deleteBooking,
    insertBooking,
    selectBookingsByGuest,
    selectOverlappingBookings,
    type BookingRow,
} from "./db.ts";
import { findRoom, rooms } from "./rooms.ts";

export interface Booking {
    id: number;
    roomId: string;
    roomName: string;
    guestName: string;
    guests: number;
    checkIn: string;
    checkOut: string;
    nights: number;
    totalPrice: number;
    createdAt: string;
}

interface Stay {
    checkIn: string;
    checkOut: string;
    guests: number;
}

const nightsBetween = (checkIn: string, checkOut: string) =>
    Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86_400_000);

function validateStay(checkIn: string, checkOut: string) {
    if (Number.isNaN(Date.parse(checkIn)) || Number.isNaN(Date.parse(checkOut))) {
        throw new Error("Dates must be in the format YYYY-MM-DD.");
    }
    if (nightsBetween(checkIn, checkOut) < 1) {
        throw new Error("The check-out date must be after the check-in date.");
    }
}

const isAvailable = (roomId: string, checkIn: string, checkOut: string) => countOverlappingBookings(roomId, checkIn, checkOut) === 0;

function toBooking(row: BookingRow): Booking {
    const room = findRoom(row.room_id)!;
    const nights = nightsBetween(row.check_in, row.check_out);
    return {
        id: row.id,
        roomId: room.id,
        roomName: room.name,
        guestName: row.guest_name,
        guests: row.guests,
        checkIn: row.check_in,
        checkOut: row.check_out,
        nights,
        totalPrice: nights * room.pricePerNight,
        createdAt: row.created_at,
    };
}

/** The rooms that fit the guests and are free for the whole stay, with the price of the stay */
export function searchRooms({ checkIn, checkOut, guests }: Stay) {
    validateStay(checkIn, checkOut);
    const nights = nightsBetween(checkIn, checkOut);
    return rooms
        .filter((room) => room.maxGuests >= guests && isAvailable(room.id, checkIn, checkOut))
        .map((room) => ({ ...room, nights, totalPrice: nights * room.pricePerNight }));
}

/** A booked stay of a room, without the guest, so everyone can see when the rooms are taken */
export interface Occupancy {
    roomId: string;
    checkIn: string;
    checkOut: string;
}

// A year is enough for the calendar and keeps the answer small
const maxOccupancyDays = 366;

/** The booked stays of all rooms that overlap the period from `from` to `to` (exclusive) */
export function listOccupancy({ from, to }: { from: string; to: string }): Occupancy[] {
    if (Number.isNaN(Date.parse(from)) || Number.isNaN(Date.parse(to))) {
        throw new Error("Dates must be in the format YYYY-MM-DD.");
    }
    const days = nightsBetween(from, to);
    if (days < 1 || days > maxOccupancyDays) {
        throw new Error(`The period must be between 1 and ${maxOccupancyDays} days long.`);
    }
    return selectOverlappingBookings(from, to).map((row) => ({ roomId: row.room_id, checkIn: row.check_in, checkOut: row.check_out }));
}

export function createBooking({ roomId, guestName, guests, checkIn, checkOut }: Stay & { roomId: string; guestName: string }) {
    validateStay(checkIn, checkOut);
    if (!guestName.trim()) {
        throw new Error("Please enter the name of the guest.");
    }
    const room = findRoom(roomId);
    if (!room) {
        throw new Error(`Room ${roomId} does not exist.`);
    }
    if (guests > room.maxGuests) {
        throw new Error(`${room.name} fits at most ${room.maxGuests} guests.`);
    }
    if (!isAvailable(room.id, checkIn, checkOut)) {
        throw new Error(`${room.name} is not available for these dates.`);
    }
    return toBooking(insertBooking({ room_id: room.id, guest_name: guestName.trim(), guests, check_in: checkIn, check_out: checkOut }));
}

export const listBookings = (guestName: string) => selectBookingsByGuest(guestName.trim()).map(toBooking);

export function cancelBooking(id: number, guestName: string) {
    if (!deleteBooking(id, guestName.trim())) {
        throw new Error(`There is no booking #${id} for ${guestName}.`);
    }
    return { cancelled: id };
}
